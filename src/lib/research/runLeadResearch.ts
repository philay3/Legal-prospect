// src/lib/research/runLeadResearch.ts
// Real LLM research worker that queries live search context,
// calls OpenAI's models dynamically, and performs multi-pass discovery, validation, and contact enrichment.

import { OpenAI } from "openai";
import { buildResearchPrompt, buildEnrichmentPrompt } from "./buildResearchPrompt";
import { parseResearchResponse, parseEnrichmentResponse, ValidatedResearchResponse } from "./parseResearchResponse";
import { isUseful, extractEmails, normalizeWebsite, pickContactLink } from "./sanitize";
import { getSearchProvider } from "./searchProviders";
import { fetchPageContent } from "./searchProviders/tavily";

export type { SearchResult } from "./searchProviders/types";
import { cleanDdgUrl, isDirectoryOrSocial, getLikelyOfficialWebsite } from "./searchProviders/ddg";
export { cleanDdgUrl, isDirectoryOrSocial, getLikelyOfficialWebsite };

// Configurable model defaults
const DEFAULT_RESEARCH_MODEL = process.env.DEFAULT_RESEARCH_MODEL || "gpt-5.5";
const QUICK_RESEARCH_MODEL = process.env.QUICK_RESEARCH_MODEL || "gpt-5.4-mini";

/**
 * Wrap a promise with a timeout.
 */
async function withTimeout<T>(
  promise: Promise<T>,
  timeoutMs: number,
  errorMessage: string
): Promise<T> {
  let timeoutId: NodeJS.Timeout;
  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject(new Error(errorMessage));
    }, timeoutMs);
  });

  return Promise.race([promise, timeoutPromise]).finally(() => {
    clearTimeout(timeoutId);
  });
}

async function runWithConcurrencyLimit<T, R>(
  items: T[],
  limit: number,
  fn: (item: T) => Promise<R>
): Promise<R[]> {
  const results: Promise<R>[] = [];
  const executing: Promise<any>[] = [];

  for (const item of items) {
    const p = Promise.resolve().then(() => fn(item));
    results.push(p);

    const e: Promise<any> = p.then(() => {
      const idx = executing.indexOf(e);
      if (idx > -1) {
        executing.splice(idx, 1);
      }
    });
    executing.push(e);

    if (executing.length >= limit) {
      await Promise.race(executing);
    }
  }

  return Promise.all(results);
}

/**
 * Performs lead research for a given ZIP code:
 * 1. Obtains search context (single query for quick, multiple queries for thorough).
 * 2. Runs discovery pass via LLM (gpt-5.4-mini or gpt-5.5).
 * 3. Normalizes and deduplicates raw candidates.
 * 4. In thorough mode, runs validation pass via LLM (gpt-5.5) to filter results.
 * 5. Performs targeted backend contact enrichment pass for missing phone/email.
 * 6. Returns final validated and enriched results.
 */
