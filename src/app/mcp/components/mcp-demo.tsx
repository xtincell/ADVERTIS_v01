"use client";

import { useState, useRef, useEffect } from "react";
import { motion, useInView } from "framer-motion";
import { Play, Loader2 } from "lucide-react";
import { Button } from "~/components/ui/button";
import { DEMO_SCENARIOS, type DemoScenario } from "../data/demo-responses";
import { MCP_SERVERS } from "../data/servers";
import { cn } from "~/lib/utils";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Typewriter hook
// ═══════════════════════════════════════════════════════════════════════════

function useTypewriter(text: string, active: boolean, speed = 8) {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!active) {
      setDisplayed("");
      return;
    }
    let i = 0;
    setDisplayed("");
    const timer = setInterval(() => {
      i++;
      setDisplayed(text.slice(0, i));
      if (i >= text.length) clearInterval(timer);
    }, speed);
    return () => clearInterval(timer);
  }, [text, active, speed]);

  return displayed;
}

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function McpDemo() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  const [selectedScenario, setSelectedScenario] = useState(0);
  const [isExecuting, setIsExecuting] = useState(false);
  const [showResult, setShowResult] = useState(false);

  const scenario = DEMO_SCENARIOS[selectedScenario]!;
  const typedResult = useTypewriter(scenario.response, showResult);

  function handleExecute() {
    setIsExecuting(true);
    setShowResult(false);
    setTimeout(() => {
      setIsExecuting(false);
      setShowResult(true);
    }, scenario.duration);
  }

  function handleScenarioChange(index: number) {
    setSelectedScenario(index);
    setIsExecuting(false);
    setShowResult(false);
  }

  // Find server info for current scenario
  const serverInfo = MCP_SERVERS.find((s) => s.name === scenario.server);

  return (
    <section
      id="demo"
      ref={ref}
      className="relative py-16 sm:py-24"
      style={{
        background:
          "linear-gradient(180deg, oklch(0.09 0.005 260) 0%, oklch(0.07 0.01 34) 50%, oklch(0.09 0.005 260) 100%)",
      }}
    >
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="text-center"
        >
          <h2
            className="text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Essaie <span className="text-gradient">maintenant</span>
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-white/50">
            Choisis un scenario et lance l&apos;execution. Donnees simulees — l&apos;early
            access connecte a ta vraie base.
          </p>
        </motion.div>

        {/* Scenario selector */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mt-8 flex flex-wrap justify-center gap-2"
        >
          {DEMO_SCENARIOS.map((s, i) => (
            <button
              key={i}
              onClick={() => handleScenarioChange(i)}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                selectedScenario === i
                  ? "bg-white/15 text-white"
                  : "text-white/40 hover:text-white/70",
              )}
            >
              {s.tool}
            </button>
          ))}
        </motion.div>

        {/* Demo panel */}
        <motion.div
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          variants={fadeInUp}
          className="mt-6 overflow-hidden rounded-2xl border border-white/[0.08] bg-[oklch(0.06_0.005_260)]"
        >
          {/* Title bar */}
          <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3 sm:px-6">
            <div className="flex items-center gap-3">
              <div className="flex gap-1.5">
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
                <div className="size-2.5 rounded-full bg-white/10" />
              </div>
              <span className="text-xs text-white/30">MCP Inspector</span>
            </div>
            {serverInfo && (
              <span className="text-xs text-white/20">
                @advertis/{serverInfo.name}
              </span>
            )}
          </div>

          <div className="grid md:grid-cols-2">
            {/* Request panel */}
            <div className="border-b border-white/[0.06] p-5 sm:p-6 md:border-b-0 md:border-r">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Request
              </h4>

              <div className="space-y-3">
                <div>
                  <label className="text-xs text-white/40">Server</label>
                  <div className="mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-sm text-white/70">
                    {scenario.server}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40">Tool</label>
                  <div className="mt-1 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-sm text-primary">
                    {scenario.tool}
                  </div>
                </div>
                <div>
                  <label className="text-xs text-white/40">Parameters</label>
                  <div className="mt-1 space-y-1.5">
                    {Object.entries(scenario.params).map(([key, value]) => (
                      <div
                        key={key}
                        className="flex items-center gap-2 rounded-lg border border-white/[0.08] bg-white/[0.03] px-3 py-2 font-mono text-sm"
                      >
                        <span className="text-white/40">{key}:</span>
                        <span className="text-[oklch(0.76_0.19_75)]">
                          &quot;{value}&quot;
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <Button
                  variant="gradient"
                  size="lg"
                  className="mt-4 w-full"
                  onClick={handleExecute}
                  disabled={isExecuting}
                >
                  {isExecuting ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      Execution en cours...
                    </>
                  ) : (
                    <>
                      <Play className="size-4" />
                      Executer
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Response panel */}
            <div className="p-5 sm:p-6">
              <h4 className="mb-4 text-xs font-semibold uppercase tracking-wider text-white/30">
                Response
              </h4>

              <div className="min-h-[300px] rounded-lg border border-white/[0.06] bg-[oklch(0.04_0.005_260)] p-4 font-mono text-[13px] leading-6">
                {isExecuting && (
                  <div className="flex items-center gap-2 text-white/40">
                    <Loader2 className="size-3.5 animate-spin" />
                    <span>Calling {scenario.tool}...</span>
                  </div>
                )}
                {showResult && (
                  <pre className="text-[oklch(0.65_0.19_155)] whitespace-pre-wrap">
                    {typedResult}
                    {typedResult.length < scenario.response.length && (
                      <span className="inline-block h-4 w-1.5 animate-pulse bg-white/60" />
                    )}
                  </pre>
                )}
                {!isExecuting && !showResult && (
                  <div className="flex h-full items-center justify-center text-white/20">
                    Clique sur &quot;Executer&quot; pour lancer la requete
                  </div>
                )}
              </div>

              {showResult && typedResult.length >= scenario.response.length && (
                <div className="mt-3 flex items-center gap-2 text-xs text-white/30">
                  <div className="size-1.5 rounded-full bg-[oklch(0.65_0.19_155)]" />
                  Completed in {scenario.duration}ms — donnees simulees
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
