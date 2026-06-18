import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { selectProvider, getSearchProvider } from "./index";
import { mapTavilySearchToContext, mapTavilyExtractToText, TavilySearchProvider } from "./tavily";
import { DdgSearchProvider } from "./ddg";
import { extractEmails } from "../sanitize";

describe("Tavily Provider and Helpers", () => {
  describe("selectProvider", () => {
    it("should resolve correct provider keys", () => {
      expect(selectProvider(undefined)).toBe("tavily");
      expect(selectProvider("")).toBe("tavily");
      expect(selectProvider("   ")).toBe("tavily");
      expect(selectProvider("tavily")).toBe("tavily");
      expect(selectProvider("TAVILY")).toBe("tavily");
      expect(selectProvider("ddg")).toBe("ddg");
      expect(selectProvider("DDG")).toBe("ddg");
      expect(selectProvider("unknown")).toBe("tavily");
    });
  });

  describe("mapTavilySearchToContext", () => {
    it("should map search results to grounding context strings", () => {
      const mockRaw = {
        results: [
          { title: "Smith Law", url: "https://smith.com", content: "Personal injury experts." },
          { title: "Jones Law", url: "https://jones.com", snippet: "Criminal defense trial attorneys." },
          { title: "Empty", url: "https://empty.com", content: "" }
        ]
      };
      const mapped = mapTavilySearchToContext(mockRaw);
      expect(mapped).toEqual(["Personal injury experts.", "Criminal defense trial attorneys."]);
    });

    it("should handle empty or malformed inputs gracefully", () => {
      expect(mapTavilySearchToContext(null)).toEqual([]);
      expect(mapTavilySearchToContext(undefined)).toEqual([]);
      expect(mapTavilySearchToContext({})).toEqual([]);
      expect(mapTavilySearchToContext({ results: [] })).toEqual([]);
    });
  });

  describe("mapTavilyExtractToText", () => {
    it("should concatenate raw content from extract results", () => {
      const mockRaw = {
        results: [
          { url: "https://firm.com/contact", raw_content: "Contact us at info@firm.com" },
          { url: "https://firm.com/about", content: "About our boutique firm" }
        ]
      };
      const text = mapTavilyExtractToText(mockRaw);
      expect(text).toBe("Contact us at info@firm.com\n\nAbout our boutique firm");
    });

    it("should handle empty or missing content fields", () => {
      const mockRaw = {
        results: [
          { url: "https://firm.com", raw_content: "" }
        ]
      };
      expect(mapTavilyExtractToText(mockRaw)).toBe("");
    });

    it("should handle empty or malformed responses gracefully", () => {
      expect(mapTavilyExtractToText(null)).toBe("");
      expect(mapTavilyExtractToText(undefined)).toBe("");
      expect(mapTavilyExtractToText({})).toBe("");
    });
  });

  describe("extractEmails on Tavily text", () => {
    it("should find and clean email addresses", () => {
      const text = "Hi, write to contact@martinlaw.com or contact our team at contact@martinlaw.com. Ignore wordpress@martinlaw.com.";
      const emails = extractEmails(text);
      expect(emails).toEqual(["contact@martinlaw.com"]);
    });
  });

  describe("Provider Factory delegation and mock tests", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      process.env = originalEnv;
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("should factory to DDG provider if explicitly configured", () => {
      process.env.SEARCH_PROVIDER = "ddg";
      process.env.TAVILY_API_KEY = "tvly-key";
      const provider = getSearchProvider();
      expect(provider).toBeInstanceOf(DdgSearchProvider);
    });

    it("should factory to DDG if Tavily key is missing", () => {
      process.env.SEARCH_PROVIDER = "tavily";
      delete process.env.TAVILY_API_KEY;
      const provider = getSearchProvider();
      expect(provider).toBeInstanceOf(DdgSearchProvider);
    });

    it("should factory to Tavily if key is set and SEARCH_PROVIDER is default/tavily", () => {
      process.env.SEARCH_PROVIDER = "tavily";
      process.env.TAVILY_API_KEY = "tvly-key";
      const provider = getSearchProvider();
      expect(provider).toBeInstanceOf(TavilySearchProvider);
    });

    it("should NOT make Tavily requests when DuckDuckGo provider is active", async () => {
      process.env.SEARCH_PROVIDER = "ddg";
      process.env.TAVILY_API_KEY = "tvly-key";

      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          text: () => Promise.resolve("<html><body><a class=\"result__snippet\">DDG snippet</a></body></html>")
        })
      );
      vi.stubGlobal("fetch", mockFetch);

      const provider = getSearchProvider();
      const res = await provider.getSearchContext("19103", "quick");

      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalled();

      // Assert that none of the calls targeted Tavily endpoints
      const calledUrls = mockFetch.mock.calls.map(call => call[0]);
      for (const url of calledUrls) {
        expect(url).not.toContain("api.tavily.com");
      }
    });

    it("should query Tavily API when Tavily provider is active", async () => {
      process.env.SEARCH_PROVIDER = "tavily";
      process.env.TAVILY_API_KEY = "tvly-key";

      const mockFetch = vi.fn().mockImplementation(() =>
        Promise.resolve({
          ok: true,
          json: () => Promise.resolve({
            results: [{ title: "Tavily result", url: "https://firm.com", content: "Tavily snippet text" }]
          })
        })
      );
      vi.stubGlobal("fetch", mockFetch);

      const provider = getSearchProvider();
      const res = await provider.getSearchContext("19103", "quick");

      expect(res.success).toBe(true);
      expect(mockFetch).toHaveBeenCalled();

      const calledUrls = mockFetch.mock.calls.map(call => call[0]);
      expect(calledUrls[0]).toContain("api.tavily.com/search");
    });
  });
});
