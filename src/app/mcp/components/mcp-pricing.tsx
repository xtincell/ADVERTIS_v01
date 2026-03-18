"use client";

import { useRef, useState } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Zap, Users, Shield } from "lucide-react";
import { Button } from "~/components/ui/button";
import Link from "next/link";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.1 } },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Plan data
// ═══════════════════════════════════════════════════════════════════════════

const PLANS = [
  {
    name: "Discovery",
    priceEur: "0",
    priceFcfa: "0",
    icon: Zap,
    tagline: "Decouvre la puissance MCP.",
    highlight: false,
    features: [
      "mcp-creative (3 outils GLORY)",
      "50 appels / jour",
      "1 marque",
      "Transport stdio uniquement",
    ],
    cta: "Essayer gratuitement",
  },
  {
    name: "Agency",
    priceEur: "349",
    priceFcfa: "175 000",
    icon: Users,
    tagline: "Les 4 serveurs. Sans limites.",
    highlight: true,
    features: [
      "Les 4 serveurs MCP complets",
      "10 000 appels / jour",
      "50 marques",
      "stdio + HTTP (cloud)",
      "Support prioritaire sous 4h",
      "Dashboard de monitoring",
    ],
    cta: "Rejoindre l'early access",
  },
  {
    name: "Enterprise",
    priceEur: null,
    priceFcfa: null,
    icon: Shield,
    tagline: "Self-hosted. Illimite. Dedie.",
    highlight: false,
    features: [
      "Tous les serveurs + custom",
      "Appels illimites",
      "Marques illimitees",
      "Self-hosted (Docker)",
      "Account manager dedie",
      "SLA garanti",
      "Modeles AI personnalises",
    ],
    cta: "Parlons-en",
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// Component
// ═══════════════════════════════════════════════════════════════════════════

export function McpPricing() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [showFcfa, setShowFcfa] = useState(false);

  return (
    <section
      id="pricing"
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
            Pricing
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
            Commence gratuitement. Scale quand tu es pret.
          </p>

          {/* Currency toggle */}
          <div className="mt-4 flex items-center justify-center gap-2">
            <button
              onClick={() => setShowFcfa(false)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${!showFcfa ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              EUR
            </button>
            <button
              onClick={() => setShowFcfa(true)}
              className={`rounded-lg px-3 py-1 text-xs font-medium transition ${showFcfa ? "bg-foreground text-background" : "text-muted-foreground hover:text-foreground"}`}
            >
              FCFA
            </button>
          </div>
        </motion.div>

        {/* Plans grid */}
        <motion.div
          variants={stagger}
          initial="hidden"
          animate={isInView ? "visible" : "hidden"}
          className="mt-10 grid gap-6 sm:gap-8 md:grid-cols-3"
        >
          {PLANS.map((plan) => {
            const Icon = plan.icon;
            return (
              <motion.div
                key={plan.name}
                variants={fadeInUp}
                className={`relative flex flex-col rounded-2xl border p-5 transition-shadow hover:shadow-lg sm:p-6 ${
                  plan.highlight
                    ? "border-primary bg-primary/[0.02] shadow-md ring-1 ring-primary/20"
                    : "border-border bg-card"
                }`}
              >
                {plan.highlight && (
                  <div className="absolute -top-3 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-full bg-primary px-4 py-1 text-xs font-medium text-white">
                    Le plus choisi
                  </div>
                )}

                <div className="mb-4 sm:mb-6">
                  <div className="mb-2 flex items-center gap-2">
                    <Icon className="size-5 text-primary" />
                    <h3 className="text-lg font-semibold">{plan.name}</h3>
                  </div>
                  <p className="text-sm font-medium text-primary">
                    {plan.tagline}
                  </p>
                </div>

                {/* Price */}
                <div className="mb-4 sm:mb-6">
                  {plan.priceEur !== null ? (
                    <div>
                      <div className="flex items-baseline gap-1.5">
                        <span className="text-3xl font-bold sm:text-4xl">
                          {showFcfa ? plan.priceFcfa : plan.priceEur}
                        </span>
                        <span className="text-base font-medium text-muted-foreground sm:text-lg">
                          {showFcfa ? "FCFA" : "€"}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          /mois
                        </span>
                      </div>
                      {!showFcfa && plan.priceFcfa !== "0" && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          soit{" "}
                          <span className="font-medium text-foreground">
                            {plan.priceFcfa} FCFA
                          </span>
                          /mois
                        </p>
                      )}
                    </div>
                  ) : (
                    <div>
                      <div className="text-2xl font-bold sm:text-3xl">
                        Sur mesure
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        Tarif adapte a votre infrastructure
                      </p>
                    </div>
                  )}
                </div>

                {/* Features */}
                <ul className="mb-6 flex-1 space-y-2.5 sm:mb-8 sm:space-y-3">
                  {plan.features.map((feature) => (
                    <li
                      key={feature}
                      className="flex items-start gap-2.5 text-sm"
                    >
                      <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-primary/70" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA */}
                <Link href="#waitlist" className="mt-auto">
                  <Button
                    className="w-full"
                    variant={plan.highlight ? "gradient" : "outline"}
                    size="lg"
                  >
                    {plan.cta}
                    <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <p className="mt-6 text-center text-xs text-muted-foreground sm:text-sm">
          Prix affiches en EUR et FCFA. Facturation aussi disponible en USD, GHS
          et NGN.
        </p>
      </div>
    </section>
  );
}
