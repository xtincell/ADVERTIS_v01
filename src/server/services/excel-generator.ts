// ADVERTIS Excel Generator Service
// Server-side Excel generation using ExcelJS

import ExcelJS from "exceljs";
import { PILLAR_CONFIG, PILLAR_TYPES, type PillarType } from "~/lib/constants";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

interface StrategyData {
  name: string;
  brandName: string;
  sector?: string;
  coherenceScore?: number;
}

interface PillarData {
  type: string;
  title: string;
  content: unknown;
  summary?: string;
  status: string;
}

interface ExcelOptions {
  selectedPillars?: string[];
}

// ---------------------------------------------------------------------------
// Design Tokens
// ---------------------------------------------------------------------------

const COLORS = {
  terracotta: "C45A3C",
  terracottaLight: "F5E6E1",
  dark: "1A1A1A",
  gray: "6B7280",
  grayLight: "F3F4F6",
  white: "FFFFFF",
  headerBg: "C45A3C",
  headerFont: "FFFFFF",
  altRowBg: "FDF5F3",
} as const;

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function applyHeaderStyle(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: COLORS.headerBg },
    };
    cell.font = {
      bold: true,
      color: { argb: COLORS.headerFont },
      size: 11,
    };
    cell.alignment = { vertical: "middle", horizontal: "left", wrapText: true };
    cell.border = {
      bottom: { style: "thin", color: { argb: COLORS.gray } },
    };
  });
  row.height = 28;
}

function applyDataRowStyle(row: ExcelJS.Row, index: number): void {
  row.eachCell((cell) => {
    if (index % 2 === 1) {
      cell.fill = {
        type: "pattern",
        pattern: "solid",
        fgColor: { argb: COLORS.altRowBg },
      };
    }
    cell.font = { size: 10, color: { argb: COLORS.dark } };
    cell.alignment = { vertical: "top", wrapText: true };
    cell.border = {
      bottom: { style: "hair", color: { argb: COLORS.grayLight } },
    };
  });
}

function applySectionTitleStyle(row: ExcelJS.Row): void {
  row.eachCell((cell) => {
    cell.font = {
      bold: true,
      size: 12,
      color: { argb: COLORS.terracotta },
    };
    cell.alignment = { vertical: "middle" };
  });
  row.height = 26;
}

function statusLabel(status: string): string {
  switch (status) {
    case "complete":
      return "Complet";
    case "generating":
      return "En cours";
    case "error":
      return "Erreur";
    case "pending":
    default:
      return "En attente";
  }
}

/**
 * Flatten JSON content into key-value pairs for spreadsheet rendering.
 */
