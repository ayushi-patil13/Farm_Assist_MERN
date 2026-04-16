const mongoose = require("mongoose");

const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    content: String,
    likes: {
        type: Number,
        default: 0
    }
}, { timestamps: true });

const questionSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    title: String,
    content: String,
    likes: {
        type: Number,
        default: 0
    },
    solved: {
        type: Boolean,
        default: false
    },
    replies: [replySchema]
}, { timestamps: true });

module.exports = mongoose.model("Question", questionSchema);