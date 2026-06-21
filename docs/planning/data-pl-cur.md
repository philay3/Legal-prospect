# Legal Prospector — Data Pipeline (current app)

> How the app actually fetches and enriches firm data **today**. The *future* evidence/provenance layer (`ResearchRun`, `WebsiteCheck`, `DataPoint`, `Prediction`) lives in [data-app-design.md](data-app-design.md) — that's a map, not what's running. For the whole system see [architecture.md](architecture.md); for the schema see [database.md](database.md).

## The pipeline in one line
A ZIP comes in, the app checks its cache, and on a miss it **discovers** firms (Pass 1), **enriches** each one (Pass 2), and **persists** the result — after which every search for that ZIP is served from the corpus.

```
ZIP in
  → validate (5-digit base, else 400)
  → cache check on searchZip
      ├─ hit  → read firms from Firm, skip the pipeline
      └─ miss → Pass 1: Discover → Pass 2: Enrich (per firm) → Persist
  → read back → render (sorted, paginated)
```

The whole design rests on one principle: **the LLM never invents the list of firms.** Discovery is grounded in Google Places; the model's only job is reading a real page and pulling fields out of it. That's what separates this from "ask a chatbot for law firms."

## Pass 1 — Discovery
- **Trigger:** a cache miss on the `searchZip` (or a forced refresh via `?refresh=true`).
- **Source:** Google Places. *[verify: exact endpoint + params — text search vs. nearby, radius]*
- **What it does:** returns ~60 candidate firms for the area.
- **Output:** firm identity + basic contact — `firmName`, `phone`, `address`, `website`.
- **Cost:** one Places lookup per *uncached* ZIP; cache-first keeps the bill bounded.

This pass sits behind the `SEARCH_PROVIDER` flag. *[verify name/default in `.env`]* It replaced an earlier DuckDuckGo-scraping approach that returned 403s constantly and forced an LLM-only fallback that invented dead URLs — exactly the failure mode the current grounded design avoids.

## Pass 2 — Enrichment (per firm, capped ~20)
For each discovered firm, in order:

1. **`pickContactLink`** — from the firm's homepage links, choose the firm's *own* contact page and reject directory sites (lawyer.com, avvo, justia, findlaw, state-bar listings). *[verify: the exact directory-host list lives in code]*
2. **Fetch page text — Tavily Extract.** Pulls clean text from the chosen page. Falls back to a **direct fetch** if Tavily returns empty. Behind the `EXTRACT_PROVIDER` flag; **`tavily` is the default and the revert path.**
3. **LLM extraction — OpenAI.** Reads the page text and returns structured fields: phone, email, attorneys, practice areas. *[verify: exact model + the extraction prompt, in `src/lib/research/…`]*
4. **Regex backstop — `extractEmails`.** Catches firm-domain emails the model missed.

A **per-firm timeout** means one slow or blocked site can't stall the whole run. The **~20-firm cap** is a cost boundary, not a correctness one — it bounds how many of the ~60 get the full enrichment.

**Output fields:** `phone`, `email`, `attorneys[]`, `practiceAreas[]`, `attorneyCountRange`, plus the `sourceType` / `confidenceLevel` / `verificationStatus` enums.

The choice to fetch through Tavily Extract rather than a plain direct fetch was **settled by an A/B comparison**, not a hunch — worth saying out loud in the demo.

## Persistence
- **`sanitizeFirm`** strips NUL/control characters at the save boundary — scraped and LLM-generated text can carry bytes that crash Postgres.
- **Dedupe is application-level:** `findFirst` on `[searchZip, firmName]`, then **merge-but-never-downgrade** (existing confidence is never lowered). There's deliberately **no `@@unique` on `Firm`** — a DB constraint would throw on concurrent saves colliding on the same key; app-level logic merges gracefully instead.
- Each ZIP is **researched once** and served from the `Firm` corpus afterward (cache-first).

## Read-back and render
Firms for the `searchZip` are read from `Firm`, ordered by confidence (`HIGH → MEDIUM → LOW → UNKNOWN`) then alphabetically by `firmName`, and shown in a sortable, paginated table.

## Known limitation
**Email yield is low** — by the nature of the web, not the system. Firm homepages rarely expose an email address. **Phone** — the more useful number for outreach — comes back reliably from Places. The planned fix is a dedicated, deeper contact-page pass triggered when a user *saves* a lead, so the effort is spent only on firms that matter. That pass is the first real slice of the future layer in [data-app-design.md](data-app-design.md).

## Verify against code before presenting
- **Google Places call** — exact endpoint and params (Pass 1).
- **OpenAI model + extraction prompt** — the literal model name and prompt (Pass 2, step 3).
- **Directory-host reject list** — the exact hosts `pickContactLink` filters.
- **`SEARCH_PROVIDER` / `EXTRACT_PROVIDER`** — confirm the flag names and defaults in `.env` (`EXTRACT_PROVIDER=tavily` is the revert path).