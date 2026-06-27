import { normalizeZipCode } from "./prospectMatcher";

export interface ParsedZipInput {
  zips: string[];
  error: string | null;
}

/**
 * Splits input string by commas and/or whitespace, normalizes each token,
 * filters out invalid ZIPs, expands ranges, dedupes them while preserving
 * first-seen order, and enforces a 5 ZIP code limit.
 */
export function parseZipInput(raw: string): ParsedZipInput {
  if (!raw || !raw.trim()) {
    return { zips: [], error: null };
  }

  const tokens = raw.match(/[^,\s]+/g) || [];
  const expanded: string[] = [];

  for (const token of tokens) {
    const rangeMatch = token.match(/^(\d{5})-(\d{5})$/);
    if (rangeMatch) {
      const start = parseInt(rangeMatch[1], 10);
      const end = parseInt(rangeMatch[2], 10);
      const size = Math.abs(end - start) + 1;
      
      if (size > 5) {
        return {
          zips: [],
          error: "Enter up to 5 ZIP codes at a time. Use a smaller range or fewer codes."
        };
      }

      if (start <= end) {
        for (let i = start; i <= end; i++) {
          expanded.push(String(i).padStart(5, "0"));
        }
      } else {
        for (let i = start; i >= end; i--) {
          expanded.push(String(i).padStart(5, "0"));
        }
      }
    } else {
      const normalized = normalizeZipCode(token);
      if (normalized !== null) {
        expanded.push(normalized);
      }
    }
  }

  const unique = Array.from(new Set(expanded));

  if (unique.length > 5) {
    return {
      zips: [],
      error: "Enter up to 5 ZIP codes at a time. Use a smaller range or fewer codes."
    };
  }

  return { zips: unique, error: null };
}
