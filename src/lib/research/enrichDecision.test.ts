import { describe, it, expect } from "vitest";
import { enrichDecision } from "./enrichDecision";

describe("enrichDecision", () => {
  const NOW = new Date("2026-06-01T00:00:00Z");
  const daysAgo = (n: number) => new Date(NOW.getTime() - n * 24 * 60 * 60 * 1000);

  it("uses the existing email when the firm already has a useful one", () => {
    expect(enrichDecision("info@firm.com", null, NOW)).toBe("use-email");
  });

  it("fetches when there is no email and it was never checked", () => {
    expect(enrichDecision(null, null, NOW)).toBe("fetch");
  });

  it("skips when there is no email but it was checked within the last 30 days", () => {
    expect(enrichDecision(null, daysAgo(5), NOW)).toBe("skip");
  });

  it("fetches again when the last check is older than 30 days", () => {
    expect(enrichDecision(null, daysAgo(40), NOW)).toBe("fetch");
  });

  it("prefers the existing email even if it was checked recently", () => {
    expect(enrichDecision("info@firm.com", daysAgo(1), NOW)).toBe("use-email");
  });

  it("treats a placeholder email as not useful and proceeds to fetch", () => {
    expect(enrichDecision("info@example.com", null, NOW)).toBe("fetch");
  });
});
