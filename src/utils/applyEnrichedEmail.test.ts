import { describe, it, expect } from "vitest";
import { applyEnrichedEmail } from "./applyEnrichedEmail";

describe("applyEnrichedEmail", () => {
  const rows = [
    { id: "a", email: null },
    { id: "b", email: null },
    { id: "c", email: "existing@firm.com" },
  ];

  it("sets the email on the matching row only", () => {
    const out = applyEnrichedEmail(rows, "a", "found@firma.com");
    expect(out.find((r) => r.id === "a")!.email).toBe("found@firma.com");
    expect(out.find((r) => r.id === "b")!.email).toBeNull();
    expect(out.find((r) => r.id === "c")!.email).toBe("existing@firm.com");
  });

  it("does not mutate the input array or its objects", () => {
    const out = applyEnrichedEmail(rows, "a", "found@firma.com");
    expect(out).not.toBe(rows);
    expect(rows.find((r) => r.id === "a")!.email).toBeNull();
  });

  it("returns the list unchanged when the email is null", () => {
    const out = applyEnrichedEmail(rows, "a", null);
    expect(out).toBe(rows);
  });

  it("returns the list unchanged when no row matches the firmId", () => {
    const out = applyEnrichedEmail(rows, "zzz", "found@firma.com");
    expect(out.map((r) => r.email)).toEqual([null, null, "existing@firm.com"]);
  });
});
