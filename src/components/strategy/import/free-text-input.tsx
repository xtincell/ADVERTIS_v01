"use client";

import { useState } from "react";
import { Loader2, Sparkles, RotateCcw, AlertCircle } from "lucide-react";

import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import type { ImportResult } from "./file-upload-zone";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface FreeTextInputProps {
  brandName: string;
  sector: string;
  onAnalysisComplete: (result: ImportResult) => void;
  onError: (error: string) => void;
}

// ---------------------------------------------------------------------------
// Hints / prompts to help the user write
// ---------------------------------------------------------------------------

const WRITING_HINTS = [
  "Qui etes-vous ? Quelle est l'histoire de votre marque ?",
  "Quelles sont vos valeurs fondamentales ?",
  "Qui sont vos clients cibles ?",
  "Qu'est-ce qui vous differencie de vos concurrents ?",
  "Quels sont vos produits/services et leurs prix ?",
  "Comment communiquez-vous avec votre communaute ?",
];

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export default function FreeTextInput({
  brandName,
  sector,
  onAnalysisComplete,
  onError,
}: FreeTextInputProps) {
  const [text, setText] = useState("");
  const [isAnalysing, setIsAnalysing] = useState(false);
  const [phase, setPhase] = useState<string | null>(null);

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const charCount = text.length;
  const isMinimumReached = wordCount >= 50;

  const handleAnalyse = async () => {
    if (!isMinimumReached) return;

    setIsAnalysing(true);
    setPhase("Analyse du texte par l'IA...");

    try {
      const response = await fetch("/api/freetext", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: text.trim(),
          brandName,
          sector,
        }),
      });

      if (!response.ok) {
        const errorData = (await response.json()) as { error?: string };
        throw new Error(
          errorData.error ?? "Erreur lors de l'analyse du texte",
        );
      }

      setPhase("Mapping des variables...");

      const data = (await response.json()) as {
        mappedVariables: Record<string, string>;
        confidence: number;
        unmappedVariables: string[];
      };

      onAnalysisComplete({
        fileName: "Texte libre",
        mappedVariables: data.mappedVariables,
        confidence: data.confidence,
        unmappedVariables: data.unmappedVariables,
      });
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Erreur inconnue";
      onError(message);
    } finally {
      setIsAnalysing(false);
      setPhase(null);
    }
  };

  return (
    <div className="space-y-4">
      {/* Instructions card */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="p-4">
          <div className="flex items-start gap-3">
            <Sparkles className="text-primary mt-0.5 size-5 shrink-0" />
            <div>
              <p className="font-medium">Decrivez votre marque librement</p>
              <p className="text-muted-foreground mt-1 text-sm">
                Ecrivez tout ce que vous savez sur votre marque dans un seul
                bloc de texte. L&apos;IA analysera votre description et
                remplira automatiquement les 25 variables de la Fiche de
                Marque. Plus vous donnez de details, meilleur sera le
                resultat.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Writing hints */}
      <div className="flex flex-wrap gap-2">
        {WRITING_HINTS.map((hint) => (
          <Badge
            key={hint}
            variant="outline"
            className="text-muted-foreground cursor-default text-xs font-normal"
          >
            {hint}
          </Badge>
        ))}
      </div>

      {/* Textarea */}
      <div className="relative">
        <Textarea
          placeholder={`Decrivez votre marque ${brandName ? `"${brandName}"` : ""} ici...

Par exemple : Notre marque a ete fondee en 2019 avec la mission de... Nos clients sont principalement... Ce qui nous differencie c'est... Nos valeurs sont... Nous proposons trois offres...`}
          value={text}
          onChange={(e) => setText(e.target.value)}
          className="min-h-72 resize-y text-sm leading-relaxed"
          disabled={isAnalysing}
        />

        {/* Word / char counter */}
        <div className="mt-2 flex items-center justify-between text-xs">
          <div className="flex items-center gap-3">
            <span
              className={
                isMinimumReached
                  ? "text-green-600"
                  : "text-muted-foreground"
              }
            >
              {wordCount} mot{wordCount !== 1 ? "s" : ""}
              {!isMinimumReached && (
                <span className="ml-1 opacity-60">(min. 50)</span>
              )}
            </span>
            <span className="text-muted-foreground">
              {charCount.toLocaleString()} caractere
              {charCount !== 1 ? "s" : ""}
            </span>
          </div>

          {wordCount >= 200 && (
            <Badge
              variant="outline"
              className="border-green-200 bg-green-50 text-green-700 dark:border-green-700 dark:bg-green-950 dark:text-green-400"
            >
              Excellent niveau de detail
            </Badge>
          )}
          {wordCount >= 100 && wordCount < 200 && (
            <Badge
              variant="outline"
              className="border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-700 dark:bg-blue-950 dark:text-blue-400"
            >
              Bon niveau de detail
            </Badge>
          )}
        </div>
      </div>

      {/* Warning for short text */}
      {wordCount > 0 && wordCount < 50 && (
        <div className="flex items-start gap-2 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
          <AlertCircle className="mt-0.5 size-4 shrink-0 text-yellow-600" />
          <p className="text-sm text-yellow-800">
            Votre texte est trop court pour une analyse fiable. Ajoutez plus
            de details sur votre marque (minimum 50 mots).
          </p>
        </div>
      )}

      {/* Analysis progress */}
      {isAnalysing && phase && (
        <div className="flex items-center gap-2 rounded-lg border p-3">
          <Loader2 className="text-primary size-4 animate-spin" />
          <span className="text-sm">{phase}</span>
        </div>
      )}

      {/* Action buttons */}
      <div className="flex items-center gap-3">
        <Button
          onClick={handleAnalyse}
          disabled={!isMinimumReached || isAnalysing}
          className="flex-1 md:flex-none"
        >
          {isAnalysing ? (
            <>
              <Loader2 className="mr-2 size-4 animate-spin" />
              Analyse en cours...
            </>
          ) : (
            <>
              <Sparkles className="mr-2 size-4" />
              Analyser avec l&apos;IA
            </>
          )}
        </Button>

        {text.length > 0 && !isAnalysing && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setText("")}
          >
            <RotateCcw className="mr-1 size-3.5" />
            Effacer
          </Button>
        )}
      </div>
    </div>
  );
}
