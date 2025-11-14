/*
  File: src/utils/auth.js
  Purpose: Small auth utility helpers for the frontend.
  Responsibilities:
  - Provide helpers like token presence checks, storage access, and guards.
  - Avoid coupling to specific components; keep logic generic.
  Notes: Do not store secrets here; frontend code is public.
*/
// Check if token exists in either localStorage or sessionStorage
export function isLoggedIn() {
  return !!(localStorage.getItem("token") || sessionStorage.getItem("token"));
}

// Logout function clears both storages and redirects to login
export const logout = () => {
  localStorage.removeItem("token");
  sessionStorage.removeItem("token");
  window.location.href = "/login";
};
