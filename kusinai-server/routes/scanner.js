// routes/scanner.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Words too generic to count as ingredients
const IGNORE_WORDS = new Set([
  "dish",
  "food",
  "cuisine",
  "meal",
  "ingredient",
  "recipe",
  "produce",
  "fruit",
  "vegetable",
  "pack",
  "package",
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
  (str || "")
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
                // Increase results to capture more possible labels
                { type: "LABEL_DETECTION", maxResults: 30 },
                { type: "OBJECT_LOCALIZATION", maxResults: 30 },
                { type: "TEXT_DETECTION", maxResults: 10 },
                // Web detection can provide webEntities and best guess labels (helps for uncommon items)
                { type: "WEB_DETECTION", maxResults: 15 },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("📷 Vision API raw response:", JSON.stringify(data, null, 2));

    const resp = data.responses?.[0] || {};

    // Labels (general scene/context)
    const labels = (resp.labelAnnotations || []).map((l) => ({
      name: singularize(normalize(l.description)),
      score: l.score || 0,
      source: "label",
    }));

    // Objects (localized) with bounding polygon
    const objects = (resp.localizedObjectAnnotations || []).map((o) => ({
      name: singularize(normalize(o.name)),
      score: o.score || 0,
      boundingPoly: o.boundingPoly || null,
      source: "object",
    }));

    // Text (OCR)
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const whole = resp.textAnnotations[0].description || "";
      whole.split(/\s+/).forEach((t) => {
        const n = normalize(t);
        if (n) texts.push({ name: singularize(n), score: 0.3, source: "text" });
      });
    }

    // Merge candidates and dedupe by name.
    // Prefer candidates that include a boundingPoly (objects/localized detections)
    // so the frontend can crop individual items instead of always falling back
    // to the full scanned image for labels/text tokens.
      const webLabels = (resp.webDetection?.bestGuessLabels || []).map(w => ({
        name: singularize(normalize(w.label)),
        score: 0.6,
        source: 'webBestGuess'
      }));

      const webEntities = (resp.webDetection?.webEntities || []).map(e => ({
        name: singularize(normalize(e.description || e.score || '')),
        score: e.score || 0.5,
        source: 'webEntity'
      }));

    const all = [...objects, ...labels, ...texts];
    // include web-derived hints at the end (they'll be considered if no better boxed/label exists)
    all.push(...webLabels, ...webEntities);

    // Aliases / synonyms for common or ambiguous ingredient names to improve recall.
    // If a candidate appears as one name, we also add its known synonyms with a slightly lower score.
    const ALIASES = {
      pomelo: ["pummelo", "shaddock", "pomello"],
      eggplant: ["aubergine"],
      zucchini: ["courgette"],
      cilantro: ["coriander"],
      scallion: ["spring onion", "green onion"],
      chickpea: ["garbanzo"],
    };

    const normalizedToCanonical = {};
    Object.keys(ALIASES).forEach((canon) => {
      normalizedToCanonical[canon] = canon;
      ALIASES[canon].forEach((alt) => (normalizedToCanonical[alt] = canon));
    });

    const extra = [];
    for (const c of all) {
      const name = c.name;
      if (!name) continue;
      const canon = normalizedToCanonical[name];
      if (canon) {
        // add other synonyms for this canonical name
        const syns = [canon].concat(ALIASES[canon] || []);
        for (const s of syns) {
          if (s === name) continue;
          extra.push({ name: s, score: (c.score || 0) * 0.7, source: 'alias' });
        }
      }
    }

    if (extra.length) all.push(...extra);

    const m = new Map();
    for (const c of all) {
      if (!c.name) continue;
      const existing = m.get(c.name);
      if (!existing) {
        m.set(c.name, c);
        continue;
      }

      const hasBox = (cand) => !!(cand && cand.boundingPoly && (cand.boundingPoly.normalizedVertices || cand.boundingPoly.vertices));
      const cHasBox = hasBox(c);
      const existingHasBox = hasBox(existing);

      // If the new candidate has a bounding box while the existing one doesn't,
      // prefer the boxed candidate even if its score is lower. This helps the
      // frontend produce per-item cropped thumbnails.
      if (cHasBox && !existingHasBox) {
        m.set(c.name, c);
        continue;
      }

      // Otherwise, keep the one with the higher score.
      if ((c.score || 0) > (existing.score || 0)) {
        m.set(c.name, c);
      }
    }

    let candidates = Array.from(m.values()).filter((c) => {
      if (!c.name) return false;
      if (IGNORE_WORDS.has(c.name)) return false;
      if (/^\d+$/.test(c.name)) return false;
      if (c.name.length < 2) return false;
      return true;
    });

    // sort by score desc
    candidates.sort((a, b) => (b.score || 0) - (a.score || 0));

    return res.json({ candidates, debug: { labels: labels.map(l => l.name), objects: objects.map(o => o.name), texts: texts.map(t => t.name) } });
  } catch (err) {
    console.error("❌ Vision API Error:", err);
    res.status(500).json({ error: "Failed to scan ingredients", details: String(err) });
  }
});

export default router;
