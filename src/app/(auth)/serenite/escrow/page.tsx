// =============================================================================
// PAGE P.SERENITE.ESCROW — Escrow Management
// =============================================================================
"use client";

import Link from "next/link";
import { Shield, ArrowUp, RotateCcw } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { ESCROW_STATUS_LABELS, type EscrowStatus } from "~/lib/constants";
import { CreateEscrowDialog } from "~/components/serenite/create-escrow-dialog";

export default function SereniteEscrowPage() {
  const { data: escrows, isLoading } = api.serenite.listEscrows.useQuery({});

  const utils = api.useUtils();
  const release = api.serenite.releaseEscrow.useMutation({
    onSuccess: () => void utils.serenite.listEscrows.invalidate(),
  });
  const refund = api.serenite.refundEscrow.useMutation({
    onSuccess: () => void utils.serenite.listEscrows.invalidate(),
  });

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const statusColor = (s: string) => {
    switch (s) {
      case "HELD": return "default";
      case "RELEASED": return "secondary";
      case "PARTIALLY_RELEASED": return "outline";
      case "REFUNDED": return "destructive";
      default: return "secondary";
    }
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Escrow — Séquestre"
        description="Suivi des fonds séquestrés par mission"
        backHref="/serenite"
        backLabel="Retour à Sérénité"
        actions={<CreateEscrowDialog />}
        className="mb-6"
      />

      {isLoading ? (
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-20 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      ) : !escrows || escrows.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Aucune transaction escrow.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {escrows.map((esc) => (
            <div key={esc.id} className="rounded-xl border bg-white p-5">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Link
                      href={`/pilotis/${esc.missionId}`}
                      className="font-medium hover:text-orange-500 hover:underline transition-colors"
                    >
                      Mission: {esc.missionId.slice(0, 8)}...
                    </Link>
                    <Badge variant={statusColor(esc.status) as any} className="text-xs">
                      {ESCROW_STATUS_LABELS[esc.status as EscrowStatus]}
                    </Badge>
                  </div>
                  <div className="text-lg font-bold tabular-nums">{fmt(esc.amount)} {esc.currency}</div>
                  {esc.releasedAmount != null && esc.releasedAmount > 0 && (
                    <div className="text-sm text-muted-foreground">
                      Libéré : {fmt(esc.releasedAmount)} {esc.currency}
                    </div>
                  )}
                  {esc.releaseCondition && (
                    <div className="text-xs text-muted-foreground mt-1">
                      Condition : {esc.releaseCondition}
                    </div>
                  )}
                  <div className="text-xs text-muted-foreground mt-1">
                    Créé le {new Date(esc.createdAt).toLocaleDateString("fr-FR")}
                    {esc.heldAt && ` • Séquestré le ${new Date(esc.heldAt).toLocaleDateString("fr-FR")}`}
                  </div>
                </div>

                <div className="flex gap-2">
                  {(esc.status === "HELD" || esc.status === "PARTIALLY_RELEASED") && (
                    <>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => release.mutate({ id: esc.id })}
                        disabled={release.isPending}
                      >
                        <ArrowUp className="h-3.5 w-3.5 mr-1" />
                        Libérer
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => refund.mutate({ id: esc.id })}
                        disabled={refund.isPending}
                        className="text-red-600 hover:text-red-700"
                      >
                        <RotateCcw className="h-3.5 w-3.5 mr-1" />
                        Rembourser
                      </Button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
