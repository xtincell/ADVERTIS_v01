"use client";

import { AuthenticiteEditor } from "./authenticite-editor";
import { DistinctionEditor } from "./distinction-editor";
import { ValeurEditor } from "./valeur-editor";
import { EngagementEditor } from "./engagement-editor";

import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
import type { DistinctionPillarData } from "~/lib/types/pillar-data";
import type { ValeurPillarData } from "~/lib/types/pillar-data";
import type { EngagementPillarData } from "~/lib/types/pillar-data";
import { parsePillarContent } from "~/lib/types/pillar-parsers";

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
      const { data } = parsePillarContent<AuthenticitePillarData>("A", content);
      return <AuthenticiteEditor data={data} onChange={onChange} />;
    }
    case "D": {
      const { data } = parsePillarContent<DistinctionPillarData>("D", content);
      return <DistinctionEditor data={data} onChange={onChange} />;
    }
    case "V": {
      const { data } = parsePillarContent<ValeurPillarData>("V", content);
      return <ValeurEditor data={data} onChange={onChange} />;
    }
    case "E": {
      const { data } = parsePillarContent<EngagementPillarData>("E", content);
      return <EngagementEditor data={data} onChange={onChange} />;
    }
    // R, T, I, S — generic object display for now (could add dedicated editors later)
    default:
      return null;
  }
}
