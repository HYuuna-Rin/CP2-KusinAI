/*
  File: routes/chat.js
  Purpose: Chat-related endpoints (e.g., messaging or AI assistant backend hooks).
  Responsibilities:
  - Provide REST endpoints to support chat features.
  - Bridge to realtime or external AI services if applicable.
  Notes: Keep sensitive data and tokens out of logs.
*/
// routes/chat.js
import express from "express";
import dotenv from "dotenv";
import OpenAI from "openai";
import { authenticateToken } from "./auth.js";

dotenv.config();
const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// In-memory session chat store (keyed by user + recipe)
const sessionChats = {};

router.post("/:recipeId", authenticateToken, async (req, res) => {
  try {
    const { recipeId } = req.params;
    const { message, recipeContext } = req.body;
    const userId = req.user.id;

    const sessionKey = `${userId}_${recipeId}`;
    if (!sessionChats[sessionKey]) {
      sessionChats[sessionKey] = [
        {
          role: "system",
          content: `You are KusinAI, a helpful cooking assistant. 
Only answer questions related to recipes, nutritional values, 
dietary suggestions, and cooking methods. 
Keep responses clear, structured, and complete (do not cut off mid-sentence). 
If the user asks something unrelated, politely decline and guide them back to food.`,
        },
        {
          role: "user",
          content: `Recipe context:\n${recipeContext || "General cooking knowledge"}`,
        },
      ];
    }

    // Add user message
    sessionChats[sessionKey].push({ role: "user", content: message });

    console.log("✅ Using GPT route:", message);

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: sessionChats[sessionKey],
      max_tokens: 1200,
      temperature: 0.7,
    });

    const reply = completion.choices[0].message.content;

    // Save assistant reply
    sessionChats[sessionKey].push({ role: "assistant", content: reply });

    res.json({ reply });
  } catch (err) {
    console.error("❌ GPT chat error:", err);
    res.status(500).json({ error: "Chat request failed." });
  }
});

export default router;
