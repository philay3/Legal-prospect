import { describe, it, expect, vi, beforeEach } from "vitest";
import { saveResearchFirms, buildAttorneyInputs } from "./saveResearchFirms";
import prisma from "../prisma";
import zipcodes from "zipcodes";

vi.mock("../prisma", () => ({
  default: {
    firm: {
      findFirst: vi.fn(),
      update: vi.fn(),
      create: vi.fn(),
    },
    attorney: {
      upsert: vi.fn(),
    },
    practiceArea: {
      upsert: vi.fn(),
      createMany: vi.fn(),
      findMany: vi.fn(),
    },
    firmPracticeArea: {
      upsert: vi.fn(),
      createMany: vi.fn(),
    },
  },
}));

vi.mock("zipcodes", () => ({
  default: {
    lookup: vi.fn(),
  },
}));

describe("saveResearchFirms", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(prisma.firm.create).mockResolvedValue({ id: "mock-firm-id", practiceAreas: [] } as any);
    vi.mocked(prisma.firm.update).mockResolvedValue({ id: "mock-firm-id" } as any);
    vi.mocked(prisma.attorney.upsert).mockResolvedValue({} as any);
    vi.mocked(prisma.practiceArea.upsert).mockImplementation((({ where }: any) => {
      const name = where.name || "";
      return Promise.resolve({
        id: `area-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as any);
    }) as any);
    vi.mocked(prisma.firmPracticeArea.upsert).mockResolvedValue({} as any);
    vi.mocked(prisma.practiceArea.createMany).mockResolvedValue({ count: 0 } as any);
    vi.mocked(prisma.practiceArea.findMany).mockImplementation(((args: any) => {
      const names = args?.where?.name?.in || [];
      return Promise.resolve(names.map((name: string) => ({
        id: `area-${name.replace(/\s+/g, "-").toLowerCase()}`,
        name,
      })));
    }) as any);
    vi.mocked(prisma.firmPracticeArea.createMany).mockResolvedValue({ count: 0 } as any);
  });

  it("should create a new firm if it does not exist", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue({
      zip: "19103",
      city: "Philadelphia",
      state: "PA",
      latitude: 0,
      longitude: 0,
      country: "US",
    });

    vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

    const mockFirms = [
      {
        firm_name: "Mock Law Firm",
        address: "123 Market St",
        phone: "555-1234",
        website: "https://mocklaw.com",
        email: "info@mocklaw.com",
        attorney_name: "Jane Doe",
        attorneys: [
          { name: "Jane Doe", email: "jane@mocklaw.com" },
          { name: "Bob Smith", email: "bob@mocklaw.com" },
        ],
      },
    ];

    await saveResearchFirms("19103", mockFirms);

    expect(prisma.firm.findFirst).toHaveBeenCalledWith({
      where: {
        searchZip: "19103",
        firmName: "Mock Law Firm",
      },
    });

    expect(prisma.firm.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firmName: "Mock Law Firm",
        searchZip: "19103",
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://mocklaw.com",
        phone: "555-1234",
        email: "info@mocklaw.com",
        practiceAreas: [],
        attorneyCountRange: "2-5",
        attorneys: ["Jane Doe", "Bob Smith"],
        sourceType: "WEB_SCRAPE",
        sourceUrl: "https://mocklaw.com",
        confidenceLevel: "UNKNOWN",
        verificationStatus: "CANDIDATE",
        globalNotes: "Discovered via live web research; pending review.",
      }),
    });
  });

  it("should update an existing firm with only useful incoming fields", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue({
      zip: "19103",
      city: "Philadelphia",
      state: "PA",
      latitude: 0,
      longitude: 0,
      country: "US",
    });

    const existingFirm = {
      id: "existing-id",
      firmName: "Mock Law Firm",
      zip: "19103",
      city: "Philadelphia",
      state: "PA",
      streetAddress: "123 Market St",
      website: "https://mocklaw.com",
      phone: "555-1234",
      email: null,
      practiceAreas: ["Injury"],
      attorneyCountRange: "1",
      attorneys: ["Jane Doe"],
      sourceType: "MANUAL_SEED",
      confidenceLevel: "HIGH",
      verificationStatus: "VERIFIED",
    };

    vi.mocked(prisma.firm.findFirst).mockResolvedValue(existingFirm as any);

    const incomingFirms = [
      {
        firm_name: "Mock Law Firm",
        address: "unknown",
        phone: "na",
        website: "https://mocklaw-new.com",
        email: "new@mocklaw.com",
        attorney_name: null,
        attorneys: [],
      },
    ];

    await saveResearchFirms("19103", incomingFirms);

    expect(prisma.firm.update).toHaveBeenCalledWith({
      where: { id: "existing-id" },
      data: expect.objectContaining({
        website: "https://mocklaw-new.com",
        sourceUrl: "https://mocklaw-new.com",
        email: "new@mocklaw.com",
      }),
    });

    const updateCallArg = vi.mocked(prisma.firm.update).mock.calls[0][0].data;
    expect(updateCallArg.streetAddress).toBeUndefined();
    expect(updateCallArg.phone).toBeUndefined();
    expect(updateCallArg.attorneys).toBeUndefined();
    expect(updateCallArg.attorneyCountRange).toBeUndefined();
  });

  it("should fall back to empty string city/state if ZIP code is invalid or not found", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue(undefined);
    vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

    const mockFirms = [
      {
        firm_name: "Unknown Zip Firm",
        address: "Somewhere",
        phone: null,
        website: null,
        email: null,
      },
    ];

    await saveResearchFirms("99999", mockFirms);

    expect(prisma.firm.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firmName: "Unknown Zip Firm",
        searchZip: "99999",
        zip: "99999",
        city: "",
        state: "",
      }),
    });
  });

  it("should derive attorneyCountRange correctly based on count", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue(undefined);
    vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

    const testCases = [
      { attorneys: [], expected: "Unknown" },
      { attorneys: [{ name: "A1", email: null }], expected: "1" },
      { attorneys: [{ name: "A1", email: null }, { name: "A2", email: null }], expected: "2-5" },
      { attorneys: Array(7).fill({ name: "A", email: null }), expected: "6-10" },
      { attorneys: Array(12).fill({ name: "A", email: null }), expected: "11+" },
    ];

    for (const tc of testCases) {
      vi.clearAllMocks();
      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

      await saveResearchFirms("99999", [
        {
          firm_name: "Test Count Firm",
          address: null,
          phone: null,
          website: null,
          email: null,
          attorneys: tc.attorneys,
        },
      ]);

      expect(prisma.firm.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          attorneyCountRange: tc.expected,
        }),
      });
    }
  });

  it("should sanitize control and NUL characters in inputs before saving", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue({
      zip: "19103",
      city: "Philadelphia",
      state: "PA",
      latitude: 0,
      longitude: 0,
      country: "US",
    });

    vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

    const dirtyFirms = [
      {
        firm_name: "Dirty\u0000 Law Firm",
        address: "123\u0001 Market St",
        phone: "555-\u00001234",
        website: "https://dirty\u0002law.com",
        email: "info@dirty\u0000law.com",
        attorney_name: "Jane\u0008 Doe",
        attorneys: [
          { name: "Jane\u0008 Doe", email: "jane@dirty\u0000law.com" },
        ],
      },
    ];

    await saveResearchFirms("19103", dirtyFirms);

    expect(prisma.firm.create).toHaveBeenCalledWith({
      data: expect.objectContaining({
        firmName: "Dirty Law Firm",
        searchZip: "19103",
        zip: "19103",
        streetAddress: "123 Market St",
        website: "https://dirtylaw.com",
        phone: "555-1234",
        email: "info@dirtylaw.com",
        attorneys: ["Jane Doe"],
      }),
    });
  });

  it("should isolate database errors and continue saving other firms in the batch", async () => {
    vi.mocked(zipcodes.lookup).mockReturnValue(undefined);
    vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

    // Mock create to reject the first call but resolve the second
    vi.mocked(prisma.firm.create)
      .mockRejectedValueOnce(new Error("Database crash on first record"))
      .mockResolvedValueOnce({} as any);

    const batch = [
      { firm_name: "Failing Firm", address: null, phone: null, website: null, email: null },
      { firm_name: "Succeeding Firm", address: null, phone: null, website: null, email: null },
    ];

    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});

    await saveResearchFirms("99999", batch);

    // Verify both were processed: the first failed, but the second created was attempted and succeeded
    expect(prisma.firm.create).toHaveBeenCalledTimes(2);
    expect(prisma.firm.create).toHaveBeenNthCalledWith(
      1,
      expect.objectContaining({
        data: expect.objectContaining({ firmName: "Failing Firm" }),
      })
    );
    expect(prisma.firm.create).toHaveBeenNthCalledWith(
      2,
      expect.objectContaining({
        data: expect.objectContaining({ firmName: "Succeeding Firm" }),
      })
    );

    expect(consoleSpy).toHaveBeenCalled();
    consoleSpy.mockRestore();
  });

  describe("buildAttorneyInputs", () => {
    it("should return trimmed, de-duplicated attorney records and strip NUL bytes", () => {
      const firmId = "firm-123";
      const names = [
        "Jane Doe",
        "  Bob Smith  ",
        "Jane Doe", // exact dupe
        "", // empty
        "   ", // whitespace
        "Dirty\u0000 Name", // NUL character
      ];

      const result = buildAttorneyInputs(firmId, names);

      expect(result).toEqual([
        { firmId: "firm-123", name: "Jane Doe" },
        { firmId: "firm-123", name: "Bob Smith" },
        { firmId: "firm-123", name: "Dirty Name" },
      ]);
    });

    it("should handle empty names list", () => {
      expect(buildAttorneyInputs("firm-123", [])).toEqual([]);
    });
  });

  describe("Attorney dual-write database saves", () => {
    it("should call attorney upsert once per unique name on create", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

      const mockFirms = [
        {
          firm_name: "Mock Law Firm",
          address: "123 Market St",
          phone: "555-1234",
          website: "https://mocklaw.com",
          email: "info@mocklaw.com",
          attorney_name: "Jane Doe",
          attorneys: [
            { name: "Jane Doe", email: "jane@mocklaw.com" },
            { name: "Bob Smith", email: "bob@mocklaw.com" },
          ],
        },
      ];

      await saveResearchFirms("19103", mockFirms);

      // Verify firm was created
      expect(prisma.firm.create).toHaveBeenCalled();

      // Verify attorney upsert called for each unique attorney name
      expect(prisma.attorney.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.attorney.upsert).toHaveBeenCalledWith({
        where: {
          firmId_name: { firmId: "mock-firm-id", name: "Jane Doe" },
        },
        create: {
          firmId: "mock-firm-id",
          name: "Jane Doe",
        },
        update: {},
      });
      expect(prisma.attorney.upsert).toHaveBeenCalledWith({
        where: {
          firmId_name: { firmId: "mock-firm-id", name: "Bob Smith" },
        },
        create: {
          firmId: "mock-firm-id",
          name: "Bob Smith",
        },
        update: {},
      });
    });

    it("should call attorney upsert once per unique name on update", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      const existingFirm = {
        id: "existing-id",
        firmName: "Mock Law Firm",
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://mocklaw.com",
        phone: "555-1234",
        email: null,
        practiceAreas: [],
        attorneyCountRange: "1",
        attorneys: ["Jane Doe"],
        sourceType: "WEB_SCRAPE",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
      };

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(existingFirm as any);

      const incomingFirms = [
        {
          firm_name: "Mock Law Firm",
          address: null,
          phone: null,
          website: null,
          email: null,
          attorneys: [
            { name: "Jane Doe", email: null },
            { name: "Bob Smith", email: null },
          ],
        },
      ];

      await saveResearchFirms("19103", incomingFirms);

      // Verify firm was updated
      expect(prisma.firm.update).toHaveBeenCalled();

      // Verify attorney upsert called for each unique name
      expect(prisma.attorney.upsert).toHaveBeenCalledTimes(2);
      expect(prisma.attorney.upsert).toHaveBeenCalledWith({
        where: {
          firmId_name: { firmId: "existing-id", name: "Jane Doe" },
        },
        create: {
          firmId: "existing-id",
          name: "Jane Doe",
        },
        update: {},
      });
      expect(prisma.attorney.upsert).toHaveBeenCalledWith({
        where: {
          firmId_name: { firmId: "existing-id", name: "Bob Smith" },
        },
        create: {
          firmId: "existing-id",
          name: "Bob Smith",
        },
        update: {},
      });
    });
  });

  describe("Practice areas database saves", () => {
    it("should normalize practice areas on create", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

      const mockFirms = [
        {
          firm_name: "Mock Law Firm",
          address: "123 Market St",
          phone: "555-1234",
          website: "https://mocklaw.com",
          email: "info@mocklaw.com",
          practiceAreas: ["Family Law", "family law", "  IP    Law "],
        },
      ];

      await saveResearchFirms("19103", mockFirms);

      expect(prisma.firm.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          practiceAreas: ["Family Law", "IP Law"],
        }),
      });
    });

    it("should union new practice areas with existing practice areas on update", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      const existingFirm = {
        id: "existing-id",
        firmName: "Mock Law Firm",
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://mocklaw.com",
        phone: "555-1234",
        email: null,
        practiceAreas: ["Estate Planning"],
        attorneyCountRange: "Unknown",
        attorneys: [],
        sourceType: "WEB_SCRAPE",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
      };

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(existingFirm as any);

      const incomingFirms = [
        {
          firm_name: "Mock Law Firm",
          address: null,
          phone: null,
          website: null,
          email: null,
          practice_areas: ["Family Law", "estate planning"],
        },
      ];

      await saveResearchFirms("19103", incomingFirms);

      expect(prisma.firm.update).toHaveBeenCalledWith({
        where: { id: "existing-id" },
        data: expect.objectContaining({
          practiceAreas: ["Estate Planning", "Family Law"],
        }),
      });
    });

    it("should dual-write practice areas and firm-practice-area links on create", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);
      vi.mocked(prisma.firm.create).mockResolvedValue({
        id: "mock-firm-id",
        practiceAreas: ["Family Law", "Estate Planning"],
      } as any);

      const mockFirms = [
        {
          firm_name: "Mock Law Firm",
          address: "123 Market St",
          phone: "555-1234",
          website: "https://mocklaw.com",
          email: "info@mocklaw.com",
          practiceAreas: ["Family Law", "family law", "Estate Planning"],
        },
      ];

      await saveResearchFirms("19103", mockFirms);

      expect(prisma.practiceArea.createMany).toHaveBeenCalledWith({
        data: [
          { name: "Family Law" },
          { name: "Estate Planning" },
        ],
        skipDuplicates: true,
      });

      expect(prisma.firmPracticeArea.createMany).toHaveBeenCalledWith({
        data: [
          { firmId: "mock-firm-id", practiceAreaId: "area-family-law" },
          { firmId: "mock-firm-id", practiceAreaId: "area-estate-planning" },
        ],
        skipDuplicates: true,
      });
    });

    it("should dual-write the union of existing and new practice areas on update", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      const existingFirm = {
        id: "existing-id",
        firmName: "Mock Law Firm",
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://mocklaw.com",
        phone: "555-1234",
        email: null,
        practiceAreas: ["Estate Planning"],
        attorneyCountRange: "Unknown",
        attorneys: [],
        sourceType: "WEB_SCRAPE",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
      };

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(existingFirm as any);

      const incomingFirms = [
        {
          firm_name: "Mock Law Firm",
          address: null,
          phone: null,
          website: null,
          email: null,
          practice_areas: ["Family Law", "estate planning"],
        },
      ];

      await saveResearchFirms("19103", incomingFirms);

      expect(prisma.practiceArea.createMany).toHaveBeenCalledWith({
        data: [
          { name: "Family Law" },
          { name: "Estate Planning" },
        ],
        skipDuplicates: true,
      });

      expect(prisma.firmPracticeArea.createMany).toHaveBeenCalledWith({
        data: [
          { firmId: "existing-id", practiceAreaId: "area-family-law" },
          { firmId: "existing-id", practiceAreaId: "area-estate-planning" },
        ],
        skipDuplicates: true,
      });
    });

    it("should deduplicate overlapping practice areas across concurrent firms", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

      const mockFirms = [
        {
          firm_name: "Firm A",
          address: null,
          phone: null,
          website: null,
          email: null,
          practiceAreas: ["Estate Planning", "Family Law"],
        },
        {
          firm_name: "Firm B",
          address: null,
          phone: null,
          website: null,
          email: null,
          practiceAreas: ["Estate Planning", "Civil Litigation"],
        },
      ];

      await saveResearchFirms("19103", mockFirms);

      // Verify createMany is called with the distinct canonical set across all firms in the batch
      expect(prisma.practiceArea.createMany).toHaveBeenCalledWith({
        data: [
          { name: "Estate Planning" },
          { name: "Family Law" },
          { name: "Civil Litigation" },
        ],
        skipDuplicates: true,
      });
    });
  });

  describe("searchZip logic and address isolation", () => {
    it("should set searchZip to the searched ZIP and physical zip to the overridden Places zip if they differ", async () => {
      vi.mocked(zipcodes.lookup).mockReturnValue({
        zip: "19103",
        city: "Philadelphia",
        state: "PA",
        latitude: 0,
        longitude: 0,
        country: "US",
      });

      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);

      const mockFirms = [
        {
          firm_name: "Places Overridden Firm",
          address: "123 Market St",
          phone: "555-1234",
          website: "https://mocklaw.com",
          email: "info@mocklaw.com",
          zip: "08002",
          city: "Cherry Hill",
          state: "NJ",
          sourceType: "GOOGLE_MAPS",
        },
      ];

      await saveResearchFirms("19103", mockFirms);

      expect(prisma.firm.findFirst).toHaveBeenCalledWith({
        where: {
          searchZip: "19103",
          firmName: "Places Overridden Firm",
        },
      });

      expect(prisma.firm.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          firmName: "Places Overridden Firm",
          searchZip: "19103",
          zip: "08002",
          city: "Cherry Hill",
          state: "NJ",
        }),
      });
    });

    it("should produce two rows when the same firm is saved under two different searched ZIPs", async () => {
      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);
      await saveResearchFirms("19103", [
        { firm_name: "Split Firm", address: "123 Main St", phone: null, website: null, email: null }
      ]);
      expect(prisma.firm.findFirst).toHaveBeenLastCalledWith({
        where: { searchZip: "19103", firmName: "Split Firm" }
      });
      expect(prisma.firm.create).toHaveBeenLastCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          firmName: "Split Firm",
          searchZip: "19103"
        })
      }));

      await saveResearchFirms("08002", [
        { firm_name: "Split Firm", address: "123 Main St", phone: null, website: null, email: null }
      ]);
      expect(prisma.firm.findFirst).toHaveBeenLastCalledWith({
        where: { searchZip: "08002", firmName: "Split Firm" }
      });
      expect(prisma.firm.create).toHaveBeenLastCalledWith(expect.objectContaining({
        data: expect.objectContaining({
          firmName: "Split Firm",
          searchZip: "08002"
        })
      }));
    });

    it("should not collide two different firms under the same searchZip", async () => {
      vi.mocked(prisma.firm.findFirst).mockResolvedValue(null);
      
      const batch = [
        { firm_name: "Firm Alpha", address: null, phone: null, website: null, email: null },
        { firm_name: "Firm Beta", address: null, phone: null, website: null, email: null }
      ];

      await saveResearchFirms("19103", batch);

      expect(prisma.firm.findFirst).toHaveBeenCalledWith({
        where: { searchZip: "19103", firmName: "Firm Alpha" }
      });
      expect(prisma.firm.findFirst).toHaveBeenCalledWith({
        where: { searchZip: "19103", firmName: "Firm Beta" }
      });
      expect(prisma.firm.create).toHaveBeenCalledTimes(2);
    });
  });
});

