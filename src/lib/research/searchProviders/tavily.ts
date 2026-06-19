// src/lib/research/searchProviders/tavily.ts
import { SearchProvider, SearchResult, SearchContextResponse } from "./types";

/**
 * Maps Tavily search results to a grounding context array of snippets.
 */
export function mapTavilySearchToContext(rawResponse: any): string[] {
  if (!rawResponse || !Array.isArray(rawResponse.results)) {
    return [];
  }
  return rawResponse.results
    .map((r: any) => r.content || r.snippet || "")
    .filter((text: string) => text.trim().length > 0);
}

/**
 * Maps Tavily extract response to page plain text.
 */
export function mapTavilyExtractToText(rawResponse: any): string {
  if (!rawResponse || !Array.isArray(rawResponse.results) || rawResponse.results.length === 0) {
    return "";
  }
  return rawResponse.results
    .map((r: any) => r.raw_content || r.content || "")
    .filter(Boolean)
    .join("\n\n")
    .trim();
}

/**
 * Helper to perform HTTP POST queries to Tavily API endpoints.
 */
async function postTavily(endpoint: string, body: any, timeoutMs = 8000) {
  const apiKey = process.env.TAVILY_API_KEY;
  if (!apiKey) {
    throw new Error("Missing TAVILY_API_KEY environment variable");
  }

  const url = `https://api.tavily.com${endpoint}`;
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(body),
      signal: controller.signal,
    });

    if (!response.ok) {
      const errorText = await response.text().catch(() => "");
      throw new Error(`Tavily API error HTTP ${response.status}: ${errorText || response.statusText}`);
    }

    return await response.json();
  } finally {
    clearTimeout(id);
  }
}

export class TavilySearchProvider implements SearchProvider {
  async getSearchContext(
    zipCode: string,
    mode: "quick" | "thorough",
    city?: string,
    state?: string
  ): Promise<SearchContextResponse> {
    const queries: string[] = [];
    const location = (city && state) ? `${city}, ${state} ${zipCode}` : zipCode;
    if (mode === "quick") {
      queries.push(`law firms in ${location}`);
    } else {
      queries.push(
        `boutique law firms in ${location}`,
        `small law offices in ${location}`,
        `solo practitioner lawyers in ${location}`,
        `personal injury criminal defense family estate immigration lawyers ${location}`,
        `litigation bankruptcy employment real estate trial attorneys ${location}`,
        `local law firm contact information ${location}`
      );
    }

    const allSnippets = new Set<string>();
    let lastError: string | undefined;

    try {
      await Promise.all(
        queries.map(async (query) => {
          try {
            const rawResponse = await postTavily("/search", {
              query,
              search_depth: "basic",
              max_results: 5,
            });
            const snippets = mapTavilySearchToContext(rawResponse);
            for (const s of snippets) {
              allSnippets.add(s);
            }
          } catch (err: any) {
            lastError = err.message || "Tavily search request failed";
          }
        })
      );

      const snippetsArray = Array.from(allSnippets);
      if (snippetsArray.length === 0) {
        return {
          queries,
          context: "No web search results found for this query.",
          success: false,
          error: lastError || "No results from Tavily search",
          resultCount: 0
        };
      }

      const context = snippetsArray.map((s, i) => `[Result ${i + 1}]: ${s}`).join("\n\n");
      return {
        queries,
        context,
        success: true,
        resultCount: snippetsArray.length
      };
    } catch (error: any) {
      return {
        queries,
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
    try {
      const rawResponse = await postTavily("/search", {
        query,
        search_depth: "basic",
        max_results: 5,
      });

      if (!rawResponse || !Array.isArray(rawResponse.results)) {
        return [];
      }

      return rawResponse.results.slice(0, 5).map((r: any) => ({
        title: r.title || "",
        url: r.url || "",
        snippet: r.content || r.snippet || "",
      }));
    } catch (err: any) {
      console.error(`[research] Tavily search query failed for ${firmName}:`, err.message || err);
      return [];
    }
  }
}

/**
 * Fetches page content using Tavily Extract, falling back to direct fetch.
 */
export async function fetchPageContent(url: string, timeoutMs = 8000): Promise<string> {
  const apiKey = process.env.TAVILY_API_KEY;
  if (apiKey) {
    try {
      console.log(`[enrichment] Extracting page via Tavily: ${url}`);
      const rawResponse = await postTavily("/extract", {
        urls: [url],
        extract_depth: "basic",
      }, timeoutMs);
      const text = mapTavilyExtractToText(rawResponse);
      if (text) {
        return text;
      }
      console.log(`[enrichment] Tavily Extract returned empty for ${url}, falling back to direct fetch.`);
    } catch (e: any) {
      console.log(`[enrichment] Tavily Extract failed for ${url}: ${e.message || e}, falling back to direct fetch.`);
    }
  }

  // Fallback to direct fetch
  console.log(`[enrichment] Fetching page directly: ${url}`);
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeoutMs);
  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36"
      },
      signal: controller.signal,
    });

    if (!response.ok) {
      throw new Error(`Direct fetch HTTP error ${response.status}`);
    }

    const html = await response.text();
    // We clean html to text to keep it consistent with old implementation
    // cleanHtmlToText must be imported/called where fetchPageContent is used,
    // but we can also handle it in the caller or import it.
    // Let's return the raw HTML and let the caller clean it, or import cleanHtmlToText here.
    // To prevent circular imports, it's cleaner to return raw HTML or clean text.
    // Wait! Let's check: if we do direct fetch, we get HTML. Tavily Extract returns cleaned markdown/text.
    // So the caller can check if the response starts with "<" (HTML) and run cleanHtmlToText, or clean it.
    // Or we can import cleanHtmlToText from '../sanitize'. Yes! Sanitize is in '../sanitize.ts',
    // which has no dependencies on search providers. So importing cleanHtmlToText here is 100% circular-dependency-free.
    // Let's do that!
    const { cleanHtmlToText } = await import("../sanitize");
    return cleanHtmlToText(html);
  } finally {
    clearTimeout(id);
  }
}
