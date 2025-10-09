// src/components/IngredientScanner.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // back camera default
  const [error, setError] = useState("");
  // Focus rectangle state
  const [focusRect, setFocusRect] = useState({ x: 0.5, y: 0.5 }); // normalized center

  const startCamera = async () => {
    try {
      const constraints = {
        video: {
          facingMode: cameraFacing,
        },
      };
      const mediaStream = await navigator.mediaDevices.getUserMedia(constraints);
      setStream(mediaStream);
      videoRef.current.srcObject = mediaStream;
    } catch (err) {
      console.error("Camera access error:", err);
      showError("Unable to access camera. Please allow permissions.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
  };

  const flipCamera = () => {
    stopCamera();
    setCameraFacing((prev) => (prev === "environment" ? "user" : "environment"));
    setTimeout(startCamera, 200);
  };

  const captureAndScan = async () => {
    if (!videoRef.current) return;

    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);

    // Optionally, crop to focus rectangle (UI only, not true camera focus)
    // For now, just draw a rectangle overlay for user guidance
    const imageBase64 = canvas.toDataURL("image/jpeg").split(",")[1];

    try {
      const res = await axios.post(
        `${API_URL}/api/scanner/scan`,
        { imageBase64 },
        { headers: { "Content-Type": "application/json" } }
      );

      // Debug: log the full backend response
      console.log("Scanner API response:", res.data);

      const ingredients = res.data.ingredients;
      if (!ingredients || !Array.isArray(ingredients) || ingredients.length === 0 || ingredients[0] === "No clear ingredients detected") {
        showError("⚠️ No clear ingredients detected. Try again.\nRaw response: " + JSON.stringify(res.data));
        return;
      }

      setError("");
      onScan(ingredients.join(", "));
    } catch (err) {
      // Debug: log error details
      if (err.response) {
        console.error("Ingredient scan error (response):", err.response.data);
        showError("❌ Failed to process scan. Server error: " + JSON.stringify(err.response.data));
      } else {
        console.error("Ingredient scan error:", err);
        showError("❌ Failed to process scan. " + err.message);
      }
    }
  };

  // Handle user click/tap to set focus rectangle
  const handleVideoClick = (e) => {
    const rect = e.target.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;
    setFocusRect({ x, y });
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000); // auto-hide after 4s
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <div className="relative w-full max-w-sm aspect-video" style={{ minHeight: 200 }}>
          <video
            ref={videoRef}
            autoPlay
            playsInline
            className="w-full h-full rounded border object-cover"
            onClick={handleVideoClick}
            style={{ cursor: 'crosshair' }}
          />
          {/* Focus rectangle overlay */}
          <div
            style={{
              position: 'absolute',
              left: `calc(${focusRect.x * 100}% - 40px)` ,
              top: `calc(${focusRect.y * 100}% - 40px)` ,
              width: 80,
              height: 80,
              border: '2px solid #facc15', // yellow-400
              borderRadius: 12,
              pointerEvents: 'none',
              boxShadow: '0 0 8px 2px #facc15',
              transition: 'left 0.2s, top 0.2s',
            }}
          />
        </div>
        <div className="flex flex-wrap justify-center gap-2 mt-3">
          {!stream ? (
            <button
              onClick={startCamera}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Camera
            </button>
          ) : (
            <>
              <button
                onClick={captureAndScan}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Capture
              </button>
              <button
                onClick={flipCamera}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
              >
                Flip
              </button>
              <button
                onClick={stopCamera}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
              >
                Cancel
              </button>
            </>
          )}
        </div>

        {/* Error Popup */}
        {error && (
          <div className="mt-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative w-full max-w-sm">
            <strong className="font-bold">Error:</strong>
            <span className="block sm:inline ml-2">{error}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default IngredientScanner;
