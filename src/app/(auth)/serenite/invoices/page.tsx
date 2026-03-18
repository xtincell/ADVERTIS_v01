// =============================================================================
// PAGE P.SERENITE.INVOICES — Invoice Management
// =============================================================================
"use client";

import { useState } from "react";
import { FileText } from "lucide-react";
import { api } from "~/trpc/react";
import { PageHeader } from "~/components/ui/page-header";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "~/components/ui/select";
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "~/components/ui/table";
import {
  INVOICE_TYPES, INVOICE_TYPE_LABELS, INVOICE_STATUSES, INVOICE_STATUS_LABELS,
  type InvoiceType, type InvoiceStatus,
} from "~/lib/constants";
import { CreateInvoiceDialog } from "~/components/serenite/create-invoice-dialog";

export default function SereniteInvoicesPage() {
  const [status, setStatus] = useState<InvoiceStatus | "ALL">("ALL");
  const [type, setType] = useState<InvoiceType | "ALL">("ALL");
  const [page, setPage] = useState(1);

  const { data, isLoading } = api.serenite.listInvoices.useQuery({
    status: status !== "ALL" ? status : undefined,
    type: type !== "ALL" ? type : undefined,
    page,
    pageSize: 20,
  });

  const utils = api.useUtils();
  const updateStatus = api.serenite.updateInvoiceStatus.useMutation({
    onSuccess: () => void utils.serenite.listInvoices.invalidate(),
  });

  const fmt = (n: number) => n.toLocaleString("fr-FR");

  return (
    <div className="mx-auto max-w-6xl px-4 py-6 md:px-8 md:py-8">
      <PageHeader
        title="Factures"
        description={`${data?.total ?? 0} documents`}
        backHref="/serenite"
        backLabel="Retour à Sérénité"
        actions={<CreateInvoiceDialog />}
        className="mb-6"
      />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <Select value={status} onValueChange={(v) => { setStatus(v as any); setPage(1); }}>
          <SelectTrigger className="w-[160px]">
            <SelectValue placeholder="Statut" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous statuts</SelectItem>
            {INVOICE_STATUSES.map((s) => (
              <SelectItem key={s} value={s}>{INVOICE_STATUS_LABELS[s]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={type} onValueChange={(v) => { setType(v as any); setPage(1); }}>
          <SelectTrigger className="w-[140px]">
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">Tous types</SelectItem>
            {INVOICE_TYPES.map((t) => (
              <SelectItem key={t} value={t}>{INVOICE_TYPE_LABELS[t]}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="space-y-3 stagger-children">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-16 rounded-xl bg-muted/50 shimmer" />
          ))}
        </div>
      ) : data?.items.length === 0 ? (
        <div className="text-center py-16 text-muted-foreground">
          <FileText className="mx-auto h-12 w-12 mb-4 opacity-30" />
          <p>Aucune facture trouvée.</p>
        </div>
      ) : (
        <div className="rounded-xl border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/30 hover:bg-muted/30">
                <TableHead>Référence</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead className="text-right">Total</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data?.items.map((inv) => (
                <TableRow key={inv.id}>
                  <TableCell className="font-medium">{inv.refNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs">
                      {INVOICE_TYPE_LABELS[inv.type as InvoiceType]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={inv.status === "PAID" ? "default" : inv.status === "OVERDUE" ? "destructive" : "secondary"}
                      className="text-xs"
                    >
                      {INVOICE_STATUS_LABELS[inv.status as InvoiceStatus]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right tabular-nums font-medium">{fmt(inv.total)} {inv.currency}</TableCell>
                  <TableCell className="text-muted-foreground">{new Date(inv.createdAt).toLocaleDateString("fr-FR")}</TableCell>
                  <TableCell className="text-right">
                    {inv.status === "DRAFT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: inv.id, status: "SENT" })}
                        disabled={updateStatus.isPending}
                      >
                        Envoyer
                      </Button>
                    )}
                    {inv.status === "SENT" && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => updateStatus.mutate({ id: inv.id, status: "PAID" })}
                        disabled={updateStatus.isPending}
                      >
                        Marquer payée
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* Pagination */}
      {data && data.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}>
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {data.totalPages}</span>
          <Button variant="outline" size="sm" onClick={() => setPage((p) => Math.min(data.totalPages, p + 1))} disabled={page === data.totalPages}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
}
