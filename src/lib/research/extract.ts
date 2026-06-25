import { fetchDirect, fetchPageContent } from "./searchProviders/tavily";
import { fetchJina } from "./searchProviders/jina";

export interface WebsiteCheckAttempt {
  provider: "JINA" | "DIRECT" | "TAVILY";
  url: string;
  httpStatus: number | null;
  outcome: "SUCCESS" | "EMPTY" | "ERROR";
  errorMessage: string | null;
}

/**
 * Classifies the outcome of a single website fetch attempt.
 */
export function classifyAttempt(
  provider: "JINA" | "DIRECT" | "TAVILY",
  url: string,
  resultText: string | null | undefined,
  error: any | null
): WebsiteCheckAttempt {
  if (error) {
    const errorStr = typeof error === "string" ? error : (error.message || String(error));
    const match = errorStr.match(/\b\d{3}\b/);
    const httpStatus = match ? parseInt(match[0], 10) : null;
    return {
      provider,
      url,
      httpStatus,
      outcome: "ERROR",
      errorMessage: errorStr,
    };
  }

  if (resultText === null || resultText === undefined || resultText.trim().length === 0) {
    return {
      provider,
      url,
      httpStatus: null,
      outcome: "EMPTY",
      errorMessage: null,
    };
  }

  return {
    provider,
    url,
    httpStatus: null,
    outcome: "SUCCESS",
    errorMessage: null,
  };
}

/**
 * Sibling function to extractPageContent that keeps track of every provider attempt and returns it.
 */
export async function extractPageContentWithAttempts(
  url: string
): Promise<{ text: string; attempts: WebsiteCheckAttempt[] }> {
  const providerSetting = process.env.EXTRACT_PROVIDER?.trim().toLowerCase();
  const attempts: WebsiteCheckAttempt[] = [];

  const runAttempt = async (
    provider: "JINA" | "DIRECT" | "TAVILY",
    fetchFn: (url: string) => Promise<string>
  ): Promise<{ success: boolean; text: string }> => {
    try {
      const text = await fetchFn(url);
      const attempt = classifyAttempt(provider, url, text, null);
      attempts.push(attempt);
      return { success: attempt.outcome === "SUCCESS", text: text || "" };
    } catch (e: any) {
      const attempt = classifyAttempt(provider, url, null, e);
      attempts.push(attempt);
      return { success: false, text: "" };
    }
  };

  if (providerSetting === "jina") {
    console.log(`[enrichment] Extracting via Jina Reader: ${url}`);
    const jinaRes = await runAttempt("JINA", fetchJina);
    if (jinaRes.success) {
      return { text: jinaRes.text, attempts };
    }
    console.log(`[enrichment] Jina empty or failed, falling back to direct: ${url}`);

    const directRes = await runAttempt("DIRECT", fetchDirect);
    if (directRes.success) {
      return { text: directRes.text, attempts };
    }
    console.log(`[enrichment] Direct fetch empty or failed, falling back to Tavily: ${url}`);

    const tavilyRes = await runAttempt("TAVILY", fetchPageContent);
    return { text: tavilyRes.text, attempts };
  }

  if (providerSetting === "direct") {
    console.log(`[enrichment] Extracting via direct fetch: ${url}`);
    const directRes = await runAttempt("DIRECT", fetchDirect);
    if (directRes.success) {
      return { text: directRes.text, attempts };
    }
    console.log(`[enrichment] Direct fetch empty or failed, falling back to Tavily: ${url}`);

    const tavilyRes = await runAttempt("TAVILY", fetchPageContent);
    return { text: tavilyRes.text, attempts };
  }

  // Default / "tavily"
  console.log(`[enrichment] Extracting via Tavily: ${url}`);
  const tavilyRes = await runAttempt("TAVILY", fetchPageContent);
  return { text: tavilyRes.text, attempts };
}

/**
 * Extracts page content from a URL based on the EXTRACT_PROVIDER setting.
 * 
 * Behavior:
 * - "jina": tries Jina Reader first, then falls back to direct fetch, then Tavily Extract.
 * - "direct": tries direct fetch first, and falls back to Tavily Extract if direct fails/empty.
 * - "tavily" (or default): Tavily Extract first, falling back to direct fetch.
 */
export async function extractPageContent(url: string): Promise<string> {
  const { text } = await extractPageContentWithAttempts(url);
  return text;
}

