"use client";

// =============================================================================
// COMP C.GLORY — GlorySidebar
// =============================================================================
// Sidebar navigation for the GLORY operational tools platform.
// Displays 3 collapsible layer sections (CR, DC, HYBRID) with tool links.
// Active tool is highlighted with violet accent.
// =============================================================================

import { useState } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  ChevronDown,
  ChevronRight,
  Sparkles,
  History,
  Home,
  LayoutDashboard,
  type LucideIcon,
} from "lucide-react";
import * as LucideIcons from "lucide-react";
import { cn } from "~/lib/utils";
import {
  GLORY_LAYER_META,
  type GloryLayer,
  type GloryToolDescriptor,
} from "~/lib/types/glory-tools";
import { ScrollArea } from "~/components/ui/scroll-area";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "~/components/ui/collapsible";
import { PortalSwitcherCompact } from "~/components/shells/portal-switcher";

// ---------------------------------------------------------------------------
// Dynamic icon resolver — maps a string name to a lucide-react component
// ---------------------------------------------------------------------------
function getIconComponent(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? icons[`${iconName}Icon`] ?? LucideIcons.Puzzle;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GlorySidebarProps {
  tools: GloryToolDescriptor[];
  strategyId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GlorySidebar({ tools, strategyId }: GlorySidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // All three layers, in display order
  const layers: GloryLayer[] = ["CR", "DC", "HYBRID"];

  // Track which sections are open (all open by default)
  const [openSections, setOpenSections] = useState<Record<GloryLayer, boolean>>({
    CR: true,
    DC: true,
    HYBRID: true,
  });

  const toggleSection = (layer: GloryLayer) => {
    setOpenSections((prev) => ({ ...prev, [layer]: !prev[layer] }));
  };

  // Build the strategyId query string
  const strategyQuery = strategyId ? `?strategyId=${strategyId}` : "";

  // Extract current tool slug from pathname (e.g. /glory/brand-manifesto → brand-manifesto)
  const pathParts = pathname.split("/");
  const currentSlug = pathParts.length >= 3 && pathParts[1] === "glory" ? pathParts[2] : null;

  return (
    <aside className="hidden md:flex flex-col w-[240px] min-w-[240px] bg-[#1a1a2e] text-white h-screen sticky top-0">
      {/* ----------------------------------------------------------------- */}
      {/* Logo / Title */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex items-center gap-2 px-5 pt-5 pb-2">
        <Sparkles className="h-6 w-6 text-[#6C5CE7]" />
        <span className="text-xl font-bold tracking-tight">GLORY</span>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Portal switcher (multi-portal users) or back link (single portal) */}
      {/* ----------------------------------------------------------------- */}
      <PortalSwitcherCompact />

      {/* ----------------------------------------------------------------- */}
      {/* Quick nav links */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-col gap-0.5 px-3 mt-3 mb-2">
        <Link
          href={`/glory${strategyQuery}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === "/glory"
              ? "bg-[#6C5CE7]/20 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <Home className="h-4 w-4" />
          <span>Hub</span>
        </Link>
        <Link
          href={`/glory/dashboard${strategyQuery}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === "/glory/dashboard"
              ? "bg-[#6C5CE7]/20 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
        <Link
          href={`/glory/history${strategyQuery}`}
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-md text-sm transition-colors",
            pathname === "/glory/history"
              ? "bg-[#6C5CE7]/20 text-white"
              : "text-white/70 hover:bg-white/5 hover:text-white",
          )}
        >
          <History className="h-4 w-4" />
          <span>Historique</span>
        </Link>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Separator */}
      {/* ----------------------------------------------------------------- */}
      <div className="mx-4 my-2 h-px bg-white/10" />

      {/* ----------------------------------------------------------------- */}
      {/* Layer sections (scrollable) */}
      {/* ----------------------------------------------------------------- */}
      <ScrollArea className="flex-1 px-3">
        <div className="flex flex-col gap-1 pb-4">
          {layers.map((layer) => {
            const meta = GLORY_LAYER_META[layer];
            const layerTools = tools.filter((t) => t.layer === layer);

            if (layerTools.length === 0) return null;

            return (
              <Collapsible
                key={layer}
                open={openSections[layer]}
                onOpenChange={() => toggleSection(layer)}
              >
                <CollapsibleTrigger className="flex items-center gap-2 w-full px-3 py-2 rounded-md text-sm font-medium text-white/80 hover:bg-white/5 transition-colors cursor-pointer">
                  {openSections[layer] ? (
                    <ChevronDown className="h-3.5 w-3.5 text-white/50" />
                  ) : (
                    <ChevronRight className="h-3.5 w-3.5 text-white/50" />
                  )}
                  <span
                    className="h-2.5 w-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: meta.color }}
                  />
                  <span className="truncate">{meta.label}</span>
                  <span className="ml-auto text-xs text-white/40">
                    {layerTools.length}
                  </span>
                </CollapsibleTrigger>

                <CollapsibleContent>
                  <div className="flex flex-col gap-0.5 ml-3 pl-3 border-l border-white/10">
                    {layerTools.map((tool) => {
                      const IconComp = getIconComponent(tool.icon);
                      const isActive = currentSlug === tool.slug;

                      return (
                        <Link
                          key={tool.slug}
                          href={`/glory/${tool.slug}${strategyQuery}`}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs transition-colors",
                            isActive
                              ? "bg-[#6C5CE7] text-white font-medium"
                              : "text-white/60 hover:bg-white/5 hover:text-white",
                          )}
                        >
                          <IconComp className="h-3.5 w-3.5 shrink-0" />
                          <span className="truncate">{tool.shortName}</span>
                        </Link>
                      );
                    })}
                  </div>
                </CollapsibleContent>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>

      {/* ----------------------------------------------------------------- */}
      {/* Footer */}
      {/* ----------------------------------------------------------------- */}
      <div className="px-4 py-3 border-t border-white/10">
        <p className="text-[10px] text-white/30 text-center">
          GLORY v1.0 — ADVERTIS
        </p>
      </div>
    </aside>
  );
}
