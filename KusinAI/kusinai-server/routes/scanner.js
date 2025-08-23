import express from "express";
import fetch from "node-fetch";
import dotenv from "dotenv";

dotenv.config();
const router = express.Router();

router.post("/scan", async (req, res) => {
  try {
    const { imageBase64 } = req.body;
    if (!imageBase64) {
      return res.status(400).json({ error: "Image is required" });
    }

    // Send to Google Vision API
    const response = await fetch(
      `https://vision.googleapis.com/v1/images:annotate?key=${process.env.GOOGLE_VISION_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          requests: [
            {
              image: { content: imageBase64 },
              features: [{ type: "LABEL_DETECTION", maxResults: 5 }],
            },
          ],
        }),
      }
    );

    const data = await response.json();
    const labels =
      data.responses?.[0]?.labelAnnotations?.map((label) => label.description) || [];

    res.json({ ingredients: labels });
  } catch (err) {
    console.error("Google Vision Error:", err);
    res.status(500).json({ error: "Failed to scan ingredients" });
  }
});

export default router;
