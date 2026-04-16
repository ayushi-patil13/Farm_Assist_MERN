const Scheme = require("../models/Scheme");
const UserScheme = require("../models/UserScheme");

exports.getAllSchemes = async (req, res) => {
  try {
    const schemes = await Scheme.find();
    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching schemes" });
  }
};

exports.applyForScheme = async (req, res) => {
  try {
    const userId = req.user.id;
    const { schemeId } = req.body;

    const alreadyApplied = await UserScheme.findOne({
      user: userId,
      scheme: schemeId
    });

    if (alreadyApplied) {
      return res.status(400).json({ message: "Already applied" });
    }

    const application = await UserScheme.create({
      user: userId,
      scheme: schemeId
    });

    res.json({ message: "Application successful", application });
  } catch (err) {
    res.status(500).json({ message: "Error applying for scheme" });
  }
};

exports.getUserSchemes = async (req, res) => {
  try {
    const userId = req.user.id;

    const schemes = await UserScheme.find({ user: userId })
      .populate("scheme");

    res.json(schemes);
  } catch (err) {
    res.status(500).json({ message: "Error fetching user schemes" });
  }
};