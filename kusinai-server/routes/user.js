/*
  File: routes/user.js
  Purpose: User profile and account management API endpoints.
  Responsibilities:
  - Fetch/update user profiles, preferences, roles (admin-protected operations as needed).
  - Enforce authentication/authorization middleware for protected routes.
  Notes: Keep validation and policy checks clear and explicit.
*/
import express from "express";
import User from "../models/User.js";
import jwt from "jsonwebtoken";

const router = express.Router();

// GET Profile
router.get("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
});

// UPDATE Profile (username, image, notes)
router.put("/profile", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { username, profileImage, notes } = req.body;

    const updated = await User.findByIdAndUpdate(
      decoded.id,
      { username, profileImage, notes },
      { new: true }
    ).select("-password");

    res.json(updated);
  } catch (err) {
    res.status(500).json({ message: "Update failed" });
  }
});


// GET all comments made by the user across all recipes
import Recipe from "../models/Recipe.js";
router.get("/profile/comments", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const userId = decoded.id;

    // Find all recipes with comments by this user
    const recipes = await Recipe.find({ "comments.userId": userId }, "_id title comments");
    let userComments = [];
    recipes.forEach(recipe => {
      recipe.comments.forEach(comment => {
        if (comment.userId && comment.userId.toString() === userId) {
          userComments.push({
            recipeId: recipe._id,
            recipeTitle: recipe.title,
            ...comment.toObject()
          });
        }
      });
    });
    res.json({ comments: userComments });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch user comments" });
  }
});

export default router;
