"use client";

// =============================================================================
// COMP C.GLORY — GloryOutputDisplay (v2 — Director-Grade)
// =============================================================================
// Renders AI-generated output from a GLORY tool with executive-level quality.
// Smart type-detection engine: analyses outputData shape and dispatches to
// semantic sub-renderers (ScoreBar, RankedCardGrid, DataCardList, etc.)
// Data-driven from DB (outputData JSON) — NOT raw LLM text.
// Supports markdown (react-markdown), structured (smart cards), and mixed.
// Detects multi-variant output ({ variants: [...] }) and renders tabs.
// Provides Copy, Export JSON, and Save actions.
// Full dark mode via ADVERTIS design tokens.
// =============================================================================

import { useCallback, useMemo, useState, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
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
  XCircle,
  Award,
  Hash,
} from "lucide-react";
import { toast } from "sonner";

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITIES — Key humanization, type detection, score colors
// ═══════════════════════════════════════════════════════════════════════════════

const KNOWN_ACRONYMS: Record<string, string> = {
  cta: "CTA",
  roi: "ROI",
  kpi: "KPI",
  sov: "SOV",
  tam: "TAM",
  sam: "SAM",
  som: "SOM",
  url: "URL",
  id: "ID",
  seo: "SEO",
  ux: "UX",
  ui: "UI",
};

function humanizeKey(key: string): string {
  // Already spaced? return as-is
  if (key.includes(" ")) return key;
  // Split camelCase / snake_case
  const words = key
    .replace(/([a-z])([A-Z])/g, "$1 $2")
    .replace(/[_-]/g, " ")
    .split(" ")
    .filter(Boolean);
  return words
    .map((w) => {
      const lower = w.toLowerCase();
      if (KNOWN_ACRONYMS[lower]) return KNOWN_ACRONYMS[lower];
      return lower.charAt(0).toUpperCase() + lower.slice(1);
    })
    .join(" ");
}

function isScoreKey(key: string): boolean {
  return /score|rating|note|niveau/i.test(key);
}

function isScoreLikeValue(key: string, value: unknown): boolean {
  return (
    typeof value === "number" &&
    isScoreKey(key) &&
    value >= 0 &&
    value <= 10
  );
}

function isCurrencyKey(key: string): boolean {
  return /budget|cost|amount|prix|investissement|montant|tarif/i.test(key);
}

function isDurationKey(key: string): boolean {
  return /duration|duree|durée|timing/i.test(key);
}

/**
 * Returns Tailwind classes for score color (background fill + text)
 */
function getScoreColor(value: number): {
  bar: string;
  text: string;
  bg: string;
} {
  if (value <= 3)
    return {
      bar: "bg-destructive",
      text: "text-destructive",
      bg: "bg-destructive/10",
    };
  if (value <= 5)
    return {
      bar: "bg-accent",
      text: "text-accent-foreground",
      bg: "bg-accent/15",
    };
  if (value <= 7)
    return {
      bar: "bg-secondary",
      text: "text-secondary",
      bg: "bg-secondary/10",
    };
  return {
    bar: "bg-success",
    text: "text-success",
    bg: "bg-success/10",
  };
}

/** Find the best "title" key in a flat object */
function findTitleKey(obj: Record<string, unknown>): string | null {
  const candidates = [
    "name",
    "title",
    "label",
    "headline",
    "text",
    "nom",
    "titre",
    "platform",
    "plateforme",
    "phase",
    "character",
    "personnage",
  ];
  for (const c of candidates) {
    if (c in obj && typeof obj[c] === "string") return c;
  }
  return null;
}

/** Find the best "subtitle" key */
function findSubtitleKey(
  obj: Record<string, unknown>,
  titleKey: string | null,
): string | null {
  const candidates = [
    "type",
    "format",
    "headline",
    "subheadline",
    "subtitle",
    "description",
    "tone",
    "origin",
  ];
  for (const c of candidates) {
    if (c in obj && typeof obj[c] === "string" && c !== titleKey) return c;
  }
  return null;
}

