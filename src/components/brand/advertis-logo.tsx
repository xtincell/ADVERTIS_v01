// ==========================================================================
// C.B1 — Advertis Logo
// Brand logo component — Blanc + Rouge-Orange identity.
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
        stroke1: "#E8501A", // Rouge-orange — main strokes
        stroke2: "#F43F5E", // Rose — crossbar accent
        flame1: "#E8501A",  // Flame gradient top
        flame2: "#F43F5E",  // Flame gradient bottom
      };
    case "white":
      return {
        stroke1: "rgba(255,255,255,0.95)",
        stroke2: "rgba(255,255,255,0.7)",
        flame1: "rgba(255,255,255,0.65)",
        flame2: "rgba(255,255,255,0.35)",
      };
    case "mono":
      return {
        stroke1: "currentColor",
        stroke2: "currentColor",
        flame1: "currentColor",
        flame2: "currentColor",
      };
  }
}

// ---------------------------------------------------------------------------
// AdvertisMonogram — Stylized "A" brand mark with flame apex
// ---------------------------------------------------------------------------
// Geometry: Two diagonal strokes forming the "A" shape meeting at a peak,
// with a horizontal crossbar at ~40 % height and an organic flame at the
// apex — symbolising energy, ambition and forward momentum.
//
// ViewBox: 0 0 32 32
// The "A" sits centered within the viewBox with slight padding.

export function AdvertisMonogram({
  size = 32,
  variant = "color",
  className,
}: MonogramProps) {
  const { stroke1, stroke2, flame1, flame2 } = getColors(variant);
  // Stable gradient ID — keyed by variant so identical variants safely share
  // the same gradient definition (no hydration mismatch).
  const gradId = `adv-flame-${variant}`;

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
      {/* Gradient definition for the flame */}
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={flame1} />
          <stop offset="100%" stopColor={flame2} />
        </linearGradient>
      </defs>

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
      {/* Crossbar — rose accent */}
      <line
        x1="9"
        y1="19.5"
        x2="23"
        y2="19.5"
        stroke={stroke2}
        strokeWidth="2.4"
        strokeLinecap="round"
      />
      {/* Flame apex — organic teardrop rising from peak */}
      <path
        d="M16 0.5 C13.8 3, 13.5 5.5, 16 7 C18.5 5.5, 18.2 3, 16 0.5Z"
        fill={`url(#${gradId})`}
      />
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
