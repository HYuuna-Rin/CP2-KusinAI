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

/* =========================================================
   ✅ AUTH MIDDLEWARE
   ========================================================= */
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];

  if (!token) {
    return res
      .status(401)
      .json({ error: "Access denied. No token provided." });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.error("❌ JWT verification failed:", err.message);
      return res
        .status(403)
        .json({ error: "Invalid or expired token. Please log in again." });
    }

    req.user = user; // decoded payload: { id, name, email, role }
    next();
  });
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Access denied. Admins only." });
  }
  next();
};

/* =========================================================
   📧 EMAIL VERIFICATION UTILITY
   ========================================================= */
async function sendVerificationEmail(user, frontendURL) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
    throw new Error("Email configuration missing");
  }

  // For code-based verification: we won't use the token link. This helper remains
  // for compatibility but primary verification will use a numeric code sent by email.
  const cleanFrontend = frontendURL ? frontendURL.replace(/\/$/, "") : "";
  const verifyLinkWeb = cleanFrontend ? `${cleanFrontend}/openapp?token=REDACTED` : ``;

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  transporter.verify((err) => {
    if (err) console.error("❌ Email transport error:", err);
    else console.log("✅ Email transporter ready");
  });

  // NOTE: sendVerificationEmail is retained for backward compatibility but the
  // primary flow now uses a numeric 6-digit code. For safety we will not send
  // token links from here anymore.
  await transporter.sendMail({
    from: `"KusinAI 🍳" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Verify your KusinAI account",
    html: `
      <h2>Welcome to <span style="color:#16a34a">KusinAI</span>, ${user.name}!</h2>
      <p>If you received this email by mistake, ignore it.</p>
      <p style="margin-top:16px;color:#666;">Thanks,<br/>KusinAI Team</p>
    `,
  });
}

// generate a 6-digit numeric code as a string
function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

// send numeric verification code email and save code+expiry on user
async function sendVerificationCodeEmail(user) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error("❌ Missing EMAIL_USER or EMAIL_PASS in .env");
    throw new Error("Email configuration missing");
  }

  const code = generateCode();
  // Expires in 30 minutes
  const expires = new Date(Date.now() + 30 * 60 * 1000); // 30 minutes

  // persist to user
  user.verificationCode = code;
  user.verificationExpires = expires;
  await user.save();

  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || "smtp.gmail.com",
    port: process.env.EMAIL_PORT || 465,
    secure: true,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

    const html = `
    <h2>Verify your KusinAI account</h2>
    <p>Hi ${user.name},</p>
    <p>Your verification code is:</p>
    <p style="font-size:24px;font-weight:bold;color:#16a34a">${code}</p>
    <p>This code expires in 30 minutes. Enter it in the KusinAI app to verify your email.</p>
    <p>If you did not request this, ignore this email.</p>
  `;

  await transporter.sendMail({
    from: `"KusinAI 🍳" <${process.env.EMAIL_USER}>`,
    to: user.email,
    subject: "Your KusinAI verification code",
    html,
  });
}


/* =========================================================
   🧾 REGISTER
   ========================================================= */
router.post("/register", async (req, res) => {
  const { name, email, password } = req.body;

  try {
    // Basic email validation
    if (!validator.isEmail(email))
      return res.status(400).json({ message: "Invalid email format" });

    // Strong password validation
    const passRule =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
    if (!passRule.test(password)) {
      return res.status(400).json({
        message:
          "Password must be at least 8 characters and include uppercase, lowercase, a number and a special character.",
      });
    }

    // MX record validation
    const domain = email.split("@")[1];
    try {
      const mx = await dns.promises.resolveMx(domain);
      if (!mx || mx.length === 0)
        return res
          .status(400)
          .json({ message: "Email domain is not valid or cannot receive mail." });
    } catch {
      return res
        .status(400)
        .json({ message: "Email domain is not valid or cannot receive mail." });
    }

    // MailboxLayer API verification (optional)
    try {
      const verifyRes = await fetch(
        `https://apilayer.net/api/check?access_key=${process.env.MAILBOXLAYER_KEY}&email=${email}`
      );
      const verifyData = await verifyRes.json();
      if (
        !verifyData.format_valid ||
        !verifyData.mx_found ||
        !verifyData.smtp_check
      ) {
        return res
          .status(400)
          .json({ message: "Please use a valid and existing email address." });
      }
    } catch (err) {
      console.error("📧 MailboxLayer API error:", err);
      return res
        .status(500)
        .json({ message: "Failed to verify email address." });
    }

    // Check duplicate user
    const existingUser = await User.findOne({ email });
    if (existingUser)
      return res.status(400).json({ message: "Email already registered." });

    // Create user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      name,
      email,
      password: hashedPassword,
      isVerified: false,
    });
    await user.save();

  // Send numeric verification code email
  await sendVerificationCodeEmail(user);

    res.status(201).json({
      message:
        "Registration successful! Please check your email to verify your account (expires in 24 hours).",
    });
  } catch (err) {
    console.error("❌ Registration Error:", err);
    res.status(500).json({ message: "Server error during registration" });
  }
});

