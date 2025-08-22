// routes/chat.js
import express from "express";
import dotenv from "dotenv";
import { authenticateToken } from "./auth.js";

dotenv.config();
const router = express.Router();

// In-memory session chat store (keyed by user + recipe)
const sessionChats = {};

// 🚫 MOCK GPT INSTEAD OF REAL API
router.post("/chat/:recipeId", authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { message, recipeContext } = req.body;
    const userId = req.user.id;

    const sessionKey = `${userId}_${recipeId}`;
    if (!sessionChats[sessionKey]) {
      sessionChats[sessionKey] = [];
    }

    // Store user message in history
    sessionChats[sessionKey].push({ sender: "user", content: message });

    // Simulate GPT reply
    const mockReply = {
      sender: "bot",
      content: `🧠 [MockGPT] Here's a helpful response to: "${message}" related to recipe "${recipeContext.slice(0, 50)}..."`,
    };

    // Store bot reply
    sessionChats[sessionKey].push(mockReply);

    res.json({ reply: mockReply.content });
  } catch (err) {
    console.error("❌ Mock GPT chat error:", err);
    res.status(500).json({ error: "Mock chat request failed." });
  }
});

export default router;
