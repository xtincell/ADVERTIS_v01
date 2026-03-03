// ==========================================================================
// PAGE P.OS4 — Brand OS / Actions
// Command center — prioritized action queue.
// ==========================================================================

"use client";

import { Suspense } from "react";
import { api } from "~/trpc/react";
import { useBrandId } from "~/components/brand-os/brand-selector";
import { ActionQueue } from "~/components/brand-os/action-queue";

function ActionsContent() {
  const brandId = useBrandId();
  const utils = api.useUtils();

  const { data: actions, isLoading } = api.brandOS.getActions.useQuery(
    { strategyId: brandId! },
    { enabled: !!brandId },
  );

  const updateStatus = api.brandOS.updateActionStatus.useMutation({
    onSuccess: () => {
      void utils.brandOS.getActions.invalidate({ strategyId: brandId! });
    },
  });

  if (!brandId) {
    return (
      <div className="flex items-center justify-center h-[60vh]">
        <div className="text-muted-foreground animate-pulse">Chargement...</div>
      </div>
    );
  }

  const todoCount = actions?.filter((a) => a.status === "TODO").length ?? 0;
  const inProgressCount = actions?.filter((a) => a.status === "IN_PROGRESS").length ?? 0;
  const doneCount = actions?.filter((a) => a.status === "DONE").length ?? 0;

  return (
    <div className="p-4 md:p-6 max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black tracking-tight">Actions</h1>
        <p className="text-sm text-muted-foreground">Centre de commande — ce que la marque doit faire maintenant</p>
      </div>

      {/* Status summary */}
      <div className="flex items-center gap-4">
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-zinc-500" />
          <span className="text-muted-foreground">{todoCount} à faire</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-blue-500" />
          <span className="text-muted-foreground">{inProgressCount} en cours</span>
        </span>
        <span className="flex items-center gap-1.5 text-sm">
          <span className="w-2 h-2 rounded-full bg-green-500" />
          <span className="text-muted-foreground">{doneCount} fait</span>
        </span>
      </div>

      {/* Action Queue */}
      {isLoading ? (
        <div className="space-y-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-lg bg-muted-foreground/5 animate-pulse" />
          ))}
        </div>
      ) : actions && actions.length > 0 ? (
        <ActionQueue
          actions={actions}
          onStatusChange={(id, status) => updateStatus.mutate({ id, status: status as "TODO" | "IN_PROGRESS" | "DONE" | "DISMISSED" })}
        />
      ) : (
        <div className="text-center py-12 text-muted-foreground">
          <p className="text-sm">Aucune action pour le moment.</p>
          <p className="text-xs mt-1">Les actions sont générées automatiquement par l&apos;IA ou créées manuellement.</p>
        </div>
      )}
    </div>
  );
}

export default function ActionsPage() {
  return (
    <Suspense fallback={<div className="p-6 text-center text-muted-foreground animate-pulse">Chargement...</div>}>
      <ActionsContent />
    </Suspense>
  );
}
