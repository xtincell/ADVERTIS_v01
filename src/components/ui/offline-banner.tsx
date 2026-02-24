// ==========================================================================
// COMPONENT C.U10 — OfflineBanner
// Fixed banner shown when the browser is offline.
// Displays a brief "Connexion rétablie" toast when coming back online.
// ==========================================================================

"use client";

import { useEffect, useRef, useState } from "react";
import { WifiOff, Wifi } from "lucide-react";
import { cn } from "~/lib/utils";
import { useOffline } from "~/components/hooks/use-offline";

export function OfflineBanner() {
  const isOffline = useOffline();
  const [showReconnected, setShowReconnected] = useState(false);
  const wasOffline = useRef(false);

  useEffect(() => {
    if (isOffline) {
      wasOffline.current = true;
      setShowReconnected(false);
    } else if (wasOffline.current) {
      // Just came back online
      wasOffline.current = false;
      setShowReconnected(true);
      const timer = setTimeout(() => setShowReconnected(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOffline]);

  // Nothing to render
  if (!isOffline && !showReconnected) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "fixed inset-x-0 top-0 z-[9999] flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium shadow-md transition-all duration-300",
        isOffline
          ? "animate-in slide-in-from-top bg-amber-400 text-amber-950"
          : "animate-out fade-out bg-emerald-500 text-white",
      )}
    >
      {isOffline ? (
        <>
          <WifiOff className="h-4 w-4" />
          <span>{`Vous êtes hors ligne`}</span>
        </>
      ) : (
        <>
          <Wifi className="h-4 w-4" />
          <span>{`Connexion rétablie`}</span>
        </>
      )}
    </div>
  );
}
