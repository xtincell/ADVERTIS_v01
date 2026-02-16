// File Parser Service
// Extracts text from uploaded Excel (.xlsx), Word (.docx), and PDF (.pdf) files.
// Used by the file import pipeline in the Strategy Creation Wizard.

import * as XLSX from "xlsx";
import mammoth from "mammoth";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface ParseResult {
  text: string;
  metadata: {
    fileName: string;
    fileType: "xlsx" | "docx" | "pdf";
    wordCount: number;
    pageCount?: number;
  };
}

// Maximum characters to extract (to stay within AI context limits)
const MAX_TEXT_LENGTH = 50_000;

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parse a file buffer and extract text content.
 * Supports .xlsx, .docx, and .pdf formats.
 */
export async function parseFile(
  buffer: Buffer,
  fileName: string,
): Promise<ParseResult> {
  const extension = fileName.split(".").pop()?.toLowerCase();

  let text: string;
  let pageCount: number | undefined;

  switch (extension) {
    case "xlsx":
    case "xls":
      text = parseExcel(buffer);
      break;
    case "docx":
    case "doc":
      text = await parseWord(buffer);
      break;
    case "pdf":
      const pdfResult = await parsePDF(buffer);
      text = pdfResult.text;
      pageCount = pdfResult.pageCount;
      break;
    default:
      throw new Error(
        `Format de fichier non supporté : .${extension}. Formats acceptés : .xlsx, .docx, .pdf`,
      );
  }

  // Truncate if necessary
  if (text.length > MAX_TEXT_LENGTH) {
    text = text.substring(0, MAX_TEXT_LENGTH);
  }

  const fileType = (
    extension === "xls" ? "xlsx" : extension === "doc" ? "docx" : extension
  ) as "xlsx" | "docx" | "pdf";

  return {
    text,
    metadata: {
      fileName,
      fileType,
      wordCount: text.split(/\s+/).filter(Boolean).length,
      pageCount,
    },
  };
}

// ---------------------------------------------------------------------------
// Format-specific parsers
// ---------------------------------------------------------------------------

/**
 * Parse Excel file: iterate all sheets and rows, concatenate non-empty cell values.
 */
function parseExcel(buffer: Buffer): string {
  const workbook = XLSX.read(buffer, { type: "buffer" });
  const lines: string[] = [];

  for (const sheetName of workbook.SheetNames) {
    const sheet = workbook.Sheets[sheetName];
    if (!sheet) continue;

    lines.push(`--- ${sheetName} ---`);

    const data = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, {
      header: 1,
      defval: "",
    });

    for (const row of data) {
      const rowArr = row as unknown as unknown[];
      const cells = rowArr
        .map((cell) => String(cell ?? "").trim())
        .filter(Boolean);
      if (cells.length > 0) {
        lines.push(cells.join(" | "));
      }
    }

    lines.push(""); // blank line between sheets
  }

  return lines.join("\n").trim();
}

/**
 * Parse Word document: extract raw text using mammoth.
 */
async function parseWord(buffer: Buffer): Promise<string> {
  const result = await mammoth.extractRawText({ buffer });
  return result.value.trim();
}

/**
 * Parse PDF: extract text and page count using pdf-parse v2.x.
 * Uses dynamic import because pdf-parse v2.x is ESM-only.
 * v2.x has a class-based API: new PDFParse({ data }) → getText() → { text, total }.
 */
async function parsePDF(
  buffer: Buffer,
): Promise<{ text: string; pageCount: number }> {
  const { PDFParse } = await import("pdf-parse");
  const parser = new PDFParse({ data: buffer });
  try {
    const result = await parser.getText();
    return {
      text: result.text.trim(),
      pageCount: result.total,
    };
  } finally {
    await parser.destroy().catch(() => {});
  }
}
