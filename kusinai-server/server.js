import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

import recipeRoutes from "./routes/recipeRoutes.js";
import authRoutes from "./routes/auth.js";
import userRoutes from "./routes/user.js";
import chatRoutes from "./routes/chat.js";
import scannerRoutes from "./routes/scanner.js";
import adminRoutes from "./routes/admin.js";
import feedbackRoutes from "./routes/feedback.js";

const app = express();

// ✅ Allow CORS for frontend requests
app.use(cors({
  origin: "*", // You can restrict this later to your frontend domain (e.g., https://kusinai.vercel.app)
  methods: ["GET", "POST", "PUT", "DELETE"],
  allowedHeaders: ["Content-Type", "Authorization"]
}));

// ✅ Allow large JSON & image payloads (fixes 413 Payload Too Large)
app.use(express.json({ limit: "25mb" }));
app.use(express.urlencoded({ limit: "25mb", extended: true }));

// ✅ Route registration
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/feedback", feedbackRoutes);

// ✅ MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ MongoDB connection error:", err));

// ✅ Basic root route for testing
app.get("/", (req, res) => {
  res.send("KusinAI backend is running 🚀");
});

// ✅ Start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
