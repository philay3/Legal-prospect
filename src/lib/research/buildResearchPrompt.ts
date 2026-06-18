// src/lib/research/buildResearchPrompt.ts
// Builds the prompts instructing the LLM to perform grounded web research for law firms and validate candidate results.

/**
 * Builds the prompt instructing the LLM to find law firms in the given ZIP code
 * based on inclusion/exclusion criteria, returning only structured JSON.
 * 
 * @param zipCode The 5-digit US ZIP code to search.
 * @param mode The search mode ("quick" or "thorough").
 */
export function buildResearchPrompt(zipCode: string, mode: "quick" | "thorough" = "quick"): string {
  if (mode === "quick") {
    return `You are a professional legal research assistant. Your task is to find small, boutique law firms located in the ZIP code: "${zipCode}".

### Ideal Customer Profile (Inclusion Criteria)
Include a law firm ONLY if it meets ALL of the following:
1. The firm has a physical office located in the ZIP code "${zipCode}".
2. The firm is small, consisting of 1 to 10 attorneys in total.
3. The firm is a single-office, independent firm (solo practitioners are allowed).

### Exclusion Criteria
Do NOT include a law firm if it matches ANY of the following:
1. The firm has more than 10 attorneys.
2. The firm is a national or regional law firm.
3. The firm has multiple office locations, or is a branch/satellite office of a larger firm.

### Data Collection Requirements
For each qualifying law firm found, collect the following fields:
1. "attorney_name": The name of a primary attorney or solo practitioner at the firm (use null if not identified).
2. "firm_name": The official name of the law firm (must be non-empty).
3. "address": The physical office address in ZIP code ${zipCode} (use null if not found).
4. "phone": The phone number of the firm (use null if not found).
5. "website": The official website URL of the firm (use null if not found).
6. "email": The general contact email or attorney-specific email of the firm (use null if not found).
7. "practice_areas": An array of the firm's practice areas / specialties (e.g. ["Family Law", "Personal Injury"]); use an empty array if not stated.

### Crucial Constraints
- Do NOT invent, guess, or hallucinate any data. If a phone, website, email, address, or attorney name is not explicitly found, use null.
- Provide real, active boutique firms currently operating in "${zipCode}".

### Output Format
Return ONLY a valid JSON object matching the following structure. Do not output any conversational text, notes, or explanations before or after the JSON.

JSON Schema:
{
  "zip_code": "${zipCode}",
  "firms": [
    {
      "attorney_name": "string or null",
      "firm_name": "string",
      "address": "string or null",
      "phone": "string or null",
      "website": "string or null",
      "email": "string or null",
      "practice_areas": ["string"]
    }
  ]
}
`;
  }

  // Thorough mode prompt
  return `You are a professional legal research assistant. Your task is to perform a deep research pass to discover small, boutique, or local law firms serving or located in the ZIP code: "${zipCode}".

### Ideal Customer Profile (Inclusion Criteria)
We are looking for boutique and small-firm prospects. Include a law firm if it fits the following profile:
1. The firm is located in or clearly serving the searched ZIP code "${zipCode}".
2. The firm is small or boutique, consisting of 1 to 10 attorneys in total (solo practitioners are allowed).
3. The firm is independent or local-facing.
4. If some details (like attorney count or single-office status) are slightly uncertain, but it is plausibly a small local/boutique prospect, do NOT automatically exclude it. Keep it as a candidate.

### Practice Area Guidelines
Look broadly across common small-firm practice areas, including civil litigation, criminal defense, family law, estate planning, probate, personal injury, employment law, workers compensation, real estate law, immigration, bankruptcy, landlord-tenant, DUI/traffic defense, business law, consumer law, and general practice. Do not limit results to only family law, estate planning, business law, and elder law. Look for a wide variety of legal areas.

### Exclusion Criteria (Strict Rejection)
Reject a candidate ONLY if there is clear evidence of the following:
1. The candidate is clearly not a law firm (e.g. legal aid society, directory site, bar association, government entity, court).
2. The firm is clearly outside the targeted geography.
3. The firm is clearly a large national or regional law firm (e.g. hundreds of attorneys).
4. The firm clearly has multiple office locations with many attorneys, or is a branch/satellite office of a major national firm.
5. The firm has more than 10 attorneys.

### Research Goals & Capacity
- Discover as many candidate firms as possible (aim for up to 15 to 20 firms if they exist in the context).
- For each firm, compile all details from the provided search context.
- Include the firm's practice areas / specialties when evident from the results; use an empty array if not stated.
- Do NOT invent, guess, or fabricate phone numbers, websites, email addresses, or attorney names. If unknown, use null.

### Output Format
Return ONLY a valid JSON object matching the following structure. Do not output any conversational text, notes, or explanations before or after the JSON.

JSON Schema:
{
  "zip_code": "${zipCode}",
  "firms": [
    {
      "attorney_name": "string or null",
      "firm_name": "string",
      "address": "string or null",
      "phone": "string or null",
      "website": "string or null",
      "email": "string or null",
      "practice_areas": ["string"]
    }
  ]
}
`;
}

