"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  motion,
  AnimatePresence,
  useScroll,
  useMotionValueEvent,
  useInView,
} from "framer-motion";
import {
  ArrowRight,
  Sparkles,
  Star,
  ChevronRight,
  Globe,
  Layers,
  Wand2,
  BarChart3,
  Monitor,
  Brain,
  PieChart,
  Wallet,
  X,
  CheckCircle2,
  TrendingUp,
  Menu,
  XIcon,
} from "lucide-react";
import {
  AdvertisMonogram,
  AdvertisLogoFull,
} from "~/components/brand/advertis-logo";
import { Button } from "~/components/ui/button";
import { PILLAR_CONFIG, type PillarType } from "~/lib/constants";
import { cn } from "~/lib/utils";

// ═══════════════════════════════════════════════════════════════════════════
// Animation Variants
// ═══════════════════════════════════════════════════════════════════════════

const SPRING = [0.16, 1, 0.3, 1] as const;

const fadeInUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.6, ease: SPRING },
  },
} as const;

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.5 } },
} as const;

const scaleIn = {
  hidden: { opacity: 0, scale: 0.92 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.5, ease: SPRING },
  },
} as const;

const stagger = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
} as const;

const staggerSlow = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.15, delayChildren: 0.2 } },
} as const;

const slideLeft = {
  hidden: { opacity: 0, x: -40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: SPRING },
  },
} as const;

const slideRight = {
  hidden: { opacity: 0, x: 40 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, ease: SPRING },
  },
} as const;

// ═══════════════════════════════════════════════════════════════════════════
// Data
// ═══════════════════════════════════════════════════════════════════════════

const HERO_STATS = [
  { value: "1 200+", label: "marques accompagnées" },
  { value: "24", label: "frameworks stratégiques" },
  { value: "38", label: "pays actifs" },
  { value: "2M+", label: "générations IA" },
];

const ROTATING_WORDS = [
  "inarrêtables",
  "mémorables",
  "iconiques",
  "distinctives",
];

const TRUST_COUNTRIES = [
  { flag: "\u{1F1E8}\u{1F1F2}", name: "Cameroun" },
  { flag: "\u{1F1E8}\u{1F1EE}", name: "Côte d'Ivoire" },
  { flag: "\u{1F1F8}\u{1F1F3}", name: "Sénégal" },
  { flag: "\u{1F1EB}\u{1F1F7}", name: "France" },
  { flag: "\u{1F1F2}\u{1F1E6}", name: "Maroc" },
  { flag: "\u{1F1E8}\u{1F1E9}", name: "RDC" },
  { flag: "\u{1F1F3}\u{1F1EC}", name: "Nigeria" },
  { flag: "\u{1F1E7}\u{1F1EA}", name: "Belgique" },
  { flag: "\u{1F1E8}\u{1F1E6}", name: "Canada" },
  { flag: "\u{1F1F9}\u{1F1F3}", name: "Tunisie" },
  { flag: "\u{1F1EC}\u{1F1E6}", name: "Gabon" },
  { flag: "\u{1F1E7}\u{1F1EB}", name: "Burkina Faso" },
];

