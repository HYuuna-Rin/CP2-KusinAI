/*
  File: src/pages/Login.jsx
  Purpose: User login page to authenticate and start a session.
*/
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import Button from "../components/ui/button";
import Input from "../components/ui/input";
import { jwtDecode } from "jwt-decode";
import { useToast } from "../context/ToastContext";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectNotice, setRedirectNotice] = useState("");
  const [isBanned, setIsBanned] = useState(false);
  const navigate = useNavigate();
  const { showToast } = useToast();

  // ✅ Redirect logged-in users away from Login page
  useEffect(() => {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      try {
        const decoded = jwtDecode(token);
        if (decoded.role === "admin") navigate("/admin/dashboard");
        else navigate("/");
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
      const res = await axios.post(
        `${import.meta.env.VITE_API_URL}/api/auth/login`,
        formData,
        { headers: { "Content-Type": "application/json" } }
      );

      // ✅ If backend responds successfully and includes a token
      if (res.data.token) {
        const { token } = res.data;

        if (rememberMe) localStorage.setItem("token", token);
        else sessionStorage.setItem("token", token);

  const decoded = jwtDecode(token);
  showToast({ message: "Login successful!", type: "success" });

  if (decoded.role === "admin") navigate("/admin/dashboard");
  else navigate("/");
      } else {
        setErrorMsg(res.data.message || "Login failed");
      }
    } catch (err) {
      console.error("Login error:", err);

      // ✅ Handle backend response messages cleanly
      if (err.response) {
        if (err.response.status === 403) {
          const serverMsg = err.response.data?.message || "Access denied.";
          // If banned, stay on login and show error (no redirect)
          if (/banned/i.test(serverMsg)) {
            showToast({ message: serverMsg, type: "error" });
            setErrorMsg(serverMsg);
            setIsBanned(true);
            return; // Do not proceed to verification redirect logic
          }
          // User not verified -> redirect to verification page and prefill email
          const msg = serverMsg || "Email not verified. Please check your inbox.";
          console.log('Login 403 response.data:', err.response.data);
          showToast({ message: msg, type: "warning" });
          setErrorMsg("Email not verified. Please verify your account first.");
          setRedirectNotice('Email not verified — redirecting to verification screen...');
          setTimeout(() => {
            try {
              navigate('/verify-email', { state: { email: formData.email } });
            } catch (navErr) {
              console.error('Navigation to /verify-email failed:', navErr);
              try { window.location.href = '/verify-email'; } catch (e) { /* ignore */ }
            }
          }, 50);
        } else if (err.response.status === 400) {
          const msg = err.response.data.message || "Invalid credentials.";
          showToast({ message: msg, type: "error" });
          setErrorMsg(msg);
        } else {
          const msg = err.response.data.message || "Login failed. Try again later.";
          showToast({ message: msg, type: "error" });
          setErrorMsg(msg);
        }
      } else {
        setErrorMsg("Network error. Please check your connection.");
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
          className="flex items-center gap-2 cursor-pointer select-none"
          style={{ fontFamily: "Poppins, Montserrat, Quicksand, Arial, sans-serif", fontWeight:700 }}
        >
          <img src="/assets/KusinAILogo.png" alt="logo" className="h-10 w-10 object-contain" />
          <span className="bg-gradient-to-r from-leaf/90 to-accent/90 bg-clip-text text-transparent text-xl tracking-wide">KusinAI</span>
        </div>
      </div>

      <div className="flex-grow flex justify-center items-center relative z-10">
        <form
          onSubmit={handleSubmit}
          className="bg-background/80 backdrop-blur-[2px] p-8 rounded-lg shadow-md w-full max-w-md space-y-4"
        >
          <h1 className="text-2xl font-bold text-primary text-center mb-2">Login</h1>

          {errorMsg && (
            <div className="bg-accent/20 border border-accent text-accent px-4 py-2 rounded text-center mb-2 animate-pulse">
              {errorMsg}
            </div>
          )}

          {redirectNotice && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-center mb-2">
              {redirectNotice}
            </div>
          )}

          <Input
            name="email"
            type="email"
            placeholder="Email"
            onChange={handleChange}
            required
          />

          <div className="relative">
            <Input
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              onChange={handleChange}
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

          <Button type="submit" className="w-full">Login</Button>

          <div className="flex justify-between text-sm"></div>

          {isBanned && (
            <div className="mt-2 text-center text-sm">
              Need help? <a className="text-accent hover:underline" href="mailto:kusinai27@gmail.com?subject=Appeal%20Banned%20Account">Contact Support</a>
            </div>
          )}

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
