require("dotenv").config(); // ✅ Load .env

const mongoose = require("mongoose");
const csv = require("csvtojson");
const Fertilizer = require("../../models/Fertilizer");

async function importData() {
  try {
    // ✅ Connect using .env
    await mongoose.connect(process.env.MONGO_URI);

    console.log("Connected to DB:", mongoose.connection.name);

    // Optional: Clear old data
    await Fertilizer.deleteMany({});

    // Read CSV file
    const data = await csv().fromFile("fertilizer.csv");

    // Format data
    const formatted = data.map(item => ({
      fertilizer: item.Fertilizer,
      type: item.Type,
      dosage: item.Dosage,
      stage: item.Stage,
      timing: item.Timing,
      benefits: item.Benefits ? item.Benefits.split(";") : [],
      caution: item.Caution
    }));

    // Insert into DB
    const result = await Fertilizer.insertMany(formatted);

    console.log("✅ Data Imported:", result.length);

    mongoose.connection.close();
    console.log("Connection closed");

  } catch (error) {
    console.error("❌ Error importing data:", error);
  }
}

importData();