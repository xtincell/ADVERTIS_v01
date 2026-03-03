// ==========================================================================
// C.OS10 — BrandOS Breadcrumb
// Auto-generates breadcrumb from pathname for Brand OS portal.
// ==========================================================================

"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";

const ROUTE_LABELS: Record<string, string> = {
  "/os":              "Nucleus",
  "/os/pulse":        "Pulse",
  "/os/touchpoints":  "Touchpoints",
  "/os/actions":      "Actions",
  "/os/opportunities":"Opportunités",
  "/os/strategy-lab": "Strategy Lab",
  "/os/glory-feed":   "Glory Feed",
  "/os/risk-radar":   "Risk Radar",
  "/os/bridge":       "Bridge",
};

export function BrandOSBreadcrumb() {
  const pathname = usePathname();

  // Build crumbs: always start with "Brand OS"
  const crumbs: { label: string; href?: string }[] = [
    { label: "Brand OS", href: "/os" },
  ];

  // If we're not on the root /os page, add the current section
  if (pathname !== "/os") {
    const label = ROUTE_LABELS[pathname] ?? pathname.split("/").pop() ?? "";
    crumbs.push({ label });
  }

  // Don't render breadcrumb if only root
  if (crumbs.length <= 1) return null;

  return (
    <nav className="flex items-center gap-1 text-xs text-muted-foreground">
      {crumbs.map((crumb, i) => (
        <span key={i} className="flex items-center gap-1">
          {i > 0 && <ChevronRight className="h-3 w-3" />}
          {crumb.href && i < crumbs.length - 1 ? (
            <Link href={crumb.href} className="hover:text-foreground transition-colors">
              {crumb.label}
            </Link>
          ) : (
            <span className="text-foreground font-medium">{crumb.label}</span>
          )}
        </span>
      ))}
    </nav>
  );
}
