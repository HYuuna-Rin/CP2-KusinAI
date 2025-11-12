// routes/nutritionRoutes.js
import express from "express";
import axios from "axios";
import Recipe from "../models/Recipe.js";

const router = express.Router();
// trim the env value in case there are accidental spaces around the value
const FDC_KEY = process.env.FDC_API_KEY?.trim();
const USDA_SEARCH_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";
const USDA_FOOD_URL = "https://api.nal.usda.gov/fdc/v1/food";

// small helper for unit guessing
const UNIT_TO_GRAMS = {
  g: 1,
  gram: 1,
  grams: 1,
  kg: 1000,
  kilogram: 1000,
  lb: 454,
  oz: 28.35,
  tbsp: 15,
  tablespoon: 15,
  tsp: 5,
  teaspoon: 5,
  cup: 240
};

// Small local fallback nutrition database (per 100 g). Use when USDA lookup fails or
// doesn't provide nutrients. These are approximate values.
const FALLBACKS = {
  'soy sauce': { calories: 53, protein: 8.1, fat: 0.6, carbs: 4.9 },
  'vinegar': { calories: 18, protein: 0, fat: 0, carbs: 0.1 },
  'cooking oil': { calories: 884, protein: 0, fat: 100, carbs: 0 },
  'oil': { calories: 884, protein: 0, fat: 100, carbs: 0 },
  'garlic': { calories: 149, protein: 6.4, fat: 0.5, carbs: 33 },
  'peppercorn': { calories: 255, protein: 10.4, fat: 3.3, carbs: 64 },
  'bay leaf': { calories: 313, protein: 7.6, fat: 7.3, carbs: 75 },
  'water': { calories: 0, protein: 0, fat: 0, carbs: 0 },
  'soy': { calories: 173, protein: 16.6, fat: 9.0, carbs: 9.9 }
};

function getFallback(key) {
  if (!key) return null;
  const k = key.toLowerCase().trim();
  if (FALLBACKS[k]) return FALLBACKS[k];
  // try substring matches (e.g., 'soy sauce' -> 'soy')
  for (const fk of Object.keys(FALLBACKS)) {
    if (k.includes(fk)) return FALLBACKS[fk];
  }
  return null;
}

// extract number of grams if included in text like “200 g sugar”
function parseAmount(text) {
  if (!text || typeof text !== "string") return 100;
  const s = text.trim();
  // handle common fractions like 1/2, 3/4, and mixed numbers like 1 1/2
  const fracMatch = s.match(/^(\d+)(?:\s+(\d+)\/(\d+))?\s*(g|gram|grams|kg|kilogram|lb|oz|cup|cups|tbsp|tablespoon|tsp|teaspoon|pcs|pc|cloves|slice|slices)?/i);
  if (fracMatch) {
    let whole = parseInt(fracMatch[1], 10) || 0;
    const numerator = fracMatch[2] ? parseInt(fracMatch[2], 10) : 0;
    const denom = fracMatch[3] ? parseInt(fracMatch[3], 10) : 1;
    const fraction = numerator && denom ? numerator / denom : 0;
    const qty = whole + fraction || 0;
    const unit = (fracMatch[4] || "").toLowerCase();
    if (qty > 0 && UNIT_TO_GRAMS[unit]) return qty * UNIT_TO_GRAMS[unit];
    if (qty > 0 && unit === "cup") return qty * UNIT_TO_GRAMS["cup"];
    if (qty > 0 && unit) return qty * (UNIT_TO_GRAMS[unit] || 1);
  }

  // fallback: try to extract a decimal number like 200 or 0.5
  const match = s.match(/(\d+(\.\d+)?)/);
  if (match) {
    const qty = parseFloat(match[1]);
    // try to detect unit separately
    const unitMatch = s.match(/(g|gram|grams|kg|kilogram|lb|oz|cup|cups|tbsp|tablespoon|tsp|teaspoon)/i);
    const unit = unitMatch ? unitMatch[1].toLowerCase() : "g";
    return qty * (UNIT_TO_GRAMS[unit] || 1);
  }

  // default 100 g if unspecified
  return 100;
}

