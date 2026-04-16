const mongoose = require("mongoose");

const EquipmentSchema = new mongoose.Schema({
  name: String,
  category: String,
  price: String,
  quality: String,
  desc: String,
  location: String,
  seller: String,
  phone: String,
  icon: String,
  sold: {
    type: Boolean,
    default: false
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model("Equipment", EquipmentSchema);