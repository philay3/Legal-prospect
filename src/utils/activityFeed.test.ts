import { describe, it, expect } from "vitest";
import { formatRelativeTime, formatActivityEvent } from "./activityFeed";

const NOW = new Date("2026-06-23T12:00:00.000Z");
const SEC = 1000;
const MIN = 60 * SEC;
const HOUR = 60 * MIN;
const DAY = 24 * HOUR;
const ago = (ms: number) => new Date(NOW.getTime() - ms);

describe("formatRelativeTime", () => {
  it("shows 'just now' for under a minute", () => {
    expect(formatRelativeTime(ago(30 * SEC), NOW)).toBe("just now");
  });
  it("shows minutes", () => {
    expect(formatRelativeTime(ago(1 * MIN), NOW)).toBe("1m ago");
    expect(formatRelativeTime(ago(5 * MIN), NOW)).toBe("5m ago");
  });
  it("shows hours", () => {
    expect(formatRelativeTime(ago(3 * HOUR), NOW)).toBe("3h ago");
  });
  it("shows days", () => {
    expect(formatRelativeTime(ago(2 * DAY), NOW)).toBe("2d ago");
  });
  it("shows weeks", () => {
    expect(formatRelativeTime(ago(10 * DAY), NOW)).toBe("1w ago");
    expect(formatRelativeTime(ago(20 * DAY), NOW)).toBe("2w ago");
  });
  it("shows months", () => {
    expect(formatRelativeTime(ago(45 * DAY), NOW)).toBe("1mo ago");
  });
  it("shows years", () => {
    expect(formatRelativeTime(ago(400 * DAY), NOW)).toBe("1y ago");
  });
  it("accepts ISO strings", () => {
    expect(formatRelativeTime(ago(2 * DAY).toISOString(), NOW)).toBe("2d ago");
  });
  it("clamps future dates to 'just now'", () => {
    expect(formatRelativeTime(new Date(NOW.getTime() + DAY), NOW)).toBe("just now");
  });
});

describe("formatActivityEvent", () => {
  it("formats a search using the ZIP", () => {
    expect(formatActivityEvent({ type: "SEARCHED", query: "01742" })).toEqual({
      label: "Searched",
      subject: "01742",
      kind: "searched",
    });
  });
  it("formats saved / won / lost using the firm name", () => {
    expect(formatActivityEvent({ type: "SAVED", firm: { firmName: "Smith Law" } })).toEqual({
      label: "Saved",
      subject: "Smith Law",
      kind: "saved",
    });
    expect(formatActivityEvent({ type: "WON", firm: { firmName: "Smith Law" } })).toEqual({
      label: "Won",
      subject: "Smith Law",
      kind: "won",
    });
    expect(formatActivityEvent({ type: "LOST", firm: { firmName: "Smith Law" } })).toEqual({
      label: "Lost",
      subject: "Smith Law",
      kind: "lost",
    });
  });
  it("falls back when the firm or query is missing", () => {
    expect(formatActivityEvent({ type: "SAVED", firm: null }).subject).toBe("a firm");
    expect(formatActivityEvent({ type: "SEARCHED", query: null }).subject).toBe("a ZIP");
  });
});