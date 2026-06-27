# Legal Prospector — Feature Checklist

Last updated: June 25, 2026

Living checklist. Trust the boxes here over roadmap.md, and re-confirm against the
actual code before starting anything. When something ships, check it and move it
up to Shipped with a one-line note.

Status: `[x]` done · `[~]` in progress · `[ ]` not started · `FUTURE` · `CONCEPT`

---

## Shipped

- [x] Lead status pipeline (ACTIVE / WON / LOST) with status pills and won / lost / reopen controls
- [x] Per-user activity log (SEARCHED / SAVED / WON / LOST) with write hooks in search, save, and status change
- [x] Dashboard base, Direction 1 (dark and mint), wired to real data: pipeline tiles, saved-leads snapshot, activity feed, recent-search chips
- [x] Custom email-code auth (User / Session / LoginCode), self-serve signup, isActive ban switch, public search, gated dashboard
- [x] searchZip column: separate search/dedupe key from the firm's real postal code, fixes the silent dedup bug
- [x] Save-triggered email enrichment (POST /api/leads/enrich). Writes flat to Firm.email for now, not yet the provenance version
- [x] Enrichment cooldown (Firm.emailCheckedAt + enrichDecision), 30-day skip for no-email firms
- [x] Multi-ZIP search (parseZipInput, capped at 5, parallel fetch, merge, dedupe)
- [x] Exact-ZIP filtering, always on, drops Google Places radius spillover
- [x] Jina-first extraction (Jina then direct then Tavily) with the links-summary header that recovered mailto emails
- [x] Funded Tavily key back in, as website-finder plus last-resort extract only
- [x] Force-refresh toggle on the search page
- [x] Recent searches on the search page: GET /api/searches/recent plus clickable ZIP chips, chip clicks read cache even when refresh is on
- [x] Evidence model Phase 1, research audit logging (ResearchRun + WebsiteCheck, log only, no read change). Verified live: runs and checks land, failures recorded with status
- [x] Practice-area reads moved onto the normalized PracticeArea / FirmPracticeArea tables, with a shared include + projection helper and an idempotent backfill that closed the 142-firm gap (count now 2622 = 2622). Reversible: the String[] arrays and their writes are untouched. Attorneys still read the array

- [x] Practice-area case-variant dedupe. One-time merge re-pointed links to the canonical keeper and collapsed the case dupes (146 non-canonical rows to 0, 21,607 to 17,426 links, 4,181 duplicate joins removed). toCanonicalPracticeArea moved into the pure sanitize module as the single source of truth, getPracticeAreaNames dedups case-insensitively at read time, 146 orphaned rows kept for reversibility
- [x] Evidence model Phase 2, per-field provenance for email and phone. A DataPoint per observation (source, confidence, observedAt) written in both saveResearchFirms branches via a pure classifyContact tiering; Firm.email and Firm.phone are now the confidence-ranked current-best via pickCurrentBest. This is the clobbering fix: a low-confidence wrong-site value can no longer overwrite a high-confidence one, verified live (a 0.9 firm-domain email survived a later 0.4 gmail). Idempotent backfill seeded existing firms. Email yield quantified at about 23 percent of firms versus about 94 percent with a phone. Source corroboration (did the page match the firm by name, city, phone) feeding confidence is still deferred, see Phase 2 note below
- [x] Firm contact-provenance columns (emailSource, emailConfidence, phoneSource, phoneConfidence). The winning value's source and confidence cached on the Firm row at write time, from classifyContact on create and pickCurrentBest on update, with an idempotent backfill. Firm stays the fast read layer; these are the foundation for the firm-level confidence badge, a confidence sort, and confidence filtering

---

## Dashboard cleanup

- [x] Stop logging dead-end searches: SEARCHED only logs when results are greater than zero. Also cleans the recent-search chips
- [x] Collapse bulk saves into one "Saved N leads" activity entry
- [x] Status filter on saved leads: segmented All / Active / Won / Lost control, selection held in the URL so it deep-links and survives refresh, dashboard pipeline tiles link into it

This track is complete.

---

## Near-term backlog

- [ ] User-private lead overrides (the edit feature). Let a user add or fix email, phone, site, attorneys, notes on their own saved lead. Workspace layer only, nullable columns on SavedLead or a small LeadEdit table, read-time precedence over the Firm value. Never global
- [ ] Firm-level confidence badge plus sort by overall confidence, one bundled task. A single overall-confidence signal per firm derived from the provenance columns (v1: the best channel folded into a high / medium / low tier), shown as one badge on the firm and used to sort, then to filter, the results. The per-field contact badge was built and then pulled from the UI as too clunky and too builder-facing; the Firm confidence columns it read from are kept as the foundation for this
- [ ] Attorney-level phone/email enrichment via per-bio-page scraping. Highest-value data expansion, and the real answer to low email yield since bio pages expose email more often than firm pages
- [ ] Email gating behind login, stripped server-side. UI hiding is not gating. Intended as the sign-up incentive
- [ ] Attorney reads onto the normalized Attorney table (practice-area reads already moved, see Shipped), and only after the canonicalization cleanup consider dropping the transitional Firm String[] columns. The String[] stays for now as the backfill source and fallback
- [ ] Stronger practice-area canonicalization, the prerequisite for a clean filter: fold "and" versus "&", slash forms, and compound phrases, probably with an alias map. Title-casing only collapses case, so a real filter has to wait on this
- [ ] Count-wording tweak (small): header counts only in-ZIP firms with no hint nearby ones were filtered. Reword to surface the filtered count, e.g. "40 in 01742, 16 more in nearby ZIPs"

---

## The bigger arc: store the evidence, not just the answer

