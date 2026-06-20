import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import {
  findLatestUnusedCode,
  incrementCodeAttempt,
  markCodeUsed,
  findActiveUserByEmail,
  createSession,
  markUserLoggedIn,
} from "../../../../lib/auth/db";
import { checkLoginCode } from "../../../../lib/auth/crypto";
import { setSessionCookie } from "../../../../lib/auth/cookies";

vi.mock("../../../../lib/auth/db", () => ({
  findLatestUnusedCode: vi.fn(),
  incrementCodeAttempt: vi.fn(),
  markCodeUsed: vi.fn(),
  findActiveUserByEmail: vi.fn(),
  createSession: vi.fn(),
  markUserLoggedIn: vi.fn(),
}));

vi.mock("../../../../lib/auth/crypto", () => ({
  checkLoginCode: vi.fn(),
  generateSessionToken: () => "raw-token-abc",
  sha256: (input: string) => "hashed-" + input,
}));

vi.mock("../../../../lib/auth/cookies", () => ({
  setSessionCookie: vi.fn(),
}));

describe("POST /api/auth/verify-code", () => {
  let validCodeHash: string;

  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubEnv("AUTH_SESSION_SECRET", "test-pepper-secret-value");
    validCodeHash = "hashed-123456";
  });

  it("should return ok: true and set cookie on a successful verification", async () => {
    const mockRecord = { id: "code-1", email: "approved@example.com", codeHash: "hashed-123456" };
    const mockUser = { id: "user-1", email: "approved@example.com" };

    vi.mocked(findLatestUnusedCode).mockResolvedValue(mockRecord as any);
    vi.mocked(checkLoginCode).mockReturnValue({ ok: true });
    vi.mocked(findActiveUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(createSession).mockResolvedValue({} as any);
    vi.mocked(setSessionCookie).mockResolvedValue(undefined);
    vi.mocked(markUserLoggedIn).mockResolvedValue({} as any);

    const request = new NextRequest("http://localhost/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: "approved@example.com", code: "123456" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(markCodeUsed).toHaveBeenCalledWith("code-1");
    expect(createSession).toHaveBeenCalledWith("user-1", "hashed-raw-token-abc", expect.any(Date));
    expect(setSessionCookie).toHaveBeenCalledWith("raw-token-abc");
    expect(markUserLoggedIn).toHaveBeenCalledWith("user-1");
  });

  it("should return ok: false and increment attempts on a mismatch code", async () => {
    const mockRecord = { id: "code-1", email: "approved@example.com", attemptCount: 0 };

    vi.mocked(findLatestUnusedCode).mockResolvedValue(mockRecord as any);
    vi.mocked(checkLoginCode).mockReturnValue({ ok: false, reason: "mismatch" });
    vi.mocked(incrementCodeAttempt).mockResolvedValue({} as any);

    const request = new NextRequest("http://localhost/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: "approved@example.com", code: "654321" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: false });

    expect(incrementCodeAttempt).toHaveBeenCalledWith("code-1");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("should return ok: false for expired code and NOT increment attempts", async () => {
    const mockRecord = { id: "code-1", email: "approved@example.com" };

    vi.mocked(findLatestUnusedCode).mockResolvedValue(mockRecord as any);
    vi.mocked(checkLoginCode).mockReturnValue({ ok: false, reason: "expired" });

    const request = new NextRequest("http://localhost/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: "approved@example.com", code: "123456" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: false });

    expect(incrementCodeAttempt).not.toHaveBeenCalled();
    expect(createSession).not.toHaveBeenCalled();
  });

  it("should return ok: false if the user was deactivated since requesting code", async () => {
    const mockRecord = { id: "code-1", email: "approved@example.com" };

    vi.mocked(findLatestUnusedCode).mockResolvedValue(mockRecord as any);
    vi.mocked(checkLoginCode).mockReturnValue({ ok: true });
    vi.mocked(findActiveUserByEmail).mockResolvedValue(null);

    const request = new NextRequest("http://localhost/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: "approved@example.com", code: "123456" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: false });

    expect(markCodeUsed).toHaveBeenCalledWith("code-1");
    expect(createSession).not.toHaveBeenCalled();
  });

  it("should return ok: false and NOT create a session if an existing user has isActive: false, given a valid code", async () => {
    const mockRecord = { id: "code-1", email: "inactive@example.com", codeHash: validCodeHash };

    vi.mocked(findLatestUnusedCode).mockResolvedValue(mockRecord as any);
    vi.mocked(checkLoginCode).mockReturnValue({ ok: true });
    vi.mocked(findActiveUserByEmail).mockResolvedValue(null); // isActive: false returns null

    const request = new NextRequest("http://localhost/api/auth/verify-code", {
      method: "POST",
      body: JSON.stringify({ email: "inactive@example.com", code: "123456" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: false });

    expect(findActiveUserByEmail).toHaveBeenCalledWith("inactive@example.com");
    expect(createSession).not.toHaveBeenCalled();
  });
});
