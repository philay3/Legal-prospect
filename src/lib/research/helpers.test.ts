import { describe, it, expect } from "vitest";
import { cleanDdgUrl, isDirectoryOrSocial, getLikelyOfficialWebsite, SearchResult } from "./runLeadResearch";
import { isUseful, cleanHtmlToText, extractEmails, normalizeWebsite, pickContactLink } from "./sanitize";

describe("Research pure helpers", () => {
  describe("cleanDdgUrl", () => {
    it("should resolve DuckDuckGo redirect URLs (decodes the uddg param)", () => {
      expect(cleanDdgUrl("https://duckduckgo.com/l/?uddg=https%3A%2F%2Ffirm.com")).toBe("https://firm.com");
      expect(cleanDdgUrl("https://duckduckgo.com/l/?uddg=https%3A%2F%2Fwww.smithlaw.com%2Fcontact%3Fref%3Dddg")).toBe("https://www.smithlaw.com/contact?ref=ddg");
    });

    it("should handle protocol-relative // URLs", () => {
      expect(cleanDdgUrl("//html.duckduckgo.com/l/?uddg=https%3A%2F%2Ffirm.com")).toBe("https://firm.com");
    });

    it("should return plain URLs unchanged if they do not contain uddg parameter", () => {
      expect(cleanDdgUrl("https://firm.com")).toBe("https://firm.com");
    });

    it("should handle parsing failures gracefully and return the original URL", () => {
      expect(cleanDdgUrl("not-a-valid-url")).toBe("not-a-valid-url");
    });
  });

  describe("isDirectoryOrSocial", () => {
    it("should return true for known legal directories and social media sites", () => {
      expect(isDirectoryOrSocial("https://www.avvo.com/attorneys/123-john-doe")).toBe(true);
      expect(isDirectoryOrSocial("https://justia.com/some-path")).toBe(true);
      expect(isDirectoryOrSocial("https://www.linkedin.com/in/someone")).toBe(true);
      expect(isDirectoryOrSocial("https://facebook.com/smithlaw")).toBe(true);
    });

    it("should return false for what appears to be an official firm website", () => {
      expect(isDirectoryOrSocial("https://www.smithlaw.com")).toBe(false);
      expect(isDirectoryOrSocial("https://smithlaw.com/contact")).toBe(false);
      expect(isDirectoryOrSocial("https://subdomain.anotherfirm.org")).toBe(false);
    });

    it("should return true on URL parse failures", () => {
      expect(isDirectoryOrSocial("invalid-url-string")).toBe(true);
    });
  });

  describe("getLikelyOfficialWebsite", () => {
    it("should return the origin of the first non-directory/social result", () => {
      const results: SearchResult[] = [
        { title: "Avvo Profile", url: "https://www.avvo.com/x", snippet: "..." },
        { title: "Smith Law Firm", url: "https://www.smithlaw.com/contact", snippet: "..." },
        { title: "Findlaw Profile", url: "https://findlaw.com/y", snippet: "..." },
      ];
      expect(getLikelyOfficialWebsite(results)).toBe("https://www.smithlaw.com");
    });

    it("should return null if all search results are directories or social sites", () => {
      const results: SearchResult[] = [
        { title: "Avvo Profile", url: "https://www.avvo.com/x", snippet: "..." },
        { title: "Findlaw Profile", url: "https://findlaw.com/y", snippet: "..." },
      ];
      expect(getLikelyOfficialWebsite(results)).toBeNull();
    });

    it("should return null for an empty results list", () => {
      expect(getLikelyOfficialWebsite([])).toBeNull();
    });
  });

  describe("isUseful", () => {
    it("should return false for null, undefined, empty, or placeholder strings", () => {
      expect(isUseful(null)).toBe(false);
      expect(isUseful(undefined)).toBe(false);
      expect(isUseful("")).toBe(false);
      expect(isUseful("   ")).toBe(false);
      expect(isUseful("N/A")).toBe(false);
      expect(isUseful("n/a")).toBe(false);
      expect(isUseful("unknown")).toBe(false);
      expect(isUseful("placeholder")).toBe(false);
      expect(isUseful("example@example.com")).toBe(false);
    });

    it("should return true for valid, useful values", () => {
      expect(isUseful("Smith Law")).toBe(true);
      expect(isUseful("https://smithlaw.com")).toBe(true);
      expect(isUseful("info@smithlaw.com")).toBe(true);
      expect(isUseful("555-0199")).toBe(true);
    });
  });

  describe("extractEmails", () => {
    it("should find a plain email address in text", () => {
      const text = "Contact us at contact@smithlaw.com for details.";
      expect(extractEmails(text)).toEqual(["contact@smithlaw.com"]);
    });

    it("should find and clean a mailto: link email address", () => {
      const text = 'Send us an email: <a href="mailto:info@smithlaw.com">Email Us</a>';
      expect(extractEmails(text)).toEqual(["info@smithlaw.com"]);
    });

    it("should deduplicate multiple matching email addresses", () => {
      const text = "Write to support@smithlaw.com or support@smithlaw.com or SUPPORT@smithlaw.com";
      expect(extractEmails(text)).toEqual(["support@smithlaw.com"]);
    });

    it("should filter out placeholder/junk email addresses like example.com or example@example.com", () => {
      const text = "Valid: info@smithlaw.com. Invalid: example@example.com, test@example.com, no-email@example.com, fake@email.com";
      expect(extractEmails(text)).toEqual(["info@smithlaw.com"]);
    });

    it("should filter out email addresses containing wordpress or sentry", () => {
      const text = "Use legal@smithlaw.com, do not use wordpress@smithlaw.com or sentry@smithlaw.com";
      expect(extractEmails(text)).toEqual(["legal@smithlaw.com"]);
    });

    it("should filter out matches ending in image extensions", () => {
      const text = "The logo is at logo@2x.png or avatar@1x.jpg or bg@3x.webp or valid@smithlaw.com";
      expect(extractEmails(text)).toEqual(["valid@smithlaw.com"]);
    });

    it("should return [] when no email addresses are present", () => {
      const text = "No emails here, only phone numbers like 555-0101.";
      expect(extractEmails(text)).toEqual([]);
    });
  });

  describe("cleanHtmlToText", () => {
    it("should strip script and style tags and normal html elements", () => {
      const html = `
        <html>
          <head>
            <style>body { color: red; }</style>
            <script>alert("hello");</script>
          </head>
          <body>
            <h1>Smith Law Firm</h1>
            <p>Welcome to our firm.</p>
          </body>
        </html>
      `;
      const cleaned = cleanHtmlToText(html);
      expect(cleaned).toBe("Smith Law Firm Welcome to our firm.");
    });
  });

  describe("normalizeWebsite", () => {
    it("should prepend https:// to domains lacking a scheme", () => {
      expect(normalizeWebsite("smithlaw.com")).toBe("https://smithlaw.com");
      expect(normalizeWebsite("www.smithlaw.com")).toBe("https://www.smithlaw.com");
    });

    it("should retain existing http:// or https:// schemes", () => {
      expect(normalizeWebsite("http://smithlaw.com")).toBe("http://smithlaw.com");
      expect(normalizeWebsite("https://smithlaw.com/about")).toBe("https://smithlaw.com");
    });

    it("should reject non-sites, obvious placeholders, and invalid hostnames", () => {
      expect(normalizeWebsite("not-a-website")).toBeNull();
      expect(normalizeWebsite("some text with spaces")).toBeNull();
      expect(normalizeWebsite("http://")).toBeNull();
      expect(normalizeWebsite("https://justia.com/attorneys")).toBeNull();
      expect(normalizeWebsite("https://www.avvo.com")).toBeNull();
      expect(normalizeWebsite("n/a")).toBeNull();
      expect(normalizeWebsite("unknown")).toBeNull();
    });
  });

  describe("pickContactLink", () => {
    const baseUrl = "https://www.smithlaw.com";

    it("should reject asset extensions", () => {
      const hrefs = [
        "https://www.smithlaw.com/wp-content/uploads/logo.png",
        "https://www.smithlaw.com/assets/styles.css",
        "/js/main.js",
        "/feed.xml",
        "/docs/brochure.pdf"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBeNull();
    });

    it("should reject asset and plugin segments", () => {
      const hrefs = [
        "https://www.smithlaw.com/wp-content/plugins/contact-form-7/includes/css/styles.css",
        "/wp-content/themes/law/assets/js/scripts.js",
        "/cdn-cgi/l/email-protection"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBeNull();
    });

    it("should resolve relative URLs correctly and filter out external links", () => {
      const hrefs = [
        "/contact-us",
        "https://twitter.com/smithlaw",
        "https://www.google.com/maps"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.smithlaw.com/contact-us");
    });

    it("should accept valid pages and respect the preference scoring (contact > contact-us > about)", () => {
      const hrefs = [
        "/about-us",
        "/contact-us",
        "/contact",
        "/attorneys/john-smith"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.smithlaw.com/contact");
    });

    it("should prefer contact-us over about", () => {
      const hrefs = [
        "/about",
        "/contact-us"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.smithlaw.com/contact-us");
    });

    it("should fall back to about/attorneys/team/firm if no contact link is found", () => {
      const hrefs = [
        "/about-our-team",
        "/attorneys",
        "/our-firm"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBe("https://www.smithlaw.com/about-our-team");
    });

    it("should return null if no links match any candidate pattern", () => {
      const hrefs = [
        "/gallery",
        "/services/litigation",
        "/careers"
      ];
      expect(pickContactLink(baseUrl, hrefs)).toBeNull();
    });
  });
});
