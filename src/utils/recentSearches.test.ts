import { describe, it, expect } from "vitest";
import { dedupeRecentSearches } from "./recentSearches";

describe("dedupeRecentSearches", () => {
  it("removes duplicates, keeping the first (most recent) occurrence order", () => {
    expect(dedupeRecentSearches(["10001", "10002", "10001", "10003"], 5)).toEqual([
      "10001",
      "10002",
      "10003",
    ]);
  });

  it("applies the limit to the distinct list", () => {
    expect(dedupeRecentSearches(["1", "1", "2", "2", "3", "3", "4"], 2)).toEqual(["1", "2"]);
  });

  it("caps a list with no duplicates at the limit", () => {
    expect(dedupeRecentSearches(["1", "2", "3", "4", "5", "6"], 3)).toEqual(["1", "2", "3"]);
  });

  it("collapses an all-identical list to a single entry", () => {
    expect(dedupeRecentSearches(["5", "5", "5"], 5)).toEqual(["5"]);
  });

  it("returns everything when there are fewer distinct values than the limit", () => {
    expect(dedupeRecentSearches(["1", "2"], 5)).toEqual(["1", "2"]);
  });

  it("returns an empty array for empty input", () => {
    expect(dedupeRecentSearches([], 5)).toEqual([]);
  });
});