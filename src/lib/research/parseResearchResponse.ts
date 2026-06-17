// src/lib/research/parseResearchResponse.ts
// Handles cleaning, parsing, and schema validation of the LLM research response.

import { z } from "zod";
import { isUseful } from "./sanitize";

// Zod schema for individual law firm records
export const ResearchFirmSchema = z.object({
  attorney_name: z.string().nullable(),
  firm_name: z.string().min(1, "Firm name cannot be empty"),
  address: z.string().nullable(),
  phone: z.string().nullable(),
  website: z.string().nullable(),
  email: z.string().nullable(),
  attorneys: z.array(z.object({
    name: z.string(),
    email: z.string().nullable(),
  })).nullable().optional(),
});

// Zod schema for the entire research response wrapper
export const ResearchResponseSchema = z.object({
  zip_code: z.string(),
  firms: z.array(ResearchFirmSchema),
});

export type ValidatedResearchResponse = z.infer<typeof ResearchResponseSchema>;

/**
 * Parses a raw text response from the LLM, strips out any markdown code fences,
 * converts the string to JSON, and validates its contents against the Zod schema.
 * 
 * @param rawResponse The raw text returned by the LLM.
 * @returns The typed and validated research response.
 */
export function parseResearchResponse(rawResponse: string): ValidatedResearchResponse {
  let cleanedText = rawResponse.trim();

  // 1. Strip markdown code block wrappers (e.g. ```json ... ```) if present
  if (cleanedText.startsWith("```")) {
    // Matches ```json or ``` at the start, and ``` at the end
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
  }

  // 2. Parse raw string to JSON
  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error: any) {
    throw new Error(`Failed to parse LLM response as JSON: ${error.message}. Raw output was: ${rawResponse}`);
  }

  // 3. Sanitize LLM-returned literal strings (like "null" or "undefined") to JSON null
  if (parsedJson && typeof parsedJson === "object") {
    const sanitizeValue = (val: any) => {
      if (typeof val === "string") {
        const trimmed = val.trim();
        const lower = trimmed.toLowerCase();
        if (lower === "null" || lower === "undefined" || trimmed === "") {
          return null;
        }
        return trimmed;
      }
      return val;
    };

    if (Array.isArray(parsedJson.firms)) {
      parsedJson.firms = parsedJson.firms.map((firm: any) => {
        if (firm && typeof firm === "object") {
          let attorneys = null;
          if (Array.isArray(firm.attorneys)) {
            attorneys = firm.attorneys.map((att: any) => {
              if (att && typeof att === "object") {
                return {
                  name: typeof att.name === "string" ? att.name.trim() : "",
                  email: sanitizeValue(att.email),
                };
              }
              return att;
            }).filter((att: any) => att && att.name !== "");
          }
          return {
            ...firm,
            attorney_name: sanitizeValue(firm.attorney_name),
            firm_name: typeof firm.firm_name === "string" ? firm.firm_name.trim() : firm.firm_name,
            address: sanitizeValue(firm.address),
            phone: sanitizeValue(firm.phone),
            website: sanitizeValue(firm.website),
            email: sanitizeValue(firm.email),
            attorneys: attorneys || undefined,
          };
        }
        return firm;
      });
    }
  }

  // 3. Validate parsed JSON against Zod schema
  const validationResult = ResearchResponseSchema.safeParse(parsedJson);
  if (!validationResult.success) {
    const errorMessages = validationResult.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`JSON validation failed: ${errorMessages}`);
  }

  return validationResult.data;
}

// Zod schema for individual validation results
export const ValidationResultSchema = z.object({
  firm_name: z.string().min(1, "Firm name cannot be empty"),
  passes_icp: z.boolean(),
  confidence: z.enum(["high", "medium", "low"]),
  reasoning: z.string(),
  rejection_reason: z.string().nullable().optional(),
});

// Zod schema for the entire validation response
export const ValidationResponseSchema = z.object({
  zip_code: z.string(),
  validation_results: z.array(ValidationResultSchema),
});

export type ValidatedValidationResponse = z.infer<typeof ValidationResponseSchema>;

