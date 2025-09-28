import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();

// Replace with your group email and credentials
const GROUP_EMAIL = "kusinai27@gmail.com";
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.FEEDBACK_EMAIL_USER,
    pass: process.env.FEEDBACK_EMAIL_PASS,
  },
});

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }
  try {
    await transporter.sendMail({
      from: email,
      to: GROUP_EMAIL,
      subject: `Feedback from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: "Failed to send feedback." });
  }
});

export default router;
