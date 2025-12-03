/**
 * File: src/components/ui/utils.js
 * Purpose: Local utility helpers for UI components (currently class name joiner).
 * Responsibilities:
 *   - Provide `cn` function to concatenate conditional classes cleanly.
 * Notes:
 *   - Keeps UI components lean by abstracting class merging logic.
 *   - Mirrors similar helper in src/lib/utils.js; duplication maintained for folder locality.
 *   - Candidate for future consolidation if desired; harmless redundancy.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
