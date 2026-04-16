const Profile = require("../models/Profile");

module.exports = async (req, res, next) => {
  const profile = await Profile.findOne({ user: req.user.id });

  if (!profile || !profile.profileCompleted) {
    return res.status(403).json({
      message: "Complete profile first"
    });
  }

  next();
};