import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import { findOrCreateActiveUserByEmail, countRecentCodes, createLoginCode, findLatestUnusedCode } from "../../../../lib/auth/db";
import { sendLoginCodeEmail } from "../../../../lib/auth/email";

// Mock the db and email helpers
vi.mock("../../../../lib/auth/db", () => ({
  findOrCreateActiveUserByEmail: vi.fn(),
  countRecentCodes: vi.fn(),
  createLoginCode: vi.fn(),
  findLatestUnusedCode: vi.fn(),
}));

vi.mock("../../../../lib/auth/email", () => ({
  sendLoginCodeEmail: vi.fn(),
}));

describe("POST /api/auth/request-code", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return ok: true and send code for a new or existing email", async () => {
    const mockUser = { id: "user-1", email: "user@example.com" };
    vi.mocked(findOrCreateActiveUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(countRecentCodes).mockResolvedValue(0);
    vi.mocked(findLatestUnusedCode).mockResolvedValue(null);
    vi.mocked(createLoginCode).mockResolvedValue({} as any);
    vi.mocked(sendLoginCodeEmail).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email: "USER@example.com " }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(findOrCreateActiveUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(countRecentCodes).toHaveBeenCalledWith("user@example.com", expect.any(Date));
    expect(createLoginCode).toHaveBeenCalled();
    expect(sendLoginCodeEmail).toHaveBeenCalled();
  });

  it("should enforce cooldown and not send email if a code was created recently", async () => {
    const mockUser = { id: "user-1", email: "user@example.com" };
    const recentCode = { id: "code-1", createdAt: new Date(Date.now() - 30000) }; // 30s ago
    vi.mocked(findOrCreateActiveUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(countRecentCodes).mockResolvedValue(1);
    vi.mocked(findLatestUnusedCode).mockResolvedValue(recentCode as any);

    const request = new NextRequest("http://localhost/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(findOrCreateActiveUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(createLoginCode).not.toHaveBeenCalled();
    expect(sendLoginCodeEmail).not.toHaveBeenCalled();
  });

  it("should send email if cooldown has expired", async () => {
    const mockUser = { id: "user-1", email: "user@example.com" };
    const oldCode = { id: "code-1", createdAt: new Date(Date.now() - 65000) }; // 65s ago
    vi.mocked(findOrCreateActiveUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(countRecentCodes).mockResolvedValue(1);
    vi.mocked(findLatestUnusedCode).mockResolvedValue(oldCode as any);
    vi.mocked(createLoginCode).mockResolvedValue({} as any);
    vi.mocked(sendLoginCodeEmail).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(createLoginCode).toHaveBeenCalled();
    expect(sendLoginCodeEmail).toHaveBeenCalled();
  });

  it("should return ok: true but NOT send code if hourly rate limit (5 codes/hour) is reached", async () => {
    const mockUser = { id: "user-1", email: "user@example.com" };
    vi.mocked(findOrCreateActiveUserByEmail).mockResolvedValue(mockUser as any);
    vi.mocked(countRecentCodes).mockResolvedValue(5); // 5 codes already issued in the last hour

    const request = new NextRequest("http://localhost/api/auth/request-code", {
      method: "POST",
      body: JSON.stringify({ email: "user@example.com" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(findOrCreateActiveUserByEmail).toHaveBeenCalledWith("user@example.com");
    expect(createLoginCode).not.toHaveBeenCalled();
    expect(sendLoginCodeEmail).not.toHaveBeenCalled();
  });
});

