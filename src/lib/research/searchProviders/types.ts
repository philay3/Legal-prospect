// src/lib/research/searchProviders/types.ts

export interface SearchResult {
  title: string;
  url: string;
  snippet: string;
}

export interface SearchContextResponse {
  queries: string[];
  context: string;
  success: boolean;
  error?: string;
  resultCount: number;
}

export interface SearchProvider {
  getSearchContext(
    zipCode: string,
    mode: "quick" | "thorough"
  ): Promise<SearchContextResponse>;
  
  getFirmSearchContext(
    firmName: string,
    zipCode: string
  ): Promise<SearchResult[]>;
}
