// =============================================================================
// PAGE P.SERENITE.CONTRACTS — Contract Management
// =============================================================================
"use client";

import { useState } from "react";
import { Shield } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  CONTRACT_TYPES, CONTRACT_TYPE_LABELS, CONTRACT_STATUSES, CONTRACT_STATUS_LABELS,
  type ContractType, type ContractStatus,
} from "~/lib/constants";
import { CreateContractDialog } from "~/components/serenite/create-contract-dialog";

export default function SereniteContractsPage() {
  const [status, setStatus] = useState<ContractStatus | "ALL">("ALL");
  const [type, setType] = useState<ContractType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = api.serenite.listContracts.useQuery({
    status: status !== "ALL" ? status : undefined,
    type: type !== "ALL" ? type : undefined,
    page,
    pageSize: 20,
  });

  const utils = api.useUtils();
  const updateStatus = api.serenite.updateContractStatus.useMutation({
    onSuccess: () => void utils.serenite.listContracts.invalidate(),
  });

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Contrats"
        description={`${data?.total ?? 0} contrats`}
        backHref="/serenite"
        backLabel="Retour à Sérénité"
        actions={<CreateContractDialog />}
        className="mb-6"
      />

      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous statuts</SelectItem>
            {CONTRACT_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{CONTRACT_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v as any); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous types</SelectItem>
            {CONTRACT_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{CONTRACT_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <Shield className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Aucun contrat trouvé.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data?.items.map((contract) => (
            <div key={contract.id} className="rounded-xl border bg-white p-4 flex items-center justify-between">
              <div>
                <div className="font-medium">{contract.title}</div>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="outline" className="text-xs">{contract.refNumber}</Badge>
                  <Badge variant="secondary" className="text-xs">
                    {CONTRACT_TYPE_LABELS[contract.type as ContractType]}
                  </Badge>
                  <Badge
                    variant={contract.status === "SIGNED" || contract.status === "ACTIVE" ? "default" : "secondary"}
                    className="text-xs"
                  >
                    {CONTRACT_STATUS_LABELS[contract.status as ContractStatus]}
                  </Badge>
                </div>
                <div className="text-xs text-muted-foreground mt-1">
                  {new Date(contract.createdAt).toLocaleDateString("fr-FR")}
                  {contract.signedAt && ` • Signé le ${new Date(contract.signedAt).toLocaleDateString("fr-FR")}`}
                </div>
              </div>
              <div className="flex gap-2">
                {contract.status === "DRAFT" && (
                  <Button variant="outline" size="sm"
                    onClick={() => updateStatus.mutate({ id: contract.id, status: "SENT" })}>
                    Envoyer
                  </Button>
                )}
                {contract.status === "SENT" && (
                  <Button variant="outline" size="sm"
                    onClick={() => updateStatus.mutate({ id: contract.id, status: "SIGNED" })}>
                    Marquer signé
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
