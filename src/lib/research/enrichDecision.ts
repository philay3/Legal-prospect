import { isUseful } from "./sanitize";

export type EnrichDecision = "use-email" | "skip" | "fetch";

const COOLDOWN_DAYS = 30;
const COOLDOWN_MS = COOLDOWN_DAYS * 24 * 60 * 60 * 1000;

export function enrichDecision(
  email: string | null,
  emailCheckedAt: Date | null,
  now: Date = new Date()
): EnrichDecision {
  if (isUseful(email)) {
    return "use-email";
  }

  if (emailCheckedAt) {
    const gap = now.getTime() - emailCheckedAt.getTime();
    if (gap < COOLDOWN_MS) {
      return "skip";
    }
  }

  return "fetch";
}
