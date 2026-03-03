// ==========================================================================
// C.CRM2 — Create Deal Dialog
// Quick-add dialog for a new CRM deal.
// ==========================================================================

"use client";

import { useState } from "react";
import { toast } from "sonner";
import { X, Plus } from "lucide-react";
import { api } from "~/trpc/react";
import { DEAL_SOURCES, DEAL_SOURCE_LABELS, SECTORS } from "~/lib/constants";
import { Button } from "~/components/ui/button";

interface CreateDealDialogProps {
  onClose: () => void;
}

export function CreateDealDialog({ onClose }: CreateDealDialogProps) {
  const [companyName, setCompanyName] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [amount, setAmount] = useState("");
  const [source, setSource] = useState("");
  const [sector, setSector] = useState("");
  const [notes, setNotes] = useState("");

  const utils = api.useUtils();
  const createMutation = api.crm.create.useMutation({
    onSuccess: () => {
      toast.success("Deal créé !");
      void utils.crm.getKanban.invalidate();
      void utils.crm.getStats.invalidate();
      onClose();
    },
    onError: (err) => toast.error(err.message),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim()) {
      toast.error("Nom de l'entreprise requis");
      return;
    }
    createMutation.mutate({
      companyName: companyName.trim(),
      contactName: contactName.trim() || undefined,
      contactEmail: contactEmail.trim() || undefined,
      amount: amount ? parseFloat(amount) : undefined,
      source: source || undefined,
      sector: sector || undefined,
      notes: notes.trim() || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="w-full max-w-md mx-4 rounded-xl border bg-card shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b px-5 py-3">
          <h3 className="text-sm font-semibold">Nouveau Deal</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-3">
          {/* Company */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Entreprise *
            </label>
            <input
              type="text"
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Nom de l'entreprise"
              autoFocus
            />
          </div>

          {/* Contact */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Contact
            </label>
            <input
              type="text"
              value={contactName}
              onChange={(e) => setContactName(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Nom du contact"
            />
          </div>

          {/* Email */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Email
            </label>
            <input
              type="email"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="email@entreprise.com"
            />
          </div>

          {/* Amount + Source row */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Montant (XOF)
              </label>
              <input
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
                placeholder="0"
                min="0"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground">
                Source
              </label>
              <select
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              >
                <option value="">-- Choisir --</option>
                {DEAL_SOURCES.map((s) => (
                  <option key={s} value={s}>
                    {DEAL_SOURCE_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Sector */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Secteur
            </label>
            <select
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            >
              <option value="">-- Secteur --</option>
              {SECTORS.map((s) => (
                <option key={s.value} value={s.value}>
                  {s.label}
                </option>
              ))}
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-medium text-muted-foreground">
              Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="mt-1 w-full rounded-md border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
              rows={2}
              placeholder="Notes sur le deal..."
            />
          </div>

          {/* Actions */}
          <div className="flex justify-end gap-2 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={onClose}>
              Annuler
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={createMutation.isPending || !companyName.trim()}
            >
              <Plus className="mr-1 h-3.5 w-3.5" />
              {createMutation.isPending ? "Création..." : "Créer le deal"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
