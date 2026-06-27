import { describe, it, expect } from "vitest";
import { parseZipInput } from "./parseZipInput";

// parseZipInput now returns a structured result so the UI can show a specific
// message when input is rejected:
//   { zips: string[]; error: string | null }
// - zips:  the resolved, normalized, deduped list (capped semantics below)
// - error: a user-facing message when the input is rejected, else null
//
// Rules under test:
// - Tokens are separated by commas and/or whitespace, in any combination.
// - Each token is either a 5-digit ZIP, a ZIP+4 (normalized to its 5-digit base),
//   or a 5-digit range "AAAAA-BBBBB" that expands inclusively.
// - A range expands ascending when A <= B and descending when A > B.
// - Leading zeros are preserved on expansion.
// - Results are deduped, preserving first-seen order.
// - If the resolved set would exceed 5 ZIPs (from a range, from singles, or a mix),
//   the whole input is rejected: zips is empty and error is set.
// - Invalid or malformed tokens are dropped. If nothing valid remains, zips is
//   empty and error is null (the caller shows its own "enter a valid ZIP" message).

describe("parseZipInput", () => {
  describe("empty and invalid input", () => {
    it("returns empty zips and no error for an empty string", () => {
      expect(parseZipInput("")).toEqual({ zips: [], error: null });
    });

    it("returns empty zips and no error for whitespace only", () => {
      expect(parseZipInput("   ")).toEqual({ zips: [], error: null });
    });

    it("drops non-ZIP tokens and reports no error when nothing valid remains", () => {
      expect(parseZipInput("abc, 123, ////")).toEqual({ zips: [], error: null });
    });

    it("keeps valid ZIPs and drops invalid tokens in a mixed list", () => {
      const result = parseZipInput("19103, abc, 123, 08002");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002"]);
    });
  });

  describe("single ZIP and ZIP+4", () => {
    it("returns a single valid ZIP", () => {
      expect(parseZipInput("19103")).toEqual({ zips: ["19103"], error: null });
    });

    it("normalizes a ZIP+4 to its 5-digit base and does not treat it as a range", () => {
      expect(parseZipInput("19103-1234")).toEqual({ zips: ["19103"], error: null });
    });

    it("trims surrounding whitespace", () => {
      expect(parseZipInput("  19103  ")).toEqual({ zips: ["19103"], error: null });
    });
  });

  describe("separators: commas, spaces, and combinations", () => {
    it("splits on bare commas with no spaces", () => {
      const result = parseZipInput("19103,08002,10001");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002", "10001"]);
    });

    it("splits on comma-plus-space", () => {
      const result = parseZipInput("19103, 08002, 10001");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002", "10001"]);
    });

    it("splits on whitespace alone", () => {
      const result = parseZipInput("19103 08002 10001");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002", "10001"]);
    });

    it("handles irregular spacing around commas", () => {
      const result = parseZipInput("19103 ,08002,   10001 ");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002", "10001"]);
    });

    it("dedupes while preserving first-seen order", () => {
      const result = parseZipInput("19103, 08002, 19103");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["19103", "08002"]);
    });
  });

  describe("range expansion", () => {
    it("expands an ascending range inclusively", () => {
      const result = parseZipInput("20000-20004");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["20000", "20001", "20002", "20003", "20004"]);
    });

    it("expands a descending range inclusively", () => {
      const result = parseZipInput("20004-20000");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["20004", "20003", "20002", "20001", "20000"]);
    });

    it("treats a single-element range as one ZIP", () => {
      expect(parseZipInput("20000-20000")).toEqual({ zips: ["20000"], error: null });
    });

    it("preserves leading zeros across an expansion that crosses a power of ten", () => {
      const result = parseZipInput("00008-00012");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["00008", "00009", "00010", "00011", "00012"]);
    });

    it("preserves leading zeros for a low range", () => {
      const result = parseZipInput("01001-01003");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["01001", "01002", "01003"]);
    });

    it("drops a malformed range token (non-numeric endpoint)", () => {
      expect(parseZipInput("20000-abc")).toEqual({ zips: [], error: null });
    });

    it("drops a malformed range token (wrong-width endpoint)", () => {
      // 3-digit endpoints are not valid 5-digit ZIPs, so this is not a range.
      expect(parseZipInput("200-205")).toEqual({ zips: [], error: null });
    });

    it("combines a small range with singles when the total is within 5", () => {
      const result = parseZipInput("20000-20002, 30000, 30001");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["20000", "20001", "20002", "30000", "30001"]);
    });
  });

  describe("the 5-ZIP cap is enforced by rejection, not truncation", () => {
    it("rejects a range that expands beyond 5 ZIPs", () => {
      const result = parseZipInput("20000-20010");
      expect(result.zips).toEqual([]);
      expect(result.error).toBeTruthy();
    });

    it("rejects when a range plus singles exceeds 5", () => {
      // range yields 4, plus 2 singles = 6 total
      const result = parseZipInput("20000-20003, 30000, 30001");
      expect(result.zips).toEqual([]);
      expect(result.error).toBeTruthy();
    });

    it("rejects more than 5 single ZIPs rather than silently keeping the first 5", () => {
      const result = parseZipInput("10001, 10002, 10003, 10004, 10005, 10006");
      expect(result.zips).toEqual([]);
      expect(result.error).toBeTruthy();
    });

    it("accepts exactly 5 ZIPs", () => {
      const result = parseZipInput("10001, 10002, 10003, 10004, 10005");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["10001", "10002", "10003", "10004", "10005"]);
    });

    it("counts duplicates only once when applying the cap", () => {
      // 5 unique after dedupe, so within the cap
      const result = parseZipInput("10001, 10002, 10003, 10004, 10005, 10001");
      expect(result.error).toBeNull();
      expect(result.zips).toEqual(["10001", "10002", "10003", "10004", "10005"]);
    });
  });
});