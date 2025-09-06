import express from "express";
import Recipe from "../models/Recipe.js";
import User from "../models/User.js"; // ✅ FIXED: Import User model
import jwt from "jsonwebtoken";
import { authenticateToken } from "../routes/auth.js";

const router = express.Router();

// DELETE a recipe by ID (admin only)
router.delete("/:id", authenticateToken, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const recipe = await Recipe.findByIdAndDelete(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });
    res.json({ message: "Recipe deleted" });
  } catch (err) {
    res.status(500).json({ message: "Error deleting recipe" });
  }
});

// GET all recipes
router.get("/", async (req, res) => {
  try {
    const recipes = await Recipe.find();
    res.json(recipes);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Ingredient Search
router.get("/search", async (req, res) => {
  const ingredientsQuery = req.query.ingredients;
  if (!ingredientsQuery) {
    return res.status(400).json({ error: "No ingredients provided" });
  }
  const ingredientList = ingredientsQuery
    .split(",")
    .map((ing) => ing.trim())
    .filter((ing) => ing !== "");

  try {
    const queryConditions = ingredientList.map((ingredient) => ({
      ingredients: { $regex: ingredient, $options: "i" },
    }));

    const recipes = await Recipe.find({ $and: queryConditions });
    res.json(recipes);
  } catch (err) {
    console.error("❌ Search error:", err);
    res.status(500).json({ error: "Search failed" });
  }
});

// GET recipe by ID
router.get("/id/:id", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ error: "Recipe not found" });
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET recipe by Title
router.get("/title/:title", async (req, res) => {
  try {
    const decodedTitle = decodeURIComponent(req.params.title);
    const recipe = await Recipe.findOne({
      title: { $regex: `^${decodedTitle}$`, $options: "i" },
    });
    if (!recipe) {
      return res.status(404).json({ message: "Recipe not found" });
    }
    res.json(recipe);
  } catch (err) {
    res.status(500).json({ message: "Server error" });
  }
});

// POST a comment
router.post("/:id/comments", authenticateToken, async (req, res) => {
  try {
    const decoded = req.user;
    const recipe = await Recipe.findById(req.params.id);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const user = await User.findById(decoded.id);

    const newComment = {
      userId: user._id,
      username: user.name,
      profileImage: user.profileImage,
      comment: req.body.comment,
    };

    recipe.comments.push(newComment);
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error("❌ Error posting comment:", err);
    res.status(500).json({ message: "Error posting comment" });
  }
});

// GET comments
// GET comments with populated user info
router.get("/:id/comments", async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.id)
      .populate({
        path: "comments.userId",
        select: "name profileImage"
      })
      .populate({
        path: "comments.replies.userId",
        select: "name profileImage"
      });
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    // Map comments to include latest user info
    const commentsWithUser = recipe.comments.map(comment => {
      const user = comment.userId && typeof comment.userId === 'object' ? comment.userId : null;
      return {
        ...comment.toObject(),
        username: user ? user.name : comment.username,
        profileImage: user ? user.profileImage : comment.profileImage,
        replies: comment.replies.map(reply => {
          const replyUser = reply.userId && typeof reply.userId === 'object' ? reply.userId : null;
          return {
            ...reply.toObject(),
            username: replyUser ? replyUser.name : reply.username,
            profileImage: replyUser ? replyUser.profileImage : reply.profileImage,
          };
        })
      };
    });
    res.json(commentsWithUser);
  } catch (err) {
    console.error("❌ Error fetching comments:", err);
    res.status(500).json({ message: "Error fetching comments" });
  }
});

// Edit a comment
router.put("/:recipeId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Allow admin to edit any comment
    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    comment.comment = req.body.comment;
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error("❌ Error editing comment:", err);
    res.status(500).json({ message: "Error editing comment" });
  }
});

// Delete a comment
router.delete("/:recipeId/comments/:commentId", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    // Allow admin to delete any comment
    if (comment.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    comment.deleteOne();
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error("❌ Error deleting comment:", err);
    res.status(500).json({ message: "Error deleting comment" });
  }
});

// Post a reply
router.post("/:recipeId/comments/:commentId/replies", authenticateToken, async (req, res) => {
  try {
    const { recipeId, commentId } = req.params;
    const { comment: replyText } = req.body;

    const recipe = await Recipe.findById(recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const parentComment = recipe.comments.id(commentId);
    if (!parentComment) return res.status(404).json({ message: "Comment not found" });

    const user = await User.findById(req.user.id);

    const reply = {
      userId: user._id,
      username: user.name,
      profileImage: user.profileImage,
      comment: replyText,
    };

    parentComment.replies.push(reply);
    await recipe.save();
    res.json(parentComment.replies);
  } catch (err) {
    console.error("❌ Error sending reply:", err);
    res.status(500).json({ message: "Error sending reply" });
  }
});

// Edit a reply
router.put("/:recipeId/comments/:commentId/replies/:replyId", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // Allow admin to edit any reply
    if (reply.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    reply.comment = req.body.comment;
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error("❌ Error editing reply:", err);
    res.status(500).json({ message: "Error editing reply" });
  }
});

// Delete a reply
router.delete("/:recipeId/comments/:commentId/replies/:replyId", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    // Allow admin to delete any reply
    if (reply.userId.toString() !== req.user.id && req.user.role !== "admin")
      return res.status(403).json({ message: "Unauthorized" });

    reply.deleteOne();
    await recipe.save();
    res.json(recipe.comments);
  } catch (err) {
    console.error("❌ Error deleting reply:", err);
    res.status(500).json({ message: "Error deleting reply" });
  }
});

// ✅ Like/Unlike a comment
router.post("/:recipeId/comments/:commentId/like", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const userId = req.user.id;
    const index = comment.likes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      comment.likes.push(userId);
    } else {
      comment.likes.splice(index, 1);
    }

    await recipe.save();
    res.json({ message: "Like updated", likes: comment.likes.length });
  } catch (err) {
    console.error("❌ Error in like route:", err);
    res.status(500).json({ message: "Error toggling like" });
  }
});

// ✅ Like/Unlike a reply
router.post("/:recipeId/comments/:commentId/replies/:replyId/like", authenticateToken, async (req, res) => {
  try {
    const recipe = await Recipe.findById(req.params.recipeId);
    if (!recipe) return res.status(404).json({ message: "Recipe not found" });

    const comment = recipe.comments.id(req.params.commentId);
    if (!comment) return res.status(404).json({ message: "Comment not found" });

    const reply = comment.replies.id(req.params.replyId);
    if (!reply) return res.status(404).json({ message: "Reply not found" });

    const userId = req.user.id;
    const index = reply.likes.findIndex((id) => id.toString() === userId);

    if (index === -1) {
      reply.likes.push(userId);
    } else {
      reply.likes.splice(index, 1);
    }

    await recipe.save();
    res.json({ message: "Like updated", likes: reply.likes.length });
  } catch (err) {
    console.error("❌ Error in like reply route:", err);
    res.status(500).json({ message: "Error toggling like on reply" });
  }
});

// Admin: Create recipe
router.post("/", async (req, res) => {
  try {
    const newRecipe = new Recipe(req.body);
    await newRecipe.save();
    res.status(201).json(newRecipe);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Edit a recipe by ID (admin only)
router.put("/:id", authenticateToken, async (req, res) => {
  try {
    // Only allow admin
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Unauthorized" });
    }
    const updatedRecipe = await Recipe.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecipe) return res.status(404).json({ message: "Recipe not found" });
    res.json(updatedRecipe);
  } catch (err) {
    res.status(500).json({ message: "Error updating recipe" });
  }
});

export default router;
