import React, { useRef, useState, useEffect } from "react";
import axios from "axios";
import { BASE_URL } from "../Config";

const IngredientScanner = ({ onDetected, onClose }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const startCamera = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        videoRef.current.srcObject = stream;
      } catch (err) {
        setError("Camera access denied");
      }
    };
    startCamera();
  }, []);

  const handleCapture = async () => {
    setLoading(true);
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
        onDetected(ingredients.join(", "));
      } else {
        alert("No ingredients detected.");
      }
      onClose();
    } catch (err) {
      console.error(err);
      setError("Failed to scan ingredients");
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
      <div className="bg-white p-4 rounded-lg shadow-md text-center">
        <h2 className="text-xl font-bold mb-2">Scan Your Ingredients</h2>
        {loading && <p>Scanning...</p>}
        {error && <p className="text-red-500">{error}</p>}
        <video ref={videoRef} autoPlay playsInline className="w-full h-auto rounded" />
        <canvas ref={canvasRef} className="hidden" />
        <div className="mt-4 flex justify-center gap-4">
          <button
            onClick={handleCapture}
            disabled={loading}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            {loading ? "Processing..." : "Capture"}
          </button>
          <button
            onClick={onClose}
            className="bg-gray-400 hover:bg-gray-500 text-white px-4 py-2 rounded"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default IngredientScanner;
