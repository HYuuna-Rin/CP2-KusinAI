/*
  File: routes/testEmail.js
  Purpose: Utility endpoints for verifying email delivery configuration.
  Responsibilities:
  - Trigger test emails and report transport status/errors.
  - Help diagnose SMTP/API credentials and template rendering.
  Notes: Restrict access in production; avoid exposing sensitive info.
*/
import express from "express";
import nodemailer from "nodemailer";

const router = express.Router();

router.get("/", async (req, res) => {
  try {
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      secure: true,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

    await transporter.sendMail({
      from: `"KusinAI Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER,
      subject: "✅ Test Email from KusinAI",
      text: "This is a test email sent from your KusinAI backend.",
    });

    res.send("✅ Test email sent successfully!");
  } catch (err) {
    console.error("❌ Test email failed:", err);
    res.status(500).send("❌ Test email failed: " + err.message);
  }
});

export default router;
