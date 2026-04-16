const axios = require("axios");

const API_KEY = "579b464db66ec23bdd00000150d2f91d096e4b5b6039f07a163dff12";

const cropMap = {
  // 🌾 Cereals
  Rice: "Paddy(Dhan)(Common)",
  Wheat: "Wheat",
  Maize: "Maize",
  Barley: "Barley",
  "Jowar (Sorghum)": "Jowar",
  "Bajra (Pearl Millet)": "Bajra",
  "Ragi (Finger Millet)": "Ragi",

  // 🌱 Pulses
  "Gram (Chana)": "Gram",
  "Tur (Arhar)": "Arhar (Tur/Red Gram)(Whole)",
  Moong: "Moong",
  Urad: "Urad",
  Masoor: "Masoor",

  // 🌿 Cash Crops
  Sugarcane: "Sugarcane",
  Cotton: "Cotton",
  Jute: "Jute",

  // 🌻 Oilseeds
  Groundnut: "Groundnut",
  Mustard: "Mustard",
  Soybean: "Soyabean",
  Sunflower: "Sunflower",
  "Sesame (Til)": "Sesamum",

  // 🍵 Plantation Crops
  Tea: "Tea",
  Coffee: "Coffee",
  Rubber: "Rubber",

  // 🥔 Vegetables
  Potato: "Potato",
  Onion: "Onion",
  Tomato: "Tomato",
  Brinjal: "Brinjal",
  Cabbage: "Cabbage",
  Cauliflower: "Cauliflower",

  // 🍎 Fruits
  Mango: "Mango",
  Banana: "Banana",
  Apple: "Apple",
  Orange: "Orange",
  Grapes: "Grapes",
  Pineapple: "Pineapple",
  Guava: "Guava"
};



exports.cropMap = cropMap;

// ✅ NEW API
exports.getCropList = (req, res) => {
  res.json(Object.keys(cropMap));
};


exports.getMarketPrices = async (crop) => {

  try {

    const commodity = cropMap[crop] || crop;

    const response = await axios.get(
      "https://api.data.gov.in/resource/9ef84268-d588-465a-a308-a864a43d0070",
      {
        params: {
          "api-key": API_KEY,
          format: "json",
          limit: 50,
          "filters[commodity]": commodity
        }
      }
    );

    return response.data.records || [];

  } catch (error) {

    console.error("Market API error:", error.message);

    return [];

  }

};