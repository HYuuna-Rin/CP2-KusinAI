/**
 * File: src/components/ui/card.jsx
 * Purpose: Small layout primitives for grouping related content (Card + subcomponents).
 * Responsibilities:
 *   - Provide a styled container with surface background, border, and padding.
 *   - Expose header, title, and content wrappers for semantic composition.
 * Notes:
 *   - Presentational only; no state or external side effects.
 *   - Style tokens reflect brand palette (surface/text).
 *   - Unaffected by portal usage or Spoonacular removal.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

export function Card({ className, ...props }) {
  return (
    <div className={cn("rounded-xl border border-black/5 bg-surface p-6 shadow-sm", className)} {...props} />
  );
}

export function CardHeader({ className, ...props }) {
  return <div className={cn("mb-4", className)} {...props} />;
}

export function CardTitle({ className, ...props }) {
  return <h3 className={cn("text-lg font-semibold text-text", className)} {...props} />;
}

export function CardContent({ className, ...props }) {
  return <div className={cn("text-text", className)} {...props} />;
}
