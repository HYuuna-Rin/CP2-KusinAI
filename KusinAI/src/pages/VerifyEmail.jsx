import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios";

const VerifyEmail = () => {
  const [message, setMessage] = useState("Verifying...");
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const token = new URLSearchParams(location.search).get("token");
    if (token) {
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
    }
  }, [location, navigate]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background text-center">
      <h2 className="text-2xl font-semibold text-primary">{message}</h2>
    </div>
  );
};

export default VerifyEmail;
