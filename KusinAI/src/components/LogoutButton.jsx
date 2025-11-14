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

const LogoutButton = () => {
  return (
    <button
      onClick={logout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-full transition"
    >
      Logout
    </button>
  );
};

export default LogoutButton;
