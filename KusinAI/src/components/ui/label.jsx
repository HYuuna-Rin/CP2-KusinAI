/**
 * File: src/components/ui/label.jsx
 * Purpose: Accessible label component ensuring consistent typography.
 * Responsibilities:
 *   - Render a <label> element forwarding refs for association with inputs.
 *   - Provide standardized font sizing and weight.
 * Notes:
 *   - No logic beyond presentation.
 *   - Useful for future form abstraction consistency.
 *   - Unaffected by Spoonacular removal.
 */
import * as React from "react";
import { cn } from "../../lib/utils";

const Label = React.forwardRef(function Label({ className, ...props }, ref) {
  return (
    <label
      ref={ref}
      className={cn("text-sm font-medium text-text", className)}
      {...props}
    />
  );
});

export default Label;
