/**
 * File: src/components/ui/loading.jsx
 * Purpose: Full-screen loading overlay for async operations providing user feedback.
 * Responsibilities:
 *   - Dim background and present a spinner with optional text.
 *   - Maintain visual hierarchy using z-index and backdrop blur.
 * Notes:
 *   - Spinner uses Tailwind animation; can be swapped for system indicator later.
 *   - Non-blocking pattern; parent controls conditional render.
 *   - Unaffected by Spoonacular removal or portal needs (already fixed positioning).
 */
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
