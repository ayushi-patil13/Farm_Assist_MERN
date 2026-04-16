const mongoose = require("mongoose");

const fertilizerSchema = new mongoose.Schema({
  stage: String,
  daysAfterSowing: Number
});

const cropCalendarSchema = new mongoose.Schema({
  cropName: {
    type: String,
    required: true
  },
  season: String,
  sowingPeriod: String,

  irrigationFrequencyDays: Number,
  pestCheckAfterDays: Number,
  harvestAfterDays: Number,

  fertilizerSchedule: [fertilizerSchema]
});

module.exports = mongoose.model("CropCalendar", cropCalendarSchema);