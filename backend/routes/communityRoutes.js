const express = require("express");
const router = express.Router();

const {
    getQuestions,
    addQuestion,
    addReply
} = require("../controllers/communityController");

// TEMP AUTH (replace later with JWT)
const auth = (req, res, next) => {
    req.userId = req.headers.userid;
    next();
};

router.get("/questions", getQuestions);
router.post("/questions", auth, addQuestion);
router.post("/questions/:id/reply", auth, addReply);

module.exports = router;