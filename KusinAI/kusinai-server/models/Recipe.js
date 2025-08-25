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
  ingredients: [String],
  steps: [String],
  nutrition: {
    calories: String,
    protein: String,
    fat: String,
    carbs: String,
  },
  substitutions: [String],
  method: String,
  image: String,
  comments: [commentSchema],
}, { timestamps: true });

const Recipe = mongoose.model("Recipe", recipeSchema);
export default Recipe;