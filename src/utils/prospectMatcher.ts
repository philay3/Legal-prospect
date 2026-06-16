import { Prospect } from "@/types/prospect";

/**
 * Normalizes a ZIP code string to a standard 5-digit format.
 * Returns null if the ZIP code is invalid or empty.
 */
export function normalizeZipCode(zip: string | null | undefined): string | null {
  if (!zip) return null;
  const trimmed = zip.trim();
  const match = trimmed.match(/^(\d{5})(?:-\d{4})?$/);
  if (match) {
    return match[1];
  }
  return null;
}

/**
 * Filters a list of prospects to return those matching the search ZIP code.
 * Ensures robust comparison by normalizing both the search input and the prospect ZIP codes.
 */
export function matchProspectsByZip(
  prospects: Prospect[],
  searchZip: string | null | undefined
): Prospect[] {
  const normalizedSearch = normalizeZipCode(searchZip);
  if (!normalizedSearch) {
    return [];
  }

  return prospects.filter((prospect) => {
    const normalizedProspectZip = normalizeZipCode(prospect.zip);
    return normalizedProspectZip === normalizedSearch;
  });
}
