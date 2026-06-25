export type LeadStatus = "ACTIVE" | "WON" | "LOST";

export const LEAD_STATUSES: LeadStatus[] = ["ACTIVE", "WON", "LOST"];

export function parseLeadStatus(input: unknown): LeadStatus | null {
  if (typeof input !== "string") {
    return null;
  }
  if (input === "ACTIVE" || input === "WON" || input === "LOST") {
    return input;
  }
  return null;
}
