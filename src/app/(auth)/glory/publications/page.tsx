// ==========================================================================
// PAGE P.GL5 — Publications (Editorial Calendar)
// Content publication management in GLORY portal.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PublicationCalendar = dynamic(
  () => import("~/components/glory/publication-calendar").then((m) => ({ default: m.PublicationCalendar })),
  {
    loading: () => (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

function PublicationsContent() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId");

  if (!strategyId) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] gap-3">
        <p className="text-muted-foreground text-sm">
          Sélectionnez une stratégie pour voir le calendrier éditorial.
        </p>
        <p className="text-muted-foreground text-xs max-w-sm text-center">
          Utilisez le sélecteur de stratégie dans le header pour choisir une marque.
        </p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <PublicationCalendar strategyId={strategyId} />
    </div>
  );
}

export default function PublicationsPage() {
  return (
    <Suspense
      fallback={
        <div className="p-6 flex items-center justify-center h-[60vh]">
          <div className="text-muted-foreground animate-pulse">
            Chargement des publications...
          </div>
        </div>
      }
    >
      <PublicationsContent />
    </Suspense>
  );
}
