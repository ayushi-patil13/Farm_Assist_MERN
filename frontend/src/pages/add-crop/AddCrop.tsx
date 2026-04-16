import React, { useState, useEffect } from 'react';
import Footer from '../../components/Footer';
import API from "../../services/api";
import './AddCrop.css';

interface Crop {
  _id: string;
  cropName: string;
  area: number;
  unit: string;
  currentStage: string;
  plantedDate: string;
  harvestedDate?: string;
  status: string;
}

const MyCropsScreen: React.FC = () => {

  const [showForm, setShowForm] = useState(true);
  const [crops, setCrops] = useState<Crop[]>([]);

  const [currentSeason, setCurrentSeason] = useState("");
  const [seasonalCrops, setSeasonalCrops] = useState<string[]>([]);
  const getTodayDate = () => {
  const today = new Date();
    return today.toISOString().split("T")[0];
  };

  const [formData, setFormData] = useState({
    cropName: '',
    customCropName: '',
    area: '',
    unit: 'Acres',
    plantedDate: getTodayDate(), // ✅ DEFAULT TODAY
    currentStage: 'Sowing',
    soilType: 'Loamy',
    temperature: '',

    // ✅ NEW NPK
    nitrogen: '',
    phosphorus: '',
    potassium: ''
  });

  // ================= FETCH CROPS + SEASON =================
  useEffect(() => {
    fetchCrops();
    fetchSeasonalCrops();
    fetchTemperature(); 
  }, []);

  const fetchCrops = async () => {
    try {
      const res = await API.get<Crop[]>("/crops/my");
      setCrops(res.data);
    } catch (error) {
      console.error("Error fetching crops", error);
    }
  };

  const fetchSeasonalCrops = async () => {
    try {
      const res = await API.get("/crops/seasonal");
      setCurrentSeason(res.data.season);
      setSeasonalCrops(res.data.crops);
    } catch (error) {
      console.error("Error fetching seasonal crops", error);
    }
  };

  // ================= HANDLE INPUT =================
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  // ================= ADD CROP =================
  const handleSubmit = async () => {
    try {

      let finalCropName = formData.cropName;

      // 👉 If OTHER crop
      if (formData.cropName === "Other") {
        if (!formData.customCropName) {
          alert("Please enter crop name");
          return;
        }

        finalCropName = formData.customCropName;

        // ⚠️ Soft validation
        if (!seasonalCrops.includes(finalCropName)) {
          alert(`${finalCropName} may not be suitable in ${currentSeason} season`);
        }
      }

      if (
        !finalCropName ||
        !formData.area ||
        !formData.plantedDate ||
        !formData.temperature ||
        !formData.nitrogen ||
        !formData.phosphorus ||
        !formData.potassium
      ) {        
        alert("Please fill all required fields");
        return;
      }

      await API.post("/crops/add", {
        ...formData,
        cropName: finalCropName,
        area: Number(formData.area), 
        temperature: Number(formData.temperature),

        // ✅ SEND NPK
        nitrogen: Number(formData.nitrogen),
        phosphorus: Number(formData.phosphorus),
        potassium: Number(formData.potassium)
      });

      fetchCrops();

      setFormData({
        cropName: '',
        customCropName: '',
        area: '',
        unit: 'Acres',
        plantedDate: getTodayDate(), // ✅ again set today
        currentStage: 'Sowing',
        soilType: 'Loamy',
        temperature: '',

        nitrogen: '',
        phosphorus: '',
        potassium: ''
      });

      setShowForm(false);

    } catch (error: any) {
      console.error("Error adding crop", error);

      if (error.response) {
        alert(
          error.response.data.message +
          "\nSuggestions: " +
          (error.response.data.suggestions?.join(", ") || "None")
        );
      }
    }
  };

  // ================= MARK AS COMPLETED =================
  const handleComplete = async (id: string) => {
    try {
      await API.put(`/crops/complete/${id}`);
      fetchCrops();
    } catch (error) {
      console.error("Error completing crop", error);
    }
  };

  // ================= DELETE CROP =================
  const handleDelete = async (id: string) => {
    try {
      await API.delete(`/crops/delete/${id}`);
      fetchCrops();
    } catch (error) {
      console.error("Error deleting crop", error);
    }
  };

  // ================= FILTER CROPS =================
  const activeCrops = crops.filter(crop => crop.status === "Active");
  const completedCrops = crops.filter(crop => crop.status === "Completed");


  const fetchTemperature = () => {
    if (!navigator.geolocation) {
      console.error("Geolocation not supported");
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        try {
          const { latitude, longitude } = position.coords;

          const res = await API.get("/weather", {
            params: { latitude, longitude }
          });

          const temp = res.data.current.temperature;

          setFormData(prev => ({
            ...prev,
            temperature: temp.toString()
          }));

        } catch (error) {
          console.error("Error fetching temperature", error);
        }
      },
      (error) => {
        console.error("Error getting location", error);
      }
    );
  };

  return (
    <div className="container">

      {/* Header */}
      <header className="header">
        <h1 className="headerTitle">My Crops</h1>

        {/* 🌦️ CURRENT SEASON */}
        <div className="totalCrops">
          <div className="totalLabel">Current Season</div>
          <div className="totalValue">{currentSeason}</div>
        </div>

        <div className="totalCrops">
          <div className="totalLabel">Total Crops</div>
          <div className="totalValue">{crops.length}</div>
        </div>
      </header>

      <main className="content">

        <button
          className="toggleButton"
          onClick={() => setShowForm(!showForm)}
        >
          {showForm ? '▲ Hide Form' : '▼ Show Form'}
        </button>

        {/* ================= ADD FORM ================= */}
        {showForm && (
          <div className="form">
            <h3 className="formTitle">Add New Crop</h3>

            <div className="formGroup">
              <label className="label">Crop Name *</label>
              <select
                className="select"
                name="cropName"
                value={formData.cropName}
                onChange={handleInputChange}
              >
                <option value="">Select crop</option>

                {/* ✅ FROM BACKEND */}
                {seasonalCrops.map((crop) => (
                  <option key={crop} value={crop}>{crop}</option>
                ))}

              </select>
            </div>

            {/* REST SAME */}

            <div className="formRow">
              <div className="formGroup">
                <label className="label">Area *</label>
                <input
                  type="number"
                  className="input"
                  name="area"
                  value={formData.area}
                  onChange={handleInputChange}
                />
              </div>

              <div className="formGroup">
                <select
                  className="select"
                  name="unit"
                  value={formData.unit}
                  onChange={handleInputChange}
                >
                  <option value="Acres">Acres</option>
                  <option value="Hectares">Hectares</option>
                </select>
              </div>
            </div>

            <div className="formGroup">
              <label className="label">Planted Date *</label>
              <input
                type="date"
                className="input"
                name="plantedDate"
                value={formData.plantedDate}
                onChange={handleInputChange}
              />
            </div>

            <div className="formGroup">
              <label className="label">Soil Type *</label>
              <select
                className="select"
                name="soilType"
                value={formData.soilType}
                onChange={handleInputChange}
              >
                <option value="Loamy">Loamy</option>
                <option value="Clay">Clay</option>
                <option value="Sandy">Sandy</option>
                <option value="Black">Black</option>
                <option value="Alluvial">Alluvial</option>
              </select>
            </div>

            <div className="formGroup">
              <label className="label">Temperature (°C) *</label>
              <input
                type="number"
                className="input"
                name="temperature"
                value={formData.temperature}
                readOnly
              />
            </div>

            <div className="formGroup">
              <label className="label">Nitrogen (N) *</label>
              <input
                type="number"
                className="input"
                name="nitrogen"
                value={formData.nitrogen}
                onChange={handleInputChange}
              />
              <small className="inputHint">
                Enter values in kg/ha (e.g., Nitrogen: 80)
              </small>
            </div>

            <div className="formGroup">
              <label className="label">Phosphorus (P) *</label>
              <input
                type="number"
                className="input"
                name="phosphorus"
                value={formData.phosphorus}
                onChange={handleInputChange}
              />
              <small className="inputHint">
                Enter values in kg/ha (e.g., Phosphorus: 40)
              </small>
            </div>

            <div className="formGroup">
              <label className="label">Potassium (K) *</label>
              <input
                type="number"
                className="input"
                name="potassium"
                value={formData.potassium}
                onChange={handleInputChange}
              />
              <small className="inputHint">
                Enter values in kg/ha (e.g., Potassium: 150)
              </small>
            </div>

            <div className="formGroup">
              <label className="label">Current Stage</label>
              <select
                className="select"
                name="currentStage"
                value={formData.currentStage}
                onChange={handleInputChange}
              >
                <option value="Sowing">Sowing</option>
                <option value="Germination">Germination</option>
                <option value="Vegetative">Vegetative</option>
                <option value="Flowering">Flowering</option>
                <option value="Maturation">Maturation</option>
              </select>
            </div>

            <button onClick={handleSubmit} className="saveButton">
              Save Crop
            </button>
          </div>
        )}


{/* ================= ACTIVE CROPS ================= */}
        <div className="section">
          <h3 className="sectionTitle">Active Crops ({activeCrops.length})</h3>

          {activeCrops.map(crop => (
            <div key={crop._id} className="cropCard">
              <div className="cropHeader">
                <div>
                  <h4 className="cropName">{crop.cropName}</h4>
                  <p className="cropVariety">
                    {crop.area} {crop.unit}
                  </p>
                </div>

                <div className="cropActions">
                  <button
                    className="iconButton"
                    onClick={() => handleComplete(crop._id)}
                  >
                    ✓
                  </button>

                  <button
                    className="iconButtonDelete"
                    onClick={() => handleDelete(crop._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="cropDates">
                <div>
                  <div className="dateLabel">Planted</div>
                  <div className="dateValue">
                    {new Date(crop.plantedDate).toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* ================= COMPLETED CROPS ================= */}
        <div className="section">
          <h3 className="sectionTitle">Completed ({completedCrops.length})</h3>

          {completedCrops.map(crop => (
            <div key={crop._id} className="cropCard">
              <div className="cropHeader">
                <div>
                  <h4 className="cropName">
                    {crop.cropName} ✓
                  </h4>
                  <p className="cropVariety">
                    {crop.area} {crop.unit}
                  </p>
                </div>

                <div className="cropActions">
                  <button
                    className="iconButtonDelete"
                    onClick={() => handleDelete(crop._id)}
                  >
                    🗑
                  </button>
                </div>
              </div>

              <div className="cropDates">
                <div>
                  <div className="dateLabel">Planted</div>
                  <div className="dateValue">
                    {new Date(crop.plantedDate).toLocaleDateString()}
                  </div>
                </div>

                <div>
                  <div className="dateLabel">Harvested</div>
                  <div className="dateValue">
                    {crop.harvestedDate
                      ? new Date(crop.harvestedDate).toLocaleDateString()
                      : "-"
                    }
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

      </main>

      <Footer />
    </div>
  );
};

export default MyCropsScreen;
