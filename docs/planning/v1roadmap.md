# Legal Prospector — Roadmap

> Where the product is and where it's going. For what's built and how, see [architecture.md](architecture.md), [data-pl-cur.md](data-pl-cur.md), and [database.md](database.md). The fuller vision for the data layer is in [data-pl-fut.md](data-pl-fut.md). For the live, box-by-box feature status, see [feature-cl.md](feature-cl.md) — trust its boxes over this file.

## Where it stands today
The app is **feature-complete and deployed on Vercel**, backed by a **353-test** suite. End to end it does the core job: a ZIP search (one or several ZIPs at once, up to five) returns enriched firms via Google Places discovery and per-firm extraction, results are exact-ZIP filtered and sorted by email-presence then a confidence tier, and signed-in users save firms to a private Leads list, move each through an **Active / Won / Lost** pipeline, and track searches and status changes on a dashboard. The schema is the 13-table model in [database.md](database.md) — the research corpus (`Firm`, `Attorney`, `PracticeArea`, `FirmPracticeArea`) with its evidence trail (`ResearchRun`, `WebsiteCheck`, `DataPoint`), the auth/workspace layer (`User`, `Session`, `LoginCode`, `SavedLead`, `Activity`), and `Feedback`.

## How the build order actually went
The original plan sequenced live data fetching **last** — after auth, saved leads, and the workspace. In practice we built **engine-first**: the research + enrichment pipeline is the most mature part, because a working live demo on real data was the priority and a trusted external user validated the output early. That reversal was deliberate and deadline-driven, and it's recorded in `decisions.md`. The discipline kept: the order can change, but the change gets written down — never silent.

## Recently shipped (was near-term)
- **The save-triggered email pass** — saving a lead now fires a deeper contact-page fetch (`POST /api/leads/enrich`), gated by a 30-day cooldown, spending the extra effort only on firms that matter.
- **Targeting precision + multi-ZIP** — always-on exact-ZIP filtering drops Places radius spillover, and search takes up to five ZIPs at once.
- **Practice-area read migration** — reads moved onto the normalized `PracticeArea` / `FirmPracticeArea` tables (with a one-time backfill and a case-variant dedupe); the `String[]` arrays stay as a reversible fallback.
- **Evidence layer, Phases 1 and 2** — audit logging (`ResearchRun` + `WebsiteCheck`) and per-field provenance for email and phone (`DataPoint` + the confidence-ranked current-best), which closed the refresh-clobbering gap.
- **Screen restyle** — search results, saved leads, and the dashboard now carry the warm-paper ledger look.

## Near-term (next)
- **User-private lead overrides.** Let a user add or fix email, phone, site, attorneys, or notes on their *own* saved lead — a workspace-layer override (nullable columns on `SavedLead` or a small edit table) with read-time precedence over the global `Firm` value. Never global.
- **Firm-level confidence badge.** The confidence *sort* already runs (results order by a tier derived from contact provenance); the remaining piece is a single visible high/medium/low badge per firm, then using it to filter. (A per-field contact badge was built and pulled as too cluttered; the `Firm` provenance columns it read from are kept as the foundation.)
- **Stronger practice-area canonicalization.** The prerequisite for a clean practice-area filter: fold "and" vs "&", slash forms, and compound phrases (likely an alias map). Title-casing only collapses case, so a real filter waits on this.
- **Attorney-level phone/email enrichment** via per-bio-page scraping — the highest-value data expansion and the real answer to low email yield, since bio pages expose email more often than firm pages. (This is also the gate before dropping the transitional `Firm.attorneys` array, once attorney reads move to the normalized table.)
- **Finish the remaining screen styling.** Search/results, saved-leads, and dashboard carry the ledger look; the peripheral screens (account, about/contact, sign-in, the feedback widget) still need the same pass.

## The bigger arc — from "store the answer" to "store the evidence"
The evidence trail is partly built: `ResearchRun`, `WebsiteCheck`, and `DataPoint` are live (Phases 1 and 2), so `Firm` is already a "current best values" projection over per-field provenance. What's still ahead — and what it unlocks — is in [data-pl-fut.md](data-pl-fut.md):
- **`Prediction` (Phase 3):** guessed values (email-pattern inference, prospect scoring) kept strictly separate from observed ones, never shown as confirmed.
- **A background engine (Phase 4 prerequisite):** `waitUntil` / Vercel Cron / a queue, to run scheduled freshness re-checks and out-of-request enrichment. `emailCheckedAt` is the hinge a scheduler reads.
- **Buying signals:** a new firm appearing in a ZIP, an attorney moving firms, attorney count growing.
- **Website health:** explicit liveness checks — a broken or missing site is both a data flag and an outreach hook.
- **Fit + lead scoring, territory intelligence, external data fusion:** practice-area and size fit, propensity-to-buy, lookalikes off closed deals; firm density and practice-area mix by region; business-registration filings, court filings, bar directories.

## Longer-term concepts
- **Gate firm emails behind login** as a sign-up incentive — server-side stripping, not just hidden in the UI.
- **A vertical-agnostic pipeline.** Law firms are vertical one; discovery, enrichment, `WebsiteCheck`, and the evidence model retarget to any local-entity vertical by changing the discovery query, the entity schema, and the extraction prompt. The throughline for any monetization angle is that `WebsiteCheck` plus history is the asset, not the directory. (Captured, not committed — see [feature-cl.md](feature-cl.md) for the fuller notes.)
- **A sibling judicial-analytics product** — the same research discipline pointed at judges, for litigators preparing for court.

## Working principles (unchanged)
- One task per coding-agent session, clear acceptance criteria, nothing unrelated batched in.
- The human runs every command; the AIs never execute anything.
- Migrations are **additive and reversible** — local and prod share one Neon DB, so changes are previewed as SQL and only ever add.
- Build it when a feature needs it — don't stand up the whole future layer speculatively. The save-triggered email pass was the natural entry point, and it's done.
- Build-order changes get recorded in `decisions.md`: what changed, why, the risk, what to revisit.