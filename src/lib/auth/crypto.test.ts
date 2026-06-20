import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

vi.mock("server-only", () => ({}));

import {
  generateLoginCode,
  sha256,
  generateSessionToken,
  checkLoginCode,
  isSessionValid,
} from "./crypto";

describe("Crypto authentication helpers", () => {
  beforeEach(() => {
    vi.stubEnv("AUTH_SESSION_SECRET", "test-pepper-secret-value");
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  describe("generateLoginCode", () => {
    it("should return a 6-character string of digits", () => {
      const code = generateLoginCode();
      expect(code).toHaveLength(6);
      expect(/^\d{6}$/.test(code)).toBe(true);
    });

    it("should vary across calls", () => {
      const codes = new Set(Array.from({ length: 50 }, () => generateLoginCode()));
      expect(codes.size).toBeGreaterThan(1);
    });
  });

  describe("sha256", () => {
    it("should be deterministic for the same input and secret", () => {
      const input = "my-secure-value";
      const hash1 = sha256(input);
      const hash2 = sha256(input);
      expect(hash1).toBe(hash2);
      expect(hash1).toHaveLength(64);
    });

    it("should return different hashes for different inputs", () => {
      const hash1 = sha256("value-one");
      const hash2 = sha256("value-two");
      expect(hash1).not.toBe(hash2);
    });

    it("should change output if the pepper changes", () => {
      const input = "pepper-test-value";
      const hash1 = sha256(input);

      vi.stubEnv("AUTH_SESSION_SECRET", "different-pepper-secret-value");
      const hash2 = sha256(input);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe("generateSessionToken", () => {
    it("should return a base64url encoded string", () => {
      const token = generateSessionToken();
      expect(token).toBeDefined();
      expect(token.length).toBeGreaterThan(30);
      expect(token).not.toContain("+");
      expect(token).not.toContain("/");
      expect(token).not.toContain("=");
    });

    it("should vary across calls", () => {
      const token1 = generateSessionToken();
      const token2 = generateSessionToken();
      expect(token1).not.toBe(token2);
    });
  });

  describe("checkLoginCode", () => {
    let codeHash: string;
    const validExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
    const expiredExpiresAt = new Date(Date.now() - 10 * 60 * 1000);

    beforeEach(() => {
      codeHash = sha256("123456");
    });

    it("should pass a correct, unused, active code within attempt limits", () => {
      const attempt = {
        codeHash,
        expiresAt: validExpiresAt,
        usedAt: null,
        attemptCount: 0,
      };
      const result = checkLoginCode(attempt, "123456");
      expect(result).toEqual({ ok: true });
    });

    it("should fail with 'expired' if expiration time is in the past", () => {
      const attempt = {
        codeHash,
        expiresAt: expiredExpiresAt,
        usedAt: null,
        attemptCount: 0,
      };
      const result = checkLoginCode(attempt, "123456");
      expect(result).toEqual({ ok: false, reason: "expired" });
    });

    it("should fail with 'used' if the code was already marked used", () => {
      const attempt = {
        codeHash,
        expiresAt: validExpiresAt,
        usedAt: new Date(),
        attemptCount: 0,
      };
      const result = checkLoginCode(attempt, "123456");
      expect(result).toEqual({ ok: false, reason: "used" });
    });

    it("should fail with 'too_many_attempts' if maximum attempts are met or exceeded", () => {
      const attempt = {
        codeHash,
        expiresAt: validExpiresAt,
        usedAt: null,
        attemptCount: 5,
      };
      const result = checkLoginCode(attempt, "123456", new Date(), 5);
      expect(result).toEqual({ ok: false, reason: "too_many_attempts" });
    });

    it("should fail with 'mismatch' if the submitted code doesn't match", () => {
      const attempt = {
        codeHash,
        expiresAt: validExpiresAt,
        usedAt: null,
        attemptCount: 1,
      };
      const result = checkLoginCode(attempt, "654321");
      expect(result).toEqual({ ok: false, reason: "mismatch" });
    });
  });

  describe("isSessionValid", () => {
    it("should return true for a future expiresAt", () => {
      const futureSession = { expiresAt: new Date(Date.now() + 60 * 1000) };
      expect(isSessionValid(futureSession)).toBe(true);
    });

    it("should return false for a past expiresAt", () => {
      const pastSession = { expiresAt: new Date(Date.now() - 60 * 1000) };
      expect(isSessionValid(pastSession)).toBe(false);
    });
  });
});
