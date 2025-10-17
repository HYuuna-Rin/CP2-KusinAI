// routes/scanner.js
import express from "express";
import fetch from "node-fetch";
// import Ingredient from "../models/Ingredient.js"; // <-- Uncomment if you have ingredient DB

const router = express.Router();

// Words that are too generic to be "real" ingredients
const GENERIC_WORDS = new Set([
  "fruit",
  "food",
  "natural food",
  "produce",
  "cuisine",
  "meal",
  "ingredient",
  "dish",
  "recipe",
  "staple food",
  "plant",
  "vegetable",
  "meat",
  "seafood",
]);

// Simple helpers
const singularize = (word) => {
  if (!word) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

const normalize = (str) =>
  str.toLowerCase().replace(/[\.,;:\/()\[\]"'`]/g, "").trim();

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
                { type: "OBJECT_LOCALIZATION", maxResults: 15 },
                { type: "LABEL_DETECTION", maxResults: 15 },
                { type: "TEXT_DETECTION", maxResults: 5 },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const resp = data.responses?.[0] || {};

    // Gather objects (usually most accurate)
    const objects = (resp.localizedObjectAnnotations || []).map((o) => ({
      name: singularize(normalize(o.name)),
      score: o.score || 0,
    }));

    // Gather labels
    const labels = (resp.labelAnnotations || []).map((l) => ({
      name: singularize(normalize(l.description)),
      score: l.score || 0,
    }));

    // Gather text (OCR)
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const whole = resp.textAnnotations[0].description || "";
      whole.split(/\s+/).forEach((t) =>
        texts.push({ name: singularize(normalize(t)), score: 0.5 })
      );
    }

    // Merge and filter
    const allCandidates = [...objects, ...labels, ...texts]
      .filter((c) => c.name && c.name.length > 1 && !/^\d+$/.test(c.name))
      .filter((c) => !GENERIC_WORDS.has(c.name));

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

    // Optional: verify with DB if exists
    /*
    const verified = [];
    for (const i of ingredients) {
      const exists = await Ingredient.findOne({ name: new RegExp(`^${i}$`, "i") });
      if (exists) verified.push(i);
    }
    const finalIngredients = verified.length ? verified : ingredients;
    */

    const finalIngredients = ingredients;

    if (!finalIngredients.length) {
      return res.json({
        best: null,
        ingredients: [],
        message: "No clear ingredients detected",
      });
    }

    // Prefer the most confident non-generic match
    const best =
      finalIngredients.find(
        (i) => !GENERIC_WORDS.has(i.toLowerCase())
      ) || finalIngredients[0];

    res.json({
      best,
      ingredients: finalIngredients,
      message: "Detected ingredients from image",
    });
  } catch (err) {
    console.error("❌ Vision Error:", err);
    res.status(500).json({
      error: "Failed to scan ingredients",
      details: String(err),
    });
  }
});

export default router;
