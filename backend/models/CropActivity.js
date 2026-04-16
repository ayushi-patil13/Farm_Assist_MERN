const mongoose = require("mongoose");

const cropActivitySchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },

  cropId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Crop"
  },

  activityType: String,

  stage: String,

  scheduledDate: Date,

  completedDate: Date,

  status: {
    type: String,
    default: "pending"
  }

});

module.exports = mongoose.model("CropActivity", cropActivitySchema);