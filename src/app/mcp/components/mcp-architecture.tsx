"use client";

import { useRef } from "react";
import { motion, useInView } from "framer-motion";
import {
  Database,
  Globe,
  Monitor,
  Brain,
  Rocket,
  Sparkles,
  Activity,
  Bot,
  LayoutDashboard,
  Workflow,
} from "lucide-react";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.5, ease: SPRING } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Architecture Node
// ═══════════════════════════════════════════════════════════════════════════

function ArchNode({
  icon: Icon,
  label,
  sublabel,
  color,
  className,
}: {
  icon: React.ComponentType<{ className?: string; color?: string }>;
  label: string;
  sublabel?: string;
  color: string;
  className?: string;
}) {
  return (
    <motion.div
      variants={scaleIn}
      className={`flex flex-col items-center gap-1.5 ${className ?? ""}`}
    >
      <div
        className="flex size-12 items-center justify-center rounded-xl border border-border bg-card shadow-sm sm:size-14"
        style={{ borderColor: `${color} / 30%` }}
      >
        <Icon className="size-5 sm:size-6" color={color} />
      </div>
      <span className="text-xs font-medium sm:text-sm">{label}</span>
      {sublabel && (
        <span className="text-[10px] text-muted-foreground sm:text-xs">{sublabel}</span>
      )}
    </motion.div>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function McpArchitecture() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center"
        >
          <h2
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Comment ca <span className="text-gradient">marche</span>
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Une seule base de donnees. Plusieurs interfaces. Les serveurs MCP
            sont une couche d&apos;acces parallele a l&apos;app web.
          </p>
        </motion.div>

        {/* Architecture diagram */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-12 flex flex-col items-center gap-4"
        >
          {/* Layer 1: Database */}
          <ArchNode
            icon={Database}
            label="PostgreSQL"
            sublabel="Base existante"
            color="oklch(0.60 0.17 240)"
          />

          {/* Connector */}
          <motion.div
            variants={fadeInUp}
            className="h-8 w-px bg-gradient-to-b from-[oklch(0.60_0.17_240/40%)] to-border"
          />

          <motion.div
            variants={fadeInUp}
            className="rounded-full bg-muted px-4 py-1 text-xs font-medium text-muted-foreground"
          >
            Prisma ORM
          </motion.div>

          {/* Connector branching */}
          <motion.div variants={fadeInUp} className="h-6 w-px bg-border" />

          {/* Layer 2: Servers */}
          <motion.div
            variants={stagger}
            className="grid w-full max-w-2xl grid-cols-2 gap-3 sm:grid-cols-5 sm:gap-4"
          >
            <ArchNode
              icon={Globe}
              label="App Web"
              sublabel="Next.js"
              color="oklch(0.63 0.22 34)"
            />
            <ArchNode
              icon={Brain}
              label="Intelligence"
              color="oklch(0.63 0.22 34)"
            />
            <ArchNode
              icon={Rocket}
              label="Operations"
              color="oklch(0.62 0.25 12)"
            />
            <ArchNode
              icon={Sparkles}
              label="Creative"
              color="oklch(0.76 0.19 75)"
            />
            <ArchNode
              icon={Activity}
              label="Pulse"
              color="oklch(0.65 0.19 155)"
              className="col-span-2 sm:col-span-1"
            />
          </motion.div>

          {/* Connector */}
          <motion.div variants={fadeInUp} className="h-6 w-px bg-border" />

          <motion.div
            variants={fadeInUp}
            className="rounded-full bg-muted px-4 py-1 text-xs font-medium text-muted-foreground"
          >
            stdio + HTTP (Streamable)
          </motion.div>

          <motion.div variants={fadeInUp} className="h-6 w-px bg-border" />

          {/* Layer 3: Consumers */}
          <motion.div
            variants={stagger}
            className="grid w-full max-w-md grid-cols-3 gap-4"
          >
            <ArchNode
              icon={Bot}
              label="Claude"
              sublabel="Desktop & Code"
              color="oklch(0.63 0.22 34)"
            />
            <ArchNode
              icon={LayoutDashboard}
              label="Apps tierces"
              sublabel="Dashboards, BI"
              color="oklch(0.62 0.25 12)"
            />
            <ArchNode
              icon={Workflow}
              label="Automations"
              sublabel="n8n, Make, Zapier"
              color="oklch(0.76 0.19 75)"
            />
          </motion.div>
        </motion.div>

        {/* Config code block */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mx-auto mt-12 max-w-xl"
        >
          <div className="overflow-hidden rounded-xl border border-border bg-[oklch(0.09_0.005_260)]">
            <div className="flex items-center gap-2 border-b border-white/[0.06] px-4 py-2.5">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-white/30">
                claude_desktop_config.json
              </span>
            </div>
            <pre className="p-4 font-mono text-[13px] leading-6">
              <span className="text-white/30">{"{"}</span>
              {"\n"}
              <span className="text-white/30">{"  "}</span>
              <span className="text-[oklch(0.62_0.25_12)]">
                &quot;mcpServers&quot;
              </span>
              <span className="text-white/30">{": {"}</span>
              {"\n"}
              <span className="text-white/30">{"    "}</span>
              <span className="text-[oklch(0.76_0.19_75)]">
                &quot;advertis-intelligence&quot;
              </span>
              <span className="text-white/30">{": {"}</span>
              {"\n"}
              <span className="text-white/30">{"      "}</span>
              <span className="text-[oklch(0.62_0.25_12)]">&quot;url&quot;</span>
              <span className="text-white/30">{": "}</span>
              <span className="text-[oklch(0.65_0.19_155)]">
                &quot;https://mcp.advertis.io/intelligence&quot;
              </span>
              {"\n"}
              <span className="text-white/30">{"    }"}</span>
              {"\n"}
              <span className="text-white/30">{"  }"}</span>
              {"\n"}
              <span className="text-white/30">{"}"}</span>
            </pre>
          </div>
          <p className="mt-3 text-center text-xs text-muted-foreground">
            3 lignes de config. C&apos;est tout.
          </p>
        </motion.div>
      </div>
    </section>
  );
}
