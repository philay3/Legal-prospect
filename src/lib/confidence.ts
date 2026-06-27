import type { ConfidenceTier } from "../types/prospect";

export type DataPointSource =
  | "FIRM_DOMAIN"
  | "OFF_DOMAIN"
  | "GENERIC_PROVIDER"
  | "UNVERIFIED"
  | "PLACES"
  | "WEBSITE";

export function firmConfidenceTier(input: {
  emailSource: DataPointSource | null | undefined;
  phoneSource: DataPointSource | null | undefined;
}): ConfidenceTier {
  const { emailSource, phoneSource } = input;

  if (emailSource === "FIRM_DOMAIN") {
    return "HIGH";
  }

  const isEmailSourcePresent = emailSource !== null && emailSource !== undefined;

  if (
    isEmailSourcePresent ||
    (!isEmailSourcePresent && phoneSource === "PLACES")
  ) {
    return "MEDIUM";
  }

  return "LOW";
}
