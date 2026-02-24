"use client";

// =============================================================================
// COMP C.GLORY — GloryHub
// =============================================================================
// Hub dashboard showing all GLORY tools organized by layer (CR, DC, HYBRID).
// Each tool is displayed as a card with icon, name, description.
// Cards link to /glory/[slug]?strategyId=xxx.
// =============================================================================

import Link from "next/link";
import * as LucideIcons from "lucide-react";
import { type LucideIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import {
  GLORY_LAYER_META,
  type GloryLayer,
  type GloryToolDescriptor,
} from "~/lib/types/glory-tools";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Sparkles } from "lucide-react";

// ---------------------------------------------------------------------------
// Icon resolver
// ---------------------------------------------------------------------------
function getIconComponent(iconName: string): LucideIcon {
  const icons = LucideIcons as unknown as Record<string, LucideIcon | undefined>;
  return icons[iconName] ?? icons[`${iconName}Icon`] ?? LucideIcons.Puzzle;
}

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------
interface GloryHubProps {
  tools: GloryToolDescriptor[];
  strategyId?: string;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------
export function GloryHub({ tools, strategyId }: GloryHubProps) {
  const layers: GloryLayer[] = ["CR", "DC", "HYBRID"];
  const strategyQuery = strategyId ? `?strategyId=${strategyId}` : "";

  return (
    <div className="space-y-10">
      {/* Page header */}
      <div className="space-y-2">
        <div className="flex items-center gap-3">
          <Sparkles className="h-7 w-7 text-[#6C5CE7]" />
          <h1 className="text-2xl font-bold text-gray-900">GLORY Hub</h1>
        </div>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Plateforme d&apos;outils opérationnels pour la création publicitaire.
          Sélectionnez un outil ci-dessous pour commencer.
        </p>
      </div>

      {/* Layer sections */}
      {layers.map((layer) => {
        const meta = GLORY_LAYER_META[layer];
        const layerTools = tools.filter((t) => t.layer === layer);

        if (layerTools.length === 0) return null;

        return (
          <section key={layer} className="space-y-4">
            {/* Section header */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="h-3 w-3 rounded-full shrink-0"
                  style={{ backgroundColor: meta.color }}
                />
                <h2 className="text-lg font-semibold text-gray-900">
                  {meta.label}
                </h2>
                <Badge
                  variant="secondary"
                  className="text-[10px] ml-1"
                >
                  {layerTools.length} outils
                </Badge>
              </div>
              <p className="text-sm text-muted-foreground pl-5">
                {meta.description}
              </p>
            </div>

            {/* Tool cards grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {layerTools.map((tool) => {
                const IconComp = getIconComponent(tool.icon);
                return (
                  <Link
                    key={tool.slug}
                    href={`/glory/${tool.slug}${strategyQuery}`}
                    className="block group"
                  >
                    <Card
                      className={cn(
                        "h-full transition-all duration-200",
                        "border-gray-200 hover:border-[#6C5CE7]/40",
                        "hover:shadow-md hover:shadow-[#6C5CE7]/5",
                        "cursor-pointer",
                      )}
                    >
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <div
                            className="flex items-center justify-center h-9 w-9 rounded-lg transition-colors"
                            style={{
                              backgroundColor: `${meta.color}15`,
                            }}
                          >
                            <IconComp
                              className="h-4.5 w-4.5"
                              style={{ color: meta.color }}
                            />
                          </div>
                          {tool.persistable && (
                            <Badge
                              variant="outline"
                              className="text-[9px] border-green-300 text-green-700"
                            >
                              Persistable
                            </Badge>
                          )}
                        </div>
                        <CardTitle className="text-sm font-semibold mt-2 group-hover:text-[#6C5CE7] transition-colors">
                          {tool.name}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <CardDescription className="text-xs line-clamp-2">
                          {tool.description}
                        </CardDescription>
                        {tool.tags && tool.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2">
                            {tool.tags.slice(0, 3).map((tag) => (
                              <Badge
                                key={tag}
                                variant="secondary"
                                className="text-[9px] px-1.5 py-0"
                              >
                                {tag}
                              </Badge>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  </Link>
                );
              })}
            </div>
          </section>
        );
      })}

      {/* Empty state */}
      {tools.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Sparkles className="h-12 w-12 text-[#6C5CE7]/30 mb-4" />
          <h2 className="text-lg font-semibold text-gray-600">
            Aucun outil disponible
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Les outils GLORY seront bient&ocirc;t disponibles.
          </p>
        </div>
      )}
    </div>
  );
}
