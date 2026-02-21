// =============================================================================
// COMPONENT C.S10 — Fiche Upgrade Button
// =============================================================================
// Button with confirmation dialog to upgrade/update a brand strategy fiche.
// Props: strategyId, onComplete.
// Key features: AlertDialog confirmation with bullet-point explanation of the
// upgrade process (detect missing variables, AI-fill empty variables, regenerate
// 8 pillars A-S, recalculate scores/widgets), POST to /api/ai/upgrade-fiche,
// FicheUpgradeReport parsing with summary toast (variables added/updated,
// pillars regenerated, duration), warning toast on partial success with error
// count, loading spinner state, amber warning about 5-10 minute duration.
// =============================================================================

"use client";

import { useState } from "react";
import { RefreshCw, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

import { Button } from "~/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "~/components/ui/alert-dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface FicheUpgradeReport {
  strategyId: string;
  variablesAdded: string[];
  variablesUpdated: string[];
  variablesObsolete: string[];
  interviewBefore: { filled: number; total: number };
  interviewAfter: { filled: number; total: number };
  pillarsRegenerated: string[];
  errors: string[];
  durationMs: number;
}

interface FicheUpgradeButtonProps {
  strategyId: string;
  onComplete?: () => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function FicheUpgradeButton({
  strategyId,
  onComplete,
}: FicheUpgradeButtonProps) {
  const [isUpgrading, setIsUpgrading] = useState(false);

  const handleUpgrade = async () => {
    setIsUpgrading(true);

    try {
      const res = await fetch("/api/ai/upgrade-fiche", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ strategyId }),
      });

      if (!res.ok) {
        const errorData = (await res.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errorData?.error ?? `Erreur HTTP ${res.status}`,
        );
      }

      const data = (await res.json()) as {
        success: boolean;
        report: FicheUpgradeReport;
      };

      if (data.success) {
        const r = data.report;
        const durationSec = Math.round(r.durationMs / 1000);

        // Build summary message
        const parts: string[] = [];
        if (r.variablesAdded.length > 0) {
          parts.push(
            `${r.variablesAdded.length} variable${r.variablesAdded.length > 1 ? "s" : ""} ajoutee${r.variablesAdded.length > 1 ? "s" : ""}`,
          );
        }
        if (r.variablesUpdated.length > 0) {
          parts.push(
            `${r.variablesUpdated.length} variable${r.variablesUpdated.length > 1 ? "s" : ""} completee${r.variablesUpdated.length > 1 ? "s" : ""}`,
          );
        }
        parts.push(
          `${r.pillarsRegenerated.length}/8 piliers regeneres`,
        );
        parts.push(`${durationSec}s`);

        if (r.errors.length > 0) {
          toast.warning("Mise a jour partielle", {
            description: `${parts.join(" · ")}. ${r.errors.length} erreur${r.errors.length > 1 ? "s" : ""} non-fatale${r.errors.length > 1 ? "s" : ""}.`,
            duration: 8000,
          });
        } else {
          toast.success("Fiche mise a jour", {
            description: parts.join(" · "),
            duration: 6000,
          });
        }
      } else {
        toast.error("Echec de la mise a jour");
      }
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "Erreur inconnue";
      toast.error("Erreur de mise a jour", {
        description: msg,
      });
    } finally {
      setIsUpgrading(false);
      onComplete?.();
    }
  };

  if (isUpgrading) {
    return (
      <Button variant="outline" size="sm" disabled>
        <Loader2 className="mr-1.5 size-3.5 animate-spin" />
        Upgrade en cours...
      </Button>
    );
  }

  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <Button variant="outline" size="sm">
          <RefreshCw className="mr-1.5 size-3.5" />
          Mettre a jour
        </Button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Mettre a jour la fiche de marque</AlertDialogTitle>
          <AlertDialogDescription asChild>
            <div className="space-y-2">
              <p>
                Cette operation va analyser la fiche et la mettre a jour avec le
                schema actuel :
              </p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>
                  Detecter les variables manquantes ou vides
                </li>
                <li>
                  Remplir automatiquement les variables vides par IA
                </li>
                <li>
                  Regenerer les 8 piliers (A → D → V → E → R → T → I → S)
                </li>
                <li>
                  Recalculer les scores et widgets du cockpit
                </li>
              </ul>
              <div className="mt-3 flex items-start gap-2 rounded-md bg-amber-50 p-3 text-amber-800 dark:bg-amber-950/30 dark:text-amber-200">
                <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                <p className="text-sm">
                  Les versions actuelles des piliers seront sauvegardees dans
                  l&apos;historique. L&apos;operation peut prendre 5 a 10 minutes.
                </p>
              </div>
            </div>
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Annuler</AlertDialogCancel>
          <AlertDialogAction onClick={handleUpgrade}>
            Lancer la mise a jour
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
