import { describe, it, expect } from "vitest";
import { filterByZip } from "./prospectMatcher";

describe("filterByZip", () => {
  it("keeps items whose zip matches the target", () => {
    const items = [
      { id: 1, zip: "01742" },
      { id: 2, zip: "01720" },
    ];
    expect(filterByZip(items, "01742")).toEqual([{ id: 1, zip: "01742" }]);
  });

  it("normalizes both sides, so a ZIP+4 on the item or the target still matches the 5-digit", () => {
    expect(filterByZip([{ zip: "01742-0001" }], "01742")).toEqual([{ zip: "01742-0001" }]);
    expect(filterByZip([{ zip: "01742" }], "01742-9999")).toEqual([{ zip: "01742" }]);
  });

  it("drops items whose zip does not match", () => {
    expect(filterByZip([{ zip: "01720" }, { zip: "03301" }], "01742")).toEqual([]);
  });

  it("drops items with a null, undefined, blank, or invalid zip", () => {
    const items = [
      { zip: null },
      { zip: undefined },
      { zip: "" },
      { zip: "abc" },
      { zip: "0174" },
      { zip: "01742" },
    ];
    expect(filterByZip(items, "01742")).toEqual([{ zip: "01742" }]);
  });

  it("returns an empty array when the target zip is null, blank, or invalid", () => {
    const items = [{ zip: "01742" }];
    expect(filterByZip(items, null)).toEqual([]);
    expect(filterByZip(items, "")).toEqual([]);
    expect(filterByZip(items, "nope")).toEqual([]);
  });

  it("returns an empty array for an empty list", () => {
    expect(filterByZip([], "01742")).toEqual([]);
  });

  it("preserves order and the items' other fields", () => {
    const items = [
      { firm_name: "B", zip: "01742", extra: 1 },
      { firm_name: "A", zip: "01742", extra: 2 },
      { firm_name: "C", zip: "01720" },
    ];
    expect(filterByZip(items, "01742")).toEqual([
      { firm_name: "B", zip: "01742", extra: 1 },
      { firm_name: "A", zip: "01742", extra: 2 },
    ]);
  });
});