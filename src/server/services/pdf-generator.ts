// ADVERTIS PDF Generator Service
// Server-side PDF generation using @react-pdf/renderer
// Renders structured, professional PDF documents matching cockpit UI quality.

import React from "react";
import { renderToBuffer } from "@react-pdf/renderer";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
} from "@react-pdf/renderer";
import { PILLAR_CONFIG, type PillarType } from "~/lib/constants";
import type { ImplementationData } from "~/lib/types/implementation-data";
import type { RiskAuditResult, TrackAuditResult } from "./audit-generation";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyData {
  name: string;
  brandName: string;
  sector?: string;
  coherenceScore?: number;
  createdAt: Date;
}

interface PillarData {
  type: string;
  title: string;
  content: unknown;
  summary?: string;
  status: string;
}

interface PDFOptions {
  selectedPillars?: string[];
  includeCover?: boolean;
}

// ---------------------------------------------------------------------------
// Register Fonts (Helvetica is built-in)
// ---------------------------------------------------------------------------

Font.register({
  family: "Helvetica",
  fonts: [
    { src: "Helvetica" },
    { src: "Helvetica-Bold", fontWeight: 700 },
    { src: "Helvetica-Oblique", fontStyle: "italic" },
  ],
});

// ---------------------------------------------------------------------------
// Design Tokens
// ---------------------------------------------------------------------------

const C = {
  terracotta: "#c45a3c",
  terracottaLight: "#f5e6e1",
  dark: "#1a1a1a",
  gray: "#6b7280",
  grayMed: "#9ca3af",
  grayLight: "#f3f4f6",
  grayBorder: "#e5e7eb",
  white: "#ffffff",
  green: "#16a34a",
  greenLight: "#dcfce7",
  greenBorder: "#bbf7d0",
  greenDark: "#166534",
  red: "#dc2626",
  redLight: "#fee2e2",
  redBorder: "#fecaca",
  redDark: "#991b1b",
  blue: "#2563eb",
  blueLight: "#dbeafe",
  blueBorder: "#bfdbfe",
  blueDark: "#1e40af",
  amber: "#d97706",
  amberLight: "#fef3c7",
  amberBorder: "#fde68a",
  amberDark: "#92400e",
  purple: "#8c3cc4",
  purpleLight: "#f3e8ff",
  teal: "#0d9488",
} as const;

// ---------------------------------------------------------------------------
// Shorthand
// ---------------------------------------------------------------------------

