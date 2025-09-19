const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");

// ✅ Get all conversations for logged-in user
router.get("/", auth, async (req, res) => {
  try {
    const conversations = await Conversation.find({ userId: req.user.id }).sort({
      updatedAt: -1,
    });
    res.json(conversations);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Create new conversation
router.post("/", auth, async (req, res) => {
  try {
    const newConv = new Conversation({
      userId: req.user.id,
      title: req.body.title || "New Chat",
      messages: [],
    });
    await newConv.save();
    res.json(newConv);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// ✅ Add message to existing conversation
router.post("/:id/message", auth, async (req, res) => {
  try {
    const { role, text } = req.body;
    const conversation = await Conversation.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });

    conversation.messages.push({ role, text });
    conversation.updatedAt = new Date();
    await conversation.save();

    res.json(conversation);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


// Delete a conversation
router.delete("/:id", auth, async (req, res) => {
  try {
    const conversation = await Conversation.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });
    if (!conversation)
      return res.status(404).json({ message: "Conversation not found" });
    res.json({ message: "Conversation deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});


module.exports = router;
