import React, { useState } from "react";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";

function Register() {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" });
  const [passwordError, setPasswordError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const navigate = useNavigate();
  const { showToast } = useToast();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== confirmPassword) {
      alert("Passwords do not match");
      return;
    }
    // Client-side password validation with detailed feedback
    const pwd = formData.password || "";
    const checks = {
      length: pwd.length >= 8,
      lower: /[a-z]/.test(pwd),
      upper: /[A-Z]/.test(pwd),
      number: /\d/.test(pwd),
      special: /[^A-Za-z0-9]/.test(pwd),
    };

    const failed = Object.entries(checks).filter(([, ok]) => !ok).map(([k]) => k);
    if (failed.length > 0) {
      const msgs = [];
      if (failed.includes("length")) msgs.push("at least 8 characters");
      if (failed.includes("upper")) msgs.push("an uppercase letter");
      if (failed.includes("lower")) msgs.push("a lowercase letter");
      if (failed.includes("number")) msgs.push("a number");
      if (failed.includes("special")) msgs.push("a special character");
      setPasswordError("Password must include: " + msgs.join(", ") + ".");
      console.debug("Password validation failed:", checks, "pwdLength:", pwd.length);
      return;
    } else {
      setPasswordError("");
    }
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/register`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      // any 2xx -> success
      if (res.status >= 200 && res.status < 300) {
        showToast({ message: res.data?.message || 'Registration successful. Check your email for the code.', type: 'success' });
        navigate("/verify-email", { state: { email: formData.email } });
      } else {
        showToast({ message: res.data?.message || 'Registration failed', type: 'error' });
      }
    } catch (err) {
      console.error('Registration error', err);
      const msg = err?.response?.data?.message || 'Registration failed';
      showToast({ message: msg, type: 'error' });
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/assets/KusinAIBG.png"
          alt="background"
          className="w-full h-full object-cover"
          style={{ opacity: 0.18 }}
        />
      </div>
      <div className="flex justify-between items-center p-4">
        <div onClick={() => navigate("/")} className="text-primary text-xl font-bold cursor-pointer">
          🍳 KusinAI
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center relative z-10">
        <form onSubmit={handleSubmit} className="bg-background/80 backdrop-blur-[2px] p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-primary text-center">Register</h1>
          <input
            name="name"
            type="text"
            placeholder="Name"
            onChange={handleChange}
            className="w-full p-3 border border-leaf/40 rounded bg-background text-text focus:border-leaf"
            required
          />
          <input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            className="w-full p-3 border border-leaf/40 rounded bg-background text-text focus:border-leaf"
            required
          />
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
              className="w-full p-3 border border-leaf/40 rounded pr-10 bg-background text-text focus:border-leaf"
              required
            />
            {passwordError && <div className="text-sm text-red-500 mt-1">{passwordError}</div>}
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-leaf"
              onClick={() => setShowPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <div className="relative">
            <input
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={e => setConfirmPassword(e.target.value)}
              className="w-full p-3 border border-leaf/40 rounded pr-10 mt-2 bg-background text-text focus:border-leaf"
              required
            />
            <button
              type="button"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-leaf"
              onClick={() => setShowConfirmPassword((prev) => !prev)}
              tabIndex={-1}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <FiEyeOff /> : <FiEye />}
            </button>
          </div>
          <button type="submit" className="w-full bg-primary hover:bg-leaf text-white py-2 rounded font-semibold transition-colors">
            Register
          </button>
          <p className="text-sm text-center">
            Already have an account? <a href="/login" className="text-accent font-medium hover:underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Register;
