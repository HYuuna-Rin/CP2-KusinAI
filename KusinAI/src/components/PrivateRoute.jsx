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

const PrivateRoute = ({ children }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  return children;
};

export default PrivateRoute;
