import { toCanonicalPracticeArea } from "./research/sanitize";

export const practiceAreaInclude = {
  areaLinks: {
    include: {
      practiceArea: true,
    },
  },
} as const;

export interface FirmWithAreaLinks {
  areaLinks?: {
    practiceArea: {
      name: string;
    };
  }[];
  practiceAreas?: string[];
}

/**
 * Shared projection function that maps raw FirmPracticeArea links to sorted canonical names.
 * Falls back to raw practiceAreas array if areaLinks is not present (useful in tests/mocks).
 */
export function getPracticeAreaNames(firm: FirmWithAreaLinks | null | undefined): string[] {
  if (!firm) return [];
  if (firm.areaLinks) {
    const canonicalNames = firm.areaLinks.map((l) => toCanonicalPracticeArea(l.practiceArea.name));
    const seen = new Set<string>();
    const uniqueCanonicalNames: string[] = [];
    for (const name of canonicalNames) {
      const lower = name.toLowerCase();
      if (!seen.has(lower)) {
        seen.add(lower);
        uniqueCanonicalNames.push(name);
      }
    }
    return uniqueCanonicalNames.sort((a, b) => a.localeCompare(b));
  }
  return firm.practiceAreas || [];
}
