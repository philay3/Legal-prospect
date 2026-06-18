# Roadmap (revised 2026-06-18)

## Purpose
Defines the rebuild sequence for the legal prospecting app, kept current so the docs match what's actually built. The point is still controlled, understandable progress — one task per coding-agent session, human runs commands, additive non-destructive changes.

## Important: the build order was intentionally changed
The original roadmap sequenced external data fetching **last** (after auth, saved leads, recent ZIPs) and said "do not start with scraping/enrichment." In practice we reversed that and built **engine-first**: live research + enrichment is the most mature part, it's deployed, and a trusted external user has validated the output. This was a deliberate, deadline-driven choice (bootcamp Phase 2, Friday deadline, needed a working live demo with real data). Recorded in `decisions.md` (2026-06-18). This revision updates the roadmap to match reality and re-sequences the remaining work.

## Roadmap principle (unchanged)
Build in controlled layers. Restart the repo, keep the product thinking, keep the lessons, rebuild with tighter rules. One task per session; the human runs commands; changes are additive and reversible.

## Current status
Deployed on Vercel (legal-prospect.vercel.app). Live ZIP research works end-to-end and a trusted external user has tried it and confirmed the output is good. No auth yet, so the URL is kept private.

## Completed
- App shell + ZIP search UI: sortable results table (Name, Email, Phone, Website, Address), client-side pagination, CSV export.
- Live research engine: discovery via **Tavily Search** (DuckDuckGo retained as a fallback behind the `SEARCH_PROVIDER` flag), enrichment via **Tavily Extract** (`pickContactLink` → cleaned page content → gpt-5.4-mini extraction → regex email backstop). Cache-first; `?refresh=true` forces a re-run.
- DB save (flat `Firm`), dedupe by `[zip, firmName]`, `sanitizeFirm` (fixes the Postgres 22021 NUL crash) + per-firm write isolation.
- Deployed on Vercel; env (`OPENAI_API_KEY`, `TAVILY_API_KEY`) set in both local `.env` and Vercel.

## Current phase — Data quality + schema normalization
Priority now is making sure the data we collect is good and structured correctly.
1. **Attorney table** (in progress) — one-to-many off `Firm`; dual-write; additive migration.
2. **Fix practice-area extraction** — `practiceAreas` comes back empty; the enrichment prompt isn't capturing it.
3. **PracticeArea + FirmPracticeArea** — many-to-many via a join table, once extraction works.
4. **Data-quality fixes** — `pickContactLink` sometimes grabs third-party directories; city filled from ZIP mislabels out-of-area firms; attorney name-variant dedup.

## Next
5. **Custom email-code auth** — `User` / `Session` / `LoginCode` (Resend, email allowlist, HttpOnly cookie; no Clerk).
6. **Saved leads** — `SavedLead` (+ `LeadActivity`), private per user.
7. **Recent ZIPs** — user-scoped search history.

## Future — the data-app vision
Once the data is clean and the workspace exists, value compounds by tracking data over time and turning facts into buying signals:
- **Trigger events:** new firm appears in a ZIP (new-firm signal), attorney moves firms (lateral), attorney count grows (hiring).
- **Website health / fixer:** explicit liveness checks (`WebsiteCheck`); broken/no-site firms as both a data flag and an outreach hook.
- **Fit + lead scoring:** practice-area and size fit; a propensity-to-buy score (`Prediction`); lookalikes off closed deals.
- **Territory intelligence:** firm density, practice-area mix, and average size by ZIP/region.
- **External data fusion:** state business-registration filings (new-firm signal, often before a website exists), court filings (active firms), bar directories (attorney emails).
- **Operational:** `Zip` research ledger (cache empty results, drive a background refresh queue); `ResearchRun` history; per-field provenance (`DataPoint`).

## Table map
- **Current:** `Firm`
- **Normalizing now:** `Attorney`, `PracticeArea`, `FirmPracticeArea`
- **Workspace (next):** `User`, `Session`, `LoginCode`, `SavedLead`, `LeadActivity`
- **Data-app (future):** `Zip`, `ResearchRun`, `WebsiteCheck`, `Prediction`, `DataPoint`
- Full ERD + fields: `docs/schema.md`. Detailed schema rationale: `docs/05-database-plan.md` (to be updated next).

## Roadmap change rule (unchanged)
Record build-order changes in `decisions.md`: what changed, why, what risk it introduces, what to revisit. Do not silently change the order.

## How to pick the next task (unchanged)
Ask: Is it the next roadmap step? Is it in `task/current-task.md`? Does it have clear acceptance criteria? Small enough for one session? Free of unrelated features? Free of destructive commands? Verifiable by the human? If any answer is no, split or delay it.

## Revised anti-roadmap
Still avoid: batching unrelated features into one session; destructive DB/git commands; building saved leads before auth/user ownership; recent ZIPs before user scoping is stable; adding a new external provider without documenting the pass in `docs/03-data-fetching-plan.md`.

(Superseded: the original "do not start with scraping/enrichment/external APIs" no longer applies — that work is built, deployed, and validated. It will be documented as a live pass in `docs/03-data-fetching-plan.md` in the next docs pass.)