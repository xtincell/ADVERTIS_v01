// ==========================================================================
// LIB — Encryption Helpers
// ==========================================================================
// AES-256-GCM encryption/decryption for sensitive data at rest.
// Used for: integration tokens, API keys stored in the database.
//
// Uses Node.js built-in `crypto` — no external dependencies.
//
// Key derivation: AUTH_SECRET is used as the encryption passphrase.
// A 256-bit key is derived via SHA-256 hash of the secret.
//
// Format: base64(iv:ciphertext:authTag)
//   - iv: 12-byte initialization vector (random per encryption)
//   - ciphertext: AES-256-GCM encrypted data
//   - authTag: 16-byte authentication tag (integrity verification)
// ==========================================================================

import { createCipheriv, createDecipheriv, randomBytes, createHash } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 12; // GCM recommended IV length
const TAG_LENGTH = 16;

/**
 * Derive a 256-bit key from the AUTH_SECRET.
 * Uses SHA-256 for deterministic key derivation.
 */
function getEncryptionKey(): Buffer {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "AUTH_SECRET is required for encryption. Set it in your .env file.",
    );
  }
  // SHA-256 always produces 32 bytes = 256 bits
  return createHash("sha256").update(secret).digest();
}

/**
 * Encrypt a plaintext string using AES-256-GCM.
 *
 * @param plaintext - The string to encrypt
 * @returns Base64-encoded string containing iv:ciphertext:authTag
 *
 * @example
 * const encrypted = encrypt("sk-my-api-key-12345");
 * // Store `encrypted` in the database
 */
export function encrypt(plaintext: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  let encrypted = cipher.update(plaintext, "utf8");
  encrypted = Buffer.concat([encrypted, cipher.final()]);

  const authTag = cipher.getAuthTag();

  // Combine iv + ciphertext + authTag into a single buffer
  const combined = Buffer.concat([iv, encrypted, authTag]);

  return combined.toString("base64");
}

/**
 * Decrypt a previously encrypted string.
 *
 * @param encryptedData - Base64-encoded string from `encrypt()`
 * @returns The original plaintext string
 * @throws Error if decryption fails (wrong key, tampered data, etc.)
 *
 * @example
 * const apiKey = decrypt(storedEncryptedValue);
 */
export function decrypt(encryptedData: string): string {
  const key = getEncryptionKey();
  const combined = Buffer.from(encryptedData, "base64");

  // Extract components
  const iv = combined.subarray(0, IV_LENGTH);
  const authTag = combined.subarray(combined.length - TAG_LENGTH);
  const ciphertext = combined.subarray(IV_LENGTH, combined.length - TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  let decrypted = decipher.update(ciphertext);
  decrypted = Buffer.concat([decrypted, decipher.final()]);

  return decrypted.toString("utf8");
}

/**
 * Check if a string looks like it's already encrypted (base64 with correct length).
 * Useful for migration scripts that need to skip already-encrypted values.
 */
export function isEncrypted(value: string): boolean {
  try {
    const decoded = Buffer.from(value, "base64");
    // Minimum: IV (12) + 1 byte ciphertext + tag (16) = 29 bytes
    return decoded.length >= IV_LENGTH + 1 + TAG_LENGTH;
  } catch {
    return false;
  }
}
