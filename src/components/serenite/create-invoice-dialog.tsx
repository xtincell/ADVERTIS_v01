// =============================================================================
// COMP C.SERENITE — CreateInvoiceDialog
// =============================================================================
// Creates an Invoice (DEVIS, FACTURE, AVOIR) with dynamic line items.
// =============================================================================

"use client";

import { useState } from "react";
import { Plus, Loader2, CheckCircle2, Trash2, FileText } from "lucide-react";
import { api } from "~/trpc/react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";
import { Button } from "~/components/ui/button";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { Textarea } from "~/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import {
  INVOICE_TYPES,
  INVOICE_TYPE_LABELS,
  type InvoiceType,
} from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface LineItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function CreateInvoiceDialog() {
  const [open, setOpen] = useState(false);

  // Form state
  const [type, setType] = useState<InvoiceType>("FACTURE");
  const [items, setItems] = useState<LineItem[]>([
    { description: "", quantity: 1, unitPrice: 0 },
  ]);
  const [missionId, setMissionId] = useState("");
  const [taxRate, setTaxRate] = useState(0);
  const [currency, setCurrency] = useState("XAF");
  const [dueDate, setDueDate] = useState("");
  const [notes, setNotes] = useState("");

  // Success state
  const [result, setResult] = useState<{
    refNumber: string;
    type: string;
    total: number;
    currency: string;
  } | null>(null);

  const utils = api.useUtils();

  // Fetch missions for the dropdown
  const { data: kanban } = api.mission.missions.getKanban.useQuery(
    undefined,
    { enabled: open },
  );
  const allMissions = kanban
    ? Object.values(kanban).flat()
    : [];

  const createInvoice = api.serenite.createInvoice.useMutation({
    onSuccess: (data) => {
      setResult({
        refNumber: data.refNumber,
        type: data.type,
        total: data.total,
        currency: data.currency,
      });
      void utils.serenite.listInvoices.invalidate();
      void utils.serenite.dashboard.invalidate();
    },
  });

  const resetForm = () => {
    setType("FACTURE");
    setItems([{ description: "", quantity: 1, unitPrice: 0 }]);
    setMissionId("");
    setTaxRate(0);
    setCurrency("XAF");
    setDueDate("");
    setNotes("");
    setResult(null);
    createInvoice.reset();
  };

  const handleClose = (isOpen: boolean) => {
    setOpen(isOpen);
    if (!isOpen) resetForm();
  };

  const updateItem = (index: number, field: keyof LineItem, value: string | number) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    );
  };

  const addItem = () => {
    setItems((prev) => [...prev, { description: "", quantity: 1, unitPrice: 0 }]);
  };

  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = () => {
    createInvoice.mutate({
      type,
      items: items.map((item) => ({
        description: item.description,
        quantity: item.quantity,
        unitPrice: item.unitPrice,
      })),
      missionId: missionId || undefined,
      taxRate,
      currency,
      dueDate: dueDate ? new Date(dueDate) : undefined,
      notes: notes || undefined,
    });
  };

  const subtotal = items.reduce((acc, item) => acc + item.quantity * item.unitPrice, 0);
  const total = subtotal * (1 + taxRate / 100);
  const fmt = (n: number) => n.toLocaleString("fr-FR");

  const isValid = items.every((item) => item.description.trim().length > 0 && item.unitPrice >= 0);

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogTrigger asChild>
        <Button className="gap-2">
          <Plus className="h-4 w-4" />
          Nouvelle facture
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[580px] max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Créer une facture</DialogTitle>
          <DialogDescription>
            Devis, facture ou avoir avec lignes de détail.
          </DialogDescription>
        </DialogHeader>

        {result ? (
          /* ─── Success state ─── */
          <div className="space-y-4 py-4">
            <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 dark:border-emerald-900 dark:bg-emerald-950/30">
              <div className="flex items-center gap-2 mb-1">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <p className="text-sm font-medium text-emerald-700 dark:text-emerald-400">
                  Document créé avec succès
                </p>
              </div>
              <p className="text-sm text-emerald-600/80 dark:text-emerald-400/70">
                {result.refNumber} — {INVOICE_TYPE_LABELS[result.type as InvoiceType]} — {fmt(result.total)} {result.currency}
              </p>
            </div>
            <Button onClick={() => handleClose(false)} className="w-full">
              Fermer
            </Button>
          </div>
        ) : (
          /* ─── Form state ─── */
          <div className="space-y-4 py-4">
            {/* Type + Currency */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Type *</Label>
                <Select value={type} onValueChange={(v) => setType(v as InvoiceType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INVOICE_TYPES.map((t) => (
                      <SelectItem key={t} value={t}>
                        {INVOICE_TYPE_LABELS[t]}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Devise</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="XAF">XAF</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="USD">USD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Mission (optional) */}
            <div className="space-y-1.5">
              <Label>Mission (optionnel)</Label>
              <Select value={missionId} onValueChange={setMissionId}>
                <SelectTrigger>
                  <SelectValue placeholder="Aucune mission liée" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Aucune</SelectItem>
                  {allMissions.map((m: any) => (
                    <SelectItem key={m.id} value={m.id}>
                      {m.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Line Items */}
            <div className="space-y-2">
              <Label>Lignes *</Label>
              {items.map((item, i) => (
                <div key={i} className="flex items-start gap-2 rounded-lg border p-3">
                  <div className="flex-1 space-y-2">
                    <Input
                      placeholder="Description *"
                      value={item.description}
                      onChange={(e) => updateItem(i, "description", e.target.value)}
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        type="number"
                        placeholder="Quantité"
                        min={0}
                        value={item.quantity}
                        onChange={(e) => updateItem(i, "quantity", Number(e.target.value))}
                      />
                      <Input
                        type="number"
                        placeholder="Prix unitaire"
                        min={0}
                        value={item.unitPrice}
                        onChange={(e) => updateItem(i, "unitPrice", Number(e.target.value))}
                      />
                    </div>
                  </div>
                  {items.length > 1 && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="shrink-0 text-red-500 hover:text-red-600"
                      onClick={() => removeItem(i)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))}
              <Button variant="outline" size="sm" onClick={addItem} className="w-full">
                <Plus className="h-3.5 w-3.5 mr-1" />
                Ajouter une ligne
              </Button>
            </div>

            {/* Tax Rate */}
            <div className="space-y-1.5">
              <Label>Taux TVA (%)</Label>
              <Input
                type="number"
                min={0}
                max={100}
                value={taxRate}
                onChange={(e) => setTaxRate(Number(e.target.value))}
              />
            </div>

            {/* Due Date */}
            <div className="space-y-1.5">
              <Label>Date d&apos;échéance</Label>
              <Input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-1.5">
              <Label>Notes</Label>
              <Textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Notes ou conditions..."
                rows={2}
                maxLength={2000}
              />
            </div>

            {/* Total preview */}
            <div className="rounded-lg bg-muted/50 p-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Sous-total</span>
                <span className="tabular-nums">{fmt(subtotal)} {currency}</span>
              </div>
              {taxRate > 0 && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">TVA ({taxRate}%)</span>
                  <span className="tabular-nums">{fmt(subtotal * taxRate / 100)} {currency}</span>
                </div>
              )}
              <div className="flex justify-between font-medium mt-1 pt-1 border-t">
                <span>Total</span>
                <span className="tabular-nums">{fmt(total)} {currency}</span>
              </div>
            </div>

            {/* Error */}
            {createInvoice.error && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-900 dark:bg-red-950/30 dark:text-red-400">
                {createInvoice.error.message}
              </div>
            )}

            {/* Submit */}
            <Button
              onClick={handleSubmit}
              disabled={!isValid || createInvoice.isPending}
              className="w-full"
            >
              {createInvoice.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  Création en cours...
                </>
              ) : (
                <>
                  <FileText className="h-4 w-4 mr-2" />
                  Créer le document
                </>
              )}
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
