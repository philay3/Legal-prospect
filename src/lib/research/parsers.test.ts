import { describe, it, expect } from "vitest";
import { parseResearchResponse, parseEnrichmentResponse } from "./parseResearchResponse";

describe("Research response parsers", () => {
  describe("parseResearchResponse", () => {
    it("should parse a valid JSON response correctly", () => {
      const raw = JSON.stringify({
        zip_code: "19103",
        firms: [
          {
            attorney_name: "John Doe",
            firm_name: "Smith & Doe LLC",
            address: "123 Market St",
            phone: "555-0101",
            website: "https://smithdoe.com",
            email: "john@smithdoe.com",
            practice_areas: ["Family Law", "Personal Injury"],
          },
        ],
      });

      const parsed = parseResearchResponse(raw);
      expect(parsed.zip_code).toBe("19103");
      expect(parsed.firms).toHaveLength(1);
      expect(parsed.firms[0].firm_name).toBe("Smith & Doe LLC");
      expect(parsed.firms[0].practice_areas).toEqual(["Family Law", "Personal Injury"]);
    });

    it("should strip markdown code block fences if present", () => {
      const raw = `\`\`\`json
{
  "zip_code": "19103",
  "firms": [
    {
      "attorney_name": "John Doe",
      "firm_name": "Smith & Doe LLC",
      "address": "123 Market St",
      "phone": "555-0101",
      "website": "https://smithdoe.com",
      "email": "john@smithdoe.com"
    }
  ]
}
\`\`\``;

      const parsed = parseResearchResponse(raw);
      expect(parsed.zip_code).toBe("19103");
      expect(parsed.firms).toHaveLength(1);
    });

    it("should sanitize literal string 'null' and 'undefined' values to real nulls", () => {
      const raw = JSON.stringify({
        zip_code: "19103",
        firms: [
          {
            attorney_name: "null",
            firm_name: "Smith & Doe LLC",
            address: "undefined",
            phone: "555-0101",
            website: "",
            email: "john@smithdoe.com",
          },
        ],
      });

      const parsed = parseResearchResponse(raw);
      expect(parsed.firms[0].attorney_name).toBeNull();
      expect(parsed.firms[0].address).toBeNull();
      expect(parsed.firms[0].website).toBeNull();
    });

    it("should throw a Zod validation rejection if firm_name is empty", () => {
      const raw = JSON.stringify({
        zip_code: "19103",
        firms: [
          {
            attorney_name: "John Doe",
            firm_name: "",
            address: "123 Market St",
            phone: null,
            website: null,
            email: null,
          },
        ],
      });

      expect(() => parseResearchResponse(raw)).toThrow(/validation failed/i);
    });

    it("should throw if the response is not valid JSON", () => {
      const raw = "not a json string";
      expect(() => parseResearchResponse(raw)).toThrow(/Failed to parse LLM response as JSON/i);
    });
  });

  describe("parseEnrichmentResponse", () => {
    it("should parse and validate a valid enrichment response", () => {
      const raw = JSON.stringify({
        enrichment_results: [
          {
            firm_name: "Smith & Doe LLC",
            phone: "555-0101",
            email: "info@smithdoe.com",
            website: "https://smithdoe.com",
            address: "123 Market St",
            attorneys: [
              {
                name: "John Doe",
                email: "john@smithdoe.com",
              },
            ],
            practice_areas: ["Corporate Law"],
          },
        ],
      });

      const parsed = parseEnrichmentResponse(raw);
      expect(parsed.enrichment_results).toHaveLength(1);
      expect(parsed.enrichment_results[0].firm_name).toBe("Smith & Doe LLC");
      expect(parsed.enrichment_results[0].attorneys).toHaveLength(1);
      expect(parsed.enrichment_results[0].attorneys?.[0].name).toBe("John Doe");
      expect(parsed.enrichment_results[0].practice_areas).toEqual(["Corporate Law"]);
    });

    it("should sanitize placeholders like 'unknown', 'example@example.com' or fake phone numbers to null", () => {
      const raw = JSON.stringify({
        enrichment_results: [
          {
            firm_name: "Smith & Doe LLC",
            phone: "fake",
            email: "example@example.com",
            website: "unknown",
            address: "none",
            attorneys: [
              {
                name: "John Doe",
                email: "info@example.com",
              },
            ],
          },
        ],
      });

      const parsed = parseEnrichmentResponse(raw);
      expect(parsed.enrichment_results[0].phone).toBeNull();
      expect(parsed.enrichment_results[0].email).toBeNull();
      expect(parsed.enrichment_results[0].website).toBeNull();
      expect(parsed.enrichment_results[0].address).toBeNull();
      expect(parsed.enrichment_results[0].attorneys?.[0].email).toBeNull();
    });

    it("should throw Zod error if enrichment result format is incorrect", () => {
      const raw = JSON.stringify({
        enrichment_results: [
          {
            // missing firm_name
            phone: "555-0101",
          },
        ],
      });

      expect(() => parseEnrichmentResponse(raw)).toThrow(/Enrichment response Zod check failed/i);
    });
  });
});
