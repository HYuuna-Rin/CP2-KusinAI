/*
  File: src/components/ProtectedRoute.jsx
  Purpose: Route guard for role/permission-protected pages (e.g., admin).
  Responsibilities:
  - Verify user role/permission before rendering children; redirect otherwise.
  - Pair with server-side authorization for defense-in-depth.
  Notes: Avoid duplicating complex policy logic; keep it declarative.
*/
import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const decoded = jwtDecode(token);

  // Block admin accounts entirely in the user app
  if (decoded?.role === "admin") {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    return <Navigate to="/login" />;
  }

  if (role && decoded.role !== role) {
    return <Navigate to="/" />; // bounce non-matching roles
  }

  return children;
};

export default ProtectedRoute;
