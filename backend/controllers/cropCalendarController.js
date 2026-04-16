const CropCalendar = require("../models/CropCalendar");
const CropActivity = require("../models/CropActivity");
const Crop = require("../models/Crop");

// ================= GET IDEAL CROP CALENDAR =================

exports.getCropCalendar = async (req, res) => {
  try {

    const cropName = req.params.cropName;

    const calendar = await CropCalendar.findOne({
      cropName: { $regex: new RegExp("^" + cropName + "$", "i") }
    });

    if (!calendar) {
      return res.status(404).json({ message: "Crop calendar not found" });
    }

    res.json(calendar);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }
};


// ================= GENERATE SCHEDULE =================

exports.generateSchedule = async (req, res) => {

  try {

    const cropId = req.params.cropId;

    const crop = await Crop.findById(cropId);

    if (!crop) {
      return res.status(404).json({ message: "Crop not found" });
    }

    const calendar = await CropCalendar.findOne({
      cropName: { $regex: new RegExp("^" + crop.cropName + "$", "i") }
    });

    if (!calendar) {
      return res.status(404).json({ message: "Crop calendar not found" });
    }

    const sowingDate = req.body.sowingDate
      ? new Date(req.body.sowingDate)
      : new Date(crop.plantedDate);
        const activities = [];

    // Fertilizer Schedule
    calendar.fertilizerSchedule.forEach(stage => {

      const date = new Date(sowingDate);
      date.setDate(date.getDate() + stage.daysAfterSowing);

      activities.push({
        user: crop.user,
        cropId,
        activityType: "fertilizer",
        stage: stage.stage,
        scheduledDate: date
      });

    });

    // Irrigation schedule
    for (let i = calendar.irrigationFrequencyDays; i < calendar.harvestAfterDays; i += calendar.irrigationFrequencyDays) {

      const irrigationDate = new Date(sowingDate);
      irrigationDate.setDate(irrigationDate.getDate() + i);

      activities.push({
        user: crop.user,
        cropId,
        activityType: "irrigation",
        scheduledDate: irrigationDate
      });

    }


    // Pest Check
    const pestDate = new Date(sowingDate);
    pestDate.setDate(pestDate.getDate() + calendar.pestCheckAfterDays);

    activities.push({
      user: crop.user,
      cropId,
      activityType: "pest_check",
      scheduledDate: pestDate
    });


    // Harvest
    const harvestDate = new Date(sowingDate);
    harvestDate.setDate(harvestDate.getDate() + calendar.harvestAfterDays);

    activities.push({
      user: crop.user,
      cropId,
      activityType: "harvest",
      scheduledDate: harvestDate
    });

    await CropActivity.deleteMany({ cropId });

    await CropActivity.insertMany(activities);

    res.json({
      message: "Schedule generated",
      activities
    });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


// ================= GET ACTIVITIES =================

exports.getCropSchedule = async (req, res) => {

  try {

    const cropId = req.params.cropId;

    const activities = await CropActivity.find({
      cropId,
      user: req.user.id
    }).sort({ scheduledDate: 1 });

    res.json(activities);

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};


// ================= COMPLETE ACTIVITY =================

exports.completeActivity = async (req, res) => {

  try {

    const activity = await CropActivity.findById(req.params.id);

    if (!activity) {
      return res.status(404).json({ message: "Activity not found" });
    }

    activity.status = "completed";
    activity.completedDate = new Date();

    await activity.save();

    res.json({ message: "Activity completed" });

  } catch (error) {

    console.error(error);
    res.status(500).json({ message: "Server error" });

  }

};