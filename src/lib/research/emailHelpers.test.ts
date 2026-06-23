import { describe, it, expect } from "vitest";
import { extractHrefs, pickBestEmail, extractMailtoEmails } from "./emailHelpers";

describe("extractHrefs", () => {
  it("pulls href values from anchor tags with double or single quotes", () => {
    const html = `<a href="/contact">Contact</a> <a href='https://x.com/about'>About</a>`;
    expect(extractHrefs(html)).toEqual(["/contact", "https://x.com/about"]);
  });

  it("returns an empty array when there are no links", () => {
    expect(extractHrefs("<p>no links here</p>")).toEqual([]);
    expect(extractHrefs("")).toEqual([]);
  });
});

describe("pickBestEmail", () => {
  it("prefers an email on the firm's own domain", () => {
    expect(pickBestEmail(["jdoe@gmail.com", "info@smithlaw.com"], "smithlaw.com")).toBe("info@smithlaw.com");
  });

  it("matches a subdomain of the firm domain", () => {
    expect(pickBestEmail(["x@mail.smithlaw.com"], "smithlaw.com")).toBe("x@mail.smithlaw.com");
  });

  it("returns null when no email matches the firm domain", () => {
    expect(pickBestEmail(["hello@otherfirm.com", "team@another.com"], "smithlaw.com")).toBeNull();
  });

  it("returns null when the firm domain is unknown", () => {
    expect(pickBestEmail(["hello@otherfirm.com"], "")).toBeNull();
  });

  it("returns null when there are no useful emails", () => {
    expect(pickBestEmail([], "smithlaw.com")).toBeNull();
    expect(pickBestEmail(["info@example.com", "n/a"], "smithlaw.com")).toBeNull();
  });
});

describe("extractMailtoEmails", () => {
  it("pulls the address out of a mailto link", () => {
    const html = `<a href="mailto:info@smithlaw.com">Email Us</a>`;
    expect(extractMailtoEmails(html)).toEqual(["info@smithlaw.com"]);
  });

  it("strips query params like ?subject=", () => {
    const html = `<a href="mailto:contact@firm.com?subject=Hello%20there">Contact</a>`;
    expect(extractMailtoEmails(html)).toEqual(["contact@firm.com"]);
  });

  it("handles single quotes and uppercase MAILTO", () => {
    const html = `<a href='MAILTO:Jane@Firm.com'>Jane</a>`;
    expect(extractMailtoEmails(html)).toEqual(["Jane@Firm.com"]);
  });

  it("splits multiple comma-separated recipients", () => {
    const html = `<a href="mailto:a@x.com,b@x.com">Both</a>`;
    expect(extractMailtoEmails(html)).toEqual(["a@x.com", "b@x.com"]);
  });

  it("dedupes case-insensitively, keeping first-seen casing", () => {
    const html = `<a href="mailto:info@firm.com">A</a><a href="mailto:INFO@firm.com">B</a>`;
    expect(extractMailtoEmails(html)).toEqual(["info@firm.com"]);
  });

  it("ignores mailto links with no address and returns [] for empty input", () => {
    expect(extractMailtoEmails(`<a href="mailto:">x</a>`)).toEqual([]);
    expect(extractMailtoEmails("")).toEqual([]);
  });
});
