# Legal Prospector: Data Pipeline (current app)

How the app actually fetches and enriches firm data today. The bigger evidence/provenance arc — what's shipped and what's still ahead — lives in [data-pl-fut.md](data-pl-fut.md). For the whole system see [architecture.md](architecture.md); for the schema see [database.md](database.md).

> File paths and behavior below are verified against source.

## The pipeline in one line

A ZIP comes in, the route checks the cache, and on a miss it runs `runLeadResearch` (discover, then enrich), saves with provenance, reads back, and logs the run. After that, every search for that ZIP is served from the corpus.

```
GET /api/prospects/search?zip=NNNNN
  → normalizeZipCode (5-digit or ZIP+4, else 400)
  → prisma.firm.findMany({ where: { searchZip } })
      ├─ rows found, no refresh → use them (cache hit)
      └─ empty OR ?refresh=true → runLeadResearch(zip, "thorough")
                                   → saveResearchFirms(zip, firms)   // + DataPoints, provenance cache
                                   → re-query firms
                                   → persistResearchAudit(...)        // best-effort ResearchRun + WebsiteCheck
  → filterByZip (drop Places radius spillover)
  → map to Prospect (incl. slug, confidenceTier)
  → sort (email-first, then confidence tier, then name)
  → log SEARCHED activity if signed in and results > 0
  → JSON
```

Route: `src/app/api/prospects/search/route.ts` (GET, `maxDuration = 300`, `force-dynamic`). ZIP validation is `normalizeZipCode` in `src/utils/prospectMatcher.ts`, which accepts a 5-digit base or ZIP+4.

What grounds the whole thing: with the current config (`SEARCH_PROVIDER="places"`), the firm list comes from Google Places, not from the model. In that path the LLM's only job is reading real pages during enrichment. Worth knowing for the demo: the codebase still carries `tavily` and `ddg` discovery providers, plus an LLM-only fallback, that *do* let the model generate firm candidates from its own knowledge when web search is unavailable (`runLeadResearch.ts`). Switching the default to Places is exactly what moved you off that invent-prone path, so the honest line on stage is "with Places, the model doesn't pick the firms," not "the model never invents firms."

## Multi-ZIP, before the route

A rep can enter several ZIPs (a list, or a range like `19103-19107`), and `parseZipInput` (`src/utils/parseZipInput.ts`) parses them in first-seen order and **caps at 5**. The home page (`src/app/page.tsx`) then fans out one `GET /api/prospects/search` call per ZIP **in parallel** (`Promise.all`), and merges the results client-side. So multi-ZIP is a fan-out over the single-ZIP API, not a feature of the route itself. The combined label shown above the results is just the searched ZIPs joined.

## Pass 1: Discovery

Trigger: a cache miss on `searchZip`, or `?refresh=true`. The route calls `runLeadResearch(normalizedZip, "thorough")` (`src/lib/research/runLeadResearch.ts`), so the live path always runs **thorough** mode.

The provider is chosen by `getSearchProvider()` (`src/lib/research/searchProviders/index.ts`) from `SEARCH_PROVIDER`.

Current path, `places`:
- ZIP is resolved to city/state with the `zipcodes` npm package, then `searchPlaces(city, state, zip)` runs (`src/lib/research/searchProviders/places.ts`).
- Endpoint: `POST https://places.googleapis.com/v1/places:searchText` (Places API "New", Text Search). The `X-Goog-FieldMask` requests `places.id, displayName, formattedAddress, addressComponents, location, nationalPhoneNumber, websiteUri, businessStatus, types`, and `nextPageToken`.
- Candidates are deduped by normalized firm name before enrichment.

Legacy paths, `tavily` / `ddg` (in `src/lib/research/searchProviders/tavily.ts` and `ddg.ts`): gather web-search context, then run an LLM discovery pass (`buildResearchPrompt` + OpenAI). If search returns nothing, an LLM-only fallback asks the model to produce firms from internal knowledge. This is the 403-prone, dead-URL path Places replaced.

## Pass 2: Enrichment

For each discovered firm, capped by `ENRICHMENT_CAP` (default **60**) and run **concurrently** at `ENRICHMENT_CONCURRENCY` (default 6) via an internal concurrency limiter (`runWithConcurrencyLimit`), each with a per-firm timeout so one slow site can't stall the run. All of this is in `src/lib/research/runLeadResearch.ts`. Per firm, in order:

