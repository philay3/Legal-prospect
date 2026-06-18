# Completed Task: Swap discovery + enrichment fetch to Tavily (keep DDG as a fallback)

**Status: COMPLETED**

## Why
Discovery currently scrapes DuckDuckGo HTML and falls back to gpt-5.5's own knowledge whenever DDG 403s/aborts (which is most of the time across consecutive searches). That fallback gives plausible names + some phones but **no emails**, and the enrichment step's raw `fetch()` of firm websites is failing (`Official website fetch failed … fetch failed`), which is the real reason emails are rare.

We're switching the search/fetch layer to **Tavily**:
- **Tavily Search** replaces DDG for discovery grounding → kills the 403s, real results instead of gpt-5.5 guessing.
- **Tavily Extract** replaces the failing raw page fetch in enrichment → Tavily does the fetch on its infra (routes around our blocked/timed-out fetch), returns clean page text, and **that's what unlocks emails**.

DDG must remain available as a fallback, selectable without a code change.

## Outcome / acceptance criteria
1. With `SEARCH_PROVIDER=tavily` (default) and `TAVILY_API_KEY` set: a fresh ZIP runs discovery via Tavily Search and enrichment fetch via Tavily Extract. Logs show Tavily, not "DuckDuckGo HTML" → "LLM-only fallback".
2. Re-running a ZIP that previously returned all-null emails (e.g. `10545`, `10562`) now populates emails for at least the firms whose contact page exposes one.
3. With `SEARCH_PROVIDER=ddg`: behavior reverts to the current DDG discovery pipeline; **no** Tavily Search calls are made.
4. Research failure still degrades to a **200 with empty results** (never throws out of the route).
5. Vitest suite passes; **no live network in tests** (Tavily client is mocked).

## Design

### 1. Provider abstraction (discovery)
Create `src/lib/research/searchProviders/`:
- `types.ts` — a `SearchProvider` interface exposing the two functions the engine already relies on: `getSearchContext(query)` (ZIP-level discovery grounding) and `getFirmSearchContext(firm)` (per-firm). Return the **same shape** the current DDG code returns so the gpt-5.5 / gpt-5.4-mini prompts downstream are unchanged.
- `ddg.ts` — move the existing DuckDuckGo logic here unchanged, implementing the interface. (Includes its existing LLM-only fallback path — leave that as-is.)
- `tavily.ts` — new implementation (see below).
- `index.ts` — `getSearchProvider()` factory. Reads `selectProvider(process.env.SEARCH_PROVIDER)`; defaults to `'tavily'`; any unknown/empty value → `'tavily'`; explicit `'ddg'` → DDG. If `SEARCH_PROVIDER=tavily` but `TAVILY_API_KEY` is missing, log a clear warning and fall back to `'ddg'` so the app never hard-fails on a missing key.

Refactor `getSearchContext` / `getFirmSearchContext` in the engine to delegate to `getSearchProvider()` instead of calling DDG directly.

### 2. Tavily client (`tavily.ts`)
Use plain `fetch` to Tavily's REST API — **no SDK / no `npm install`** needed (keeps the dependency tree clean and avoids the iCloud `" 2"` dup-file hazard on install). **Confirm the exact request/response schema against current Tavily docs (https://docs.tavily.com) before implementing — the API has both a legacy `api_key`-in-body form and a newer `Authorization: Bearer tvly-...` header form.** Conceptually:
- **Search:** `POST https://api.tavily.com/search` with `query`, `search_depth: "basic"`, a small `max_results`. Map the returned results (title/url/snippet, optionally `raw_content`) into the same grounding text the DDG path produced.
- **Extract:** `POST https://api.tavily.com/extract` with `urls: [oneUrl]`, `extract_depth: "basic"`. Returns per-URL `raw_content`/`content`.

Keep two **pure mapping helpers** (these are the testable units):
- `mapTavilySearchToContext(rawResponse)` → grounding string/snippet list matching the DDG output shape.
- `mapTavilyExtractToText(rawResponse)` → plain page text for the gpt-5.4-mini extractor + the `extractEmails` regex backstop.

### 3. Enrichment fetch → Tavily Extract (the email unlock)
In the enrichment module, replace the raw homepage/contact-page `fetch()` with a `fetchPageContent(url)` helper that:
- Calls **Tavily Extract** when `TAVILY_API_KEY` is present.
- **Falls back to the existing direct `fetch`** if the Tavily Extract call fails or returns empty (so a single bad extract degrades gracefully instead of losing the firm).
- Keep the existing `pickContactLink` (from 7.5) to choose the URL, and **extract only the single best contact/about URL** per firm (fall back to homepage if no contact link found). One URL per firm keeps it at ~4 Tavily credits per 20-firm ZIP and keeps latency well under the 300s Vercel limit.
- Run `extractEmails` on the Tavily-extracted text exactly as it ran on the old fetched HTML, still preferring firm-domain emails.

> Design note (flag me if you disagree): extraction prefers Tavily whenever `TAVILY_API_KEY` is set, **independent of `SEARCH_PROVIDER`** — so emails keep working even if you revert discovery to DDG. To fully restore the original pipeline (DDG discovery + raw fetch), set `SEARCH_PROVIDER=ddg` and unset `TAVILY_API_KEY`.

### Credit-conservation defaults
`search_depth: "basic"` and `extract_depth: "basic"` everywhere (advanced doubles the cost and basic page text is enough to find an email). One extract URL per firm. The existing cache-first design already ensures a ZIP only spends credits once; do not add any `refresh` behavior.

## Tests (Vitest, network mocked)
- `selectProvider(env)` — default `tavily`; `'ddg'` → ddg; unknown/empty → tavily.
- `mapTavilySearchToContext` — sample Tavily search JSON → expected grounding shape; handles empty results.
- `mapTavilyExtractToText` — sample extract JSON → page text; handles failed/empty extraction.
- `extractEmails` over Tavily-extracted text — finds firm-domain email, ignores asset/no-reply noise (extend existing tests).
- `pickContactLink` — keep existing tests green.
- Mock the Tavily HTTP client; assert that with provider=`ddg` the Tavily search client is **not** called.

## Out of scope (do NOT do here)
- No schema/migration changes (attorney-level email storage is a later, additive task).
- No auth, no saved-leads work.
- Don't remove DDG. Don't touch the cache-first route logic beyond the provider delegation.

## Commands for Human to Run
_(Agent: do not run these. List only.)_
- Add to local `.env.local`: `TAVILY_API_KEY=tvly-...` and (optional, it's the default) `SEARCH_PROVIDER=tavily`
- Add the same two env vars in Vercel → Project → Settings → Environment Variables, then redeploy
- `npx vitest run`
- `npm run dev`, then verify: `curl "http://localhost:3000/api/prospects/search?zip=10545&refresh=true"` and confirm emails now populate + logs show Tavily
- Pre-warm 2–3 demo ZIPs once locally (shared Neon DB → live site serves them instantly)

## Guardrails
- Work only in the canonical project root. Watch for a nested duplicate project folder and iCloud `" 2"` conflict files (e.g. `index.d 2.ts`) — do not edit those.
- No destructive commands (no `migrate reset`, `db push --accept-data-loss`, `git reset --hard`, `git clean -fd`).
- Never commit the API key. `.env.local` only.
- Small, safe commits. Provider abstraction + tests first, then the extract swap, so each step is independently verifiable.