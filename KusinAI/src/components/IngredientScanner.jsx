// src/components/IngredientScanner.jsx
import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detected, setDetected] = useState(null);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      showError("⚠️ Please select a valid image file.");
      return;
    }

    setLoading(true);
    setError("");
    setDetected(null);
    setImagePreview(URL.createObjectURL(file));

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const imageBase64 = reader.result.split(",")[1];

        try {
          const res = await axios.post(
            `${API_URL}/api/scanner/scan`,
            { imageBase64 },
            { headers: { "Content-Type": "application/json" } }
          );

          console.log("📸 Scanner API response:", res.data);

          const { best, message } = res.data;
          if (!best) {
            showError("⚠️ No clear ingredients detected. Try again.");
            return;
          }

          // Store detected ingredient for user confirmation
          setDetected({ best, message });
        } catch (err) {
          console.error("Scanner API error:", err);
          showError(
            "❌ Failed to process image. " +
              (err.response?.data?.error || err.message)
          );
        } finally {
          setLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (err) {
      console.error("File read error:", err);
      showError("❌ Failed to read image.");
      setLoading(false);
    }
  };

  const handleUseDetected = () => {
    if (detected?.best) {
      onScan(detected.best); // Auto-fill search bar with detected ingredient
      setDetected(null);
    }
  };

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Scan Your Ingredients
      </h2>

      <div className="relative w-full max-w-sm bg-white shadow-md rounded-xl p-4 flex flex-col items-center border border-yellow-100">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full rounded-md object-cover mb-3 shadow-sm"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-50 flex items-center justify-center rounded-md text-gray-400">
            No image selected
          </div>
        )}

        <label className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded cursor-pointer mt-3 transition-all">
          {loading ? "🔍 Scanning..." : "📷 Open Camera"}
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />
        </label>

        <button
          onClick={() => {
            setImagePreview(null);
            setError("");
            setDetected(null);
          }}
          className="mt-2 text-gray-500 hover:text-gray-700 text-sm transition-all"
        >
          Clear
        </button>
      </div>

      {/* ✅ Success Popup */}
      {detected && (
        <div className="mt-4 bg-green-50 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-md w-full max-w-sm">
          <div className="font-semibold text-green-800">
            ✅ Detected Ingredient:
          </div>
          <p className="mt-1 text-lg font-medium capitalize">
            {detected.best}
          </p>
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={handleUseDetected}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1 rounded-md text-sm"
            >
              Use
            </button>
            <button
              onClick={() => setDetected(null)}
              className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-md text-sm"
            >
              Retry
            </button>
          </div>
        </div>
      )}

      {/* ⚠️ Error Popup */}
      {error && (
        <div className="mt-4 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md w-full max-w-sm text-sm">
          <div className="font-bold">Error</div>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;
