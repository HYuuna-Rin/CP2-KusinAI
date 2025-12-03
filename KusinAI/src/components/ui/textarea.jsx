/**
 * File: src/components/ui/textarea.jsx
 * Purpose: Styled multiline text input for longer freeform content (e.g., steps, substitutions).
 * Responsibilities:
 *   - Render a <textarea> with consistent border, radius, and focus states.
 *   - Allow resizing (vertical) while maintaining minimum height.
 * Notes:
 *   - Uses accent color for focus ring distinct from single-line inputs.
 *   - Supports className extension for specialized contexts.
 *   - Unaffected by Spoonacular removal; used for static substitutions text input.
 */
import React from "react";
import { cn } from "./utils";

export default function Textarea({ className = "", ...props }) {
  return (
    <textarea
      className={cn(
        "w-full rounded-md border border-leaf/40 bg-background px-3 py-2 text-text text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent placeholder:text-leaf/70 resize-y min-h-[120px]",
        className
      )}
      {...props}
    />
  );
}
