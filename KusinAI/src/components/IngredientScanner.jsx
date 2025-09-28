// src/components/IngredientScanner.jsx
import React, { useState } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = () => {
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [ingredients, setIngredients] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImage(file);
      setPreview(URL.createObjectURL(file));
    }
  };

  const handleScan = async () => {
    if (!image) return;
    setLoading(true);
    setError("");
    setIngredients([]);

    try {
      // Convert to Base64
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = reader.result.split(",")[1];

        const res = await axios.post(`${API_URL}/api/scanner/scan`, {
          imageBase64: base64,
        });

        setIngredients(res.data.ingredients || []);
      };
      reader.readAsDataURL(image);
    } catch (err) {
      console.error("❌ Scan error:", err);
      setError("Failed to scan image. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-4 bg-white shadow rounded">
      <h2 className="text-xl font-bold mb-4">📷 Ingredient Scanner</h2>

      <input
        type="file"
        accept="image/*"
        onChange={handleImageUpload}
        className="mb-4"
      />

      {preview && (
        <img
          src={preview}
          alt="Preview"
          className="w-full h-64 object-cover rounded mb-4"
        />
      )}

      <button
        onClick={handleScan}
        disabled={!image || loading}
        className={`w-full py-2 px-4 rounded text-white font-semibold ${
          loading ? "bg-gray-400" : "bg-yellow-500 hover:bg-yellow-600"
        }`}
      >
        {loading ? "🔎 Scanning..." : "Scan Ingredients"}
      </button>

      {error && <p className="text-red-500 mt-3">{error}</p>}

      {ingredients.length > 0 && (
        <div className="mt-4">
          <h3 className="font-semibold">Detected Ingredients:</h3>
          <ul className="list-disc list-inside">
            {ingredients.map((ing, idx) => (
              <li key={idx}>{ing}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;
