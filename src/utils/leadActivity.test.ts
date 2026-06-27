import { describe, it, expect } from "vitest";
import { leadActivityLine } from "./leadActivity";

const NOW = new Date("2026-06-26T18:00:00Z");

describe("leadActivityLine", () => {
  it("labels an active lead Saved, timed from when it was saved", () => {
    const lead = {
      status: "ACTIVE",
      savedAt: "2026-06-23T18:00:00Z",
      statusChangedAt: "2026-06-23T18:00:00Z",
    };
    expect(leadActivityLine(lead, NOW)).toBe("Saved · 3d ago");
  });

  it("labels a won lead Closed, timed from when the status changed", () => {
    const lead = {
      status: "WON",
      savedAt: "2026-06-01T18:00:00Z",
      statusChangedAt: "2026-06-26T13:00:00Z",
    };
    expect(leadActivityLine(lead, NOW)).toBe("Closed · 5h ago");
  });

  it("labels a lost lead Closed, timed from when the status changed", () => {
    const lead = {
      status: "LOST",
      savedAt: "2026-06-01T18:00:00Z",
      statusChangedAt: "2026-06-20T18:00:00Z",
    };
    expect(leadActivityLine(lead, NOW)).toBe("Closed · 6d ago");
  });

  it("treats a missing status as active", () => {
    const lead = {
      status: undefined,
      savedAt: "2026-06-25T18:00:00Z",
      statusChangedAt: "2026-06-25T18:00:00Z",
    };
    expect(leadActivityLine(lead, NOW)).toBe("Saved · 1d ago");
  });
});