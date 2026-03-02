// ADVERTIS Apple Touch Icon — 180x180 PNG
// Next.js App Router convention: src/app/apple-icon.tsx

import { ImageResponse } from "next/og";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "180px",
          height: "180px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "36px",
          background: "linear-gradient(135deg, #059669 0%, #10B981 60%, #34D399 100%)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="110"
          height="110"
          fill="none"
        >
          {/* Left leg */}
          <line
            x1="5"
            y1="28"
            x2="16"
            y2="4"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Right leg */}
          <line
            x1="27"
            y1="28"
            x2="16"
            y2="4"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="3.2"
            strokeLinecap="round"
          />
          {/* Crossbar */}
          <line
            x1="9"
            y1="19.5"
            x2="23"
            y2="19.5"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Apex dot — Rose accent */}
          <circle cx="16" cy="4" r="2" fill="#F43F5E" />
        </svg>
      </div>
    ),
    { ...size },
  );
}
