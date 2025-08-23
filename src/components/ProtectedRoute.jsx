import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";

const ProtectedRoute = ({ children, role }) => {
  const token = localStorage.getItem("token") || sessionStorage.getItem("token");

  if (!token) {
    return <Navigate to="/login" />;
  }

  const decoded = jwtDecode(token);

  if (role && decoded.role !== role) {
    return <Navigate to="/" />; // bounce non-admins
  }

  return children;
};

export default ProtectedRoute;
