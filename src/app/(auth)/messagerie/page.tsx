// ==========================================================================
// PAGE P.MSG1 — Messagerie (Internal Messaging)
// Cross-portal messaging interface.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { Inbox } from "~/components/messaging/inbox";

export default function MessageriePage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement de la messagerie...
          </div>
        </div>
      }
    >
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <Inbox />
      </div>
    </Suspense>
  );
}
