const express = require("express");
const router  = express.Router();
const  protect  = require("../middleware/authMiddleware");
const {
  getYieldPrediction,
  getSingleYieldPrediction,
  getYieldMeta,
} = require("../controllers/yieldController");

// GET  /api/yield-prediction/meta              → supported crops, soils, stages
router.get("/yield-prediction/meta", protect, getYieldMeta);

// GET  /api/yield-prediction/:userId           → yield for all active crops of user
router.get("/yield-prediction/:userId", protect, getYieldPrediction);

// POST /api/yield-prediction/single            → yield for one manual form input
router.post("/yield-prediction/single", protect, getSingleYieldPrediction);

module.exports = router;