/* =========================================================
   🔑 LOGIN
   ========================================================= */
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user)
      return res.status(400).json({ message: "User not found." });

    if (user.isBanned)
      return res
        .status(403)
        .json({ message: "Your account has been banned. Please contact support." });

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      return res.status(400).json({ message: "Invalid credentials." });

    // If not verified, resend email (skip for admin)
    if (!user.isVerified) {
      if (user.role !== "admin") {
        try {
          console.log(`auth.login: user ${email} not verified — resending code`);
          await sendVerificationCodeEmail(user);
          console.log(`auth.login: resend-code email triggered for ${email}`);
          // include a redirect hint and the email so clients (especially WebView) can navigate reliably
          const frontendBase = process.env.FRONTEND_URL || req.get('origin') || '';
          const redirectUrl = frontendBase ? `${frontendBase.replace(/\/$/, '')}/verify-email` : '/verify-email';
          return res.status(403).json({
            message: "Email not verified. A new verification link has been sent.",
            redirect: "/verify-email",
            email: user.email,
            redirectUrl,
          });
        } catch (emailErr) {
          console.error("📧 Email send failed:", emailErr);
          const frontendBase = process.env.FRONTEND_URL || req.get('origin') || '';
          const redirectUrl = frontendBase ? `${frontendBase.replace(/\/$/, '')}/verify-email` : '/verify-email';
          return res.status(403).json({
            message: "Email not verified (email sending temporarily failed).",
            redirect: "/verify-email",
            email: user.email,
            redirectUrl,
          });
        }
      }
    }

    // Issue JWT token
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

/* =========================================================
   📩 VERIFY EMAIL
   ========================================================= */
// Verify by code: POST /api/auth/verify-code  { email, code }
router.post("/verify-code", async (req, res) => {
  const { email, code } = req.body;
  if (!email || !code) return res.status(400).json({ message: "Email and code are required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(200).json({ message: "Email already verified." });

    if (!user.verificationCode || !user.verificationExpires)
      return res.status(400).json({ message: "No verification code found. Request a new one." });

    if (new Date() > new Date(user.verificationExpires))
      return res.status(400).json({ message: "Verification code expired. Request a new one." });

    if (user.verificationCode !== String(code))
      return res.status(400).json({ message: "Invalid verification code." });

    user.isVerified = true;
    user.verificationCode = "";
    user.verificationExpires = null;
    await user.save();

    // After verifying, issue a JWT so the client can be logged in immediately
    const token = jwt.sign(
      { id: user._id, name: user.name, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({ message: "✅ Email verified successfully.", token, user: { id: user._id, name: user.name, email: user.email, role: user.role } });
  } catch (err) {
    console.error("❌ verify-code error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// Resend code: POST /api/auth/resend-code { email }
router.post("/resend-code", async (req, res) => {
  const { email } = req.body;
  if (!email) return res.status(400).json({ message: "Email is required." });

  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found." });
    if (user.isVerified) return res.status(200).json({ message: "Email already verified." });

    await sendVerificationCodeEmail(user);
    res.json({ message: "Verification code resent." });
  } catch (err) {
    console.error("❌ resend-code error:", err);
    res.status(500).json({ message: "Failed to resend verification code." });
  }
});

/* =========================================================
   🗒️ NOTES & FAVORITES
   ========================================================= */
router.put("/notes", authenticateToken, async (req, res) => {
  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.user.id,
      { notes: req.body.notes },
      { new: true }
    );

    if (!updatedUser)
      return res.status(404).json({ message: "User not found." });

    res.json({ message: "Notes saved successfully", notes: updatedUser.notes });
  } catch (err) {
    console.error("❌ Error saving notes:", err);
    res.status(500).json({ message: "Error saving notes" });
  }
});

router.get("/notes", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ notes: user.notes || "" });
  } catch (err) {
    console.error("❌ Error fetching notes:", err);
    res.status(500).json({ message: "Error fetching notes" });
  }
});

router.put("/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: "User not found." });

    const { favorites } = req.body;
    user.favorites = favorites;
    await user.save();

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Error updating favorites:", err);
    res.status(500).json({ message: "Error updating favorites" });
  }
});

router.get("/favorites", authenticateToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("favorites");
    if (!user) return res.status(404).json({ message: "User not found." });

    res.json({ favorites: user.favorites });
  } catch (err) {
    console.error("❌ Error fetching favorites:", err);
    res.status(500).json({ message: "Server error" });
  }
});

/* =========================================================
   💬 FETCH USER COMMENTS
   ========================================================= */
router.get("/comments", authenticateToken, async (req, res) => {
  try {
    const recipes = await Recipe.find({}, "title comments");

    const userComments = [];

    recipes.forEach((recipe) => {
      recipe.comments.forEach((comment) => {
        if (comment.userId?.toString() === req.user.id) {
          userComments.push({
            recipeId: recipe._id,
            recipeTitle: recipe.title,
            commentId: comment._id,
            comment: comment.comment,
            createdAt: comment.createdAt,
            profileImage: comment.profileImage || "/default-profile.png",
            type: "comment",
          });
        }

        comment.replies.forEach((reply) => {
          if (reply.userId?.toString() === req.user.id) {
            userComments.push({
              recipeId: recipe._id,
              recipeTitle: recipe.title,
              commentId: comment._id,
              replyId: reply._id,
              comment: reply.comment,
              createdAt: reply.createdAt,
              profileImage: reply.profileImage || "/default-profile.png",
              type: "reply",
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

/* =========================================================
   🧭 TOKEN VERIFY (for testing/debugging)
   ========================================================= */
router.get("/verify", authenticateToken, (req, res) => {
  res.json({ message: "Token is valid", user: req.user });
});

export { authenticateToken, isAdmin };
export default router;
