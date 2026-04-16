const express = require("express");
const router = express.Router();
const Equipment = require("../models/Equipment");

router.post("/", async (req, res) => {
  try {

    const equipment = new Equipment(req.body);

    await equipment.save();

    res.status(201).json({
      message: "Equipment added successfully",
      equipment
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/", async (req, res) => {
  try {

    const equipment = await Equipment.find().sort({ createdAt: -1 });

    res.json(equipment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.get("/user/:userId", async (req, res) => {

  try {

    const equipment = await Equipment.find({
      userId: req.params.userId
    });

    res.json(equipment);

  } catch (error) {
    res.status(500).json({ error: error.message });
  }

});

module.exports = router;