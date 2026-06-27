import type { Prospect } from "@/types/prospect";

export type SortField = "name" | "areas" | "attorneys" | "confidence";
export type SortDir = "asc" | "desc";

export function matchesFilter(p: Prospect, rawQuery: string): boolean {
  const query = rawQuery.trim().toLowerCase();
  if (!query) return true;

  if (p.firmName && p.firmName.toLowerCase().includes(query)) {
    return true;
  }

  if (p.practiceAreas && Array.isArray(p.practiceAreas)) {
    for (const pa of p.practiceAreas) {
      if (pa && pa.toLowerCase().includes(query)) {
        return true;
      }
    }
  }

  if (p.attorneys && Array.isArray(p.attorneys)) {
    for (const att of p.attorneys) {
      if (att && att.toLowerCase().includes(query)) {
        return true;
      }
    }
  }

  return false;
}

export function filterProspects(prospects: Prospect[], query: string): Prospect[] {
  return prospects.filter((p) => matchesFilter(p, query));
}

export function sortProspects(prospects: Prospect[], field: SortField, dir: SortDir): Prospect[] {
  const copy = [...prospects];
  copy.sort((a, b) => {
    let primary = 0;
    if (field === "name") {
      primary = a.firmName.localeCompare(b.firmName);
    } else if (field === "areas") {
      const aLen = a.practiceAreas?.length ?? 0;
      const bLen = b.practiceAreas?.length ?? 0;
      primary = aLen - bLen;
    } else if (field === "attorneys") {
      const aCount = a.attorneys ? a.attorneys.filter((x) => x && x.trim()).length : 0;
      const bCount = b.attorneys ? b.attorneys.filter((x) => x && x.trim()).length : 0;
      primary = aCount - bCount;
    } else if (field === "confidence") {
      const rank: Record<string, number> = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      const aVal = rank[a.confidenceTier ?? "LOW"] ?? 0;
      const bVal = rank[b.confidenceTier ?? "LOW"] ?? 0;
      primary = aVal - bVal;
    }

    if (dir === "desc") {
      primary = -primary;
    }

    if (primary !== 0) {
      return primary;
    }

    // Tiebreak: always firmName ascending, independent of dir
    return a.firmName.localeCompare(b.firmName);
  });
  return copy;
}
