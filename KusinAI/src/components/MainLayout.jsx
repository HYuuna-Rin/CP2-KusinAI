import IngredientScanner from "./IngredientScanner";
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FiMenu, FiX, FiCamera, FiUser, FiSearch } from "react-icons/fi";
import LogoutButton from "./LogoutButton";
import { isLoggedIn } from "../utils/auth";
import axios from "axios";
import { BASE_URL } from "../Config";
import { jwtDecode } from "jwt-decode";

const MainLayout = ({ children }) => {
  const [isSidebarOpen, setSidebarOpen] = useState(false);
  const [searchInput, setSearchInput] = useState("");
  const [scannerOpen, setScannerOpen] = useState(false);
  const [scanning, setScanning] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const navigate = useNavigate();

  // ✅ Get role from JWT
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

  // Start camera stream
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      videoRef.current.srcObject = stream;
    } catch (err) {
      setError("Camera access denied");
    }
  };

  const handleCaptureAndScan = async () => {
    setScanning(true);
    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext("2d");

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const imageBase64 = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const res = await axios.post(`${BASE_URL}/scanner/scan`, { imageBase64 });
      const ingredients = res.data.ingredients || [];

      if (ingredients.length > 0) {
        setSearchInput((prev) =>
          prev ? `${prev}, ${ingredients.join(", ")}` : ingredients.join(", ")
        );
      } else {
        alert("No ingredients detected.");
      }
      setScannerOpen(false);
    } catch (err) {
      console.error(err);
      setError("Failed to scan ingredients");
    }
    setScanning(false);
  };

  return (
  <div className="flex min-h-screen relative bg-background">
      {/* Background image with low opacity overlay */}
      <div className="fixed inset-0 w-full h-full z-0 pointer-events-none" aria-hidden="true">
        <img
          src="/assets/KusinAIBG.png"
          alt="background"
          className="w-full h-full object-cover"
          style={{ opacity: 1 }}
        />
      </div>
  {/* Main content wrapper with relative positioning and full opacity */}
  <div className="flex flex-col flex-grow w-full relative z-10">
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-tamarind text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b border-leaf">
          <span className="text-xl font-bold text-accent">KusinAI 🤖</span>
          <div className="flex gap-2 items-center">
            {isLoggedIn() && <LogoutButton />}
            <FiX
              className="cursor-pointer text-2xl hover:text-accent"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        </div>
        <ul className="flex flex-col p-4 space-y-3 text-lg">
          <li>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-leaf/30 rounded transition-colors"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-leaf/30 rounded transition-colors"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/feedback"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-leaf/30 rounded transition-colors"
            >
              Feedback
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-leaf/30 rounded transition-colors"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow w-full">
        {/* Topbar */}
        <header className="relative px-3 py-2 shadow-md flex items-center justify-between gap-2 md:px-6 md:py-3 min-h-[56px] bg-surface/90">
          {/* Topbar background overlay */}
          <div className="absolute inset-0 bg-primary" style={{ opacity: 0.70, zIndex: 1 }} />
          <div className="relative w-full flex items-center justify-between gap-2" style={{ zIndex: 2 }}>
            <div className="flex items-center flex-shrink-0 h-full">
              <Link
                to="/"
                onClick={() => setSidebarOpen(false)}
                className="flex items-center gap-2 h-full"
                style={{ fontFamily: 'Poppins, Montserrat, Quicksand, Arial, sans-serif', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '0.02em' }}
              >
                <img
                  src="/assets/KusinAILogo.png"
                  alt="KusinAI Logo"
                  className="h-full max-h-[36px] w-auto object-contain"
                  style={{ marginRight: '0.5rem', display: 'block', padding: 0, marginTop: 0, marginBottom: 0 }}
                />
                <span className="text-text" style={{ textShadow: '0 1px 2px #fff8' }}>Kusin<span className="text-accent drop-shadow-md">AI</span></span>
              </Link>
            </div>
            <form
              onSubmit={handleSearchSubmit}
              className="flex items-center bg-background rounded-full flex-shrink min-w-0 w-[160px] sm:w-[260px] md:w-[280px] lg:w-[340px] mx-2 transition-all duration-200 border border-leaf shadow-sm"
              style={{ minWidth: 0 }}
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
                onClick={() => {
                  setScannerOpen(true);
                  setTimeout(startCamera, 300);
                }}
                title="Scan ingredient"
              >
                <FiCamera size={20} />
              </button>
            </form>
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

        {/* Page Content */}
  <main className="flex-grow bg-background bg-opacity-90 overflow-y-auto">
          {children}
        </main>

        {/* Ingredient Scanner Modal */}
        {scannerOpen && (
          <div className="fixed inset-0 bg-tamarind bg-opacity-90 flex items-center justify-center z-50">
            <div className="bg-surface p-4 rounded-lg shadow-md text-center w-full max-w-md">
              <h2 className="text-xl font-bold mb-2 text-primary">Scan Your Ingredients</h2>
              <IngredientScanner
                onScan={(text) => {
                  setSearchInput((prev) => prev ? `${prev}, ${text}` : text);
                  setScannerOpen(false);
                }}
              />
              <button
                onClick={() => setScannerOpen(false)}
                className="mt-4 bg-accent hover:bg-leaf text-white px-4 py-2 rounded"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
    </div>
  );
};

export default MainLayout;
