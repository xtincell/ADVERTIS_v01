// ==========================================================================
// PAGE P.CRM — CRM Pipeline
// Kanban board for managing commercial deals through pipeline stages.
// ==========================================================================

"use client";

import { useState } from "react";
import { PipelineBoard } from "~/components/crm/pipeline-board";
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
