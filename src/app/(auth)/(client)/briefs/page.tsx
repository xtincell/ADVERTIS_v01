// ==========================================================================
// PAGE P.C2 — Client Briefs
// Shows documents/briefs generated for the client's brand.
// ==========================================================================

"use client";

import {
  FileText,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Card, CardContent } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";

export default function ClientBriefsPage() {
  // Step 1: Get the client's strategies — pick the first one
  const {
    data: strategies,
    isLoading: strategiesLoading,
  } = api.strategy.getAll.useQuery({});

  const firstStrategy = strategies?.[0] as
    | { id: string; brandName: string }
    | undefined;

  // Step 2: Fetch cockpit data to get the documents array
  const {
    data: cockpitData,
    isLoading: cockpitLoading,
    error,
  } = api.cockpit.getData.useQuery(
    { strategyId: firstStrategy?.id ?? "" },
    { enabled: !!firstStrategy?.id },
  );

  const isLoading = strategiesLoading || (firstStrategy && cockpitLoading);

  // ---------------------------------------------------------------------------
  // Loading
  // ---------------------------------------------------------------------------
  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Error
  // ---------------------------------------------------------------------------
  if (error) {
    return (
      <div className="flex h-96 flex-col items-center justify-center gap-2 text-center">
        <AlertCircle className="h-8 w-8 text-destructive/50" />
        <p className="text-sm text-muted-foreground">
          Erreur lors du chargement de vos documents.
        </p>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // Extract documents
  // ---------------------------------------------------------------------------
  const documents = (cockpitData as { documents?: Array<{
    id: string;
    type: string;
    title: string;
    status: string;
    pageCount: number | null;
  }> })?.documents ?? [];

  return (
    <div className="mx-auto max-w-3xl space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center gap-2">
        <FileText className="h-5 w-5 text-primary" />
        <h1 className="text-xl font-semibold">Mes Documents</h1>
      </div>

      {firstStrategy && (
        <p className="text-sm text-muted-foreground">
          Documents stratégiques pour{" "}
          <span className="font-medium text-foreground">
            {firstStrategy.brandName}
          </span>
        </p>
      )}

      {/* Document List */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="py-8 text-center text-sm text-muted-foreground">
            Aucun document disponible pour le moment.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {documents.map((doc) => {
            const isComplete = doc.status === "complete" || doc.status === "VALIDATED";

            return (
              <Card key={doc.id}>
                <CardContent className="py-4">
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        <span className="font-medium">{doc.title}</span>
                      </div>
                      <div className="mt-1.5 flex flex-wrap items-center gap-2 text-xs">
                        <Badge variant="outline">{doc.type}</Badge>
                        {doc.pageCount != null && (
                          <span className="text-muted-foreground">
                            {doc.pageCount} page{doc.pageCount > 1 ? "s" : ""}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5">
                      {isComplete ? (
                        <Badge
                          variant="secondary"
                          className="border-emerald-200 bg-emerald-50 text-emerald-600"
                        >
                          <CheckCircle2 className="mr-1 h-3 w-3" />
                          Prêt
                        </Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs">
                          <Clock className="mr-1 h-3 w-3" />
                          {doc.status}
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
