const controller = require("../controllers/fertilizerController");

console.log("CONTROLLER =", controller);

const authMiddleware = require("../middleware/authMiddleware");

const router = require("express").Router();

router.get("/crops", authMiddleware, controller.getSupportedCrops);
router.post("/recommend", authMiddleware, controller.getFertilizerRecommendation);

module.exports = router;