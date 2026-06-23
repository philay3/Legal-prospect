import { describe, it, expect } from "vitest";
import { sanitizeText, sanitizeFirm, normalizePracticeAreas, pickContactLink, detectState, isInSearchedState, normalizeAttorneyName } from "./sanitize";

describe("sanitizeText", () => {
  it("should strip NUL bytes", () => {
    expect(sanitizeText("Hello\u0000World")).toBe("HelloWorld");
    expect(sanitizeText("\u0000")).toBe("");
  });

  it("should strip other C0 control characters", () => {
    // C0 controls range from \u0000 to \u001F, excluding \t, \n, \r
    expect(sanitizeText("Hello\u0001World")).toBe("HelloWorld");
    expect(sanitizeText("Hello\u0008World")).toBe("HelloWorld");
    expect(sanitizeText("Hello\u000BWorld")).toBe("HelloWorld");
    expect(sanitizeText("Hello\u000CWorld")).toBe("HelloWorld");
    expect(sanitizeText("Hello\u001FWorld")).toBe("HelloWorld");
  });

  it("should preserve tab, newline, and carriage return", () => {
    const input = "Line 1\nLine 2\r\n\tIndented";
    expect(sanitizeText(input)).toBe(input);
  });

  it("should preserve normal text, spaces, and punctuation", () => {
    const input = "Hello, World! 123-456. Test & Co.";
    expect(sanitizeText(input)).toBe(input);
  });

  it("should preserve Unicode and accented characters", () => {
    const input = "José Valenzuela's Firm - 北京市";
    expect(sanitizeText(input)).toBe(input);
  });

  it("should be idempotent", () => {
    const input = "Hello\u0000World\u0001! Nice to meet\u000B you.";
    const firstPass = sanitizeText(input);
    const secondPass = sanitizeText(firstPass);
    expect(firstPass).toBe("HelloWorld! Nice to meet you.");
    expect(secondPass).toBe(firstPass);
  });
});

describe("sanitizeFirm", () => {
  it("should return null/undefined/non-objects as is", () => {
    expect(sanitizeFirm(null)).toBeNull();
    expect(sanitizeFirm(undefined)).toBeUndefined();
    expect(sanitizeFirm(123)).toBe(123);
    expect(sanitizeFirm(true)).toBe(true);
  });

  it("should sanitize strings directly", () => {
    expect(sanitizeFirm("Dirty\u0000Text")).toBe("DirtyText");
  });

  it("should sanitize string arrays", () => {
    const input = ["Clean", "Dirty\u0000Text", "Another\u0007One"];
    expect(sanitizeFirm(input)).toEqual(["Clean", "DirtyText", "AnotherOne"]);
  });

  it("should deeply sanitize nested objects and arrays of objects", () => {
    const dirtyFirm = {
      firm_name: "Smith \u0000 & Associates",
      address: "123 Main \u0001 St",
      phone: "555-\u00001234",
      website: "https://example.com/contact\u0000",
      email: "info@example\u0000.com",
      attorney_name: "Jane \u0002 Doe",
      someNumber: 42,
      someBool: false,
      attorneys: [
        { name: "Jane \u0002 Doe", email: "jane@example\u0000.com" },
        { name: "Bob Smith", email: null }
      ],
      practiceAreas: ["Law\u0000", "IP"]
    };

    const clean = sanitizeFirm(dirtyFirm);

    expect(clean).toEqual({
      firm_name: "Smith  & Associates",
      address: "123 Main  St",
      phone: "555-1234",
      website: "https://example.com/contact",
      email: "info@example.com",
      attorney_name: "Jane  Doe",
      someNumber: 42,
      someBool: false,
      attorneys: [
        { name: "Jane  Doe", email: "jane@example.com" },
        { name: "Bob Smith", email: null }
      ],
      practiceAreas: ["Law", "IP"]
    });
  });

  it("should leave an already clean firm completely unchanged", () => {
    const cleanFirm = {
      firm_name: "Clean Firm",
      address: "456 Market St",
      phone: "555-9876",
      website: "https://clean.com",
      email: "contact@clean.com",
      attorneys: [
        { name: "John Doe", email: "john@clean.com" }
      ],
      practiceAreas: ["Bankruptcy", "Corporate"]
    };

    expect(sanitizeFirm(cleanFirm)).toEqual(cleanFirm);
  });
});

