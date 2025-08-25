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

const app = express();

// ✅ Define allowed origins (local + deployed frontend)
const allowedOrigins = [
  "http://localhost:5173", 
  "https://kusinai.vercel.app",
  "https://kusinai-duid5gxxc-hyuuna-rins-projects.vercel.app"
];

// ✅ CORS setup
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

app.use(express.json());

// Routes
app.use("/api/user", userRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/recipes", recipeRoutes);
app.use("/api", chatRoutes);
app.use("/api/scanner", scannerRoutes);
app.use("/api/admin", adminRoutes);

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("❌ MongoDB connection error:", err));

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
