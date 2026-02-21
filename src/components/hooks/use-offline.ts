// ==========================================================================
// HOOK H.5 — useOffline
// Detects online/offline status for PWA offline-aware UI.
// ==========================================================================

"use client";

import { useState, useEffect } from "react";

/**
 * Hook: Returns true when the browser is offline.
 * Listens to online/offline events for real-time status.
 */
export function useOffline(): boolean {
  const [isOffline, setIsOffline] = useState(false);

  useEffect(() => {
    // Set initial value (SSR-safe: default to online)
    setIsOffline(!navigator.onLine);

    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);

    window.addEventListener("offline", goOffline);
    window.addEventListener("online", goOnline);

    return () => {
      window.removeEventListener("offline", goOffline);
      window.removeEventListener("online", goOnline);
    };
  }, []);

  return isOffline;
}
