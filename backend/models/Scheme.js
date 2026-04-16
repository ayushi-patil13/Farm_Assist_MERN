const mongoose = require("mongoose");

const schemeSchema = new mongoose.Schema({
  name: String,
  fullName: String,
  description: String,
  amount: String,
  badge: String,
  badgeColor: String,
  eligibility: [String],
  benefits: [String],
  timing: String,
  applyButton: Boolean,
  icon: String,
  iconColor: String,
  category: String,
  type: String,
  applyLink: String
});

module.exports = mongoose.model("Scheme", schemeSchema);