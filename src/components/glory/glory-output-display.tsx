"use client";

// =============================================================================
// COMP C.GLORY — GloryOutputDisplay
// =============================================================================
// Renders AI-generated output from a GLORY tool.
// Supports markdown (formatted text), structured (JSON cards), and mixed.
// Provides Copy, Export JSON, and Save actions.
// =============================================================================

import { useCallback } from "react";
import { cn } from "~/lib/utils";
import { Button } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Separator } from "~/components/ui/separator";
import {
  Copy,
  Download,
  Save,
  Loader2,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryOutputDisplayProps {
  outputData: unknown;
  outputText: string;
  outputFormat: "markdown" | "structured" | "mixed";
  persistable: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryOutputDisplay({
  outputData,
  outputText,
  outputFormat,
  persistable,
  onSave,
  isSaving = false,
}: GloryOutputDisplayProps) {
  // Copy to clipboard
  const handleCopy = useCallback(async () => {
    try {
      const textToCopy =
        outputFormat === "structured" || outputFormat === "mixed"
          ? JSON.stringify(outputData, null, 2)
          : outputText;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copié dans le presse-papier");
    } catch {
      toast.error("Impossible de copier");
    }
  }, [outputData, outputText, outputFormat]);

  // Export as JSON file
  const handleExportJson = useCallback(() => {
    try {
      const jsonStr = JSON.stringify(outputData ?? outputText, null, 2);
      const blob = new Blob([jsonStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `glory-output-${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success("Fichier JSON exporté");
    } catch {
      toast.error("Erreur lors de l'export");
    }
  }, [outputData, outputText]);

  return (
    <div className="space-y-4">
      {/* ----------------------------------------------------------------- */}
      {/* Actions bar */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copier
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export JSON
        </Button>
        {persistable && onSave && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 text-xs bg-[#6C5CE7] hover:bg-[#5b4bd5] text-white"
          >
            {isSaving ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Save className="h-3.5 w-3.5" />
            )}
            Sauvegarder
          </Button>
        )}
      </div>

      <Separator />

      {/* ----------------------------------------------------------------- */}
      {/* Output content */}
      {/* ----------------------------------------------------------------- */}
      <div className="min-h-[200px]">
        {outputFormat === "markdown" && (
          <MarkdownOutput text={outputText} />
        )}
        {outputFormat === "structured" && (
          <StructuredOutput data={outputData} />
        )}
        {outputFormat === "mixed" && (
          <div className="space-y-6">
            {outputText && <MarkdownOutput text={outputText} />}
            {outputData != null && typeof outputData === "object" && (
              <>
                <Separator />
                <StructuredOutput data={outputData} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Markdown / text output
// ---------------------------------------------------------------------------
function MarkdownOutput({ text }: { text: string }) {
  return (
    <div
      className={cn(
        "prose prose-sm max-w-none",
        "bg-white rounded-lg border border-gray-200 p-5",
        "whitespace-pre-wrap break-words",
        "text-gray-800 leading-relaxed",
      )}
    >
      {text}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Structured output — recursively renders objects/arrays as cards
// ---------------------------------------------------------------------------
function StructuredOutput({ data }: { data: unknown }) {
  if (data === null || data === undefined) {
    return (
      <p className="text-sm text-muted-foreground italic">Aucune donnée</p>
    );
  }

  if (typeof data === "string" || typeof data === "number" || typeof data === "boolean") {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-sm text-gray-800">{String(data)}</p>
      </div>
    );
  }

  if (Array.isArray(data)) {
    return (
      <div className="space-y-3">
        {data.map((item, index) => (
          <Card key={index} className="border-gray-200">
            <CardHeader className="pb-2 pt-3 px-4">
              <CardTitle className="text-xs font-medium text-muted-foreground">
                Élément {index + 1}
              </CardTitle>
            </CardHeader>
            <CardContent className="px-4 pb-3">
              <StructuredOutput data={item} />
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (typeof data === "object") {
    const entries = Object.entries(data as Record<string, unknown>);
    return (
      <div className="space-y-3">
        {entries.map(([key, val]) => (
          <div key={key} className="space-y-1">
            <div className="flex items-center gap-2">
              <Badge
                variant="outline"
                className="text-[10px] font-mono border-[#6C5CE7]/30 text-[#6C5CE7]"
              >
                {key}
              </Badge>
            </div>
            {typeof val === "object" && val !== null ? (
              <div className="ml-3 pl-3 border-l-2 border-[#6C5CE7]/10">
                <StructuredOutput data={val} />
              </div>
            ) : (
              <p className="text-sm text-gray-700 ml-1">
                {val === null || val === undefined ? (
                  <span className="italic text-muted-foreground">null</span>
                ) : (
                  String(val)
                )}
              </p>
            )}
          </div>
        ))}
      </div>
    );
  }

  return <p className="text-sm text-gray-600">{String(data)}</p>;
}
