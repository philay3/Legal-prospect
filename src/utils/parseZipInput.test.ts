import { describe, it, expect } from "vitest";
import { parseZipInput } from "./parseZipInput";

describe("parseZipInput", () => {
  it("splits comma- and space-separated zips", () => {
    expect(parseZipInput("20006, 20015 20007")).toEqual(["20006", "20015", "20007"]);
  });

  it("normalizes ZIP+4 to the 5-digit code", () => {
    expect(parseZipInput("20006-1234")).toEqual(["20006"]);
  });

  it("drops invalid tokens", () => {
    expect(parseZipInput("20006, abc, 123, 20015")).toEqual(["20006", "20015"]);
  });

  it("dedupes repeated zips", () => {
    expect(parseZipInput("20006, 20006, 20015")).toEqual(["20006", "20015"]);
  });

  it("caps the number of zips at 5", () => {
    expect(parseZipInput("10001 10002 10003 10004 10005 10006 10007")).toEqual([
      "10001", "10002", "10003", "10004", "10005",
    ]);
  });

  it("returns an empty array for empty or junk input", () => {
    expect(parseZipInput("")).toEqual([]);
    expect(parseZipInput("   ")).toEqual([]);
    expect(parseZipInput("nope, nada")).toEqual([]);
  });
});
