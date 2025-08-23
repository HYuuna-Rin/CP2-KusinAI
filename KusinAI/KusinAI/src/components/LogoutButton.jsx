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
