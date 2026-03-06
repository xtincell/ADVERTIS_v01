"use client";

// =============================================================================
// PAGE P.CAMPAIGN_DETAIL — Campaign Detail View
// =============================================================================
// Full 360° campaign view with tabs for all sub-domains: actions, executions,
// amplifications, team, milestones, budget, approvals, assets, briefs, reports.
// =============================================================================

import { use } from "react";
import { useRouter } from "next/navigation";
import { CampaignDetail } from "~/components/campaign/campaign-detail";

export default function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const router = useRouter();

  return (
    <div className="p-4 pb-24 md:p-8 animate-page-enter">
      <CampaignDetail
        campaignId={id}
        onNavigate={(path) => router.push(path)}
      />
    </div>
  );
}
