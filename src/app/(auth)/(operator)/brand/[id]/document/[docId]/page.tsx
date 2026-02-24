// ==========================================================================
// PAGE P.8J — Document View (Operator / Brand)
// Translation document viewer for the operator brand view.
// Replicates the pattern from the strategy document viewer page (P.10).
// ==========================================================================

"use client";

import { use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  FileText,
  Clock,
  RefreshCw,
  Loader2,
  AlertTriangle,
  CheckCircle,
  Presentation,
  BookOpen,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { TEMPLATE_CONFIG, REPORT_TYPES } from "~/lib/constants";
import type { TemplateType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Document Viewer Page
// ---------------------------------------------------------------------------

export default function BrandDocumentViewerPage(props: {
  params: Promise<{ id: string; docId: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const documentId = params.docId;
  const router = useRouter();

  // Fetch document data
  const {
    data: document,
    isLoading,
    isError,
    error,
  } = api.document.getById.useQuery(
    { id: documentId },
    { enabled: !!documentId },
  );

  // Loading state
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
        <p className="mt-2 text-sm text-muted-foreground">
          Chargement du document...
        </p>
      </div>
    );
  }

  // Error state
  if (isError || !document) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <AlertTriangle className="h-8 w-8 text-red-500" />
        <p className="mt-2 text-sm text-red-600">
          {error?.message ?? "Document non trouvé"}
        </p>
        <Button
          variant="outline"
          className="mt-4"
          onClick={() => router.push(`/brand/${strategyId}/generate`)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Retour au pipeline
        </Button>
      </div>
    );
  }

  // Determine if this is a template or a report
  const isTemplate = Object.keys(TEMPLATE_CONFIG).includes(document.type);
  const templateConfig = isTemplate
    ? TEMPLATE_CONFIG[document.type as TemplateType]
    : null;
  const isSlides = templateConfig?.unit === "slides";
  const unitLabel = isSlides ? "slides" : "pages";
  const IconComponent = isSlides ? Presentation : BookOpen;

  // Parse sections from document
  const sections =
    (document.sections as Array<{
      title: string;
      content: string;
      order: number;
      wordCount: number;
      estimatedSlides?: number;
    }> | null) ?? [];

  const totalWords = sections.reduce((sum, s) => sum + (s.wordCount ?? 0), 0);

  return (
    <div className="mx-auto max-w-5xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <Link
              href={`/brand/${strategyId}/generate`}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div className="flex items-center gap-2">
              <IconComponent className="h-6 w-6 text-terracotta" />
              <h1 className="text-2xl font-bold tracking-tight">
                {document.title}
              </h1>
            </div>
            <Badge
              variant={
                document.status === "complete" ? "default" : "destructive"
              }
              className={
                document.status === "complete"
                  ? "bg-green-50 text-green-700 border-green-200"
                  : undefined
              }
            >
              {document.status === "complete"
                ? "Terminé"
                : document.status}
            </Badge>
          </div>
          {templateConfig && (
            <p className="mt-1 ml-10 text-sm text-muted-foreground">
              {templateConfig.subtitle} &bull;{" "}
              {templateConfig.estimatedSlides[0]}-
              {templateConfig.estimatedSlides[1]} {unitLabel}
            </p>
          )}
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => router.push(`/brand/${strategyId}/generate`)}
        >
          <RefreshCw className="mr-2 h-3.5 w-3.5" />
          R&eacute;g&eacute;n&eacute;rer
        </Button>
      </div>

      {/* Stats bar */}
      <div className="flex items-center gap-6 rounded-lg border bg-muted/30 px-4 py-3 text-sm">
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <FileText className="h-4 w-4" />
          {sections.length} sections
        </span>
        {document.pageCount != null && document.pageCount > 0 && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <IconComponent className="h-4 w-4" />~{document.pageCount}{" "}
            {unitLabel}
          </span>
        )}
        <span className="flex items-center gap-1.5 text-muted-foreground">
          <BookOpen className="h-4 w-4" />
          {totalWords.toLocaleString("fr-FR")} mots
        </span>
        {document.generatedAt && (
          <span className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-4 w-4" />
            {new Date(document.generatedAt).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "long",
              year: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        )}
      </div>

      {/* Error message */}
      {document.errorMessage && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="mr-2 inline h-4 w-4" />
          {document.errorMessage}
        </div>
      )}

      {/* Sections */}
      {sections.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center py-12">
            <FileText className="h-12 w-12 text-muted-foreground/30" />
            <p className="mt-3 text-sm text-muted-foreground">
              Ce document ne contient aucune section.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sections
            .sort((a, b) => a.order - b.order)
            .map((section, idx) => {
              const isErr = section.content.startsWith("[Erreur");
              return (
                <Card
                  key={idx}
                  className={isErr ? "border-red-200" : undefined}
                >
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="flex items-center gap-2 text-base">
                        {isErr ? (
                          <AlertTriangle className="h-4 w-4 text-red-500" />
                        ) : (
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        )}
                        <span className="text-muted-foreground/60 text-sm font-normal">
                          {section.order}.
                        </span>
                        {section.title}
                      </CardTitle>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        {section.wordCount > 0 && (
                          <span>{section.wordCount} mots</span>
                        )}
                        {section.estimatedSlides != null &&
                          section.estimatedSlides > 0 && (
                            <span>
                              ~{section.estimatedSlides} {unitLabel}
                            </span>
                          )}
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {isErr ? (
                      <p className="text-sm text-red-600">
                        {section.content}
                      </p>
                    ) : (
                      <div className="prose prose-sm max-w-none text-foreground">
                        <DocumentContent content={section.content} />
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simple markdown-like renderer
// ---------------------------------------------------------------------------

function DocumentContent({ content }: { content: string }) {
  const lines = content.split("\n");
  const elements: React.ReactNode[] = [];
  let listItems: string[] = [];

  const flushList = () => {
    if (listItems.length > 0) {
      elements.push(
        <ul
          key={`list-${elements.length}`}
          className="my-2 list-disc pl-5 space-y-0.5"
        >
          {listItems.map((item, i) => (
            <li key={i} className="text-sm leading-relaxed">
              {renderInline(item)}
            </li>
          ))}
        </ul>,
      );
      listItems = [];
    }
  };

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]!;
    const trimmed = line.trim();

    if (trimmed === "---") {
      flushList();
      elements.push(
        <hr key={`hr-${i}`} className="my-4 border-terracotta/20" />,
      );
      continue;
    }

    if (trimmed.startsWith("## ")) {
      flushList();
      elements.push(
        <h3
          key={`h2-${i}`}
          className="mt-4 mb-2 text-base font-semibold text-foreground"
        >
          {renderInline(trimmed.slice(3))}
        </h3>,
      );
      continue;
    }

    if (trimmed.startsWith("### ")) {
      flushList();
      elements.push(
        <h4
          key={`h3-${i}`}
          className="mt-3 mb-1 text-sm font-semibold text-foreground"
        >
          {renderInline(trimmed.slice(4))}
        </h4>,
      );
      continue;
    }

    if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
      listItems.push(trimmed.slice(2));
      continue;
    }

    if (/^\d+\.\s/.test(trimmed)) {
      listItems.push(trimmed.replace(/^\d+\.\s/, ""));
      continue;
    }

    if (trimmed === "") {
      flushList();
      continue;
    }

    flushList();
    elements.push(
      <p key={`p-${i}`} className="my-1.5 text-sm leading-relaxed">
        {renderInline(trimmed)}
      </p>,
    );
  }

  flushList();

  return <>{elements}</>;
}

function renderInline(text: string): React.ReactNode {
  const parts: React.ReactNode[] = [];
  let lastIndex = 0;
  const boldRegex = /\*\*(.+?)\*\*/g;
  let match;

  while ((match = boldRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index));
    }
    parts.push(
      <strong key={match.index} className="font-semibold">
        {match[1]}
      </strong>,
    );
    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < text.length) {
    parts.push(text.slice(lastIndex));
  }

  return parts.length > 0 ? <>{parts}</> : text;
}
