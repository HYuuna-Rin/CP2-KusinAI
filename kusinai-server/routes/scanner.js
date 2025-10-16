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
    const labels = (resp.labelAnnotations || []).map((l) => normalize(l.description));

    // Collect localized object names
    const objects = (resp.localizedObjectAnnotations || []).map((o) => normalize(o.name));

    // Collect text detection (words from OCR)
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      // textAnnotations[0].description usually contains the full text
      const whole = resp.textAnnotations[0].description || "";
      whole
        .split(/\s+/)
        .map((t) => normalize(t))
        .forEach((t) => texts.push(t));
    }

    // Merge all candidates
    const allCandidates = [...labels, ...objects, ...texts]
      .filter(Boolean)
      .map((t) => singularize(t));

    // Filter noise and ignore words, keep short meaningful tokens (1-3 words)
    const filtered = [...new Set(
      allCandidates.filter((tok) => {
        if (!tok) return false;
        if (IGNORE_WORDS.has(tok)) return false;
        // remove purely numeric tokens
        if (/^\d+$/.test(tok)) return false;
        // remove tokens shorter than 2
        if (tok.length < 2) return false;
        return true;
      })
    )];

    // Heuristic: prefer object names, then labels, then OCR text
    const prioritized = [];
    objects.forEach((o) => { if (filtered.includes(o)) prioritized.push(o); });
    labels.forEach((l) => { if (filtered.includes(l) && !prioritized.includes(l)) prioritized.push(l); });
    texts.forEach((t) => { if (filtered.includes(t) && !prioritized.includes(t)) prioritized.push(t); });

    const ingredients = prioritized.length ? prioritized : filtered;

    if (!ingredients || ingredients.length === 0) {
      return res.json({ ingredients: ["No clear ingredients detected"], debug: { labels, objects, texts } });
    }

    res.json({ ingredients });
  } catch (err) {
    console.error("❌ Google Vision Error:", err);
    res.status(500).json({ error: "Failed to scan ingredients", details: String(err) });
  }
});

export default router;
