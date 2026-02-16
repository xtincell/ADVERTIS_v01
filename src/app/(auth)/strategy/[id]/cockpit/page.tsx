"use client";

import { useState, use } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Share2,
  Download,
  Loader2,
} from "lucide-react";

import { api } from "~/trpc/react";
import { Button } from "~/components/ui/button";
import {
  CockpitContent,
  type CockpitData,
} from "~/components/cockpit/cockpit-content";
import { CockpitShareDialog } from "~/components/cockpit/cockpit-share-dialog";
import { ExportDialog } from "~/components/strategy/export-dialog";

export default function CockpitPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = use(props.params);
  const strategyId = params.id;
  const [showShareDialog, setShowShareDialog] = useState(false);

  const { data: strategy, isLoading } = api.cockpit.getData.useQuery(
    { strategyId },
    { enabled: !!strategyId },
  );

  if (isLoading || !strategy) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-terracotta" />
      </div>
    );
  }

  const cockpitData: CockpitData = {
    brandName: strategy.brandName,
    name: strategy.name,
    sector: strategy.sector,
    description: strategy.description,
    phase: strategy.phase,
    coherenceScore: strategy.coherenceScore,
    pillars: strategy.pillars.map((p) => ({
      type: p.type,
      title: p.title,
      status: p.status,
      summary: p.summary,
      content: p.content,
    })),
    documents: strategy.documents.map((d) => ({
      id: d.id,
      type: d.type,
      title: d.title,
      status: d.status,
      pageCount: d.pageCount,
    })),
  };

  return (
    <div className="mx-auto max-w-5xl">
      {/* Header */}
      <div className="mb-8 flex items-center justify-between">
        <Button variant="ghost" size="sm" asChild className="-ml-2">
          <Link href={`/strategy/${strategyId}`}>
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Retour à la stratégie
          </Link>
        </Button>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowShareDialog(true)}
          >
            <Share2 className="mr-1.5 h-3.5 w-3.5" />
            Partager
          </Button>
          <ExportDialog
            strategyId={strategyId}
            brandName={strategy.brandName}
            pillars={strategy.pillars.map((p) => ({
              type: p.type,
              title: p.title,
              status: p.status,
            }))}
          >
            <Button variant="outline" size="sm">
              <Download className="mr-1.5 h-3.5 w-3.5" />
              Exporter PDF
            </Button>
          </ExportDialog>
        </div>
      </div>

      {/* Cockpit content */}
      <CockpitContent data={cockpitData} />

      {/* Share dialog */}
      {showShareDialog && (
        <CockpitShareDialog
          strategyId={strategyId}
          onClose={() => setShowShareDialog(false)}
        />
      )}
    </div>
  );
}