/**
 * Parses the raw validation JSON response from the LLM, cleans code blocks,
 * and validates the shape against the ValidationResponseSchema.
 */
export function parseValidationResponse(rawResponse: string): ValidatedValidationResponse {
  let cleanedText = rawResponse.trim();

  // Strip markdown code fences if present
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error: any) {
    throw new Error(`Failed to parse validation response as JSON: ${error.message}. Raw output: ${rawResponse}`);
  }

  // Sanitize simple null string values if LLM outputted them as string
  if (parsedJson && typeof parsedJson === "object" && Array.isArray(parsedJson.validation_results)) {
    parsedJson.validation_results = parsedJson.validation_results.map((item: any) => {
      if (item && typeof item === "object") {
        return {
          ...item,
          rejection_reason: item.rejection_reason === "null" || item.rejection_reason === "undefined" || item.rejection_reason === "" ? null : item.rejection_reason,
        };
      }
      return item;
    });
  }

  const validationCheck = ValidationResponseSchema.safeParse(parsedJson);
  if (!validationCheck.success) {
    const errorMessages = validationCheck.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Validation response Zod check failed: ${errorMessages}`);
  }

  return validationCheck.data;
}

// Zod schemas for contact enrichment validation
export const EnrichmentResultSchema = z.object({
  firm_name: z.string(),
  phone: z.string().nullable(),
  email: z.string().nullable(),
  website: z.string().nullable(),
  address: z.string().nullable(),
  attorneys: z.array(z.object({
    name: z.string(),
    email: z.string().nullable(),
  })).nullable().optional(),
});

export const EnrichmentResponseSchema = z.object({
  enrichment_results: z.array(EnrichmentResultSchema),
});

export type ValidatedEnrichmentResponse = z.infer<typeof EnrichmentResponseSchema>;

/**
 * Parses the raw contact enrichment JSON response from the LLM, cleans code block wrappers,
 * and validates the shape against the EnrichmentResponseSchema.
 */
export function parseEnrichmentResponse(rawResponse: string): ValidatedEnrichmentResponse {
  let cleanedText = rawResponse.trim();

  // Strip markdown code fences if present
  if (cleanedText.startsWith("```")) {
    cleanedText = cleanedText
      .replace(/^```json\s*/i, "")
      .replace(/^```\s*/i, "")
      .replace(/\s*```$/, "");
  }

  let parsedJson: any;
  try {
    parsedJson = JSON.parse(cleanedText);
  } catch (error: any) {
    throw new Error(`Failed to parse enrichment response as JSON: ${error.message}. Raw output: ${rawResponse}`);
  }

  // Sanitize values
  if (parsedJson && typeof parsedJson === "object" && Array.isArray(parsedJson.enrichment_results)) {
    const sanitizeEnrichValue = (val: any) => {
      if (typeof val === "string") {
        if (!isUseful(val)) {
          return null;
        }
        return val.trim();
      }
      return val;
    };

    parsedJson.enrichment_results = parsedJson.enrichment_results.map((item: any) => {
      if (item && typeof item === "object") {
        let attorneys = null;
        if (Array.isArray(item.attorneys)) {
          attorneys = item.attorneys.map((att: any) => {
            if (att && typeof att === "object") {
              const nameSanitized = sanitizeEnrichValue(att.name);
              return {
                name: nameSanitized || "",
                email: sanitizeEnrichValue(att.email),
              };
            }
            return att;
          }).filter((att: any) => att && att.name !== "");
        }

        return {
          ...item,
          phone: sanitizeEnrichValue(item.phone),
          email: sanitizeEnrichValue(item.email),
          website: sanitizeEnrichValue(item.website),
          address: sanitizeEnrichValue(item.address),
          attorneys,
        };
      }
      return item;
    });
  }

  const check = EnrichmentResponseSchema.safeParse(parsedJson);
  if (!check.success) {
    const errorMessages = check.error.issues
      .map((issue) => `${issue.path.join(".")}: ${issue.message}`)
      .join(", ");
    throw new Error(`Enrichment response Zod check failed: ${errorMessages}`);
  }

  return check.data;
}
