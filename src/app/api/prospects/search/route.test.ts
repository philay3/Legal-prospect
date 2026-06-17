import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

// Mock the prisma client helper
vi.mock("../../../../lib/prisma", () => ({
  default: {
    firm: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/prospects/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if zip query parameter is missing", async () => {
    const request = new NextRequest("http://localhost/api/prospects/search");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("ZIP code query parameter is required");
  });

  it("should return 400 if zip query parameter is invalid", async () => {
    const request = new NextRequest("http://localhost/api/prospects/search?zip=123");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid ZIP code format");
  });

  it("should return 200 with matching prospects from the database", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Alpha Law",
        zip: "19103",
        zipExt: null,
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://alpha.com",
        phone: "555-0101",
        email: "contact@alpha.com",
        practiceAreas: ["Corporate"],
        attorneyCountRange: "5-10",
        attorneys: ["John Doe"],
        sourceType: "MANUAL_SEED",
        sourceUrl: null,
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
        globalNotes: "Some note",
      },
    ];

    vi.mocked(prisma.firm.findMany).mockResolvedValue(mockFirms as any);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.query.zip).toBe("19103");
    expect(data.query.normalizedZip).toBe("19103");
    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toEqual({
      id: "firm-1",
      firmName: "Alpha Law",
      zip: "19103",
      zipExt: null,
      city: "Philadelphia",
      state: "PA",
      streetAddress: "123 Market St",
      website: "https://alpha.com",
      phone: "555-0101",
      email: "contact@alpha.com",
      practiceAreas: ["Corporate"],
      attorneyCountRange: "5-10",
      attorneys: ["John Doe"],
      sourceType: "MANUAL_SEED",
      sourceUrl: null,
      confidenceLevel: "HIGH",
      verificationStatus: "VERIFIED",
      lastCheckedDate: "2026-06-17T12:00:00.000Z",
      globalNotes: "Some note",
    });

    expect(prisma.firm.findMany).toHaveBeenCalledWith({
      where: { zip: "19103" },
      orderBy: { firmName: "asc" },
    });
  });

  it("should support and normalize ZIP+4 format queries to the base 5 digits", async () => {
    vi.mocked(prisma.firm.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103-1234");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.query.zip).toBe("19103-1234");
    expect(data.query.normalizedZip).toBe("19103");
    expect(prisma.firm.findMany).toHaveBeenCalledWith({
      where: { zip: "19103" },
      orderBy: { firmName: "asc" },
    });
  });

  it("should return an empty results array with status 200 if no firms match the ZIP", async () => {
    vi.mocked(prisma.firm.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=90210");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toEqual([]);
  });

  it("should return status 500 if the database query fails", async () => {
    vi.mocked(prisma.firm.findMany).mockRejectedValue(new Error("DB Connection Error"));

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain("unexpected error occurred");
  });
});
