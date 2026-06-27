import { formatRelativeTime } from "./activityFeed";

export function leadActivityLine(
  lead: { status?: string | null; savedAt: string; statusChangedAt: string },
  now: Date = new Date()
): string {
  const status = lead.status ? lead.status.toUpperCase() : "ACTIVE";
  if (status === "WON" || status === "LOST") {
    return `Closed · ${formatRelativeTime(lead.statusChangedAt, now)}`;
  }
  return `Saved · ${formatRelativeTime(lead.savedAt, now)}`;
}
