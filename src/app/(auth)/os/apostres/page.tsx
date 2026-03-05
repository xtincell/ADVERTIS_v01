// ==========================================================================
// PAGE P.OS6 — Programme Apôtres (Ambassadors)
// Brand ambassador management in Brand OS portal.
// ==========================================================================

"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const AmbassadorBoard = dynamic(
  () => import("~/components/brand-os/ambassador-board").then((m) => ({ default: m.AmbassadorBoard })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export default function ApostresPage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <AmbassadorBoard />
    </div>
  );
}