// Normalize ingredient for searching: remove quantities, parentheses and common descriptors
function normalizeIngredient(text) {
  if (!text || typeof text !== "string") return text;
  let t = text;
  // remove parentheses
  t = t.replace(/\([^)]*\)/g, "");
  // remove leading quantities and units (e.g. '1/2 cup', '2 pcs', '200g')
  t = t.replace(/^\s*[\d\s\/\.\-]+\s*(kg|g|grams|gram|kilogram|lb|oz|cup|cups|tbsp|tablespoon|tsp|teaspoon|pcs|pc|cloves|slice|slices|tablespoons|teaspoons)?\b\s*/i, "");
  // remove common adjectives
  t = t.replace(/\b(fresh|chopped|minced|diced|ground|whole|sliced|peeled|grated|cooked|raw|freshly)\b/gi, "");
  // remove extraneous commas and extra spaces
  t = t.replace(/[,\-]+/g, " ").replace(/\s+/g, " ").trim();
  return t || text;
}

// search USDA for ingredient
async function searchFood(query) {
  try {
    const res = await axios.get(USDA_SEARCH_URL, {
      params: { api_key: FDC_KEY, query, pageSize: 1 }
    });
    // diagnostic: log minimal metadata (do not log the API key)
    console.log(`    [USDA] search status=${res.status} query="${query}" hits=${res.data?.totalHits ?? res.data?.foods?.length ?? 0}`);
    return res.data.foods?.[0];
  } catch {
    // try to capture the axios error shape without revealing sensitive headers/keys
    return null;
  }
}

// get detailed nutrition by fdcId
async function getFood(fdcId) {
  try {
    const res = await axios.get(`${USDA_FOOD_URL}/${fdcId}`, {
      params: { api_key: FDC_KEY }
    });
    console.log(`    [USDA] getFood status=${res.status} fdcId=${fdcId}`);
    return res.data;
  } catch (err) {
    // log a compact error summary (avoid dumping the key)
    console.error(`    [USDA] getFood error for fdcId=${fdcId}:`, err?.response?.status || err?.message || err);
    throw err;
  }
}

// extract basic nutrients
function extractNutrients(food) {
  const n = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  const nutrients = (food && (food.foodNutrients || food.foodNutrients)) || [];
  for (const f of nutrients) {
    // support different shapes: nutrientName or nutrient?.name
    const nameRaw = f.nutrientName || f.nutrient?.name || f.nutrient?.nutrientName;
    const name = nameRaw ? String(nameRaw).toLowerCase() : undefined;
    const val = typeof f.value === "number" ? f.value : (f.amount || 0);
    const unit = (f.unitName || f.nutrient?.unitName || "").toLowerCase();
    if (name?.includes("energy") && unit === "kcal") n.calories = val;
    else if (name?.includes("protein")) n.protein = val;
    else if (name?.includes("carbohydrate") || name?.includes("carb")) n.carbs = val;
    else if (name?.includes("fat")) n.fat = val;
  }
  return n;
}

// scale nutrients per 100 g → to grams used
function scale(n, grams) {
  const factor = grams / 100;
  return {
    calories: n.calories * factor,
    protein: n.protein * factor,
    fat: n.fat * factor,
    carbs: n.carbs * factor
  };
}

