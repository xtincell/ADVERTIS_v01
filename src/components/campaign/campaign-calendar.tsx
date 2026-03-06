"use client";

import { useState, useMemo } from "react";
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { api } from "~/trpc/react";
import {
  CAMPAIGN_STATUS_LABELS,
  CAMPAIGN_STATUS_COLORS,
} from "~/lib/constants";

interface CampaignCalendarProps {
  year: number;
}

const MONTHS = [
  "Jan", "Fév", "Mar", "Avr", "Mai", "Jun",
  "Jul", "Aoû", "Sep", "Oct", "Nov", "Déc",
];

const CAMPAIGN_BAR_COLORS = [
  "bg-blue-400",
  "bg-emerald-400",
  "bg-amber-400",
  "bg-purple-400",
  "bg-rose-400",
  "bg-cyan-400",
  "bg-orange-400",
  "bg-indigo-400",
  "bg-teal-400",
  "bg-pink-400",
];

interface CalendarCampaign {
  id: string;
  name: string;
  status: string;
  startDate: Date | string | null;
  endDate: Date | string | null;
  strategy: { brandName: string };
}

export function CampaignCalendar({ year: initialYear }: CampaignCalendarProps) {
  const [year, setYear] = useState(initialYear);

  const { data: campaigns, isLoading } =
    api.campaign.campaigns.getCalendar.useQuery({ year });

  const calendarRows = useMemo(() => {
    if (!campaigns) return [];

    return (campaigns as CalendarCampaign[])
      .filter((c) => c.startDate)
      .map((campaign, idx) => {
        const start = new Date(campaign.startDate!);
        const end = campaign.endDate
          ? new Date(campaign.endDate)
          : new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);

        const startMonth = start.getFullYear() < year
          ? 0
          : start.getFullYear() === year
            ? start.getMonth()
            : 12;

        const endMonth = end.getFullYear() > year
          ? 11
          : end.getFullYear() === year
            ? end.getMonth()
            : -1;

        const startDay = start.getFullYear() === year && start.getMonth() === startMonth
          ? start.getDate()
          : 1;

        const endDay = end.getFullYear() === year && end.getMonth() === endMonth
          ? end.getDate()
          : new Date(year, endMonth + 1, 0).getDate();

        return {
          ...campaign,
          startMonth: Math.max(0, startMonth),
          endMonth: Math.min(11, endMonth),
          startDay,
          endDay,
          color: CAMPAIGN_BAR_COLORS[idx % CAMPAIGN_BAR_COLORS.length]!,
        };
      })
      .filter((c) => c.startMonth <= 11 && c.endMonth >= 0);
  }, [campaigns, year]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16">
        <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-primary" />
            Calendrier des campagnes
          </CardTitle>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setYear((y) => y - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="min-w-[4rem] text-center text-sm font-semibold">
              {year}
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7"
              onClick={() => setYear((y) => y + 1)}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        {/* Month headers */}
        <div className="grid grid-cols-12 gap-px mb-1">
          {MONTHS.map((m) => (
            <div
              key={m}
              className="text-center text-[10px] font-medium text-muted-foreground py-1"
            >
              {m}
            </div>
          ))}
        </div>

        {/* Campaign rows */}
        <div className="space-y-1.5">
          {calendarRows.length === 0 && (
            <div className="rounded-lg border border-dashed py-10 text-center text-sm text-muted-foreground">
              Aucune campagne pour {year}
            </div>
          )}

          {calendarRows.map((campaign) => (
            <div key={campaign.id} className="grid grid-cols-12 gap-px">
              {MONTHS.map((_, monthIdx) => {
                const isInRange =
                  monthIdx >= campaign.startMonth &&
                  monthIdx <= campaign.endMonth;

                const isStart = monthIdx === campaign.startMonth;
                const isEnd = monthIdx === campaign.endMonth;

                return (
                  <div
                    key={monthIdx}
                    className="relative h-7 flex items-center"
                  >
                    {isInRange && (
                      <div
                        className={`absolute inset-y-0.5 inset-x-0 flex items-center overflow-hidden ${campaign.color} ${
                          isStart ? "rounded-l-md ml-[2px]" : ""
                        } ${isEnd ? "rounded-r-md mr-[2px]" : ""}`}
                        title={`${campaign.name} — ${campaign.strategy.brandName}`}
                      >
                        {isStart && (
                          <span className="truncate px-1.5 text-[10px] font-medium text-white">
                            {campaign.name}
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        {/* Legend */}
        {calendarRows.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-2">
            {calendarRows.map((c) => (
              <div key={c.id} className="flex items-center gap-1.5">
                <div className={`h-2.5 w-2.5 rounded-sm ${c.color}`} />
                <span className="text-[10px] text-muted-foreground">
                  {c.name}
                </span>
                <Badge
                  variant="secondary"
                  className={`text-[9px] px-1 py-0 ${
                    CAMPAIGN_STATUS_COLORS[c.status as keyof typeof CAMPAIGN_STATUS_COLORS] ?? ""
                  }`}
                >
                  {CAMPAIGN_STATUS_LABELS[c.status as keyof typeof CAMPAIGN_STATUS_LABELS] ?? c.status}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
