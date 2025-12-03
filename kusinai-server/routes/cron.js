// kusinai-server/routes/cron.js

import express from "express";
import { autoUpdateAll } from "../services/crawler.js";

const router = express.Router();

// 📌 POST /api/cron/auto-update
// Intended to be triggered by an external scheduler monthly/weekly.
router.post("/auto-update", async (req, res) => {
  try {
    const { discover = true } = req.body || {};
    const summary = await autoUpdateAll({ discover });
    res.json({ ok: true, summary });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

export default router;
