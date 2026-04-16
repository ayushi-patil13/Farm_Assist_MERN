require("dotenv").config();
const mongoose = require("mongoose");
const CropCalendar = require("./models/CropCalendar");

// mongoose.connect("mongodb://localhost:27017/farmassist");

const seedData = [

/* 🌾 CEREALS */

{
 cropName: "Rice",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 25,
 harvestAfterDays: 125,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Tillering", daysAfterSowing: 25 },
  { stage: "Panicle Initiation", daysAfterSowing: 45 }
 ]
},

{
 cropName: "Wheat",
 season: "Rabi",
 sowingPeriod: "Nov-Dec",
 irrigationFrequencyDays: 22,
 pestCheckAfterDays: 30,
 harvestAfterDays: 130,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Top Dressing 1", daysAfterSowing: 21 },
  { stage: "Top Dressing 2", daysAfterSowing: 40 }
 ]
},

{
 cropName: "Maize",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 20,
 harvestAfterDays: 95,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Knee High", daysAfterSowing: 20 },
  { stage: "Tasseling", daysAfterSowing: 45 }
 ]
},

{
 cropName: "Barley",
 season: "Rabi",
 sowingPeriod: "Nov-Dec",
 irrigationFrequencyDays: 20,
 pestCheckAfterDays: 30,
 harvestAfterDays: 120,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Tillering", daysAfterSowing: 30 }
 ]
},

{
 cropName: "Sorghum",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 18,
 pestCheckAfterDays: 25,
 harvestAfterDays: 105,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Vegetative", daysAfterSowing: 25 }
 ]
},

{
 cropName: "Bajra",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 20,
 harvestAfterDays: 95,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Tillering", daysAfterSowing: 25 }
 ]
},

{
 cropName: "Ragi",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 25,
 harvestAfterDays: 110,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Tillering", daysAfterSowing: 25 }
 ]
},

/* 🌱 PULSES */

{
 cropName: "Chickpea",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 25,
 pestCheckAfterDays: 30,
 harvestAfterDays: 115,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Flowering", daysAfterSowing: 35 }
 ]
},

{
 cropName: "Pigeon Pea",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 20,
 pestCheckAfterDays: 35,
 harvestAfterDays: 180,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Vegetative", daysAfterSowing: 30 }
 ]
},

{
 cropName: "Moong",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 20,
 harvestAfterDays: 70,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Flowering", daysAfterSowing: 25 }
 ]
},

{
 cropName: "Urad",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 20,
 harvestAfterDays: 80,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Flowering", daysAfterSowing: 30 }
 ]
},

{
 cropName: "Masoor",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 20,
 pestCheckAfterDays: 25,
 harvestAfterDays: 110,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

/* 🌿 CASH / FIBER */

{
 cropName: "Sugarcane",
 season: "Annual",
 sowingPeriod: "Jan-Mar",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 30,
 harvestAfterDays: 300,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Tillering", daysAfterSowing: 45 },
  { stage: "Grand Growth", daysAfterSowing: 90 }
 ]
},

{
 cropName: "Cotton",
 season: "Kharif",
 sowingPeriod: "Apr-May",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 30,
 harvestAfterDays: 170,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Vegetative", daysAfterSowing: 30 },
  { stage: "Flowering", daysAfterSowing: 60 }
 ]
},

{
 cropName: "Jute",
 season: "Kharif",
 sowingPeriod: "Mar-Apr",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 25,
 harvestAfterDays: 120,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Vegetative", daysAfterSowing: 30 }
 ]
},

/* 🌻 OILSEEDS */

{
 cropName: "Groundnut",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 14,
 pestCheckAfterDays: 25,
 harvestAfterDays: 110,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Flowering", daysAfterSowing: 30 }
 ]
},

{
 cropName: "Mustard",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 20,
 pestCheckAfterDays: 30,
 harvestAfterDays: 110,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Soybean",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 18,
 pestCheckAfterDays: 25,
 harvestAfterDays: 105,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 },
  { stage: "Pod Formation", daysAfterSowing: 45 }
 ]
},

