import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";

export default function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      {/* ----------------------------------------------------------------- */}
      {/* Left panel: brand showcase (hidden on mobile)                     */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="relative hidden items-center justify-center overflow-hidden lg:flex lg:w-1/2"
        style={{
          background:
            "linear-gradient(145deg, oklch(0.14 0.04 34) 0%, oklch(0.18 0.06 34) 35%, oklch(0.13 0.03 25) 65%, oklch(0.10 0.02 34) 100%)",
        }}
      >
        {/* ── Animated glow orbs ── */}
        <div
          className="absolute -left-24 -top-24 h-[500px] w-[500px] rounded-full opacity-30 blur-[120px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.63 0.22 34 / 60%) 0%, transparent 70%)",
            animation: "float 8s ease-in-out infinite",
          }}
        />
        <div
          className="absolute -bottom-32 -right-32 h-[400px] w-[400px] rounded-full opacity-20 blur-[100px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.62 0.25 12 / 50%) 0%, transparent 70%)",
            animation: "float 10s ease-in-out infinite reverse",
          }}
        />
        <div
          className="absolute left-1/2 top-1/3 h-[300px] w-[300px] -translate-x-1/2 rounded-full opacity-15 blur-[80px]"
          style={{
            background:
              "radial-gradient(circle, oklch(0.76 0.19 75 / 40%) 0%, transparent 70%)",
            animation: "float 12s ease-in-out infinite 2s",
          }}
        />

        {/* ── Floating geometric shapes ── */}
        <div
          className="absolute left-[12%] top-[18%] h-20 w-20 rotate-12 rounded-2xl border border-white/[0.06] opacity-60"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.63 0.22 34 / 8%) 0%, transparent 100%)",
            animation: "float 7s ease-in-out infinite 1s",
          }}
        />
        <div
          className="absolute bottom-[22%] right-[14%] h-14 w-14 -rotate-6 rounded-xl border border-white/[0.05] opacity-50"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.62 0.25 12 / 10%) 0%, transparent 100%)",
            animation: "float 9s ease-in-out infinite 3s",
          }}
        />
        <div
          className="absolute bottom-[45%] left-[8%] h-10 w-10 rotate-45 rounded-lg border border-white/[0.04] opacity-40"
          style={{
            background:
              "linear-gradient(135deg, oklch(0.76 0.19 75 / 8%) 0%, transparent 100%)",
            animation: "float 11s ease-in-out infinite 5s",
          }}
        />
        <div
          className="absolute right-[10%] top-[35%] h-6 w-6 rounded-full border border-white/[0.06] opacity-50"
          style={{
            background: "oklch(0.63 0.22 34 / 12%)",
            animation: "float 6s ease-in-out infinite 2s",
          }}
        />
        <div
          className="absolute bottom-[15%] left-[30%] h-4 w-4 rounded-full opacity-30"
          style={{
            background: "oklch(0.62 0.25 12 / 20%)",
            animation: "float 8s ease-in-out infinite 4s",
          }}
        />

        {/* ── Subtle noise/grain texture ── */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='1'/%3E%3C/svg%3E")`,
            backgroundSize: "128px 128px",
          }}
        />

        {/* ── Brand content ── */}
        <div className="relative z-10 flex flex-col items-center gap-8 px-12 text-center">
          {/* Monogram with glow ring */}
          <div className="relative">
            <div
              className="absolute -inset-4 rounded-full opacity-40 blur-xl"
              style={{
                background:
                  "radial-gradient(circle, oklch(0.63 0.22 34 / 30%) 0%, transparent 70%)",
              }}
            />
            <AdvertisMonogram size={72} variant="white" />
          </div>

          {/* Heading in display font */}
          <h1
            className="text-4xl font-extrabold tracking-tight font-[var(--font-display)]"
            style={{
              background:
                "linear-gradient(135deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 50%, oklch(0.78 0.15 34) 100%)",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              backgroundClip: "text",
            }}
          >
            ADVERTIS
          </h1>

          <p className="max-w-sm text-[1.05rem] leading-relaxed text-white/50">
            Fiches de marque intelligentes en 8&nbsp;piliers, guid&eacute;es
            par&nbsp;IA.
          </p>

          {/* Decorative gradient accent */}
          <div className="flex items-center gap-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-white/20" />
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "oklch(0.63 0.22 34 / 50%)" }}
            />
            <div
              className="h-px w-16"
              style={{
                background:
                  "linear-gradient(90deg, oklch(0.63 0.22 34 / 30%), oklch(0.62 0.25 12 / 30%))",
              }}
            />
            <div
              className="h-1.5 w-1.5 rounded-full"
              style={{ background: "oklch(0.62 0.25 12 / 50%)" }}
            />
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-white/20" />
          </div>

          <p className="text-sm font-medium tracking-wide text-white/30">
            by UPGRADERS
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Gradient divider (vertical line between panels)                   */}
      {/* ----------------------------------------------------------------- */}
      <div className="hidden lg:block">
        <div
          className="h-full w-px"
          style={{
            background:
              "linear-gradient(180deg, transparent 0%, oklch(0.63 0.22 34 / 20%) 25%, oklch(0.62 0.25 12 / 15%) 50%, oklch(0.63 0.22 34 / 20%) 75%, transparent 100%)",
          }}
        />
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Right panel: form                                                 */}
      {/* ----------------------------------------------------------------- */}
      <div
        className="bg-mesh relative flex flex-1 flex-col items-center justify-center px-4 py-8"
        style={{
          background:
            "linear-gradient(160deg, var(--background) 0%, oklch(0.98 0.005 75 / 40%) 50%, var(--background) 100%)",
        }}
      >
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <AdvertisMonogram size={32} variant="color" />
          <AdvertisWordmark className="text-xl text-foreground" />
        </div>

        <div className="w-full max-w-md">{children}</div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} ADVERTIS. Tous droits
          r&eacute;serv&eacute;s.
        </p>
      </div>
    </div>
  );
}
