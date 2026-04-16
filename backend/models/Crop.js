const mongoose = require("mongoose");

const cropSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    cropName: {
      type: String,
      required: true
    },
    area: {
      type: Number,
      required: true
    },
    unit: {
      type: String,
      enum: ["Acres", "Hectares"],
      default: "Acres"
    },
    plantedDate: {
      type: Date,
      required: true
    },

    // ✅ NEW FIELDS
    soilType: {
      type: String,
      required: true
    },
    temperature: {
      type: Number,
      required: true
    },

    // ✅ ADD THIS (NPK VALUES)
    nitrogen: {
      type: Number,
      required: true
    },
    phosphorus: {
      type: Number,
      required: true
    },
    potassium: {
      type: Number,
      required: true
    },

    currentStage: {
      type: String,
      enum: ["Sowing", "Germination", "Vegetative", "Flowering", "Maturation"],
      default: "Sowing"
    },
    status: {
      type: String,
      enum: ["Active", "Completed"],
      default: "Active"
    },
    harvestedDate: {
      type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Crop", cropSchema);