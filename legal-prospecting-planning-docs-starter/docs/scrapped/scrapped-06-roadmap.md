# 06 — Roadmap

## Roadmap Principle

Keep bootcamp MVP small. Save future ideas instead of building them too early.

---

# Phase 0 — Stabilized Core

Status: Mostly complete / current baseline.

Goals:

- Search works much better.
- ZIP search returns useful firm results.
- Cached ZIP loading works.
- Basic results table works.
- Data is stored under ZIPs.

Remaining focus:

- Regression testing.
- Manual verification.
- Documentation cleanup.
- Demo readiness.

---

# Phase 1 — Bootcamp MVP

Goal: Present a stable, understandable full-stack app.

Must include:

- Simple ZIP search.
- Law firm results.
- Cached ZIP sidebar/history.
- Basic firm table.
- Clear loading/error states.
- TypeScript passing.
- Testing/verification notes.
- Project documentation.

Should avoid:

- Overbuilt dashboard.
- Complex CRM features.
- Multiple research modes.
- Unnecessary schema changes.
- Risky refactors right before demo.

---

# Phase 1.1 — Search Reliability

Goal: Make search more reliable after MVP baseline is stable.

Possible work:

- Audit current search source.
- Replace/harden DuckDuckGo HTML scraping if still used.
- Add provider abstraction.
- Use environment variables for API keys.
- Improve search logs.
- Add regression tests.

Success criteria:

- Search works for multiple ZIPs.
- Provider failures are clear.
- No hardcoded secrets.
- No fragile hidden dependency on one scraping path.

---

# Phase 1.2 — Search Quality

Goal: Improve quality of returned firms without over-filtering.

Possible work:

- Re-enable validation safely.
- Reject obvious bad fits.
- Keep plausible borderline leads.
- Broaden practice-area coverage.
- Improve duplicate handling.
- Review results manually.

Success criteria:

- Fewer irrelevant results.
- No excessive loss of plausible prospects.
- Results are not dominated by large national firms.

---

# Phase 1.3 — Contact Enrichment

Goal: Improve firm records after base discovery succeeds.

Possible work:

- Fill missing website/phone/email/address when known.
- Add enrichment logs.
- Never invent contact data.
- Never block base results due to enrichment failure.
- Never overwrite strong existing data with null.

Success criteria:

- More useful prospect records.
- Base search remains stable.
- Existing data remains safe.

---

# Phase 2 — Dashboard Foundation

Goal: Turn results into a prospect workflow.

Possible work:

- Dedicated dashboard page.
- Saved firms.
- Firm detail view.
- Notes.
- Basic status.
- Copy email.
- Open website.

Success criteria:

- User can move from search to saved lead review.
- Main results table stays clean.
- Detail view holds deeper data.

---

# Phase 3 — Sales Workflow

Goal: Make the app useful for ongoing prospecting.

Possible work:

- Tasks/actions:
  - Call.
  - Email.
  - Meeting.
- Due dates.
- Statuses:
  - Planned.
  - Completed.
  - Snoozed.
- Firm activity timeline.
- Follow-up reminders.
- Export improvements.

Success criteria:

- User can manage outreach after finding firms.
- App starts to behave like a lightweight sales workspace.

---

# Phase 4 — Analytics and Exploration

Goal: Help users understand markets and prioritize prospects.

Possible work:

- Filters.
- Charts.
- ZIP comparisons.
- Practice area breakdowns.
- Export reports.
- Saved searches.
- Search quality scoring.

Success criteria:

- User can evaluate market opportunities across ZIPs.
- App produces insights, not just lists.

---

# Parking Lot

Ideas to revisit later:

- Authentication.
- Multi-user accounts.
- Team workspaces.
- Subscription tiers.
- CRM integrations.
- Email sending.
- Calendar integrations.
- Advanced AI firm scoring.
- Law firm technology stack detection.
- Court/docket data integrations.

# Future Direction
Phase 2 — Precomputed ZIP Research Engine

Goal:
Continuously research and enrich useful ZIP codes in the background so user searches feel instant.

Features:
- ZIP research job queue
- scheduled background refresh
- cached result freshness timestamp
- stale-data refresh
- research status tracking
- user-requested ZIP priority
- rate-limit and retry handling
- data quality scoring

## Phase 3 — Web Presence / Data Quality Signals

Goal:
Turn missing or broken firm data into lead intelligence.

Features:
- website status check
- broken link detection
- official website confidence
- missing phone/email flags
- attorney coverage score
- contact completeness score
- firm quality score

## Phase 4 — Canonical Firm Database Refactor

Goal:
Remove duplicate firms across ZIP searches and create one durable firm identity.

Features:
- CanonicalFirm model
- FirmLocation model
- ZipFirmResult join table
- attorney dedupe
- website/domain dedupe
- merge tools