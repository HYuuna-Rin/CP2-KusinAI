// routes/scanner.js
import express from "express";
import fetch from "node-fetch";

const router = express.Router();

// Generic labels we don’t want in ingredient results
const IGNORE_WORDS = [
  "dish",
  "food",
  "cuisine",
  "meal",
  "ingredient",
  "recipe",
  "produce",
  "fruit",
  "vegetable",
];

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
                { type: "OBJECT_LOCALIZATION", maxResults: 10 },
              ],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    console.log("📷 Vision API raw response:", JSON.stringify(data, null, 2));

    // Extract labels
    const labels =
      data.responses?.[0]?.labelAnnotations?.map((label) =>
        label.description.toLowerCase()
      ) || [];

    // Extract object names
    const objects =
      data.responses?.[0]?.localizedObjectAnnotations?.map((obj) =>
        obj.name.toLowerCase()
      ) || [];

    // Merge and clean up
    const allDetected = [...labels, ...objects];
    const ingredients = [
      ...new Set(
        allDetected.filter(
          (item) => !IGNORE_WORDS.includes(item.toLowerCase())
        )
      ),
    ];

    if (ingredients.length === 0) {
      return res.json({ ingredients: ["No clear ingredients detected"] });
    }

    res.json({ ingredients });
  } catch (err) {
    console.error("❌ Google Vision Error:", err);
    res.status(500).json({ error: "Failed to scan ingredients" });
  }
});

export default router;
