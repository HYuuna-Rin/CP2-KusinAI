// kusinai-server/services/extractor.js

import crypto from "crypto";
import axios from "axios";

function tryParseJsonLd(html) {
  try {
    const scripts = [];
    const re = /<script[^>]*type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi;
    let m;
    while ((m = re.exec(html))) {
      const raw = m[1].trim();
      try { scripts.push(JSON.parse(raw)); } catch {}
    }
    const flatten = (obj) => Array.isArray(obj) ? obj.flatMap(flatten) : [obj];
    const blobs = scripts.flatMap(flatten);
    const all = [];
    for (const b of blobs) {
      if (!b) continue;
      if (Array.isArray(b['@graph'])) all.push(...b['@graph']); else all.push(b);
    }
    const isRecipe = (o) => {
      const t = (o['@type'] || o.type || '').toString().toLowerCase();
      if (!t) return false;
      if (Array.isArray(o['@type'])) return o['@type'].some(v => String(v).toLowerCase()==='recipe');
      return t.includes('recipe');
    };
    const recipe = all.find(isRecipe);
    if (!recipe) return null;
    const title = recipe.name || recipe.headline || '';
    const image = Array.isArray(recipe.image) ? (recipe.image[0]?.url || recipe.image[0]) : (recipe.image?.url || recipe.image || '');
    const ingr = Array.isArray(recipe.recipeIngredient) ? recipe.recipeIngredient : [];
    let steps = [];
    if (Array.isArray(recipe.recipeInstructions)) {
      steps = recipe.recipeInstructions.map(s => {
        if (!s) return null;
        if (typeof s === 'string') return s;
        return s.text || s.name || null;
      }).filter(Boolean);
    }
    const sourceName = recipe.publisher?.name || '';
    if (!title && ingr.length === 0 && steps.length === 0) return null;
    return { title, ingredients: ingr, steps, image, sourceName };
  } catch {
    return null;
  }
}

export async function extractRecipeFromURL(url, apiKey) {
  // Fetch raw HTML
  const html = await axios.get(url).then(r => r.data).catch(() => null);

  if (!html) throw new Error("Failed to fetch recipe page");

  // 1) Try schema.org JSON-LD extraction first (fast, no LLM cost)
  const schemaData = tryParseJsonLd(html);
  if (schemaData) {
    const checksum = crypto
      .createHash("sha256")
      .update(JSON.stringify(schemaData))
      .digest("hex");
    return { ...schemaData, url, checksum };
  }

  const prompt = `
You are a professional recipe extractor.
Extract ONLY clean structured JSON (no explanations).

INPUT URL: ${url}
HTML CONTENT (truncated if long):
"""
${html.slice(0, 15000)}
"""

OUTPUT JSON FORMAT:
{
  "title": "",
  "ingredients": ["", ""],
  "steps": ["", ""],
  "image": "",
  "sourceName": ""
}
`;

  const completion = await axios.post(
    "https://api.openai.com/v1/chat/completions",
    {
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0
    },
    { headers: { Authorization: `Bearer ${apiKey}` } }
  );

  let json;
  try {
    json = JSON.parse(completion.data.choices[0].message.content);
  } catch (e) {
    throw new Error("Failed to parse recipe extraction JSON");
  }

  // Generate checksum for update detection
  const checksum = crypto
    .createHash("sha256")
    .update(JSON.stringify(json))
    .digest("hex");

  return { ...json, url, checksum };
}