describe("normalizePracticeAreas", () => {
  it("should return an empty array if raw is null or undefined", () => {
    expect(normalizePracticeAreas(null)).toEqual([]);
    expect(normalizePracticeAreas(undefined)).toEqual([]);
  });

  it("should filter out non-string and empty values", () => {
    expect(normalizePracticeAreas([null, undefined, "", "  ", 123 as any, "Law"])).toEqual(["Law"]);
  });

  it("should collapse multiple whitespaces and trim the strings", () => {
    expect(normalizePracticeAreas(["  Intellectual    Property   ", "   Bankruptcy Law "])).toEqual([
      "Intellectual Property",
      "Bankruptcy Law",
    ]);
  });

  it("should strip control characters and NUL bytes", () => {
    expect(normalizePracticeAreas(["Family\u0000 Law", "Corporate\u0008 Law"])).toEqual([
      "Family Law",
      "Corporate Law",
    ]);
  });

  it("should case-insensitively deduplicate and preserve the first-seen casing", () => {
    expect(normalizePracticeAreas(["Family Law", "family law", "FAMILY LAW", "Tax Law", "tax law"])).toEqual([
      "Family Law",
      "Tax Law",
    ]);
  });
});

describe("pickContactLink — directory rejection + own-domain preference", () => {
  it("prefers the firm's own contact page over a directory listing", () => {
    const baseUrl = "https://www.smithlaw.com";
    const hrefs = [
      "https://www.avvo.com/attorneys/smith",
      "https://law.usnews.com/law-firms/smith-law",
      "https://www.smithlaw.com/contact-us",
    ];
    expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.smithlaw.com/contact-us");
  });

  it("rejects directory domains including subdomains", () => {
    const baseUrl = "https://www.smithlaw.com";
    const hrefs = [
      "https://sbm.reliaguide.com/smith",          // subdomain of a directory
      "https://attorneys.lexinter.net/smith",
      "https://www.experience.com/smith",
    ];
    // every candidate is a directory → nothing acceptable
    expect(pickContactLink(baseUrl, hrefs)).toBeNull();
  });

  it("treats www. and bare domain as the same firm domain", () => {
    const baseUrl = "https://www.smithlaw.com";
    const hrefs = ["https://smithlaw.com/about"];
    expect(pickContactLink(baseUrl, hrefs)).toBe("https://smithlaw.com/about");
  });

  it("keeps the existing path scoring among own-domain links (contact beats about)", () => {
    const baseUrl = "https://smithlaw.com";
    const hrefs = ["https://smithlaw.com/about", "https://smithlaw.com/contact"];
    expect(pickContactLink(baseUrl, hrefs)).toBe("https://smithlaw.com/contact");
  });

  it("allows off-domain links if no own-domain links are present and they are not directory domains", () => {
    const baseUrl = "https://www.smithlaw.com";
    const hrefs = [
      "https://www.avvo.com/attorneys/smith", // directory -> reject
      "https://www.another-site.com/contact", // off-domain -> allow since no own-domain
    ];
    expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.another-site.com/contact");
  });
});

describe("detectState", () => {
  it("should detect state from address string", () => {
    expect(detectState({ address: "1612 S Denver Ave., Tulsa, Oklahoma 74119" })).toBe("OK");
    expect(detectState({ address: "453 W. Main Street, Huntington, NY 11743" })).toBe("NY");
    expect(detectState({ address: "no state here" })).toBeNull();
  });

  it("should honor explicit state field over address", () => {
    expect(detectState({ state: "NY", address: "1612 S Denver Ave., Tulsa, Oklahoma 74119" })).toBe("NY");
    expect(detectState({ state: "New York", address: "1612 S Denver Ave., Tulsa, Oklahoma 74119" })).toBe("NY");
  });

  it("should handle lowercase zip-adjacent state codes in address", () => {
    expect(detectState({ address: "453 w. main street, huntington, ny 11743" })).toBe("NY");
  });
});

describe("isInSearchedState", () => {
  it("should match state case-insensitively", () => {
    expect(isInSearchedState({ state: "NY" }, "ny")).toBe(true);
    expect(isInSearchedState({ state: "NY" }, "NY")).toBe(true);
  });

  it("should drop different state", () => {
    expect(isInSearchedState({ state: "OK" }, "NY")).toBe(false);
    expect(isInSearchedState({ address: "1612 S Denver Ave., Tulsa, Oklahoma 74119" }, "NY")).toBe(false);
  });

  it("should keep unknown state", () => {
    expect(isInSearchedState({ address: "no state here" }, "NY")).toBe(true);
  });
});

it("strips a trailing 'Esq.' so the same attorney isn't stored twice", () => {
  expect(normalizeAttorneyName("Michael H. Joseph, Esq.")).toBe("Michael H. Joseph");
});



