// src/components/IngredientScanner.jsx
import React, { useState, useRef } from "react";
import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan }) => {
  const videoRef = useRef(null);
  const [stream, setStream] = useState(null);
  const [cameraFacing, setCameraFacing] = useState("environment"); // back camera default
  const [error, setError] = useState("");
  const [zoom, setZoom] = useState(1);

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
      setError("Unable to access camera. Please allow permissions.");
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

  const handleZoom = (e) => {
    const videoTrack = stream?.getVideoTracks()[0];
    const capabilities = videoTrack?.getCapabilities();
    if (!capabilities?.zoom) return;

    const newZoom = Math.min(Math.max(zoom + e, capabilities.zoom.min), capabilities.zoom.max);
    videoTrack.applyConstraints({ advanced: [{ zoom: newZoom }] });
    setZoom(newZoom);
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
          setError("⚠️ Invalid scan. Please try again.");
          return;
        }

        setError("");
        onScan(text); // pass only valid input
      } catch (err) {
        console.error("OCR scan error:", err);
        setError("❌ Failed to process scan.");
      }
    }, "image/jpeg");
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
        <div className="flex gap-2 mt-3">
          {!stream ? (
            <button
              onClick={startCamera}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
            >
              Start Camera
            </button>
          ) : (
            <button
              onClick={stopCamera}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded"
            >
              Stop Camera
            </button>
          )}
          <button
            onClick={flipCamera}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded"
          >
            Flip Camera
          </button>
          {stream && (
            <>
              <button
                onClick={() => handleZoom(0.5)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                ➕ Zoom
              </button>
              <button
                onClick={() => handleZoom(-0.5)}
                className="bg-gray-500 hover:bg-gray-600 text-white px-3 py-1 rounded"
              >
                ➖ Zoom
              </button>
              <button
                onClick={captureAndScan}
                className="bg-yellow-500 hover:bg-yellow-600 text-white px-4 py-2 rounded"
              >
                Scan
              </button>
            </>
          )}
        </div>
        {error && <p className="text-red-600 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default IngredientScanner;
