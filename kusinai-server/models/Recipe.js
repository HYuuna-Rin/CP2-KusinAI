/*
  File: models/Recipe.js
  Purpose: Mongoose schema/model for recipes managed by the system.
  Responsibilities:
  - Define recipe fields (title, ingredients, instructions, nutrition, media, ownership).
  - Support querying and persistence for recipe-related features.
  Notes: Keep validation and indexes here; heavy logic belongs in services.
*/
import mongoose from "mongoose";

const replySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  profileImage: { type: String, default: "" },
  comment: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now }
});

const commentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  username: String,
  profileImage: { type: String, default: "" },
  comment: String,
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  replies: [replySchema],
  createdAt: { type: Date, default: Date.now }
});

const recipeSchema = new mongoose.Schema({
  title: String,
  region: String,

  // ⭐ ADDED: Automatic extraction ingredients
  ingredients: [String],

  // ⭐ ADDED: Automatic extraction steps
  steps: [String],

  nutrition: {
    calories: { type: Number, default: 0 },
    protein: { type: Number, default: 0 },
    fat: { type: Number, default: 0 },
    carbs: { type: Number, default: 0 },
    servings: { type: Number, default: 1 },
    servingSize: { type: String, default: "" },
    estimatedServings: { type: Boolean, default: false },
    perServing: {
      calories: { type: Number, default: 0 },
      protein: { type: Number, default: 0 },
      fat: { type: Number, default: 0 },
      carbs: { type: Number, default: 0 }
    }
  },

  substitutions: [String],
  method: String,
  image: String,

  comments: [commentSchema],

  // ---------------------------------------------
  // ⭐ NEW FIELDS FOR RECIPE AUTO-IMPORT SYSTEM
  // ---------------------------------------------

  // 🔗 Original page URL (required for imported recipes)
  sourceUrl: { type: String, default: null },

  // 🧑‍🍳 Website name, e.g. "Panlasang Pinoy"
  sourceName: { type: String, default: null },

  // 🆔 Used to detect if the source page changed
  checksum: { type: String, default: null },

  // 📅 Timestamp of last import/update from URL
  lastImportedAt: { type: Date, default: null },

}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;
