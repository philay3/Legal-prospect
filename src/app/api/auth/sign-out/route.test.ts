import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import { getSessionToken, clearSessionCookie } from "../../../../lib/auth/cookies";
import { findSessionByToken, deleteSession } from "../../../../lib/auth/db";

vi.mock("../../../../lib/auth/cookies", () => ({
  getSessionToken: vi.fn(),
  clearSessionCookie: vi.fn(),
}));

vi.mock("../../../../lib/auth/db", () => ({
  findSessionByToken: vi.fn(),
  deleteSession: vi.fn(),
}));

describe("POST /api/auth/sign-out", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should delete session and clear cookies when session token is present", async () => {
    vi.mocked(getSessionToken).mockResolvedValue("my-session-token");
    const mockSession = { id: "session-abc", userId: "user-123" };
    vi.mocked(findSessionByToken).mockResolvedValue(mockSession as any);
    vi.mocked(deleteSession).mockResolvedValue({} as any);
    vi.mocked(clearSessionCookie).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/auth/sign-out", { method: "POST" });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(getSessionToken).toHaveBeenCalled();
    expect(findSessionByToken).toHaveBeenCalledWith("my-session-token");
    expect(deleteSession).toHaveBeenCalledWith("session-abc");
    expect(clearSessionCookie).toHaveBeenCalled();
  });

  it("should clear cookie even if no session token is in cookies", async () => {
    vi.mocked(getSessionToken).mockResolvedValue(undefined);
    vi.mocked(clearSessionCookie).mockResolvedValue(undefined);

    const request = new NextRequest("http://localhost/api/auth/sign-out", { method: "POST" });
    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });

    expect(findSessionByToken).not.toHaveBeenCalled();
    expect(deleteSession).not.toHaveBeenCalled();
    expect(clearSessionCookie).toHaveBeenCalled();
  });
});
