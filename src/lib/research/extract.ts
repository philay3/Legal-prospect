import { fetchDirect, fetchPageContent } from "./searchProviders/tavily";

/**
 * Extracts page content from a URL based on the EXTRACT_PROVIDER setting.
 * 
 * Behavior:
 * - "direct": tries direct fetch first, and falls back to Tavily Extract if direct fails/empty.
 * - "tavily" (or default): Tavily Extract first, falling back to direct fetch.
 */
export async function extractPageContent(url: string): Promise<string> {
  const provider = process.env.EXTRACT_PROVIDER?.trim().toLowerCase();

  if (provider === "direct") {
    console.log(`[enrichment] Extracting via direct fetch: ${url}`);
    try {
      const text = await fetchDirect(url);
      if (text && text.trim().length > 0) {
        return text;
      }
      console.log(`[enrichment] direct fetch empty/failed, falling back to Tavily: ${url}`);
    } catch (e: any) {
      console.log(`[enrichment] direct fetch empty/failed, falling back to Tavily: ${url} - ${e.message || e}`);
    }
    return await fetchPageContent(url);
  }

  // Default / "tavily"
  return await fetchPageContent(url);
}
