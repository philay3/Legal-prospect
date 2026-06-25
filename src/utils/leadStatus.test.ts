import { describe, it, expect } from "vitest";
import { parseLeadStatus, LEAD_STATUSES, type LeadStatus } from "./leadStatus";

describe("leadStatus", () => {
  it("LEAD_STATUSES is exactly ACTIVE, WON, LOST", () => {
    expect(LEAD_STATUSES).toEqual(["ACTIVE", "WON", "LOST"]);
  });

  describe("parseLeadStatus", () => {
    it("accepts the three valid statuses and returns them unchanged", () => {
      expect(parseLeadStatus("ACTIVE")).toBe("ACTIVE");
      expect(parseLeadStatus("WON")).toBe("WON");
      expect(parseLeadStatus("LOST")).toBe("LOST");
    });

    it("rejects lowercase or mixed-case variants", () => {
      expect(parseLeadStatus("won")).toBeNull();
      expect(parseLeadStatus("Active")).toBeNull();
      expect(parseLeadStatus("Lost")).toBeNull();
    });

    it("rejects unknown or padded status strings", () => {
      expect(parseLeadStatus("PENDING")).toBeNull();
      expect(parseLeadStatus("DELETED")).toBeNull();
      expect(parseLeadStatus("")).toBeNull();
      expect(parseLeadStatus("  WON  ")).toBeNull();
    });

    it("rejects non-string input", () => {
      expect(parseLeadStatus(null)).toBeNull();
      expect(parseLeadStatus(undefined)).toBeNull();
      expect(parseLeadStatus(0)).toBeNull();
      expect(parseLeadStatus(1)).toBeNull();
      expect(parseLeadStatus({})).toBeNull();
      expect(parseLeadStatus(["WON"])).toBeNull();
      expect(parseLeadStatus(true)).toBeNull();
    });
  });
});