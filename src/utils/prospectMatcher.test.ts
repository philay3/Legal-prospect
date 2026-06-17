import { describe, it, expect } from "vitest";
import { normalizeZipCode, matchProspectsByZip } from "./prospectMatcher";
import { Prospect } from "../types/prospect";
import { SEED_PROSPECTS } from "../data/prospects";

// Fictional prospects for testing
const mockProspects: Prospect[] = [
  {
    id: "p1",
    firmName: "Test Law A",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: null,
    website: null,
    phone: null,
    email: null,
    practiceAreas: ["General"],
    attorneyCountRange: "1-2",
    attorneys: [],
    sourceType: "MANUAL",
    sourceUrl: null,
    confidenceLevel: "HIGH",
    verificationStatus: "VERIFIED",
    lastCheckedDate: null,
    globalNotes: null,
  },
  {
    id: "p2",
    firmName: "Test Law B",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: null,
    website: "https://test.com",
    phone: "555-1234",
    email: null,
    practiceAreas: ["Tax"],
    attorneyCountRange: "5-10",
    attorneys: [],
    sourceType: "MANUAL",
    sourceUrl: null,
    confidenceLevel: "MEDIUM",
    verificationStatus: "VERIFIED",
    lastCheckedDate: null,
    globalNotes: "Rittenhouse",
  },
  {
    id: "p3",
    firmName: "Test Law C",
    zip: "90210",
    zipExt: null,
    city: "Beverly Hills",
    state: "CA",
    streetAddress: null,
    website: null,
    phone: null,
    email: null,
    practiceAreas: ["IP"],
    attorneyCountRange: "2-5",
    attorneys: [],
    sourceType: "MANUAL",
    sourceUrl: null,
    confidenceLevel: "LOW",
    verificationStatus: "VERIFIED",
    lastCheckedDate: null,
    globalNotes: null,
  },
  {
    id: "p4",
    firmName: "Padded Law",
    zip: " 19103 ", // Untrimmed ZIP to test robustness
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: null,
    website: null,
    phone: null,
    email: null,
    practiceAreas: ["Family"],
    attorneyCountRange: "1",
    attorneys: [],
    sourceType: "MANUAL",
    sourceUrl: null,
    confidenceLevel: "HIGH",
    verificationStatus: "VERIFIED",
    lastCheckedDate: null,
    globalNotes: null,
  },
];

describe("prospectMatcher utility tests", () => {
  describe("normalizeZipCode", () => {
    it("should return clean 5-digit ZIP codes", () => {
      expect(normalizeZipCode("19103")).toBe("19103");
      expect(normalizeZipCode("90210")).toBe("90210");
    });

    it("should trim surrounding whitespace from ZIP codes", () => {
      expect(normalizeZipCode("  19103  ")).toBe("19103");
      expect(normalizeZipCode("\t90210\n")).toBe("90210");
    });

    it("should support and normalize ZIP+4 formats to the base 5 digits", () => {
      expect(normalizeZipCode("19103-1234")).toBe("19103");
      expect(normalizeZipCode("90210-9999")).toBe("90210");
      expect(normalizeZipCode("  19103-1234  ")).toBe("19103");
    });

    it("should return null for invalid or incomplete ZIP formats", () => {
      expect(normalizeZipCode("1910")).toBeNull(); // 4 digits
      expect(normalizeZipCode("191034")).toBeNull(); // 6 digits
      expect(normalizeZipCode("abcde")).toBeNull(); // letters
      expect(normalizeZipCode("1910a")).toBeNull(); // mixed
      expect(normalizeZipCode("")).toBeNull(); // empty string
      expect(normalizeZipCode(null)).toBeNull(); // null
      expect(normalizeZipCode(undefined)).toBeNull(); // undefined
      expect(normalizeZipCode("19103-12")).toBeNull(); // ZIP+2 (invalid)
      expect(normalizeZipCode("19103-12345")).toBeNull(); // ZIP+5 (invalid)
      expect(normalizeZipCode("19103-abcd")).toBeNull(); // ZIP+letters (invalid)
    });

    // Required by current-task.md explicitly
    it("should cover the exact requested regression cases for normalization", () => {
      expect(normalizeZipCode("19103-1234")).toBe("19103");
      expect(normalizeZipCode(" 19103-1234 ")).toBe("19103");
      expect(normalizeZipCode("19103-12")).toBeNull();
      expect(normalizeZipCode("19103-12345")).toBeNull();
    });
  });

  describe("matchProspectsByZip", () => {
    it("should find prospects matching the target ZIP code", () => {
      const results = matchProspectsByZip(mockProspects, "19103");
      expect(results).toHaveLength(3); // p1, p2, and p4 (normalized)
      expect(results.map((r) => r.id)).toContain("p1");
      expect(results.map((r) => r.id)).toContain("p2");
      expect(results.map((r) => r.id)).toContain("p4");
    });

    it("should handle search ZIP normalization gracefully", () => {
      const results = matchProspectsByZip(mockProspects, "  19103  ");
      expect(results).toHaveLength(3);
    });

    it("should support and normalize ZIP+4 format searches", () => {
      const results = matchProspectsByZip(mockProspects, "19103-1234");
      expect(results).toHaveLength(3); // p1, p2, and p4 (normalized)
      expect(results.map((r) => r.id)).toContain("p1");
      expect(results.map((r) => r.id)).toContain("p2");
      expect(results.map((r) => r.id)).toContain("p4");
    });

    it("should return an empty list if search ZIP code is invalid", () => {
      expect(matchProspectsByZip(mockProspects, "123")).toHaveLength(0);
      expect(matchProspectsByZip(mockProspects, "")).toHaveLength(0);
      expect(matchProspectsByZip(mockProspects, null)).toHaveLength(0);
      expect(matchProspectsByZip(mockProspects, "19103-12")).toHaveLength(0);
    });

    it("should return an empty list if no prospects match the target ZIP", () => {
      const results = matchProspectsByZip(mockProspects, "10001");
      expect(results).toHaveLength(0);
    });

    it("should return an empty list if prospects array is empty", () => {
      expect(matchProspectsByZip([], "19103")).toHaveLength(0);
    });

    // Required by current-task.md explicitly
    it("should match SEED_PROSPECTS correctly for ZIP+4", () => {
      const matchesForZip5 = matchProspectsByZip(SEED_PROSPECTS, "19103");
      const matchesForZip4 = matchProspectsByZip(SEED_PROSPECTS, "19103-1234");
      
      expect(matchesForZip5).toHaveLength(4);
      expect(matchesForZip4).toHaveLength(4);
      expect(matchesForZip4).toEqual(matchesForZip5);
    });
  });
});
