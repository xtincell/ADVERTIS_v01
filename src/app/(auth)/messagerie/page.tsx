// ==========================================================================
// PAGE P.MSG1 — Messagerie (Internal Messaging)
// Cross-portal messaging interface.
// ==========================================================================

"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const Inbox = dynamic(
  () => import("~/components/messaging/inbox").then((m) => ({ default: m.Inbox })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);

export default function MessageriePage() {
  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      <Inbox />
    </div>
  );
}
