"use client";

// =============================================================================
// PAGE P.CAMPAIGN_TEMPLATES — Campaign Template Library
// =============================================================================
// Browse and use campaign templates to quickly create new campaigns.
// =============================================================================

import { useRouter } from "next/navigation";
import { ArrowLeft, FileText } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CampaignTemplateSelector } from "~/components/campaign/campaign-template-selector";

export default function CampaignTemplatesPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-8 animate-page-enter">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <FileText className="h-6 w-6 text-primary" />
        <h1 className="text-display-lg">Templates Campagnes</h1>
      </div>
      <CampaignTemplateSelector
        onTemplateUsed={(id) => router.push(`/campaigns/${id}`)}
      />
    </div>
  );
}
