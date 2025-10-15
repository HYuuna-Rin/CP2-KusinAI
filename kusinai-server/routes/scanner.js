// routes/scanner.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Words to ignore (common non-ingredient labels)
const IGNORE_WORDS = [
  "dish", "food", "meal", "cuisine", "ingredient", "recipe", "produce",
  "vegetable", "fruit", "natural", "product", "plate", "delicious"
];

const STOPWORDS = [
  "fresh", "sliced", "chopped", "diced", "pack", "packed", "serving",
  "contains", "net", "best", "before", "use", "flavor", "taste"
];

const UNITS = [
  "kg", "g", "gram", "grams", "ml", "l", "liter", "liters",
  "tsp", "tbsp", "cup", "cups", "pcs", "piece", "pieces"
];

/**
 * Basic text cleaning utility
 */
function cleanText(text) {
  return text
    .toLowerCase()
    .replace(/[^\p{L}\s]/gu, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract best candidate ingredient from OCR + labels
 */
function extractBestIngredient(ocrTexts = [], labels = []) {
  const candidates = {};
  const labelSet = new Set(labels.map(cleanText));

  for (const raw of ocrTexts) {
    const text = cleanText(raw);
    if (!text) continue;

    const words = text.split(" ").filter(Boolean);
    for (const word of words) {
      if (word.length < 2) continue;
      if (IGNORE_WORDS.includes(word)) continue;
      if (STOPWORDS.includes(word)) continue;
      if (UNITS.includes(word)) continue;
      if (/\d/.test(word)) continue;

      if (!candidates[word]) candidates[word] = 0;
      candidates[word]++;

      // boost if also seen in label
      if (labelSet.has(word)) candidates[word] += 2;
    }
  }

  // Add label-only items (boosted)
  for (const lbl of labelSet) {
    if (IGNORE_WORDS.includes(lbl)) continue;
    if (STOPWORDS.includes(lbl)) continue;
    if (lbl.length < 2) continue;
    candidates[lbl] = (candidates[lbl] || 0) + 3;
  }

  const sorted = Object.entries(candidates)
    .map(([token, score]) => ({ token, score }))
    .sort((a, b) => b.score - a.score);

  const best = sorted.length ? sorted[0].token : null;
  const topCandidates = sorted.slice(0, 5).map((c) => c.token);

  return { best, candidates: topCandidates };
}

/**
 * POST /api/scanner/scan
 * Body: { imageBase64 }
 */
router.post("/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

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
                { type: "LABEL_DETECTION", maxResults: 10 },
                { type: "TEXT_DETECTION", maxResults: 5 },
                { type: "OBJECT_LOCALIZATION", maxResults: 5 }
              ]
            }
          ]
        })
      }
    );

    const data = await response.json();
    console.log("📷 Vision API raw response:", JSON.stringify(data, null, 2));

    const resp = data.responses?.[0] || {};

    const labels = resp.labelAnnotations?.map(l => l.description.toLowerCase()) || [];
    const objects = resp.localizedObjectAnnotations?.map(o => o.name.toLowerCase()) || [];
    const textBlocks = resp.textAnnotations?.map(t => t.description.toLowerCase()) || [];

    const allText = [...labels, ...objects, ...textBlocks];
    const { best, candidates } = extractBestIngredient(textBlocks, [...labels, ...objects]);

    if (!best) {
      return res.json({
        best: null,
        candidates: [],
        ingredients: [],
        message: "⚠️ No clear ingredients detected. Try again."
      });
    }

    res.json({
      best,
      candidates,
      ingredients: [...new Set([...candidates])],
      message: `✅ Detected ingredient: ${best}`,
      raw: { labels, objects, textBlocks }
    });
  } catch (err) {
    console.error("❌ Google Vision Error:", err);
    res.status(500).json({ error: "Failed to process image. Try again." });
  }
});

export default router;
