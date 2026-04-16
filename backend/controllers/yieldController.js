const axios = require("axios");
const Crop = require("../models/Crop");
const Profile = require("../models/Profile");

const ML_URL = "http://127.0.0.1:5002";

// ──────────────────────────────────────────────────────────────
// GET /api/yield-prediction/:userId
// Returns yield predictions for ALL active crops of a user.
// ──────────────────────────────────────────────────────────────
exports.getYieldPrediction = async (req, res) => {
  try {
    const userId = req.params.userId;
    const profile = await Profile.findOne({ user: userId });
    const crops = await Crop.find({ user: userId, status: "Active" });

    const cropData = await Promise.all(
      crops.map(async (crop) => {
        try {
          // ── 1. Growth progress ──
          const progress = computeProgress(crop);

          // ── 2. Map soilType → one of the ML's supported soils ──
          const soil = normaliseSoil(crop.soilType);

          // ── 3. Call ML Flask API ──
          const mlRes = await axios.post(`${ML_URL}/predict`, {
            crop:        crop.cropName,
            soil:        soil,
            area:        crop.area,
            temperature: crop.temperature ?? 28,
            nitrogen:    crop.nitrogen   ?? 60,
            phosphorus:  crop.phosphorus ?? 40,
            potassium:   crop.potassium  ?? 40,
            stage:       crop.currentStage ?? "Vegetative",
          });

          const { yield_per_acre, total_yield } = mlRes.data;

          // ── 4. Build response ──
          return buildCropResult(crop, progress, yield_per_acre, total_yield);

        } catch (err) {
          console.error("Yield ML error for", crop.cropName, ":", err.response?.data || err.message);
          return buildFallbackResult(crop);
        }
      })
    );

    return res.json({
      farmArea: profile?.farmArea || 0,
      crops: cropData,
    });

  } catch (error) {
    console.error("Yield controller error:", error.message);
    return res.status(500).json({ message: "Server Error" });
  }
};

// ──────────────────────────────────────────────────────────────
// POST /api/yield-prediction/single
// Body: { crop, soil, area, temperature, nitrogen, phosphorus, potassium, stage }
// Returns yield for a single manual input (useful for the prediction form).
// ──────────────────────────────────────────────────────────────
exports.getSingleYieldPrediction = async (req, res) => {
  try {
    const { crop, soil, area, temperature, nitrogen, phosphorus, potassium, stage } = req.body;

    if (!crop || !soil || !area || !stage) {
      return res.status(400).json({ message: "crop, soil, area, stage are required" });
    }

    const mlRes = await axios.post(`${ML_URL}/predict`, {
      crop, soil,
      area:        Number(area),
      temperature: Number(temperature ?? 28),
      nitrogen:    Number(nitrogen   ?? 60),
      phosphorus:  Number(phosphorus ?? 40),
      potassium:   Number(potassium  ?? 40),
      stage,
    });

    return res.json(mlRes.data);

  } catch (error) {
    console.error("Single yield error:", error.response?.data || error.message);
    return res.status(500).json({
      message: "Prediction failed",
      error: error.response?.data || error.message,
    });
  }
};

// ──────────────────────────────────────────────────────────────
// GET /api/yield-prediction/meta
// Returns supported crops, soils, stages from the ML service.
// ──────────────────────────────────────────────────────────────
exports.getYieldMeta = async (req, res) => {
  try {
    const response = await axios.get(`${ML_URL}/meta`);
    return res.json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Could not fetch ML metadata" });
  }
};


// ──────────────────────────────────────────────
// Helpers
// ──────────────────────────────────────────────
function computeProgress(crop) {
  const now   = new Date();
  const start = new Date(crop.plantedDate);
  const end   = new Date(crop.expectedHarvest);

  if (!isNaN(start) && !isNaN(end) && end > start) {
    if (now <= start) return 0;
    if (now >= end)   return 100;
    return Math.floor(((now - start) / (end - start)) * 100);
  }

  // Fallback from stage
  const stageMap = {
    Sowing: 10, Germination: 25, Vegetative: 50, Flowering: 75, Maturation: 90,
  };
  return stageMap[crop.currentStage] ?? 0;
}

function normaliseSoil(raw = "") {
  const s = raw.toLowerCase();
  if (s.includes("loam"))   return "Loamy";
  if (s.includes("clay"))   return "Clay";
  if (s.includes("sand"))   return "Sandy";
  if (s.includes("silt"))   return "Silty";
  if (s.includes("black"))  return "Black";
  if (s.includes("red"))    return "Red";
  return "Loamy"; // safe default
}

function buildCropResult(crop, progress, yieldPerAcre, totalYield) {
  return {
    id:   crop._id.toString(),
    name: crop.cropName,
    area: `${crop.area} ${crop.unit} • ${crop.currentStage}`,
    status: "Good",
    growthProgress: progress,

    yieldPerAcre: yieldPerAcre,
    predictedYield: `${totalYield} tons`,
    qualityScore: computeQualityScore(crop, progress),

    harvestDate: crop.expectedHarvest
      ? new Date(crop.expectedHarvest).toDateString().slice(4, 10)
      : "N/A",

    detailedAnalysis: {
      soilHealth:    Math.min(100, Math.round(60 + progress * 0.35)),
      waterStatus:   Math.min(100, Math.round(55 + progress * 0.4)),
      pestRisk:      progress > 70 ? "Low" : "Medium",
      weatherImpact: "Stable conditions expected",
      recommendations: buildRecommendations(crop, progress),
      nutrients: {
        nitrogen:   crop.nitrogen   ?? 60,
        phosphorus: crop.phosphorus ?? 40,
        potassium:  crop.potassium  ?? 40,
      },
    },
  };
}

function buildFallbackResult(crop) {
  return {
    id:   crop._id.toString(),
    name: crop.cropName,
    area: `${crop.area} ${crop.unit}`,
    status: "Unknown",
    growthProgress: 0,
    yieldPerAcre: 0,
    predictedYield: "N/A",
    qualityScore: "N/A",
    harvestDate: "N/A",
    detailedAnalysis: {
      soilHealth: 0, waterStatus: 0, pestRisk: "Unknown",
      weatherImpact: "N/A", recommendations: [], nutrients: {},
    },
  };
}

function computeQualityScore(crop, progress) {
  const base = 70;
  const npkBonus = Math.min(15,
    ((crop.nitrogen ?? 50) + (crop.phosphorus ?? 30) + (crop.potassium ?? 30)) / 30
  );
  const progressBonus = Math.floor(progress * 0.15);
  return `${Math.min(100, Math.round(base + npkBonus + progressBonus))}/100`;
}

function buildRecommendations(crop, progress) {
  const tips = ["Monitor soil moisture regularly"];
  if ((crop.nitrogen ?? 60) < 50)   tips.push("Soil Nitrogen is low — consider Urea application");
  if ((crop.phosphorus ?? 40) < 30) tips.push("Soil Phosphorus is low — consider DAP application");
  if ((crop.potassium  ?? 40) < 30) tips.push("Soil Potassium is low — consider MOP application");
  if (progress < 50)  tips.push("Ensure consistent irrigation during early growth");
  if (progress > 60)  tips.push("Watch for pests during flowering and maturation stages");
  tips.push("Schedule soil testing before next season");
  return tips;
}