const el = React.createElement;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const sty = StyleSheet.create({
  // Page layouts
  page: {
    fontFamily: "Helvetica",
    fontSize: 9.5,
    color: C.dark,
    paddingTop: 55,
    paddingBottom: 55,
    paddingHorizontal: 45,
  },
  coverPage: {
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },

  // Cover
  coverBrand: {
    fontSize: 13,
    fontWeight: 700,
    color: C.terracotta,
    letterSpacing: 6,
    marginBottom: 40,
    textTransform: "uppercase",
  },
  coverBrandName: {
    fontSize: 38,
    fontWeight: 700,
    color: C.dark,
    marginBottom: 10,
    textAlign: "center",
  },
  coverSubtitle: {
    fontSize: 16,
    color: C.gray,
    marginBottom: 50,
    textAlign: "center",
  },
  coverDivider: {
    width: 80,
    height: 3,
    backgroundColor: C.terracotta,
    marginBottom: 35,
  },
  coverMeta: { fontSize: 10, color: C.gray, marginBottom: 6 },
  coverPowered: { fontSize: 8, color: C.grayMed, marginTop: 70 },

  // TOC
  tocTitle: { fontSize: 22, fontWeight: 700, color: C.dark, marginBottom: 25 },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  tocBadge: {
    width: 26,
    height: 26,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  tocBadgeText: { fontSize: 12, fontWeight: 700, color: C.white },
  tocItemTitle: { fontSize: 12, fontWeight: 700, color: C.dark },
  tocItemDesc: { fontSize: 8.5, color: C.gray, marginTop: 2 },

  // Pillar header
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
    paddingBottom: 12,
    borderBottomWidth: 2,
    borderBottomColor: C.grayLight,
  },
  pillarBadge: {
    width: 36,
    height: 36,
    borderRadius: 7,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  pillarBadgeText: { fontSize: 18, fontWeight: 700, color: C.white },
  pillarTitle: { fontSize: 20, fontWeight: 700, color: C.dark },
  pillarDesc: { fontSize: 9, color: C.gray, marginTop: 2 },

  // Summary box
  summaryBox: {
    backgroundColor: C.terracottaLight,
    borderRadius: 6,
    padding: 12,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 8,
    fontWeight: 700,
    color: C.terracotta,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryText: { fontSize: 9.5, color: C.dark, lineHeight: 1.55 },

  // Section headings
  sectionHeading: {
    fontSize: 13,
    fontWeight: 700,
    color: C.dark,
    marginTop: 16,
    marginBottom: 8,
  },
  subsectionHeading: {
    fontSize: 10.5,
    fontWeight: 700,
    color: C.gray,
    marginTop: 10,
    marginBottom: 5,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },

  // Generic text
  paragraph: { fontSize: 9.5, color: C.dark, lineHeight: 1.6, marginBottom: 6 },
  bulletItem: { flexDirection: "row", marginBottom: 4, paddingLeft: 4 },
  bulletDot: { fontSize: 9.5, color: C.terracotta, marginRight: 6, width: 8 },
  bulletText: { fontSize: 9.5, color: C.dark, lineHeight: 1.5, flex: 1 },

  // Score circle
  scoreCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  scoreValue: { fontSize: 20, fontWeight: 700 },
  scoreMax: { fontSize: 7, color: C.grayMed },
  scoreRow: { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  scoreLabel: { fontSize: 12, fontWeight: 700, color: C.dark },
  scoreSubLabel: { fontSize: 9, marginTop: 2 },
  scoreJustification: {
    fontSize: 8.5,
    color: C.gray,
    marginTop: 3,
    maxWidth: 380,
    lineHeight: 1.4,
  },

  // Cards
  card: {
    borderWidth: 1,
    borderColor: C.grayBorder,
    borderRadius: 6,
    padding: 10,
    marginBottom: 8,
  },
  cardTitle: { fontSize: 9, fontWeight: 700, color: C.dark, marginBottom: 4 },
  cardText: { fontSize: 8.5, color: C.gray, lineHeight: 1.4 },
  row2: { flexDirection: "row", gap: 8, marginBottom: 8 },
  row3: { flexDirection: "row", gap: 8, marginBottom: 8 },

  // SWOT
  swotCard: { flex: 1, borderRadius: 6, padding: 9, borderWidth: 1 },
  swotTitle: { fontSize: 9, fontWeight: 700, marginBottom: 5 },
  swotItem: { fontSize: 8, lineHeight: 1.4, marginBottom: 2 },

  // Table
  tableHeader: {
    flexDirection: "row",
    backgroundColor: C.grayLight,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 4,
    borderTopRightRadius: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.grayBorder,
  },
  tableHeaderText: {
    fontSize: 8,
    fontWeight: 700,
    color: C.gray,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  tableRow: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
  },
  tableRowAlt: {
    flexDirection: "row",
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.grayLight,
    backgroundColor: "#fafafa",
  },
  tableCell: { fontSize: 8.5, color: C.dark, lineHeight: 1.4 },

  // Key-value
  kvRow: {
    flexDirection: "row",
    marginBottom: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  kvRowAlt: {
    flexDirection: "row",
    marginBottom: 5,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: C.grayLight,
    borderRadius: 3,
  },
  kvKey: { fontSize: 9, fontWeight: 700, color: C.dark, width: "35%" },
  kvVal: { fontSize: 9, color: C.dark, width: "65%", lineHeight: 1.5 },

  // Badge
  badge: {
    fontSize: 7.5,
    fontWeight: 700,
    paddingHorizontal: 5,
    paddingVertical: 2,
    borderRadius: 3,
    color: C.white,
  },

  // TAM/SAM/SOM
  tamCard: {
    flex: 1,
    borderWidth: 1,
    borderColor: C.grayBorder,
    borderRadius: 6,
    padding: 10,
    alignItems: "center",
  },
  tamLabel: {
    fontSize: 7.5,
    fontWeight: 700,
    color: C.grayMed,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    marginBottom: 3,
  },
  tamValue: { fontSize: 14, fontWeight: 700, color: C.purple, marginBottom: 3 },
  tamDesc: {
    fontSize: 7.5,
    color: C.gray,
    textAlign: "center",
    lineHeight: 1.3,
  },

  // AARRR funnel
  funnelRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
    paddingVertical: 5,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  funnelLabel: { fontSize: 8.5, fontWeight: 700, width: 80 },
  funnelText: { fontSize: 8.5, color: C.dark, flex: 1, lineHeight: 1.4 },

  // Footer
  footer: {
    position: "absolute",
    bottom: 25,
    left: 45,
    right: 45,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: C.grayLight,
    paddingTop: 6,
  },
  footerText: { fontSize: 7.5, color: C.grayMed },
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

function getScoreColor(score: number): string {
  if (score >= 80) return C.green;
  if (score >= 60) return C.blue;
  if (score >= 40) return C.amber;
  return C.red;
}

function getScoreBorder(score: number): string {
  if (score >= 80) return C.greenBorder;
  if (score >= 60) return C.blueBorder;
  if (score >= 40) return C.amberBorder;
  return C.redBorder;
}

function getScoreLabel(score: number): string {
  if (score >= 80) return "Excellent";
  if (score >= 60) return "Bon";
  if (score >= 40) return "\u00C0 am\u00E9liorer";
  return "Critique";
}

function getRiskLabel(score: number): string {
  if (score <= 25) return "Risque faible";
  if (score <= 50) return "Risque mod\u00E9r\u00E9";
  if (score <= 75) return "Risque \u00E9lev\u00E9";
  return "Risque critique";
}

function getRiskColor(score: number): string {
  if (score <= 25) return C.green;
  if (score <= 50) return C.amber;
  if (score <= 75) return "#ea580c";
  return C.red;
}

// ---------------------------------------------------------------------------
// Reusable PDF sub-components
// ---------------------------------------------------------------------------

function PdfFooter(): React.ReactElement {
  return el(
    View,
    { style: sty.footer, fixed: true } as Record<string, unknown>,
    el(Text, { style: sty.footerText }, "G\u00E9n\u00E9r\u00E9 par ADVERTIS"),
    el(Text, {
      style: sty.footerText,
      render: ({ pageNumber }: { pageNumber: number }) =>
        `Page ${pageNumber}`,
    } as Record<string, unknown>)
  );
}

function PdfScoreCircle({
  score,
  label,
  justification,
  invertColor,
}: {
  score: number;
  label: string;
  justification?: string;
  invertColor?: boolean;
}): React.ReactElement {
  const color = invertColor ? getRiskColor(score) : getScoreColor(score);
  const border = invertColor ? getRiskColor(score) : getScoreBorder(score);
  const sub = invertColor ? getRiskLabel(score) : getScoreLabel(score);

  return el(
    View,
    { style: sty.scoreRow },
    el(
      View,
      { style: { ...sty.scoreCircle, borderColor: border } },
      el(Text, { style: { ...sty.scoreValue, color } }, String(score)),
      el(Text, { style: sty.scoreMax }, "/ 100")
    ),
    el(
      View,
      { style: { flex: 1 } },
      el(Text, { style: sty.scoreLabel }, label),
      el(Text, { style: { ...sty.scoreSubLabel, color } }, sub),
      justification
        ? el(Text, { style: sty.scoreJustification }, justification)
        : null
    )
  );
}

function PdfSwotGrid({
  swot,
}: {
  swot: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
}): React.ReactElement {
  const q = [
    { title: "Forces", items: swot.strengths, bg: C.greenLight, bd: C.greenBorder, fg: C.greenDark },
    { title: "Faiblesses", items: swot.weaknesses, bg: C.redLight, bd: C.redBorder, fg: C.redDark },
    { title: "Opportunit\u00E9s", items: swot.opportunities, bg: C.blueLight, bd: C.blueBorder, fg: C.blueDark },
    { title: "Menaces", items: swot.threats, bg: C.amberLight, bd: C.amberBorder, fg: C.amberDark },
  ];

  const renderRow = (pair: typeof q, offset: number) =>
    el(
      View,
      { key: `swot-row-${offset}`, style: sty.row2 },
      ...pair.map((item, i) =>
        el(
          View,
          {
            key: `swot-${offset + i}`,
            style: {
              ...sty.swotCard,
              backgroundColor: item.bg,
              borderColor: item.bd,
            },
          },
          el(
            Text,
            { style: { ...sty.swotTitle, color: item.fg } },
            item.title
          ),
          ...(item.items ?? []).map((txt, j) =>
            el(
              Text,
              {
                key: `swot-${offset + i}-${j}`,
                style: { ...sty.swotItem, color: item.fg },
              },
              `\u2022 ${txt}`
            )
          )
        )
      )
    );

  return el(View, null, renderRow(q.slice(0, 2), 0), renderRow(q.slice(2, 4), 2));
}

function PdfBulletList({
  items,
  color,
}: {
  items: string[];
  color?: string;
}): React.ReactElement {
  return el(
    View,
    null,
    ...items.map((item, i) =>
      el(
        View,
        { key: `bl-${i}`, style: sty.bulletItem },
        el(
          Text,
          { style: { ...sty.bulletDot, color: color ?? C.terracotta } },
          "\u2022"
        ),
        el(Text, { style: sty.bulletText }, item)
      )
    )
  );
}

// ---------------------------------------------------------------------------
// Generic text content renderer (for A, D, V, E, S pillars)
// ---------------------------------------------------------------------------

function renderTextContent(content: unknown): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  if (!content) return out;

  if (typeof content === "string") {
    const lines = content.split("\n");
    let idx = 0;
    for (const line of lines) {
      const t = line.trim();
      if (!t) { idx++; continue; }
      const clean = t.replace(/\*\*(.*?)\*\*/g, "$1");

      if (t.startsWith("## ")) {
        out.push(el(Text, { key: `t-${idx}`, style: sty.sectionHeading }, clean.replace(/^##\s*/, "")));
      } else if (t.startsWith("### ")) {
        out.push(el(Text, { key: `t-${idx}`, style: sty.subsectionHeading }, clean.replace(/^###\s*/, "")));
      } else if (t.startsWith("- ") || t.startsWith("\u2022 ")) {
        out.push(
          el(View, { key: `t-${idx}`, style: sty.bulletItem },
            el(Text, { style: sty.bulletDot }, "\u2022"),
            el(Text, { style: sty.bulletText }, clean.replace(/^[-\u2022]\s*/, ""))
          )
        );
      } else {
        out.push(el(Text, { key: `t-${idx}`, style: sty.paragraph }, clean));
      }
      idx++;
    }
    return out;
  }

  if (typeof content === "object" && !Array.isArray(content) && content !== null) {
    const obj = content as Record<string, unknown>;
    let idx = 0;
    for (const [key, value] of Object.entries(obj)) {
      if (value == null) continue;

      if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
        out.push(
          el(View, { key: `kv-${idx}`, style: idx % 2 === 0 ? sty.kvRow : sty.kvRowAlt },
            el(Text, { style: sty.kvKey }, `${formatKey(key)} :`),
            el(Text, { style: sty.kvVal }, String(value))
          )
        );
      } else if (Array.isArray(value)) {
        out.push(el(Text, { key: `sh-${idx}`, style: sty.sectionHeading }, formatKey(key)));
        for (const item of value) {
          if (typeof item === "string") {
            out.push(
              el(View, { key: `bl-${idx}-${String(Math.random()).slice(2, 8)}`, style: sty.bulletItem },
                el(Text, { style: sty.bulletDot }, "\u2022"),
                el(Text, { style: sty.bulletText }, item)
              )
            );
          } else if (typeof item === "object" && item !== null) {
            const nested = item as Record<string, unknown>;
            const entries = Object.entries(nested).filter(([, v]) => v != null);
            out.push(
              el(View, { key: `card-${idx}-${String(Math.random()).slice(2, 8)}`, style: sty.card },
                ...entries.map(([k, v], j) =>
                  el(View, { key: `ne-${j}`, style: { flexDirection: "row" as const, marginBottom: 2 } },
                    el(Text, { style: { ...sty.tableCell, fontWeight: 700, marginRight: 6 } }, `${formatKey(k)}:`),
                    el(Text, { style: sty.tableCell }, String(v))
                  )
                )
              )
            );
          }
        }
      } else if (typeof value === "object") {
        out.push(el(Text, { key: `sh-${idx}`, style: sty.sectionHeading }, formatKey(key)));
        out.push(...renderTextContent(value));
      }
      idx++;
    }
    return out;
  }

  // Fallback
  out.push(el(Text, { key: "fb", style: sty.paragraph }, JSON.stringify(content, null, 2)));
  return out;
}

// ---------------------------------------------------------------------------
// Risk (Pillar R) renderer
// ---------------------------------------------------------------------------

function renderRiskContent(content: unknown): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  if (!content || typeof content !== "object") return renderTextContent(content);

  const d = content as Partial<RiskAuditResult>;

  // Risk Score
  if (d.riskScore != null) {
    out.push(
      el(PdfScoreCircle, {
        key: "risk-sc",
        score: d.riskScore,
        label: "Score de risque",
        justification: d.riskScoreJustification,
        invertColor: true,
      })
    );
  }

  // Global SWOT
  if (d.globalSwot) {
    out.push(el(Text, { key: "swot-h", style: sty.sectionHeading }, "Analyse SWOT globale"));
    out.push(el(PdfSwotGrid, { key: "swot-g", swot: d.globalSwot }));
  }

  // Probability / Impact Matrix
  if (d.probabilityImpactMatrix?.length) {
    out.push(el(Text, { key: "pim-h", style: sty.sectionHeading }, "Matrice probabilit\u00E9 / impact"));
    out.push(
      el(View, { key: "pim-hd", style: sty.tableHeader },
        el(Text, { style: { ...sty.tableHeaderText, flex: 3 } }, "RISQUE"),
        el(Text, { style: { ...sty.tableHeaderText, flex: 1, textAlign: "center" as const } }, "PROB."),
        el(Text, { style: { ...sty.tableHeaderText, flex: 1, textAlign: "center" as const } }, "IMPACT"),
        el(Text, { style: { ...sty.tableHeaderText, flex: 1, textAlign: "center" as const } }, "PRI.")
      )
    );
    for (let i = 0; i < d.probabilityImpactMatrix.length; i++) {
      const r = d.probabilityImpactMatrix[i]!;
      out.push(
        el(View, { key: `pim-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
          el(Text, { style: { ...sty.tableCell, flex: 3 } }, r.risk),
          el(Text, { style: { ...sty.tableCell, flex: 1, textAlign: "center" as const } }, r.probability),
          el(Text, { style: { ...sty.tableCell, flex: 1, textAlign: "center" as const } }, r.impact),
          el(Text, { style: { ...sty.tableCell, flex: 1, textAlign: "center" as const, fontWeight: 700 } }, String(r.priority))
        )
      );
    }
  }

  // Mitigation priorities
  if (d.mitigationPriorities?.length) {
    out.push(el(Text, { key: "mit-h", style: sty.sectionHeading }, "Priorit\u00E9s de mitigation"));
    for (let i = 0; i < d.mitigationPriorities.length; i++) {
      const m = d.mitigationPriorities[i]!;
      out.push(
        el(View, { key: `mit-${i}`, style: sty.card },
          el(Text, { style: sty.cardTitle }, m.risk),
          el(Text, { style: sty.cardText }, `Action : ${m.action}`),
          el(Text, { style: { ...sty.cardText, marginTop: 2 } }, `Urgence : ${m.urgency} | Effort : ${m.effort}`)
        )
      );
    }
  }

  // Micro-SWOTs
  if (d.microSwots?.length) {
    out.push(el(Text, { key: "ms-h", style: sty.sectionHeading }, "Micro-SWOTs par variable"));
    for (let i = 0; i < d.microSwots.length; i++) {
      const ms = d.microSwots[i]!;
      const lc = ms.riskLevel === "low" ? C.green : ms.riskLevel === "medium" ? C.amber : C.red;
      out.push(
        el(View, { key: `ms-${i}`, style: { ...sty.card, borderLeftWidth: 3, borderLeftColor: lc } },
          el(View, { style: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 4 } },
            el(Text, { style: sty.cardTitle }, `${ms.variableId} \u2014 ${ms.variableLabel}`),
            el(Text, { style: { ...sty.badge, backgroundColor: lc } }, ms.riskLevel.toUpperCase())
          ),
          el(Text, { style: sty.cardText }, ms.commentary)
        )
      );
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// Track (Pillar T) renderer
// ---------------------------------------------------------------------------

function renderTrackContent(content: unknown): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  if (!content || typeof content !== "object") return renderTextContent(content);

  const d = content as Partial<TrackAuditResult>;

  // Brand-Market Fit Score
  if (d.brandMarketFitScore != null) {
    out.push(
      el(PdfScoreCircle, {
        key: "bmf-sc",
        score: d.brandMarketFitScore,
        label: "Brand-Market Fit",
        justification: d.brandMarketFitJustification,
      })
    );
  }

  // TAM/SAM/SOM
  if (d.tamSamSom) {
    out.push(el(Text, { key: "tam-h", style: sty.sectionHeading }, "Dimensionnement march\u00E9"));
    out.push(
      el(View, { key: "tam-r", style: sty.row3 },
        ...(["tam", "sam", "som"] as const).map((k) => {
          const item = d.tamSamSom![k];
          return el(View, { key: `tam-${k}`, style: sty.tamCard },
            el(Text, { style: sty.tamLabel }, k.toUpperCase()),
            el(Text, { style: sty.tamValue }, item?.value ?? "\u2013"),
            el(Text, { style: sty.tamDesc }, item?.description ?? "")
          );
        })
      )
    );
    if (d.tamSamSom.methodology) {
      out.push(el(Text, { key: "tam-m", style: { ...sty.paragraph, fontSize: 8, color: C.gray, marginTop: 4 } },
        `M\u00E9thodologie : ${d.tamSamSom.methodology}`));
    }
  }

  // Triangulation
  if (d.triangulation) {
    out.push(el(Text, { key: "tri-h", style: sty.sectionHeading }, "Triangulation des donn\u00E9es"));
    const entries: [string, string | undefined][] = [
      ["Donn\u00E9es internes", d.triangulation.internalData],
      ["Donn\u00E9es march\u00E9", d.triangulation.marketData],
      ["Donn\u00E9es clients", d.triangulation.customerData],
      ["Synth\u00E8se", d.triangulation.synthesis],
    ];
    for (let i = 0; i < entries.length; i++) {
      const [label, val] = entries[i]!;
      if (!val) continue;
      out.push(
        el(View, { key: `tri-${i}`, style: i % 2 === 0 ? sty.kvRow : sty.kvRowAlt },
          el(Text, { style: sty.kvKey }, `${label} :`),
          el(Text, { style: sty.kvVal }, val)
        )
      );
    }
  }

  // Competitive Benchmark
  if (d.competitiveBenchmark?.length) {
    out.push(el(Text, { key: "bch-h", style: sty.sectionHeading }, "Benchmark concurrentiel"));
    for (let i = 0; i < d.competitiveBenchmark.length; i++) {
      const comp = d.competitiveBenchmark[i]!;
      out.push(
        el(View, { key: `bch-${i}`, style: sty.card },
          el(View, { style: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 4 } },
            el(Text, { style: sty.cardTitle }, comp.competitor),
            comp.marketShare ? el(Text, { style: { ...sty.cardText, fontWeight: 700 } }, comp.marketShare) : null
          ),
          comp.strengths?.length
            ? el(Text, { style: { ...sty.cardText, color: C.green } }, `Forces : ${comp.strengths.join(", ")}`)
            : null,
          comp.weaknesses?.length
            ? el(Text, { style: { ...sty.cardText, color: C.red, marginTop: 2 } }, `Faiblesses : ${comp.weaknesses.join(", ")}`)
            : null
        )
      );
    }
  }

  // Market Reality
  if (d.marketReality) {
    if (d.marketReality.macroTrends?.length) {
      out.push(el(Text, { key: "mt-h", style: sty.sectionHeading }, "Tendances macro"));
      out.push(el(PdfBulletList, { key: "mt-l", items: d.marketReality.macroTrends, color: C.purple }));
    }
    if (d.marketReality.weakSignals?.length) {
      out.push(el(Text, { key: "ws-h", style: sty.subsectionHeading }, "Signaux faibles"));
      out.push(el(PdfBulletList, { key: "ws-l", items: d.marketReality.weakSignals, color: C.amber }));
    }
    if (d.marketReality.emergingPatterns?.length) {
      out.push(el(Text, { key: "ep-h", style: sty.subsectionHeading }, "Patterns \u00E9mergents"));
      out.push(el(PdfBulletList, { key: "ep-l", items: d.marketReality.emergingPatterns, color: C.teal }));
    }
  }

  // Hypothesis Validation
  if (d.hypothesisValidation?.length) {
    out.push(el(Text, { key: "hyp-h", style: sty.sectionHeading }, "Validation des hypoth\u00E8ses"));
    out.push(
      el(View, { key: "hyp-hd", style: sty.tableHeader },
        el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "VAR."),
        el(Text, { style: { ...sty.tableHeaderText, flex: 3 } }, "HYPOTH\u00C8SE"),
        el(Text, { style: { ...sty.tableHeaderText, flex: 1, textAlign: "center" as const } }, "STATUT"),
        el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "\u00C9VIDENCE")
      )
    );
    for (let i = 0; i < d.hypothesisValidation.length; i++) {
      const h = d.hypothesisValidation[i]!;
      const sc = h.status === "validated" ? C.green : h.status === "invalidated" ? C.red : C.amber;
      out.push(
        el(View, { key: `hyp-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
          el(Text, { style: { ...sty.tableCell, flex: 1, fontWeight: 700 } }, h.variableId),
          el(Text, { style: { ...sty.tableCell, flex: 3 } }, h.hypothesis),
          el(Text, { style: { ...sty.tableCell, flex: 1, textAlign: "center" as const, color: sc, fontWeight: 700 } }, h.status),
          el(Text, { style: { ...sty.tableCell, flex: 2 } }, h.evidence)
        )
      );
    }
  }

  // Strategic Recommendations
  if (d.strategicRecommendations?.length) {
    out.push(el(Text, { key: "rec-h", style: sty.sectionHeading }, "Recommandations strat\u00E9giques"));
    out.push(el(PdfBulletList, { key: "rec-l", items: d.strategicRecommendations, color: C.purple }));
  }

  return out;
}

// ---------------------------------------------------------------------------
// Implementation (Pillar I) renderer
// ---------------------------------------------------------------------------

function renderImplementationContent(content: unknown): React.ReactElement[] {
  const out: React.ReactElement[] = [];
  if (!content || typeof content !== "object") return renderTextContent(content);

  const d = content as Partial<ImplementationData>;

  // Executive Summary
  if (d.executiveSummary) {
    out.push(
      el(View, { key: "exec", style: sty.summaryBox },
        el(Text, { style: sty.summaryLabel }, "Synth\u00E8se ex\u00E9cutive"),
        el(Text, { style: sty.summaryText }, d.executiveSummary)
      )
    );
  }

  // Coherence Score
  if (d.coherenceScore != null) {
    out.push(el(PdfScoreCircle, { key: "coh", score: d.coherenceScore, label: "Score de coh\u00E9rence" }));
  }

  // Brand Identity
  if (d.brandIdentity) {
    out.push(el(Text, { key: "bi-h", style: sty.sectionHeading }, "Identit\u00E9 de marque"));
    const entries: [string, string][] = [
      ["Arch\u00E9type", d.brandIdentity.archetype],
      ["Purpose", d.brandIdentity.purpose],
      ["Vision", d.brandIdentity.vision],
      ["Narrative", d.brandIdentity.narrative],
    ].filter(([, v]) => !!v) as [string, string][];
    for (let i = 0; i < entries.length; i++) {
      out.push(
        el(View, { key: `bi-${i}`, style: i % 2 === 0 ? sty.kvRow : sty.kvRowAlt },
          el(Text, { style: sty.kvKey }, `${entries[i]![0]} :`),
          el(Text, { style: sty.kvVal }, entries[i]![1])
        )
      );
    }
    if (d.brandIdentity.values?.length) {
      out.push(el(Text, { key: "bi-v-h", style: sty.subsectionHeading }, "Valeurs"));
      out.push(el(PdfBulletList, { key: "bi-v-l", items: d.brandIdentity.values }));
    }
  }

  // Positioning
  if (d.positioning) {
    out.push(el(Text, { key: "pos-h", style: sty.sectionHeading }, "Positionnement"));

    if (d.positioning.statement) {
      out.push(
        el(View, { key: "pos-s", style: { ...sty.card, backgroundColor: C.grayLight, borderColor: C.grayBorder } },
          el(Text, { style: { ...sty.cardText, fontStyle: "italic" as const } }, d.positioning.statement)
        )
      );
    }
    if (d.positioning.differentiators?.length) {
      out.push(el(Text, { key: "pos-d-h", style: sty.subsectionHeading }, "Diff\u00E9renciateurs"));
      out.push(el(PdfBulletList, { key: "pos-d", items: d.positioning.differentiators }));
    }
    if (d.positioning.toneOfVoice) {
      out.push(
        el(View, { key: "pos-t", style: sty.kvRow },
          el(Text, { style: sty.kvKey }, "Ton de voix :"),
          el(Text, { style: sty.kvVal }, d.positioning.toneOfVoice)
        )
      );
    }

    // Personas
    if (d.positioning.personas?.length) {
      out.push(el(Text, { key: "per-h", style: sty.subsectionHeading }, "Personas"));
      for (let i = 0; i < d.positioning.personas.length; i++) {
        const p = d.positioning.personas[i]!;
        out.push(
          el(View, { key: `per-${i}`, style: sty.card },
            el(View, { style: { flexDirection: "row" as const, justifyContent: "space-between" as const } },
              el(Text, { style: sty.cardTitle }, p.name),
              el(Text, { style: { ...sty.badge, backgroundColor: C.terracotta } }, `P${p.priority}`)
            ),
            el(Text, { style: sty.cardText }, p.description)
          )
        );
      }
    }

    // Competitors
    if (d.positioning.competitors?.length) {
      out.push(el(Text, { key: "cmp-h", style: sty.subsectionHeading }, "Concurrents"));
      out.push(
        el(View, { key: "cmp-hd", style: sty.tableHeader },
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "NOM"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "POSITION")
        )
      );
      for (let i = 0; i < d.positioning.competitors.length; i++) {
        const c = d.positioning.competitors[i]!;
        out.push(
          el(View, { key: `cmp-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
            el(Text, { style: { ...sty.tableCell, flex: 1, fontWeight: 700 } }, c.name),
            el(Text, { style: { ...sty.tableCell, flex: 2 } }, c.position)
          )
        );
      }
    }
  }

  // Value Architecture
  if (d.valueArchitecture) {
    out.push(el(Text, { key: "va-h", style: sty.sectionHeading }, "Architecture de valeur"));

    if (d.valueArchitecture.valueProposition) {
      out.push(
        el(View, { key: "va-vp", style: sty.kvRow },
          el(Text, { style: sty.kvKey }, "Proposition de valeur :"),
          el(Text, { style: sty.kvVal }, d.valueArchitecture.valueProposition)
        )
      );
    }

    // Product Ladder
    if (d.valueArchitecture.productLadder?.length) {
      out.push(el(Text, { key: "pl-h", style: sty.subsectionHeading }, "\u00C9chelle produit"));
      out.push(
        el(View, { key: "pl-hd", style: sty.tableHeader },
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "PALIER"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "PRIX"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "DESCRIPTION")
        )
      );
      for (let i = 0; i < d.valueArchitecture.productLadder.length; i++) {
        const t = d.valueArchitecture.productLadder[i]!;
        out.push(
          el(View, { key: `pl-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
            el(Text, { style: { ...sty.tableCell, flex: 1, fontWeight: 700 } }, t.tier),
            el(Text, { style: { ...sty.tableCell, flex: 1, color: C.terracotta, fontWeight: 700 } }, t.price),
            el(Text, { style: { ...sty.tableCell, flex: 2 } }, t.description)
          )
        );
      }
    }

    // Unit Economics
    if (d.valueArchitecture.unitEconomics) {
      const ue = d.valueArchitecture.unitEconomics;
      out.push(el(Text, { key: "ue-h", style: sty.subsectionHeading }, "Unit Economics"));
      out.push(
        el(View, { key: "ue-r", style: sty.row3 },
          el(View, { key: "ue-cac", style: sty.tamCard },
            el(Text, { style: sty.tamLabel }, "CAC"),
            el(Text, { style: { ...sty.tamValue, color: C.terracotta } }, ue.cac)
          ),
          el(View, { key: "ue-ltv", style: sty.tamCard },
            el(Text, { style: sty.tamLabel }, "LTV"),
            el(Text, { style: { ...sty.tamValue, color: C.green } }, ue.ltv)
          ),
          el(View, { key: "ue-ratio", style: sty.tamCard },
            el(Text, { style: sty.tamLabel }, "RATIO"),
            el(Text, { style: { ...sty.tamValue, color: C.blue } }, ue.ratio)
          )
        )
      );
      if (ue.notes) {
        out.push(el(Text, { key: "ue-n", style: { ...sty.paragraph, fontSize: 8, color: C.gray } }, ue.notes));
      }
    }
  }

  // Engagement Strategy
  if (d.engagementStrategy) {
    out.push(el(Text, { key: "eng-h", style: sty.sectionHeading }, "Strat\u00E9gie d'engagement"));

    // AARRR Funnel
    if (d.engagementStrategy.aarrr) {
      out.push(el(Text, { key: "aa-h", style: sty.subsectionHeading }, "Funnel AARRR"));
      const steps = [
        { label: "Acquisition", value: d.engagementStrategy.aarrr.acquisition, bg: "#dbeafe" },
        { label: "Activation", value: d.engagementStrategy.aarrr.activation, bg: "#dcfce7" },
        { label: "R\u00E9tention", value: d.engagementStrategy.aarrr.retention, bg: "#fef3c7" },
        { label: "Revenue", value: d.engagementStrategy.aarrr.revenue, bg: "#fce7f3" },
        { label: "Referral", value: d.engagementStrategy.aarrr.referral, bg: "#f3e8ff" },
      ];
      for (let i = 0; i < steps.length; i++) {
        const st = steps[i]!;
        out.push(
          el(View, { key: `aa-${i}`, style: { ...sty.funnelRow, backgroundColor: st.bg } },
            el(Text, { style: sty.funnelLabel }, st.label),
            el(Text, { style: sty.funnelText }, st.value)
          )
        );
      }
    }

    // KPIs
    if (d.engagementStrategy.kpis?.length) {
      out.push(el(Text, { key: "kpi-h", style: sty.subsectionHeading }, "KPIs"));
      out.push(
        el(View, { key: "kpi-hd", style: sty.tableHeader },
          el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "INDICATEUR"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "OBJECTIF"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "FR\u00C9QUENCE")
        )
      );
      for (let i = 0; i < d.engagementStrategy.kpis.length; i++) {
        const k = d.engagementStrategy.kpis[i]!;
        out.push(
          el(View, { key: `kpi-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
            el(Text, { style: { ...sty.tableCell, flex: 2, fontWeight: 700 } }, k.name),
            el(Text, { style: { ...sty.tableCell, flex: 1 } }, k.target),
            el(Text, { style: { ...sty.tableCell, flex: 1 } }, k.frequency)
          )
        );
      }
    }

    // Touchpoints
    if (d.engagementStrategy.touchpoints?.length) {
      out.push(el(Text, { key: "tp-h", style: sty.subsectionHeading }, "Points de contact"));
      out.push(
        el(View, { key: "tp-hd", style: sty.tableHeader },
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "CANAL"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "R\u00D4LE"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 1, textAlign: "center" as const } }, "PRI.")
        )
      );
      for (let i = 0; i < d.engagementStrategy.touchpoints.length; i++) {
        const tp = d.engagementStrategy.touchpoints[i]!;
        out.push(
          el(View, { key: `tp-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
            el(Text, { style: { ...sty.tableCell, flex: 1, fontWeight: 700 } }, tp.channel),
            el(Text, { style: { ...sty.tableCell, flex: 2 } }, tp.role),
            el(Text, { style: { ...sty.tableCell, flex: 1, textAlign: "center" as const } }, `P${tp.priority}`)
          )
        );
      }
    }

    // Rituals
    if (d.engagementStrategy.rituals?.length) {
      out.push(el(Text, { key: "rit-h", style: sty.subsectionHeading }, "Rituels de marque"));
      for (let i = 0; i < d.engagementStrategy.rituals.length; i++) {
        const r = d.engagementStrategy.rituals[i]!;
        out.push(
          el(View, { key: `rit-${i}`, style: sty.card },
            el(View, { style: { flexDirection: "row" as const, justifyContent: "space-between" as const, marginBottom: 3 } },
              el(Text, { style: sty.cardTitle }, r.name),
              el(Text, { style: { ...sty.badge, backgroundColor: C.blue } }, r.frequency)
            ),
            el(Text, { style: sty.cardText }, r.description)
          )
        );
      }
    }
  }

  // Risk Synthesis
  if (d.riskSynthesis) {
    out.push(el(Text, { key: "rs-h", style: sty.sectionHeading }, "Synth\u00E8se des risques"));
    if (d.riskSynthesis.riskScore != null) {
      out.push(el(PdfScoreCircle, { key: "rs-sc", score: d.riskSynthesis.riskScore, label: "Score de risque global", invertColor: true }));
    }
    if (d.riskSynthesis.globalSwot) {
      out.push(el(PdfSwotGrid, { key: "rs-sw", swot: d.riskSynthesis.globalSwot }));
    }
    if (d.riskSynthesis.topRisks?.length) {
      out.push(el(Text, { key: "rs-tr-h", style: sty.subsectionHeading }, "Risques prioritaires"));
      for (let i = 0; i < d.riskSynthesis.topRisks.length; i++) {
        const r = d.riskSynthesis.topRisks[i]!;
        out.push(
          el(View, { key: `rs-tr-${i}`, style: { ...sty.card, borderLeftWidth: 3, borderLeftColor: C.red } },
            el(Text, { style: sty.cardTitle }, r.risk),
            el(Text, { style: sty.cardText }, `Impact : ${r.impact}`),
            el(Text, { style: { ...sty.cardText, color: C.green, marginTop: 2 } }, `Mitigation : ${r.mitigation}`)
          )
        );
      }
    }
  }

  // Market Validation
  if (d.marketValidation) {
    out.push(el(Text, { key: "mv-h", style: sty.sectionHeading }, "Validation march\u00E9"));
    if (d.marketValidation.brandMarketFitScore != null) {
      out.push(el(PdfScoreCircle, { key: "mv-sc", score: d.marketValidation.brandMarketFitScore, label: "Brand-Market Fit" }));
    }
    if (d.marketValidation.tam || d.marketValidation.sam || d.marketValidation.som) {
      out.push(
        el(View, { key: "mv-t", style: sty.row3 },
          el(View, { style: sty.tamCard }, el(Text, { style: sty.tamLabel }, "TAM"), el(Text, { style: sty.tamValue }, d.marketValidation.tam ?? "\u2013")),
          el(View, { style: sty.tamCard }, el(Text, { style: sty.tamLabel }, "SAM"), el(Text, { style: sty.tamValue }, d.marketValidation.sam ?? "\u2013")),
          el(View, { style: sty.tamCard }, el(Text, { style: sty.tamLabel }, "SOM"), el(Text, { style: sty.tamValue }, d.marketValidation.som ?? "\u2013"))
        )
      );
    }
    if (d.marketValidation.trends?.length) {
      out.push(el(Text, { key: "mv-tr-h", style: sty.subsectionHeading }, "Tendances"));
      out.push(el(PdfBulletList, { key: "mv-tr", items: d.marketValidation.trends, color: C.purple }));
    }
    if (d.marketValidation.recommendations?.length) {
      out.push(el(Text, { key: "mv-rc-h", style: sty.subsectionHeading }, "Recommandations"));
      out.push(el(PdfBulletList, { key: "mv-rc", items: d.marketValidation.recommendations }));
    }
  }

  // Strategic Roadmap
  if (d.strategicRoadmap) {
    out.push(el(Text, { key: "rd-h", style: sty.sectionHeading }, "Roadmap strat\u00E9gique"));

    if (d.strategicRoadmap.sprint90Days?.length) {
      out.push(el(Text, { key: "sp-h", style: sty.subsectionHeading }, "Sprint 90 jours"));
      out.push(
        el(View, { key: "sp-hd", style: sty.tableHeader },
          el(Text, { style: { ...sty.tableHeaderText, flex: 3 } }, "ACTION"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 1 } }, "OWNER"),
          el(Text, { style: { ...sty.tableHeaderText, flex: 2 } }, "KPI")
        )
      );
      for (let i = 0; i < d.strategicRoadmap.sprint90Days.length; i++) {
        const sp = d.strategicRoadmap.sprint90Days[i]!;
        out.push(
          el(View, { key: `sp-${i}`, style: i % 2 === 0 ? sty.tableRow : sty.tableRowAlt },
            el(Text, { style: { ...sty.tableCell, flex: 3 } }, sp.action),
            el(Text, { style: { ...sty.tableCell, flex: 1 } }, sp.owner),
            el(Text, { style: { ...sty.tableCell, flex: 2 } }, sp.kpi)
          )
        );
      }
    }
    if (d.strategicRoadmap.year1Priorities?.length) {
      out.push(el(Text, { key: "y1-h", style: sty.subsectionHeading }, "Priorit\u00E9s ann\u00E9e 1"));
      out.push(el(PdfBulletList, { key: "y1-l", items: d.strategicRoadmap.year1Priorities }));
    }
    if (d.strategicRoadmap.year3Vision) {
      out.push(el(Text, { key: "y3-h", style: sty.subsectionHeading }, "Vision 3 ans"));
      out.push(el(Text, { key: "y3-t", style: sty.paragraph }, d.strategicRoadmap.year3Vision));
    }
  }

  return out;
}

// ---------------------------------------------------------------------------
// PDF Page Components
// ---------------------------------------------------------------------------

function CoverPage({ strategy }: { strategy: StrategyData }): React.ReactElement {
  return el(
    Page,
    { size: "A4", style: sty.coverPage },
    el(Text, { style: sty.coverBrand }, "ADVERTIS"),
    el(
      View,
      { style: { alignItems: "center" as const } },
      el(Text, { style: sty.coverBrandName }, strategy.brandName),
      el(Text, { style: sty.coverSubtitle }, strategy.name),
      el(View, { style: sty.coverDivider }),
      strategy.sector
        ? el(Text, { style: sty.coverMeta }, `Secteur : ${strategy.sector}`)
        : null,
      strategy.coherenceScore != null
        ? el(Text, { style: sty.coverMeta }, `Score de coh\u00E9rence : ${strategy.coherenceScore}/100`)
        : null,
      el(Text, { style: sty.coverMeta }, formatDate(strategy.createdAt)),
      el(Text, { style: sty.coverPowered }, "Powered by ADVERTIS")
    )
  );
}

function TableOfContents({ pillars }: { pillars: PillarData[] }): React.ReactElement {
  return el(
    Page,
    { size: "A4", style: sty.page },
    el(Text, { style: sty.tocTitle }, "Table des mati\u00E8res"),
    ...pillars.map((pillar, i) => {
      const config = PILLAR_CONFIG[pillar.type as PillarType];
      const color = config?.color ?? C.terracotta;
      return el(
        View,
        { key: `toc-${i}`, style: sty.tocItem },
        el(View, { style: { ...sty.tocBadge, backgroundColor: color } },
          el(Text, { style: sty.tocBadgeText }, pillar.type)
        ),
        el(View, { style: { flex: 1 } },
          el(Text, { style: sty.tocItemTitle }, `${pillar.type} \u2013 ${config?.title ?? pillar.title}`),
          el(Text, { style: sty.tocItemDesc }, config?.description ?? "")
        )
      );
    }),
    el(PdfFooter, { key: "toc-ft" })
  );
}

function PillarPage({ pillar }: { pillar: PillarData }): React.ReactElement {
  const config = PILLAR_CONFIG[pillar.type as PillarType];
  const color = config?.color ?? C.terracotta;

  // Choose renderer based on pillar type
  let contentElements: React.ReactElement[];
  switch (pillar.type) {
    case "R":
      contentElements = renderRiskContent(pillar.content);
      break;
    case "T":
      contentElements = renderTrackContent(pillar.content);
      break;
    case "I":
      contentElements = renderImplementationContent(pillar.content);
      break;
    default:
      contentElements = renderTextContent(pillar.content);
      break;
  }

  return el(
    Page,
    { size: "A4", style: sty.page, wrap: true } as Record<string, unknown>,
    // Header
    el(
      View,
      { style: { ...sty.pillarHeader, borderBottomColor: color } },
      el(View, { style: { ...sty.pillarBadge, backgroundColor: color } },
        el(Text, { style: sty.pillarBadgeText }, pillar.type)
      ),
      el(View, { style: { flex: 1 } },
        el(Text, { style: sty.pillarTitle }, config?.title ?? pillar.title),
        el(Text, { style: sty.pillarDesc }, config?.description ?? "")
      )
    ),
    // Summary
    pillar.summary
      ? el(View, { style: sty.summaryBox },
          el(Text, { style: sty.summaryLabel }, "Synth\u00E8se"),
          el(Text, { style: sty.summaryText }, pillar.summary)
        )
      : null,
    // Content
    ...contentElements,
    // Footer
    el(PdfFooter, { key: `ft-${pillar.type}` })
  );
}

// ---------------------------------------------------------------------------
// Main PDF Generator
// ---------------------------------------------------------------------------

export async function generateStrategyPDF(
  strategy: StrategyData,
  pillars: PillarData[],
  options?: PDFOptions
): Promise<Buffer> {
  const includeCover = options?.includeCover ?? true;
  const selectedPillars = options?.selectedPillars;

  // Filter and sort pillars
  const filteredPillars = selectedPillars
    ? pillars.filter((p) => selectedPillars.includes(p.type))
    : pillars;

  const sortedPillars = [...filteredPillars].sort((a, b) => {
    const orderA = PILLAR_CONFIG[a.type as PillarType]?.order ?? 99;
    const orderB = PILLAR_CONFIG[b.type as PillarType]?.order ?? 99;
    return orderA - orderB;
  });

  // Build document pages
  const pages: React.ReactElement[] = [];

  if (includeCover) {
    pages.push(el(CoverPage, { key: "cover", strategy }));
  }

  if (sortedPillars.length > 1) {
    pages.push(el(TableOfContents, { key: "toc", pillars: sortedPillars }));
  }

  for (const pillar of sortedPillars) {
    pages.push(el(PillarPage, { key: `pillar-${pillar.type}`, pillar }));
  }

  // Create and render Document
  const doc = el(
    Document,
    {
      title: `ADVERTIS \u2013 ${strategy.brandName} \u2013 ${strategy.name}`,
      author: "ADVERTIS",
      subject: `Strat\u00E9gie de marque ${strategy.brandName}`,
      creator: "ADVERTIS SaaS Platform",
    },
    ...pages
  );

  const buffer = await renderToBuffer(doc);
  return Buffer.from(buffer);
}
