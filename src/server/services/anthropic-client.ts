// =============================================================================
// MODULE 5 — Anthropic Client
// =============================================================================
//
// Centralised AI client for all services. Manages API key resolution and
// provides a resilient wrapper around Vercel AI SDK `generateText`.
//
// PUBLIC API :
//   5.1  anthropic              — Pre-configured Anthropic provider instance
//   5.2  DEFAULT_MODEL          — Current model constant (claude-sonnet-4)
//   5.3  resilientGenerateText  — Wrapper with 6 attempts, structured logging,
//                                 French error messages for overload/rate-limit
//
// DEPENDENCIES :
//   - @ai-sdk/anthropic (Vercel AI SDK)
//   - .env file (ANTHROPIC_API_KEY)
//
// CALLED BY :
//   - Module 7  (ai-generation.ts)
//   - Module 8  (audit-generation.ts)
//   - Module 9  (implementation-generation.ts)
//   - Module 10 (fiche-upgrade.ts)
//   - Module 11 (budget-tier-generator.ts)
//   - Module 20 (translation-generator.ts)
//   - Various API routes
//
// =============================================================================

import { createAnthropic } from "@ai-sdk/anthropic";
import { generateText } from "ai";
import { readFileSync } from "fs";
import { resolve } from "path";

// 5.1  API Key Resolution

/**
 * Resolve the Anthropic API key.
 * process.env.ANTHROPIC_API_KEY may be an empty string if a system-level
 * environment variable shadows the .env value (Windows quirk).
 * In that case we fall back to reading the .env file directly.
 */
function getApiKey(): string | undefined {
  const envKey = process.env.ANTHROPIC_API_KEY;
  if (envKey && envKey.trim().length > 0) return envKey;

  // Fallback: process.env.ANTHROPIC_API_KEY is empty or undefined.
  // This happens on Windows when a system-level env var shadows the .env value.
  // Read the .env file directly and also inject into process.env for other code.
  try {
    const envPath = resolve(process.cwd(), ".env");
    const content = readFileSync(envPath, "utf-8");
    const match = content.match(/ANTHROPIC_API_KEY=["']?([^"'\n]+)["']?/);
    if (match?.[1] && match[1].trim().length > 0) {
      const key = match[1].trim();
      // Inject into process.env so the rest of the app can use it
      process.env.ANTHROPIC_API_KEY = key;
      console.log(
        `[anthropic-client] Loaded API key from .env file (${key.substring(0, 10)}...)`,
      );
      return key;
    }
  } catch {
    // .env file not found — OK in production where env vars are set properly
  }

  return undefined;
}

// 5.2  Client Instance + Model

const apiKey = getApiKey();
if (!apiKey) {
  console.warn(
    "[anthropic-client] WARNING: No Anthropic API key found. AI features will not work.",
  );
}

export const anthropic = createAnthropic({ apiKey });

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";

// 5.3  resilientGenerateText — Retry wrapper with structured logging

/** Default retries: 5 (= 6 attempts total), up from SDK default of 2 */
const DEFAULT_MAX_RETRIES = 5;

/**
 * Wrapper around Vercel AI SDK `generateText` with:
 * - Higher default retries (6 attempts vs 3)
 * - Structured logging `[AI] label — starting/done/FAILED`
 * - Human-friendly French error messages for overload & rate-limit
 */
export async function resilientGenerateText(
  options: Parameters<typeof generateText>[0] & { label?: string },
): Promise<Awaited<ReturnType<typeof generateText>>> {
  const { label, ...generateOptions } = options;
  const tag = label ?? "unknown";
  const retries = generateOptions.maxRetries ?? DEFAULT_MAX_RETRIES;
  const start = Date.now();

  console.log(`[AI] ${tag} — starting (maxRetries: ${retries})`);

  try {
    const result = await generateText({
      ...generateOptions,
      maxRetries: retries,
    });
    const elapsed = Date.now() - start;
    console.log(
      `[AI] ${tag} — done in ${elapsed}ms (${result.usage?.totalTokens ?? "?"} tokens)`,
    );
    return result;
  } catch (err) {
    const elapsed = Date.now() - start;
    const message = err instanceof Error ? err.message : String(err);
    const isOverloaded =
      message.toLowerCase().includes("overloaded") || message.includes("529");
    const isRateLimit =
      message.includes("429") || message.toLowerCase().includes("rate");

    console.error(`[AI] ${tag} — FAILED after ${elapsed}ms: ${message}`);

    if (isOverloaded) {
      throw new Error(
        `L'API IA est temporairement surchargée. Veuillez réessayer dans quelques minutes. (${retries + 1} tentatives échouées en ${Math.round(elapsed / 1000)}s)`,
      );
    }
    if (isRateLimit) {
      throw new Error(
        "Limite de débit API atteinte. Veuillez patienter 1 minute et réessayer.",
      );
    }
    throw new Error(`Erreur IA : ${message}`);
  }
}
