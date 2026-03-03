// ==========================================================================
// C.OS4 — Channel Matrix
// Grid view of all connected touchpoints with health status and KPIs.
// ==========================================================================

"use client";

import { PLATFORM_CONFIG, CHANNEL_HEALTH_CONFIG, type SocialPlatform, type ChannelHealthStatus } from "~/lib/types/brand-os";

interface ChannelData {
  id: string;
  platform: string;
  accountName: string | null;
  isConnected: boolean;
  category: string;
  followers: number;
  engagementRate: number;
  avgReach: number;
  postFrequency: number;
  healthStatus: string;
  lastActivityAt: Date | string | null;
}

interface ChannelMatrixProps {
  channels: ChannelData[];
}

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toLocaleString("fr-FR");
}

function timeAgo(date: Date | string | null): string {
  if (!date) return "—";
  const d = typeof date === "string" ? new Date(date) : date;
  const diff = Date.now() - d.getTime();
  const hours = Math.floor(diff / 3600000);
  if (hours < 1) return "< 1h";
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}j`;
  return `${Math.floor(days / 7)}sem`;
}

export function ChannelMatrix({ channels }: ChannelMatrixProps) {
  const connected = channels.filter((c) => c.isConnected);
  const dormant = channels.filter((c) => !c.isConnected);

  return (
    <div className="space-y-4">
      {/* Connected channels grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
        {connected.map((channel) => {
          const platform = PLATFORM_CONFIG[channel.platform as SocialPlatform];
          const health = CHANNEL_HEALTH_CONFIG[channel.healthStatus as ChannelHealthStatus] ??
            CHANNEL_HEALTH_CONFIG.UNKNOWN;

          return (
            <div
              key={channel.id}
              className="rounded-xl border border-border/50 bg-card/50 p-4 space-y-3"
            >
              {/* Header */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold"
                    style={{ backgroundColor: platform?.color ?? "#666" }}
                  >
                    {(channel.platform ?? "?").slice(0, 2)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold">{platform?.label ?? channel.platform}</p>
                    {channel.accountName && (
                      <p className="text-xs text-muted-foreground">{channel.accountName}</p>
                    )}
                  </div>
                </div>
                <span
                  className="text-[10px] font-medium px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: `${health.color}20`, color: health.color }}
                >
                  {health.label}
                </span>
              </div>

              {/* KPIs */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Abonnés</p>
                  <p className="text-sm font-bold tabular-nums">{formatNumber(channel.followers)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Engagement</p>
                  <p className="text-sm font-bold tabular-nums">{channel.engagementRate.toFixed(2)}%</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Portée moy.</p>
                  <p className="text-sm font-bold tabular-nums">{formatNumber(channel.avgReach)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase">Dernière act.</p>
                  <p className="text-sm font-bold tabular-nums">{timeAgo(channel.lastActivityAt)}</p>
                </div>
              </div>

              {/* Post frequency bar */}
              <div>
                <div className="flex justify-between text-[10px] text-muted-foreground mb-1">
                  <span>Fréquence</span>
                  <span>{channel.postFrequency.toFixed(1)} posts/sem</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted-foreground/10">
                  <div
                    className="h-1.5 rounded-full transition-all"
                    style={{
                      width: `${Math.min(100, channel.postFrequency * 14)}%`,
                      backgroundColor: platform?.color ?? "#666",
                    }}
                  />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Dormant channels */}
      {dormant.length > 0 && (
        <div className="border border-dashed border-border/50 rounded-xl p-4">
          <p className="text-xs text-muted-foreground mb-2 uppercase font-medium">
            Canaux non connectés
          </p>
          <div className="flex flex-wrap gap-2">
            {dormant.map((c) => (
              <span
                key={c.id}
                className="text-xs px-2.5 py-1 rounded-lg bg-muted-foreground/5 text-muted-foreground border border-border/30"
              >
                {PLATFORM_CONFIG[c.platform as SocialPlatform]?.label ?? c.platform}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
