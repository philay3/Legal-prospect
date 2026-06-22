# Legal Prospector: Data Pipeline (current app)

How the app actually fetches and enriches firm data today. The future evidence/provenance layer (ResearchRun, WebsiteCheck, DataPoint, Prediction) lives in data-app-design.md, which is a map, not what's running. For the whole system see architecture.md; for the schema see database.md.

> File paths below are verified against source. The one exception is the persistence step, which lives in `src/lib/db/saveResearchFirms.ts` and wasn't in the dump I checked, so its internals are still marked `[verify]`.

## The pipeline in one line

A ZIP comes in, the route checks the cache, and on a miss it runs `runLeadResearch` (discover, then enrich), saves, and reads back. After that, every search for that ZIP is served from the corpus.

```
GET /api/prospects/search?zip=NNNNN
  → normalizeZipCode (5-digit or ZIP+4, else 400)
  → prisma.firm.findMany({ where: { searchZip } })
      ├─ rows found, no refresh → return them (cache hit)
      └─ empty OR ?refresh=true → runLeadResearch(zip, "thorough")
                                   → saveResearchFirms(zip, firms)
                                   → re-query firms
  → map to Prospect → sort (confidence, then name) → JSON
```

Route: `src/app/api/prospects/search/route.ts` (GET, `maxDuration = 300`, `force-dynamic`). ZIP validation is `normalizeZipCode` in `src/utils/prospectMatcher.ts`, which accepts a 5-digit base or ZIP+4.

What grounds the whole thing: with the current config (`SEARCH_PROVIDER="places"`), the firm list comes from Google Places, not from the model. In that path the LLM's only job is reading real pages during enrichment. Worth knowing for the demo: the codebase still carries `tavily` and `ddg` discovery providers, plus an LLM-only fallback, that *do* let the model generate firm candidates from its own knowledge when web search is unavailable (`runLeadResearch.ts`). Switching the default to Places is exactly what moved you off that invent-prone path, so the honest line on stage is "with Places, the model doesn't pick the firms," not "the model never invents firms."

## Pass 1: Discovery

Trigger: a cache miss on `searchZip`, or `?refresh=true`. The route calls `runLeadResearch(normalizedZip, "thorough")` (`src/lib/research/runLeadResearch.ts`), so the live path always runs **thorough** mode.

The provider is chosen by `getSearchProvider()` (`src/lib/research/searchProviders/index.ts`) from `SEARCH_PROVIDER` (default `"tavily"` if unset).

Current path, `places`:
- ZIP is resolved to city/state with the `zipcodes` npm package, then `searchPlaces(city, state, zip)` runs (`src/lib/research/searchProviders/places.ts`).
- Endpoint: `POST https://places.googleapis.com/v1/places:searchText` (Places API "New", Text Search). The `X-Goog-FieldMask` requests `places.id, displayName, formattedAddress, addressComponents, location, nationalPhoneNumber, websiteUri, businessStatus, types`, and `nextPageToken`.
- Candidates are deduped by normalized firm name before enrichment.

Legacy paths, `tavily` / `ddg` (in `src/lib/research/searchProviders/tavily.ts` and `ddg.ts`): gather web-search context, then run an LLM discovery pass (`buildResearchPrompt` + OpenAI). If search returns nothing, an LLM-only fallback asks the model to produce firms from internal knowledge. This is the 403-prone, dead-URL path Places replaced.

## Pass 2: Enrichment

For each discovered firm, capped by `ENRICHMENT_CAP` (default **60**, not 20) and run **concurrently** at `ENRICHMENT_CONCURRENCY` (default 6) via an internal concurrency limiter, each with a per-firm timeout so one slow site can't stall the run. All of this is in `src/lib/research/runLeadResearch.ts`. Per firm, in order:

