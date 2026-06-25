import { describe, it, expect } from "vitest";
import { getPracticeAreaNames } from "./practiceAreas";

describe("getPracticeAreaNames", () => {
  it("collapses case-variant practice areas into a single canonical name", () => {
    const firm = {
      areaLinks: [
        { practiceArea: { name: "Elder law" } },
        { practiceArea: { name: "Elder Law" } },
        { practiceArea: { name: "estate planning" } },
        { practiceArea: { name: "Estate Planning" } },
        { practiceArea: { name: "Elder Law & Medicaid" } },
      ],
    };

    // "Elder law" / "Elder Law" collapse to one canonical "Elder Law".
    // "estate planning" / "Estate Planning" collapse to "Estate Planning".
    // The compound "Elder Law & Medicaid" is a distinct area and must remain.
    expect(getPracticeAreaNames(firm)).toEqual([
      "Elder Law",
      "Elder Law & Medicaid",
      "Estate Planning",
    ]);
  });

  it("leaves already-canonical, distinct areas unchanged and sorted", () => {
    const firm = {
      areaLinks: [
        { practiceArea: { name: "Family Law" } },
        { practiceArea: { name: "Criminal Defense" } },
      ],
    };

    expect(getPracticeAreaNames(firm)).toEqual([
      "Criminal Defense",
      "Family Law",
    ]);
  });
});