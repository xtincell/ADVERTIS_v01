// ==========================================================================
// C.B1 — Advertis Logo
// Brand logo component.
// ==========================================================================

import { cn } from "~/lib/utils";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type LogoVariant = "color" | "mono" | "white";

interface MonogramProps {
  size?: number;
  variant?: LogoVariant;
  className?: string;
}

interface WordmarkProps {
  className?: string;
}

interface LogoFullProps {
  monogramSize?: number;
  variant?: LogoVariant;
  className?: string;
}

// ---------------------------------------------------------------------------
// Color helpers
// ---------------------------------------------------------------------------

function getColors(variant: LogoVariant) {
  switch (variant) {
    case "color":
      return {
        stroke1: "#c45a3c", // Terracotta — main strokes
        stroke2: "#2d5a3d", // Forest green — crossbar
        dot: "#c49a3c",     // Gold — apex dot
      };
    case "white":
      return {
        stroke1: "rgba(255,255,255,0.95)",
        stroke2: "rgba(255,255,255,0.7)",
        dot: "rgba(255,255,255,0.5)",
      };
    case "mono":
      return {
        stroke1: "currentColor",
        stroke2: "currentColor",
        dot: "currentColor",
      };
  }
}

// ---------------------------------------------------------------------------
// AdvertisMonogram — Stylized "A" brand mark
// ---------------------------------------------------------------------------
// Geometry: Two diagonal strokes forming the "A" shape meeting at a peak,
// with a horizontal crossbar at ~40% height and a gold dot at the apex.
//
// ViewBox: 0 0 32 32
// The "A" sits centered within the viewBox with slight padding.

export function AdvertisMonogram({
  size = 32,
  variant = "color",
  className,
}: MonogramProps) {
  const { stroke1, stroke2, dot } = getColors(variant);

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 32 32"
      width={size}
      height={size}
      fill="none"
      className={cn("shrink-0", className)}
      aria-hidden="true"
    >
      {/* Left leg of the A */}
      <line
        x1="5"
        y1="28"
        x2="16"
        y2="4"
        stroke={stroke1}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Right leg of the A */}
      <line
        x1="27"
        y1="28"
        x2="16"
        y2="4"
        stroke={stroke1}
        strokeWidth="3.2"
        strokeLinecap="round"
      />
      {/* Crossbar — forest green */}
      <line
        x1="9"
        y1="19.5"
        x2="23"
        y2="19.5"
        stroke={stroke2}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Apex dot — gold accent */}
      <circle cx="16" cy="4" r="2" fill={dot} />
    </svg>
  );
}

// ---------------------------------------------------------------------------
// AdvertisWordmark — "ADVERTIS" text mark
// ---------------------------------------------------------------------------

export function AdvertisWordmark({ className }: WordmarkProps) {
  return (
    <span
      className={cn(
        "font-bold tracking-tight select-none",
        className,
      )}
    >
      ADVERTIS
    </span>
  );
}

// ---------------------------------------------------------------------------
// AdvertisLogoFull — Monogram + Wordmark side by side
// ---------------------------------------------------------------------------

export function AdvertisLogoFull({
  monogramSize = 24,
  variant = "color",
  className,
}: LogoFullProps) {
  return (
    <div className={cn("flex items-center gap-2", className)}>
      <AdvertisMonogram size={monogramSize} variant={variant} />
      <AdvertisWordmark />
    </div>
  );
}
