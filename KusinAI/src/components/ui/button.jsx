/**
 * File: src/components/ui/button.jsx
 * Purpose: Reusable button component providing consistent styling, sizing, and variant color logic.
 * Responsibilities:
 *   - Render a semantic <button> with shared base classes.
 *   - Support style variants (primary, secondary, outline, ghost, link) and size options.
 *   - Forward ref for integration with parent focus or measurement logic.
 * Notes:
 *   - Uses Tailwind utility classes aligned with the design tokens (primary, accent, leaf, text, surface).
 *   - Unaffected by Spoonacular removal; purely presentational.
 *   - Keeps API minimal: variant, size, className, and native button props.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

const base =
  "inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-60";

const variants = {
  primary: "bg-primary text-white hover:bg-[#449d48] focus-visible:ring-primary",
  secondary: "bg-accent text-white hover:bg-[#ff7a24] focus-visible:ring-accent",
  outline: "border border-gray-300 bg-white text-text hover:bg-gray-50",
  ghost: "bg-transparent hover:bg-black/5 text-text",
  link: "text-leaf underline-offset-4 hover:underline bg-transparent",
};

const sizes = {
  sm: "h-8 px-3",
  md: "h-10 px-4",
  lg: "h-11 px-6 text-base",
};

export const Button = React.forwardRef(function Button(
  { className, variant = "primary", size = "md", ...props },
  ref
) {
  return (
    <button
      ref={ref}
      className={cn(base, variants[variant] || variants.primary, sizes[size], className)}
      {...props}
    />
  );
});

export default Button;
