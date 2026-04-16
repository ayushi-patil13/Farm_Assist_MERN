const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const twilio = require("twilio");

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

exports.sendOTP = async (req, res) => {
  try {
    const { phone } = req.body;

    if (!phone) {
      return res.status(400).json({ message: "Phone is required" });
    }

    // Ensure user exists (but do NOT store OTP)
    let user = await User.findOne({ phone });

    if (!user) {
      user = await User.create({
        name: "Temp",
        phone,
        password: "temp123",
        isVerified: false
      });
    }

    await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verifications.create({
        to: `+91${phone}`,
        channel: "sms"
      });

    res.status(200).json({
      message: "OTP sent successfully",
      userId: user._id
    });

  } catch (error) {
    console.error("Send OTP Error:", error);
    res.status(500).json({ message: "Failed to send OTP" });
  }
};


const Profile = require("../models/Profile");

exports.signup = async (req, res) => {
  try {
    const { name, phone, email, password, state, district } = req.body;

    // ✅ check email exists
    if (!email) {
      return res.status(400).json({
        message: "Email is required"
      });
    }

    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({
        message: "Email already registered"
      });
    }

    // ✅ get user FIRST
    let user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({
        message: "Please request OTP first"
      });
    }

    if (!user.isVerified) {
      return res.status(400).json({
        message: "Please verify OTP first"
      });
    }

    if (user.password && user.name !== "Temp") {
      return res.status(400).json({
        message: "User already exists"
      });
    }

    // ✅ hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // ✅ update user
    user.name = name;
    user.email = email;
    user.password = hashedPassword;

    await user.save();

    // ✅ create profile
    await Profile.create({
      user: user._id,
      name,
      phone,
      state,
      district,
      profileCompleted: false
    });

    res.status(200).json({
      message: "Account created successfully"
    });

  } catch (error) {
    console.error("Signup Error:", error);
    res.status(500).json({
      message: error.message
    });
  }
};

exports.verifyOTP = async (req, res) => {
  try {
    const { userId, otp } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    const verificationCheck = await client.verify.v2
      .services(process.env.TWILIO_VERIFY_SERVICE_SID)
      .verificationChecks.create({
        to: `+91${user.phone}`,
        code: otp
      });

    if (verificationCheck.status !== "approved") {
      return res.status(400).json({ message: "Invalid or expired OTP" });
    }

    user.isVerified = true;
    await user.save();

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({ token });

  } catch (error) {
    console.error("Verify OTP Error:", error);
    res.status(500).json({ message: "OTP verification failed" });
  }
};

// LOGIN
exports.login = async (req, res) => {
  try {
    const { phone, password } = req.body;

    const user = await User.findOne({ phone });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Please verify OTP first" });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const token = jwt.sign(
      { id: user._id },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    
    if (user.mustChangePassword) {
      const token = jwt.sign(
        { id: user._id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
      );

      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name
        },
        redirect: "CHANGE_PASSWORD"   // ✅ IMPORTANT
      });
    }

    // ✅ CHECK PROFILE COMPLETION
    const Profile = require("../models/Profile");

    const profile = await Profile.findOne({ user: user._id });

    if (!profile || !profile.profileCompleted) {
      return res.json({
        token,
        user: {
          _id: user._id,
          name: user.name
        },
        redirect: "PROFILE_SETUP"
      });
    }

    res.json({
      token,
      user: {
        _id: user._id,
        name: user.name
      },
      redirect: "HOME"
    });

  } catch (error) {
    console.error("Login Error:", error);
    res.status(500).json({ message: "Login failed" });
  }
};

const crypto = require("crypto");
const nodemailer = require("nodemailer");

exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    // ✅ Generate random password
    const randomPassword = Math.random().toString(36).slice(-8);

    // ✅ Hash it
    const hashedPassword = await bcrypt.hash(randomPassword, 10);

    // ✅ Update DB
    user.password = hashedPassword;
    // ✅ ADD THIS LINE
    user.mustChangePassword = true;
    await user.save();

    // ✅ Send Email
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD
      }
    });

    await transporter.sendMail({
      to: user.email,
      subject: "Your New Password - FarmAssist",
      html: `
        <h3>Password Reset Successful</h3>
        <p>Your new temporary password is:</p>
        <h2>${randomPassword}</h2>
        <p>Please login and change your password immediately.</p>
      `
    });

    res.json({ message: "New password sent to your email" });

  } catch (error) {
    console.error("Forgot Password Error:", error);
    res.status(500).json({ message: "Error resetting password" });
  }
};

exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({ message: "Password reset successful" });

  } catch (error) {
    res.status(500).json({ message: "Reset failed" });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const userId = req.user.id;
    const { newPassword } = req.body;

    const user = await User.findById(userId);

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    user.password = hashedPassword;

    // ✅ IMPORTANT
    user.mustChangePassword = false;

    await user.save();

    res.json({ message: "Password changed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Error changing password" });
  }
};