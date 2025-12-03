/*
  File: server.js
  Purpose: Backend entrypoint for the KusinAI API server.
  Responsibilities:
  - Load environment variables and initialize Express.
  - Configure core middleware (CORS, JSON parsing, static, etc.).
  - Connect to the database and validate required config.
  - Mount feature routes (auth, user, recipes, nutrition, scanner, chat, admin, feedback, test email).
  - Start the HTTP server and handle process-level errors.
  Notes: Keep business logic in models/routes/services; keep this file focused on wiring.
*/
import "dotenv/config";
import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import recipeRoutes from "./routes/recipeRoutes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import scannerRoutes from "./routes/scanner.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";
import testEmailRoutes from "./routes/testEmail.js";
import nutritionRoutes from "./routes/nutritionRoutes.js";
import importRoutes from "./routes/import.js";
import cronRoutes from "./routes/cron.js";

const app = express();

// ✅ Middleware setup
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

// ✅ Static uploads for scanner to host temporary images (for Spoonacular imageUrl)
try {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const uploadsPath = path.join(__dirname, "uploads");
  if (!fs.existsSync(uploadsPath)) fs.mkdirSync(uploadsPath, { recursive: true });
  app.use("/uploads", express.static(uploadsPath));
  console.log("📂 Serving uploads from:", uploadsPath);
} catch (e) {
  console.warn("⚠️ Unable to initialize uploads static route:", e?.message || e);
}

// ✅ API Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/recipes", nutritionRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);
app.use("/api/test-email", testEmailRoutes);
app.use("/api/import", importRoutes);
app.use("/api/cron", cronRoutes);

// ✅ MongoDB connection
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// ✅ Serve frontend (if it exists)
if (process.env.NODE_ENV === "production") {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);
  const clientBuildPath = path.join(__dirname, "..", "KusinAI", "dist");

  if (fs.existsSync(clientBuildPath)) {
    console.log("🌐 Serving frontend from:", clientBuildPath);
    app.use(express.static(clientBuildPath));

    // ✅ Safe fallback to serve index.html for any route (avoids path-to-regexp crash)
    app.use((req, res, next) => {
      if (req.method === "GET" && !req.path.startsWith("/api")) {
        res.sendFile(path.join(clientBuildPath, "index.html"));
      } else {
        next();
      }
    });

  } else {
    console.warn("⚠️ Skipping frontend static serve — dist folder not found");
  }
}

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
