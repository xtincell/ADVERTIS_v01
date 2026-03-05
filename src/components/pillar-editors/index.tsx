// ==========================================================================
// C.E0 — Pillar Editors Index
// Dynamic editor loader by pillar type.
// Uses next/dynamic for code splitting — only the active editor is loaded.
// ==========================================================================

"use client";

import dynamic from "next/dynamic";
import { Loader2 } from "lucide-react";

import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
import type { DistinctionPillarData } from "~/lib/types/pillar-data";
import type { ValeurPillarDataV2 } from "~/lib/types/pillar-data";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import type {
  TrackAuditResult,
  RiskAuditResult,
  ImplementationData,
  SynthesePillarData,
} from "~/lib/types/pillar-schemas";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

// ---------------------------------------------------------------------------
// Lazy-loaded editors — each ~200-600 lines, only one rendered at a time.
// next/dynamic requires object literal options (no shared variable).
// ---------------------------------------------------------------------------

const EditorSpinner = () => (
  <div className="flex items-center justify-center py-12">
    <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
  </div>
);

const AuthenticiteEditor = dynamic(
  () => import("./authenticite-editor").then((m) => ({ default: m.AuthenticiteEditor })),
  { loading: EditorSpinner },
);
const DistinctionEditor = dynamic(
  () => import("./distinction-editor").then((m) => ({ default: m.DistinctionEditor })),
  { loading: EditorSpinner },
);
const ValeurEditor = dynamic(
  () => import("./valeur-editor").then((m) => ({ default: m.ValeurEditor })),
  { loading: EditorSpinner },
);
const EngagementEditor = dynamic(
  () => import("./engagement-editor").then((m) => ({ default: m.EngagementEditor })),
  { loading: EditorSpinner },
);
const TrackEditor = dynamic(
  () => import("./track-editor").then((m) => ({ default: m.TrackEditor })),
  { loading: EditorSpinner },
);
const RiskEditor = dynamic(
  () => import("./risk-editor").then((m) => ({ default: m.RiskEditor })),
  { loading: EditorSpinner },
);
const ImplementationEditor = dynamic(
  () => import("./implementation-editor").then((m) => ({ default: m.ImplementationEditor })),
  { loading: EditorSpinner },
);
const SyntheseEditor = dynamic(
  () => import("./synthese-editor").then((m) => ({ default: m.SyntheseEditor })),
  { loading: EditorSpinner },
);

// ---------------------------------------------------------------------------
// Dispatcher — picks the right editor for structured pillar content
// ---------------------------------------------------------------------------

interface StructuredPillarEditorProps {
  pillarType: string;
  content: unknown;
  onChange: (content: unknown) => void;
}

/**
 * Checks if the content is a structured JSON object (not a string).
 * If so, renders the appropriate per-pillar form editor.
 * Returns null if the content is not structured (legacy markdown),
 * so the caller can fallback to the raw textarea.
 */
export function StructuredPillarEditor({
  pillarType,
  content,
  onChange,
}: StructuredPillarEditorProps) {
  // Only handle structured JSON content
  if (typeof content !== "object" || content === null) {
    return null;
  }

  switch (pillarType) {
    case "A": {
      const { data } = parsePillarContent<AuthenticitePillarData>(
        "A",
        content,
      );
      return <AuthenticiteEditor data={data} onChange={onChange} />;
    }
    case "D": {
      const { data } = parsePillarContent<DistinctionPillarData>(
        "D",
        content,
      );
      return <DistinctionEditor data={data} onChange={onChange} />;
    }
    case "V": {
      const { data } = parsePillarContent<ValeurPillarDataV2>("V", content);
      return <ValeurEditor data={data} onChange={onChange} />;
    }
    case "E": {
      const { data } = parsePillarContent<EngagementPillarData>(
        "E",
        content,
      );
      return <EngagementEditor data={data} onChange={onChange} />;
    }
    case "T": {
      const { data } = parsePillarContent<TrackAuditResult>("T", content);
      return <TrackEditor data={data} onChange={onChange} />;
    }
    case "R": {
      const { data } = parsePillarContent<RiskAuditResult>("R", content);
      return <RiskEditor data={data} onChange={onChange} />;
    }
    case "I": {
      const { data } = parsePillarContent<ImplementationData>("I", content);
      return <ImplementationEditor data={data} onChange={onChange} />;
    }
    case "S": {
      const { data } = parsePillarContent<SynthesePillarData>("S", content);
      return <SyntheseEditor data={data} onChange={onChange} />;
    }
    default:
      return null;
  }
}
