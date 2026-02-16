"use client";

import * as React from "react";
import { Download, FileSpreadsheet, FileText, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { PILLAR_CONFIG, type PillarType } from "~/lib/constants";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Label } from "~/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "~/components/ui/dialog";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface PillarInfo {
  type: string;
  title: string;
  status: string;
}

interface ExportDialogProps {
  strategyId: string;
  brandName: string;
  pillars: PillarInfo[];
  children: React.ReactNode;
}

type ExportFormat = "pdf" | "excel";

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function ExportDialog({
  strategyId,
  brandName,
  pillars,
  children,
}: ExportDialogProps) {
  const [open, setOpen] = React.useState(false);
  const [format, setFormat] = React.useState<ExportFormat>("pdf");
  const [includeCover, setIncludeCover] = React.useState(true);
  const [isExporting, setIsExporting] = React.useState(false);

  // Initialize selected pillars with all completed pillars checked
  const [selectedPillars, setSelectedPillars] = React.useState<Set<string>>(
    () => new Set(pillars.filter((p) => p.status === "complete").map((p) => p.type))
  );

  // Reset selections when dialog opens
  React.useEffect(() => {
    if (open) {
      setSelectedPillars(
        new Set(
          pillars.filter((p) => p.status === "complete").map((p) => p.type)
        )
      );
      setFormat("pdf");
      setIncludeCover(true);
    }
  }, [open, pillars]);

  const completedPillars = pillars.filter((p) => p.status === "complete");
  const hasSelection = selectedPillars.size > 0;

  function togglePillar(type: string) {
    setSelectedPillars((prev) => {
      const next = new Set(prev);
      if (next.has(type)) {
        next.delete(type);
      } else {
        next.add(type);
      }
      return next;
    });
  }

  function toggleAll() {
    if (selectedPillars.size === completedPillars.length) {
      setSelectedPillars(new Set());
    } else {
      setSelectedPillars(
        new Set(completedPillars.map((p) => p.type))
      );
    }
  }

  async function handleExport() {
    if (!hasSelection) return;

    setIsExporting(true);

    try {
      const endpoint =
        format === "pdf" ? "/api/export/pdf" : "/api/export/excel";

      const requestBody: Record<string, unknown> = {
        strategyId,
        selectedPillars: Array.from(selectedPillars),
      };

      if (format === "pdf") {
        requestBody.includeCover = includeCover;
      }

      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorData = (await response.json().catch(() => null)) as {
          error?: string;
        } | null;
        throw new Error(
          errorData?.error ?? `Erreur lors de l'export (${response.status})`
        );
      }

      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      const safeBrandName = brandName
        .replace(/[^a-zA-Z0-9\u00C0-\u024F\- _]/g, "")
        .replace(/\s+/g, "-")
        .substring(0, 50);

      const extension = format === "pdf" ? "pdf" : "xlsx";
      a.download = `ADVERTIS-${safeBrandName}-Strategie.${extension}`;
      document.body.appendChild(a);
      a.click();

      // Cleanup
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);

      toast.success(
        format === "pdf"
          ? "PDF t\u00e9l\u00e9charg\u00e9 avec succ\u00e8s"
          : "Excel t\u00e9l\u00e9charg\u00e9 avec succ\u00e8s"
      );
      setOpen(false);
    } catch (error) {
      console.error("[Export] Error:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Une erreur est survenue lors de l'export"
      );
    } finally {
      setIsExporting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Exporter la strat\u00e9gie</DialogTitle>
          <DialogDescription>
            Choisissez le format et les piliers \u00e0 inclure dans l&apos;export.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("pdf")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "pdf"
                    ? "border-[#c45a3c] bg-[#c45a3c]/5"
                    : "border-border hover:border-[#c45a3c]/40"
                }`}
              >
                <FileText
                  className={`size-8 ${
                    format === "pdf" ? "text-[#c45a3c]" : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    format === "pdf" ? "text-[#c45a3c]" : "text-foreground"
                  }`}
                >
                  PDF
                </span>
                <span className="text-xs text-muted-foreground">
                  Document mis en page
                </span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("excel")}
                className={`flex flex-col items-center gap-2 rounded-lg border-2 p-4 transition-colors ${
                  format === "excel"
                    ? "border-[#2d5a3d] bg-[#2d5a3d]/5"
                    : "border-border hover:border-[#2d5a3d]/40"
                }`}
              >
                <FileSpreadsheet
                  className={`size-8 ${
                    format === "excel"
                      ? "text-[#2d5a3d]"
                      : "text-muted-foreground"
                  }`}
                />
                <span
                  className={`text-sm font-medium ${
                    format === "excel" ? "text-[#2d5a3d]" : "text-foreground"
                  }`}
                >
                  Excel
                </span>
                <span className="text-xs text-muted-foreground">
                  Tableur structur\u00e9
                </span>
              </button>
            </div>
          </div>

          {/* Pillar selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium">
                Piliers \u00e0 inclure
              </Label>
              {completedPillars.length > 0 && (
                <button
                  type="button"
                  onClick={toggleAll}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  {selectedPillars.size === completedPillars.length
                    ? "Tout d\u00e9s\u00e9lectionner"
                    : "Tout s\u00e9lectionner"}
                </button>
              )}
            </div>

            <div className="space-y-2 rounded-lg border p-3">
              {pillars.map((pillar) => {
                const config =
                  PILLAR_CONFIG[pillar.type as PillarType];
                const isCompleted = pillar.status === "complete";
                const isChecked = selectedPillars.has(pillar.type);

                return (
                  <div
                    key={pillar.type}
                    className={`flex items-center gap-3 rounded-md px-2 py-1.5 ${
                      !isCompleted ? "opacity-50" : ""
                    }`}
                  >
                    <Checkbox
                      id={`pillar-${pillar.type}`}
                      checked={isChecked}
                      onCheckedChange={() => togglePillar(pillar.type)}
                      disabled={!isCompleted}
                    />
                    <div
                      className="flex size-6 items-center justify-center rounded text-xs font-bold text-white"
                      style={{
                        backgroundColor: config?.color ?? "#c45a3c",
                      }}
                    >
                      {pillar.type}
                    </div>
                    <Label
                      htmlFor={`pillar-${pillar.type}`}
                      className={`flex-1 text-sm ${
                        !isCompleted
                          ? "cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {config?.title ?? pillar.title}
                    </Label>
                    {!isCompleted && (
                      <span className="text-xs text-muted-foreground">
                        Non g\u00e9n\u00e9r\u00e9
                      </span>
                    )}
                  </div>
                );
              })}
            </div>

            {completedPillars.length === 0 && (
              <p className="text-sm text-muted-foreground">
                Aucun pilier n&apos;a \u00e9t\u00e9 g\u00e9n\u00e9r\u00e9. G\u00e9n\u00e9rez au moins un pilier
                avant d&apos;exporter.
              </p>
            )}
          </div>

          {/* PDF-specific options */}
          {format === "pdf" && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Options PDF</Label>
              <div className="flex items-center gap-3 rounded-lg border p-3">
                <Checkbox
                  id="include-cover"
                  checked={includeCover}
                  onCheckedChange={(checked) =>
                    setIncludeCover(checked === true)
                  }
                />
                <Label
                  htmlFor="include-cover"
                  className="cursor-pointer text-sm"
                >
                  Inclure page de couverture
                </Label>
              </div>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => setOpen(false)}
            disabled={isExporting}
          >
            Annuler
          </Button>
          <Button
            onClick={handleExport}
            disabled={isExporting || !hasSelection}
          >
            {isExporting ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                G\u00e9n\u00e9ration...
              </>
            ) : (
              <>
                <Download className="size-4" />
                T\u00e9l\u00e9charger
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
