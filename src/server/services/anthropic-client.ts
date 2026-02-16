// Shared Anthropic client instance for all AI services
// Centralizes the API key configuration in one place.

import { createAnthropic } from "@ai-sdk/anthropic";
import { readFileSync } from "fs";
import { resolve } from "path";

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

const apiKey = getApiKey();
if (!apiKey) {
  console.warn(
    "[anthropic-client] WARNING: No Anthropic API key found. AI features will not work.",
  );
}

export const anthropic = createAnthropic({ apiKey });

export const DEFAULT_MODEL = "claude-sonnet-4-20250514";
