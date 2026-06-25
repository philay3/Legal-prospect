export function formatRelativeTime(date: Date | string, now: Date = new Date()): string {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  const diffMs = now.getTime() - dateObj.getTime();
  if (diffMs <= 0) {
    return "just now";
  }
  const diffSec = Math.floor(diffMs / 1000);
  if (diffSec < 60) {
    return "just now";
  }
  if (diffSec < 3600) {
    const m = Math.floor(diffSec / 60);
    return `${m}m ago`;
  }
  if (diffSec < 86400) {
    const h = Math.floor(diffSec / 3600);
    return `${h}h ago`;
  }
  if (diffSec < 604800) {
    const d = Math.floor(diffSec / 86400);
    return `${d}d ago`;
  }
  
  const d = Math.floor(diffSec / 86400);
  if (d < 30) {
    const w = Math.floor(d / 7);
    return `${w}w ago`;
  }
  if (d < 365) {
    const mo = Math.floor(d / 30);
    return `${mo}mo ago`;
  }
  const y = Math.floor(d / 365);
  return `${y}y ago`;
}

export function formatActivityEvent(a: {
  type: "SEARCHED" | "SAVED" | "WON" | "LOST";
  query?: string | null;
  firm?: { firmName: string } | null;
  count?: number | null;
}): { label: string; subject: string; kind: string } {
  switch (a.type) {
    case "SEARCHED":
      return {
        label: "Searched",
        subject: a.query || "a ZIP",
        kind: "searched",
      };
    case "SAVED":
      if (a.firm) {
        return {
          label: "Saved",
          subject: a.firm.firmName,
          kind: "saved",
        };
      }
      if (a.count !== undefined && a.count !== null) {
        return {
          label: "Saved",
          subject: a.count === 1 ? "1 lead" : `${a.count} leads`,
          kind: "saved",
        };
      }
      return {
        label: "Saved",
        subject: "a firm",
        kind: "saved",
      };
    case "WON":
      return {
        label: "Won",
        subject: a.firm?.firmName || "a firm",
        kind: "won",
      };
    case "LOST":
      return {
        label: "Lost",
        subject: a.firm?.firmName || "a firm",
        kind: "lost",
      };
  }
}
