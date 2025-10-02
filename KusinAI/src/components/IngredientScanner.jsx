// src/components/IngredientScanner.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // back camera default
  const [error, setError] = useState("");

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
    canvas.getContext("2d").drawImage(videoRef.current, 0, 0);

    canvas.toBlob(async (blob) => {
      try {
        const formData = new FormData();
        formData.append("image", blob, "scan.jpg");

        const res = await axios.post(`${API_URL}/api/scanner`, formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });

        const text = res.data.text?.trim();
        if (!text || text.length < 2) {
          showError("⚠️ Invalid scan. Please try again with clearer input.");
          return;
        }

        setError("");
        onScan(text); // only valid input gets passed
      } catch (err) {
        console.error("OCR scan error:", err);
        showError("❌ Failed to process scan. Please try again.");
      }
    }, "image/jpeg");
  };

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000); // auto-hide after 4s
  };

  return (
    <div className="p-4">
      <div className="flex flex-col items-center">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full max-w-sm rounded border"
        />
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
