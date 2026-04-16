import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import './MarketPrice.css';
import Footer from '../../components/Footer';
import API from '../../services/api';

interface ChartData {
  month: string;
  price: number;
}

interface Mandi {
  name: string;
  district?: string;
  price: number;
  distance?: string;
  time?: string;
  isBest?: boolean;
}

interface ProfitAnalysis {
  productionCost: number;
  currentSellingPrice: number;
  profitPerQuintal: number;
  estimatedQuantity: number;
  totalCost: number;
  estimatedRevenue: number;
  totalProfit: number;
  profitMargin: number;
}

interface MarketData {
  crop: string;
  price: number;
  change: number;
  priceRange: string;
  chartData: ChartData[];
  mandis: Mandi[];
  profitAnalysis: ProfitAnalysis;
}

const MarketPrices: React.FC = () => {

  const router = useIonRouter();

  const [selectedCrop, setSelectedCrop] = useState<string>('Wheat');

  const [marketData, setMarketData] = useState<MarketData | null>(null);

  const [loading, setLoading] = useState<boolean>(false);

  const [cropList, setCropList] = useState<string[]>([]);

  useEffect(() => {
    const fetchCropList = async () => {
      try {
        const res = await API.get("/crops"); // your backend endpoint
        setCropList(res.data);
      } catch (error) {
        console.error("Error fetching crop list", error);
      }
    };

    fetchCropList();
  }, []);

  useEffect(() => {
    fetchMarketData(selectedCrop);
  }, [selectedCrop]);

  const fetchMarketData = async (crop: string) => {
  try {
    setLoading(true);

    const token = localStorage.getItem("token");

    const res = await fetch(
      `http://localhost:5000/api/market?crop=${crop}`,
      {
        headers: {
          Authorization: `Bearer ${token}`
        }
      }
    );
    const data = await res.json();

    console.log("API Response:", data); // debug

    if (data.message) {
      setMarketData(null);
      return;
    }

    setMarketData(data);

  } catch (error) {
    console.error("Error fetching market data:", error);
  } finally {
    setLoading(false);
  }
};

  const handleBack = () => {
    router.push('/home', 'back');
  };

  const maxPrice =
    Math.max(...(marketData?.chartData?.map(d => d.price) || [0]));

  const minPrice =
    Math.min(...(marketData?.chartData?.map(d => d.price) || [0]));

  const priceRange = maxPrice - minPrice;

  return (

    <div className='appContainer'>

      <div className='pageWrapper'>

        <header className='marketHeader'>
          <div className='marketHeaderContent'>
            <button className='backButton' onClick={handleBack}>←</button>
            <h1 className='marketTitle'>Market Prices</h1>
          </div>
        </header>

        <main className='mainContent'>

          <div className='contentWrapper'>

            {/* Crop Selection */}

            <div className='cropSelectionSection'>

              <label className='cropLabel'>Select Crop</label>

              <select
                value={selectedCrop}
                onChange={(e) => setSelectedCrop(e.target.value)}
                className='cropSelect'
              >

                {cropList.map((crop) => (
                  <option key={crop} value={crop}>
                    {crop}
                  </option>
                ))}

              </select>

            </div>

            {loading && <p>Loading market data...</p>}

            {!loading && marketData && (

              <>

                {/* Current Price */}

                <div className='currentPriceCard'>

                  <div className='priceCardHeader'>
                    {selectedCrop}
                  </div>

                  <div className='priceCardAmount'>
                    ₹{marketData.price}
                    <span className='priceUnit'> /per quintal</span>
                  </div>

                  <div
                    className={`priceChange ${
                      marketData.change >= 0
                        ? 'positive'
                        : 'negative'
                    }`}
                  >

                    {marketData.change >= 0 ? '↗' : '↘'}

                    ({marketData.change}%)

                  </div>

                  <div className='priceCardIcon'>💡</div>

                </div>

                {/* Price Trend */}

                <div className='chartSection'>

                  <h2 className='sectionTitle'>
                    Price Trend (Last 5 Months)
                  </h2>

                  <div className='chartContainer'>

                    <div className='chart'>

                      {marketData.chartData.map((data, index) => {

                        const height =
                          ((data.price - minPrice) /
                            priceRange) *
                            100 || 50;

                        return (

                          <div key={index} className='chartBar'>

                            <div
                              className='barFill'
                              style={{
                                height: `${Math.max(height, 20)}%`
                              }}
                            >

                              <span className='barValue'>
                                ₹{data.price}
                              </span>

                            </div>

                            <div className='barLabel'>
                              {data.month}
                            </div>

                          </div>

                        );

                      })}

                    </div>

                    <div className='priceRangeInfo'>
                      Price Range: {marketData.priceRange}
                    </div>

                  </div>

                </div>

                {/* Nearby Mandis */}

                <div className='mandiSection'>

                  <h2 className='sectionTitle'>
                    📍 Nearby Mandis - {selectedCrop}
                  </h2>

                  <div className='mandiList'>

                    {marketData.mandis.map((mandi, index) => (

                      <div key={index} className='mandiCard'>

                        <div className='mandiInfo'>

                          <div className='mandiName'>
                            {mandi.name}
                          </div>

                          <div className='mandiDetails'>
                            {mandi.district || ''}
                          </div>

                        </div>

                        <div className='mandiPriceSection'>

                          <div className='mandiPrice'>
                            ₹{mandi.price}
                          </div>

                        </div>

                      </div>

                    ))}

                  </div>

                </div>

                {/* Profit Analysis */}

                <div className='profitSection'>

                  <h2 className='sectionTitle'>
                    💰 Profit Analysis - {selectedCrop}
                  </h2>

                  <div className='profitCard'>

                    <div className='profitRow'>
                      <span className='profitLabel'>
                        Production Cost
                      </span>
                      <span className='profitValue'>
                        ₹{marketData.profitAnalysis.productionCost}/quintal
                      </span>
                    </div>

                    <div className='profitRow'>
                      <span className='profitLabel'>
                        Current Selling Price
                      </span>
                      <span className='profitValue'>
                        ₹{marketData.profitAnalysis.currentSellingPrice}/quintal
                      </span>
                    </div>

                    <div className='profitHighlight'>
                      <span className='profitLabel'>
                        Profit per Quintal
                      </span>
                      <span className='profitAmount'>
                        ₹{marketData.profitAnalysis.profitPerQuintal}
                      </span>
                    </div>

                    <div className='estimationSection'>

                      <div className='estimationTitle'>
                        Estimated for {marketData.profitAnalysis.estimatedQuantity} quintals
                      </div>

                      <div className='profitRow'>
                        <span className='profitLabel'>Total Cost</span>
                        <span className='profitValue'>
                          ₹{marketData.profitAnalysis.totalCost.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className='profitRow'>
                        <span className='profitLabel'>Estimated Revenue</span>
                        <span className='profitValue'>
                          ₹{marketData.profitAnalysis.estimatedRevenue.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className='totalProfitRow'>
                        <span className='profitLabel'>Total Profit</span>
                        <span className='totalProfitValue'>
                          ₹{marketData.profitAnalysis.totalProfit.toLocaleString() || 0}
                        </span>
                      </div>

                      <div className='profitRow'>
                        <span className='profitLabel'>Profit Margin</span>
                        <span className='profitValue'>
                          {marketData.profitAnalysis.profitMargin}%
                        </span>
                      </div>

                    </div>

                  </div>

                </div>

              </>

            )}

          </div>

        </main>

        <Footer />

      </div>

    </div>

  );

};

export default MarketPrices;