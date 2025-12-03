// /routes/scanner.js

import express from "express";
import axios from "axios";

const router = express.Router();

/**
 * Ingredient filtering
 * This removes garbage predictions like "food", "meal", "produce", etc.
 */
const INGREDIENT_WHITELIST = new Set([
  // Core staples
  "garlic","onion","tomato","ginger","egg","oil","olive oil","soy sauce","salt","pepper","butter","milk","flour","sugar","chicken","beef","pork","fish","rice","shrimp","squid","crab","carrot","potato","cabbage","bell pepper","okra","spinach","lettuce","lemon","lime","coconut",
  // Expanded vegetables & aromatics
  "eggplant","aubergine","broccoli","cauliflower","green beans","string beans","bean sprout","mung bean","mung beans","chili","chili pepper","red chili","green chili","turmeric","lemongrass","bay leaf","basil","parsley","cilantro","coriander","mint","spring onion","scallion","shallot","ginger root",
  // Filipino / regional ingredients
  "ampalaya","bitter melon","bitter gourd","malunggay","moringa","sitaw","calamansi","tofu","taho","longganisa","papaya","plantain","banana",
  // Pantry items / sauces
  "fish sauce","vinegar","rice vinegar","coconut milk","coconut cream","brown sugar"
]);

const BLOCKLIST = new Set([
  // Generic / non-ingredient concepts
  "meal","recipe","dish","food","produce","ingredient","cuisine","vegetable","fruit","natural foods","tableware","kitchen","utensil","cookware","plate","bowl","spoon","fork","knife","cutting board","board","wood","background","close up","label","logo","brand","packaging","container","glass","cup","table","surface","photography","nutrition","macro","raw"
]);

router.post("/scan", async (req, res) => {
  console.log("📸 Using Clarifai Ingredient Scanner (with Vision fallback)");

  try {
    const { image, imageBase64, imageUrl } = req.body || {};

    const base64raw = (image || imageBase64 || "")
      .replace(/^data:image\/[a-zA-Z+]+;base64,/, "");

    if (!base64raw && !imageUrl) {
      return res.status(400).json({ error: "Image is required" });
    }

    const CLARIFAI_PAT = process.env.CLARIFAI_PAT;
    const GKEY = process.env.GOOGLE_VISION_API_KEY;

    if (!CLARIFAI_PAT) {
      return res.status(500).json({ error: "Missing Clarifai PAT" });
    }

    // ----------------------------------------------------
    // ⭐ Clarifai FOOD MODEL CALL
    // Using Clarifai's hosted public app: user_id="clarifai", app_id="main"
    // ----------------------------------------------------
    const clarifaiReq = {
      user_app_id: { user_id: "clarifai", app_id: "main" },
      inputs: [
        {
          data: {
            image: base64raw
              ? { base64: base64raw }
              : { url: imageUrl }
          }
        }
      ]
    };

    let clarifaiCandidates = [];

    try {
      const clarifaiRes = await axios.post(
        "https://api.clarifai.com/v2/models/food-item-recognition/outputs",
        clarifaiReq,
        { headers: { Authorization: `Key ${CLARIFAI_PAT}` } }
      );

      const concepts = clarifaiRes.data?.outputs?.[0]?.data?.concepts || [];
      console.log("Clarifai concepts:", concepts.map(c=>({name:c.name, value:c.value})).slice(0,10));

      clarifaiCandidates = concepts
        .filter((c) => c.value >= 0.55) // confidence threshold
        .map((c) => c.name.toLowerCase())
        .filter((name) => !BLOCKLIST.has(name))
        .filter((name) => {
          // allow if in whitelist OR simple ingredient-like term
          return (
            INGREDIENT_WHITELIST.has(name) ||
            (name.split(" ").length <= 3 && /^[a-z\s]+$/i.test(name))
          );
        })
        .map((name) => ({
          name,
          score: 0.9,
          source: "clarifai"
        }));

      // If none detected at 0.55, try a lower adaptive threshold (0.35)
      if (clarifaiCandidates.length === 0 && concepts.length > 0) {
        const lowThresh = concepts
          .filter((c) => c.value >= 0.35)
          .map((c) => c.name.toLowerCase())
          .filter((name) => !BLOCKLIST.has(name))
          .filter((name) => (
            INGREDIENT_WHITELIST.has(name) || (name.split(" ").length <= 2 && /^[a-z\s]+$/i.test(name))
          ))
          .map((name) => ({ name, score: 0.7, source: "clarifai" }));
        if (lowThresh.length > 0) {
          console.log("✔ Clarifai adaptive threshold hit (0.35)", lowThresh);
          clarifaiCandidates = lowThresh;
        }
      }

    } catch (e) {
      console.warn("Clarifai error:", e?.response?.data || e.message);
    }

    // 💡 If Clarifai returned results → stop here
    if (clarifaiCandidates.length > 0) {
      console.log("✔ Clarifai success:", clarifaiCandidates);
      return res.json({ candidates: clarifaiCandidates });
    }

    // -------------------------------------------------------------------
    // ⭐ Google Vision Fallback — LABEL DETECTION (for raw ingredients)
    // -------------------------------------------------------------------
    if (GKEY) {
      console.log("🔄 Using Google Vision fallback");

      const body = {
        requests: [
          {
            image: base64raw
              ? { content: base64raw }
              : { source: { imageUri: imageUrl } },
            features: [{ type: "LABEL_DETECTION", maxResults: 20 }]
          }
        ]
      };

      const vision = await axios.post(
        `https://vision.googleapis.com/v1/images:annotate?key=${GKEY}`,
        body
      );

      const anns = vision?.data?.responses?.[0]?.labelAnnotations || [];

      const seen = new Set();

      const visionCandidates = anns
        .map((a) => a.description?.toLowerCase())
        .filter((name) => name && !seen.has(name) && seen.add(name))
        .filter((name) => !BLOCKLIST.has(name))
        .map((name) => ({
          name,
          score: 0.6,
          source: "vision-label"
        }));

      if (visionCandidates.length > 0) {
        console.log("✔ Vision fallback success");
        return res.json({ candidates: visionCandidates });
      }
    }

    // -------------------------------------------------------------------
    // ⭐ OCR FALLBACK (for packaged food ingredients list)
    // -------------------------------------------------------------------
    console.log("🔄 Using OCR fallback");

    if (!GKEY) return res.json({ candidates: [] });

    const ocrBody = {
      requests: [
        {
          image: base64raw
            ? { content: base64raw }
            : { source: { imageUri: imageUrl } },
          features: [{ type: "TEXT_DETECTION" }]
        }
      ]
    };

    const ocrResp = await axios.post(
      `https://vision.googleapis.com/v1/images:annotate?key=${GKEY}`,
      ocrBody
    );

    const text = ocrResp?.data?.responses?.[0]?.fullTextAnnotation?.text || "";
    if (!text) return res.json({ candidates: [] });

    const lines = text
      .split(/\r?\n|,|;|\*/g)
      .map((s) => s.trim().toLowerCase())
      .filter(Boolean);

    const ocrCandidates = [];
    for (const line of lines) {
      for (const word of line.split(/\s+/)) {
        if (INGREDIENT_WHITELIST.has(word)) {
          ocrCandidates.push({
            name: word,
            score: 0.50,
            source: "ocr"
          });
        }
      }
    }

    return res.json({ candidates: ocrCandidates });

  } catch (error) {
    console.error("Scanner error:", error);
    return res.status(500).json({ error: "Internal scanner error" });
  }
});

export default router;
