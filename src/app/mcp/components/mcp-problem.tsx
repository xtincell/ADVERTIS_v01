"use client";

import { motion, useInView } from "framer-motion";
import { useRef } from "react";
import { XCircle, ArrowDown, Plug, Bot, BarChart3 } from "lucide-react";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
} as const;

const PAIN_POINTS = [
  {
    icon: Plug,
    title: "Pas d'API externe",
    description:
      "Impossible de brancher un outil tiers sur vos donnees de marque. Tout est enferme dans l'interface web.",
  },
  {
    icon: Bot,
    title: "Pas d'automatisation",
    description:
      "Aucun workflow inter-application. Chaque action necessite une intervention manuelle dans l'app.",
  },
  {
    icon: BarChart3,
    title: "Pas de dashboard custom",
    description:
      "Vos clients ne peuvent pas integrer leur brand intelligence dans leur propre stack ou BI.",
  },
];

export function McpProblem() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });

  return (
    <section ref={ref} className="relative bg-background py-16 sm:py-24">
      <div className="mx-auto max-w-5xl px-4 sm:px-6">
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="flex flex-col items-center text-center"
        >
          {/* Headline */}
          <motion.h2
            variants={fadeInUp}
            className="text-2xl font-bold tracking-tight sm:text-3xl md:text-4xl"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Ton intelligence strategique est{" "}
            <span className="text-gradient">prisonniere</span> de ton interface.
          </motion.h2>

          <motion.p
            variants={fadeInUp}
            className="mx-auto mt-4 max-w-2xl text-muted-foreground"
          >
            Tu as construit 300+ pages de strategie, des scores, des frameworks,
            un Cult Index. Mais tout ca ne vit que dans une seule application.
          </motion.p>

          {/* Pain point cards */}
          <motion.div
            variants={stagger}
            className="mt-12 grid w-full gap-4 sm:grid-cols-3 sm:gap-6"
          >
            {PAIN_POINTS.map((point) => {
              const Icon = point.icon;
              return (
                <motion.div
                  key={point.title}
                  variants={fadeInUp}
                  className="flex flex-col items-center gap-3 rounded-2xl border border-border bg-card p-6 text-center shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex size-10 items-center justify-center rounded-xl bg-destructive/10">
                    <XCircle className="size-5 text-destructive" />
                  </div>
                  <h3 className="font-semibold">{point.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {point.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Transition */}
          <motion.div
            variants={fadeInUp}
            className="mt-12 flex flex-col items-center gap-2 text-muted-foreground"
          >
            <p className="text-sm font-medium">
              Avec les serveurs MCP, tout change.
            </p>
            <ArrowDown className="size-5 animate-bounce" />
          </motion.div>
        </motion.div>
      </div>
    </section>
  );
}
