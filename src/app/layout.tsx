import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXTAUTH_URL ?? "http://localhost:3000"),
  title: {
    default: "ADVERTIS - Fiches de Marque Intelligentes",
    template: "%s | ADVERTIS",
  },
  description:
    "Plateforme SaaS de création de fiches de marque en 8 piliers, guidée par IA.",
  manifest: "/manifest.json",
  openGraph: {
    type: "website",
    locale: "fr_FR",
    siteName: "ADVERTIS",
    title: "ADVERTIS - Fiches de Marque Intelligentes",
    description:
      "Créez des stratégies de marque structurées en 8 piliers avec l'IA.",
  },
  twitter: {
    card: "summary",
    title: "ADVERTIS",
    description: "Plateforme SaaS de fiches de marque intelligentes.",
  },
};

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${inter.variable}`}>
      <head>
        <meta name="theme-color" content="#c45a3c" />
      </head>
      <body className="font-sans antialiased">
        <TRPCReactProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </TRPCReactProvider>
        <Script src="/register-sw.js" strategy="lazyOnload" />
      </body>
    </html>
  );
}
