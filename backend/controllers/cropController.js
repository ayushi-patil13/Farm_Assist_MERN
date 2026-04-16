const Crop = require("../models/Crop");
const cropRules = require("../utils/cropRules");
const getCurrentSeason = require("../utils/getSeason");


// ================= ADD CROP =================
// exports.addCrop = async (req, res) => {
//   try {
//     const { cropName, area, unit, plantedDate, expectedHarvest, currentStage } = req.body;

//     const newCrop = new Crop({
//       user: req.user.id,
//       cropName,
//       area,
//       unit,
//       plantedDate,
//       expectedHarvest,
//       currentStage
//     });

//     await newCrop.save();

//     res.status(201).json({
//       message: "Crop added successfully",
//       crop: newCrop
//     });

//   } catch (error) {
//     res.status(500).json({ message: "Server error", error });
//   }
// };


exports.addCrop = async (req, res) => {
  try {
    const {
      cropName,
      area,
      unit,
      plantedDate,
      currentStage,
      soilType,
      temperature,
      nitrogen,
      phosphorus,
      potassium
    } = req.body;

    const currentSeason = getCurrentSeason();
    const crop = cropRules[cropName];

    let warning = null;
    let errors = [];

    // ⚠️ Only validate if crop exists in rules
    if (crop) {
      if (!crop.seasons.includes(currentSeason)) {
        errors.push("Wrong season");
      }

      if (temperature < crop.temp[0] || temperature > crop.temp[1]) {
        errors.push("Temperature not suitable");
      }

      if (!crop.soil.includes(soilType)) {
        errors.push("Soil not suitable");
      }

      if (errors.length > 0) {
        warning = {
          message: `${cropName} may not be suitable`,
          reasons: errors
        };
      }
    }

    // ✅ ALWAYS SAVE (no blocking)
    const newCrop = new Crop({
      user: req.user?.id,
      cropName,
      area,
      unit,
      plantedDate,
      currentStage,
      soilType,
      temperature,

      // ✅ SAVE NPK
      nitrogen,
      phosphorus,
      potassium
    });

    await newCrop.save();

    res.status(201).json({
      message: "Crop added successfully",
      crop: newCrop,
      warning
    });

  } catch (error) {
    console.error("ADD CROP ERROR:", error); // 👈 VERY IMPORTANT
    res.status(500).json({ message: "Server error", error });
  }
};


// ================= GET USER CROPS =================
exports.getUserCrops = async (req, res) => {
  try {
    const crops = await Crop.find({ user: req.user.id });

    res.status(200).json(crops);

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ================= MARK AS COMPLETED =================
exports.completeCrop = async (req, res) => {
  try {
    const crop = await Crop.findById(req.params.id);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    crop.status = "Completed";
    crop.harvestedDate = new Date();

    await crop.save();

    res.status(200).json({ message: "Crop marked as completed" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};


// ================= DELETE CROP =================
exports.deleteCrop = async (req, res) => {
  try {
    await Crop.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Crop deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};

// ================= GET SEASONAL CROPS =================
exports.getSeasonalCrops = (req, res) => {
  try {
    const currentSeason = getCurrentSeason();

    const crops = Object.keys(cropRules).filter(crop =>
      cropRules[crop].seasons.includes(currentSeason)
    );

    res.status(200).json({
      season: currentSeason,
      crops
    });

  } catch (error) {
    res.status(500).json({ message: "Server error", error });
  }
};