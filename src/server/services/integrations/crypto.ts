// =============================================================================
// MODULE 24A — Integration Crypto
// =============================================================================
// AES-256-GCM encryption / decryption for third-party API credentials.
// Credentials are packed as a single Base64 string: IV (16 B) + authTag (16 B)
// + ciphertext. The 32-byte key is read from INTEGRATION_ENCRYPTION_KEY
// environment variable (64-char hex string).
//
// Public API:
//   encryptCredentials(credentials)  — Record<string,string> -> Base64 string
//   decryptCredentials(packed)       — Base64 string -> Record<string,string>
//
// Dependencies:
//   node:crypto                      — createCipheriv, createDecipheriv, randomBytes
//   env.INTEGRATION_ENCRYPTION_KEY   — 64-char hex (32 bytes)
//
// Called by:
//   integrations/sync-orchestrator.ts (decryptCredentials for push/pull)
//   tRPC integration router (encryptCredentials when saving credentials)
// =============================================================================

import { createCipheriv, createDecipheriv, randomBytes } from "crypto";

const ALGORITHM = "aes-256-gcm";
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

function getEncryptionKey(): Buffer {
  const key = process.env.INTEGRATION_ENCRYPTION_KEY;
  if (!key) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY environment variable is required for credential encryption",
    );
  }
  // Key must be 32 bytes for AES-256. Hash if needed.
  const keyBuffer = Buffer.from(key, "hex");
  if (keyBuffer.length !== 32) {
    throw new Error(
      "INTEGRATION_ENCRYPTION_KEY must be a 64-character hex string (32 bytes)",
    );
  }
  return keyBuffer;
}

/** Encrypt a credentials object to a single string (IV + authTag + ciphertext). */
export function encryptCredentials(
  credentials: Record<string, string>,
): string {
  const key = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ALGORITHM, key, iv);

  const plaintext = JSON.stringify(credentials);
  const encrypted = Buffer.concat([
    cipher.update(plaintext, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  // Pack: IV (16) + authTag (16) + ciphertext
  const packed = Buffer.concat([iv, authTag, encrypted]);
  return packed.toString("base64");
}

/** Decrypt a packed credential string back to an object. */
export function decryptCredentials(
  packed: string,
): Record<string, string> {
  const key = getEncryptionKey();
  const buffer = Buffer.from(packed, "base64");

  const iv = buffer.subarray(0, IV_LENGTH);
  const authTag = buffer.subarray(IV_LENGTH, IV_LENGTH + AUTH_TAG_LENGTH);
  const ciphertext = buffer.subarray(IV_LENGTH + AUTH_TAG_LENGTH);

  const decipher = createDecipheriv(ALGORITHM, key, iv);
  decipher.setAuthTag(authTag);

  const decrypted = Buffer.concat([
    decipher.update(ciphertext),
    decipher.final(),
  ]);

  return JSON.parse(decrypted.toString("utf8")) as Record<string, string>;
}
