const Profile = require("../models/Profile");
const User = require("../models/User");

exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(userId);
    const user = await User.findById(userId).select("-password");

    const profile = await Profile.findOne({ user: userId });

    res.json({
      user,
      profile
    });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};

exports.saveProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { farmArea, crops, languagePreference } = req.body;

    if (!farmArea) {
      return res.status(400).json({
        message: "Farm area is required"
      });
    }

    let profile = await Profile.findOne({ user: userId });

    if (!profile) {
      return res.status(400).json({
        message: "Profile not found"
      });
    }

    profile.farmArea = farmArea;
    profile.crops = crops || [];
    profile.languagePreference = languagePreference || "English";
    profile.profileCompleted = true;

    await profile.save();

    res.json({ message: "Profile completed successfully" });

  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};