// kusinai-server/routes/import.js

import express from "express";
import Recipe from "../models/Recipe.js";
import { extractRecipeFromURL } from "../services/extractor.js";

const router = express.Router();

// 📌 POST /api/import/manual
router.post("/manual", async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) return res.status(400).json({ error: "URL required" });

    const data = await extractRecipeFromURL(url, process.env.OPENAI_API_KEY);

    const existing = await Recipe.findOne({ sourceUrl: url });

    if (existing && existing.checksum === data.checksum) {
      return res.json({ message: "No changes detected", recipe: existing });
    }

    const recipe = await Recipe.findOneAndUpdate(
      { sourceUrl: url },
      {
        title: data.title,
        ingredients: data.ingredients,
        steps: data.steps,
        image: data.image,
        sourceName: data.sourceName,
        sourceUrl: url,
        checksum: data.checksum,
        lastImportedAt: new Date()
      },
      { upsert: true, new: true }
    );

    res.json({ message: existing ? "Updated" : "Imported", recipe });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 📌 POST /api/import/bulk
router.post("/bulk", async (req, res) => {
  try {
    const { urls } = req.body;
    if (!urls || !Array.isArray(urls)) {
      return res.status(400).json({ error: "urls[] required" });
    }

    const results = [];

    for (const url of urls) {
      try {
        const data = await extractRecipeFromURL(url, process.env.OPENAI_API_KEY);

        const existing = await Recipe.findOne({ sourceUrl: url });
        const recipe = await Recipe.findOneAndUpdate(
          { sourceUrl: url },
          {
            title: data.title,
            ingredients: data.ingredients,
            steps: data.steps,
            image: data.image,
            sourceName: data.sourceName,
            sourceUrl: url,
            checksum: data.checksum,
            lastImportedAt: new Date()
          },
          { upsert: true, new: true }
        );

        results.push({
          url,
          status: existing ? "updated" : "imported",
          recipeId: recipe._id
        });
      } catch (e) {
        results.push({ url, status: "failed", error: e.message });
      }
    }

    res.json({ results });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
