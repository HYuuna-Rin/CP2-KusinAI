// routes/scanner.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Words too generic to count as ingredients
const IGNORE_WORDS = new Set([
  "dish","food","cuisine","meal","ingredient","recipe","produce",
  "fruit","vegetable","pack","package","bowl","plate","utensil",
  "spoon","fork","knife","table","container","pan","tray","tableware",
  "cutlery","serveware","dining","tablecloth","pot","cooking utensil"
]);

// Simple singularize helper
const singularize = (word) => {
  if (!word) return word;
  if (word.endsWith("ies")) return word.slice(0, -3) + "y";
  if (word.endsWith("ses")) return word.slice(0, -2);
  if (word.endsWith("s") && word.length > 3) return word.slice(0, -1);
  return word;
};

// Normalize tokens
const normalize = (str) =>
  (str || "")
    .toLowerCase()
    .replace(/[\.,;:\/()\[\]"'`]/g, "")
    .trim();

router.post("/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64)
      return res.status(400).json({ error: "Image is required" });

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
                { type: "LABEL_DETECTION", maxResults: 30 },
                { type: "OBJECT_LOCALIZATION", maxResults: 30 },
                { type: "TEXT_DETECTION", maxResults: 10 },
                { type: "WEB_DETECTION", maxResults: 15 },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const resp = data.responses?.[0] || {};

    // Labels (scene/context)
    const labels = (resp.labelAnnotations || []).map((l) => ({
      name: singularize(normalize(l.description)),
      score: l.score || 0,
      source: "label",
    }));

    // Objects (localized ingredients)
    const objects = (resp.localizedObjectAnnotations || []).map((o) => ({
      name: singularize(normalize(o.name)),
      score: (o.score || 0) * 1.3, // boost importance
      boundingPoly: o.boundingPoly || null,
      source: "object",
    }));

    // OCR text tokens
    const texts = [];
    if (resp.textAnnotations && resp.textAnnotations.length > 0) {
      const whole = resp.textAnnotations[0].description || "";
      whole.split(/\s+/).forEach((t) => {
        const n = normalize(t);
        if (n)
          texts.push({ name: singularize(n), score: 0.3, source: "text" });
      });
    }

    // Web hints
    const webLabels = (resp.webDetection?.bestGuessLabels || []).map((w) => ({
      name: singularize(normalize(w.label)),
      score: 0.6,
      source: "webBestGuess",
    }));

    const webEntities = (resp.webDetection?.webEntities || []).map((e) => ({
      name: singularize(normalize(e.description || "")),
      score: e.score || 0.5,
      source: "webEntity",
    }));

    const all = [...objects, ...labels, ...texts, ...webLabels, ...webEntities];

    // Synonyms / aliases for ingredient recall
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
        const syns = [canon].concat(ALIASES[canon] || []);
        for (const s of syns) {
          if (s === name) continue;
          extra.push({
            name: s,
            score: (c.score || 0) * 0.7,
            source: "alias",
            boundingPoly: c.boundingPoly || null,
          });
        }
      }
    }
    if (extra.length) all.push(...extra);

    // Merge duplicates (keep best-scoring or boxed)
    const m = new Map();
    for (const c of all) {
      if (!c.name) continue;
      const existing = m.get(c.name);
      if (!existing) {
        m.set(c.name, c);
        continue;
      }

      const hasBox = (cand) =>
        !!(
          cand &&
          cand.boundingPoly &&
          (cand.boundingPoly.normalizedVertices || cand.boundingPoly.vertices)
        );
      const cHasBox = hasBox(c);
      const existingHasBox = hasBox(existing);

      if (cHasBox && !existingHasBox) {
        m.set(c.name, c);
        continue;
      }
      if ((c.score || 0) > (existing.score || 0)) m.set(c.name, c);
    }

    // Weighted confidence
    const weighted = Array.from(m.values()).map((c) => {
      let s = c.score || 0;
      if (c.source === "object") s += 0.2;
      if (c.source === "label") s -= 0.05;
      if (c.source === "text") s -= 0.15;
      if (c.source === "webEntity") s -= 0.05;
      return {
        ...c,
        score: Math.min(1, Math.max(0, s)),
      };
    });

    // Dynamic confidence threshold
    const scores = weighted.map((c) => c.score);
    const avgScore = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
    let minThreshold = 0.6;
    if (avgScore < 0.6) minThreshold = 0.4;
    if (avgScore > 0.85) minThreshold = 0.7;

    // Filter out generic & low-confidence terms
    let candidates = weighted.filter((c) => {
      if (!c.name) return false;
      if (IGNORE_WORDS.has(c.name)) return false;
      if (/^\d+$/.test(c.name)) return false;
      if (c.name.length < 2) return false;
      if ((c.score || 0) < minThreshold) return false;
      if (["meat", "fruit", "vegetable", "produce", "food"].includes(c.name))
        return false;
      return true;
    });

    candidates.sort((a, b) => (b.score || 0) - (a.score || 0));

    // ✅ Return full info (with boundingPoly etc.) so "Learn" works
    return res.json({
      candidates,
      debug: { avgScore, threshold: minThreshold },
    });
  } catch (err) {
    console.error("❌ Vision API Error:", err);
    res
      .status(500)
      .json({ error: "Failed to scan ingredients", details: String(err) });
  }
});

export default router;
