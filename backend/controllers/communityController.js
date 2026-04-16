const Question = require("../models/Question");

//////////////////////////////////////////////////////////
// ✅ GET ALL QUESTIONS
//////////////////////////////////////////////////////////
exports.getQuestions = async (req, res) => {
    try {
        const questions = await Question.find()
            .populate("user", "name")
            .populate("replies.user", "name")
            .sort({ createdAt: -1 });

        res.json(questions);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//////////////////////////////////////////////////////////
// ✅ ADD QUESTION
//////////////////////////////////////////////////////////
exports.addQuestion = async (req, res) => {
    // 🔥 ADD THESE LOGS HERE
    console.log("🔥 API HIT: ADD QUESTION");
    console.log("📦 BODY:", req.body);
    console.log("👤 USER ID:", req.userId);
    
    try {
        const { title, content } = req.body;

        const question = new Question({
            user: req.userId,
            title,
            content
        });

        await question.save();

        res.json({ message: "Question added", question });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

//////////////////////////////////////////////////////////
// ✅ ADD REPLY
//////////////////////////////////////////////////////////
exports.addReply = async (req, res) => {
    try {
        const { content } = req.body;

        const question = await Question.findById(req.params.id);

        if (!question) {
            return res.status(404).json({ message: "Question not found" });
        }

        const reply = {
            user: req.userId,
            content
        };

        question.replies.push(reply);
        await question.save();

        res.json({ message: "Reply added", question });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};