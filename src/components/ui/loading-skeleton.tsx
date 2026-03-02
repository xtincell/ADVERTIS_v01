// ==========================================================================
// UI — Loading Skeletons
// Standardized loading states used across all pages.
// ==========================================================================

import { Loader2 } from "lucide-react";
import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Full-page spinner (centered)
// ---------------------------------------------------------------------------

interface PageSpinnerProps {
  label?: string;
  className?: string;
}

export function PageSpinner({ label, className }: PageSpinnerProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-3 py-20",
        className,
      )}
    >
      <div className="animate-float">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
      {label && (
        <p className="text-sm text-muted-foreground">{label}</p>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Card skeleton (for lists)
// ---------------------------------------------------------------------------

interface CardSkeletonProps {
  count?: number;
  className?: string;
}

export function CardSkeleton({ count = 3, className }: CardSkeletonProps) {
  return (
    <div className={cn("space-y-3 stagger-children", className)}>
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="h-24 shimmer rounded-xl bg-muted"
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dashboard skeleton (greeting + KPIs + list)
// ---------------------------------------------------------------------------

export function DashboardSkeleton() {
  return (
    <div className="flex flex-col gap-4 p-4 pb-24 md:p-6 stagger-children">
      <div className="space-y-2">
        <div className="h-7 w-48 shimmer rounded-md bg-muted" />
        <div className="h-4 w-32 shimmer rounded-md bg-muted" />
      </div>
      <div className="h-10 w-full shimmer rounded-lg bg-muted" />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-20 shimmer rounded-xl bg-muted" />
        ))}
      </div>
      <CardSkeleton count={3} />
    </div>
  );
}

// ---------------------------------------------------------------------------
// Form skeleton
// ---------------------------------------------------------------------------

interface FormSkeletonProps {
  fields?: number;
}

export function FormSkeleton({ fields = 4 }: FormSkeletonProps) {
  return (
    <div className="space-y-4 p-4 md:p-6 stagger-children">
      <div className="h-6 w-48 shimmer rounded-md bg-muted" />
      {Array.from({ length: fields }).map((_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-24 shimmer rounded bg-muted" />
          <div className="h-10 w-full shimmer rounded-md bg-muted" />
        </div>
      ))}
    </div>
  );
}
