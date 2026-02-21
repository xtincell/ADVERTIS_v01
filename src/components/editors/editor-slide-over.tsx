// ==========================================================================
// C.ED1 — Editor Slide-Over
// Desktop slide-over panel for editing pillars. Opens from the right side
// as a Sheet overlay (~2/3 screen width). Hidden on mobile — the page
// decides which wrapper (slide-over vs full-screen) to render.
// ==========================================================================

"use client";

import type React from "react";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "~/components/ui/sheet";

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

interface EditorSlideOverProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  children: React.ReactNode;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export function EditorSlideOver({
  open,
  onOpenChange,
  title,
  children,
}: EditorSlideOverProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="max-w-2xl w-full overflow-y-auto"
      >
        <SheetHeader>
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <div className="flex-1 px-4 pb-6">{children}</div>
      </SheetContent>
    </Sheet>
  );
}
