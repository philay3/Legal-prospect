import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";
import { runLeadResearch } from "../../../../lib/research/runLeadResearch";
import { saveResearchFirms } from "../../../../lib/db/saveResearchFirms";

// Mock the prisma client helper
vi.mock("../../../../lib/prisma", () => ({
  default: {
    firm: {
      findMany: vi.fn(),
    },
  },
}));

// Mock the research and save helper functions
vi.mock("../../../../lib/research/runLeadResearch", () => ({
  runLeadResearch: vi.fn(),
}));

vi.mock("../../../../lib/db/saveResearchFirms", () => ({
  saveResearchFirms: vi.fn(),
}));

describe("GET /api/prospects/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(runLeadResearch).mockResolvedValue({
      zip_code: "19103",
      firms: [],
    });
    vi.mocked(saveResearchFirms).mockResolvedValue(undefined);
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
        searchZip: "19103",
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
      searchZip: "19103",
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
      where: { searchZip: "19103" },
      orderBy: { firmName: "asc" },
    });
    expect(runLeadResearch).not.toHaveBeenCalled();
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
      where: { searchZip: "19103" },
      orderBy: { firmName: "asc" },
    });
  });

  it("should return status 500 if the database query fails", async () => {
    vi.mocked(prisma.firm.findMany).mockRejectedValue(new Error("DB Connection Error"));

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain("unexpected error occurred");
  });

  it("should sort results by confidenceLevel descending, then alphabetically by firmName", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Zeta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "LOW",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-2",
        firmName: "Alpha Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-3",
        firmName: "Beta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "MEDIUM",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-4",
        firmName: "Gamma Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-5",
        firmName: "Delta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "UNKNOWN",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
    ];

    vi.mocked(prisma.firm.findMany).mockResolvedValue(mockFirms as any);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toHaveLength(5);

    // Expected order:
    // 1. Alpha Law (HIGH)
    // 2. Gamma Law (HIGH) -> alphabetical tiebreaker: Alpha before Gamma
    // 3. Beta Law (MEDIUM)
    // 4. Zeta Law (LOW)
    // 5. Delta Law (UNKNOWN)
    expect(data.results[0].firmName).toBe("Alpha Law");
    expect(data.results[1].firmName).toBe("Gamma Law");
    expect(data.results[2].firmName).toBe("Beta Law");
    expect(data.results[3].firmName).toBe("Zeta Law");
    expect(data.results[4].firmName).toBe("Delta Law");
  });

  // NEW Phase 7.2 Cache-first / fallback path tests
  it("should return instantly on a cache hit and make no OpenAI/research call", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Alpha Law",
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
      },
    ];
    vi.mocked(prisma.firm.findMany).mockResolvedValue(mockFirms as any);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(runLeadResearch).not.toHaveBeenCalled();
  });

  it("should trigger live research and save firms on a cache miss", async () => {
    const mockDiscovered = [
      {
        id: "new-firm-1",
        firmName: "Discovered Law",
        zip: "90210",
        city: "Beverly Hills",
        state: "CA",
        confidenceLevel: "UNKNOWN",
        verificationStatus: "CANDIDATE",
      },
    ];

    vi.mocked(prisma.firm.findMany)
      .mockResolvedValueOnce([]) // Cache hit check
      .mockResolvedValueOnce(mockDiscovered as any); // Re-query

    vi.mocked(runLeadResearch).mockResolvedValue({
      zip_code: "90210",
      firms: [
        {
          firm_name: "Discovered Law",
          address: "123 Beverly Blvd",
          phone: "555-9020",
          website: "https://discovered.com",
          email: "info@discovered.com",
          attorney_name: "John Smith",
          attorneys: [{ name: "John Smith", email: null }],
        },
      ],
    });

    const request = new NextRequest("http://localhost/api/prospects/search?zip=90210");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toHaveLength(1);
    expect(data.results[0].firmName).toBe("Discovered Law");
    expect(runLeadResearch).toHaveBeenCalledWith("90210", "thorough");
    expect(saveResearchFirms).toHaveBeenCalledWith("90210", expect.any(Array));
  });

  it("should run live research even with cache hit if refresh=true is passed", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Alpha Law",
        zip: "19103",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
      },
    ];

    vi.mocked(prisma.firm.findMany)
      .mockResolvedValueOnce(mockFirms as any) // Initial check
      .mockResolvedValueOnce(mockFirms as any); // Re-query

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103&refresh=true");
    const response = await GET(request);
    expect(response.status).toBe(200);

    expect(runLeadResearch).toHaveBeenCalledWith("19103", "thorough");
    expect(saveResearchFirms).toHaveBeenCalled();
  });

  it("should degrade gracefully returning 200 with empty results and warning if research throws", async () => {
    vi.mocked(prisma.firm.findMany).mockResolvedValue([]);
    vi.mocked(runLeadResearch).mockRejectedValue(new Error("OpenAI Rate Limit Exceeded"));

    const request = new NextRequest("http://localhost/api/prospects/search?zip=10001");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toEqual([]);
    expect(data.warning).toContain("Live research failed");
  });
});
