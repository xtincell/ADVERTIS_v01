"use client";

// =============================================================================
// PAGE P.CAMPAIGN_CALENDAR — Campaign Calendar View
// =============================================================================
// Annual calendar visualization of all campaigns with timeline bars.
// =============================================================================

import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar } from "lucide-react";
import { Button } from "~/components/ui/button";
import { CampaignCalendar } from "~/components/campaign/campaign-calendar";

export default function CampaignCalendarPage() {
  const router = useRouter();

  return (
    <div className="flex flex-col gap-6 p-4 pb-24 md:p-8 animate-page-enter">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="icon" onClick={() => router.push("/campaigns")}>
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <Calendar className="h-6 w-6 text-primary" />
        <h1 className="text-display-lg">Calendrier Campagnes</h1>
      </div>
      <CampaignCalendar year={new Date().getFullYear()} />
    </div>
  );
}
