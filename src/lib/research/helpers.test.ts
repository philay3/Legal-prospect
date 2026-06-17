import { describe, it, expect } from "vitest";
import { cleanDdgUrl, isDirectoryOrSocial, getLikelyOfficialWebsite, SearchResult } from "./runLeadResearch";
import { isUseful } from "./sanitize";

describe("Research pure helpers", () => {
  describe("cleanDdgUrl", () => {
    it("should resolve DuckDuckGo redirect URLs (decodes the uddg param)", () => {
      expect(cleanDdgUrl("https://duckduckgo.com/l/?uddg=https%3A%2F%2Ffirm.com")).toBe("https://firm.com");
      expect(cleanDdgUrl("https://duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.smithlaw.com%2Fcontact%3Fref%3Dddg")).toBe("https://www.smithlaw.com/contact?ref=ddg");
    });

    it("should handle protocol-relative // URLs", () => {
      expect(cleanDdgUrl("//html.duckduckgo.com/l/?uddg=https%3A%2F%2Ffirm.com")).toBe("https://firm.com");
    });

    it("should return plain URLs unchanged if they do not contain uddg parameter", () => {
      expect(cleanDdgUrl("https://firm.com")).toBe("https://firm.com");
    });

    it("should handle parsing failures gracefully and return the original URL", () => {
      expect(cleanDdgUrl("not-a-valid-url")).toBe("not-a-valid-url");
    });
  });

  describe("isDirectoryOrSocial", () => {
    it("should return true for known legal directories and social media sites", () => {
      expect(isDirectoryOrSocial("https://www.avvo.com/attorneys/123-john-doe")).toBe(true);
      expect(isDirectoryOrSocial("https://justia.com/some-path")).toBe(true);
      expect(isDirectoryOrSocial("https://www.linkedin.com/in/someone")).toBe(true);
      expect(isDirectoryOrSocial("https://facebook.com/smithlaw")).toBe(true);
    });

    it("should return false for what appears to be an official firm website", () => {
      expect(isDirectoryOrSocial("https://www.smithlaw.com")).toBe(false);
      expect(isDirectoryOrSocial("https://smithlaw.com/contact")).toBe(false);
      expect(isDirectoryOrSocial("https://subdomain.anotherfirm.org")).toBe(false);
    });

    it("should return true on URL parse failures", () => {
      expect(isDirectoryOrSocial("invalid-url-string")).toBe(true);
    });
  });

  describe("getLikelyOfficialWebsite", () => {
    it("should return the origin of the first non-directory/social result", () => {
      const results: SearchResult[] = [
        { title: "Avvo Profile", url: "https://www.avvo.com/x", snippet: "..." },
        { title: "Smith Law Firm", url: "https://www.smithlaw.com/contact", snippet: "..." },
        { title: "Findlaw Profile", url: "https://findlaw.com/y", snippet: "..." },
      ];
      expect(getLikelyOfficialWebsite(results)).toBe("https://www.smithlaw.com");
    });

    it("should return null if all search results are directories or social sites", () => {
      const results: SearchResult[] = [
        { title: "Avvo Profile", url: "https://www.avvo.com/x", snippet: "..." },
        { title: "Findlaw Profile", url: "https://findlaw.com/y", snippet: "..." },
      ];
      expect(getLikelyOfficialWebsite(results)).toBeNull();
    });

    it("should return null for an empty results list", () => {
      expect(getLikelyOfficialWebsite([])).toBeNull();
    });
  });

  describe("isUseful", () => {
    it("should return false for null, undefined, empty, or placeholder strings", () => {
      expect(isUseful(null)).toBe(false);
      expect(isUseful(undefined)).toBe(false);
      expect(isUseful("")).toBe(false);
      expect(isUseful("   ")).toBe(false);
      expect(isUseful("N/A")).toBe(false);
      expect(isUseful("n/a")).toBe(false);
      expect(isUseful("unknown")).toBe(false);
      expect(isUseful("placeholder")).toBe(false);
      expect(isUseful("example@example.com")).toBe(false);
    });

    it("should return true for valid, useful values", () => {
      expect(isUseful("Smith Law")).toBe(true);
      expect(isUseful("https://smithlaw.com")).toBe(true);
      expect(isUseful("info@smithlaw.com")).toBe(true);
      expect(isUseful("555-0199")).toBe(true);
    });
  });
});
