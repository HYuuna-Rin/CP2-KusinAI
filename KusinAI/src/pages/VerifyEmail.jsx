import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";

const VerifyEmail = () => {
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { showToast } = useToast();
  const { login } = useAuth();

  useEffect(() => {
    // If there's a token query param, try the old token-based verify flow (backwards-compatible)
    const token = new URLSearchParams(location.search).get("token");
    if (token) {
      setMessage("Verifying...");
      axios
        .get(`${import.meta.env.VITE_API_URL}/api/auth/verify-email?token=${token}`)
        .then((res) => {
          setMessage("✅ Email verified successfully! You can now log in.");
          setTimeout(() => navigate("/login"), 2000);
        })
        .catch((err) => {
          console.error(err);
          setMessage("❌ Verification failed or token expired.");
        });
      return;
    }

    // If navigated here with email in state (from register/login), prefill it
    if (location.state && location.state.email) setEmail(location.state.email);
  }, [location, navigate]);

  // Code-based verify
  const handleVerify = async (e) => {
    e && e.preventDefault();
    // allow using prefilled email (from state) so users don't need to re-enter their email
    const useEmail = email;
    if (!useEmail || !code) {
      showToast({ message: "Please provide the verification code (and email if not prefilled).", type: "warning" });
      return;
    }
    try {
      setLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/verify-code`, { email: useEmail, code });
      showToast({ message: res.data.message || "Email verified", type: "success" });

      // if server returned a token, store it and navigate to landing as logged-in
      if (res.data.token) {
        // Respect remember preference passed via navigation state
        const remember = (location.state && location.state.remember) || false;
        try {
          if (login) login(res.data.token, remember);
        } catch (e) {
          // fallback: store in storage
          if (remember) localStorage.setItem('token', res.data.token);
          else sessionStorage.setItem('token', res.data.token);
        }
        navigate('/');
        return;
      }

      // otherwise go to login
      navigate('/login');
    } catch (err) {
      console.error('verify error', err);
      const msg = err?.response?.data?.message || 'Verification failed';
      showToast({ message: msg, type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (!email) {
      showToast({ message: "Please enter your email to resend the code.", type: "warning" });
      return;
    }
    try {
      setResendLoading(true);
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/auth/resend-code`, { email });
      showToast({ message: res.data.message || 'Verification code resent', type: 'success' });
    } catch (err) {
      console.error('resend error', err);
      const msg = err?.response?.data?.message || 'Failed to resend code';
      showToast({ message: msg, type: 'error' });
    } finally {
      setResendLoading(false);
    }
  };

  // If token flow ran, show message-only. Otherwise render form for code entry.
  if (message) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
        <h2 className="text-2xl font-semibold text-primary">{message}</h2>
      </div>
    );
  }

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
        <div onClick={() => navigate('/')} className="text-primary text-xl font-bold cursor-pointer">🍳 KusinAI</div>
      </div>

      <div className="flex-grow flex justify-center items-center relative z-10">
        <form onSubmit={handleVerify} className="bg-background/80 backdrop-blur-[2px] p-8 rounded-lg shadow-md w-full max-w-md space-y-4">
          <h1 className="text-2xl font-bold text-primary text-center">Verify your email</h1>

          <p className="text-sm text-center text-muted">Enter the 6-digit verification code we sent to your email.</p>

          {/* Only ask for email if not already provided via navigation state */}
          {!email && (
            <input
              name="email"
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-leaf/40 rounded bg-background text-text focus:border-leaf"
              required
            />
          )}

          <input
            name="code"
            type="text"
            placeholder="6-digit code"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={6}
            className="w-full p-3 border border-leaf/40 rounded bg-background text-text focus:border-leaf"
            required
          />

          <button type="submit" disabled={loading} className="w-full bg-primary hover:bg-leaf text-white py-2 rounded font-semibold transition-colors">
            {loading ? 'Verifying...' : 'Verify Email'}
          </button>

          <button type="button" onClick={handleResend} disabled={resendLoading} className="w-full bg-background border border-leaf text-leaf py-2 rounded font-semibold transition-colors">
            {resendLoading ? 'Resending...' : 'Resend code'}
          </button>

          <p className="text-sm text-center">
            Already verified? <a href="/login" className="text-accent font-medium hover:underline">Login</a>
          </p>
        </form>
      </div>
    </div>
  );
};

export default VerifyEmail;
