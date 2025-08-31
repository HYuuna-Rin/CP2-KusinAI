import express from "express";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

const router = express.Router();

// Get admin dashboard stats
router.get("/stats", async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalRecipes = await Recipe.countDocuments();
    // Count total comments and replies
    const recipes = await Recipe.find({}, "comments");
    let totalComments = 0;
    let totalReplies = 0;
    recipes.forEach(recipe => {
      totalComments += recipe.comments.length;
      recipe.comments.forEach(comment => {
        totalReplies += comment.replies.length;
      });
    });
    res.json({ totalUsers, totalRecipes, totalComments, totalReplies });
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch stats" });
  }
});

// Get all users
router.get("/users", async (req, res) => {
  try {
    const users = await User.find({}, "_id name email role isBanned createdAt profileImage");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch users" });
  }
});

// Ban or unban user (using isBanned field)
router.put("/users/:id/toggle-ban", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    user.isBanned = !user.isBanned;
    await user.save();
    res.json({ message: `User is now ${user.isBanned ? "banned" : "active"}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
