const mongoose = require("mongoose");
const csv = require("csv-parser");
const fs = require("fs");
const Fertilizer = require("./models/Fertilizer");

mongoose.connect("mongodb+srv://farmassist:farmassistpassword12345@cluster0.kldfnwi.mongodb.net/farmassist?appName=Cluster0")
  .then(() => console.log("MongoDB Connected"))
  .catch(err => console.error(err));

const results = [];

fs.createReadStream("./fertilizer.csv") // make sure CSV is here
  .pipe(csv())
  .on("data", (row) => {
    results.push({
      fertilizer: row.Fertilizer,
      type: row.Type,
      dosage: row.Dosage,
      stage: row.Stage,
      timing: row.Timing,
      benefits: [row.Benefits],
      caution: row.Caution
    });
  })
  .on("end", async () => {
    await Fertilizer.deleteMany();   // clear old data
    await Fertilizer.insertMany(results);
    console.log("Fertilizer data inserted successfully");
    process.exit();
  });