Build pieces only when a real feature pulls them, not speculatively.

Four tables: ResearchRun (a research pass on a firm at time T, with a trigger),
WebsiteCheck (one fetch with URL, status, result, error), DataPoint (per-field
provenance with source, confidence, timestamp), Prediction (guessed values kept
strictly separate from observed). Firm becomes a fast projection over the latest,
highest-confidence DataPoints.

- [x] Phase 1, audit logging (ResearchRun + WebsiteCheck). Done and verified live
- [x] Phase 2, provenance for the fields that matter, email and phone. DataPoint per observation, confidence-ranked current-best, and the clobbering fix, all shipped and verified live. The one piece still open is source corroboration (page matched the firm by name, city, phone) feeding confidence
- FUTURE: Phase 3, predictions (email-pattern inference, prospect scoring), clearly labeled, never overwriting observed values
- FUTURE: Phase 4, scheduled or triggered re-checks to keep data fresh and surface change
- [ ] Prerequisite for Phase 4 and for deep save-triggered fetches: background engine (waitUntil after the response, Vercel Cron, a small queue, or a separate always-on worker on the same Neon DB). emailCheckedAt is the hinge a scheduler reads

What the arc unlocks, once provenance and history exist: buying signals (a new
firm in a ZIP, an attorney moving firms, headcount growth), website liveness as a
data flag and outreach hook, lead and fit scoring, territory intelligence by ZIP
or region, and external data fusion (business registrations, court filings, bar
directories).

---

## Monetization directions (exploratory, not committed, somewhere down the line)

Captured from discussion, not queued as features yet. The throughline is that
WebsiteCheck plus history is the asset, not the directory.

- Niched WebsiteCheck lead magnets: "every [business type] in [area] with a broken, missing, or stale site," a turnkey prospect list for web and marketing agencies and other vendors selling to SMBs. The signal is the product
- Change feed: the same WebsiteChecks run on a schedule, surfacing deltas (a new business appeared, a site went down, a major refresh) as buying triggers. The snapshot list and the change feed are one engine at two time resolutions, and the unlock for both is the background engine (Phase 4 prerequisite above)
- Sell the outcome, not raw data: either lead lists or a change feed sold to vendors in a chosen vertical, or the tool itself as self-serve SaaS (type a territory and a business type, get researched leads with signals)
- Vertical-agnostic pipeline: law firms are vertical one. Discovery, enrichment, WebsiteCheck, and the evidence model retarget to any local-entity vertical by changing the discovery query, the entity schema fields, and the extraction prompt. Pick one vertical and one buyer with a recurring need rather than going generic
- Validate before building: a niched broken-site list can be produced by hand for one vertical and metro today, to test whether the outcome sells, before committing to the scheduler
- Reality check: a raw-data or enrichment-API sale competes with ZoomInfo, Apollo, and local-data brokers, where the edge has to be a vertical they ignore or a signal they lack (the web-presence angle). The tool sale and the niche lead-list sale are easier first money

---

## UI and display ideas (exploratory, not committed)

Captured from discussion. Most of this is Claude Design's lane; the agent-track
parts are the data prerequisites noted.

- Saved-lead and results display as cards instead of the current rows table. The firm fields, attorneys, and practice areas already reach the client, so the card itself is a layout change. No data work unless we add images
- Firm and attorney images on the card. We do not capture images today. Firm or building photos are tractable from Google Places, since discovery already hits Places and photo references come back. Attorney headshots need bio-page scraping and ride with the parked attorney-level enrichment
- Practice area as a search filter rather than only a per-card field. Reads now come from the normalized tables, but the names still need the stronger canonicalization in the backlog before the facets are clean enough to filter on

---

## Concepts

- CONCEPT: cloud scraping infrastructure (proxy rotation, job queues, a managed worker). The scaled version of the background engine, for the continuous data-platform vision
- CONCEPT: judicial-analytics sibling product, the same research discipline pointed at judges for litigators preparing for court

---

## Standing guardrails

- No global edits. User edits are user-private workspace-layer overrides only.
- Firm stays the fast read layer. The evidence lives underneath it.
- Migrations are additive and reversible only. Local and prod share one Neon DB. Preview SQL with --create-only first; the operator applies, never the agent, never autonomously. After a migration, regenerate the Prisma client and restart the dev server, or the running server keeps the stale client (the Phase 1 audit-write failure was exactly this, and the provenance-columns search hit it again, generate without a restart).
- The clobbering fix is Phase 2 (confidence-ranked projection plus source corroboration), not a one-off patch.
- Build the future layer when a feature needs it, not speculatively.
- One source of truth for shared helpers. Do not re-implement a function locally inside a script to dodge an import; that is how the practice-area vocabulary drifted. If a pure helper is trapped in a server-only module, move the helper to a pure module and import it everywhere.
- No test-only code in production. Do not add a shim or fallback to production to satisfy an incomplete mock; an incomplete mock or a harness-level failure is a test fix, not a production change. The agent stays off test files, the architect or operator owns them. Seen this session: a fallback prisma.dataPoint shim was added to saveResearchFirms to dodge a missing mock; the right fix was the mock.
- Never run tsc on a single file in this repo. It ignores tsconfig, targets old JS, and emits .js files next to the .ts sources that then break Vitest. Run scripts with tsx.
- An additive backfill closes coverage gaps but does not fix pre-existing bad rows. Data-quality fixes need an explicit merge or cleanup pass, the same way the real fix for wrong field values is Phase 2 provenance, not more additive logging.

---

## Tracked elsewhere

- Screen styling, owned by Chops via Claude Design. Search and saved-search screens confirmed done. Not enumerated here to avoid a second list that goes stale.