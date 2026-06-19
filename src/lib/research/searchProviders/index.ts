// src/lib/research/searchProviders/index.ts
import { SearchProvider } from "./types";
import { DdgSearchProvider } from "./ddg";
import { TavilySearchProvider } from "./tavily";
import { PlacesSearchProvider } from "./places";

/**
 * Maps the environment string to the supported provider keys.
 */
export function selectProvider(envVal: string | undefined): "tavily" | "ddg" | "places" {
  if (!envVal) return "tavily";
  const normalized = envVal.trim().toLowerCase();
  if (normalized === "ddg") return "ddg";
  if (normalized === "places") return "places";
  return "tavily";
}

/**
 * Resolves the active SearchProvider based on environment variables.
 * Defaults to Tavily Search. Falls back to DuckDuckGo if the Tavily key is missing.
 */
export function getSearchProvider(): SearchProvider {
  const providerType = selectProvider(process.env.SEARCH_PROVIDER);

  if (providerType === "places") {
    const placesKey = process.env.GOOGLE_PLACES_API_KEY;
    if (!placesKey) {
      throw new Error("SEARCH_PROVIDER is set to 'places' but GOOGLE_PLACES_API_KEY is not set. Fail loudly.");
    }
    return new PlacesSearchProvider();
  }

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
