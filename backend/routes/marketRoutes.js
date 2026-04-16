const express = require("express");

const router = express.Router();

const marketController =
require("../controllers/marketController");

const marketService =
require("../services/marketService");

const authMiddleware = require("../middleware/authMiddleware");

module.exports = router;

router.get("/market", authMiddleware, marketController.getMarketData);
router.get("/crops", marketService.getCropList);

module.exports = router;