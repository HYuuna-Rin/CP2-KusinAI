/*
  File: src/pages/OpenAppRedirect.jsx
  Purpose: Bridge page to deep-link users into the mobile app.
*/
import { useEffect, useState } from "react";

const API_URL = import.meta.env.VITE_API_URL || "";

export default function OpenAppRedirect() {
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");

    if (!token) {
      setStatus("error");
      setMessage("No verification token found in the link.");
      return;
    }

    // Try to open the app deep link (non-blocking)
    try {
      const appUrl = `kusinai://openapp?token=${token}`; // app should handle this route and token
      // small timeout to allow app to capture the intent on mobile
      window.setTimeout(() => {
        window.location.href = appUrl;
      }, 300);
    } catch (e) {
      // ignore
    }

    // Always call the backend verification so browser users are verified
    (async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/verify-email?token=${encodeURIComponent(token)}`);
        const data = await res.json();
        if (res.ok) {
          setStatus("success");
          setMessage(data.message || "Email verified successfully.");
        } else {
          setStatus("error");
          setMessage(data.message || "Verification failed.");
        }
      } catch (err) {
        console.error("Verification request failed:", err);
        setStatus("error");
        setMessage("Network error while verifying. Please try again.");
      }
    })();
  }, []);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center p-4">
      {status === "loading" && (
        <>
          <h2 className="text-2xl text-primary font-semibold">Verifying your account…</h2>
          <p className="mt-2">We're opening KusinAI — if you have the app installed it should open now.</p>
        </>
      )}

      {status === "success" && (
        <>
          <h2 className="text-2xl text-primary font-semibold">✅ Verified</h2>
          <p className="mt-2 text-leaf">{message}</p>
          <div className="mt-4 flex gap-2">
            <a href="/login" className="px-4 py-2 bg-primary text-white rounded">Go to Login</a>
            <button
              onClick={() => {
                // try opening the app again
                const params = new URLSearchParams(window.location.search);
                const token = params.get("token");
                if (token) window.location.href = `kusinai://openapp?token=${token}`;
              }}
              className="px-4 py-2 bg-surface border rounded"
            >
              Open App
            </button>
          </div>
        </>
      )}

      {status === "error" && (
        <>
          <h2 className="text-2xl text-accent font-semibold">Verification failed</h2>
          <p className="mt-2 text-tamarind">{message}</p>
          <div className="mt-4 flex gap-2">
            <a href="/register" className="px-4 py-2 bg-primary text-white rounded">Register</a>
            <a href="/" className="px-4 py-2 bg-surface border rounded">Home</a>
          </div>
        </>
      )}
    </div>
  );
}
