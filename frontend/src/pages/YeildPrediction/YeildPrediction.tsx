import React, { useState, useEffect } from 'react';
import { useIonRouter } from '@ionic/react';
import './YeildPrediction.css';
import Footer from '../../components/Footer';

interface Crop {
  id: string;   // ✅ matches backend
  name: string;
  area: string;
  status: 'Good' | 'Fair' | 'Poor' | 'Unknown';
  growthProgress: number;
  predictedYield: string;
  qualityScore: string;
  harvestDate: string;

  detailedAnalysis?: {
    soilHealth: number;
    waterStatus: number;
    pestRisk: string;
    weatherImpact: string;
    recommendations: string[];
    nutrients: {
      nitrogen: number;
      phosphorus: number;
      potassium: number;
    };
  };
}

const YieldDashboard: React.FC = () => {

  const router = useIonRouter();

  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [showAnalysis, setShowAnalysis] = useState(false);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("token");

  let userId: string | null = null;

  if (token) {
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      userId = payload.id || payload._id || payload.userId;
    } catch (error) {
      console.error("Error decoding token:", error);
    }
  }

  /* =========================
        FETCH CROPS FROM API
     ========================= */

  useEffect(() => {

    if (!userId || !token) {
      console.log("User ID or token missing");
      setLoading(false);
      return;
    }

    const fetchYieldData = async () => {

      try {

        const res = await fetch(
          `http://localhost:5000/api/yield-prediction/${userId}`,
          {
            method: "GET",
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json"
            }
          }
        );

        if (!res.ok) {
          throw new Error(`Server error: ${res.status}`);
        }

        const data = await res.json();

        console.log("API Response:", data);

        setCrops(data.crops || []);

      } catch (error) {

        console.error("Error fetching yield data:", error);

      } finally {

        setLoading(false);

      }

    };

    fetchYieldData();

  }, [userId, token]);

  /* =========================
        SUMMARY CALCULATIONS
     ========================= */

  const totalExpectedYield = crops.reduce((sum, crop) => {

    const yieldValue = parseFloat(crop.predictedYield);

    return sum + (isNaN(yieldValue) ? 0 : yieldValue);

  }, 0);

  const totalArea = crops.reduce((sum, crop) => {

    const areaValue = parseFloat(crop.area);

    return sum + (isNaN(areaValue) ? 0 : areaValue);

  }, 0);

  const activeCropsCount = crops.length;

  /* =========================
        FUNCTIONS
     ========================= */

  const handleBack = () => {
    router.goBack();
  };

  const handleViewAnalysis = (cropId: string) => {

    const crop = crops.find(c => c.id === cropId);

    if (crop) {
      setSelectedCrop(crop);
      setShowAnalysis(true);
    }

  };

  const handleCloseAnalysis = () => {

    setShowAnalysis(false);

    setTimeout(() => setSelectedCrop(null), 300);

  };

  const getStatusClass = (status: string) => {

    return status.toLowerCase();

  };

  /* =========================
        UI
     ========================= */

  return (

    <div className="yield-monitoring">

      {/* Header */}

      <header className="yield-header">

        <button className="back-button" onClick={handleBack}>
          ‹
        </button>

        <h1>Yield Prediction & Monitoring</h1>

      </header>

      <main className="yield-content">

        {/* Loading */}

        {loading ? (

          <p>Loading yield predictions...</p>

        ) : (

          <>

            {/* Summary */}

            <div className="summary-cards">

              <div className="summary-card">

                <div className="summary-card-header">

                  <span className="summary-card-icon">📈</span>

                  <span className="summary-card-label">
                    Total Expected
                  </span>

                </div>

                <div className="summary-card-value">

                  {totalExpectedYield.toFixed(1)} tons

                </div>

                <div className="summary-card-subtitle">

                  Based on current crop data

                </div>

              </div>

              <div className="summary-card">

                <div className="summary-card-header">

                  <span className="summary-card-icon">📍</span>

                  <span className="summary-card-label">
                    Total Area
                  </span>

                </div>

                <div className="summary-card-value">

                  {totalArea.toFixed(1)} acres

                </div>

                <div className="summary-card-detail">

                  {activeCropsCount} crops active

                </div>

              </div>

            </div>

            {/* Crop List */}

            <h2 className="section-title">

              Your Crops

            </h2>

            <div className="crops-list">

              {crops.map((crop) => (

                <div key={crop.id} className="crop-card">

                  <div className="crop-header">

                    <div className="crop-info">

                      <h3 className="crop-title">

                        {crop.name}

                      </h3>

                      <p className="crop-subtitle">

                        {crop.area}

                      </p>

                    </div>

                    <span
                      className={`crop-status-badge ${getStatusClass(crop.status)}`}
                    >

                      {crop.status}

                    </span>

                  </div>

                  {/* Progress */}

                  <div className="growth-progress-section">

                    <div className="progress-label">

                      <span>Growth Progress</span>

                      <span className="progress-percentage">

                        {crop.growthProgress}%

                      </span>

                    </div>

                    <div className="progress-bar-container">

                      <div
                        className="progress-bar-fill"
                        style={{
                          width: `${crop.growthProgress}%`
                        }}
                      />

                    </div>

                  </div>

                  {/* Metrics */}

                  <div className="crop-metrics">

                    <div className="metric-item">

                      <span className="metric-label">
                        Predicted Yield
                      </span>

                      <span className="metric-value">
                        {crop.predictedYield}
                      </span>

                    </div>

                    <div className="metric-item">

                      <span className="metric-label">
                        Quality Score
                      </span>

                      <span className="metric-value">
                        {crop.qualityScore}
                      </span>

                    </div>

                    <div className="metric-item">

                      <span className="metric-label">
                        Harvest Date
                      </span>

                      <span className="metric-value">
                        {crop.harvestDate}
                      </span>

                    </div>

                  </div>

                  <button
                    className="analysis-button"
                    onClick={() => handleViewAnalysis(crop.id)}
                  >

                    View Detailed Analysis

                  </button>

                </div>

              ))}

            </div>

            {/* Empty State */}

            {crops.length === 0 && (

              <div className="empty-state">

                <div className="empty-state-icon">
                  🌾
                </div>

                <div className="empty-state-title">

                  No crops yet

                </div>

                <div className="empty-state-text">

                  Add your first crop to start monitoring yield predictions

                </div>

              </div>

            )}

          </>

        )}

        <div style={{ height: '100px' }}></div>

      </main>

      <Footer />

    </div>

  );

};

export default YieldDashboard;