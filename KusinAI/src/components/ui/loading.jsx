import React from "react";

export default function LoadingOverlay({ text = "Loading..." }) {
  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/30" />
      <div className="relative bg-surface/90 backdrop-blur-sm px-4 py-3 rounded-xl shadow text-text flex items-center gap-3">
        <div className="w-6 h-6 border-2 border-leaf border-t-transparent rounded-full animate-spin" />
        <span className="font-medium">{text}</span>
      </div>
    </div>
  );
}
