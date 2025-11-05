import express from "express";
import nodemailer from "nodemailer";
const router = express.Router();

const GROUP_EMAIL = "kusinai27@gmail.com";

// Resolve env references like ${EMAIL_USER} if present (dotenv doesn't expand by default)
const resolveRef = (val) => {
  if (!val || typeof val !== "string") return val;
  const m = val.match(/^\$\{(.+)\}$/);
  if (m) return process.env[m[1]] || val;
  return val;
};

let feedbackUser = resolveRef(process.env.FEEDBACK_EMAIL_USER) || process.env.EMAIL_USER;
let feedbackPass = resolveRef(process.env.FEEDBACK_EMAIL_PASS) || process.env.EMAIL_PASS;

const mask = (s) => (s ? (s.length > 4 ? s.slice(0, 2) + '***' + s.slice(-2) : '***') : 'missing');

if (!feedbackUser || !feedbackPass) {
  console.error("❌ Feedback email credentials missing. Check FEEDBACK_EMAIL_USER and FEEDBACK_EMAIL_PASS in .env");
} else {
  console.log(`ℹ️ Feedback email user: ${feedbackUser} (pass ${mask(feedbackPass)})`);
}

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || "smtp.gmail.com",
  port: process.env.EMAIL_PORT || 465,
  secure: true,
  auth: {
    user: feedbackUser,
    pass: feedbackPass,
  },
});

// Verify connection on startup
transporter.verify((error, success) => {
  if (error) console.error("❌ Feedback email transport failed:", error);
  else console.log("✅ Feedback email transporter ready");
});

router.post("/", async (req, res) => {
  const { name, email, message } = req.body;
  if (!name || !email || !message) {
    return res.status(400).json({ error: "All fields are required." });
  }

  try {
    await transporter.sendMail({
      from: `"${name}" <${email}>`,
      to: GROUP_EMAIL,
      subject: `📩 Feedback from ${name}`,
      text: `Name: ${name}\nEmail: ${email}\n\n${message}`,
      html: `
        <div style="font-family:sans-serif;">
          <h2>New Feedback from ${name}</h2>
          <p><strong>Email:</strong> ${email}</p>
          <p>${message}</p>
        </div>
      `,
    });

    res.json({ success: true });
  } catch (err) {
    console.error("❌ Feedback email send failed:", err);
    res.status(500).json({ error: "Failed to send feedback." });
  }
});

export default router;