/**
 * Builds the validation prompt instructing the LLM to inspect candidates against
 * ICP rules without being overly aggressive.
 */
export function buildValidationPrompt(zipCode: string, candidatesJson: string): string {
  return `You are a professional legal research auditor. Your job is to perform a strict second-stage validation of candidate law firms discovered during research for ZIP code "${zipCode}".

### Ideal Customer Profile (ICP) Guidelines
Validate each candidate against the following rules:

1. **Inclusion / Recall Rules (Do NOT over-filter)**:
   - Accept firms when they appear to be reasonable prospects.
   - The firm should be located in or clearly serving the searched ZIP code "${zipCode}".
   - The firm should be solo, small, boutique, or local-facing.
   - The firm should plausibly consist of 1 to 10 attorneys.
   - Keep plausible prospects. Even if confidence is medium or low, keep the firm when there is no clear disqualifying evidence.
   - Do NOT reject solely because small-firm status is unclear or uncertain. Keep it.

2. **Exclusion Rules (Reject obvious bad matches)**:
   - Reject if the candidate is clearly NOT a law firm.
   - Reject if the firm is clearly outside the targeted geography.
   - Reject if the firm is clearly a large national or regional firm with many attorneys.
   - Reject if the firm is clearly a branch/satellite office of a much larger national firm.
   - Reject if the firm is a duplicate of another candidate.

### Candidate Firms to Inspect
Here is the JSON list of candidates:
${candidatesJson}

### Instructions
Analyze each candidate. For each firm, determine:
1. Does it pass the ICP based on the guidelines above? Set "passes_icp" to true or false.
2. What is your confidence level ("high", "medium", "low")?
3. What is the reasoning for your decision? If rejected, specify the "rejection_reason".

### Output Format
Return ONLY a valid JSON object matching the following structure. Do not output any conversational text or notes.

JSON Schema:
{
  "zip_code": "${zipCode}",
  "validation_results": [
    {
      "firm_name": "string",
      "passes_icp": boolean,
      "confidence": "high" | "medium" | "low",
      "reasoning": "string explaining why it passes or fails",
      "rejection_reason": "string or null"
    }
  ]
}
`;
}

/**
 * Builds the prompt instructing the LLM to enrich missing contact fields
 * for selected candidate law firms using gathered context.
 */
export function buildEnrichmentPrompt(
  zipCode: string,
  firmsJson: string,
  contextJson: string
): string {
  return `You are a professional contact enrichment assistant. Your job is to find missing contact details (phone, email, website, address, and attorneys) for the following law firms located in or serving ZIP code "${zipCode}".

### Firms to Enrich
Here is the JSON list of candidate firms:
${firmsJson}

### Structured Web Search Grounding Context
Here is the structured search context containing search results (title, url, snippet) and the likely official website:
${contextJson}

### Instructions
For each firm in the candidate list, review the structured search context and extract:
1. "phone": The phone number of the firm.
2. "email": The general contact email or attorney-specific email of the firm.
3. "website": The official website URL of the firm.
4. "address": The physical office address in ZIP code "${zipCode}".
5. "attorneys": An array of attorney objects associated with the firm found in the context. Each attorney object should have:
   - "name": The full name of the attorney.
   - "email": The direct email address for this attorney (use null if not found).
6. "practice_areas": An array of the firm's practice areas / specialties (e.g. ["Family Law","Estate Planning"]); empty array if none stated on the page or in context.

### Data Source Prioritization Rules
- **Official Website is Strongest**: Prioritize information extracted from the "likely_official_website" and its subpages (e.g. contact page, attorney/team profile pages).
- **Directories as Backup Only**: Use reputable legal directories (like Justia, FindLaw, Avvo, Martindale, Yelp) only as a backup when the official website is missing or contains no contact details.
- **Never Overwrite with Weaker Data**: Do not let weak directory data or social media posts overwrite or replace stronger existing contact details or official website data.

### Crucial Constraints
- Do NOT invent, guess, or fabricate any data. If a phone, email, website, address, or attorney name is not explicitly found, return null.
- Do NOT invent attorneys. If no attorney is found, keep the firm but leave the attorneys array empty/null.
- Provide only real, verifiable details found in the scraped context.
- Do NOT return placeholder values like "N/A", "none", "unknown", "not available", "example@example.com", or fake phone numbers. Use null for unknown fields.

### Output Format
Return ONLY a valid JSON object matching the following structure. Do not output any conversational text or explanations.

JSON Schema:
{
  "enrichment_results": [
    {
      "firm_name": "string",
      "phone": "string or null",
      "email": "string or null",
      "website": "string or null",
      "address": "string or null",
      "attorneys": [
        {
          "name": "string",
          "email": "string or null"
        }
      ],
      "practice_areas": ["string"]
    }
  ]
}
`;
}
