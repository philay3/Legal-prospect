export interface CapAttorneysResult {
  visible: string[];
  remaining: number;
}

/**
 * Caps an array of attorney names at a maximum number of visible entries.
 * Returns the visible subset of names and the count of remaining attorneys.
 * Trims names and ignores empty strings.
 */
export function capAttorneys(
  names: string[] | null | undefined,
  max: number
): CapAttorneysResult {
  if (!names || names.length === 0) {
    return { visible: [], remaining: 0 };
  }
  
  const validNames = names
    .map((name) => name?.trim())
    .filter((name): name is string => typeof name === "string" && name !== "");

  if (validNames.length <= max) {
    return { visible: validNames, remaining: 0 };
  }

  return {
    visible: validNames.slice(0, max),
    remaining: validNames.length - max,
  };
}
