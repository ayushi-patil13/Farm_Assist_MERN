const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    phone: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type: String,
        required: false,
        unique: true   // important for forgot password
    },
    password: {
        type: String,
        required: true
    },
    isVerified: {
        type: Boolean,
        default: false
    },
    mustChangePassword: {
    type: Boolean,
    default: false
    },

    // 🔐 Forgot Password Fields
    resetPasswordToken: String,
    resetPasswordExpires: Date

}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);