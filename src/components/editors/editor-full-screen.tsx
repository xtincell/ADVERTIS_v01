// ==========================================================================
// C.ED2 — Editor Full Screen
// Mobile full-screen editor wrapper. Fixed sticky header with back arrow,
// title and optional save button. Scrollable content area below.
// ==========================================================================

"use client";

import type React from "react";
import { ArrowLeft, Save, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditorFullScreenProps {
  title: string;
  onBack: () => void;
  onSave?: () => void;
  isSaving?: boolean;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorFullScreen({
  title,
  onBack,
  onSave,
  isSaving,
  children,
}: EditorFullScreenProps) {
  return (
    <div className="flex min-h-screen flex-col">
      {/* Sticky header */}
      <header className="sticky top-0 z-40 flex items-center justify-between border-b bg-background px-4 py-3">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="size-5" />
            <span className="sr-only">Retour</span>
          </Button>
          <h1 className="text-lg font-semibold truncate">{title}</h1>
        </div>

        {onSave && (
          <Button size="sm" onClick={onSave} disabled={isSaving}>
            {isSaving ? (
              <Loader2 className="mr-1.5 size-4 animate-spin" />
            ) : (
              <Save className="mr-1.5 size-4" />
            )}
            Sauvegarder
          </Button>
        )}
      </header>

      {/* Scrollable content */}
      <main className="flex-1 overflow-y-auto px-4 py-6">{children}</main>
    </div>
  );
}
