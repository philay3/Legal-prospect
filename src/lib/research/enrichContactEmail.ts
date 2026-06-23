import { extractHrefs, pickBestEmail, extractMailtoEmails } from "./emailHelpers";
import { pickContactLink, normalizeWebsite, extractEmails, isUseful } from "./sanitize";
import { extractPageContent } from "./extract";

const FETCH_TIMEOUT_MS = 8000;
const UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36";

async function fetchRawHtml(url: string): Promise<string> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    const res = await fetch(url, { headers: { "User-Agent": UA }, signal: controller.signal });
    if (!res.ok) return "";
    return await res.text();
  } catch {
    return "";
  } finally {
    clearTimeout(id);
  }
}

function domainOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, "").toLowerCase();
  } catch {
    return "";
  }
}

/**
 * Deep contact-page email lookup for a single firm. Fetches the homepage, finds
 * the best contact/about page via pickContactLink, reads that page plus the
 * homepage, and returns the best firm-domain email, or null. Does NOT touch the DB.
 */
export async function findContactEmail(website: string | null | undefined): Promise<string | null> {
  const home = normalizeWebsite(website || "");
  if (!home) return null;

  const firmDomain = domainOf(home);

  const homeHtml = await fetchRawHtml(home);
  const hrefs = extractHrefs(homeHtml);
  const contactUrl = pickContactLink(home, hrefs);

  const pages: string[] = [];
  if (contactUrl) pages.push(contactUrl);
  if (!pages.includes(home)) pages.push(home);

  const emails: string[] = [];
  for (const page of pages) {
    try {
      // Reuse the homepage HTML we already fetched; fetch raw HTML for other pages.
      const rawHtml = page === home ? homeHtml : await fetchRawHtml(page);
      // mailto: links carry addresses that cleaned-text extraction drops.
      emails.push(...extractMailtoEmails(rawHtml));
      // Cleaned text catches plain-text addresses.
      const text = await extractPageContent(page);
      if (text) emails.push(...extractEmails(text));
    } catch {
      // ignore a page that fails; try the next
    }
  }

  const best = pickBestEmail(emails, firmDomain);
  return best && isUseful(best) ? best : null;
}
