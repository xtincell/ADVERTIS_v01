// ==========================================================================
// C.OS — Cult Index Weights Editor
// 7 sliders that auto-normalize to sum = 1.0
// ==========================================================================

"use client";

import { useState, useCallback, useEffect } from "react";
import { Button } from "~/components/ui/button";
import { RotateCcw } from "lucide-react";
import type { CultIndexWeights } from "~/lib/types/brand-os";
import { DEFAULT_CULT_WEIGHTS } from "~/lib/types/brand-os";

const WEIGHT_LABELS: Record<keyof CultIndexWeights, { label: string; description: string }> = {
  engagementDepth:   { label: "Profondeur d'engagement", description: "Qualité des interactions" },
  superfanVelocity:  { label: "Vélocité superfans",      description: "Rythme de conversion" },
  communityCohesion: { label: "Cohésion communauté",     description: "Force des liens internes" },
  brandDefenseRate:  { label: "Taux de défense",         description: "Fans qui défendent la marque" },
  ugcGenerationRate: { label: "Génération UGC",          description: "Contenu créé par la communauté" },
  ritualAdoption:    { label: "Adoption des rituels",    description: "Pratiques récurrentes" },
  evangelismScore:   { label: "Score d'évangélisme",     description: "Recrutement par les fans" },
};

const WEIGHT_KEYS = Object.keys(WEIGHT_LABELS) as (keyof CultIndexWeights)[];

interface CultWeightsEditorProps {
  weights: CultIndexWeights;
  onChange: (weights: CultIndexWeights) => void;
  disabled?: boolean;
}

export function CultWeightsEditor({ weights, onChange, disabled }: CultWeightsEditorProps) {
  const [local, setLocal] = useState<CultIndexWeights>(weights);

  useEffect(() => {
    setLocal(weights);
  }, [weights]);

  const total = WEIGHT_KEYS.reduce((sum, k) => sum + (local[k] ?? 0), 0);
  const isValid = Math.abs(total - 1.0) < 0.01;

  const handleSliderChange = useCallback(
    (key: keyof CultIndexWeights, rawValue: number) => {
      const value = Math.round(rawValue * 100) / 100;
      const next = { ...local, [key]: value };
      setLocal(next);
    },
    [local],
  );

  const normalize = useCallback(() => {
    const t = WEIGHT_KEYS.reduce((s, k) => s + (local[k] ?? 0), 0);
    if (t === 0) return;
    const normalized = { ...local };
    for (const k of WEIGHT_KEYS) {
      normalized[k] = Math.round(((local[k] ?? 0) / t) * 100) / 100;
    }
    // Adjust rounding error on last key
    const newTotal = WEIGHT_KEYS.reduce((s, k) => s + normalized[k], 0);
    const diff = Math.round((1.0 - newTotal) * 100) / 100;
    normalized[WEIGHT_KEYS[WEIGHT_KEYS.length - 1]!] += diff;

    setLocal(normalized);
    onChange(normalized);
  }, [local, onChange]);

  const reset = useCallback(() => {
    setLocal(DEFAULT_CULT_WEIGHTS);
    onChange(DEFAULT_CULT_WEIGHTS);
  }, [onChange]);

  const commit = useCallback(() => {
    onChange(local);
  }, [local, onChange]);

  return (
    <div className="space-y-4">
      {WEIGHT_KEYS.map((key) => {
        const value = local[key] ?? 0;
        const pct = Math.round(value * 100);
        return (
          <div key={key} className="space-y-1">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium">{WEIGHT_LABELS[key].label}</span>
                <span className="ml-2 text-xs text-muted-foreground">
                  {WEIGHT_LABELS[key].description}
                </span>
              </div>
              <span className="text-sm font-mono tabular-nums w-12 text-right">
                {pct}%
              </span>
            </div>
            <input
              type="range"
              min={0}
              max={0.5}
              step={0.01}
              value={value}
              disabled={disabled}
              onChange={(e) => handleSliderChange(key, parseFloat(e.target.value))}
              onMouseUp={commit}
              onTouchEnd={commit}
              className="w-full h-2 rounded-full appearance-none cursor-pointer bg-muted accent-amber-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
          </div>
        );
      })}

      {/* Total indicator */}
      <div className="flex items-center justify-between rounded-lg border p-3">
        <span className="text-sm font-medium">Total</span>
        <span
          className={`text-sm font-mono font-semibold tabular-nums ${
            isValid ? "text-green-600" : "text-red-500"
          }`}
        >
          {Math.round(total * 100)}%
        </span>
      </div>

      {!isValid && (
        <p className="text-xs text-amber-600">
          Le total doit faire 100%. Cliquez sur "Normaliser" pour ajuster automatiquement.
        </p>
      )}

      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={normalize}
          disabled={disabled || isValid}
        >
          Normaliser
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={reset}
          disabled={disabled}
        >
          <RotateCcw className="mr-1.5 h-3.5 w-3.5" />
          Valeurs par défaut
        </Button>
      </div>
    </div>
  );
}