const FEATURES = [
  {
    id: "artemis",
    title: "ARTEMIS",
    desc: "Ce qui prenait 3 semaines en cabinet prend 48h avec ARTEMIS. 24 frameworks, 300 à 600 pages générées par marque.",
    icon: Layers,
    cta: "Explorer les frameworks",
    href: "/frameworks",
    gradient: "from-orange-50 to-orange-100/50 dark:from-orange-950/30 dark:to-orange-900/10",
    iconBg: "bg-orange-100 dark:bg-orange-900/40",
    iconColor: "text-orange-600 dark:text-orange-400",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "glory",
    title: "GLORY",
    desc: "Naming, scripts, briefs créatifs, moodboards, posts sociaux. 38 outils qui remplacent 5 freelances.",
    icon: Wand2,
    cta: "Découvrir les outils",
    href: "/glory-tools",
    gradient: "from-rose-50 to-rose-100/50 dark:from-rose-950/30 dark:to-rose-900/10",
    iconBg: "bg-rose-100 dark:bg-rose-900/40",
    iconColor: "text-rose-600 dark:text-rose-400",
    span: "md:col-span-2",
  },
  {
    id: "campaigns",
    title: "Campagnes 360\u00B0",
    desc: "De la stratégie au ROI, chaque franc investi est tracé. Fini les campagnes sans mesure.",
    icon: BarChart3,
    cta: "",
    gradient: "from-amber-50 to-amber-100/50 dark:from-amber-950/30 dark:to-amber-900/10",
    iconBg: "bg-amber-100 dark:bg-amber-900/40",
    iconColor: "text-amber-600 dark:text-amber-400",
    span: "",
  },
  {
    id: "brandos",
    title: "Brand OS",
    desc: "Une seule source de vérité pour votre marque. Vault, alertes risques, apôtres. Plus jamais de brief incohérent.",
    icon: Monitor,
    cta: "",
    gradient: "from-blue-50 to-blue-100/50 dark:from-blue-950/30 dark:to-blue-900/10",
    iconBg: "bg-blue-100 dark:bg-blue-900/40",
    iconColor: "text-blue-600 dark:text-blue-400",
    span: "",
  },
  {
    id: "mestor",
    title: "Mestor IA",
    desc: "Posez une question, obtenez une réponse stratégique en 10 secondes. Votre directeur stratégique qui ne dort jamais.",
    icon: Brain,
    cta: "",
    gradient: "from-violet-50 to-violet-100/50 dark:from-violet-950/30 dark:to-violet-900/10",
    iconBg: "bg-violet-100 dark:bg-violet-900/40",
    iconColor: "text-violet-600 dark:text-violet-400",
    span: "",
  },
  {
    id: "crm",
    title: "CRM",
    desc: "Scorez vos prospects, suivez chaque deal. Ne perdez plus un client par manque de relance.",
    icon: PieChart,
    cta: "",
    gradient: "from-cyan-50 to-cyan-100/50 dark:from-cyan-950/30 dark:to-cyan-900/10",
    iconBg: "bg-cyan-100 dark:bg-cyan-900/40",
    iconColor: "text-cyan-600 dark:text-cyan-400",
    span: "",
  },
  {
    id: "serenite",
    title: "Sérénité",
    desc: "Devis, factures, contrats — en un clic. Arrêtez de perdre du temps sur l'admin quand vous devriez vendre.",
    icon: Wallet,
    cta: "",
    gradient: "from-stone-50 to-stone-100/50 dark:from-stone-950/30 dark:to-stone-900/10",
    iconBg: "bg-stone-100 dark:bg-stone-900/40",
    iconColor: "text-stone-600 dark:text-stone-400",
    span: "md:col-span-2",
  },
];

const TESTIMONIALS = [
  {
    name: "Amara Diallo",
    role: "Directrice de Marque",
    company: "Solaris Group",
    quote:
      "ADVERTIS a réduit notre temps de production stratégique de 3 semaines à 48 heures. Le cockpit est devenu notre outil de présentation client numéro un.",
    photo:
      "/images/landing/temoignage-amara-diallo-100x100.jpg",
  },
  {
    name: "Karim Benali",
    role: "CEO",
    company: "Agence Zenith",
    quote:
      "Avec 12 marques gérées en parallèle, ADVERTIS est le seul outil qui nous permet de maintenir la cohérence tout en scalant nos opérations.",
    photo:
      "/images/landing/temoignage-karim-benali-100x100.jpg",
  },
  {
    name: "Mei-Lin Chen",
    role: "Directrice Créative",
    company: "Studio Panorama",
    quote:
      "Les outils GLORY ont transformé notre processus créatif. Du naming au moodboard, tout est connecté à la stratégie de marque.",
    photo:
      "/images/landing/temoignage-mei-lin-chen-100x100.jpg",
  },
];

