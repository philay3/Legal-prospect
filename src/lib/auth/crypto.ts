import "server-only";
import crypto from "node:crypto";

export type LoginCodeVerificationResult =
  | { ok: true }
  | { ok: false; reason: "expired" | "used" | "too_many_attempts" | "mismatch" };

/**
 * Generates a cryptographically secure 6-digit code with leading zeros allowed.
 */
export function generateLoginCode(): string {
  return crypto.randomInt(0, 1000000).toString().padStart(6, "0");
}

/**
 * Hashes input string using SHA-256 peppered with AUTH_SESSION_SECRET.
 */
export function sha256(input: string): string {
  const secret = process.env.AUTH_SESSION_SECRET || "";
  return crypto.createHash("sha256").update(secret + input).digest("hex");
}

/**
 * Generates high-entropy base64url encoded 32 random bytes session token.
 */
export function generateSessionToken(): string {
  return crypto.randomBytes(32).toString("base64url");
}

/**
 * Pure function to check a login code status.
 */
export function checkLoginCode(
  codeAttempt: {
    codeHash: string;
    expiresAt: Date;
    usedAt: Date | null;
    attemptCount: number;
  },
  submittedCode: string,
  now: Date = new Date(),
  maxAttempts: number = 5
): LoginCodeVerificationResult {
  if (codeAttempt.attemptCount >= maxAttempts) {
    return { ok: false, reason: "too_many_attempts" };
  }
  if (codeAttempt.usedAt !== null) {
    return { ok: false, reason: "used" };
  }
  if (now.getTime() > codeAttempt.expiresAt.getTime()) {
    return { ok: false, reason: "expired" };
  }
  const submittedHash = sha256(submittedCode);
  if (submittedHash !== codeAttempt.codeHash) {
    return { ok: false, reason: "mismatch" };
  }
  return { ok: true };
}

/**
 * Pure function to check whether a session is valid.
 */
export function isSessionValid(
  session: { expiresAt: Date },
  now: Date = new Date()
): boolean {
  return now.getTime() <= session.expiresAt.getTime();
}
