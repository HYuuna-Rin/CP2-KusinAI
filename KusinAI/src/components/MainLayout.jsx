import IngredientScanner from "./IngredientScanner";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiX, FiCamera, FiUser, FiSearch } from "react-icons/fi";
import LogoutButton from "./LogoutButton";
import { isLoggedIn } from "../utils/auth";
import { jwtDecode } from "jwt-decode";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [addedIngredient, setAddedIngredient] = useState(null);
  const navigate = useNavigate();

  // ✅ Decode user role
  let role = null;
  try {
    const token = localStorage.getItem("token") || sessionStorage.getItem("token");
    if (token) {
      const decoded = jwtDecode(token);
      role = decoded.role;
    }
  } catch {
    role = null;
  }

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchInput.trim()) {
      navigate(`/search?query=${encodeURIComponent(searchInput.trim())}`);
    }
  };

  const handleScanResult = (ingredientString) => {
  if (!ingredientString) return;

  // Split scanned ingredients and normalize
  const newIngredients = ingredientString
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .filter(Boolean);

  // Split existing ingredients from the search bar
  const existingIngredients = searchInput
    .split(",")
    .map((i) => i.trim().toLowerCase())
    .filter(Boolean);

  // Merge and remove duplicates
  const merged = Array.from(new Set([...existingIngredients, ...newIngredients]));

  // Update search bar
  const newInput = merged.join(", ");
  setSearchInput(newInput);

  // Show success banner
  setAddedIngredient(newIngredients.join(", "));
  setTimeout(() => setAddedIngredient(null), 3000);

  // Close scanner modal
  setScannerOpen(false);
};


  return (
    <div className="flex min-h-screen relative bg-background">
      {/* Background */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/assets/KusinAIBG.png"
          alt="background"
          className="w-full h-full object-cover"
          style={{ opacity: 1 }}
        />
      </div>

      <div className="flex flex-col flex-grow w-full relative z-10">
        {/* Sidebar */}
        <div
          className={`fixed top-0 right-0 h-full bg-tamarind text-white transform transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } w-64`}
        >
          <div className="flex items-center justify-between p-4 border-b border-leaf">
            <span className="text-xl font-bold text-accent">KusinAI</span>
            <div className="flex gap-2 items-center">
              {isLoggedIn() && <LogoutButton />}
              <FiX
                className="cursor-pointer text-2xl hover:text-accent"
                onClick={() => setSidebarOpen(false)}
              />
            </div>
          </div>
          <ul className="flex flex-col p-4 space-y-3 text-lg">
            {["Home", "About", "Feedback", "Contact"].map((item) => (
              <li key={item}>
                <Link
                  to={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                  onClick={() => setSidebarOpen(false)}
                  className="block px-4 py-2 hover:bg-leaf/30 rounded transition-colors"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {/* Header / Topbar */}
        <header className="relative px-3 py-2 shadow-md flex items-center justify-between gap-2 md:px-6 md:py-3 min-h-[56px] bg-surface/90">
          <div className="absolute inset-0 bg-primary" style={{ opacity: 0.7, zIndex: 1 }} />
          <div className="relative w-full flex items-center justify-between gap-2" style={{ zIndex: 2 }}>
            {/* Logo */}
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="flex items-center gap-2 h-full"
              style={{
                fontFamily: "Poppins, Montserrat, Quicksand, Arial, sans-serif",
                fontWeight: 700,
                fontSize: "1.5rem",
                letterSpacing: "0.02em",
              }}
            >
              <img
                src="/assets/KusinAILogo.png"
                alt="KusinAI Logo"
                className="h-full max-h-[36px] w-auto object-contain"
                style={{ marginRight: "0.5rem" }}
              />
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-background rounded-full flex-shrink min-w-0 w-[160px] sm:w-[260px] md:w-[280px] lg:w-[340px] mx-2 transition-all duration-200 border border-leaf shadow-sm"
            >
              <button
                type="submit"
                className="ml-2 p-1 text-leaf hover:text-accent flex-shrink-0 focus:outline-none"
                title="Search"
              >
                <FiSearch size={20} />
              </button>
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Insert Ingredient/s..."
                className="px-3 py-1 text-text w-full focus:outline-none text-sm sm:text-base min-w-0 bg-transparent placeholder-leaf"
                style={{ fontWeight: 500 }}
              />
              <button
                type="button"
                className="p-2 text-leaf hover:text-accent flex-shrink-0"
                onClick={() => setScannerOpen(true)}
                title="Scan ingredient"
              >
                <FiCamera size={20} />
              </button>
            </form>

            {/* User & Menu */}
            <div className="flex items-center gap-4 flex-shrink-0">
              {isLoggedIn() && (
                <FiUser
                  className="text-2xl cursor-pointer text-leaf hover:text-accent"
                  onClick={() =>
                    role === "admin"
                      ? navigate("/admin/dashboard")
                      : navigate("/profile")
                  }
                />
              )}
              <FiMenu
                className="text-2xl cursor-pointer text-leaf hover:text-accent"
                onClick={() => setSidebarOpen(true)}
              />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow bg-background bg-opacity-90 overflow-y-auto">
          {children}
        </main>

        {/* Ingredient Scanner Modal */}
        {scannerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
            <div className="bg-white p-5 rounded-xl shadow-lg text-center w-full max-w-md">
              <h2 className="text-xl font-bold mb-2 text-primary">Scan Ingredients</h2>
              <IngredientScanner onScan={handleScanResult} onClose={() => setScannerOpen(false)} />
              <button
                onClick={() => setScannerOpen(false)}
                className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-all"
              >
                Close
              </button>
            </div>
          </div>
        )}

        {/* ✅ Success Banner */}
        {addedIngredient && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-sm animate-fade-in-out z-50">
            ✅ Added ingredient: <span className="font-semibold capitalize">{addedIngredient}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
