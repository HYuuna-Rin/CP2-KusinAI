import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Words too generic to count as ingredients
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

// Helper functions
const singularize = (word) => {
  if (!word) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

const normalize = (str) =>
  str.toLowerCase().replace(/[\.,;:\/()\[\]"'`]/g, "").trim();

// 📸 POST /api/scanner/scan
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

    // 🟢 Objects (most accurate for specific items)
    const objects = (resp.localizedObjectAnnotations || []).map((o) => ({
      name: singularize(normalize(o.name)),
      score: o.score || 0,
      source: "object",
    }));

    // 🟡 Labels (general scene/context)
    const labels = (resp.labelAnnotations || []).map((l) => ({
      name: singularize(normalize(l.description)),
      score: l.score || 0,
      source: "label",
    }));

    // 🔵 Text (OCR fallback, medium confidence)
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const whole = resp.textAnnotations[0].description || "";
      whole.split(/\s+/).forEach((t) =>
        texts.push({
          name: singularize(normalize(t)),
          score: 0.5, // baseline for detected text
          source: "text",
        })
      );
    }

    // 🧠 Merge + filter generic / invalid
    const allCandidates = [...objects, ...labels, ...texts]
      .filter((c) => c.name && c.name.length > 1 && !/^\d+$/.test(c.name))
      .filter((c) => !GENERIC_WORDS.has(c.name));

    // Remove duplicates: keep the highest confidence per ingredient
    const map = new Map();
    for (const c of allCandidates) {
      if (!map.has(c.name) || map.get(c.name).score < c.score) {
        map.set(c.name, c);
      }
    }

    const finalArray = Array.from(map.values()).sort((a, b) => b.score - a.score);

    if (finalArray.length === 0) {
      return res.json({
        best: null,
        ingredients: [],
        message: "No clear ingredients detected",
      });
    }

    // Pick the best (non-generic) match
    const best =
      finalArray.find((i) => !GENERIC_WORDS.has(i.name.toLowerCase()))?.name ||
      finalArray[0].name;

    // ✅ Send back names + confidence scores
    res.json({
      best,
      ingredients: finalArray, // [{ name, score, source }]
      message: "Detected ingredients from image",
    });
  } catch (err) {
    console.error("❌ Vision API Error:", err);
    res.status(500).json({
      error: "Failed to scan ingredients",
      details: String(err),
    });
  }
});

export default router;
