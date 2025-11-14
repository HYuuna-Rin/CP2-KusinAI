/*
  File: src/Config.js
  Purpose: Centralized client configuration (e.g., API base URLs, feature flags).
  Responsibilities:
  - Export constants used across the frontend.
  - Keep environment-specific values sourced via Vite env vars when applicable.
  Notes: Avoid secrets; frontend config is public.
*/
export const BASE_URL =
  import.meta.env.VITE_API_URL
    ? import.meta.env.VITE_API_URL + "/api"
    : "https://kusinai-server.onrender.com/api";
