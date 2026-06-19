import { describe, it, expect } from "vitest";
import { capAttorneys } from "./attorneys";

describe("capAttorneys utility tests", () => {
  it("should handle null or undefined input", () => {
    expect(capAttorneys(null, 2)).toEqual({ visible: [], remaining: 0 });
    expect(capAttorneys(undefined, 2)).toEqual({ visible: [], remaining: 0 });
  });

  it("should handle empty array (0 names)", () => {
    expect(capAttorneys([], 2)).toEqual({ visible: [], remaining: 0 });
  });

  it("should handle array with 1 name", () => {
    expect(capAttorneys(["Alice Smith"], 2)).toEqual({
      visible: ["Alice Smith"],
      remaining: 0,
    });
  });

  it("should handle array with exactly max names", () => {
    expect(capAttorneys(["Alice Smith", "Bob Jones"], 2)).toEqual({
      visible: ["Alice Smith", "Bob Jones"],
      remaining: 0,
    });
  });

  it("should handle array with more than max names (max+)", () => {
    expect(capAttorneys(["Alice Smith", "Bob Jones", "Charlie Brown"], 2)).toEqual({
      visible: ["Alice Smith", "Bob Jones"],
      remaining: 1,
    });

    expect(
      capAttorneys(["Alice Smith", "Bob Jones", "Charlie Brown", "Diana Prince"], 2)
    ).toEqual({
      visible: ["Alice Smith", "Bob Jones"],
      remaining: 2,
    });
  });

  it("should ignore empty or whitespace-only names and trim others", () => {
    expect(
      capAttorneys(["  Alice Smith  ", "", "   ", "Bob Jones", null as any, "Charlie Brown"], 2)
    ).toEqual({
      visible: ["Alice Smith", "Bob Jones"],
      remaining: 1,
    });
  });
});