// POST /api/recipes/:id/nutrition
router.post("/:id/nutrition", async (req, res) => {
  try {
    // report presence of the key (do not log the key itself)
    console.log(`ℹ️ FDC_API_KEY present: ${!!FDC_KEY} ${FDC_KEY ? `(len=${FDC_KEY.length})` : ""}`);
    if (!FDC_KEY) {
      console.error("❌ FDC_API_KEY not set. Set FDC_API_KEY in .env to use USDA FDC lookup.");
      return res.status(500).json({ message: "Failed to calculate nutrition (missing FDC_API_KEY)" });
    }
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    console.log(`ℹ️ Calculating nutrition for recipe ${recipe._id} (${recipe.title}), ingredients:`, recipe.ingredients);
  let totals = { calories: 0, protein: 0, fat: 0, carbs: 0 };
  let totalGrams = 0;
    for (const item of recipe.ingredients || []) {
      try {
  const grams = parseAmount(item);
        const query = normalizeIngredient(item);
        console.log(`  → processing ingredient: "${item}" (assumed ${grams} g) → search="${query}"`);
  totalGrams += grams;
        const search = await searchFood(query || item);
        if (!search) {
          // try a local fallback before skipping
          const fb = getFallback(query || item);
          if (fb) {
            console.log(`    🔁 Using fallback nutrition for: ${query || item}`);
            const scaled = scale(fb, grams);
            totals.calories += scaled.calories;
            totals.protein += scaled.protein;
            totals.fat += scaled.fat;
            totals.carbs += scaled.carbs;
            continue;
          }
          console.warn(`    ⚠️ No USDA match for: ${item} (query="${query}")`);
          continue;
        }
        console.log(`    ✅ USDA match: ${search.description || search.foodName} (fdcId=${search.fdcId})`);

        // attempt to fetch the detailed food. If that fails (404 etc), fall back to using the
        // search result's nutrients (if available) before giving up.
        let food = null;
        try {
          food = await getFood(search.fdcId);
        } catch (fetchErr) {
          console.warn(`    ⚠️ getFood failed for fdcId=${search.fdcId}, trying to use search result nutrients as fallback.`);
          if (search.foodNutrients && search.foodNutrients.length) {
            food = search; // extractNutrients reads food.foodNutrients
          } else {
            console.warn(`    ⚠️ No nutrients in search result for ${item} (fdcId=${search.fdcId})`);
            continue;
          }
        }

        const n = extractNutrients(food);
        // if the USDA result has no nutrients, try fallback
        if ((!n.calories && !n.protein && !n.fat && !n.carbs)) {
          const fb = getFallback(query || item);
          if (fb) {
            console.log(`    🔁 USDA returned empty nutrients, using fallback for ${query || item}`);
            const scaled = scale(fb, grams);
            totals.calories += scaled.calories;
            totals.protein += scaled.protein;
            totals.fat += scaled.fat;
            totals.carbs += scaled.carbs;
            continue;
          }
        }
        const scaled = scale(n, grams);
        totals.calories += scaled.calories;
        totals.protein += scaled.protein;
        totals.fat += scaled.fat;
        totals.carbs += scaled.carbs;
      } catch (innerErr) {
        console.error(`    ❌ Error processing ingredient "${item}":`, innerErr && innerErr.message ? innerErr.message : innerErr);
        // continue with other ingredients
      }
    }

    // round
    for (const k in totals) totals[k] = Math.round(totals[k] * 10) / 10;

    // determine servings:
    // Priority: 1) client-provided override in req.body.servings  2) recipe.nutrition.servings  3) estimate from grams
    const requestedServings = req.body && req.body.servings ? Number(req.body.servings) : 0;
    const existingServings = (recipe.nutrition && recipe.nutrition.servings) ? Number(recipe.nutrition.servings) : 0;
    let servings = 1;
    let estimated = false;
    if (requestedServings && requestedServings > 0) {
      servings = requestedServings;
      estimated = false;
    } else if (existingServings && existingServings > 0) {
      servings = existingServings;
      estimated = false;
    } else {
      const TYPICAL_SERVING_GRAMS = 200; // heuristic: one serving ~200g
      servings = Math.max(1, Math.round(totalGrams / TYPICAL_SERVING_GRAMS));
      if (!servings || servings < 1) servings = 1;
      estimated = true;
    }

    // compute per-serving breakdown
    const perServing = {
      calories: Math.round((totals.calories / servings) * 10) / 10,
      protein: Math.round((totals.protein / servings) * 10) / 10,
      fat: Math.round((totals.fat / servings) * 10) / 10,
      carbs: Math.round((totals.carbs / servings) * 10) / 10
    };

    console.log(`ℹ️ Nutrition totals calculated:`, totals, `servings=${servings}`, `perServing=`, perServing);

  recipe.nutrition = { ...totals, servings, perServing, servingSize: recipe.nutrition?.servingSize || recipe.nutrition?.servingSize || "", estimatedServings: estimated };
    await recipe.save();

    res.json({ message: "Nutrition calculated", nutrition: recipe.nutrition });
  } catch (err) {
    console.error("❌ Nutrition error:", err && err.stack ? err.stack : err);
    res.status(500).json({ message: "Failed to calculate nutrition" });
  }
});

export default router;
