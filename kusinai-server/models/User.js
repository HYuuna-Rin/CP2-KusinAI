import mongoose from "mongoose";

// Define what fields a User will have
const userSchema = new mongoose.Schema({
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },

  isBanned: {
    type: Boolean,
    default: false,
  },

  name: {
    type: String,
    required: true,
    trim: true,
  },

  email: {
    type: String,
    required: true,
    unique: true, // prevents duplicate emails
    lowercase: true,
    trim: true,
  },

  password: {
    type: String,
    required: true,
    minlength: 6,
  },

  // ✅ Place verification fields BEFORE createdAt
  isVerified: {
    type: Boolean,
    default: false,
  },

  verificationToken: {
    type: String,
    default: "",
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  profileImage: {
    type: String,
    default: "",
  },

  notes: {
    type: String,
    default: "",
  },

  favorites: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Recipe",
    },
  ],
});

const User = mongoose.model("User", userSchema);
export default User;
