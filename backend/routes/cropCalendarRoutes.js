const express = require("express");
const router = express.Router();

const controller = require("../controllers/cropCalendarController");
const authMiddleware = require("../middleware/authMiddleware");

// ✅ FIXED: specific routes MUST come before wildcard /:cropName
router.get("/schedule/:cropId", authMiddleware, controller.getCropSchedule);

router.post("/generate/:cropId", authMiddleware, controller.generateSchedule);

router.post("/complete/:id", authMiddleware, controller.completeActivity);

// ✅ wildcard route goes LAST
router.get("/:cropName", authMiddleware, controller.getCropCalendar);

module.exports = router;
