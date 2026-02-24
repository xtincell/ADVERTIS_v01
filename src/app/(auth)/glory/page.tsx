"use client";

// =============================================================================
// PAGE P.GLORY — Glory Hub Page
// =============================================================================
// Main GLORY hub page. Loads tools via tRPC and renders the GloryHub component.
// =============================================================================

import { useSearchParams } from "next/navigation";
import { api } from "~/trpc/react";
import { GloryHub } from "~/components/glory/glory-hub";
import { Loader2, Sparkles } from "lucide-react";
import { Skeleton } from "~/components/ui/skeleton";

export default function GloryPage() {
  const searchParams = useSearchParams();
  const strategyId = searchParams.get("strategyId") ?? undefined;

  const { data: tools, isLoading, isError } = api.glory.listTools.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#6C5CE7]" />
          <Skeleton className="h-8 w-48" />
        </div>
        <Skeleton className="h-4 w-96" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 9 }).map((_, i) => (
            <Skeleton key={i} className="h-36 w-full rounded-lg" />
          ))}
        </div>
      </div>
    );
  }

  if (isError || !tools) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center">
        <Loader2 className="h-8 w-8 text-red-500 mb-4" />
        <h2 className="text-lg font-semibold text-gray-600">
          Impossible de charger les outils
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Veuillez rafraîchir la page pour réessayer.
        </p>
      </div>
    );
  }

  return <GloryHub tools={tools} strategyId={strategyId} />;
}
