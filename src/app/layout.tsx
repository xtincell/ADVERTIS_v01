import "~/styles/globals.css";

import { type Metadata } from "next";
import { Inter } from "next/font/google";

import { TRPCReactProvider } from "~/trpc/react";
import { Toaster } from "~/components/ui/sonner";
import { TooltipProvider } from "~/components/ui/tooltip";

export const metadata: Metadata = {
  title: "ADVERTIS - Stratégies de Marque Intelligentes",
  description:
    "Plateforme SaaS de création de stratégies de marque en 8 piliers, guidée par IA.",
  icons: [{ rel: "icon", url: "/favicon.ico" }],
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
      <body className="font-sans antialiased">
        <TRPCReactProvider>
          <TooltipProvider>
            {children}
            <Toaster richColors position="bottom-right" />
          </TooltipProvider>
        </TRPCReactProvider>
      </body>
    </html>
  );
}
