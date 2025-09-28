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
    <div
      className="flex min-h-screen bg-cover bg-center"
      style={{
        backgroundImage:
          "url('https://images.unsplash.com/photo-1606788075761-36c9a3ff37f6')",
      }}
    >
      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full bg-gray-900 text-white transform transition-transform duration-300 ease-in-out z-40 ${
          isSidebarOpen ? "translate-x-0" : "translate-x-full"
        } w-64`}
      >
        <div className="flex items-center justify-between p-4 border-b border-gray-700">
          <span className="text-xl font-bold">KusinAI 🤖</span>
          <div className="flex gap-2 items-center">
            {isLoggedIn() && <LogoutButton />}
            <FiX
              className="cursor-pointer text-2xl hover:text-red-400"
              onClick={() => setSidebarOpen(false)}
            />
          </div>
        </div>
        <ul className="flex flex-col p-4 space-y-3 text-lg">
          <li>
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-500/20 rounded"
            >
              Home
            </Link>
          </li>
          <li>
            <Link
              to="/about"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-500/20 rounded"
            >
              About
            </Link>
          </li>
          <li>
            <Link
              to="/feedback"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-500/20 rounded"
            >
              Feedback
            </Link>
          </li>
          <li>
            <Link
              to="/contact"
              onClick={() => setSidebarOpen(false)}
              className="block px-4 py-2 hover:bg-yellow-500/20 rounded"
            >
              Contact
            </Link>
          </li>
        </ul>
      </div>

      {/* Main Content */}
      <div className="flex flex-col flex-grow w-full">
        {/* Topbar */}
        <header className="relative bg-green-900/70 text-white px-3 py-2 shadow-md flex items-center justify-between gap-2 md:px-6 md:py-3 min-h-[56px]">
          <div className="flex items-center flex-shrink-0">
            <Link
              to="/"
              onClick={() => setSidebarOpen(false)}
              className="text-xl font-semibold"
            >
              KusinAI
            </Link>
          </div>
          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center bg-white rounded-full flex-shrink min-w-0 w-[160px] sm:w-[260px] md:w-[280px] lg:w-[340px] mx-2 transition-all duration-200 border border-[#bdbdbd] shadow-sm"
            style={{ minWidth: 0 }}
          >
            <button
              type="submit"
              className="ml-2 p-1 text-gray-500 hover:text-blue-600 flex-shrink-0 focus:outline-none"
              title="Search"
            >
              <FiSearch size={20} />
            </button>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Insert Ingredient/s..."
              className="px-3 py-1 text-[#222] w-full focus:outline-none text-sm sm:text-base min-w-0 bg-transparent placeholder-[#888]"
              style={{ fontWeight: 500 }}
            />
            <button
              type="button"
              className="p-2 text-gray-600 hover:text-blue-600 flex-shrink-0"
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
                className="text-2xl cursor-pointer"
                onClick={() =>
                  role === "admin"
                    ? navigate("/admin/dashboard")
                    : navigate("/profile")
                }
              />
            )}
            <FiMenu
              className="text-2xl cursor-pointer"
              onClick={() => setSidebarOpen(true)}
            />
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-grow bg-black bg-opacity-50 overflow-y-auto">
          {children}
        </main>

        {/* Ingredient Scanner Modal */}
        {scannerOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
            <div className="bg-white p-4 rounded-lg shadow-md text-center w-full max-w-md">
              <h2 className="text-xl font-bold mb-2">Scan Your Ingredients</h2>
              {error && <p className="text-red-500">{error}</p>}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                className="w-full h-auto rounded"
              />
              <canvas ref={canvasRef} className="hidden" />
              <div className="mt-4 flex justify-center gap-4">
                <button
                  onClick={handleCaptureAndScan}
                  disabled={scanning}
                  className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
                >
                  {scanning ? "Processing..." : "Capture"}
                </button>
                <button
                  onClick={() => setScannerOpen(false)}
                  className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MainLayout;
