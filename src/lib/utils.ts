// =============================================================================
// LIB L.0 — Utilities
// =============================================================================
// Shared utility functions used across the application.
// Exports: cn() — Tailwind CSS class merger (clsx + tailwind-merge).
// Used by: virtually every UI component for conditional class composition.
// =============================================================================

import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}
