import { describe, it, expect } from "vitest";
import { classifyContact, pickCurrentBest } from "./evidence";

describe("classifyContact", () => {
  describe("email", () => {
    it("scores an email on the firm's own domain as FIRM_DOMAIN", () => {
      expect(
        classifyContact("EMAIL", "info@smithlaw.com", {
          website: "https://www.smithlaw.com",
          sourceType: "GOOGLE_MAPS",
        })
      ).toEqual({ source: "FIRM_DOMAIN", confidence: 0.9 });
    });

    it("scores a consumer-provider email as GENERIC_PROVIDER even when a website is present", () => {
      expect(
        classifyContact("EMAIL", "smithlaw@gmail.com", {
          website: "https://smithlaw.com",
          sourceType: "WEB_SCRAPE",
        })
      ).toEqual({ source: "GENERIC_PROVIDER", confidence: 0.4 });
    });

    it("scores an off-domain email as OFF_DOMAIN", () => {
      expect(
        classifyContact("EMAIL", "hi@some-directory.com", {
          website: "https://smithlaw.com",
          sourceType: null,
        })
      ).toEqual({ source: "OFF_DOMAIN", confidence: 0.5 });
    });

    it("scores an email with no website to compare as UNVERIFIED", () => {
      expect(
        classifyContact("EMAIL", "info@smithlaw.com", {
          website: null,
          sourceType: null,
        })
      ).toEqual({ source: "UNVERIFIED", confidence: 0.5 });
    });
  });

  describe("phone", () => {
    it("scores a Places phone as PLACES", () => {
      expect(
        classifyContact("PHONE", "(914) 555-1212", {
          website: "https://smithlaw.com",
          sourceType: "GOOGLE_MAPS",
        })
      ).toEqual({ source: "PLACES", confidence: 0.85 });
    });

    it("scores a non-Places phone as WEBSITE", () => {
      expect(
        classifyContact("PHONE", "(914) 555-1212", {
          website: "https://smithlaw.com",
          sourceType: "WEB_SCRAPE",
        })
      ).toEqual({ source: "WEBSITE", confidence: 0.55 });
    });
  });
});

describe("pickCurrentBest", () => {
  it("returns null for no observations", () => {
    expect(pickCurrentBest([])).toBeNull();
  });

  it("returns the only observation when there is one", () => {
    expect(
      pickCurrentBest([
        { value: "info@firm.com", source: "FIRM_DOMAIN", confidence: 0.9, observedAt: new Date("2026-06-01") },
      ])
    ).toEqual({ value: "info@firm.com", source: "FIRM_DOMAIN", confidence: 0.9 });
  });

  it("prefers the higher-confidence observation over a newer lower-confidence one", () => {
    expect(
      pickCurrentBest([
        { value: "new@gmail.com", source: "GENERIC_PROVIDER", confidence: 0.4, observedAt: new Date("2026-06-20") },
        { value: "info@firm.com", source: "FIRM_DOMAIN", confidence: 0.9, observedAt: new Date("2026-06-01") },
      ])
    ).toEqual({ value: "info@firm.com", source: "FIRM_DOMAIN", confidence: 0.9 });
  });

  it("breaks a confidence tie by the most recent observation", () => {
    expect(
      pickCurrentBest([
        { value: "old@firm.com", source: "FIRM_DOMAIN", confidence: 0.9, observedAt: new Date("2026-06-01") },
        { value: "new@firm.com", source: "FIRM_DOMAIN", confidence: 0.9, observedAt: new Date("2026-06-20") },
      ])
    ).toEqual({ value: "new@firm.com", source: "FIRM_DOMAIN", confidence: 0.9 });
  });
});