/**
 * File: src/lib/utils.js
 * Purpose: Shared library-level utilities accessible across non-UI code.
 * Responsibilities:
 *   - Export generic helpers (currently `cn`) for wider project usage.
 * Notes:
 *   - `cn` duplicates logic in ui/utils.js for now; can be unified later.
 *   - Lightweight and side-effect free.
 *   - Unaffected by Spoonacular removal.
 */
export function cn(...classes) {
  return classes.filter(Boolean).join(" ");
}
