const marketService = require("../services/marketService");
const Profile = require("../models/Profile");

exports.getMarketData = async (req, res) => {

  try {

    const crop = req.query.crop;

    const records = await marketService.getMarketPrices(crop);

    if (!records.length) {
      return res.json({ message: "No data found" });
    }

    const prices = records
    .map(r => parseFloat(r.modal_price))
    .filter(p => !isNaN(p));

    if (prices.length === 0) {
    return res.json({
        crop,
        message: "No valid price data available"
    });
    }

    const avgPrice =
    prices.reduce((a, b) => a + b, 0) / prices.length;

    const maxPrice = Math.max(...prices);
    const minPrice = Math.min(...prices);

    const priceChange =
    ((avgPrice - minPrice) / minPrice) * 100;

    const profile = await Profile.findOne({ user: req.user.id });

    const userDistrict = profile?.district;
    const userState = profile?.state;

    let filteredRecords = [];

    // 1️⃣ Try district + state
    if (userDistrict && userState) {
      filteredRecords = records.filter(
        r =>
          r.district?.toLowerCase() === userDistrict.toLowerCase() &&
          r.state?.toLowerCase() === userState.toLowerCase()
      );
    }

    // 2️⃣ If none found → try state
    if (filteredRecords.length === 0 && userState) {
      filteredRecords = records.filter(
        r => r.state?.toLowerCase() === userState.toLowerCase()
      );
    }

    // 3️⃣ If still none → fallback to all records
    if (filteredRecords.length === 0) {
      filteredRecords = records;
    }

    // Return first 5
    const mandis = filteredRecords.slice(0, 5).map(r => ({
      name: r.market,
      district: r.district,
      state: r.state,
      price: parseFloat(r.modal_price) || 0
    }));


    const months = ["Sep","Oct","Nov","Dec","Jan"];

    const trend = prices.slice(0,5).map((p,i)=>({
    month: months[i] || `M${i+1}`,
    price: p || 0
    }));

    const productionCost = getProductionCost(crop);

    const profitPerQuintal = avgPrice ? avgPrice - productionCost : 0;

    const quantity = 30;

    const totalCost = productionCost * quantity;

    const revenue = avgPrice * quantity;

    const totalProfit = revenue - totalCost;

    const profitMargin = (totalProfit / totalCost) * 100;

    res.json({

      crop,

      price: Math.round(avgPrice),

      change: Number(priceChange.toFixed(2)),

      priceRange: `₹${minPrice} - ₹${maxPrice}`,

      chartData: trend,

      mandis,

      profitAnalysis: {

        productionCost,

        currentSellingPrice: avgPrice,

        profitPerQuintal,

        estimatedQuantity: quantity,

        totalCost,

        estimatedRevenue: revenue,

        totalProfit,

        profitMargin: profitMargin.toFixed(2)

      }

    });

  } catch (error) {

    console.error(error);

    res.status(500).json({
      message: "Error fetching market data"
    });

  }

};

function getProductionCost(crop) {

  const cost = {

    Wheat: 1850,
    Rice: 2200,
    Cotton: 6200,
    Sugarcane: 245,
    Soybean: 2500,
    Corn: 1500

  };

  return cost[crop] || 2000;

}