export async function runLeadResearch(
  zipCode: string,
  mode: "quick" | "thorough" = "quick"
): Promise<ValidatedResearchResponse> {
  const startedAt = Date.now();
  console.log(`[research] Starting ${mode} research for ZIP ${zipCode}`);

  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error("Missing OPENAI_API_KEY environment variable. Please add it to your .env file.");
  }

  // 1. Gather web search context and track whether it succeeded
  const provider = getSearchProvider();
  const providerName = provider.constructor.name === "TavilySearchProvider" ? "Tavily Search" : "DuckDuckGo HTML";
  console.log(`[research] Discovery source: ${providerName}`);
  const searchContextResult = await provider.getSearchContext(zipCode, mode);

  let useLLMFallback = false;
  if (!searchContextResult.success || searchContextResult.resultCount === 0) {
    console.log(`[research] ${providerName} failed: ${searchContextResult.error || "No results returned"}`);
    console.log("[research] Discovery source: LLM-only fallback");
    console.log("[research] Web search unavailable; using temporary LLM-only fallback.");
    useLLMFallback = true;
  } else {
    console.log(`[research] Search source results collected: ${searchContextResult.resultCount}`);
  }

  // 2. Configure model names
  const discoveryModel = mode === "thorough" ? DEFAULT_RESEARCH_MODEL : QUICK_RESEARCH_MODEL;
  console.log(`[research] Discovery model: ${discoveryModel}`);

  // Helper to determine temperature based on model to avoid 400 errors with newer models
  const getTemperature = (model: string, defaultVal: number) => {
    if (model.includes("gpt-5") || model.includes("gpt-5.") || model.startsWith("o1") || model.startsWith("o3")) {
      return undefined; // Only default (1) supported
    }
    return defaultVal;
  };

  // 3. Construct prompt
  const basePrompt = buildResearchPrompt(zipCode, mode);
  let completePrompt = "";

  if (useLLMFallback) {
    completePrompt = `${basePrompt}

### WARNING: Web Search Context Unavailable
Currently, web search results are unavailable. You MUST rely on your internal knowledge to discover real, active boutique law firms in or serving ZIP code "${zipCode}".
This is a temporary fallback. Do NOT guess or fabricate phone numbers, email addresses, or physical addresses. If you do not have high confidence in their specific contact information, return null for those fields. Only provide the firm name and website if you are reasonably confident they exist and operate in/for "${zipCode}".
`;
  } else {
    completePrompt = `${basePrompt}

### Real-world Web Search Grounding Context
Use the following real-world search results context to identify active local boutique firms matching the criteria. Do not invent any names or contact info outside of what is supported by this context:

${searchContextResult.context}
`;
  }

  const openai = new OpenAI({ apiKey });
  let response;
  try {
    response = await openai.chat.completions.create({
      model: discoveryModel,
      messages: [
        {
          role: "user",
          content: completePrompt,
        },
      ],
      response_format: { type: "json_object" },
      temperature: getTemperature(discoveryModel, 0.2),
    });
  } catch (err: any) {
    if (err.message && (err.message.includes("model") || err.message.includes("404") || err.message.includes("400"))) {
      const fallbackModel = mode === "thorough" ? "gpt-4o" : "gpt-4o-mini";
      console.warn(`[research] Discovery model ${discoveryModel} failed or unsupported. Falling back to ${fallbackModel}. Error:`, err.message);
      response = await openai.chat.completions.create({
        model: fallbackModel,
        messages: [
          {
            role: "user",
            content: completePrompt,
          },
        ],
        response_format: { type: "json_object" },
        temperature: getTemperature(fallbackModel, 0.2),
      });
    } else {
      throw err;
    }
  }

  const rawJsonText = response.choices[0]?.message?.content || "";
  if (!rawJsonText) {
    throw new Error("OpenAI discovery pass returned an empty response.");
  }

  // 4. Parse discovery response
  let parsedDiscovery;
  try {
    parsedDiscovery = parseResearchResponse(rawJsonText);
  } catch (err: any) {
    console.error("[research] Discovery parser failed. Error:", err.message);
    throw new Error(`Discovery parser failed: ${err.message}`);
  }

  // 5. Deduplicate raw candidates by normalized firm name
  const dedupedFirmsMap = new Map<string, typeof parsedDiscovery.firms[0]>();
  for (const firm of parsedDiscovery.firms) {
    const key = firm.firm_name.replace(/\s+/g, " ").trim().toLowerCase();
    if (!dedupedFirmsMap.has(key)) {
      dedupedFirmsMap.set(key, firm);
    }
  }
  const dedupedCandidates = Array.from(dedupedFirmsMap.values());

  // 6. Contact enrichment pass for all discovered firms (capped at 20)
  const firmsToEnrich = dedupedCandidates.slice(0, 20);
  console.log(`[enrichment] Starting enrichment for top ${firmsToEnrich.length} firms`);

  let Y = 0; // Succeeded
  let Z = 0; // Failed

  const enrichedMap = new Map<string, any>();

  // Implement individual enrichment with 10s timeout, safety catch, and concurrency limit of 3
  const enrichFirm = async (firm: typeof parsedDiscovery.firms[0]) => {
    const key = firm.firm_name.replace(/\s+/g, " ").trim().toLowerCase();
    try {
      return await withTimeout(
        (async () => {
          console.log(`[enrichment] Enriching firm: ${firm.firm_name}`);
          // Gather search context for this firm
          const searchProvider = getSearchProvider();
          const searchResults = await searchProvider.getFirmSearchContext(firm.firm_name, zipCode);
          
          let urlToFetch = normalizeWebsite(firm.website);
          if (!urlToFetch) {
            urlToFetch = getLikelyOfficialWebsite(searchResults);
          }

          let combinedText = "";

          if (urlToFetch) {
            try {
              const candidateUrls = searchResults.map(r => r.url);
              const targetUrl = pickContactLink(urlToFetch, candidateUrls) || urlToFetch;
              
              console.log(`[enrichment] Best contact/about URL chosen for ${firm.firm_name}: ${targetUrl}`);
              const pageText = await fetchPageContent(targetUrl);
              combinedText = `[Page Content (${targetUrl})]:\n${pageText}`;
            } catch (e: any) {
              console.log(`[enrichment] Page extraction failed for ${firm.firm_name}: ${e.message || e}`);
            }
          }

          combinedText = combinedText.trim().slice(0, 6000);

          const contextObj: any = {
            likely_official_website: urlToFetch,
            results: searchResults,
          };
          if (combinedText) {
            contextObj.official_website_text = combinedText;
          }

          // Build enrichment prompt specifically for this firm
          const prompt = buildEnrichmentPrompt(
            zipCode,
            JSON.stringify([
              {
                firm_name: firm.firm_name,
                phone: firm.phone,
                email: firm.email,
                website: firm.website,
                address: firm.address,
              }
            ]),
            JSON.stringify(contextObj, null, 2)
          );

          const enrichmentModel = QUICK_RESEARCH_MODEL;
          
          let response;
          try {
            response = await openai.chat.completions.create({
              model: enrichmentModel,
              messages: [
                {
                  role: "user",
                  content: prompt,
                },
              ],
              response_format: { type: "json_object" },
              temperature: getTemperature(enrichmentModel, 0.2),
            });
          } catch (err: any) {
            if (err.message && (err.message.includes("model") || err.message.includes("404") || err.message.includes("400"))) {
              const fallbackModel = "gpt-4o-mini";
              response = await openai.chat.completions.create({
                model: fallbackModel,
                messages: [
                  {
                    role: "user",
                    content: prompt,
                  },
                ],
                response_format: { type: "json_object" },
                temperature: getTemperature(fallbackModel, 0.2),
              });
            } else {
              throw err;
            }
          }

          const rawJson = response.choices[0]?.message?.content || "";
          if (!rawJson) {
            throw new Error("Empty response from LLM");
          }

          const parsed = parseEnrichmentResponse(rawJson);
          const result = parsed.enrichment_results[0];
          if (!result) {
            throw new Error("No enrichment result in parsed JSON");
          }

          // Backstop email extraction
          if (combinedText) {
            const extracted = extractEmails(combinedText);
            const websiteToUse = result.website || firm.website || urlToFetch;
            let domain: string | null = null;
            if (websiteToUse) {
              try {
                const url = websiteToUse.includes("://") ? websiteToUse : `https://${websiteToUse}`;
                domain = new globalThis.URL(url).hostname.toLowerCase().replace(/^www\./, "");
              } catch (e) {}
            }

            let backstopEmail: string | null = null;
            if (extracted.length > 0) {
              if (domain) {
                backstopEmail = extracted.find(e => {
                  const parts = e.split("@");
                  return parts[1] && parts[1].toLowerCase() === domain!.toLowerCase();
                }) || null;
              }
              if (!backstopEmail) {
                backstopEmail = extracted[0];
              }
            }

            if (!isUseful(result.email) && backstopEmail) {
              result.email = backstopEmail;
            }
          }

          enrichedMap.set(key, result);
          Y++;
          console.log(`[enrichment] Firm enrichment completed: ${firm.firm_name}`);
        })(),
        40000,
        `Enrichment timed out after 40s`
      );
    } catch (err: any) {
      Z++;
      console.log(`[enrichment] Firm enrichment failed: ${firm.firm_name} - ${err.message || err}`);
    }
  };

  try {
    // Run concurrently with a limit of 4 to prevent rate limits
    await runWithConcurrencyLimit(firmsToEnrich, 4, enrichFirm);
  } catch (err: any) {
    console.error("[enrichment] Critical failure in enrichment orchestration:", err.message || err);
  }

  console.log(`[enrichment] Enrichment complete. Firms attempted: ${firmsToEnrich.length}, succeeded: ${Y}, failed: ${Z}`);

  // Merge enriched results back to the original candidates
  const finalFirms = dedupedCandidates.map((candidate) => {
    const key = candidate.firm_name.replace(/\s+/g, " ").trim().toLowerCase();
    const enriched = enrichedMap.get(key);

    if (!enriched) {
      // Return original candidate but preserve attorneys array mapping
      const attorneys = [];
      if (isUseful(candidate.attorney_name)) {
        attorneys.push({
          name: candidate.attorney_name!.trim(),
          email: isUseful(candidate.email) ? candidate.email!.trim() : null,
        });
      }
      return {
        ...candidate,
        attorneys,
      };
    }

    const phone = isUseful(enriched.phone) ? enriched.phone.trim() : candidate.phone;
    const email = isUseful(enriched.email) ? enriched.email.trim() : candidate.email;
    const website = isUseful(enriched.website) ? enriched.website.trim() : candidate.website;
    const address = isUseful(enriched.address) ? enriched.address.trim() : candidate.address;

    // Merge attorneys from candidate and enrichment
    const attorneys: { name: string; email: string | null }[] = [];
    if (isUseful(candidate.attorney_name)) {
      attorneys.push({
        name: candidate.attorney_name!.trim(),
        email: isUseful(candidate.email) ? candidate.email!.trim() : null,
      });
    }

    if (enriched.attorneys && Array.isArray(enriched.attorneys)) {
      for (const att of enriched.attorneys) {
        if (isUseful(att.name)) {
          const nameLower = att.name.trim().toLowerCase();
          const existingIdx = attorneys.findIndex(a => a.name.trim().toLowerCase() === nameLower);
          if (existingIdx === -1) {
            attorneys.push({
              name: att.name.trim(),
              email: isUseful(att.email) ? att.email.trim() : null,
            });
          } else {
            // Update email if currently missing/placeholder and new email is useful
            if (isUseful(att.email) && !isUseful(attorneys[existingIdx].email)) {
              attorneys[existingIdx].email = att.email.trim();
            }
          }
        }
      }
    }

    // Keep email as general contact or first attorney email fallback
    const finalEmail = isUseful(email) ? email.trim() : (attorneys.length > 0 && isUseful(attorneys[0].email) ? attorneys[0].email : null);

    return {
      firm_name: candidate.firm_name,
      address,
      phone,
      website,
      email: finalEmail,
      attorney_name: attorneys.length > 0 ? attorneys[0].name : candidate.attorney_name,
      attorneys,
    };
  });

  console.log(`[research] Firms discovered before save: ${finalFirms.length}`);

  const durationMs = Date.now() - startedAt;
  console.log(`[research] Finished ${mode} research for ZIP ${zipCode} in ${durationMs}ms`);

  return {
    zip_code: zipCode,
    firms: finalFirms,
  };
}



