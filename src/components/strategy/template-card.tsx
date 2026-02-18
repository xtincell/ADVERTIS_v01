"use client";

import {
  FileText,
  Eye,
  Loader2,
  CheckCircle,
  AlertCircle,
  Clock,
  RefreshCw,
  Sparkles,
  Presentation,
  BookOpen,
} from "lucide-react";
import { cn } from "~/lib/utils";
import { TEMPLATE_CONFIG } from "~/lib/constants";
import type { TemplateType } from "~/lib/constants";

interface TemplateCardProps {
  templateType: TemplateType;
  status: "pending" | "generating" | "complete" | "error";
  slideCount?: number | null;
  sectionCount?: number;
  totalSections?: number;
  errorMessage?: string | null;
  generatedAt?: Date | null;
  onGenerate?: () => void;
  onView?: () => void;
  onRegenerate?: () => void;
  className?: string;
}

export function TemplateCard({
  templateType,
  status,
  slideCount,
  sectionCount,
  totalSections,
  errorMessage,
  generatedAt,
  onGenerate,
  onView,
  onRegenerate,
  className,
}: TemplateCardProps) {
  const config = TEMPLATE_CONFIG[templateType];
  const unitLabel = config.unit === "slides" ? "slides" : "pages";

  const IconComponent =
    config.unit === "slides" ? Presentation : BookOpen;

  return (
    <div
      className={cn(
        "rounded-lg border bg-card p-4 transition-all",
        status === "complete" && "border-green-200",
        status === "generating" && "border-terracotta/30 animate-pulse",
        status === "error" && "border-red-200",
        status === "pending" && "border-muted opacity-60",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-lg",
              status === "complete" && "bg-green-50 text-green-600",
              status === "generating" && "bg-terracotta/10 text-terracotta",
              status === "error" && "bg-red-50 text-red-500",
              status === "pending" && "bg-muted text-muted-foreground",
            )}
          >
            {status === "generating" ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : status === "complete" ? (
              <CheckCircle className="h-5 w-5" />
            ) : status === "error" ? (
              <AlertCircle className="h-5 w-5" />
            ) : (
              <IconComponent className="h-5 w-5" />
            )}
          </div>

          <div>
            <h3 className="text-sm font-semibold">{config.title}</h3>
            <p className="text-xs text-muted-foreground">
              {config.subtitle} • {config.estimatedSlides[0]}-
              {config.estimatedSlides[1]} {unitLabel}
            </p>
          </div>
        </div>

        {/* Status badge */}
        <TemplateStatusBadge status={status} />
      </div>

      {/* Progress bar for generating */}
      {status === "generating" && totalSections && totalSections > 0 && (
        <div className="mt-3">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Section {sectionCount ?? 0}/{totalSections}
            </span>
            <span>
              {Math.round(((sectionCount ?? 0) / totalSections) * 100)}%
            </span>
          </div>
          <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div
              className="h-full rounded-full bg-terracotta transition-all duration-500"
              style={{
                width: `${((sectionCount ?? 0) / totalSections) * 100}%`,
              }}
            />
          </div>
        </div>
      )}

      {/* Stats for completed */}
      {status === "complete" && (
        <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
          {slideCount && (
            <span className="flex items-center gap-1">
              <FileText className="h-3 w-3" />
              ~{slideCount} {unitLabel}
            </span>
          )}
          {generatedAt && (
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {new Date(generatedAt).toLocaleDateString("fr-FR")}
            </span>
          )}
        </div>
      )}

      {/* Error message */}
      {status === "error" && errorMessage && (
        <p className="mt-2 text-xs text-red-500">{errorMessage}</p>
      )}

      {/* Sections list */}
      {status === "complete" && (
        <div className="mt-3 space-y-1">
          {config.sections.map((section, i) => (
            <div
              key={i}
              className="flex items-center gap-2 text-xs text-muted-foreground"
            >
              <CheckCircle className="h-3 w-3 text-green-500" />
              <span>{section}</span>
            </div>
          ))}
        </div>
      )}

      {/* Generate button for pending */}
      {status === "pending" && onGenerate && (
        <div className="mt-4">
          <button
            onClick={onGenerate}
            className="inline-flex items-center gap-1.5 rounded-md bg-terracotta/10 px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta/20 transition-colors"
          >
            <Sparkles className="h-3.5 w-3.5" />
            Générer
          </button>
        </div>
      )}

      {/* Actions */}
      {(status === "complete" || status === "error") && (
        <div className="mt-4 flex items-center gap-2">
          {status === "complete" && onView && (
            <button
              onClick={onView}
              className="inline-flex items-center gap-1.5 rounded-md bg-terracotta/10 px-3 py-1.5 text-xs font-medium text-terracotta hover:bg-terracotta/20 transition-colors"
            >
              <Eye className="h-3.5 w-3.5" />
              Voir
            </button>
          )}
          {(status === "error" || status === "complete") && onRegenerate && (
            <button
              onClick={onRegenerate}
              className="inline-flex items-center gap-1.5 rounded-md bg-muted px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted/80 transition-colors"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Régénérer
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Status Badge sub-component
// ---------------------------------------------------------------------------

function TemplateStatusBadge({
  status,
}: {
  status: "pending" | "generating" | "complete" | "error";
}) {
  const statusConfig = {
    pending: {
      label: "En attente",
      className: "bg-muted text-muted-foreground",
    },
    generating: {
      label: "Génération...",
      className: "bg-terracotta/10 text-terracotta",
    },
    complete: {
      label: "Terminé",
      className: "bg-green-50 text-green-700",
    },
    error: {
      label: "Erreur",
      className: "bg-red-50 text-red-600",
    },
  };

  const cfg = statusConfig[status];

  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium",
        cfg.className,
      )}
    >
      {cfg.label}
    </span>
  );
}
