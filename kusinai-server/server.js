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

const app = express();

// ✅ Middleware setup
app.use(cors());
app.use(express.json({ limit: "50mb" }));
app.use(express.urlencoded({ limit: "50mb", extended: true }));

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

    app.get("*", (req, res) => {
      res.sendFile(path.join(clientBuildPath, "index.html"));
    });
  } else {
    console.warn("⚠️ Skipping frontend static serve — dist folder not found");
  }
}

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
