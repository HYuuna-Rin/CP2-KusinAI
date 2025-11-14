/*
  File: src/components/IngredientScanner.jsx
  Purpose: UI component to scan and extract ingredient text from images.
  Responsibilities:
  - Capture/accept an image input and invoke scanner APIs.
  - Return normalized ingredient strings back to parent via callbacks.
  Notes: Heavy OCR/ML work should live in the backend or native layers.
*/
import React, { useState, useRef, useEffect } from "react";
import axios from "axios";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";

const API_URL = import.meta.env.VITE_API_URL;

const IngredientScanner = ({ onScan, onClose }) => {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [detected, setDetected] = useState(null);
  const [selected, setSelected] = useState([]);
  const [thumbnails, setThumbnails] = useState({});
  const [learnCandidate, setLearnCandidate] = useState(null);
  const [learnInfo, setLearnInfo] = useState(null);
  const fileInputRef = useRef(null);

  const showError = (msg) => {
    setError(msg);
    setTimeout(() => setError(""), 4000);
  };

  // ✅ Handles camera or file upload (depending on environment)
  const handleOpenCamera = async (e) => {
    try {
      // Detect if running in web or native app
      const isWeb = !("Capacitor" in window) || !window.Capacitor.isNativePlatform();

      if (isWeb) {
        // fallback: open file picker (web)
        fileInputRef.current?.click();
        return;
      }

      // 📸 Use Capacitor Camera API (for Android/iOS app)
      const image = await Camera.getPhoto({
        quality: 85,
        resultType: CameraResultType.Base64,
        source: CameraSource.Camera,
        correctOrientation: true,
      });

      if (!image?.base64String) {
        showError("No image captured.");
        return;
      }

      setImagePreview(`data:image/jpeg;base64,${image.base64String}`);
      processImage(image.base64String);
    } catch (err) {
      console.error("Camera error:", err);
      showError("Failed to open camera or capture image.");
    }
  };

  // ✅ Shared function to process images from camera or upload
  const processImage = async (imageBase64) => {
    setLoading(true);
    setError("");
    setDetected(null);
    setSelected([]);

    try {
      const res = await axios.post(
        `${API_URL}/api/scanner/scan`,
        { imageBase64 },
        { headers: { "Content-Type": "application/json" } }
      );

      console.log("📸 Scanner API response:", res.data);
      const { candidates, message } = res.data;

      if (!candidates || candidates.length === 0) {
        showError("⚠️ No clear ingredients detected. Try again.");
        return;
      }

      const sorted = candidates
        .map((c) => ({
          name: c.name,
          score: c.score || 0,
          boundingPoly: c.boundingPoly || null,
          source: c.source || "unknown",
        }))
        .sort((a, b) => (b.score || 0) - (a.score || 0));

      setDetected({ candidates: sorted, message });
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

  // ✅ File upload (fallback for web)
  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      showError("⚠️ Please select a valid image file.");
      return;
    }

    const reader = new FileReader();
    reader.onloadend = async () => {
      const imageBase64 = reader.result.split(",")[1];
      setImagePreview(reader.result);
      await processImage(imageBase64);
    };
    reader.readAsDataURL(file);
  };

  const toggleSelection = (ingredient) => {
    setSelected((prev) =>
      prev.includes(ingredient)
        ? prev.filter((i) => i !== ingredient)
        : [...prev, ingredient]
    );
  };

  // Crop helper (unchanged)
  const getCroppedDataUrl = (candidate) => {
    return new Promise((resolve) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        const cw = img.naturalWidth;
        const ch = img.naturalHeight;
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const THUMB = 160;

        const hasNormalized =
          candidate.boundingPoly && candidate.boundingPoly.normalizedVertices;
        const hasVertices =
          candidate.boundingPoly && candidate.boundingPoly.vertices;

        let minX = 0,
          minY = 0,
          maxX = cw,
          maxY = ch;

        if (hasNormalized) {
          const vs = candidate.boundingPoly.normalizedVertices;
          const xs = vs.map((v) => v.x || 0);
          const ys = vs.map((v) => v.y || 0);
          minX = Math.max(0, Math.min(...xs) * cw);
          minY = Math.max(0, Math.min(...ys) * ch);
          maxX = Math.min(cw, Math.max(...xs) * cw);
          maxY = Math.min(ch, Math.max(...ys) * ch);
        } else if (hasVertices) {
          const vs = candidate.boundingPoly.vertices;
          const xs = vs.map((v) => v.x || 0);
          const ys = vs.map((v) => v.y || 0);
          minX = Math.max(0, Math.min(...xs));
          minY = Math.max(0, Math.min(...ys));
          maxX = Math.min(cw, Math.max(...xs));
          maxY = Math.min(ch, Math.max(...ys));
        }

        const boxW = Math.max(20, maxX - minX);
        const boxH = Math.max(20, maxY - minY);
        const padW = boxW * 0.2;
        const padH = boxH * 0.2;

        let cropX = Math.max(0, minX - padW);
        let cropY = Math.max(0, minY - padH);
        let cropW = Math.min(cw, maxX + padW) - cropX;
        let cropH = Math.min(ch, maxY + padH) - cropY;

        if (cropW <= 0 || cropH <= 0) {
          cropX = 0;
          cropY = 0;
          cropW = cw;
          cropH = ch;
        }

        canvas.width = THUMB;
        canvas.height = THUMB;
        ctx.drawImage(
          img,
          cropX,
          cropY,
          cropW,
          cropH,
          0,
          0,
          canvas.width,
          canvas.height
        );
        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.onerror = () => resolve(null);
      img.src = imagePreview;
    });
  };

  // Precompute thumbnails
  useEffect(() => {
    let mounted = true;
    if (!detected || !detected.candidates || !imagePreview) return;
    (async () => {
      const out = {};
      for (const c of detected.candidates) {
        try {
          const dataUrl = await getCroppedDataUrl(c);
          out[c.name] = dataUrl;
        } catch {
          out[c.name] = null;
        }
      }
      if (mounted) setThumbnails(out);
    })();
    return () => {
      mounted = false;
    };
  }, [detected, imagePreview]);

  // Learn modal logic unchanged
  const openLearn = async (candidate) => {
    setLearnCandidate(candidate);
    setLearnInfo(null);
    try {
      const wiki = await fetch(
        `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(
          candidate.name
        )}`
      );
      if (!wiki.ok) throw new Error("no-wiki");
      const data = await wiki.json();
      setLearnInfo({
        title: data.title,
        extract: data.extract,
        thumbnail: data.thumbnail?.source,
      });
    } catch {
      setLearnInfo({
        title: candidate.name,
        extract: `No quick summary found for "${candidate.name}".`,
        thumbnail: null,
      });
    }
  };

  const closeLearn = () => {
    setLearnCandidate(null);
    setLearnInfo(null);
  };

  const handleUseDetected = () => {
    if (selected.length > 0) onScan(selected.join(", "));
    else if (detected?.best) onScan(detected.best);
    setDetected(null);
    setSelected([]);
  };

  const clearAll = () => {
    setImagePreview(null);
    setError("");
    setDetected(null);
    setSelected([]);
  };

  return (
    <div className="p-4 flex flex-col items-center w-full max-w-sm h-[90vh] overflow-hidden relative">
      <button
        aria-label="Close scanner"
        onClick={() => onClose && onClose()}
        className="absolute top-3 right-3 z-50 w-8 h-8 rounded-full bg-white/90 hover:bg-white shadow flex items-center justify-center text-gray-600"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>

      <h2 className="text-xl font-semibold text-gray-800 mb-3 shrink-0">
        Scan Your Ingredients
      </h2>

      <div className="flex flex-col flex-1 w-full overflow-y-auto items-center space-y-3">
        <div className="relative w-full bg-white shadow-md rounded-xl p-3 flex flex-col items-center border border-yellow-100">
          {imagePreview ? (
            <img
              src={imagePreview}
              alt="Preview"
              className="w-full rounded-md object-cover mb-3 shadow-sm max-h-[35vh] object-contain"
            />
          ) : (
            <div className="w-full aspect-video bg-gray-50 flex items-center justify-center rounded-md text-gray-400">
              No image selected
            </div>
          )}

          <button
            onClick={handleOpenCamera}
            disabled={loading}
            className="bg-green-600 hover:bg-green-700 text-white px-5 py-2 rounded mt-2 transition-all shrink-0"
          >
            {loading ? "🔍 Scanning..." : "📷 Open Camera"}
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleImageUpload}
            className="hidden"
          />

          <button
            onClick={clearAll}
            className="mt-2 text-gray-500 hover:text-gray-700 text-sm transition-all"
          >
            Clear
          </button>
        </div>

        {detected && (
          <div className="bg-green-50 border border-green-400 text-green-700 rounded-lg shadow-md w-full flex flex-col max-h-[50vh] overflow-hidden">
            <div className="font-semibold text-green-800 p-3 border-b border-green-200">
              ✅ Detected Ingredients:
            </div>
            <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-3">
              <div className="flex flex-wrap gap-3 justify-center">
                {detected.candidates.map((item, idx) => (
                  <div key={idx} className="flex flex-col items-center w-28">
                    <button
                      onClick={() => toggleSelection(item.name)}
                      className={`w-28 h-28 rounded-md overflow-hidden border transition-transform duration-200 mb-2 transform ${selected.includes(item.name) ? 'ring-2 ring-yellow-400 scale-105' : 'bg-white hover:scale-105'} `}
                    >
                      {thumbnails[item.name] ? (
                        <img src={thumbnails[item.name]} alt={item.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-sm text-gray-500">{item.name}</div>
                      )}
                    </button>
                    <div className="text-xs text-center">
                      <div className="font-medium">{item.name.charAt(0).toUpperCase() + item.name.slice(1)}</div>
                      <div className="text-xs opacity-70">{Math.round((item.score || 0) * 100)}%</div>
                    </div>
                    <div className="flex gap-1 mt-1">
                      <button onClick={() => openLearn(item)} className="text-xs px-2 py-1 bg-yellow-100 rounded">Learn</button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end gap-2 border-t border-green-200 p-3 bg-green-50 sticky bottom-0">
              <button
                onClick={handleUseDetected}
                className={`px-4 py-1 rounded-md text-sm font-medium transition-all ${selected.length > 0
                    ? "bg-green-600 text-white hover:bg-green-700"
                    : "bg-gray-300 text-gray-600 cursor-not-allowed"
                  }`}
                disabled={selected.length === 0}
              >
                Use Selected
              </button>
              <button
                onClick={() => {
                  setDetected(null);
                  setSelected([]);
                }}
                className="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-1 rounded-md text-sm"
              >
                Retry
              </button>
            </div>
          </div>
        )}

        {/* Learn modal */}
        {learnCandidate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 p-4">
            <div className="bg-white rounded-lg shadow-lg w-full max-w-lg p-4">
              <div className="flex justify-between items-start">
                <h3 className="text-lg font-semibold">{learnInfo?.title || learnCandidate.name}</h3>
                <button onClick={closeLearn} className="text-gray-500">Close</button>
              </div>
              <div className="mt-3 flex gap-4">
                <div className="w-36 h-36 bg-gray-100 flex items-center justify-center rounded-md overflow-hidden">
                  {learnInfo?.thumbnail ? (
                    <img src={learnInfo.thumbnail} className="w-full h-full object-cover" alt="thumb" />
                  ) : (
                    // Neutral placeholder matching app theme (green/yellow)
                    <div className="w-full h-full flex flex-col items-center justify-center bg-yellow-50 text-yellow-700">
                      <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 opacity-90" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                        <path d="M12 2C9 2 7 4 7 7c0 3 2 6 5 6s5-3 5-6c0-3-2-5-5-5z" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                        <circle cx="12" cy="15" r="6" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      <div className="text-xs mt-2">No image available</div>
                    </div>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm text-gray-700">{learnInfo?.extract || 'No description available.'}</p>
                  <div className="mt-4 flex gap-2">
                    <button onClick={() => { onScan(learnCandidate.name); closeLearn(); }} className="bg-green-600 text-white px-3 py-1 rounded">Use this</button>
                    <a target="_blank" rel="noreferrer" href={`https://en.wikipedia.org/wiki/${encodeURIComponent(learnCandidate.name)}`} className="px-3 py-1 bg-gray-200 rounded">Open Wiki</a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-2 bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded-lg shadow-md w-full text-sm">
          <div className="font-bold">Error</div>
          <p>{error}</p>
        </div>
      )}
    </div>
  );
};

export default IngredientScanner;