1. `pickContactLink(baseUrl, hrefs)` (`src/lib/research/sanitize.ts`) — scores the firm's homepage links and returns the best page to read: contact (100) > contact-us (95) > about (70-80) > attorney (60) > team (50) > firm (40), preferring the firm's own domain and rejecting asset URLs. Directory hosts are dropped via the `DIRECTORY_DOMAINS` list in the same file (avvo, justia, findlaw, martindale, lawyers.com, superlawyers, nolo, usnews, expertise, yelp, mapquest, bbb.org, yellowpages, and ~10 more).
2. Fetch page text — `extractPageContent(url)` (`src/lib/research/extract.ts`), gated by `EXTRACT_PROVIDER`. Default `"tavily"`: Tavily Extract first (`fetchPageContent`), direct fetch as fallback (`fetchDirect`). `"direct"`: the reverse. Both fetch primitives live in `src/lib/research/searchProviders/tavily.ts`.
3. LLM extraction — OpenAI, in `runLeadResearch.ts`, using the prompt from `buildEnrichmentPrompt` (`src/lib/research/buildResearchPrompt.ts`) and parsed by `parseEnrichmentResponse` (`src/lib/research/parseResearchResponse.ts`). Returns `phone`, `email`, `attorneys`, `practiceAreas`.
4. Regex backstop — `extractEmails(text)` (`src/lib/research/sanitize.ts`) catches firm-domain emails the model missed, filtering junk and image URLs.

Models are env-driven (`src/lib/research/runLeadResearch.ts`): `DEFAULT_RESEARCH_MODEL` (default `"gpt-5.5"`) for thorough, `QUICK_RESEARCH_MODEL` (default `"gpt-5.4-mini"`) for quick, with `gpt-4o` / `gpt-4o-mini` as fallbacks. Since the route runs thorough, discovery uses the `gpt-5.5` default plus a validation pass.

The choice to fetch through Tavily Extract rather than a plain direct fetch was settled by an A/B comparison, not a hunch, worth saying out loud in the demo.

## Persistence

- `saveResearchFirms(zip, firms)` (`src/lib/db/saveResearchFirms.ts`) is the save entrypoint. [verify: this file wasn't in the dump. The dedupe-on-`[searchZip, firmName]`, merge-but-never-downgrade behavior, and exactly where `sanitizeFirm` is applied all live here. Confirm them in this file before presenting.]
- `sanitizeFirm` (`src/lib/research/sanitize.ts`) deep-strips NUL and other C0 control characters before the row hits Postgres (it's what avoids the `22021` error). Same file holds `sanitizeText`, and this is where `normalizeAttorneyName` will go for the live-TDD segment.
- There is deliberately no `@@unique` on `Firm` (`prisma/schema.prisma` confirms only `@@index([zip])`, `@@index([city, state])`, `@@index([searchZip])`), so dedupe is application-level. A DB constraint would throw on concurrent saves colliding on the same key; app logic merges gracefully instead.
- All DB access goes through the Prisma client (`src/lib/prisma.ts`), wrapping the generated client (`src/generated/prisma`).

## Read-back and render

After save, the route re-queries `prisma.firm.findMany({ where: { searchZip }, orderBy: { firmName: "asc" } })`, maps each row to the `Prospect` shape (`src/types/prospect.ts`), then sorts in JS by confidence rank (HIGH 3 > MEDIUM 2 > LOW 1 > everything else 0) and alphabetically by `firmName` within a rank. So the alpha order comes from the DB query and the confidence order is applied in the route, not the database.

## Known limitation

Email yield is low, by the nature of the web, not the system. Firm homepages rarely expose an email address. Phone, the more useful number for outreach, comes back reliably from Places. The planned fix is a dedicated, deeper contact-page pass triggered when a user saves a lead, so the effort is spent only on firms that matter. That pass is the first real slice of the future layer in data-app-design.md.

## Env knobs that shape the pipeline

`SEARCH_PROVIDER` (`places` set in `.env`; default `tavily`), `EXTRACT_PROVIDER` (`tavily` set; revert path), `DEFAULT_RESEARCH_MODEL` (`gpt-5.5`), `QUICK_RESEARCH_MODEL` (`gpt-5.4-mini`), `ENRICHMENT_CAP` (60), `ENRICHMENT_CONCURRENCY` (6), plus the keys `OPENAI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `TAVILY_API_KEY`.