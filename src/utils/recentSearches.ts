export function dedupeRecentSearches(zips: string[], limit: number): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const zip of zips) {
    if (!seen.has(zip)) {
      seen.add(zip);
      result.push(zip);
      if (result.length === limit) {
        break;
      }
    }
  }
  return result;
}
