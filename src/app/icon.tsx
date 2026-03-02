// ADVERTIS Dynamic Favicon — 32x32 PNG
// Next.js App Router convention: src/app/icon.tsx auto-generates /favicon

import { ImageResponse } from "next/og";

export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "32px",
          height: "32px",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          borderRadius: "6px",
          background: "linear-gradient(135deg, #059669 0%, #10B981 100%)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 32 32"
          width="24"
          height="24"
          fill="none"
        >
          {/* Left leg */}
          <line
            x1="5"
            y1="28"
            x2="16"
            y2="4"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Right leg */}
          <line
            x1="27"
            y1="28"
            x2="16"
            y2="4"
            stroke="rgba(255,255,255,0.95)"
            strokeWidth="3.5"
            strokeLinecap="round"
          />
          {/* Crossbar */}
          <line
            x1="9"
            y1="19.5"
            x2="23"
            y2="19.5"
            stroke="rgba(255,255,255,0.7)"
            strokeWidth="2.5"
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
