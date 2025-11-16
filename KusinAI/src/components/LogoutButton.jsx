/*
  File: src/components/LogoutButton.jsx
  Purpose: Encapsulated logout control.
  Responsibilities:
  - Clear auth tokens/session and redirect as needed.
  - Provide consistent styling and confirmation UX if applicable.
  Notes: Reuse in navs or account menus.
*/
import React from "react";
import { logout } from "../utils/auth";

// Calls backend logout endpoint (for future revocation) then clears local token
const performLogout = async () => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");
  try {
    if (token) {
      await fetch(`${import.meta.env.VITE_API_URL}/api/auth/logout`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    }
  } catch (e) {
    // Non-fatal; proceed with client-side logout
    console.warn("Logout endpoint call failed", e);
  }
  logout();
};

const LogoutButton = () => {
  return (
    <button
      onClick={performLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
