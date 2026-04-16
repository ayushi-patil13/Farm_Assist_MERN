const express = require("express");
const router = express.Router();
const schemeController = require("../controllers/schemeController");
const auth = require("../middleware/authMiddleware");

router.get("/", schemeController.getAllSchemes);
router.post("/apply", auth, schemeController.applyForScheme);
router.get("/my", auth, schemeController.getUserSchemes);

module.exports = router;