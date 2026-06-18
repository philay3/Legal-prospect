// src/lib/research/searchProviders/index.ts
import { SearchProvider } from "./types";
import { DdgSearchProvider } from "./ddg";
import { TavilySearchProvider } from "./tavily";

/**
 * Maps the environment string to the supported provider keys.
 */
export function selectProvider(envVal: string | undefined): "tavily" | "ddg" {
  if (!envVal) return "tavily";
  const normalized = envVal.trim().toLowerCase();
  if (normalized === "ddg") return "ddg";
  return "tavily";
}

/**
 * Resolves the active SearchProvider based on environment variables.
 * Defaults to Tavily Search. Falls back to DuckDuckGo if the Tavily key is missing.
 */
export function getSearchProvider(): SearchProvider {
  const providerType = selectProvider(process.env.SEARCH_PROVIDER);
  const apiKey = process.env.TAVILY_API_KEY;

  if (providerType === "ddg") {
    return new DdgSearchProvider();
  }

  if (!apiKey) {
    console.warn("[research] SEARCH_PROVIDER is set to tavily (or default) but TAVILY_API_KEY is missing. Falling back to DuckDuckGo.");
    return new DdgSearchProvider();
  }

  return new TavilySearchProvider();
}
