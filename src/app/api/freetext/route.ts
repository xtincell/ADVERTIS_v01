// =============================================================================
// ROUTE R.12 — Freetext
// =============================================================================
// POST  /api/freetext
// AI-powered free-text input processing. Takes raw free-form text describing
// a brand and maps it to ADVERTIS A-E variables via AI. Reuses the same
// variable-mapper service as file import (R.14).
// Auth:         Session required
// Dependencies: variable-mapper service (mapTextToVariables)
// maxDuration:  120s (2 minutes — AI mapping)
// =============================================================================

import { NextResponse } from "next/server";

import { auth } from "~/server/auth";
import { mapTextToVariables } from "~/server/services/variable-mapper";

// Allow up to 2 minutes for AI mapping (Vercel serverless timeout)
export const maxDuration = 120;

const MAX_TEXT_LENGTH = 50_000; // same limit as file import
const MIN_TEXT_LENGTH = 100; // at least ~50 words

interface FreeTextBody {
  text?: string;
  brandName?: string;
  sector?: string;
}

export async function POST(request: Request) {
  try {
    // 1. Auth check
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Non authentifie" },
        { status: 401 },
      );
    }

    // 2. Parse body
    const body = (await request.json()) as FreeTextBody;
    const { text, brandName, sector } = body;

    if (!text || typeof text !== "string") {
      return NextResponse.json(
        { error: "Texte requis" },
        { status: 400 },
      );
    }

    const trimmedText = text.trim();

    if (trimmedText.length < MIN_TEXT_LENGTH) {
      return NextResponse.json(
        {
          error:
            "Le texte est trop court. Veuillez fournir au moins 50 mots decrivant votre marque.",
        },
        { status: 400 },
      );
    }

    // Truncate if too long (same as file import)
    const processedText =
      trimmedText.length > MAX_TEXT_LENGTH
        ? trimmedText.substring(0, MAX_TEXT_LENGTH)
        : trimmedText;

    // 3. Map text to variables via AI (reuse the same service as file import)
    let mappingResult;
    try {
      mappingResult = await mapTextToVariables(
        processedText,
        brandName ?? "",
        sector ?? "",
      );
    } catch (error) {
      console.error("Free text mapping error:", error);
      const message =
        error instanceof Error
          ? error.message
          : "Erreur lors du mapping IA des variables";
      const isTransient =
        message.includes("surchargée") || message.includes("réessayer");
      return NextResponse.json(
        { error: message, retryable: isTransient },
        { status: isTransient ? 503 : 500 },
      );
    }

    // 4. Return results
    return NextResponse.json({
      mappedVariables: mappingResult.mappedVariables,
      confidence: mappingResult.confidence,
      unmappedVariables: mappingResult.unmappedVariables,
    });
  } catch (error) {
    console.error("Free text analysis error:", error);
    return NextResponse.json(
      { error: "Erreur interne lors de l'analyse du texte" },
      { status: 500 },
    );
  }
}
