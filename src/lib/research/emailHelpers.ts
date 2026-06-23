import { isUseful } from "./sanitize";

/**
 * Extracts raw href attribute values from HTML. Returns them as-is (may be
 * relative); pickContactLink resolves them against the base URL.
 */
export function extractHrefs(html: string): string[] {
  if (!html) return [];
  const out: string[] = [];
  const re = /href\s*=\s*["']([^"']+)["']/gi;
  let m: RegExpExecArray | null;
  while ((m = re.exec(html)) !== null) {
    const href = m[1].trim();
    if (href) out.push(href);
  }
  return out;
}

/**
 * Chooses the best email from a list. Prefers an address on the firm's own
 * domain; otherwise returns the first useful address. Returns null if none.
 * firmDomain is a bare host (e.g. "smithlaw.com"), or "" if unknown.
 */
export function pickBestEmail(emails: string[], firmDomain: string): string | null {
  const seen = new Set<string>();
  const useful: string[] = [];
  for (const raw of emails) {
    if (typeof raw !== "string") continue;
    const email = raw.trim();
    if (!email.includes("@") || !isUseful(email)) continue;
    const key = email.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    useful.push(email);
  }
  if (useful.length === 0) return null;

  const dom = (firmDomain || "").trim().toLowerCase().replace(/^www\./, "");
  if (!dom) return null;

  const onDomain = useful.find((e) => {
    const at = e.lastIndexOf("@");
    if (at === -1) return false;
    const host = e.slice(at + 1).toLowerCase();
    return host === dom || host.endsWith("." + dom);
  });
  return onDomain || null;
}

/**
 * Extracts and processes email addresses from mailto: links in raw HTML.
 */
export function extractMailtoEmails(html: string): string[] {
  if (!html) return [];
  const hrefs = extractHrefs(html);
  const emails: string[] = [];
  const seen = new Set<string>();

  for (const href of hrefs) {
    if (href.toLowerCase().startsWith("mailto:")) {
      const mailtoContent = href.slice(7);
      const beforeQuery = mailtoContent.split("?")[0];
      const parts = beforeQuery.split(",");
      for (const part of parts) {
        const trimmed = part.trim();
        if (trimmed) {
          const lower = trimmed.toLowerCase();
          if (!seen.has(lower)) {
            seen.add(lower);
            emails.push(trimmed);
          }
        }
      }
    }
  }
  return emails;
}

