"use client";

import { AuthenticiteEditor } from "./authenticite-editor";
import { DistinctionEditor } from "./distinction-editor";
import { ValeurEditor } from "./valeur-editor";
import { EngagementEditor } from "./engagement-editor";

import type { AuthenticitePillarData } from "~/lib/types/pillar-data";
import type { DistinctionPillarData } from "~/lib/types/pillar-data";
import type { ValeurPillarData } from "~/lib/types/pillar-data";
import type { EngagementPillarData } from "~/lib/types/pillar-data";

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
    case "A":
      return (
        <AuthenticiteEditor
          data={content as AuthenticitePillarData}
          onChange={onChange}
        />
      );
    case "D":
      return (
        <DistinctionEditor
          data={content as DistinctionPillarData}
          onChange={onChange}
        />
      );
    case "V":
      return (
        <ValeurEditor
          data={content as ValeurPillarData}
          onChange={onChange}
        />
      );
    case "E":
      return (
        <EngagementEditor
          data={content as EngagementPillarData}
          onChange={onChange}
        />
      );
    // R, T, I, S — generic object display for now (could add dedicated editors later)
    default:
      return null;
  }
}
