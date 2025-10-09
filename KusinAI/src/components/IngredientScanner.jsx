// src/components/IngredientScanner.jsx
import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);

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

          const ingredients = res.data.ingredients;

          if (
            !ingredients ||
            !Array.isArray(ingredients) ||
            ingredients.length === 0 ||
            ingredients[0] === "No clear ingredients detected"
          ) {
            showError("⚠️ No clear ingredients detected. Try again.");
            return;
          }

          onScan(ingredients.join(", "));
        } catch (err) {
          console.error("Scanner API error:", err);
          showError("❌ Failed to process image. Please try again.");
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

  return (
    <div className="p-6 flex flex-col items-center">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Scan Your Ingredients
      </h2>

      <div className="relative w-full max-w-sm bg-white shadow-md rounded-lg p-4 flex flex-col items-center">
        {imagePreview ? (
          <img
            src={imagePreview}
            alt="Preview"
            className="w-full rounded-md object-cover mb-3"
          />
        ) : (
          <div className="w-full aspect-video bg-gray-100 flex items-center justify-center rounded-md text-gray-500">
            No image selected
          </div>
        )}

        <label className="bg-green-500 hover:bg-green-600 text-white px-5 py-2 rounded cursor-pointer mt-3">
          {loading ? "Scanning..." : "Open Camera"}
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
          }}
          className="mt-2 text-gray-500 hover:text-gray-700 text-sm"
        >
          Clear
        </button>
      </div>

      {error && (
        <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md w-full max-w-sm text-sm">
          <div className="font-bold">Error</div>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;
