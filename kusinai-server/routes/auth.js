import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Recipe from "../models/Recipe.js";

const router = express.Router();

// ✅ Auth Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user; // contains { id, name, email }
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

// ✅ Register
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();

    res.status(201).json({ message: "User registered successfully!" });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

// ✅ Login
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "User not found" });

    if (user.isBanned) {
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // Include role in JWT payload
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      token,
      user: { id: user._id, name: user.name, email: user.email },
    });
  } catch (err) {
    console.error("❌ Login Error:", err);
    res.status(500).json({ message: "Server error during login" });
  }
});

// ✅ Save Notes
router.put("/notes", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const updatedUser = await User.findByIdAndUpdate(
      decoded.id,
      { notes: req.body.notes },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found" });

    res.json({ message: "Notes saved successfully", notes: updatedUser.notes });
  } catch (err) {
    console.error("❌ Error saving notes:", err);
    res.status(500).json({ message: "Error saving notes" });
  }
});

// ✅ Fetch Notes
router.get("/notes", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ notes: user.notes || "" });
  } catch (err) {
    console.error("❌ Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

// ✅ PUT Favorites (Update entire list)
router.put("/favorites", async (req, res) => {
  try {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    const { favorites } = req.body;
    user.favorites = favorites;
    await user.save();

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Error updating favorites:", err);
    res.status(500).json({ message: "Error updating favorites" });
  }
});

// ✅ GET Favorites (Populated)
router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found" });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

router.get("/comments", authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({}, "title comments");

    const userComments = [];

    recipes.forEach(recipe => {
      recipe.comments.forEach(comment => {
        if (comment.userId?.toString() === req.user.id) {
          userComments.push({
            recipeId: recipe._id,
            recipeTitle: recipe.title,
            commentId: comment._id,
            comment: comment.comment,
            createdAt: comment.createdAt,
            profileImage: comment.profileImage || "/default-profile.png",
            type: "comment"
          });
        }

        comment.replies.forEach(reply => {
          if (reply.userId?.toString() === req.user.id) {
            userComments.push({
              recipeId: recipe._id,
              recipeTitle: recipe.title,
              commentId: comment._id,
              replyId: reply._id,
              comment: reply.comment,
              createdAt: reply.createdAt,
              profileImage: reply.profileImage || "/default-profile.png",
              type: "reply"
            });
          }
        });
      });
    });

    res.json(userComments);
  } catch (err) {
    console.error("❌ Error fetching user comments:", err);
    res.status(500).json({ message: "Server error" });
  }
});

export { authenticateToken };
export default router;
