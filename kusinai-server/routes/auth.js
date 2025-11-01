import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import nodemailer from "nodemailer";
import validator from "validator";
import dns from "dns";
import User from "../models/User.js";
import fetch from "node-fetch";
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

// Utility: send verification email
async function sendVerificationEmail(user, frontendURL) {
  const token = jwt.sign(
    { id: user._id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "24h" } // expires in 24 hours
  );

  const verifyLink = `${frontendURL}/verify-email?token=${token}`;

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"KusinAI 🍳" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your KusinAI account",
    html: `
      <h2>Welcome to KusinAI, ${user.name}!</h2>
      <p>Please verify your email by clicking the button below (expires in 24 hours):</p>
      <a href="${verifyLink}"
         style="background-color:#22c55e;color:white;padding:10px 16px;border-radius:6px;text-decoration:none;font-weight:bold;">
         Verify Email
      </a>
      <p>If you didn’t create this account, please ignore this email.</p>
    `,
  });
}

// Register route
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // 1️⃣ Basic format validation
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    // 2️⃣ Check MX records
    const domain = email.split("@")[1];
    try {
      const mx = await dns.promises.resolveMx(domain);
      if (!mx || mx.length === 0)
        return res
          .status(400)
          .json({ message: "Email domain is not valid or cannot receive messages" });
    } catch {
      return res
        .status(400)
        .json({ message: "Email domain is not valid or cannot receive messages" });
    }

    // 3️⃣b Optional: Verify that email address actually exists using MailboxLayer API
try {
  const verifyRes = await fetch(
    `https://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_KEY}&email=${email}`
  );
  const verifyData = await verifyRes.json();

  if (!verifyData.format_valid || !verifyData.mx_found || !verifyData.smtp_check) {
    return res.status(400).json({
      message: "Please use a valid and existing email address.",
    });
  }
} catch (err) {
  console.error("📧 MailboxLayer API error:", err);
  return res.status(500).json({ message: "Failed to verify email address." });
}

    // 3️⃣ Check duplicates
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered" });

    // 4️⃣ Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });
    await user.save();

    // 5️⃣ Send verification email
    await sendVerificationEmail(user, process.env.FRONTEND_URL);

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account (expires in 24 hours).",
    });
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
    if (!user)
      return res.status(400).json({ message: "User not found" });

    if (user.isBanned)
      return res.status(403).json({ message: "Your account has been banned. Please contact support." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials" });

    // 🔒 If not verified, resend verification email
    if (!user.isVerified) {
      await sendVerificationEmail(user, process.env.FRONTEND_URL);
      return res.status(403).json({
        message: "Email not verified. A new verification link has been sent to your inbox.",
      });
    }

    // ✅ If verified, issue login token
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


// Verify Email
router.get("/verify-email", async (req, res) => {
  const { token } = req.query;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);
    if (!user)
      return res.status(404).json({ message: "User not found or already deleted" });

    if (user.isVerified)
      return res.status(200).json({ message: "Email already verified" });

    user.isVerified = true;
    await user.save();

    res.status(200).json({ message: "✅ Email verified successfully! You can now log in." });
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(400).json({ message: "Verification link expired. Please log in to resend a new link." });
    }
    console.error("❌ Verification error:", err);
    res.status(400).json({ message: "Invalid verification token" });
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
