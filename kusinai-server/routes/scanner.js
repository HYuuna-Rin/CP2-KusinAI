// routes/scanner.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Generic tokens/words to ignore
const IGNORE_WORDS = new Set([
  "dish",
  "food",
  "cuisine",
  "meal",
  "ingredient",
  "recipe",
  "produce",
  "pack",
  "package",
  "fresh",
  "g",
  "kg",
  "ml",
  "cup",
  "tablespoon",
  "teaspoon",
]);

// Simple singularize helper for common plurals
const singularize = (word) => {
  if (!word) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

// Normalize tokens: lowercase, trim, remove punctuation
const normalize = (str) =>
  str
    .toLowerCase()
    .replace(/[\.,;:\/()\[\]"'`]/g, "")
    .trim();

router.post("/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }
console.log("📤 Received base64 image length:", imageBase64.length);

    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [
                { type: "LABEL_DETECTION", maxResults: 15 },
                { type: "OBJECT_LOCALIZATION", maxResults: 15 },
                { type: "TEXT_DETECTION", maxResults: 5 },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("📷 Vision API raw response:", JSON.stringify(data, null, 2));

    const resp = data.responses?.[0] || {};

    // Collect label descriptions
    const labels = (resp.labelAnnotations || []).map((l) => ({
      name: normalize(l.description),
      score: l.score || 0,
    }));

    // Collect localized object names
    const objects = (resp.localizedObjectAnnotations || []).map((o) => ({
      name: normalize(o.name),
      score: o.score || 0,
    }));

    // Collect text detection (OCR)
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const whole = resp.textAnnotations[0].description || "";
      whole.split(/\s+/).forEach((t) =>
        texts.push({ name: normalize(t), score: 0.5 }) // give neutral weight
      );
    }

    // Merge all and singularize
    const allCandidates = [...labels, ...objects, ...texts]
      .map((c) => ({ ...c, name: singularize(c.name) }))
      .filter((c) => c.name && !IGNORE_WORDS.has(c.name) && c.name.length > 1 && !/^\d+$/.test(c.name));

    // Remove duplicates (keep highest score)
    const map = new Map();
    for (const c of allCandidates) {
      if (!map.has(c.name) || map.get(c.name).score < c.score) {
        map.set(c.name, c);
      }
    }

    const ingredients = Array.from(map.values())
      .sort((a, b) => b.score - a.score)
      .map((i) => i.name);

    if (ingredients.length === 0) {
      return res.json({
        best: null,
        ingredients: [],
        message: "No clear ingredients detected",
      });
    }

    // Pick top ingredient as "best"
    const best = ingredients[0];
    res.json({
      best,
      ingredients,
      message: "Detected ingredients from image",
    });
  } catch (err) {
    console.error("❌ Google Vision Error:", err);
    res.status(500).json({
      error: "Failed to scan ingredients",
      details: String(err),
    });
  }
});


export default router;
