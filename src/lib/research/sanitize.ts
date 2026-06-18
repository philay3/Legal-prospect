/**
 * Checks if a research field value contains a placeholder or empty/non-useful info.
 * Returns false for null/undefined/empty and placeholder strings ("n/a", "none", "unknown", "not available", "placeholder", etc.); true otherwise.
 */
export function isUseful(val: string | null | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  const placeholders = [
    "null", "undefined", "", "n/a", "na", "none", "not available", 
    "no email", "no phone", "placeholder", "unknown", "not found",
    "pending", "no-email@example.com", "example@example.com",
    "info@example.com", "test@example.com", "fake"
  ];
  return !placeholders.includes(lower);
}

/**
 * Strips script, style, and HTML tags, then normalizes whitespace.
 */
export function cleanHtmlToText(html: string): string {
  if (!html) return "";
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, "")
    .replace(/<style[\s\S]*?<\/style>/gi, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

/**
 * Extract email addresses from text, filter out junk, and return a unique array.
 */
export function extractEmails(text: string): string[] {
  if (!text) return [];
  const emailRegex = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/gi;
  const matches = text.match(emailRegex) || [];
  const emails = new Set<string>();
  const imageExtensions = [".png", ".jpg", ".jpeg", ".gif", ".svg", ".webp", ".bmp", ".tiff"];
  const junkPatterns = ["example.com", "email.com", "sentry", "wordpress"];

  for (const m of matches) {
    const email = m.toLowerCase().trim();
    if (junkPatterns.some(pattern => email.includes(pattern))) continue;
    if (imageExtensions.some(ext => email.endsWith(ext))) continue;
    if (!isUseful(email)) continue;
    emails.add(email);
  }
  return Array.from(emails);
}

/**
 * Normalizes a website URL string:
 * - Prepends 'https://' if it lacks http:// or https:// scheme.
 * - Validates that the hostname contains a dot, no spaces, and no empty parts.
 * - Rejects directories/social pages.
 * - Returns the URL origin (homepage base URL) or null.
 */
export function normalizeWebsite(website: string | null | undefined): string | null {
  if (!website || !isUseful(website)) return null;
  let normalized = website.trim();
  
  // If it doesn't start with http:// or https:// (case-insensitive), prepend https://
  if (!/^https?:\/\//i.test(normalized)) {
    normalized = "https://" + normalized;
  }
  
  try {
    const urlObj = new URL(normalized);
    const hostname = urlObj.hostname;
    
    // Plausible host check: must contain at least one dot in the hostname,
    // and must not contain spaces or have empty segments.
    if (!hostname.includes(".") || hostname.includes(" ") || hostname.split(".").some(part => !part)) {
      return null;
    }
    
    // Import or call isDirectoryOrSocial helper to reject directories
    // Wait, isDirectoryOrSocial is in runLeadResearch.ts. To keep sanitize.ts pure and independent,
    // let's replicate or inline the simple directory list here, or use it if we can import it.
    // Since runLeadResearch imports sanitize, importing runLeadResearch in sanitize.ts would cause a circular dependency.
    // So let's inline the simple directory/social list check here.
    const lowerHost = hostname.toLowerCase();
    const directories = [
      "justia.com", "findlaw.com", "avvo.com", "superlawyers.com", "martindale.com",
      "lawyers.com", "yelp.com", "facebook.com", "linkedin.com", "twitter.com",
      "instagram.com", "mapquest.com", "yellowpages.com", "whitepages.com",
      "zoominfo.com", "bbb.org", "chamberofcommerce.com", "opencorporates.com",
      "dnb.com", "glassdoor.com", "indeed.com", "expertise.com", "expertisego.com",
      "wikipedia.org", "youtube.com", "pinterest.com"
    ];
    if (directories.some(dir => lowerHost === dir || lowerHost.endsWith("." + dir))) {
      return null;
    }
    
    return urlObj.origin;
  } catch (e) {
    return null;
  }
}

/**
 * Picks the single best candidate page link from hrefs for enrichment.
 * Resolves relative URLs against baseUrl, applies exclusion/inclusion rules,
 * and returns the best matching candidate, or null.
 */
export function pickContactLink(baseUrl: string, hrefs: string[]): string | null {
  let baseObj: URL;
  try {
    baseObj = new URL(baseUrl);
  } catch (e) {
    return null;
  }

  const baseOrigin = baseObj.origin;
  const baseHostnameNormalized = baseObj.hostname.replace(/^www\./, "").toLowerCase();

  const assetExtensions = [
    ".css", ".js", ".json", ".png", ".jpg", ".jpeg", ".gif", ".svg",
    ".webp", ".ico", ".woff", ".woff2", ".ttf", ".pdf", ".xml"
  ];
  const assetSegments = [
    "wp-content/", "/plugins/", "/includes/", "/assets/", "/static/", "cdn-cgi/"
  ];

  interface Candidate {
    url: string;
    score: number;
  }

  const candidates: Candidate[] = [];
  const seenUrls = new Set<string>();

  for (const href of hrefs) {
    if (!href) continue;
    try {
      // Resolve href against base URL
      const resolved = new URL(href, baseUrl);
      
      // Ensure it is same domain or subdomain
      const candidateHostnameNormalized = resolved.hostname.replace(/^www\./, "").toLowerCase();
      if (candidateHostnameNormalized !== baseHostnameNormalized && !candidateHostnameNormalized.endsWith("." + baseHostnameNormalized)) {
        continue;
      }

      // Check that it's not exactly the base page URL itself
      if (resolved.href === baseObj.href || resolved.href === baseOrigin || resolved.href === baseOrigin + "/") {
        continue;
      }

      const pathLower = resolved.pathname.toLowerCase();

      // Reject asset extensions
      if (assetExtensions.some(ext => pathLower.endsWith(ext))) {
        continue;
      }

      // Reject asset/plugin path segments
      const fullUrlLower = resolved.href.toLowerCase();
      if (assetSegments.some(seg => fullUrlLower.includes(seg.toLowerCase()))) {
        continue;
      }

      // Compute match score
      let score = 0;
      const cleanPath = pathLower.replace(/\/$/, ""); // remove trailing slash for exact matches

      if (cleanPath === "/contact") {
        score = 100;
      } else if (pathLower.includes("contact-us")) {
        score = 95;
      } else if (pathLower.includes("contact")) {
        score = 90;
      } else if (cleanPath === "/about") {
        score = 80;
      } else if (pathLower.includes("about-us")) {
        score = 75;
      } else if (pathLower.includes("about")) {
        score = 70;
      } else if (pathLower.includes("attorney")) {
        score = 60;
      } else if (pathLower.includes("team")) {
        score = 50;
      } else if (pathLower.includes("firm")) {
        score = 40;
      }

      if (score > 0) {
        const urlStr = resolved.href;
        if (!seenUrls.has(urlStr)) {
          seenUrls.add(urlStr);
          candidates.push({ url: urlStr, score });
        }
      }
    } catch (e) {
      // Ignore URL parsing errors for individual hrefs
    }
  }

  if (candidates.length === 0) return null;

  // Sort candidates by score descending
  candidates.sort((a, b) => b.score - a.score);

  return candidates[0].url;
}

/**
 * Removes NUL (mandatory — Postgres 22021) + other C0 controls except tab/newline/CR.
 */
export function sanitizeText(v: string): string {
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}

/**
 * Deep-cleans a firm structure recursively. Sanitizes text on strings, maps over arrays,
 * and recursively walks object properties.
 */
export function sanitizeFirm<T>(firm: T): T {
  if (firm === null || firm === undefined) {
    return firm;
  }
  if (typeof firm === "string") {
    return sanitizeText(firm) as unknown as T;
  }
  if (Array.isArray(firm)) {
    return firm.map(item => sanitizeFirm(item)) as unknown as T;
  }
  if (typeof firm === "object") {
    const res: any = {};
    for (const key of Object.keys(firm)) {
      res[key] = sanitizeFirm((firm as any)[key]);
    }
    return res as T;
  }
  return firm;
}

/**
 * Normalizes an array of raw practice areas.
 * - Collapses multiple whitespaces to single spaces.
 * - Trims leading/trailing whitespace.
 * - Filter out null, undefined, empty, or non-string values.
 * - Strip Postgres-unfriendly C0 control characters and NUL bytes.
 * - Case-insensitively deduplicate while preserving the casing of the first-seen item.
 */
export function normalizePracticeAreas(
  raw: (string | null | undefined)[] | null | undefined,
): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const clean = sanitizeText(item).replace(/\s+/g, " ").trim();
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(clean);
  }
  return out;
}
