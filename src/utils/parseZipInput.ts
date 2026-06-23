import { normalizeZipCode } from "./prospectMatcher";

/**
 * Splits input string by commas and/or whitespace, normalizes each token,
 * filters out invalid ZIPs, dedupes them while preserving first-seen order,
 * and caps the output at 5 ZIP codes.
 */
export function parseZipInput(raw: string): string[] {
  if (!raw) return [];

  const tokens = raw.match(/[^,\s]+/g) || [];
  const normalized = tokens
    .map((token) => normalizeZipCode(token))
    .filter((zip): zip is string => zip !== null);

  const unique = Array.from(new Set(normalized));
  return unique.slice(0, 5);
}
