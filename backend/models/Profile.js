const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  name: String,
  phone: String,
  state: String,
  district: String,
  farmArea: String,
  crops: [String],
  languagePreference: {
    type: String,
    default: "English"
  },
  profileCompleted: {
    type: Boolean,
    default: false
  }
});

module.exports = mongoose.model("Profile", profileSchema);