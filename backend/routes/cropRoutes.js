const express = require("express");
const router = express.Router();
const {
  addCrop,
  getUserCrops,
  completeCrop,
  deleteCrop,
  getSeasonalCrops
} = require("../controllers/cropController");

const authMiddleware = require("../middleware/authMiddleware");

router.post("/add", authMiddleware, addCrop);
router.get("/my", authMiddleware, getUserCrops);
router.put("/complete/:id", authMiddleware, completeCrop);
router.delete("/delete/:id", authMiddleware, deleteCrop);
router.get("/seasonal", authMiddleware, getSeasonalCrops);

module.exports = router;