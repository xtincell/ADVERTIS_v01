// ADVERTIS PDF Generator Service
// Server-side PDF generation using @react-pdf/renderer

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
// Register Fonts (Helvetica is built-in, use it as fallback)
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

const COLORS = {
  terracotta: "#c45a3c",
  terracottaLight: "#f5e6e1",
  dark: "#1a1a1a",
  gray: "#6b7280",
  grayLight: "#f3f4f6",
  white: "#ffffff",
} as const;

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 10,
    color: COLORS.dark,
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 50,
  },
  // Cover page
  coverPage: {
    fontFamily: "Helvetica",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
    padding: 50,
  },
  coverBrand: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.terracotta,
    letterSpacing: 6,
    marginBottom: 40,
    textTransform: "uppercase",
  },
  coverBrandName: {
    fontSize: 42,
    fontWeight: 700,
    color: COLORS.dark,
    marginBottom: 12,
    textAlign: "center",
  },
  coverStrategyName: {
    fontSize: 18,
    color: COLORS.gray,
    marginBottom: 60,
    textAlign: "center",
  },
  coverDivider: {
    width: 80,
    height: 3,
    backgroundColor: COLORS.terracotta,
    marginBottom: 40,
  },
  coverDate: {
    fontSize: 11,
    color: COLORS.gray,
    marginBottom: 8,
  },
  coverPowered: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 80,
  },
  // Table of contents
  tocTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: COLORS.dark,
    marginBottom: 30,
  },
  tocItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.grayLight,
  },
  tocBadge: {
    width: 28,
    height: 28,
    borderRadius: 6,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 14,
  },
  tocBadgeText: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.white,
  },
  tocItemTitle: {
    fontSize: 13,
    fontWeight: 700,
    color: COLORS.dark,
    flex: 1,
  },
  tocItemDescription: {
    fontSize: 9,
    color: COLORS.gray,
    marginTop: 2,
  },
  // Pillar section
  pillarHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    paddingBottom: 14,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.grayLight,
  },
  pillarBadge: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 16,
  },
  pillarBadgeText: {
    fontSize: 20,
    fontWeight: 700,
    color: COLORS.white,
  },
  pillarTitleBlock: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 22,
    fontWeight: 700,
    color: COLORS.dark,
  },
  pillarDescription: {
    fontSize: 10,
    color: COLORS.gray,
    marginTop: 3,
  },
  // Content
  sectionTitle: {
    fontSize: 14,
    fontWeight: 700,
    color: COLORS.dark,
    marginTop: 18,
    marginBottom: 8,
  },
  paragraph: {
    fontSize: 10,
    color: COLORS.dark,
    lineHeight: 1.6,
    marginBottom: 8,
  },
  keyValueRow: {
    flexDirection: "row",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  keyValueRowAlt: {
    flexDirection: "row",
    marginBottom: 6,
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: COLORS.grayLight,
    borderRadius: 3,
  },
  keyLabel: {
    fontSize: 10,
    fontWeight: 700,
    color: COLORS.dark,
    width: "35%",
  },
  keyValue: {
    fontSize: 10,
    color: COLORS.dark,
    width: "65%",
    lineHeight: 1.5,
  },
  // Footer
  footer: {
    position: "absolute",
    bottom: 30,
    left: 50,
    right: 50,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderTopWidth: 1,
    borderTopColor: COLORS.grayLight,
    paddingTop: 8,
  },
  footerText: {
    fontSize: 8,
    color: COLORS.gray,
  },
  footerPage: {
    fontSize: 8,
    color: COLORS.gray,
  },
  // Summary block
  summaryBox: {
    backgroundColor: COLORS.terracottaLight,
    borderRadius: 6,
    padding: 14,
    marginBottom: 16,
  },
  summaryLabel: {
    fontSize: 9,
    fontWeight: 700,
    color: COLORS.terracotta,
    marginBottom: 4,
    textTransform: "uppercase",
    letterSpacing: 1,
  },
  summaryText: {
    fontSize: 10,
    color: COLORS.dark,
    lineHeight: 1.5,
  },
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

/**
 * Extracts readable text content from pillar JSON content.
 * Content can be a string, an object with key-value pairs, or nested structure.
 */
function parseContent(content: unknown): Array<{
  type: "text" | "keyValue" | "section";
  key?: string;
  value: string;
}> {
  const blocks: Array<{
    type: "text" | "keyValue" | "section";
    key?: string;
    value: string;
  }> = [];

  if (!content) return blocks;

  if (typeof content === "string") {
    // Split by double newlines for paragraphs
    const paragraphs = content.split(/\n\n+/).filter(Boolean);
    for (const p of paragraphs) {
      blocks.push({ type: "text", value: p.trim() });
    }
    return blocks;
  }

  if (typeof content === "object" && !Array.isArray(content)) {
    const obj = content as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      if (value === null || value === undefined) continue;

      if (typeof value === "string") {
        blocks.push({ type: "keyValue", key: formatKey(key), value });
      } else if (typeof value === "number" || typeof value === "boolean") {
        blocks.push({
          type: "keyValue",
          key: formatKey(key),
          value: String(value),
        });
      } else if (Array.isArray(value)) {
        blocks.push({ type: "section", key: formatKey(key), value: "" });
        for (const item of value) {
          if (typeof item === "string") {
            blocks.push({ type: "text", value: `  - ${item}` });
          } else if (typeof item === "object" && item !== null) {
            blocks.push({ type: "text", value: JSON.stringify(item, null, 2) });
          }
        }
      } else if (typeof value === "object") {
        blocks.push({ type: "section", key: formatKey(key), value: "" });
        const nested = parseContent(value);
        blocks.push(...nested);
      }
    }
    return blocks;
  }

  if (Array.isArray(content)) {
    for (const item of content) {
      if (typeof item === "string") {
        blocks.push({ type: "text", value: item });
      } else {
        const nested = parseContent(item);
        blocks.push(...nested);
      }
    }
    return blocks;
  }

  // Fallback: stringify
  blocks.push({ type: "text", value: JSON.stringify(content, null, 2) });
  return blocks;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// PDF Components
// ---------------------------------------------------------------------------

function CoverPage({
  strategy,
}: {
  strategy: StrategyData;
}): React.ReactElement {
  return React.createElement(
    Page,
    { size: "A4", style: styles.coverPage },
    React.createElement(Text, { style: styles.coverBrand }, "ADVERTIS"),
    React.createElement(
      View,
      { style: { alignItems: "center" } },
      React.createElement(
        Text,
        { style: styles.coverBrandName },
        strategy.brandName
      ),
      React.createElement(
        Text,
        { style: styles.coverStrategyName },
        strategy.name
      ),
      React.createElement(View, { style: styles.coverDivider }),
      strategy.sector
        ? React.createElement(
            Text,
            { style: styles.coverDate },
            `Secteur : ${strategy.sector}`
          )
        : null,
      strategy.coherenceScore !== undefined && strategy.coherenceScore !== null
        ? React.createElement(
            Text,
            { style: styles.coverDate },
            `Score de coh\u00e9rence : ${strategy.coherenceScore}/100`
          )
        : null,
      React.createElement(
        Text,
        { style: styles.coverDate },
        formatDate(strategy.createdAt)
      ),
      React.createElement(
        Text,
        { style: styles.coverPowered },
        "Powered by ADVERTIS"
      )
    )
  );
}

function TableOfContents({
  pillars,
}: {
  pillars: PillarData[];
}): React.ReactElement {
  return React.createElement(
    Page,
    { size: "A4", style: styles.page },
    React.createElement(
      Text,
      { style: styles.tocTitle },
      "Table des mati\u00e8res"
    ),
    ...pillars.map((pillar, index) => {
      const config = PILLAR_CONFIG[pillar.type as PillarType];
      const color = config?.color ?? COLORS.terracotta;
      return React.createElement(
        View,
        { key: `toc-${index}`, style: styles.tocItem },
        React.createElement(
          View,
          {
            style: { ...styles.tocBadge, backgroundColor: color },
          },
          React.createElement(
            Text,
            { style: styles.tocBadgeText },
            pillar.type
          )
        ),
        React.createElement(
          View,
          { style: { flex: 1 } },
          React.createElement(
            Text,
            { style: styles.tocItemTitle },
            `${pillar.type} - ${config?.title ?? pillar.title}`
          ),
          React.createElement(
            Text,
            { style: styles.tocItemDescription },
            config?.description ?? ""
          )
        )
      );
    }),
    React.createElement(
      View,
      { style: styles.footer, fixed: true } as Record<string, unknown>,
      React.createElement(
        Text,
        { style: styles.footerText },
        "G\u00e9n\u00e9r\u00e9 par ADVERTIS"
      ),
      React.createElement(
        Text,
        {
          style: styles.footerPage,
          render: ({ pageNumber }: { pageNumber: number }) =>
            `Page ${pageNumber}`,
        } as Record<string, unknown>
      )
    )
  );
}

function PillarPage({
  pillar,
}: {
  pillar: PillarData;
}): React.ReactElement {
  const config = PILLAR_CONFIG[pillar.type as PillarType];
  const color = config?.color ?? COLORS.terracotta;
  const contentBlocks = parseContent(pillar.content);

  return React.createElement(
    Page,
    { size: "A4", style: styles.page },
    // Header
    React.createElement(
      View,
      { style: { ...styles.pillarHeader, borderBottomColor: color } },
      React.createElement(
        View,
        {
          style: { ...styles.pillarBadge, backgroundColor: color },
        },
        React.createElement(
          Text,
          { style: styles.pillarBadgeText },
          pillar.type
        )
      ),
      React.createElement(
        View,
        { style: styles.pillarTitleBlock },
        React.createElement(
          Text,
          { style: styles.pillarTitle },
          config?.title ?? pillar.title
        ),
        React.createElement(
          Text,
          { style: styles.pillarDescription },
          config?.description ?? ""
        )
      )
    ),
    // Summary block (if available)
    pillar.summary
      ? React.createElement(
          View,
          { style: styles.summaryBox },
          React.createElement(
            Text,
            { style: styles.summaryLabel },
            "Synth\u00e8se"
          ),
          React.createElement(
            Text,
            { style: styles.summaryText },
            pillar.summary
          )
        )
      : null,
    // Content blocks
    ...contentBlocks.map((block, index) => {
      if (block.type === "section") {
        return React.createElement(
          Text,
          { key: `block-${index}`, style: styles.sectionTitle },
          block.key ?? ""
        );
      }
      if (block.type === "keyValue") {
        return React.createElement(
          View,
          {
            key: `block-${index}`,
            style: index % 2 === 0 ? styles.keyValueRow : styles.keyValueRowAlt,
          },
          React.createElement(
            Text,
            { style: styles.keyLabel },
            `${block.key ?? ""} :`
          ),
          React.createElement(
            Text,
            { style: styles.keyValue },
            block.value
          )
        );
      }
      // text
      return React.createElement(
        Text,
        { key: `block-${index}`, style: styles.paragraph },
        block.value
      );
    }),
    // Footer
    React.createElement(
      View,
      { style: styles.footer, fixed: true } as Record<string, unknown>,
      React.createElement(
        Text,
        { style: styles.footerText },
        "G\u00e9n\u00e9r\u00e9 par ADVERTIS"
      ),
      React.createElement(
        Text,
        {
          style: styles.footerPage,
          render: ({ pageNumber }: { pageNumber: number }) =>
            `Page ${pageNumber}`,
        } as Record<string, unknown>
      )
    )
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

  // Filter pillars based on selection
  const filteredPillars = selectedPillars
    ? pillars.filter((p) => selectedPillars.includes(p.type))
    : pillars;

  // Sort pillars by ADVERTIS order
  const sortedPillars = [...filteredPillars].sort((a, b) => {
    const orderA = PILLAR_CONFIG[a.type as PillarType]?.order ?? 99;
    const orderB = PILLAR_CONFIG[b.type as PillarType]?.order ?? 99;
    return orderA - orderB;
  });

  // Build document pages
  const pages: React.ReactElement[] = [];

  if (includeCover) {
    pages.push(
      React.createElement(CoverPage, { key: "cover", strategy })
    );
  }

  // Table of contents
  if (sortedPillars.length > 1) {
    pages.push(
      React.createElement(TableOfContents, {
        key: "toc",
        pillars: sortedPillars,
      })
    );
  }

  // Pillar pages
  for (const pillar of sortedPillars) {
    pages.push(
      React.createElement(PillarPage, {
        key: `pillar-${pillar.type}`,
        pillar,
      })
    );
  }

  // Create Document
  const doc = React.createElement(
    Document,
    {
      title: `ADVERTIS - ${strategy.brandName} - ${strategy.name}`,
      author: "ADVERTIS",
      subject: `Strat\u00e9gie de marque ${strategy.brandName}`,
      creator: "ADVERTIS SaaS Platform",
    },
    ...pages
  );

  // Render to buffer
  const buffer = await renderToBuffer(doc);

  return Buffer.from(buffer);
}