/** Classify an array's contents */
function classifyArray(
  arr: unknown[],
): "strings" | "scored-objects" | "objects" | "mixed" {
  if (arr.length === 0) return "mixed";
  const allStrings = arr.every((item) => typeof item === "string");
  if (allStrings) return "strings";

  const allObjects = arr.every(
    (item) => typeof item === "object" && item !== null && !Array.isArray(item),
  );
  if (!allObjects) return "mixed";

  // Check if any object has score-like keys
  const hasScores = arr.some((item) => {
    const entries = Object.entries(item as Record<string, unknown>);
    return entries.some(
      ([k, v]) => typeof v === "number" && isScoreKey(k) && v >= 0 && v <= 10,
    );
  });
  return hasScores ? "scored-objects" : "objects";
}

/** Check if object is "flat" (all values are primitives) */
function isFlat(obj: Record<string, unknown>): boolean {
  return Object.values(obj).every(
    (v) => v === null || v === undefined || typeof v !== "object",
  );
}

/** Format a currency number */
function formatCurrency(value: number): string {
  // Detect likely unit based on magnitude
  if (value >= 1_000_000) {
    return new Intl.NumberFormat("fr-FR", {
      notation: "compact",
      compactDisplay: "short",
      maximumFractionDigits: 1,
    }).format(value);
  }
  return new Intl.NumberFormat("fr-FR").format(value);
}

// ═══════════════════════════════════════════════════════════════════════════════
// VARIANT TYPE HELPER
// ═══════════════════════════════════════════════════════════════════════════════

