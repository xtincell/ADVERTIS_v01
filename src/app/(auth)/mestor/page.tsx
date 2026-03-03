// ==========================================================================
// PAGE P.MESTOR — MESTOR AI Strategic Advisor
// AI-powered strategic conversation interface.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { MestorChat } from "~/components/mestor/mestor-chat";

function MestorContent() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <MestorChat strategyId={strategyId} />
    </div>
  );
}

export default function MestorPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement de MESTOR AI...
          </div>
        </div>
      }
    >
      <MestorContent />
    </Suspense>
  );
}