const PERSONAS = [
  {
    title: "Directeur de Marque",
    badge: "Stratégie",
    desc: "Pilotez votre portefeuille de marques depuis un cockpit interactif. Scores de cohérence, alertes risques, rapports automatisés.",
    photo:
      "/images/landing/persona-directeur-marque-500x375.jpg",
  },
  {
    title: "CEO d'Agence",
    badge: "Opérations",
    desc: "Gérez 10, 20, 50 marques en parallèle. Multi-équipes, multi-devises, multi-marchés. Une seule plateforme.",
    photo:
      "/images/landing/persona-ceo-agence-500x375.jpg",
  },
  {
    title: "Directeur Créatif",
    badge: "Création",
    desc: "De l'insight au concept créatif : naming, scripts, moodboards, calendrier éditorial. Tout connecté à la stratégie.",
    photo:
      "/images/landing/persona-directeur-creatif-500x375.jpg",
  },
  {
    title: "Stratégiste Freelance",
    badge: "Indépendance",
    desc: "Produisez des livrables d'agence avec les ressources d'un indépendant. Votre arme secrète stratégique.",
    photo:
      "/images/landing/persona-strategiste-freelance-500x375.jpg",
  },
];

const NUMBER_STATS = [
  { value: 86, suffix: "", label: "modèles IA spécialisés" },
  { value: 450, suffix: "+", label: "endpoints API" },
  { value: 24, suffix: "", label: "frameworks ARTEMIS" },
  { value: 38, suffix: "+", label: "outils GLORY" },
];

const NAV_LINKS = [
  { label: "Méthode", href: "#method" },
  { label: "Fonctionnalités", href: "#features" },
  { label: "Cas d'usage", href: "#personas" },
  { label: "Tarifs", href: "/pricing" },
  { label: "MCP", href: "/mcp" },
];

const FOOTER_COLS = [
  {
    title: "Produit",
    links: ["Méthode ADVERTIS", "Fonctionnalités", "Tarifs", "MCP Servers", "Intégrations"],
  },
  {
    title: "Ressources",
    links: ["Documentation", "Blog", "Guides", "API Reference"],
  },
  {
    title: "Entreprise",
    links: ["À propos", "Carrières", "Contact", "Partenaires"],
  },
  {
    title: "Légal",
    links: [
      "Conditions générales",
      "Politique de confidentialité",
      "Mentions légales",
    ],
  },
];

// ═══════════════════════════════════════════════════════════════════════════
// CountUp Sub-Component
// ═══════════════════════════════════════════════════════════════════════════

