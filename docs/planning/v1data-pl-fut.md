# Legal Prospector — Data-App Layer: Design Map

The bigger arc for the data layer, and where it stands. The evidence trail itself is now partly built; this doc tracks what shipped, what it earns, and what's still ahead. For how the shipped pieces run today see [data-pl-cur.md](data-pl-cur.md); for the schema see [database.md](database.md).

> **Status:** Phase 1 (audit logging) and Phase 2 (per-field provenance for email and phone) are **shipped and verified live**. Phase 3 (predictions) and Phase 4 (scheduled re-checks) are still ahead, gated on the background engine.

## The shift in one line
From **"store the answer"** (a flat `Firm` snapshot) to **"store the evidence and derive the answer."**

`Firm.email = X` used to be a flat fact: no source, no confidence, no history, no way to tell observed from guessed. The data-app layer records *where* each fact came from, *when*, and *how confident* — so you can re-derive it, audit it, show confidence, detect change over time, and improve coverage without losing the trail.

## The four tables — what each earns, and its status

- **`ResearchRun`** — *shipped.* The unit of work: "we researched firm X at time T, triggered by [discovery / save / scheduled]." Groups the checks and data from one pass.
  - *Earns:* an audit trail and a re-run handle — "when did we last look at this firm, and why?"

- **`WebsiteCheck`** — *shipped.* One fetch: "we requested URL U for firm X → HTTP status, outcome, any error (where 403 / bot-blocked sites get recorded)."
  - *Earns:* site health over time — which firms block bots, which sites are dead, so you stop re-hitting them.

- **`DataPoint`** — *shipped.* Per-field provenance. Instead of one `Firm.email` column, each observation is a row: "firm X's email is `value`, source `FIRM_DOMAIN`, confidence 0.9, observed at T." Many rows over time is history.
  - *Earns:* source tracking, confidence scoring, change detection, and a clean "verified vs. guessed" line. `Firm`'s cached `emailSource/Confidence` and `phoneSource/Confidence` columns are the current-best projection over these rows.

- **`Prediction`** — *future.* Derived / inferred values, kept **strictly separate** from observed facts: "predicted email `firstname@domain` (pattern, 0.5)" or "Westlaw-prospect score 0.7."
  - *Earns:* a hard boundary between what you **observed** and what you **guessed** — so a pattern-guessed email is never shown as confirmed.

## How they connect (the flow)
```
ResearchRun  ──triggers──▶  WebsiteCheck(s)  ──extract──▶  DataPoint(s)  ──may produce──▶  Prediction(s)
```
The `Firm` table is the **"current best values" projection** — a fast read cache derived from the highest-confidence DataPoints. The evidence lives underneath; `Firm` is the convenient top.

## Phased path (all additive — new tables, you run the migrations)

- **Phase 0 — done.** Flat `Firm` snapshot. Worked; no provenance.
- **Phase 1 — audit logging. *Shipped.*** `ResearchRun` + `WebsiteCheck` log what the pipeline already does, with no change to how anything reads. Instantly gained "when did we last research firm X / is its site blocking us." The lowest-risk step, done first.
- **Phase 2 — provenance for the fields that matter (email and phone). *Shipped.*** A `DataPoint` is written each time a contact field is enriched, with source + confidence via `classifyContact`. `Firm.email` / `Firm.phone` are the confidence-ranked current-best via `pickCurrentBest`. This is the **clobbering fix** — a low-confidence wrong-site value can no longer overwrite a high-confidence one (verified live: a 0.9 firm-domain email survived a later 0.4 gmail). The one piece still open here: **source corroboration** (did the page match the firm by name, city, phone?) feeding confidence.
- **Phase 3 — predictions. *Future.*** Email-pattern inference and prospect scoring, written as `Prediction`s (clearly labeled "guessed"), never overwriting observed DataPoints.
- **Phase 4 — continuous / scheduled re-checks. *Future.*** `ResearchRun`s on a schedule (or on-demand) keep data fresh and surface change.

## The first real slice (the email-yield fix) — shipped
The **save-triggered email pass** was Phase 1 + 2 in miniature, and it's live:

> When a user **saves a lead** → a deeper contact-page fetch runs (`POST /api/leads/enrich`), gated by a 30-day cooldown (`Firm.emailCheckedAt` + `enrichDecision`).

It currently writes flat to `Firm.email`. The remaining refinement is to route it through the evidence layer proper — a `ResearchRun` with the `SAVE` trigger and an email `DataPoint` with source + confidence — so the save pass produces the same provenance as discovery.

## The cross-cutting piece still to solve: the background engine
Continuous and scheduled enrichment needs to run **outside a normal request** — a deep fetch is too slow to block a save, and scheduled re-checks have no user waiting. On Vercel that means one of: a **background function / `waitUntil`** fire-and-forget after the response, a **Vercel Cron** job for scheduled passes, or a small **queue** (or a separate always-on worker on the same Neon DB). This engine is the prerequisite for Phase 4, and `emailCheckedAt` is the hinge a scheduler would read. It's the main thing standing between the current on-request model and a continuously-fresh corpus.

## Where the arc points (once provenance + history compound)
Buying signals (a new firm in a ZIP, an attorney moving firms, headcount growth), website liveness as a data flag and outreach hook, lead and fit scoring, territory intelligence by ZIP or region, and external data fusion (business registrations, court filings, bar directories). The throughline for any monetization angle is that **`WebsiteCheck` plus history is the asset, not the directory.**

## Principles
- **Additive only** — new tables, the shared Neon DB, you run migrations (preview with `--create-only` first).
- **Observed (`DataPoint`) and guessed (`Prediction`) never mix.**
- **`Firm` stays the fast read layer**; the evidence lives underneath it.
- **Build it when a feature needs it** — don't stand up the whole layer speculatively. The save-triggered pass was the natural entry point, and it's done.