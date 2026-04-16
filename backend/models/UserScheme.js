const mongoose = require("mongoose");

const userSchemeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  scheme: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Scheme"
  },
  appliedDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    default: "Applied"
  }
});

module.exports = mongoose.model("UserScheme", userSchemeSchema);