function CountUp({
  target,
  suffix = "",
}: {
  target: number;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px" });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;
    const duration = 2000;
    const steps = 60;
    const increment = target / steps;
    let current = 0;
    const timer = setInterval(() => {
      current += increment;
      if (current >= target) {
        setCount(target);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);
    return () => clearInterval(timer);
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {count}
      {suffix}
    </span>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// SVG Vector Shapes
// ═══════════════════════════════════════════════════════════════════════════

function BlobEmerald({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 200 200"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M47.5,-61.8C59.3,-52.7,65.2,-35.6,69.1,-18.1C73,-.5,74.8,17.5,68.1,31.6C61.4,45.7,46.1,55.8,30,62.4C13.8,69,-3.3,72.1,-19.6,68.5C-35.9,64.8,-51.4,54.4,-60.8,40.1C-70.2,25.9,-73.6,7.8,-70.5,-8.7C-67.4,-25.2,-57.7,-40.1,-44.7,-48.9C-31.7,-57.8,-15.9,-60.6,1.2,-62.1C18.2,-63.6,35.7,-70.8,47.5,-61.8Z"
        transform="translate(100 100)"
        fill="oklch(0.63 0.22 34 / 12%)"
      />
    </svg>
  );
}

function RingRose({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <circle
        cx="60"
        cy="60"
        r="50"
        fill="none"
        stroke="oklch(0.62 0.25 12 / 20%)"
        strokeWidth="1.5"
      />
      <circle
        cx="60"
        cy="60"
        r="35"
        fill="none"
        stroke="oklch(0.62 0.25 12 / 12%)"
        strokeWidth="1"
      />
      <circle
        cx="60"
        cy="60"
        r="20"
        fill="none"
        stroke="oklch(0.62 0.25 12 / 8%)"
        strokeWidth="0.5"
      />
    </svg>
  );
}

function DiamondAmber({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 100 100"
      className={className}
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect
        x="30"
        y="30"
        width="40"
        height="40"
        rx="4"
        transform="rotate(45 50 50)"
        fill="none"
        stroke="oklch(0.76 0.19 75 / 20%)"
        strokeWidth="1.5"
      />
      <rect
        x="37"
        y="37"
        width="26"
        height="26"
        rx="3"
        transform="rotate(45 50 50)"
        fill="oklch(0.76 0.19 75 / 8%)"
        stroke="oklch(0.76 0.19 75 / 15%)"
        strokeWidth="1"
      />
    </svg>
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// Main Component
// ═══════════════════════════════════════════════════════════════════════════

interface LandingPageProps {
  userHomeHref?: string;
}

export function LandingPage({ userHomeHref }: LandingPageProps) {
  const isLoggedIn = !!userHomeHref;
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [wordIndex, setWordIndex] = useState(0);
  const { scrollY } = useScroll();

  useMotionValueEvent(scrollY, "change", (v) => setScrolled(v > 50));

  // Rotating word animation
  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((prev) => (prev + 1) % ROTATING_WORDS.length);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // ─── SECTION 1: NAVBAR ───────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Navbar */}
      <motion.nav
        initial={{ y: -20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="fixed top-0 left-0 right-0 z-50"
      >
        <div
          className={cn(
            "mx-auto flex h-16 max-w-7xl items-center justify-between px-6 transition-all duration-500",
            scrolled
              ? "mt-3 mx-4 rounded-2xl glass shadow-lg"
              : "mt-0 bg-transparent"
          )}
        >
          <Link href="/" className="flex items-center gap-2">
            <AdvertisLogoFull monogramSize={24} variant="color" />
          </Link>

          {/* Desktop nav */}
          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                {link.label}
              </a>
            ))}
          </div>

          {/* CTAs */}
          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <Link href={userHomeHref!}>
                <Button variant="gradient" size="sm">
                  Mon espace
                  <ArrowRight className="ml-1 size-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" className="hidden sm:block">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/register">
                  <Button variant="gradient" size="sm">
                    Commencer
                    <ArrowRight className="ml-1 size-4" />
                  </Button>
                </Link>
              </>
            )}
            {/* Mobile menu toggle */}
            <button
              className="md:hidden p-2 text-muted-foreground"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <XIcon className="size-5" />
              ) : (
                <Menu className="size-5" />
              )}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            className="md:hidden mx-4 mt-2 rounded-2xl glass p-4 shadow-xl"
          >
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="block py-3 px-4 text-sm text-muted-foreground hover:text-foreground transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {link.label}
              </a>
            ))}
          </motion.div>
        )}
      </motion.nav>

      {/* ─── SECTION 2: HERO ────────────────────────────────────────────── */}
      <section className="relative min-h-screen overflow-hidden flex flex-col items-center justify-center">
        {/* Background layers */}
        <div className="absolute inset-0 bg-mesh" />
        <div className="absolute inset-0 bg-dotgrid opacity-[0.02]" />

        {/* Subtle accent glow behind headline */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[55%] w-[min(700px,90vw)] aspect-[7/4] rounded-full bg-primary/[0.04] blur-[100px] pointer-events-none" />

        {/* Vertical accent line */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-px h-24 bg-gradient-to-b from-transparent via-primary/20 to-transparent" />

        {/* Content */}
        <motion.div
          variants={staggerSlow}
          initial="hidden"
          animate="visible"
          className="relative mx-auto max-w-5xl px-6 pt-36 pb-32 text-center"
        >
          {/* Badge */}
          <motion.div variants={fadeInUp}>
            <span className="inline-flex items-center gap-1.5 rounded-full border border-primary/20 bg-primary/5 px-4 py-1.5 text-sm font-medium text-primary">
              <Sparkles className="size-3.5" />
              La plateforme stratégique IA de référence
            </span>
          </motion.div>

          {/* Headline with kinetic rotating word */}
          <motion.h1
            variants={fadeInUp}
            className="mt-8 font-display text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-extrabold tracking-tight leading-[0.95]"
          >
            Construisez des marques
            <br />
            <span className="relative inline-flex h-[1.15em] overflow-hidden align-bottom">
              <AnimatePresence mode="wait">
                <motion.span
                  key={ROTATING_WORDS[wordIndex]}
                  initial={{ opacity: 0, y: 40 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -40 }}
                  transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                  className="text-gradient"
                >
                  {ROTATING_WORDS[wordIndex]}.
                </motion.span>
              </AnimatePresence>
            </span>
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={fadeInUp}
            className="mt-8 text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed"
          >
            Produisez des stratégies de marque complètes en 48h au lieu
            de 3&nbsp;semaines. 8&nbsp;piliers, 24&nbsp;frameworks, un seul
            système. Vos concurrents ne comprendront pas comment vous faites.
          </motion.p>

          {/* CTAs */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link href="/register">
              <Button
                variant="gradient"
                size="lg"
                className="text-base group w-full sm:w-auto"
              >
                Commencer gratuitement
                <ArrowRight className="ml-2 size-5 transition-transform group-hover:translate-x-1" />
              </Button>
            </Link>
            <a href="#method">
              <Button
                variant="outline"
                size="lg"
                className="text-base w-full sm:w-auto"
              >
                Découvrir la méthode
              </Button>
            </a>
          </motion.div>

          {/* Social proof strip */}
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex items-center justify-center gap-3"
          >
            <div className="flex -space-x-1.5">
              {TRUST_COUNTRIES.slice(0, 5).map((c) => (
                <span
                  key={c.name}
                  className="size-7 rounded-full bg-muted ring-2 ring-background flex items-center justify-center text-xs"
                >
                  {c.flag}
                </span>
              ))}
            </div>
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">1 200+</strong> marques
              dans{" "}
              <strong className="text-foreground">38</strong> pays
            </p>
          </motion.div>

          {/* Product screenshot hero */}
          <motion.div
            variants={fadeInUp}
            className="mt-16 relative mx-auto max-w-5xl"
          >
            <div className="relative rounded-2xl overflow-hidden shadow-2xl ring-1 ring-border/20">
              <img
                src="/images/landing/screenshot-dashboard-1440x900.jpg"
                alt="Dashboard ADVERTIS — cockpit stratégique avec KPIs, portails et flywheel opérationnel"
                className="w-full h-auto"
              />
              <div className="absolute inset-0 rounded-2xl ring-1 ring-inset ring-black/10" />
            </div>
            {/* Glow effect behind screenshot */}
            <div className="absolute -inset-4 -z-10 bg-gradient-to-b from-primary/10 via-accent/5 to-transparent rounded-3xl blur-2xl" />
          </motion.div>
        </motion.div>

        {/* Stats ribbon */}
        <motion.div
          variants={stagger}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          className="absolute bottom-0 left-0 right-0 border-t border-border/30 glass-subtle"
        >
          <div className="mx-auto max-w-7xl px-6 py-6 grid grid-cols-2 md:grid-cols-4 gap-8">
            {HERO_STATS.map((stat) => (
              <motion.div
                key={stat.label}
                variants={fadeInUp}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold font-display">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* ─── SECTION 3: TRUST BAR ───────────────────────────────────────── */}
      <section className="py-10 border-b border-border/30 bg-muted/20 overflow-x-clip">
        <p className="text-center text-xs uppercase tracking-widest text-muted-foreground mb-6">
          Utilisé par des équipes dans
        </p>
        <div className="relative overflow-hidden">
          <div className="animate-marquee flex shrink-0 gap-10 items-center">
            {[...TRUST_COUNTRIES, ...TRUST_COUNTRIES].map((c, i) => (
              <span
                key={`${c.name}-${i}`}
                className="flex items-center gap-2 shrink-0 text-sm text-muted-foreground"
              >
                <span className="text-lg">{c.flag}</span>
                {c.name}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ─── SECTION 4: PROBLEM → SOLUTION ──────────────────────────────── */}
      <section className="py-24 md:py-32 overflow-x-clip">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-80px" }}
            className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-start"
          >
            {/* Problem */}
            <motion.div variants={slideLeft} className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                Le problème
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Votre stratégie de marque est fragmentée.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                Documents éparpillés. Briefs inconstants. Équipes désalignées.
                Chaque projet repart de zéro.
              </p>
              <div className="rounded-2xl overflow-hidden aspect-[16/10]">
                {/* Photo: Overwhelmed professional at messy desk */}
                <img
                  src="/images/landing/probleme-professionnelle-submergee-600x375.jpg"
                  alt="Professionnelle submergée par le travail"
                  className="w-full h-full object-cover grayscale-[30%] contrast-[0.95]"
                  loading="lazy"
                />
              </div>
              <ul className="space-y-3">
                {[
                  "Des heures perdues à recréer des supports",
                  "Aucune cohérence entre les équipes",
                  "L'IA sans méthode = du bruit",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-muted-foreground"
                  >
                    <X className="size-5 text-rose-500 shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Solution */}
            <motion.div variants={slideRight} className="space-y-6">
              <span className="inline-flex items-center rounded-full bg-orange-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-orange-600 dark:text-orange-400">
                Avec ADVERTIS
              </span>
              <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
                Un système. 24 frameworks. Une seule source de vérité.
              </h2>
              <p className="text-lg text-muted-foreground leading-relaxed">
                ADVERTIS structure votre stratégie en 8 piliers, génère vos
                livrables par IA, et aligne toutes vos équipes autour
                d'un cockpit interactif.
              </p>
              <div className="rounded-2xl overflow-hidden aspect-[16/10] ring-2 ring-primary/20 ring-offset-4 ring-offset-background">
                {/* Screenshot: Real ADVERTIS dashboard */}
                <img
                  src="/images/landing/screenshot-dashboard-1440x900.jpg"
                  alt="Dashboard ADVERTIS — vue d'ensemble avec KPIs et portails"
                  className="w-full h-full object-cover object-top"
                  loading="lazy"
                />
              </div>
              <ul className="space-y-3">
                {[
                  "Stratégie structurée en moins de 48h",
                  "Cohérence garantie par les frameworks",
                  "L'IA guidée par la méthodologie ADVERTIS",
                ].map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-foreground"
                  >
                    <CheckCircle2 className="size-5 text-primary shrink-0 mt-0.5" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 5: BENTO GRID ──────────────────────────────────────── */}
      <section id="features" className="py-24 md:py-32 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <span className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-4">
              Écosystème complet
            </span>
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Tout ce qu'il faut pour{" "}
              <span className="text-gradient">dominer votre marché.</span>
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-60px" }}
            variants={staggerSlow}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 auto-rows-[minmax(180px,auto)]"
          >
            {FEATURES.map((f) => {
              const Icon = f.icon;
              return (
                <motion.div
                  key={f.id}
                  variants={scaleIn}
                  className={cn(
                    "group relative overflow-hidden rounded-2xl border border-border/30 bg-gradient-to-br p-6 md:p-8 cursor-default transition-all duration-300 hover:shadow-lg hover:-translate-y-1",
                    f.gradient,
                    f.span
                  )}
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-3xl" />
                  <div className="relative z-10 flex flex-col h-full">
                    <div
                      className={cn(
                        "size-12 rounded-2xl flex items-center justify-center mb-4",
                        f.iconBg
                      )}
                    >
                      <Icon className={cn("size-6", f.iconColor)} />
                    </div>
                    <h3 className="font-display text-xl font-bold mb-2">
                      {f.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {f.desc}
                    </p>
                    {f.cta && f.href ? (
                      <Link
                        href={f.href}
                        className="mt-auto pt-4 flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity hover:underline"
                      >
                        <span>{f.cta}</span>
                        <ChevronRight className="size-4" />
                      </Link>
                    ) : f.cta ? (
                      <div className="mt-auto pt-4 flex items-center gap-1 text-sm text-primary font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                        <span>{f.cta}</span>
                        <ChevronRight className="size-4" />
                      </div>
                    ) : null}
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 6: THE METHOD ──────────────────────────────────────── */}
      <section id="method" className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0">
          <img
            src="/images/landing/methode-coworking-aerien-1600x900.jpg"
            alt=""
            className="w-full h-full object-cover opacity-[0.04]"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              La méthode{" "}
              <span className="text-gradient">A-D-V-E-R-T-I-S</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              8 piliers. 24 frameworks. Un système complet de stratégie de
              marque, de l'ADN à l'exécution.
            </p>
          </motion.div>

          {/* Gradient timeline (desktop) */}
          <div className="hidden lg:block relative mb-8">
            <motion.div
              initial={{ scaleX: 0 }}
              whileInView={{ scaleX: 1 }}
              viewport={{ once: true }}
              transition={{
                duration: 1.2,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="h-0.5 bg-gradient-to-r from-primary via-accent to-amber-500 origin-left rounded-full"
            />
          </div>

          {/* Pillar cards */}
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: "-40px" }}
            variants={stagger}
            className="flex gap-4 overflow-x-auto pb-4 lg:grid lg:grid-cols-4 xl:grid-cols-8 lg:overflow-visible scrollbar-none"
          >
            {(Object.keys(PILLAR_CONFIG) as PillarType[]).map((key) => {
              const pillar = PILLAR_CONFIG[key];
              return (
                <motion.div
                  key={key}
                  variants={fadeInUp}
                  className="shrink-0 w-[220px] lg:w-auto rounded-2xl border border-border/30 bg-card p-6 hover:shadow-lg transition-all duration-300 hover:-translate-y-1"
                >
                  <div
                    className="text-5xl font-extrabold font-display mb-3"
                    style={{ color: pillar.color }}
                  >
                    {key}
                  </div>
                  <h3 className="font-semibold text-base mb-2">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {pillar.description}
                  </p>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 7: TESTIMONIALS ────────────────────────────────────── */}
      <section className="py-24 md:py-32 bg-muted/20">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-4xl font-bold tracking-tight">
              Ce qu'en disent nos utilisateurs
            </h2>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerSlow}
            className="grid grid-cols-1 md:grid-cols-3 gap-8"
          >
            {TESTIMONIALS.map((t) => (
              <motion.div
                key={t.name}
                variants={scaleIn}
                className="rounded-2xl border border-border/30 bg-card p-8 space-y-4"
              >
                <div className="flex gap-1">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      className="size-4 fill-amber-400 text-amber-400"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground leading-relaxed italic">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="size-12 rounded-full overflow-hidden ring-2 ring-primary/20">
                    <img
                      src={t.photo}
                      alt={t.name}
                      className="w-full h-full object-cover"
                      loading="lazy"
                    />
                  </div>
                  <div>
                    <div className="font-semibold text-sm">{t.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {t.role}, {t.company}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 8: PERSONAS ────────────────────────────────────────── */}
      <section id="personas" className="py-24 md:py-32">
        <div className="mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="font-display text-3xl md:text-5xl font-bold tracking-tight">
              Construit pour{" "}
              <span className="text-gradient">ceux qui construisent.</span>
            </h2>
            <p className="mt-4 text-lg text-muted-foreground max-w-2xl mx-auto">
              Que vous soyez une agence de 50 personnes ou un stratégiste
              indépendant, ADVERTIS s'adapte à votre réalité.
            </p>
          </motion.div>

          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerSlow}
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {PERSONAS.map((p) => (
              <motion.div
                key={p.title}
                variants={fadeInUp}
                className="group rounded-2xl overflow-hidden border border-border/30 bg-card"
              >
                <div className="aspect-[4/3] relative overflow-hidden">
                  <img
                    src={p.photo}
                    alt={p.title}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
                  <div className="absolute bottom-4 left-4">
                    <span className="inline-flex rounded-full bg-white/10 backdrop-blur-sm border border-white/20 px-3 py-1 text-xs font-medium text-white">
                      {p.badge}
                    </span>
                  </div>
                </div>
                <div className="p-6 space-y-2">
                  <h3 className="font-display font-bold text-lg">{p.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {p.desc}
                  </p>
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 9: BY THE NUMBERS ──────────────────────────────────── */}
      <section className="py-24 md:py-32 relative">
        <div className="absolute inset-0 bg-dotgrid opacity-[0.02]" />
        <div className="relative mx-auto max-w-7xl px-6">
          <motion.div
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true }}
            variants={staggerSlow}
            className="grid grid-cols-2 lg:grid-cols-4 gap-12 text-center"
          >
            {NUMBER_STATS.map((stat) => (
              <motion.div key={stat.label} variants={fadeInUp}>
                <div className="font-display text-5xl md:text-7xl font-extrabold tracking-tighter">
                  <CountUp target={stat.value} suffix={stat.suffix} />
                </div>
                <div className="mt-2 text-sm md:text-base text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* ─── SECTION 10: FINAL CTA ──────────────────────────────────────── */}
      <section className="py-24 md:py-32 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-950 via-slate-950 to-rose-950" />
        <div className="absolute inset-0 bg-mesh opacity-30" />
        <div className="absolute top-10 left-[20%] size-48 rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-10 right-[20%] size-64 rounded-full bg-accent/10 blur-3xl" />

        {/* Decorative photo accent */}
        <div className="absolute bottom-0 right-0 w-64 h-48 rounded-tl-3xl overflow-hidden opacity-20 hidden lg:block">
          <img
            src="/images/landing/cta-decoratif-400x300.jpg"
            alt=""
            className="w-full h-full object-cover"
            loading="lazy"
            aria-hidden="true"
          />
        </div>

        <motion.div
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={stagger}
          className="relative mx-auto max-w-3xl px-6 text-center"
        >
          <motion.div variants={fadeInUp}>
            <AdvertisMonogram
              size={48}
              variant="white"
              className="mx-auto mb-6"
            />
          </motion.div>
          <motion.h2
            variants={fadeInUp}
            className="font-display text-3xl md:text-5xl font-bold tracking-tight text-white"
          >
            Chaque jour sans système, c&apos;est de l&apos;argent perdu.
          </motion.h2>
          <motion.p
            variants={fadeInUp}
            className="mt-4 text-lg text-white/70 max-w-xl mx-auto"
          >
            24 frameworks. 38 outils IA. 86 modèles. Des stratégies
            livrées en jours, pas en semaines. Testez gratuitement pendant
            14&nbsp;jours — sans carte bancaire.
          </motion.p>
          <motion.div
            variants={fadeInUp}
            className="mt-10 flex flex-col sm:flex-row gap-3 max-w-md mx-auto"
          >
            <input
              type="email"
              placeholder="votre@email.com"
              className="flex-1 h-12 px-4 rounded-xl bg-white/10 border border-white/20 text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary/50 transition-all"
            />
            <Link href="/register">
              <Button
                variant="gradient"
                size="lg"
                className="h-12 px-8 shrink-0 w-full sm:w-auto"
              >
                Commencer
                <ArrowRight className="ml-2 size-5" />
              </Button>
            </Link>
          </motion.div>
          <motion.p
            variants={fadeIn}
            className="mt-4 text-xs text-white/40"
          >
            Pas de piège. Pas de carte. Vous pouvez annuler en 2 clics.
          </motion.p>
        </motion.div>
      </section>

      {/* ─── SECTION 11: FOOTER ─────────────────────────────────────────── */}
      <footer className="border-t border-border/50 bg-card">
        <div className="mx-auto max-w-7xl px-6 py-16">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
            {/* Brand */}
            <div className="col-span-2 md:col-span-1">
              <AdvertisLogoFull monogramSize={24} variant="color" />
              <p className="mt-4 text-sm text-muted-foreground leading-relaxed max-w-xs">
                La plateforme stratégique IA pour les marques qui refusent
                d'être ordinaires.
              </p>
            </div>

            {/* Link columns */}
            {FOOTER_COLS.map((col) => (
              <div key={col.title}>
                <h4 className="font-semibold text-sm mb-4">{col.title}</h4>
                <ul className="space-y-3 text-sm text-muted-foreground">
                  {col.links.map((link) => (
                    <li key={link}>
                      <span className="hover:text-foreground transition-colors cursor-pointer">
                        {link}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-border/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} ADVERTIS by UPGRADERS. Tous
              droits réservés.
            </div>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Globe className="size-4" />
              <span>Français</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
