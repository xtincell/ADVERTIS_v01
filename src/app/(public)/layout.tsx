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
      {/* Left panel: brand showcase (hidden on mobile) */}
      {/* ----------------------------------------------------------------- */}
      <div className="relative hidden items-center justify-center overflow-hidden bg-gradient-to-br from-[#1a2e1f] via-[#2d5a3d] to-[#1a2e1f] lg:flex lg:w-1/2">
        {/* Subtle dot grid overlay */}
        <div
          className="absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              "radial-gradient(circle, rgba(255,255,255,0.8) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />

        {/* Brand content */}
        <div className="relative z-10 flex flex-col items-center gap-6 px-12 text-center">
          <AdvertisMonogram size={64} variant="color" />
          <h1 className="text-3xl font-bold tracking-tight text-white">
            ADVERTIS
          </h1>
          <p className="max-w-sm text-lg leading-relaxed text-white/60">
            Fiches de marque intelligentes en 8 piliers, guidées par IA.
          </p>

          {/* Decorative accent line */}
          <div className="mt-4 h-px w-24 bg-gradient-to-r from-transparent via-white/30 to-transparent" />

          <p className="text-sm font-medium text-white/40">
            by UPGRADERS
          </p>
        </div>
      </div>

      {/* ----------------------------------------------------------------- */}
      {/* Right panel: form */}
      {/* ----------------------------------------------------------------- */}
      <div className="flex flex-1 flex-col items-center justify-center bg-background px-4 py-8">
        {/* Mobile-only logo */}
        <div className="mb-8 flex items-center gap-2.5 lg:hidden">
          <AdvertisMonogram size={32} variant="color" />
          <AdvertisWordmark className="text-xl text-foreground" />
        </div>

        <div className="w-full max-w-md">{children}</div>

        {/* Footer note */}
        <p className="mt-12 text-xs text-muted-foreground/60">
          &copy; {new Date().getFullYear()} ADVERTIS. Tous droits réservés.
        </p>
      </div>
    </div>
  );
}
