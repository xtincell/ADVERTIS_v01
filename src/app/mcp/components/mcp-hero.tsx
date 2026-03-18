"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ChevronDown, Terminal } from "lucide-react";
import {
  AdvertisMonogram,
  AdvertisWordmark,
} from "~/components/brand/advertis-logo";
import { Button } from "~/components/ui/button";
import { Badge } from "~/components/ui/badge";
import { TOTAL_STATS } from "../data/servers";

// ═══════════════════════════════════════════════════════════════════════════
// Animation variants
// ═══════════════════════════════════════════════════════════════════════════

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

// Rotating words for the headline
const ROTATING_WORDS = ["partout", "programmable", "connectee", "libere"];

// ═══════════════════════════════════════════════════════════════════════════
// Navbar
// ═══════════════════════════════════════════════════════════════════════════

function McpNavbar() {
  return (
    <nav className="sticky top-0 z-50 border-b border-white/[0.06] bg-[oklch(0.09_0.005_260/80%)] backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2.5">
            <AdvertisMonogram size={28} variant="white" />
            <AdvertisWordmark className="text-lg text-white/90" />
          </Link>
          <span className="hidden rounded-md bg-white/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-white/60 sm:inline">
            MCP
          </span>
        </div>
        <div className="flex items-center gap-2 sm:gap-4">
          <Link
            href="#serveurs"
            className="hidden text-sm text-white/50 transition hover:text-white/80 sm:inline"
          >
            Produit
          </Link>
          <Link
            href="#demo"
            className="hidden text-sm text-white/50 transition hover:text-white/80 sm:inline"
          >
            Demo
          </Link>
          <Link
            href="#pricing"
            className="hidden text-sm text-white/50 transition hover:text-white/80 sm:inline"
          >
            Pricing
          </Link>
          <Link href="#waitlist">
            <Button variant="gradient" size="sm">
              Early Access
              <ArrowRight className="ml-1 size-3.5" />
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Terminal Preview
// ═══════════════════════════════════════════════════════════════════════════

function TerminalPreview() {
  const [currentLine, setCurrentLine] = useState(0);
  const lines = [
    { text: "$ npx @advertis/mcp-intelligence", color: "text-white/90" },
    { text: "", color: "" },
    { text: "  ADVERTIS MCP v1.0 — Intelligence Server", color: "text-primary" },
    { text: `  ✓ Connected to PostgreSQL`, color: "text-[oklch(0.65_0.19_155)]" },
    { text: `  ✓ ${TOTAL_STATS.tools} tools registered`, color: "text-[oklch(0.65_0.19_155)]" },
    { text: `  ✓ ${TOTAL_STATS.resources} resources available`, color: "text-[oklch(0.65_0.19_155)]" },
    { text: "", color: "" },
    { text: "  Ready. Listening on stdio + http://localhost:3001/mcp", color: "text-white/50" },
  ];

  useEffect(() => {
    if (currentLine >= lines.length) return;
    const timer = setTimeout(
      () => setCurrentLine((prev) => prev + 1),
      currentLine === 0 ? 800 : 200,
    );
    return () => clearTimeout(timer);
  }, [currentLine, lines.length]);

  return (
    <div className="mx-auto max-w-xl overflow-hidden rounded-xl border border-white/[0.08] bg-[oklch(0.06_0.005_260)]">
      {/* Title bar */}
      <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
        <div className="flex gap-1.5">
          <div className="size-2.5 rounded-full bg-white/10" />
          <div className="size-2.5 rounded-full bg-white/10" />
          <div className="size-2.5 rounded-full bg-white/10" />
        </div>
        <div className="flex items-center gap-1.5 text-xs text-white/30">
          <Terminal className="size-3" />
          terminal
        </div>
      </div>
      {/* Lines */}
      <div className="p-4 font-mono text-[13px] leading-6">
        {lines.slice(0, currentLine).map((line, i) => (
          <div key={i} className={line.color}>
            {line.text || "\u00A0"}
          </div>
        ))}
        {currentLine < lines.length && (
          <span className="inline-block h-4 w-2 animate-pulse bg-white/60" />
        )}
      </div>
    </div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Hero
// ═══════════════════════════════════════════════════════════════════════════

export function McpHero() {
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <section className="relative overflow-hidden">
      {/* Dark background with subtle mesh */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.09 0.005 260) 0%, oklch(0.07 0.01 34) 50%, oklch(0.09 0.005 260) 100%)",
        }}
      />
      {/* Glow orbs */}
      <div
        className="absolute -left-32 top-1/4 h-[500px] w-[500px] rounded-full opacity-20 blur-[120px]"
        style={{ background: "radial-gradient(circle, oklch(0.63 0.22 34 / 50%) 0%, transparent 70%)" }}
      />
      <div
        className="absolute -right-32 bottom-1/4 h-[400px] w-[400px] rounded-full opacity-15 blur-[100px]"
        style={{ background: "radial-gradient(circle, oklch(0.62 0.25 12 / 40%) 0%, transparent 70%)" }}
      />

      {/* Navbar */}
      <McpNavbar />

      {/* Content */}
      <div className="relative mx-auto max-w-5xl px-4 pb-16 pt-16 sm:px-6 sm:pb-24 sm:pt-24">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate="visible"
          className="flex flex-col items-center text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <Badge variant="rose" className="mb-6">
              Nouveau produit
            </Badge>
          </motion.div>

          {/* Headline */}
          <motion.h1
            variants={fadeInUp}
            className="text-3xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            L&apos;intelligence de ta marque,
            <br />
            <span className="relative inline-block">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.35, ease: SPRING }}
                  className="text-gradient inline-block"
                >
                  {ROTATING_WORDS[wordIndex]}
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-6 max-w-2xl text-base leading-relaxed text-white/50 sm:text-lg"
          >
            120+ variables de marque. 4 scores. 24 frameworks. 40+ outils creatifs.
            <br className="hidden sm:block" />
            Accessibles depuis n&apos;importe quelle application via le protocole MCP.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-8 flex flex-col gap-3 sm:flex-row sm:gap-4"
          >
            <Link href="#waitlist">
              <Button variant="gradient" size="lg">
                Rejoindre l&apos;early access
                <ArrowRight className="ml-2 size-4" />
              </Button>
            </Link>
            <Link href="#demo">
              <Button
                variant="outline"
                size="lg"
                className="border-white/10 bg-white/5 text-white hover:bg-white/10 hover:text-white"
              >
                Voir la demo
                <ChevronDown className="ml-2 size-4" />
              </Button>
            </Link>
          </motion.div>

          {/* Terminal preview */}
          <motion.div variants={fadeInUp} className="mt-12 w-full">
            <TerminalPreview />
          </motion.div>

          {/* Stats strip */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 flex flex-wrap justify-center gap-8 text-center sm:gap-12"
          >
            {[
              { value: TOTAL_STATS.servers, label: "serveurs" },
              { value: `${TOTAL_STATS.tools}+`, label: "outils" },
              { value: `${TOTAL_STATS.resources}+`, label: "resources" },
            ].map((stat) => (
              <div key={stat.label}>
                <div className="text-2xl font-bold text-white sm:text-3xl">
                  {stat.value}
                </div>
                <div className="mt-1 text-sm text-white/40">{stat.label}</div>
              </div>
            ))}
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
