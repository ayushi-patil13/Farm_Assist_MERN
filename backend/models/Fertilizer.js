const mongoose = require("mongoose");

const fertilizerSchema = new mongoose.Schema({
  fertilizer: String,
  type: String,
  dosage: String,
  stage: String,
  timing: String,
  benefits: [String],
  caution: String
});

module.exports = mongoose.model("Fertilizer", fertilizerSchema);