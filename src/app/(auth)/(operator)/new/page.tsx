// ==========================================================================
// PAGE P.4 — Creation
// Thin wrapper around CreationSheet. Auto-opens on mount, redirects to
// dashboard on close. Minimal background behind the sheet overlay.
// ==========================================================================

"use client";

import { useRouter } from "next/navigation";
import { CreationSheet } from "~/components/creation/creation-sheet";

export default function CreationPage() {
  const router = useRouter();

  return (
    <div className="min-h-screen">
      <CreationSheet
        open={true}
        onOpenChange={(open) => {
          if (!open) {
            router.push("/");
          }
        }}
      />
    </div>
  );
}
