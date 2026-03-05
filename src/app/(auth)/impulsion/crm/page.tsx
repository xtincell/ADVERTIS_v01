// ==========================================================================
// PAGE P.CRM — CRM Pipeline
// Kanban board for managing commercial deals through pipeline stages.
// ==========================================================================

"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

const PipelineBoard = dynamic(
  () => import("~/components/crm/pipeline-board").then((m) => ({ default: m.PipelineBoard })),
  {
    loading: () => (
      <div className="flex items-center justify-center h-[60vh]">
        <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
      </div>
    ),
  },
);
import { CreateDealDialog } from "~/components/crm/create-deal-dialog";

export default function CRMPage() {
  const [showCreate, setShowCreate] = useState(false);

  return (
    <div className="space-y-6 animate-page-enter">
      <PipelineBoard
        onCreateDeal={() => setShowCreate(true)}
        onSelectDeal={(id) => {
          // TODO: open deal detail drawer
          console.log("Select deal:", id);
        }}
      />

      {showCreate && (
        <CreateDealDialog onClose={() => setShowCreate(false)} />
      )}
    </div>
  );
}
