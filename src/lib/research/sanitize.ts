/**
 * Checks if a research field value contains a placeholder or empty/non-useful info.
 * Returns false for null/undefined/empty and placeholder strings ("n/a", "none", "unknown", "not available", "placeholder", etc.); true otherwise.
 */
export function isUseful(val: string | null | undefined): boolean {
  if (!val) return false;
  const trimmed = val.trim();
  const lower = trimmed.toLowerCase();
  const placeholders = [
    "null", "undefined", "", "n/a", "na", "none", "not available", 
    "no email", "no phone", "placeholder", "unknown", "not found",
    "pending", "no-email@example.com", "example@example.com",
    "info@example.com", "test@example.com", "fake"
  ];
  return !placeholders.includes(lower);
}
