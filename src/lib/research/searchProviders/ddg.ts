// src/lib/research/searchProviders/ddg.ts
import { SearchProvider, SearchResult, SearchContextResponse } from "./types";

/**
 * Timeout helper for fetch requests.
 */
async function fetchWithTimeout(
  url: string,
  options: RequestInit = {},
  timeoutMs = 5000
): Promise<Response> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal,
    });
    return response;
  } finally {
    clearTimeout(id);
  }
}

/**
 * Clean DuckDuckGo redirect parameters from URLs.
 */
export function cleanDdgUrl(url: string): string {
  let target = url;
  if (target.startsWith("//")) {
    target = "https:" + target;
  }
  try {
    const parsedUrl = new URL(target, "https://duckduckgo.com");
    const uddg = parsedUrl.searchParams.get("uddg");
    if (uddg) {
      return decodeURIComponent(uddg);
    }
  } catch (e) {
    // fallback if URL parsing fails
  }
  return target;
}

/**
 * Checks if a URL points to a common directory or social media page.
 */
export function isDirectoryOrSocial(urlStr: string): boolean {
  try {
    const parsed = new URL(urlStr);
    const hostname = parsed.hostname.toLowerCase();
    const directories = [
      "justia.com", "findlaw.com", "avvo.com", "superlawyers.com", "martindale.com",
      "lawyers.com", "yelp.com", "facebook.com", "linkedin.com", "twitter.com",
      "instagram.com", "mapquest.com", "yellowpages.com", "whitepages.com",
      "zoominfo.com", "bbb.org", "chamberofcommerce.com", "opencorporates.com",
      "dnb.com", "glassdoor.com", "indeed.com", "expertise.com", "expertisego.com",
      "wikipedia.org", "youtube.com", "pinterest.com"
    ];
    return directories.some(dir => hostname === dir || hostname.endsWith("." + dir));
  } catch (e) {
    return true; // treat invalid URLs as directory
  }
}

/**
 * Identifies the likely official website from a list of search results.
 */
export function getLikelyOfficialWebsite(results: SearchResult[]): string | null {
  for (const res of results) {
    if (!isDirectoryOrSocial(res.url)) {
      try {
        const parsed = new URL(res.url);
        return parsed.origin;
      } catch (e) {
        return res.url;
      }
    }
  }
  return null;
}

export class DdgSearchProvider implements SearchProvider {
  async getSearchContext(
    zipCode: string,
    mode: "quick" | "thorough"
  ): Promise<SearchContextResponse> {
    try {
      const queries: string[] = [];
      if (mode === "quick") {
        queries.push(`law firms in ZIP code ${zipCode}`);
      } else {
        queries.push(
          `boutique law firms in ZIP ${zipCode}`,
          `small law offices in ZIP ${zipCode}`,
          `solo practitioner lawyers in ZIP ${zipCode}`,
          `personal injury criminal defense family estate immigration lawyers ZIP ${zipCode}`,
          `litigation bankruptcy employment real estate trial attorneys ZIP ${zipCode}`,
          `local law firm contact information ZIP ${zipCode}`
        );
      }

      const allSnippets = new Set<string>();
      let lastError: string | undefined;

      await Promise.all(
        queries.map(async (query) => {
          try {
            const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
            const response = await fetchWithTimeout(url, {
              headers: {
                "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
              }
            }, 5000);

            if (!response.ok) {
              lastError = `HTTP error ${response.status}`;
              return;
            }

            const html = await response.text();
            const regex = /<a class="result__snippet"[^>]*>([\s\S]*?)<\/a>/g;
            let match;
            let count = 0;

            while ((match = regex.exec(html)) !== null && count < 8) {
              const text = match[1]
                .replace(/<[^>]*>/g, "") // remove HTML tags
                .replace(/\s+/g, " ")    // normalize whitespace
                .trim();
              if (text) {
                allSnippets.add(text);
                count++;
              }
            }
          } catch (err: any) {
            lastError = err.message || "Scraping failed";
          }
        })
      );

      const snippets = Array.from(allSnippets);
      if (snippets.length === 0) {
        return {
          queries,
          context: "No web search results found for this query.",
          success: false,
          error: lastError || "No snippets matched in HTML response",
          resultCount: 0
        };
      }

      const context = snippets.map((s, i) => `[Result ${i + 1}]: ${s}`).join("\n\n");
      return {
        queries,
        context,
        success: true,
        resultCount: snippets.length
      };
    } catch (error: any) {
      return {
        queries: [],
        context: "Failed to retrieve web search context due to network/scraping error.",
        success: false,
        error: error.message || "Unknown error",
        resultCount: 0
      };
    }
  }

  async getFirmSearchContext(
    firmName: string,
    zipCode: string
  ): Promise<SearchResult[]> {
    const query = `${firmName} ${zipCode} law firm phone email attorneys website`;
    const results: SearchResult[] = [];
    try {
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
      const response = await fetchWithTimeout(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
        }
      }, 5000);

      if (!response.ok) {
        console.warn(`[research] No context found for ${firmName} due to HTTP error ${response.status}`);
        return [];
      }

      const html = await response.text();
      const regex = /<a[^>]*class="result__snippet"[^>]*href="([^"]+)"[^>]*>([\s\S]*?)<\/a>/gi;
      let match;
      const matches: { url: string; text: string }[] = [];

      while ((match = regex.exec(html)) !== null && matches.length < 15) {
        const rawUrl = match[1];
        const url = cleanDdgUrl(rawUrl);
        const text = match[2]
          .replace(/<[^>]*>/g, "") // remove HTML tags
          .replace(/\s+/g, " ")    // normalize whitespace
          .trim();
        if (url && text) {
          matches.push({ url, text });
        }
      }

      const orderedUrls: string[] = [];
      const urlToTexts: Record<string, string[]> = {};

      for (const item of matches) {
        if (!urlToTexts[item.url]) {
          urlToTexts[item.url] = [];
          orderedUrls.push(item.url);
        }
        urlToTexts[item.url].push(item.text);
      }

      for (const url of orderedUrls) {
        const texts = urlToTexts[url];
        results.push({
          title: texts[0] || "",
          url,
          snippet: texts[1] || texts[0] || "",
        });
      }

      return results.slice(0, 5); // limit to top 5 structured results
    } catch (err: any) {
      console.error(`[research] Search query failed for ${firmName}:`, err.message || err);
      return [];
    }
  }
}
