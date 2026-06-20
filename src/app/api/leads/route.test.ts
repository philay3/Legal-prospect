import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));

import { GET, POST, DELETE } from "./route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "../../../lib/auth/session";
import { saveLead, unsaveLead, getSavedFirmIds } from "../../../lib/leads";

vi.mock("../../../lib/auth/session", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("../../../lib/leads", () => ({
  saveLead: vi.fn(),
  unsaveLead: vi.fn(),
  getSavedFirmIds: vi.fn(),
}));

describe("API /api/leads route handlers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET", () => {
    it("should return signedIn: false and empty list if user is signed out", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ signedIn: false, firmIds: [] });
      expect(getSavedFirmIds).not.toHaveBeenCalled();
    });

    it("should return signedIn: true and saved firm ids if user is signed in", async () => {
      const mockUser = { id: "user-1", email: "user@example.com" };
      vi.mocked(getCurrentUser).mockResolvedValue(mockUser as any);
      vi.mocked(getSavedFirmIds).mockResolvedValue(["firm-1", "firm-2"]);

      const response = await GET();
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ signedIn: true, firmIds: ["firm-1", "firm-2"] });
      expect(getSavedFirmIds).toHaveBeenCalledWith("user-1");
    });
  });

  describe("POST", () => {
    it("should return 401 if user is signed out", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({ firmId: "firm-1" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
      expect(saveLead).not.toHaveBeenCalled();
    });

    it("should return 400 if JSON body is invalid", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: "invalid-json-string",
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid JSON body");
    });

    it("should return 400 if firmId is missing or empty", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({ firmId: "   " }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("firmId is required");
    });

    it("should save the lead and return ok and saved status on success", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);
      vi.mocked(saveLead).mockResolvedValue({} as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({ firmId: "firm-1" }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, saved: true });
      expect(saveLead).toHaveBeenCalledWith("user-1", "firm-1");
    });

    it("should save multiple leads, filter junk, and return count of saved leads", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);
      vi.mocked(saveLead).mockResolvedValue({} as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "POST",
        body: JSON.stringify({ firmIds: ["firm-1", "firm-2", "   ", "firm-1", null] }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, saved: 2 });
      expect(saveLead).toHaveBeenCalledWith("user-1", "firm-1");
      expect(saveLead).toHaveBeenCalledWith("user-1", "firm-2");
    });
  });

  describe("DELETE", () => {
    it("should return 401 if user is signed out", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue(null);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "DELETE",
        body: JSON.stringify({ firmId: "firm-1" }),
      });

      const response = await DELETE(request);
      expect(response.status).toBe(401);
      const data = await response.json();
      expect(data.error).toBe("Unauthorized");
      expect(unsaveLead).not.toHaveBeenCalled();
    });

    it("should return 400 if JSON body is invalid", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "DELETE",
        body: "invalid-json",
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toBe("Invalid JSON body");
    });

    it("should return 400 if firmId is invalid", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "DELETE",
        body: JSON.stringify({ firmId: 1234 }), // wrong type
      });

      const response = await DELETE(request);
      expect(response.status).toBe(400);
      const data = await response.json();
      expect(data.error).toContain("firmId is required");
    });

    it("should unsave the lead and return ok and unsaved status on success", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);
      vi.mocked(unsaveLead).mockResolvedValue({ count: 1 } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "DELETE",
        body: JSON.stringify({ firmId: "firm-1" }),
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, saved: false });
      expect(unsaveLead).toHaveBeenCalledWith("user-1", "firm-1");
    });

    it("should unsave multiple leads, filtering junk, and return count of unsaved leads", async () => {
      vi.mocked(getCurrentUser).mockResolvedValue({ id: "user-1" } as any);
      vi.mocked(unsaveLead).mockResolvedValue({ count: 1 } as any);

      const request = new NextRequest("http://localhost/api/leads", {
        method: "DELETE",
        body: JSON.stringify({ firmIds: ["firm-1", "firm-3", "", null] }),
      });

      const response = await DELETE(request);
      expect(response.status).toBe(200);
      const data = await response.json();
      expect(data).toEqual({ ok: true, removed: 2 });
      expect(unsaveLead).toHaveBeenCalledWith("user-1", "firm-1");
      expect(unsaveLead).toHaveBeenCalledWith("user-1", "firm-3");
    });
  });
});
