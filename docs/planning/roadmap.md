# Legal Prospector — Roadmap

> Where the product is and where it's going. For what's built and how, see [architecture.md](architecture.md), [data-pipeline.md](data-pipeline.md), and [database.md](database.md). The fuller vision for the data layer is in [data-app-design.md](data-app-design.md).

## Where it stands today
The app is **feature-complete and deployed on Vercel**, backed by a **223-test** suite. End to end it does the core job: a ZIP search returns enriched firms (Google Places discovery → per-firm extraction), results are sortable, paginated, and CSV-exportable, and signed-in users can save firms to a private Leads list. The schema is the 9-table model in [database.md](database.md) — the research corpus (`Firm`, `Attorney`, `PracticeArea`, `FirmPracticeArea`), the auth/workspace layer (`User`, `Session`, `LoginCode`, `SavedLead`), and `Feedback`.

## How the build order actually went
The original plan sequenced live data fetching **last** — after auth, saved leads, and the workspace. In practice we built **engine-first**: the research + enrichment pipeline is the most mature part, because a working live demo on real data was the priority and a trusted external user validated the output early. That reversal was deliberate and deadline-driven, and it's recorded in `decisions.md`. The discipline kept: the order can change, but the change gets written down — never silent.

## Near-term (next, post-demo)
- **Email yield — the save-triggered deep pass.** Firm homepages rarely expose email, so today's yield is low. The fix is a dedicated contact-page fetch fired **when a user saves a lead** — spending the deeper enrichment only on firms that matter. This is also the first real slice of the data-app layer (see [data-app-design.md](data-app-design.md)).
- **Targeting precision + multi-ZIP** *(logged from client feedback)*. Google Places is radius-based, so a small ZIP pulls in neighbors. Add an opt-in "exact ZIP only" filter (read-side, leans on `searchZip`), then multi-ZIP search so a rep can cover several ZIPs at once.
- **Finish the screen styling.** The search/results and dashboard screens carry the full design system; saved-leads, account, about/contact, sign-in, and the feedback widget still need the same pass.
- **Practice-area read migration.** The transitional `practiceAreas` / `attorneys` `String[]` columns on `Firm` get dropped once reads move fully onto the `Attorney` / `PracticeArea` tables.

## The bigger arc — from "store the answer" to "store the evidence"
Today `Firm.email = X` is a flat fact with no source, confidence, or history. The data-app layer records *where* each fact came from, *when*, and *how confident* — `ResearchRun`, `WebsiteCheck`, `DataPoint` (per-field provenance), and `Prediction` (guessed values kept strictly separate from observed ones). `Firm` becomes a fast "current best values" projection over the evidence underneath. Full design in [data-app-design.md](data-app-design.md). What it unlocks:
- **Buying signals:** a new firm appearing in a ZIP (new-firm), an attorney moving firms (lateral), attorney count growing (hiring).
- **Website health:** explicit liveness checks — a broken or missing site is both a data flag and an outreach hook.
- **Fit + lead scoring:** practice-area and size fit, a propensity-to-buy score, lookalikes off closed deals, practice-area gap analysis.
- **Territory intelligence:** firm density, practice-area mix, and average size by ZIP or region.
- **External data fusion:** business-registration filings (new-firm signal, often before a website exists), court filings (active firms), bar directories (attorney emails).

## Longer-term concepts
- **Gate firm emails behind login** as a sign-up incentive — server-side stripping, not just hidden in the UI.
- **A sibling judicial-analytics product** — the same research discipline pointed at judges, for litigators preparing for court.

## Working principles (unchanged)
- One task per coding-agent session, clear acceptance criteria, nothing unrelated batched in.
- The human runs every command; the AIs never execute anything.
- Migrations are **additive and reversible** — local and prod share one Neon DB, so changes are previewed as SQL and only ever add.
- Build it when a feature needs it — don't stand up the whole future layer speculatively. The save-triggered email pass is the natural entry point.
- Build-order changes get recorded in `decisions.md`: what changed, why, the risk, what to revisit.