{
 cropName: "Sunflower",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 20,
 harvestAfterDays: 95,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Sesame",
 season: "Kharif",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 20,
 harvestAfterDays: 90,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

/* ☕ PLANTATION */

{
 cropName: "Tea",
 season: "Perennial",
 sowingPeriod: "Mar-Apr",
 irrigationFrequencyDays: 7,
 pestCheckAfterDays: 20,
 harvestAfterDays: 365,
 fertilizerSchedule: [
  { stage: "Pre-Monsoon", daysAfterSowing: 0 },
  { stage: "Post-Monsoon", daysAfterSowing: 180 }
 ]
},

{
 cropName: "Coffee",
 season: "Perennial",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 25,
 harvestAfterDays: 365,
 fertilizerSchedule: [
  { stage: "Pre-Blossom", daysAfterSowing: 0 },
  { stage: "Post-Blossom", daysAfterSowing: 120 }
 ]
},

{
 cropName: "Rubber",
 season: "Perennial",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 30,
 harvestAfterDays: 1825,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

/* 🥦 VEGETABLES */

{
 cropName: "Potato",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 20,
 harvestAfterDays: 90,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Onion",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 20,
 harvestAfterDays: 120,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Tomato",
 season: "All",
 sowingPeriod: "Year Round",
 irrigationFrequencyDays: 7,
 pestCheckAfterDays: 15,
 harvestAfterDays: 80,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Brinjal",
 season: "All",
 sowingPeriod: "Year Round",
 irrigationFrequencyDays: 7,
 pestCheckAfterDays: 15,
 harvestAfterDays: 90,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Cabbage",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 8,
 pestCheckAfterDays: 15,
 harvestAfterDays: 85,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Cauliflower",
 season: "Rabi",
 sowingPeriod: "Oct-Nov",
 irrigationFrequencyDays: 8,
 pestCheckAfterDays: 15,
 harvestAfterDays: 90,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

/* 🍎 FRUITS */

{
 cropName: "Mango",
 season: "Perennial",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 30,
 harvestAfterDays: 1460,
 fertilizerSchedule: [
  { stage: "Pre-Flowering", daysAfterSowing: 300 }
 ]
},

{
 cropName: "Banana",
 season: "All",
 sowingPeriod: "Year Round",
 irrigationFrequencyDays: 7,
 pestCheckAfterDays: 20,
 harvestAfterDays: 300,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Apple",
 season: "Temperate",
 sowingPeriod: "Dec-Jan",
 irrigationFrequencyDays: 15,
 pestCheckAfterDays: 30,
 harvestAfterDays: 1825,
 fertilizerSchedule: [
  { stage: "Dormant", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Orange",
 season: "All",
 sowingPeriod: "Jul-Aug",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 25,
 harvestAfterDays: 1095,
 fertilizerSchedule: [
  { stage: "Pre-Flowering", daysAfterSowing: 200 }
 ]
},

{
 cropName: "Grapes",
 season: "Rabi",
 sowingPeriod: "Dec-Jan",
 irrigationFrequencyDays: 7,
 pestCheckAfterDays: 15,
 harvestAfterDays: 365,
 fertilizerSchedule: [
  { stage: "Pruning", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Pineapple",
 season: "All",
 sowingPeriod: "Jun-Jul",
 irrigationFrequencyDays: 12,
 pestCheckAfterDays: 25,
 harvestAfterDays: 540,
 fertilizerSchedule: [
  { stage: "Basal", daysAfterSowing: 0 }
 ]
},

{
 cropName: "Guava",
 season: "All",
 sowingPeriod: "Jul-Aug",
 irrigationFrequencyDays: 10,
 pestCheckAfterDays: 20,
 harvestAfterDays: 730,
 fertilizerSchedule: [
  { stage: "Pre-Flowering", daysAfterSowing: 150 }
 ]
}

];


async function seed() {
  try {

    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB:", mongoose.connection.name);

    await CropCalendar.deleteMany({});

    const result = await CropCalendar.insertMany(seedData);

    console.log("Inserted records:", result.length);

    mongoose.connection.close();
    console.log("Crop calendar dataset inserted");

  } catch (error) {
    console.error(error);
  }
}

seed();