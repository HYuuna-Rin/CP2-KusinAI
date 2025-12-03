/*
  File: src/components/PrivateRoute.jsx
  Purpose: Route guard for authenticated-only pages.
  Responsibilities:
  - Check auth state and redirect unauthenticated users to login.
  - Render children only when authorized.
  Notes: Keep in sync with auth context/token logic.
*/
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  // Block admin accounts from accessing user app routes
  try {
    const decoded = jwtDecode(token);
    if (decoded?.role === "admin") {
      // Clear any persisted token
      localStorage.removeItem("token");
      sessionStorage.removeItem("token");
      return <Navigate to="/login" />;
    }
  } catch {}

  return children;
};

export default PrivateRoute;
