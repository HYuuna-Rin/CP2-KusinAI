/*
  File: scripts/migrateNutritionNumbers.js
  Purpose: Data migration to adjust/normalize nutrition fields.
  Responsibilities:
  - Traverse recipe documents and migrate nutrition-related numbers or schema changes.
  - Provide idempotent runs when possible; log changes for auditing.
  Notes: Test on staging/snapshots before production.
*/
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Recipe from '../models/Recipe.js';

dotenv.config();

async function toNumber(v) {
  if (v === undefined || v === null) return 0;
  if (typeof v === 'number') return v;
  if (typeof v === 'string') {
    // try to extract first number
    const m = v.match(/-?\d+(?:\.\d+)?/);
    if (m) return parseFloat(m[0]);
  }
  return 0;
}

async function run() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log('Connected to DB');
  const all = await Recipe.find();
  console.log(`Found ${all.length} recipes`);
  for (const r of all) {
    const n = r.nutrition || {};
    const calories = await toNumber(n.calories);
    const protein = await toNumber(n.protein);
    const fat = await toNumber(n.fat);
    const carbs = await toNumber(n.carbs);
    const servings = n.servings ? Number(n.servings) : 1;
    const perServing = {
      calories: Math.round((calories / (servings || 1)) * 10) / 10,
      protein: Math.round((protein / (servings || 1)) * 10) / 10,
      fat: Math.round((fat / (servings || 1)) * 10) / 10,
      carbs: Math.round((carbs / (servings || 1)) * 10) / 10
    };
    const updated = { calories, protein, fat, carbs, servings, perServing, servingSize: n.servingSize || "" };
    r.nutrition = updated;
    await r.save();
    console.log(`Updated ${r._id} ->`, updated);
  }
  console.log('Done');
  process.exit(0);
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
