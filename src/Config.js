export const BASE_URL =
  import.meta.env.VITE_API_URL && import.meta.env.VITE_API_URL.trim() !== ""
    ? `${import.meta.env.VITE_API_URL}/api`
    : "https://kusinai-server.onrender.com/api";

    console.log("[DEBUG] VITE_API_URL =", import.meta.env.VITE_API_URL);
