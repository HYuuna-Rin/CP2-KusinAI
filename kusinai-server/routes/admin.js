import express from "express";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";
import { authenticateToken, isAdmin } from "./auth.js";

const router = express.Router();

// Protect all admin routes
router.use(authenticateToken);
router.use(isAdmin);

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
    // If user is now banned, remove their interactions (likes, comments, replies)
    if (user.isBanned) {
      const uid = String(user._id);
      const recipes = await Recipe.find();
      for (const r of recipes) {
        let changed = false;

        // Remove comments authored by user
        const beforeComments = r.comments.length;
        r.comments = r.comments.filter(c => String(c.userId) !== uid);
        if (r.comments.length !== beforeComments) changed = true;

        // For remaining comments, remove replies by user and remove likes by user
        r.comments.forEach(comment => {
          const beforeReplies = comment.replies.length;
          comment.replies = comment.replies.filter(rep => String(rep.userId) !== uid);
          if (comment.replies.length !== beforeReplies) changed = true;

          const beforeLikes = comment.likes.length;
          comment.likes = comment.likes.filter(id => String(id) !== uid);
          if (comment.likes.length !== beforeLikes) changed = true;

          // also clean likes inside replies
          comment.replies.forEach(rep => {
            const brl = rep.likes.length;
            rep.likes = rep.likes.filter(id => String(id) !== uid);
            if (rep.likes.length !== brl) changed = true;
          });
        });

        if (changed) await r.save();
      }
    }

    res.json({ message: `User is now ${user.isBanned ? "banned" : "active"}` });
  } catch (err) {
    res.status(500).json({ message: "Failed to update user" });
  }
});

// Delete user
router.delete("/users/:id", async (req, res) => {
  try {
    const uid = String(req.params.id);

    // Remove user interactions from recipes
    const recipes = await Recipe.find();
    for (const r of recipes) {
      let changed = false;

      // Remove comments authored by user
      const beforeComments = r.comments.length;
      r.comments = r.comments.filter(c => String(c.userId) !== uid);
      if (r.comments.length !== beforeComments) changed = true;

      // For remaining comments, remove replies by user and remove likes by user
      r.comments.forEach(comment => {
        const beforeReplies = comment.replies.length;
        comment.replies = comment.replies.filter(rep => String(rep.userId) !== uid);
        if (comment.replies.length !== beforeReplies) changed = true;

        const beforeLikes = comment.likes.length;
        comment.likes = comment.likes.filter(id => String(id) !== uid);
        if (comment.likes.length !== beforeLikes) changed = true;

        // also clean likes inside replies
        comment.replies.forEach(rep => {
          const brl = rep.likes.length;
          rep.likes = rep.likes.filter(id => String(id) !== uid);
          if (rep.likes.length !== brl) changed = true;
        });
      });

      if (changed) await r.save();
    }

    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "User deleted and interactions removed" });
  } catch (err) {
    res.status(500).json({ message: "Failed to delete user" });
  }
});

export default router;
