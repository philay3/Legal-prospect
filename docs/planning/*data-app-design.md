# Legal Prospector — Data-App Layer: Design Map (future)

A reference for the bigger arc. This is a **map, not a build order to start now** — pick pieces of it up when a real feature needs them.

## The shift in one line
From **"store the answer"** (today's flat `Firm` snapshot) to **"store the evidence and derive the answer."**

Today `Firm.email = X` is a flat fact: no source, no confidence, no history, no way to tell observed from guessed. The data-app layer records *where* each fact came from, *when*, and *how confident* — so you can re-derive it, audit it, show confidence, detect change over time, and improve coverage without losing the trail.

## The four tables — and what each one earns you

- **`ResearchRun`** — the unit of work. "We researched firm X at time T, triggered by [discovery / a user saving it / a scheduled re-check]." Groups together the checks done and the data extracted in one pass.
  - *Earns:* an audit trail and a re-run handle — "when did we last look at this firm, and why?"

- **`WebsiteCheck`** — one fetch. "We requested URL U for firm X at time T → HTTP status, what we found, any error (this is where the 403 / bot-blocked sites get recorded)."
  - *Earns:* site health over time — which firms block bots, which sites are dead, so you stop re-hitting them.

- **`DataPoint`** — **per-field provenance.** Instead of one `Firm.email` column, each field-value is a row: "firm X's email is X, sourced from `WebsiteCheck #…` in `ResearchRun #…`, confidence 0.8, observed at T." Many rows over time = history.
  - *Earns:* source tracking, confidence scoring, change detection, and a clean "verified vs. guessed" line.

- **`Prediction`** — derived / inferred values, kept **strictly separate** from observed facts. "Predicted email `firstname@domain` (pattern, confidence 0.5)" or "Westlaw-prospect score 0.7."
  - *Earns:* a hard boundary between what you **observed** and what you **guessed** — so a pattern-guessed email is never shown as confirmed.

## How they connect (the flow)
```
ResearchRun  ──triggers──▶  WebsiteCheck(s)  ──extract──▶  DataPoint(s)  ──may produce──▶  Prediction(s)
```
The `Firm` table becomes a **"current best values" projection** — a fast read cache derived from the latest / highest-confidence DataPoints. The evidence lives underneath; `Firm` is just the convenient top.

## Phased path (all additive — new tables, you run the migrations)

- **Phase 0 — today.** Flat `Firm` snapshot. Works; no provenance.
- **Phase 1 — audit logging (cheap, no read-path change).** Add `ResearchRun` + `WebsiteCheck` and just *log* what the pipeline already does. You instantly gain "when did we last research firm X / is its site blocking us" with zero change to how anything reads. Lowest-risk first step.
- **Phase 2 — provenance for the fields that matter (start with email).** Write a `DataPoint` each time you enrich a field, with source + confidence. Keep `Firm.email` as the denormalized "current best" derived from DataPoints. Now you can show confidence, source, and history on the data that actually matters.
- **Phase 3 — predictions.** Email-pattern inference and prospect scoring, written as `Prediction`s (clearly labeled "guessed"), never overwriting observed DataPoints.
- **Phase 4 — continuous / scheduled re-checks.** `ResearchRun`s on a schedule (or on-demand when a lead is saved) keep data fresh and surface changes.

## The first real slice (this is also the email-yield fix)
The **save-triggered deep email pass** is Phase 1 + 2 in miniature, and worth building first because it pays off immediately:

> When a user **saves a lead** → fire a `ResearchRun` → a dedicated contact-page `WebsiteCheck` → write an email `DataPoint` with source + confidence.

Small, real, scoped to firms that matter (you don't deep-enrich all 60 search results — just the ones someone saved), and it lays the foundation for everything above.

## The cross-cutting piece to solve: the background engine
Continuous/triggered enrichment needs work to run **outside a normal request** — a deep fetch is too slow to block a save, and scheduled re-checks have no user waiting at all. On Vercel that means one of: a **background function / `waitUntil`** fire-and-forget after the response, a **Vercel Cron** job for the scheduled passes, or a small **queue**. This "engine" is the prerequisite for Phase 4 and for the save-triggered pass; worth deciding before the layer grows.

## Principles
- **Additive only** — new tables, the shared Neon DB, you run migrations (preview with `--create-only` first).
- **Observed (`DataPoint`) and guessed (`Prediction`) never mix.**
- **`Firm` stays the fast read layer**; the evidence lives underneath it.
- **Build it when a feature needs it** — don't stand up the whole layer speculatively. The save-triggered email pass is the natural entry point.