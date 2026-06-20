import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { POST } from "./route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";
import { createFeedback } from "../../../lib/feedback";

vi.mock("../../../lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../../../lib/feedback", () => ({
  createFeedback: vi.fn(),
}));

describe("POST /api/feedback", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if JSON body is invalid", async () => {
    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: "invalid-json",
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toBe("Invalid JSON body");
  });

  it("should return 400 if choice is missing or not in allowed set", async () => {
    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ choice: "Something Invalid", message: "Hello" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid choice");
  });

  it("should return 400 if message exceeds 1000 characters", async () => {
    const longMessage = "a".repeat(1001);
    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ choice: "More emails", message: longMessage }),
    });

    const response = await POST(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Message must not exceed 1000 characters");
  });

  it("should save feedback with userId when user is signed in", async () => {
    const mockUser = { id: "user-123", email: "user@example.com" };
    vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
    vi.mocked(createFeedback).mockResolvedValue({} as any);

    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ choice: "More emails", message: "Please add search by state" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });
    expect(createFeedback).toHaveBeenCalledWith({
      choice: "More emails",
      message: "Please add search by state",
      userId: "user-123",
    });
  });

  it("should save feedback with null userId when user is signed out", async () => {
    vi.mocked(getCurrentUser).mockResolvedValue(null);
    vi.mocked(createFeedback).mockResolvedValue({} as any);

    const request = new NextRequest("http://localhost/api/feedback", {
      method: "POST",
      body: JSON.stringify({ choice: "Faster search" }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
    const data = await response.json();
    expect(data).toEqual({ ok: true });
    expect(createFeedback).toHaveBeenCalledWith({
      choice: "Faster search",
      message: null,
      userId: null,
    });
  });
});
