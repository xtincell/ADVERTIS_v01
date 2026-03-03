// ==========================================================================
// PAGE P.OS6 — Programme Apôtres (Ambassadors)
// Brand ambassador management in Brand OS portal.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { AmbassadorBoard } from "~/components/brand-os/ambassador-board";

export default function ApostresPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement du programme Apôtres...
          </div>
        </div>
      }
    >
      <div className="p-4 md:p-6 max-w-7xl mx-auto">
        <AmbassadorBoard />
      </div>
    </Suspense>
  );
}
