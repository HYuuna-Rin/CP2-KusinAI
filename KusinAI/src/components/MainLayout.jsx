/*
  File: src/components/MainLayout.jsx
  Purpose: Global layout component providing top bar, sidebar, and page frame.
  Responsibilities:
  - Render the header (logo, search, user/menu), sidebar navigation, and content outlet.
  - Manage UI state for sidebar and ingredient scanner modal.
  Notes: Keep presentational; business logic belongs in contexts/services.
*/
import IngredientScanner from "./IngredientScanner";
import React, { useState, useEffect, useRef } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiX, FiCamera, FiUser, FiSearch } from "react-icons/fi";
import LogoutButton from "./LogoutButton";
import { isLoggedIn } from "../utils/auth";
import { jwtDecode } from "jwt-decode";
import { App as CapApp } from "@capacitor/app"; // Hardware back button handling

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [showSearchHint, setShowSearchHint] = useState(false);
  const searchHintTimeoutRef = useRef(null);
  const [addedIngredient, setAddedIngredient] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
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

  // Handle Android hardware back button: close overlays first, then navigate or exit
  useEffect(() => {
    let remove;
    CapApp.addListener("backButton", ({ canGoBack }) => {
      if (scannerOpen) { setScannerOpen(false); return; }
      if (isSidebarOpen) { setSidebarOpen(false); return; }
      if (canGoBack && window.history.length > 1) window.history.back();
      else CapApp.exitApp();
    }).then((handle) => {
      remove = handle && handle.remove ? handle.remove : undefined;
    }).catch(() => { /* ignore on web */ });
    return () => { if (typeof remove === 'function') remove(); };
  }, [scannerOpen, isSidebarOpen]);

  // Pull-to-refresh at top of scroll region (mobile gesture)
  useEffect(() => {
    const el = document.getElementById('main-scroll-region');
    if (!el) return;
    let startY = 0;
    let triggered = false;
    const onTouchStart = (e) => {
      if (el.scrollTop === 0) {
        startY = e.touches[0].clientY;
        triggered = false;
      }
    };
    const onTouchMove = (e) => {
      if (el.scrollTop === 0) {
        const diff = e.touches[0].clientY - startY;
        if (!triggered && diff > 90) { // threshold
          triggered = true;
          setRefreshing(true);
          setTimeout(() => window.location.reload(), 450);
        }
      }
    };
    el.addEventListener('touchstart', onTouchStart, { passive: true });
    el.addEventListener('touchmove', onTouchMove, { passive: true });
    return () => {
      el.removeEventListener('touchstart', onTouchStart);
      el.removeEventListener('touchmove', onTouchMove);
    };
  }, []);

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
          className={`fixed top-0 right-0 h-full bg-primary opacity-97 text-white transform transition-transform duration-300 ease-in-out z-40 ${
            isSidebarOpen ? "translate-x-0" : "translate-x-full"
          } w-64 shadow-xl`}
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
                  className="block px-4 py-2 rounded transition-colors bg-primary/10 hover:bg-accent/30"
                >
                  {item}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        {isSidebarOpen && (
          <div
            className="fixed inset-0 z-30"
            onClick={() => setSidebarOpen(false)}
            aria-hidden="true"
          />
        )}

        {/* Header / Topbar */}
        <header className="relative px-3 py-2 shadow-md flex items-center justify-between gap-2 md:px-6 md:py-3 min-h-[56px] bg-surface/90">
          <div className="absolute inset-0 bg-primary" style={{ opacity: 0.7, zIndex: 1 }} />
          <div className="relative w-full h-10 flex items-center justify-between gap-2" style={{ zIndex: 2 }}>
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
                className="h-full w-auto object-contain"
                style={{ marginRight: "0.5rem" }}
              />
              <span className="select-none bg-gradient-to-r from-leaf/90 to-accent/90 bg-clip-text text-transparent tracking-wide leading-none drop-shadow-sm text-sm sm:text-base md:text-lg">KusinAI</span>
            </Link>

            {/* Search Bar */}
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-background rounded-full flex-shrink min-w-0 w-[140px] sm:w-[240px] md:w-[280px] lg:w-[340px] mx-2 transition-all duration-200 border border-leaf shadow-sm"
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
                onFocus={() => {
                  setShowSearchHint(true);
                  clearTimeout(searchHintTimeoutRef.current);
                  searchHintTimeoutRef.current = setTimeout(() => setShowSearchHint(false), 5000);
                }}
                onBlur={() => {
                  // allow short delay for possible click on close button
                  setTimeout(() => setShowSearchHint(false), 400);
                }}
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
        <main className="flex-grow bg-surface/80 backdrop-blur-sm overflow-y-auto overflow-x-hidden pb-24" id="main-scroll-region">
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
        {/* Search Hint Balloon */}
        {showSearchHint && (
          <div className="pointer-events-none select-none" aria-hidden="true">
            <div
              className="fixed" style={{
                // approximate position near search bar (top header height ~56px)
                top: '70px',
                right: '110px',
                zIndex: 60
              }}
            >
              <div className="relative bg-white border border-leaf/40 shadow-lg rounded-xl px-4 py-3 text-sm w-64 animate-fade-in">
                <button
                  onClick={() => { setShowSearchHint(false); clearTimeout(searchHintTimeoutRef.current); }}
                  className="absolute top-1 right-1 w-6 h-6 flex items-center justify-center rounded-full bg-surface text-leaf hover:bg-leaf hover:text-white pointer-events-auto"
                  aria-label="Close hint"
                >×</button>
                <p className="text-text leading-snug mb-1">Enter only ingredients separated by commas.</p>
                <p className="text-leaf text-xs italic">Example: chicken, garlic, soy sauce</p>
                <div className="absolute -top-2 right-8 w-4 h-4 rotate-45 bg-white border border-leaf/40" />
              </div>
            </div>
          </div>
        )}

        {/* ✅ Success Banner */}
        {addedIngredient && (
          <div className="fixed bottom-6 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-6 py-2 rounded-full shadow-lg text-sm animate-fade-in-out z-50">
            ✅ Added ingredient: <span className="font-semibold capitalize">{addedIngredient}</span>
          </div>
        )}
        {refreshing && (
          <div className="fixed top-5 left-1/2 -translate-x-1/2 bg-accent text-white px-4 py-2 rounded-full shadow z-50 animate-pulse">
            Refreshing...
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
