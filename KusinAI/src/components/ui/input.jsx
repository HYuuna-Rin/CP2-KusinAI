/**
 * File: src/components/ui/input.jsx
 * Purpose: Standardized text input with consistent focus ring and disabled states.
 * Responsibilities:
 *   - Render a forwardRef <input> supporting external form libraries or manual focus.
 *   - Apply shared styling (height, padding, border, focus accessibility).
 * Notes:
 *   - Pure UI; does not manage value or validation internally.
 *   - Tailwind classes reference primary color for focus outline.
 *   - Unaffected by Spoonacular removal.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

const Input = React.forwardRef(function Input({ className, ...props }, ref) {
  return (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-text placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      {...props}
    />
  );
});

export default Input;
