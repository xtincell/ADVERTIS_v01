"use client";

import { useState, useRef } from "react";
import { motion, useInView } from "framer-motion";
import { ArrowRight, CheckCircle2, Mail } from "lucide-react";
import { Button } from "~/components/ui/button";
import {
  AdvertisMonogram,
} from "~/components/brand/advertis-logo";
import Link from "next/link";

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: SPRING } },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.1, delayChildren: 0.2 } },
} as const;

export function McpWaitlist() {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: "-100px" });
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email) return;
    // In production: call tRPC mutation or API to store the email
    setSubmitted(true);
  }

  return (
    <>
      {/* ─── Waitlist CTA ─── */}
      <section
        id="waitlist"
        ref={ref}
        className="relative py-16 sm:py-24"
        style={{
          background:
            "linear-gradient(180deg, oklch(0.09 0.005 260) 0%, oklch(0.07 0.01 34) 50%, oklch(0.09 0.005 260) 100%)",
        }}
      >
        {/* Glow */}
        <div
          className="absolute left-1/2 top-1/2 h-[400px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-20 blur-[120px]"
          style={{ background: "radial-gradient(circle, oklch(0.63 0.22 34 / 40%) 0%, transparent 70%)" }}
        />

        <div className="relative mx-auto max-w-2xl px-4 text-center sm:px-6">
          <motion.div
            variants={stagger}
            initial="hidden"
            animate={isInView ? "visible" : "hidden"}
            className="flex flex-col items-center"
          >
            <motion.div variants={fadeInUp}>
              <Mail className="size-10 text-primary/60" />
            </motion.div>

            <motion.h2
              variants={fadeInUp}
              className="mt-6 text-2xl font-bold tracking-tight text-white sm:text-3xl md:text-4xl"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Rejoins l&apos;early <span className="text-gradient">access</span>
            </motion.h2>

            <motion.p
              variants={fadeInUp}
              className="mt-4 max-w-lg text-white/50"
            >
              Sois parmi les premiers a connecter ton intelligence de marque a
              tout ton ecosysteme. Acces prioritaire + tarif fondateur.
            </motion.p>

            {/* Form */}
            <motion.div variants={fadeInUp} className="mt-8 w-full max-w-md">
              {submitted ? (
                <div className="flex items-center justify-center gap-3 rounded-xl border border-[oklch(0.65_0.19_155/30%)] bg-[oklch(0.65_0.19_155/10%)] p-4">
                  <CheckCircle2 className="size-5 text-[oklch(0.65_0.19_155)]" />
                  <span className="text-sm font-medium text-[oklch(0.65_0.19_155)]">
                    Tu es inscrit. On te contacte des le lancement.
                  </span>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="flex gap-2">
                  <input
                    type="email"
                    required
                    placeholder="ton@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 flex-1 rounded-xl border border-white/[0.08] bg-white/[0.05] px-4 text-sm text-white placeholder:text-white/30 outline-none transition focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                  />
                  <Button variant="gradient" size="lg" type="submit">
                    S&apos;inscrire
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </form>
              )}
            </motion.div>

            <motion.p
              variants={fadeInUp}
              className="mt-4 text-xs text-white/25"
            >
              Pas de spam. Juste un email au lancement.
            </motion.p>
          </motion.div>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="border-t border-border/50 bg-background">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 sm:flex-row sm:px-6">
          <div className="flex items-center gap-2">
            <AdvertisMonogram size={20} variant="color" />
            <span className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ADVERTIS MCP by UPGRADERS
            </span>
          </div>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link href="/" className="transition hover:text-foreground">
              Accueil
            </Link>
            <Link href="/pricing" className="transition hover:text-foreground">
              Pricing App
            </Link>
            <Link href="/login" className="transition hover:text-foreground">
              Connexion
            </Link>
          </div>
        </div>
      </footer>
    </>
  );
}