interface VariantItem {
  label?: string;
  [key: string]: unknown;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROPS
// ═══════════════════════════════════════════════════════════════════════════════

interface GloryOutputDisplayProps {
  outputData: unknown;
  outputText: string;
  outputFormat: "markdown" | "structured" | "mixed";
  persistable: boolean;
  onSave?: () => void;
  isSaving?: boolean;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN COMPONENT
// ═══════════════════════════════════════════════════════════════════════════════

export function GloryOutputDisplay({
  outputData,
  outputText,
  outputFormat,
  persistable,
  onSave,
  isSaving = false,
}: GloryOutputDisplayProps) {
  // Detect multi-variant output
  const variants = useMemo<VariantItem[] | null>(() => {
    if (
      outputData &&
      typeof outputData === "object" &&
      !Array.isArray(outputData)
    ) {
      const d = outputData as Record<string, unknown>;
      if (
        "variants" in d &&
        Array.isArray(d.variants) &&
        d.variants.length > 1
      ) {
        return d.variants as VariantItem[];
      }
    }
    return null;
  }, [outputData]);

  const [activeVariant, setActiveVariant] = useState(0);

  // Data for the currently displayed variant (or full outputData if no variants)
  const displayData = variants ? variants[activeVariant] : outputData;
  const displayText = variants
    ? buildVariantText(variants[activeVariant])
    : outputText;

  // Copy to clipboard — copies active variant only
  const handleCopy = useCallback(async () => {
    try {
      const textToCopy =
        outputFormat === "structured" || outputFormat === "mixed"
          ? JSON.stringify(displayData, null, 2)
          : displayText;
      await navigator.clipboard.writeText(textToCopy);
      toast.success("Copie dans le presse-papier");
    } catch {
      toast.error("Impossible de copier");
    }
  }, [displayData, displayText, outputFormat]);

  // Export as JSON file — exports ALL data (including all variants)
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
      toast.success("Fichier JSON export\u00e9");
    } catch {
      toast.error("Erreur lors de l\u2019export");
    }
  }, [outputData, outputText]);

  return (
    <div className="space-y-4">
      {/* ── Variant tabs ── */}
      {variants && (
        <div className="flex items-center gap-1.5 flex-wrap">
          {variants.map((v, idx) => {
            const label =
              v.label ?? `Variante ${String.fromCharCode(65 + idx)}`;
            const isActive = idx === activeVariant;
            return (
              <Button
                key={idx}
                variant={isActive ? "default" : "outline"}
                size="sm"
                className={cn(
                  "text-xs h-8 px-3 rounded-full transition-colors",
                  isActive && "shadow-sm",
                )}
                onClick={() => setActiveVariant(idx)}
              >
                {label}
              </Button>
            );
          })}
        </div>
      )}

      {/* ── Actions bar ── */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopy}
          className="gap-1.5 text-xs"
        >
          <Copy className="h-3.5 w-3.5" />
          Copier{variants ? " (variante active)" : ""}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExportJson}
          className="gap-1.5 text-xs"
        >
          <Download className="h-3.5 w-3.5" />
          Export JSON{variants ? " (tout)" : ""}
        </Button>
        {persistable && onSave && (
          <Button
            size="sm"
            onClick={onSave}
            disabled={isSaving}
            className="gap-1.5 text-xs"
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

      {/* ── Output content ── */}
      <div className="min-h-[200px]">
        {outputFormat === "markdown" && <MarkdownOutput text={displayText} />}
        {outputFormat === "structured" && (
          <SmartStructuredOutput data={displayData} />
        )}
        {outputFormat === "mixed" && (
          <div className="space-y-6">
            {displayData != null && typeof displayData === "object" && (
              <SmartStructuredOutput data={displayData} />
            )}
            {displayText && (
              <>
                <Separator />
                <MarkdownOutput text={displayText} />
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// BUILD VARIANT TEXT (for clipboard copy)
// ═══════════════════════════════════════════════════════════════════════════════

function buildVariantText(variant: VariantItem | undefined): string {
  if (!variant) return "";
  const lines: string[] = [];
  for (const [key, value] of Object.entries(variant)) {
    if (key === "label") continue;
    if (typeof value === "string") {
      lines.push(`## ${humanizeKey(key)}\n${value}`);
    } else if (Array.isArray(value)) {
      lines.push(`## ${humanizeKey(key)}`);
      for (const item of value) {
        lines.push(
          typeof item === "string" ? `- ${item}` : `- ${JSON.stringify(item)}`,
        );
      }
    } else if (value !== null && value !== undefined) {
      lines.push(
        `## ${humanizeKey(key)}\n${JSON.stringify(value, null, 2)}`,
      );
    }
  }
  return lines.join("\n\n");
}

// ═══════════════════════════════════════════════════════════════════════════════
// MARKDOWN OUTPUT — Full react-markdown rendering
// ═══════════════════════════════════════════════════════════════════════════════

function MarkdownOutput({ text }: { text: string }) {
  if (!text) return null;

  return (
    <div className="bg-card rounded-xl border border-border p-6">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-xl font-bold text-foreground mb-4 mt-2 first:mt-0">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-lg font-semibold text-foreground mb-3 mt-5 first:mt-0">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-base font-medium text-foreground mb-2 mt-4 first:mt-0">
              {children}
            </h3>
          ),
          p: ({ children }) => (
            <p className="text-sm text-foreground/90 leading-relaxed mb-3 last:mb-0">
              {children}
            </p>
          ),
          strong: ({ children }) => (
            <strong className="font-semibold text-foreground">{children}</strong>
          ),
          em: ({ children }) => (
            <em className="italic text-foreground/80">{children}</em>
          ),
          ul: ({ children }) => (
            <ul className="list-disc pl-5 space-y-1.5 mb-3 text-sm text-foreground/90">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal pl-5 space-y-1.5 mb-3 text-sm text-foreground/90">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed">{children}</li>
          ),
          blockquote: ({ children }) => (
            <blockquote className="border-l-2 border-primary/30 pl-4 my-3 italic text-muted-foreground">
              {children}
            </blockquote>
          ),
          code: ({ children, className }) => {
            const isInline = !className;
            if (isInline) {
              return (
                <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono text-foreground">
                  {children}
                </code>
              );
            }
            return (
              <code className="block bg-muted rounded-lg p-4 text-xs font-mono text-foreground overflow-x-auto mb-3">
                {children}
              </code>
            );
          },
          pre: ({ children }) => <pre className="mb-3">{children}</pre>,
          table: ({ children }) => (
            <div className="overflow-x-auto mb-3 rounded-lg border border-border">
              <table className="w-full text-sm">{children}</table>
            </div>
          ),
          thead: ({ children }) => (
            <thead className="bg-muted/50 border-b border-border">
              {children}
            </thead>
          ),
          th: ({ children }) => (
            <th className="px-3 py-2 text-left text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              {children}
            </th>
          ),
          td: ({ children }) => (
            <td className="px-3 py-2 text-foreground/90 border-b border-border/50">
              {children}
            </td>
          ),
          hr: () => <Separator className="my-4" />,
          a: ({ children, href }) => (
            <a
              href={href}
              className="text-primary underline underline-offset-2 hover:text-primary/80"
              target="_blank"
              rel="noopener noreferrer"
            >
              {children}
            </a>
          ),
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// SMART STRUCTURED OUTPUT — The intelligent router
// ═══════════════════════════════════════════════════════════════════════════════

function SmartStructuredOutput({
  data,
  depth = 0,
  parentKey,
}: {
  data: unknown;
  depth?: number;
  parentKey?: string;
}) {
  // ── null / undefined ──
  if (data === null || data === undefined) {
    return (
      <p className="text-sm text-muted-foreground italic">Aucune donn\u00e9e</p>
    );
  }

  // ── Primitives ──
  if (typeof data === "boolean") {
    return <BooleanBadge value={data} />;
  }
  if (typeof data === "number") {
    if (parentKey && isScoreLikeValue(parentKey, data)) {
      return <ScoreBar value={data} label={humanizeKey(parentKey)} />;
    }
    if (parentKey && isCurrencyKey(parentKey)) {
      return <CurrencyValue value={data} />;
    }
    return <MetricValue value={data} label={parentKey} />;
  }
  if (typeof data === "string") {
    if (data.length > 200) {
      return <ProseBlock text={data} />;
    }
    return <ValueText text={data} />;
  }

  // ── Arrays ──
  if (Array.isArray(data)) {
    if (data.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">Liste vide</p>
      );
    }
    const classification = classifyArray(data);
    switch (classification) {
      case "strings":
        return <TagList items={data as string[]} />;
      case "scored-objects":
        return (
          <RankedCardGrid
            items={data as Record<string, unknown>[]}
            depth={depth}
          />
        );
      case "objects":
        return (
          <DataCardList
            items={data as Record<string, unknown>[]}
            depth={depth}
          />
        );
      default:
        return <GenericList items={data} />;
    }
  }

  // ── Objects ──
  if (typeof data === "object") {
    const obj = data as Record<string, unknown>;
    const entries = Object.entries(obj).filter(([k]) => k !== "label");

    if (entries.length === 0) {
      return (
        <p className="text-sm text-muted-foreground italic">Objet vide</p>
      );
    }

    // Depth guard
    if (depth > 3) {
      return <FallbackBlock data={data} />;
    }

    // ── Root-level smart pattern: detect main array + metadata ──
    if (depth === 0) {
      const arrayEntries = entries.filter(([, v]) => Array.isArray(v));
      const nonArrayEntries = entries.filter(([, v]) => !Array.isArray(v));

      // Pattern: ONE main array + optional metadata keys
      if (arrayEntries.length === 1 && arrayEntries[0]) {
        const [arrayKey, arrayValue] = arrayEntries[0];
        const topPickValue =
          nonArrayEntries.find(([k]) => k === "topPick")?.[1] ?? null;

        return (
          <div className="space-y-6">
            {/* Render metadata as header */}
            {nonArrayEntries.length > 0 && (
              <MetadataHeader entries={nonArrayEntries} />
            )}
            {/* Render main array */}
            <SectionBlock
              sectionKey={arrayKey}
              value={arrayValue}
              depth={depth}
              topPick={
                typeof topPickValue === "string" ? topPickValue : null
              }
            />
          </div>
        );
      }
    }

    // ── Flat object → KeyValueGrid ──
    if (isFlat(obj)) {
      return <KeyValueGrid entries={entries} />;
    }

    // ── Deep object → iterate sections ──
    return (
      <div className="space-y-5">
        {entries.map(([key, value]) => (
          <SectionBlock
            key={key}
            sectionKey={key}
            value={value}
            depth={depth}
          />
        ))}
      </div>
    );
  }

  // ── Fallback ──
  return <FallbackBlock data={data} />;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SUB-RENDERERS
// ═══════════════════════════════════════════════════════════════════════════════

// ── ScoreBar: visual score display 0-10 ──

function ScoreBar({ value, label }: { value: number; label?: string }) {
  const colors = getScoreColor(value);
  const pct = Math.min(Math.max((value / 10) * 100, 0), 100);

  return (
    <div className="flex items-center gap-3">
      {label && (
        <span className="text-xs font-medium text-muted-foreground w-32 shrink-0 truncate">
          {label}
        </span>
      )}
      <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
        <div
          className={cn("h-full rounded-full transition-all", colors.bar)}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span
        className={cn(
          "text-sm font-bold tabular-nums w-8 text-right",
          colors.text,
        )}
      >
        {value}
      </span>
    </div>
  );
}

// ── CurrencyValue ──

function CurrencyValue({ value }: { value: number }) {
  return (
    <span className="text-sm font-semibold tabular-nums text-foreground">
      {formatCurrency(value)}
    </span>
  );
}

// ── MetricValue ──

function MetricValue({
  value,
  label,
}: {
  value: number;
  label?: string;
}) {
  return (
    <div className="flex items-baseline gap-2">
      <span className="text-lg font-bold tabular-nums text-foreground">
        {new Intl.NumberFormat("fr-FR").format(value)}
      </span>
      {label && isDurationKey(label) && (
        <span className="text-xs text-muted-foreground">sec</span>
      )}
    </div>
  );
}

// ── ProseBlock: long text ──

function ProseBlock({ text }: { text: string }) {
  return (
    <p className="text-sm text-foreground/90 leading-relaxed whitespace-pre-wrap">
      {text}
    </p>
  );
}

// ── ValueText: short text ──

function ValueText({ text }: { text: string }) {
  return <span className="text-sm text-foreground">{text}</span>;
}

// ── BooleanBadge ──

function BooleanBadge({ value }: { value: boolean }) {
  return (
    <Badge
      variant={value ? "default" : "secondary"}
      className={cn(
        "text-xs gap-1",
        value
          ? "bg-success/15 text-success border-success/20 hover:bg-success/15"
          : "bg-muted text-muted-foreground",
      )}
    >
      {value ? (
        <CheckCircle2 className="h-3 w-3" />
      ) : (
        <XCircle className="h-3 w-3" />
      )}
      {value ? "Oui" : "Non"}
    </Badge>
  );
}

// ── TagList: string array as badges ──

function TagList({ items }: { items: string[] }) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {items.map((item, idx) => (
        <Badge
          key={idx}
          variant="secondary"
          className="text-xs font-normal"
        >
          {item}
        </Badge>
      ))}
    </div>
  );
}

// ── GenericList: fallback for mixed arrays ──

function GenericList({ items }: { items: unknown[] }) {
  return (
    <ul className="space-y-1.5 pl-4">
      {items.map((item, idx) => (
        <li key={idx} className="text-sm text-foreground/90 list-disc">
          {typeof item === "string"
            ? item
            : typeof item === "number"
              ? String(item)
              : JSON.stringify(item)}
        </li>
      ))}
    </ul>
  );
}

// ── KeyValueGrid: flat object as 2-column layout ──

function KeyValueGrid({
  entries,
}: {
  entries: [string, unknown][];
}) {
  return (
    <div className="grid grid-cols-[auto_1fr] gap-x-6 gap-y-2.5 items-baseline">
      {entries.map(([key, value]) => {
        // Skip rendering null/undefined
        if (value === null || value === undefined) return null;

        return (
          <div key={key} className="contents">
            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide whitespace-nowrap">
              {humanizeKey(key)}
            </span>
            <div>
              {isScoreLikeValue(key, value) ? (
                <ScoreBar value={value as number} />
              ) : isCurrencyKey(key) && typeof value === "number" ? (
                <CurrencyValue value={value} />
              ) : typeof value === "boolean" ? (
                <BooleanBadge value={value} />
              ) : typeof value === "number" ? (
                <span className="text-sm font-medium tabular-nums text-foreground">
                  {new Intl.NumberFormat("fr-FR").format(value)}
                </span>
              ) : typeof value === "string" && value.length > 200 ? (
                <ProseBlock text={value} />
              ) : (
                <span className="text-sm text-foreground">
                  {String(value)}
                </span>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── RankedCardGrid: array of objects WITH scores ──

function RankedCardGrid({
  items,
  depth,
  topPick,
}: {
  items: Record<string, unknown>[];
  depth: number;
  topPick?: string | null;
}) {
  return (
    <div className="grid grid-cols-1 gap-4">
      {items.map((item, idx) => {
        const titleKey = findTitleKey(item);
        const title = titleKey ? String(item[titleKey]) : `\u00c9l\u00e9ment ${idx + 1}`;
        const subtitleKey = findSubtitleKey(item, titleKey);
        const subtitle = subtitleKey ? String(item[subtitleKey]) : null;

        // Separate score entries from other entries
        const entries = Object.entries(item).filter(
          ([k]) => k !== "label" && k !== titleKey && k !== subtitleKey,
        );
        const scoreEntries = entries.filter(([k, v]) =>
          isScoreLikeValue(k, v),
        );
        const tagEntries = entries.filter(
          ([, v]) => Array.isArray(v) && v.every((i) => typeof i === "string"),
        );
        const proseEntries = entries.filter(
          ([k, v]) =>
            typeof v === "string" &&
            v.length > 80 &&
            !scoreEntries.some(([sk]) => sk === k) &&
            !tagEntries.some(([tk]) => tk === k),
        );
        const otherEntries = entries.filter(
          ([k]) =>
            !scoreEntries.some(([sk]) => sk === k) &&
            !tagEntries.some(([tk]) => tk === k) &&
            !proseEntries.some(([pk]) => pk === k),
        );

        // Check if this is the topPick
        const isTopPick =
          topPick != null &&
          title.toLowerCase().includes(topPick.toLowerCase());

        return (
          <Card
            key={idx}
            className={cn(
              "border-border shadow-sm overflow-hidden",
              isTopPick && "ring-2 ring-accent border-accent/30",
            )}
          >
            {isTopPick && (
              <div className="bg-accent/10 px-5 py-1.5 flex items-center gap-2 border-b border-accent/20">
                <Award className="h-3.5 w-3.5 text-accent-foreground" />
                <span className="text-xs font-semibold text-accent-foreground uppercase tracking-wide">
                  S\u00e9lection
                </span>
              </div>
            )}
            <CardContent className="p-5 space-y-4">
              {/* Title + subtitle + index */}
              <div className="flex items-start gap-3">
                <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-muted text-muted-foreground shrink-0">
                  <span className="text-xs font-bold">
                    {String.fromCharCode(65 + idx)}
                  </span>
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-semibold text-foreground leading-snug">
                    {title}
                  </h4>
                  {subtitle && (
                    <p className="text-sm text-muted-foreground mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Score section */}
              {scoreEntries.length > 0 && (
                <div className="space-y-2 bg-muted/30 rounded-lg p-3">
                  {scoreEntries.map(([key, value]) => (
                    <ScoreBar
                      key={key}
                      value={value as number}
                      label={humanizeKey(key)}
                    />
                  ))}
                </div>
              )}

              {/* Prose blocks */}
              {proseEntries.map(([key, value]) => (
                <div key={key} className="space-y-1">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {humanizeKey(key)}
                  </span>
                  <ProseBlock text={String(value)} />
                </div>
              ))}

              {/* Tags */}
              {tagEntries.map(([key, value]) => (
                <div key={key} className="space-y-1.5">
                  <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {humanizeKey(key)}
                  </span>
                  <TagList items={value as string[]} />
                </div>
              ))}

              {/* Other fields */}
              {otherEntries.length > 0 && (
                <div className="space-y-2">
                  {otherEntries.map(([key, value]) => {
                    // Nested objects/arrays
                    if (
                      typeof value === "object" &&
                      value !== null
                    ) {
                      return (
                        <div key={key} className="space-y-1.5">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {humanizeKey(key)}
                          </span>
                          <SmartStructuredOutput
                            data={value}
                            depth={depth + 1}
                            parentKey={key}
                          />
                        </div>
                      );
                    }
                    // Simple value
                    return (
                      <div
                        key={key}
                        className="flex items-baseline gap-2"
                      >
                        <span className="text-xs font-medium text-muted-foreground shrink-0">
                          {humanizeKey(key)}
                        </span>
                        <SmartStructuredOutput
                          data={value}
                          depth={depth + 1}
                          parentKey={key}
                        />
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── DataCardList: array of objects WITHOUT scores ──

function DataCardList({
  items,
  depth,
}: {
  items: Record<string, unknown>[];
  depth: number;
}) {
  return (
    <div className="space-y-3">
      {items.map((item, idx) => {
        const titleKey = findTitleKey(item);
        const title = titleKey ? String(item[titleKey]) : null;
        const subtitleKey = findSubtitleKey(item, titleKey);
        const subtitle = subtitleKey ? String(item[subtitleKey]) : null;

        const entries = Object.entries(item).filter(
          ([k]) => k !== "label" && k !== titleKey && k !== subtitleKey,
        );

        // Check if item has a "number" field (for scenes, steps, etc.)
        const numberKey = Object.keys(item).find(
          (k) =>
            (k === "number" || k === "step" || k === "etape") &&
            typeof item[k] === "number",
        );
        const itemNumber = numberKey ? (item[numberKey] as number) : null;

        return (
          <Card key={idx} className="border-border shadow-sm">
            <CardContent className="p-4 space-y-3">
              {/* Header with number/title */}
              <div className="flex items-start gap-3">
                {/* Number badge or index */}
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-primary shrink-0">
                  {itemNumber !== null ? (
                    <span className="text-xs font-bold">{itemNumber}</span>
                  ) : (
                    <Hash className="h-3 w-3" />
                  )}
                </div>
                <div className="min-w-0 flex-1">
                  {title && (
                    <h4 className="text-sm font-semibold text-foreground leading-snug">
                      {title}
                    </h4>
                  )}
                  {subtitle && (
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {subtitle}
                    </p>
                  )}
                </div>
              </div>

              {/* Content fields */}
              {entries.length > 0 && (
                <div className="pl-10 space-y-2">
                  {entries
                    .filter(([k]) => k !== numberKey)
                    .map(([key, value]) => {
                      if (value === null || value === undefined) return null;

                      // Nested object/array
                      if (typeof value === "object") {
                        return (
                          <div key={key} className="space-y-1">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {humanizeKey(key)}
                            </span>
                            <SmartStructuredOutput
                              data={value}
                              depth={depth + 1}
                              parentKey={key}
                            />
                          </div>
                        );
                      }

                      // String or number
                      return (
                        <div key={key} className="space-y-0.5">
                          <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            {humanizeKey(key)}
                          </span>
                          <SmartStructuredOutput
                            data={value}
                            depth={depth + 1}
                            parentKey={key}
                          />
                        </div>
                      );
                    })}
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

// ── SectionBlock: renders a key + its value as a titled section ──

function SectionBlock({
  sectionKey,
  value,
  depth,
  topPick,
}: {
  sectionKey: string;
  value: unknown;
  depth: number;
  topPick?: string | null;
}) {
  // For simple values, render inline
  if (value === null || typeof value !== "object") {
    return (
      <div className="flex items-baseline gap-3">
        <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide shrink-0">
          {humanizeKey(sectionKey)}
        </span>
        <SmartStructuredOutput
          data={value}
          depth={depth + 1}
          parentKey={sectionKey}
        />
      </div>
    );
  }

  // Heading size based on depth
  const HeadingTag = depth === 0 ? "h3" : depth === 1 ? "h4" : "h5";
  const headingClass =
    depth === 0
      ? "text-sm font-semibold uppercase tracking-wide text-muted-foreground"
      : depth === 1
        ? "text-xs font-semibold uppercase tracking-wide text-muted-foreground"
        : "text-xs font-medium text-muted-foreground";

  // Pass topPick to RankedCardGrid if the value is an array of scored objects
  const isArrayWithScores =
    Array.isArray(value) && classifyArray(value) === "scored-objects";

  return (
    <div className="space-y-3">
      <HeadingTag className={headingClass}>
        {humanizeKey(sectionKey)}
        {Array.isArray(value) && (
          <Badge
            variant="secondary"
            className="ml-2 text-[10px] font-normal"
          >
            {value.length}
          </Badge>
        )}
      </HeadingTag>
      {isArrayWithScores && topPick ? (
        <RankedCardGrid
          items={value as Record<string, unknown>[]}
          depth={depth + 1}
          topPick={topPick}
        />
      ) : (
        <SmartStructuredOutput
          data={value}
          depth={depth + 1}
          parentKey={sectionKey}
        />
      )}
    </div>
  );
}

// ── MetadataHeader: renders non-array root keys as a subtle header ──

function MetadataHeader({
  entries,
}: {
  entries: [string, unknown][];
}) {
  // Filter out topPick from visible metadata (it's handled by RankedCardGrid highlight)
  const visible = entries.filter(
    ([k, v]) =>
      k !== "topPick" &&
      v !== null &&
      v !== undefined &&
      typeof v !== "object",
  );
  const complexEntries = entries.filter(
    ([k, v]) =>
      k !== "topPick" && v !== null && typeof v === "object",
  );

  if (visible.length === 0 && complexEntries.length === 0) return null;

  return (
    <div className="space-y-3">
      {visible.length > 0 && (
        <div className="flex flex-wrap items-center gap-3 px-1">
          {visible.map(([key, value]) => (
            <div key={key} className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
                {humanizeKey(key)}
              </span>
              <span className="text-sm font-medium text-foreground">
                {String(value)}
              </span>
            </div>
          ))}
        </div>
      )}
      {complexEntries.map(([key, value]) => (
        <SectionBlock key={key} sectionKey={key} value={value} depth={0} />
      ))}
    </div>
  );
}

// ── FallbackBlock: last resort JSON display ──

function FallbackBlock({ data }: { data: unknown }) {
  return (
    <pre className="bg-muted rounded-lg p-4 text-xs font-mono text-muted-foreground overflow-x-auto whitespace-pre-wrap break-words">
      {JSON.stringify(data, null, 2)}
    </pre>
  );
}
