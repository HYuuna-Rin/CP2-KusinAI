import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { BASE_URL } from "../Config.js";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";


function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const navigate = useNavigate();

  // ✅ Redirect logged-in users away from Login page
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } catch {
        navigate("/");
      }
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg("");
    try {
  const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/login`, formData, {
        headers: { "Content-Type": "application/json" },
      });

      const { token } = res.data;

      if (token) {
        // Save to localStorage or sessionStorage depending on Remember Me toggle
        if (rememberMe) {
          localStorage.setItem("token", token);
        } else {
          sessionStorage.setItem("token", token);
        }

        const decoded = jwtDecode(token);

        setErrorMsg("");
        alert("Login successful!");

        if (decoded.role === "admin") {
          navigate("/admin/dashboard");
        } else {
          navigate("/");
        }
      } else {
        setErrorMsg(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response && err.response.data && err.response.data.message) {
        setErrorMsg(err.response.data.message);
      } else {
        setErrorMsg("Login error");
      }
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
        <div
          onClick={() => navigate("/")}
          className="text-primary text-xl font-bold cursor-pointer"
        >
          🍳 KusinAI
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-background/80 backdrop-blur-[2px] p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold text-primary text-center">Login</h1>
          {errorMsg && (
            <div className="bg-accent/20 border border-accent text-accent px-4 py-2 rounded text-center mb-2 animate-pulse">
              {errorMsg}
            </div>
          )}
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

          <label className="flex items-center space-x-2 text-sm">
            <input
              type="checkbox"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.target.checked)}
              className="form-checkbox accent-leaf"
            />
            <span>Remember Me</span>
          </label>

          <button
            type="submit"
            className="w-full bg-primary hover:bg-leaf text-white py-2 rounded font-semibold transition-colors"
          >
            Login
          </button>
          <p className="text-sm text-center">
            Don’t have an account?{" "}
            <a href="/register" className="text-accent font-medium hover:underline">
              Register
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

export default Login;