function flattenContent(
  content: unknown,
  prefix = ""
): Array<{ key: string; value: string }> {
  const result: Array<{ key: string; value: string }> = [];

  if (!content) return result;

  if (typeof content === "string") {
    result.push({ key: prefix || "Contenu", value: content });
    return result;
  }

  if (typeof content === "number" || typeof content === "boolean") {
    result.push({ key: prefix || "Valeur", value: String(content) });
    return result;
  }

  if (Array.isArray(content)) {
    for (let i = 0; i < content.length; i++) {
      const item = content[i] as unknown;
      if (typeof item === "string" || typeof item === "number") {
        result.push({
          key: prefix ? `${prefix} [${i + 1}]` : `[${i + 1}]`,
          value: String(item),
        });
      } else if (typeof item === "object" && item !== null) {
        const nested = flattenContent(
          item,
          prefix ? `${prefix} [${i + 1}]` : `[${i + 1}]`
        );
        result.push(...nested);
      }
    }
    return result;
  }

  if (typeof content === "object") {
    const obj = content as Record<string, unknown>;
    for (const [key, value] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix} > ${formatKey(key)}` : formatKey(key);
      if (
        typeof value === "string" ||
        typeof value === "number" ||
        typeof value === "boolean"
      ) {
        result.push({ key: fullKey, value: String(value) });
      } else if (Array.isArray(value)) {
        // For arrays of strings, join them
        const allStrings = value.every(
          (v) => typeof v === "string" || typeof v === "number"
        );
        if (allStrings) {
          result.push({ key: fullKey, value: value.join(", ") });
        } else {
          const nested = flattenContent(value, fullKey);
          result.push(...nested);
        }
      } else if (typeof value === "object" && value !== null) {
        const nested = flattenContent(value, fullKey);
        result.push(...nested);
      }
    }
    return result;
  }

  result.push({
    key: prefix || "Contenu",
    value: JSON.stringify(content),
  });
  return result;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, " $1")
    .replace(/[_-]/g, " ")
    .replace(/^\w/, (c) => c.toUpperCase())
    .trim();
}

// ---------------------------------------------------------------------------
// Main Excel Generator
// ---------------------------------------------------------------------------

export async function generateStrategyExcel(
  strategy: StrategyData,
  pillars: PillarData[],
  options?: ExcelOptions
): Promise<Buffer> {
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

  const workbook = new ExcelJS.Workbook();
  workbook.creator = "ADVERTIS";
  workbook.created = new Date();
  workbook.modified = new Date();

  // =========================================================================
  // Sheet 1: Synth\u00e8se
  // =========================================================================
  const synthSheet = workbook.addWorksheet("Synth\u00e8se", {
    properties: { tabColor: { argb: COLORS.terracotta } },
  });

  // Title
  synthSheet.mergeCells("A1:D1");
  const titleCell = synthSheet.getCell("A1");
  titleCell.value = `ADVERTIS - ${strategy.brandName}`;
  titleCell.font = { bold: true, size: 18, color: { argb: COLORS.terracotta } };
  titleCell.alignment = { vertical: "middle" };
  synthSheet.getRow(1).height = 36;

  // Strategy metadata
  const metaData: Array<[string, string]> = [
    ["Strat\u00e9gie", strategy.name],
    ["Marque", strategy.brandName],
  ];
  if (strategy.sector) {
    metaData.push(["Secteur", strategy.sector]);
  }
  if (strategy.coherenceScore !== undefined && strategy.coherenceScore !== null) {
    metaData.push(["Score de coh\u00e9rence", `${strategy.coherenceScore}/100`]);
  }

  let currentRow = 3;
  for (const [label, value] of metaData) {
    const row = synthSheet.getRow(currentRow);
    row.getCell(1).value = label;
    row.getCell(1).font = { bold: true, size: 11, color: { argb: COLORS.dark } };
    row.getCell(2).value = value;
    row.getCell(2).font = { size: 11, color: { argb: COLORS.dark } };
    currentRow++;
  }

  // Pillar completion status table
  currentRow += 2;
  const statusTitleRow = synthSheet.getRow(currentRow);
  statusTitleRow.getCell(1).value = "\u00c9tat des piliers";
  applySectionTitleStyle(statusTitleRow);
  currentRow++;

  // Headers
  const statusHeaderRow = synthSheet.getRow(currentRow);
  statusHeaderRow.values = ["Pilier", "Lettre", "Statut", "Description"];
  applyHeaderStyle(statusHeaderRow);
  currentRow++;

  // All pillars (show full ADVERTIS framework)
  for (const type of PILLAR_TYPES) {
    const config = PILLAR_CONFIG[type];
    const pillar = pillars.find((p) => p.type === type);
    const row = synthSheet.getRow(currentRow);
    row.values = [
      config.title,
      type,
      statusLabel(pillar?.status ?? "pending"),
      config.description,
    ];
    applyDataRowStyle(row, currentRow);

    // Color the status cell
    const statusCell = row.getCell(3);
    if (pillar?.status === "complete") {
      statusCell.font = {
        size: 10,
        bold: true,
        color: { argb: "2D5A3D" },
      };
    } else if (pillar?.status === "error") {
      statusCell.font = {
        size: 10,
        bold: true,
        color: { argb: "C43C3C" },
      };
    }

    currentRow++;
  }

  // Column widths
  synthSheet.getColumn(1).width = 22;
  synthSheet.getColumn(2).width = 10;
  synthSheet.getColumn(3).width = 16;
  synthSheet.getColumn(4).width = 50;

  // =========================================================================
  // Sheet per pillar
  // =========================================================================
  for (const pillar of sortedPillars) {
    const config = PILLAR_CONFIG[pillar.type as PillarType];
    const sheetName = `${pillar.type} - ${config?.title ?? pillar.title}`;
    // Excel sheet names max 31 chars
    const truncatedName = sheetName.substring(0, 31);

    const pillarColor = config?.color?.replace("#", "") ?? COLORS.terracotta;
    const sheet = workbook.addWorksheet(truncatedName, {
      properties: { tabColor: { argb: pillarColor } },
    });

    // Pillar header
    sheet.mergeCells("A1:B1");
    const pillarTitleCell = sheet.getCell("A1");
    pillarTitleCell.value = `${pillar.type} - ${config?.title ?? pillar.title}`;
    pillarTitleCell.font = {
      bold: true,
      size: 16,
      color: { argb: pillarColor },
    };
    pillarTitleCell.alignment = { vertical: "middle" };
    sheet.getRow(1).height = 32;

    // Description
    sheet.mergeCells("A2:B2");
    const descCell = sheet.getCell("A2");
    descCell.value = config?.description ?? "";
    descCell.font = { size: 10, italic: true, color: { argb: COLORS.gray } };

    // Status
    sheet.getCell("A3").value = "Statut :";
    sheet.getCell("A3").font = { bold: true, size: 10 };
    sheet.getCell("B3").value = statusLabel(pillar.status);
    sheet.getCell("B3").font = { size: 10 };

    // Summary
    let rowIdx = 5;
    if (pillar.summary) {
      sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
      const summaryLabelCell = sheet.getCell(`A${rowIdx}`);
      summaryLabelCell.value = "Synth\u00e8se";
      summaryLabelCell.font = {
        bold: true,
        size: 11,
        color: { argb: COLORS.terracotta },
      };
      rowIdx++;

      sheet.mergeCells(`A${rowIdx}:B${rowIdx}`);
      const summaryCell = sheet.getCell(`A${rowIdx}`);
      summaryCell.value = pillar.summary;
      summaryCell.font = { size: 10, color: { argb: COLORS.dark } };
      summaryCell.alignment = { wrapText: true };
      rowIdx += 2;
    }

    // Content
    const contentPairs = flattenContent(pillar.content);

    if (contentPairs.length > 0) {
      const contentHeaderRow = sheet.getRow(rowIdx);
      contentHeaderRow.values = ["Cl\u00e9", "Valeur"];
      applyHeaderStyle(contentHeaderRow);
      rowIdx++;

      for (let i = 0; i < contentPairs.length; i++) {
        const pair = contentPairs[i]!;
        const row = sheet.getRow(rowIdx);
        row.getCell(1).value = pair.key;
        row.getCell(2).value = pair.value;
        applyDataRowStyle(row, i);
        rowIdx++;
      }
    }

    // Column widths
    sheet.getColumn(1).width = 35;
    sheet.getColumn(2).width = 80;
  }

  // =========================================================================
  // Sheet "Variables" - Summary of all variables across pillars
  // =========================================================================
  const variablesSheet = workbook.addWorksheet("Variables", {
    properties: { tabColor: { argb: COLORS.terracotta } },
  });

  // Title
  variablesSheet.mergeCells("A1:C1");
  const varTitleCell = variablesSheet.getCell("A1");
  varTitleCell.value = "R\u00e9capitulatif des variables";
  varTitleCell.font = {
    bold: true,
    size: 16,
    color: { argb: COLORS.terracotta },
  };
  varTitleCell.alignment = { vertical: "middle" };
  variablesSheet.getRow(1).height = 32;

  // Headers
  const varHeaderRow = variablesSheet.getRow(3);
  varHeaderRow.values = ["Pilier", "Variable", "Valeur"];
  applyHeaderStyle(varHeaderRow);

  let varRowIdx = 4;
  for (const pillar of sortedPillars) {
    const config = PILLAR_CONFIG[pillar.type as PillarType];
    const pairs = flattenContent(pillar.content);

    for (let i = 0; i < pairs.length; i++) {
      const pair = pairs[i]!;
      const row = variablesSheet.getRow(varRowIdx);
      row.getCell(1).value = `${pillar.type} - ${config?.title ?? pillar.title}`;
      row.getCell(2).value = pair.key;
      row.getCell(3).value = pair.value;
      applyDataRowStyle(row, varRowIdx);
      varRowIdx++;
    }
  }

  // Column widths
  variablesSheet.getColumn(1).width = 25;
  variablesSheet.getColumn(2).width = 35;
  variablesSheet.getColumn(3).width = 80;

  // =========================================================================
  // Write to buffer
  // =========================================================================
  const arrayBuffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(arrayBuffer);
}