1. `pickContactLink(baseUrl, hrefs)` (`src/lib/research/sanitize.ts`) — scores the firm's homepage links and returns the best page to read: contact (100) > contact-us (95) > about (70-80) > attorney (60) > team (50) > firm (40), preferring the firm's own domain and rejecting asset URLs. Directory hosts are dropped via the `DIRECTORY_DOMAINS` list in the same file (avvo, justia, findlaw, martindale, lawyers.com, superlawyers, nolo, usnews, expertise, yelp, mapquest, bbb.org, yellowpages, and ~10 more).
2. Fetch page text — `extractPageContent(url)` (`src/lib/research/extract.ts`), gated by `EXTRACT_PROVIDER`. The current config is **`jina`**: Jina Reader first (`fetchJina`), then direct fetch (`fetchDirect`), then Tavily Extract (`fetchPageContent`) as a last resort. Jina is requested with `X-With-Links-Summary: true`, which preserves `mailto:` links the cleaned text would otherwise drop, and recovered emails that plain extraction missed. The other two modes are `direct` (direct → Tavily) and `tavily` (Tavily → direct). Every attempt is classified (`classifyAttempt`) and recorded for the audit trail (provider, URL, HTTP status, outcome, error).
3. LLM extraction — OpenAI, in `runLeadResearch.ts`, using the prompt from `buildEnrichmentPrompt` (`src/lib/research/buildResearchPrompt.ts`) and parsed by `parseEnrichmentResponse` (`src/lib/research/parseResearchResponse.ts`). Returns `phone`, `email`, `attorneys`, `practiceAreas`.
4. Regex backstop — `extractEmails(text)` (`src/lib/research/sanitize.ts`) catches firm-domain emails the model missed, filtering junk and image URLs.

Models are env-driven (`src/lib/research/runLeadResearch.ts`): `DEFAULT_RESEARCH_MODEL` (default `"gpt-5.5"`) for thorough, `QUICK_RESEARCH_MODEL` for quick, with `gpt-4o` / `gpt-4o-mini` as fallbacks. Since the route runs thorough, discovery uses the `gpt-5.5` default plus a validation pass.

The choice to fetch through a resilient extractor rather than a plain direct fetch was settled by an A/B comparison, not a hunch, worth saying out loud in the demo. Jina now leads that chain, with direct and Tavily behind it.

## Persistence (with provenance)

`saveResearchFirms(zip, firms)` (`src/lib/db/saveResearchFirms.ts`) is the save entrypoint. Per firm:

- `sanitizeFirm` (`src/lib/research/sanitize.ts`) deep-strips NUL and other C0 control characters before the row hits Postgres (it's what avoids the `22021` error). Same file holds `sanitizeText` and the shared `toCanonicalPracticeArea` helper.
- Dedupe is application-level: `findFirst({ where: { searchZip, firmName } })`. On a match it **merges but never downgrades** — only fields whose incoming value is *useful* are written, so a real value is never overwritten by a placeholder; practice areas are unioned, not replaced. On a miss it creates the row and assigns a unique `slug` (`generateUniqueSlug`).
- **Evidence writes.** For each observed contact field, a `DataPoint` row is written via `classifyContact` (`src/lib/research/evidence.ts`), which assigns a `source` and `confidence`: email is `FIRM_DOMAIN` 0.9 / `OFF_DOMAIN` 0.5 / `UNVERIFIED` 0.5 / `GENERIC_PROVIDER` 0.4; phone is `PLACES` 0.85 / `WEBSITE` 0.55. The winning value's source and confidence are then cached on the `Firm` row (`emailSource/emailConfidence`, `phoneSource/phoneConfidence`) — from `classifyContact` on create, and from `pickCurrentBest` on update. `pickCurrentBest` is the **anti-clobber rule**: the highest-confidence value wins (ties broken by most recent), so a later 0.4 gmail can't displace a 0.9 firm-domain email.
- Attorneys and practice areas are **dual-written** to the `Attorney` and `FirmPracticeArea` tables alongside the transitional `String[]` columns. Attorney rows upsert on `@@unique([firmId, name])`; practice-area links use `skipDuplicates`.
- Each firm's write is isolated with `Promise.allSettled`, so one failed record doesn't abort the batch.
- There is deliberately no `@@unique` on `Firm` (`prisma/schema.prisma` confirms only `@@index([zip])`, `@@index([city, state])`, `@@index([searchZip])`). A DB constraint would throw on concurrent saves colliding on the same key; app logic merges gracefully instead.
- All DB access goes through the Prisma client (`src/lib/prisma.ts`), wrapping the generated client (`src/generated/prisma`).

## Audit logging

`extractPageContentWithAttempts` returns the per-attempt record; `runLeadResearch` collects one audit entry per firm (start/finish timestamps and the list of fetch attempts). After the read-back, the route calls `persistResearchAudit` (`src/lib/db/persistResearchAudit.ts`), which writes one `ResearchRun` per firm (trigger `DISCOVERY`, resolving `firmId` by exact trimmed name) and a child `WebsiteCheck` per attempt. This is **log-only** and **best-effort** — it's wrapped so an audit failure can never break a search. It's where bot-blocked (403) and dead sites get recorded, so the pipeline can eventually learn which firms to stop re-hitting.

## Read-back, filter, and render

After save, the route re-queries `prisma.firm.findMany({ where: { searchZip }, orderBy: { firmName: "asc" } })` (with `practiceAreaInclude` outside tests), then:

1. **Exact-ZIP filter** — `filterByZip(firms, normalizedZip)` (`src/utils/prospectMatcher.ts`) drops the radius spillover Places pulls in (firms whose detected state/ZIP doesn't match the searched ZIP). This is always on.
2. **Map** each row to the `Prospect` shape (`src/types/prospect.ts`), which now includes `slug` and `confidenceTier`. The tier comes from `firmConfidenceTier` (`src/lib/confidence.ts`) over the cached provenance columns: `FIRM_DOMAIN` email → `HIGH`; any email source present, or a `PLACES` phone with no email → `MEDIUM`; otherwise `LOW`.
3. **Sort** in the route: firms **with an email first**, then by confidence tier (`HIGH` > `MEDIUM` > `LOW`), then alphabetically by `firmName`. (The alpha order comes from the DB query; the email-and-tier order is applied in the route.)

If a user is signed in and results came back, a `SEARCHED` activity row is logged (best-effort) for the dashboard feed and recent-search chips. Dead-end searches (zero results) are deliberately not logged.

## The save-triggered email pass

Email yield is structurally low — firm homepages rarely expose an address — so the deeper effort is spent only on firms a user actually saves. `POST /api/leads/enrich` (`src/app/api/leads/enrich/route.ts`, `maxDuration = 60`, auth-required) handles it:

- It only enriches a firm the caller has saved (404 if the firm is gone, 403 if not saved).
- `enrichDecision(email, emailCheckedAt)` (`src/lib/research/enrichDecision.ts`) returns `use-email` if a useful email already exists, `skip` if the firm was checked within the **30-day cooldown**, or `fetch` otherwise.
- On `fetch`, `findContactEmail(website)` (`src/lib/research/enrichContactEmail.ts`) runs a dedicated contact-page pass, then `Firm.email` and `Firm.emailCheckedAt` are updated. The cooldown keeps it from re-hitting no-email sites.

This is the first real slice of the future layer in [data-pl-fut.md](data-pl-fut.md), now shipped (writing flat to `Firm.email`; routing it through `DataPoint`s with `SAVE`-trigger runs is the next refinement).

## Known limitation (quantified)

Email yield sits around **23%** of firms; **~94%** come back with a phone (the more useful number for outreach, sourced reliably from Places). The structural cause is the web: most firm homepages don't publish an email. The save-triggered pass above is the targeted fix; attorney-level bio-page scraping is the bigger one still ahead.

## Env knobs that shape the pipeline

`SEARCH_PROVIDER` (`places`, running), `EXTRACT_PROVIDER` (`jina`, running — Jina → direct → Tavily), `DEFAULT_RESEARCH_MODEL` (`gpt-5.5`), `QUICK_RESEARCH_MODEL`, `ENRICHMENT_CAP` (60), `ENRICHMENT_CONCURRENCY` (6), plus the keys `OPENAI_API_KEY`, `GOOGLE_PLACES_API_KEY`, `TAVILY_API_KEY`, and `JINA_API_KEY` (optional). The `.env.example` ships `tavily` defaults for both provider switches; the running deployment overrides them to `places` and `jina`.