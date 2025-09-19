const express = require("express");
const multer = require("multer");
const path = require("path");
const auth = require("../middleware/auth");
const Conversation = require("../models/Conversation");

// ✅ Multer storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "uploads/"); // Ensure "uploads" folder exists
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({ storage });

module.exports = (ai) => {
  const router = express.Router();

  // ✅ Send message with optional file
  router.post("/", auth, upload.single("file"), async (req, res) => {
    const { conversationId, message } = req.body;
    const fileUrl = req.file ? `/uploads/${req.file.filename}` : null;

    if (!message && !fileUrl) {
      return res.status(400).json({ error: "Message or file required" });
    }

    try {
      // ✅ Call GenAI for reply
      const chatSession = ai.chats.create({ model: "gemini-2.5-flash" });
      const response = await chatSession.sendMessage({ message });

      // ✅ Find or create conversation
      let conversation = null;
      if (conversationId) {
        conversation = await Conversation.findOne({
          _id: conversationId,
          userId: req.user.id,
        });
      }

      if (!conversation) {
        conversation = new Conversation({
          userId: req.user.id,
          title: "New Chat",
          messages: [],
        });
      }

      // ✅ Add user + assistant messages
      conversation.messages.push({
        role: "user",
        text: message || "",
        file: fileUrl,
      });

      conversation.messages.push({
        role: "assistant",
        text: response.text,
      });

      conversation.updatedAt = new Date();
      await conversation.save();

      res.json({
        reply: response.text,
        conversationId: conversation._id,
        fileUrl,
      });
    } catch (err) {
      console.error("GenAI API Error:", err);
      res.status(500).json({ error: "Failed to get response" });
    }
  });

  return router;
};
