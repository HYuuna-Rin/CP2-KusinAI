import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { FiEye, FiEyeOff } from "react-icons/fi";
import { jwtDecode } from "jwt-decode";
import { useToast } from "../context/ToastContext";

function Login() {
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [redirectNotice, setRedirectNotice] = useState("");
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
          // User not verified -> redirect to verification page and prefill email
          const msg = err.response.data?.message || "Email not verified. Please check your inbox.";
          console.log('Login 403 response.data:', err.response.data);
          console.log('Will redirect to /verify-email with email:', formData.email);
          showToast({ message: msg, type: "warning" });
          setErrorMsg("Email not verified. Please verify your account first.");
          // show a visible banner in the UI so WebView users can see the redirect is happening
          setRedirectNotice('Email not verified — redirecting to verification screen...');
          // navigate to verification page where user can enter the 6-digit code
          // use a short timeout to ensure toast/state updates don't block navigation in some WebViews
          setTimeout(() => {
            try {
              // Prefer server-provided redirectUrl when available (more reliable in WebView/native shells)
              const redirectUrl = err.response?.data?.redirectUrl;
              // Prefer internal app navigation (SPA) so the verify page opens inside the app
              try {
                setRedirectNotice('Redirecting inside app to verification screen...');
                navigate('/verify-email', { state: { email: formData.email } });
                return;
              } catch (navErr) {
                console.warn('SPA navigation failed, will try external redirect', navErr);
              }

              // If SPA navigation wasn't possible (older WebView), fall back to server-provided full URL
              if (redirectUrl) {
                console.log('Falling back to server-provided redirectUrl:', redirectUrl);
                setRedirectNotice(`Redirecting to: ${redirectUrl}`);
                try {
                  if (window.Capacitor && window.Capacitor.Plugins && window.Capacitor.Plugins.Browser && window.Capacitor.Plugins.Browser.open) {
                    window.Capacitor.Plugins.Browser.open({ url: redirectUrl });
                    return;
                  }
                } catch (e) { console.warn('Capacitor Browser open failed', e); }

                try { window.location.href = redirectUrl; return; } catch (e) { console.warn('location.href assign failed', e); }
                try { window.location.assign(redirectUrl); return; } catch (e) { console.warn('location.assign failed', e); }
                try { window.open(redirectUrl, '_self'); return; } catch (e) { console.warn('window.open failed', e); }
              }
            } catch (navErr) {
              console.error('Navigation to /verify-email failed:', navErr);
              // fallback: try server-provided redirectUrl or simple path
              try {
                const redirectUrl = err.response?.data?.redirectUrl || '/verify-email';
                window.location.href = redirectUrl;
              } catch (e) { /* ignore */ }
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
          className="text-primary text-xl font-bold cursor-pointer"
        >
          KusinAI
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

          {redirectNotice && (
            <div className="bg-yellow-50 border border-yellow-300 text-yellow-800 px-4 py-2 rounded text-center mb-2">
              {redirectNotice}
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
