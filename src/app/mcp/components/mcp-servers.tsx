"use client";

import { useState, useRef } from "react";
import { motion, useInView, AnimatePresence } from "framer-motion";
import { MCP_SERVERS } from "../data/servers";
import { Badge } from "~/components/ui/badge";
import { cn } from "~/lib/utils";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Code preview snippets per server
// ═══════════════════════════════════════════════════════════════════════════

const CODE_SNIPPETS: Record<string, { comment: string; prompt: string; tool: string; result: string }> = {
  intelligence: {
    comment: "// Claude utilise mcp-intelligence",
    prompt: '> "Comment va la marque AMARA ?"',
    tool: "Using tool: recalculate_scores",
    result: `{
  "coherence": 87,
  "risk": 34,
  "bmf": 72,
  "investment": 91
}`,
  },
  operations: {
    comment: "// Claude utilise mcp-operations",
    prompt: '> "Lance la campagne Fete des Meres"',
    tool: "Using tool: create_campaign",
    result: `{
  "campaign": "camp_fdm_2026",
  "state": "BRIEF_DRAFT",
  "budget": "15 000 000 FCFA",
  "nextStates": ["BRIEF_VALIDATED"]
}`,
  },
  creative: {
    comment: "// Claude utilise mcp-creative",
    prompt: '> "Genere des concepts pour Noel"',
    tool: "Using tool: glory_concept_generator",
    result: `{
  "concepts": [
    { "title": "L'Heritage des Mains",
      "tone": "Emotionnel, intime" },
    { "title": "Ma Premiere Recette",
      "tone": "Nostalgique, participatif" }
  ]
}`,
  },
  pulse: {
    comment: "// Claude utilise mcp-pulse",
    prompt: '> "Quel est le Cult Index d\'AMARA ?"',
    tool: "Using tool: calculate_cult_index",
    result: `{
  "cultIndex": 68,
  "trend": "+4",
  "superfans": 1247,
  "health": "GROWING"
}`,
  },
};

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function McpServers() {
  const [activeTab, setActiveTab] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const server = MCP_SERVERS[activeTab]!;
  const Icon = server.icon;
  const snippet = CODE_SNIPPETS[server.id]!;

  return (
    <section
      id="serveurs"
      ref={ref}
      className="relative border-t border-border/50 bg-muted/30 py-16 sm:py-24"
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
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
            4 serveurs. 1 plateforme.
          </h2>
          <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">
            Chaque serveur expose une facette de l&apos;intelligence ADVERTIS.
            Utilisables ensemble ou independamment.
          </p>
        </motion.div>

        {/* Tabs */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mt-10 flex flex-wrap justify-center gap-2"
        >
          {MCP_SERVERS.map((s, i) => {
            const TabIcon = s.icon;
            return (
              <button
                key={s.id}
                onClick={() => setActiveTab(i)}
                className={cn(
                  "flex items-center gap-2 rounded-xl px-4 py-2.5 text-sm font-medium transition-all",
                  activeTab === i
                    ? "bg-foreground text-background shadow-md"
                    : "bg-card text-muted-foreground hover:bg-card hover:text-foreground hover:shadow-sm border border-border/50",
                )}
              >
                <TabIcon className="size-4" />
                <span className="hidden sm:inline">{s.subtitle}</span>
              </button>
            );
          })}
        </motion.div>

        {/* Server detail */}
        <AnimatePresence mode="wait">
          <motion.div
            key={server.id}
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3, ease: SPRING }}
            className="mt-8 overflow-hidden rounded-2xl border border-border bg-card shadow-sm"
          >
            {/* Header */}
            <div className="border-b border-border/50 p-5 sm:p-6">
              <div className="flex items-center gap-3">
                <div
                  className="flex size-10 items-center justify-center rounded-xl"
                  style={{ background: `${server.color} / 12%` }}
                >
                  <Icon className="size-5" style={{ color: server.color }} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold">
                      @advertis/{server.name}
                    </h3>
                    <Badge variant={server.badgeVariant}>{server.subtitle}</Badge>
                  </div>
                  <p className="mt-0.5 text-sm text-muted-foreground">
                    {server.tagline}
                  </p>
                </div>
              </div>
            </div>

            {/* Content: tools + code */}
            <div className="grid md:grid-cols-2">
              {/* Tools list */}
              <div className="border-b border-border/50 p-5 sm:p-6 md:border-b-0 md:border-r">
                <div className="mb-3 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    OUTILS
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {server.stats.tools} tools
                  </span>
                </div>
                <div className="space-y-2">
                  {server.tools.slice(0, 6).map((tool) => (
                    <div
                      key={tool.name}
                      className="flex items-start gap-3 rounded-lg px-3 py-2 transition hover:bg-muted/50"
                    >
                      <code className="mt-0.5 shrink-0 rounded bg-muted px-1.5 py-0.5 text-xs font-medium text-primary">
                        {tool.name}
                      </code>
                      <span className="text-xs text-muted-foreground">
                        {tool.description}
                      </span>
                    </div>
                  ))}
                  {server.tools.length > 6 && (
                    <p className="px-3 text-xs text-muted-foreground">
                      + {server.tools.length - 6} autres outils...
                    </p>
                  )}
                </div>

                {/* Resources */}
                <div className="mb-3 mt-6 flex items-center justify-between">
                  <h4 className="text-sm font-semibold text-muted-foreground">
                    RESOURCES
                  </h4>
                  <span className="text-xs text-muted-foreground">
                    {server.stats.resources} resources
                  </span>
                </div>
                <div className="space-y-1.5">
                  {server.resources.slice(0, 3).map((r) => (
                    <div
                      key={r.uri}
                      className="flex items-start gap-2 px-3 py-1"
                    >
                      <code className="shrink-0 text-xs text-accent">
                        {r.uri}
                      </code>
                    </div>
                  ))}
                  {server.resources.length > 3 && (
                    <p className="px-3 text-xs text-muted-foreground">
                      + {server.resources.length - 3} autres...
                    </p>
                  )}
                </div>
              </div>

              {/* Code preview */}
              <div className="bg-[oklch(0.09_0.005_260)] p-5 sm:p-6">
                <div className="font-mono text-[13px] leading-7">
                  <div className="text-white/30">{snippet.comment}</div>
                  <div className="mt-2 text-white/70">{snippet.prompt}</div>
                  <div className="mt-3 text-[oklch(0.76_0.19_75)]">
                    {snippet.tool}
                  </div>
                  <div className="mt-2">
                    <span className="text-white/40">Result: </span>
                    <pre className="mt-1 text-[oklch(0.65_0.19_155)]">
                      {snippet.result}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </section>
  );
}
