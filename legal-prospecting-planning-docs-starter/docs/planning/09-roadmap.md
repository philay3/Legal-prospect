# Roadmap

## Purpose

This document defines the safe rebuild sequence for the legal prospecting app.

The roadmap exists to keep the project from jumping too quickly into auth, Prisma, enrichment, saved leads, recent ZIPs, or dashboard complexity.

This roadmap should be updated as the project changes, but it should not be ignored.

---

## Roadmap Principle

Build in controlled layers.

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```

The goal is not to rebuild everything at once.

The goal is to rebuild the product with enough control that the human user understands each step.

---

## Current Phase

Current phase:

```text
Phase 0: Control and Planning
```

This phase is about creating the operating system for the project before product features begin.

---

## Recommended Rebuild Order

Recommended order:

```text
Step 1: new repo
Step 2: docs + AGENTS.md + task/work.md
Step 3: basic app shell
Step 4: clean Prisma from day one
Step 5: seed data
Step 6: custom auth
Step 7: saved leads
Step 8: recent ZIPs
Step 9: external data fetching
```

Important:

```text
Do not start with auth.
Do not start with scraping.
Do not start with enrichment.
Do not start with dashboard complexity.
```

---

## Phase 0: Control and Planning

### Goal

Make the project safe and understandable before feature work begins.

### Status

Current phase.

### Included

- `AGENTS.md`
- `task/current-task.md`
- `task/work.md`
- `task/decisions.md`
- `docs/START-HERE.md`
- `docs/00-product-brief.md`
- `docs/01-product-scope.md`
- `docs/02-user-stories.md`
- `docs/03-data-fetching-plan.md`
- `docs/04-auth-account-plan.md`
- `docs/05-database-plan.md`
- `docs/06-api-contracts.md`
- `docs/07-testing-guide.md`
- `docs/08-coding-agent-rules.md`
- `docs/09-roadmap.md`
- `README.md`

### Out of Scope

- app features
- auth
- Prisma
- database schema
- migrations
- seed scripts
- external data fetching
- scraping
- enrichment
- saved leads
- recent ZIPs
- dashboard buildout

### Exit Criteria

Phase 0 is complete when:

1. All required docs exist.
2. `AGENTS.md` defines coding-agent behavior.
3. `task/current-task.md` defines one allowed task.
4. `task/work.md` is ready for logging.
5. `task/decisions.md` records major decisions.
6. Product scope is clear enough to begin app shell work.
7. The human user understands the next task.

### Next Phase

```text
Phase 1: Basic App Shell
```

---

## Phase 1: Basic App Shell

### Goal

Create a simple app structure that can support the core product flow.

First useful product flow:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

### Included

- basic home page
- simple layout
- product purpose copy
- ZIP search placeholder or input
- clear empty/placeholder state
- no unnecessary navigation
- no dashboard complexity

### Out of Scope

- auth
- Prisma
- database setup
- saved leads
- recent ZIPs
- external fetching
- enrichment
- scraping
- billing
- teams
- organizations

### Suggested First Coding-Agent Task

```text
Create a basic app shell with a home/search page placeholder.
```

### Human Verification

The human should verify:

1. The app opens.
2. The home/search page is visible.
3. The purpose is clear.
4. No sign-in is required.
5. No product feature outside the task was added.

### Suggested Checks

The coding agent may suggest:

```bash
npm run dev
```

Only the human runs it.

### Exit Criteria

Phase 1 is complete when:

1. The app shell exists.
2. The home/search page is visible.
3. The human can manually verify the page.
4. No auth, database, or external fetching has been added.

---

## Phase 2: Seed Data Foundation

### Goal

Create controlled sample prospect data before live data fetching.

### Included

- small manual seed dataset
- one or a few test ZIP codes
- sample law firm prospect records
- useful fields for search/results/detail
- clear indication that data is seed/test data

### Possible Seed Fields

- firm name
- website
- phone
- email
- street address
- city
- state
- ZIP code
- practice areas
- attorney names
- source label
- source URL
- confidence level
- notes

### Out of Scope

- scraping
- enrichment
- external APIs
- browser automation
- AI research passes
- automatic overwrites
- saved leads
- user notes
- recent ZIPs

### Suggested Coding-Agent Task

```text
Add manual seed prospect data for one test ZIP code.
```

### Human Verification

The human should verify:

1. The seed data exists.
2. The seed data is easy to inspect.
3. At least one test ZIP exists.
4. No external data-fetching code was added.

### Exit Criteria

Phase 2 is complete when:

1. Seed data exists.
2. The seed data supports at least one ZIP search.
3. The data is controlled and inspectable.
4. No external fetching has been added.

---

## Phase 3: ZIP Search Flow

### Goal

Let the user search a ZIP code and see matching seeded law firm prospects.

### Included

- ZIP input
- 5-digit ZIP validation
- search action
- matching seeded prospects
- empty state for no results
- basic loading state if needed
- no external fetching

### Out of Scope

- radius search
- city/state search
- map UI
- recent ZIP tracking
- saved leads
- enrichment
- external APIs
- AI ranking

### Suggested Coding-Agent Task

```text
Build ZIP search against manual seed data.
```

### Human Verification

The human should verify:

1. Enter a seeded ZIP.
2. Matching prospects appear.
3. Enter an invalid ZIP.
4. Helpful validation appears.
5. Enter an unknown ZIP.
6. Empty state appears.
7. No recent ZIP behavior was added.
8. No external fetching was triggered.

### Exit Criteria

Phase 3 is complete when:

1. ZIP search works against seed data.
2. Invalid ZIP behavior is clear.
3. Empty state behavior is clear.
4. The human manually verifies the flow.

---

## Phase 4: Prospect Results and Detail

### Goal

Let the user review useful prospect details after a ZIP search.

### Included

- prospect result cards or rows
- firm name
- location
- website if available
- phone if available
- practice areas if available
- prospect detail page or panel
- missing-field handling
- return to results

### Out of Scope

- editing firm records
- saving leads
- notes
- statuses
- reminders
- enrichment buttons
- external fetching
- dashboard activity timeline

### Suggested Coding-Agent Tasks

Do these as separate tasks:

1. `Create prospect result cards for seeded search results.`
2. `Create prospect detail view for a selected firm.`

### Human Verification

The human should verify:

1. Search a seeded ZIP.
2. Results are readable.
3. Click or open a prospect.
4. Detail view shows the selected firm.
5. Missing fields do not look broken.
6. User can return to the results.

### Exit Criteria

Phase 4 is complete when:

1. Results are useful and readable.
2. Prospect detail view works.
3. The human verifies the flow manually.
4. No saved leads or enrichment behavior has been added.

---

## Phase 5: Clean Database Foundation

### Goal

Add persistence only when the app flow is clear enough to justify it.

### Included

Potentially:

- PostgreSQL
- Prisma
- minimal schema
- minimal `Firm` model
- safe migration
- controlled seed script
- `.env.example` placeholders

### Out of Scope

- auth tables unless auth is the task
- saved leads
- recent ZIPs
- external source/candidate tables
- enrichment tables
- destructive migration fixes
- large future-proof schema

### Suggested Coding-Agent Task

```text
Add Prisma and a minimal Firm model for seeded ZIP search.
```

Only do this after the human updates:

```text
task/current-task.md
```

### Human-Controlled Commands

The coding agent may suggest migration commands, but the human runs them.

Never run:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
```

### Human Verification

The human should verify:

1. Schema file exists.
2. Migration is understandable.
3. `.env.example` has placeholders only.
4. No real secrets are committed.
5. Seed data is loaded or inspectable.
6. Search still works after database change.

### Exit Criteria

Phase 5 is complete when:

1. Minimal database foundation exists.
2. Data can support ZIP search.
3. Migration process is safe and understood.
4. No destructive commands were used.

---

## Phase 6: Custom Auth Foundation

### Goal

Add simple auth only after app/data foundations are stable.

Preferred auth model:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

### Included Later

- email allowlist
- request code
- verify code
- session cookie
- sign out
- current user lookup
- `.env.example` placeholders

### Out of Scope

- Clerk
- passwords
- OAuth
- teams
- organizations
- billing
- enterprise SSO
- saved leads in the same task
- recent ZIPs in the same task

### Suggested Coding-Agent Task

```text
Add custom email-code auth foundation without saved leads or recent ZIPs.
```

### Human Verification

The human should verify later:

1. Approved email can request a code.
2. Unapproved email cannot gain access.
3. Valid code signs in.
4. Invalid code fails.
5. Used code cannot be reused.
6. Sign out works.
7. Protected route requires sign-in.

### Exit Criteria

Phase 6 is complete when:

1. A user can sign in and sign out.
2. Sessions work safely.
3. Protected routes work.
4. No saved leads or recent ZIPs are mixed into the auth task.

---

## Phase 7: Saved Leads

### Goal

Let signed-in users save prospects privately.

### Included

- save a prospect
- view saved leads
- remove a saved lead
- saved lead belongs to current user
- saved leads do not affect global firm records

### Out of Scope

- public saved leads
- team-shared saved leads
- CRM export
- notes/statuses/tasks unless separately scoped
- recent ZIPs
- external fetching

### Suggested Coding-Agent Tasks

Do these separately:

1. `Add saved lead data model.`
2. `Add save/remove lead API behavior.`
3. `Add saved leads UI.`
4. `Add manual verification for user scoping.`

### Human Verification

The human should verify:

1. Signed-in user can save a prospect.
2. Saved lead appears in that user's saved list.
3. Saved lead can be removed.
4. Another user cannot see it.
5. Global firm record is not deleted when saved lead is removed.

### Exit Criteria

Phase 7 is complete when:

1. Saved leads are private to a user.
2. Save/remove behavior works.
3. User scoping is verified.
4. No recent ZIP or external fetching scope was mixed in.

---

## Phase 8: Recent ZIPs

### Goal

Let signed-in users return to prior ZIP searches safely.

### Included

- record valid ZIP searches
- show recent ZIPs for current user
- persist across reload
- avoid cross-user leakage
- clear max count or ordering rule

### Out of Scope

- anonymous recent history
- global recent ZIPs
- external fetching on recent ZIP click
- complex caching
- dashboard redesign

### Suggested Coding-Agent Tasks

Do these separately:

1. `Add user-scoped recent ZIP data model.`
2. `Record valid ZIP searches for signed-in users.`
3. `Display recent ZIPs for signed-in users.`
4. `Verify reload and user-switching behavior.`

### Human Verification

The human should verify:

1. Search a valid ZIP.
2. ZIP appears in recent list.
3. Reload page.
4. ZIP still appears.
5. Sign in as another user.
6. First user's recent ZIP does not appear.
7. Invalid ZIP is not saved.

### Exit Criteria

Phase 8 is complete when:

1. Recent ZIPs are scoped to one user.
2. Reload behavior is clear.
3. User switching does not leak data.
4. The old Recent ZIP confusion is not repeated.

---

## Phase 9: External Data Fetching

### Goal

Improve prospect coverage through controlled, documented data-fetching passes.

This phase must wait until:

```text
docs/03-data-fetching-plan.md
```

documents and approves a specific fetching pass.

### Included Later

Possibly:

- one approved fetching pass
- explicit trigger
- exact source/query/prompt/API request
- output fields
- source metadata
- confidence metadata
- save rules
- overwrite rules
- cost/rate-limit handling

### Out of Scope Until Approved

- scraping
- enrichment
- browser automation
- external search APIs
- AI research passes
- automatic overwrites
- background refresh jobs
- provider integrations

### Suggested First Fetching Task Later

```text
Implement one admin/manual data-fetching pass exactly as documented in docs/03-data-fetching-plan.md.
```

### Human Verification

The human should verify:

1. Pass only runs from approved trigger.
2. Input matches the plan.
3. Source/query/prompt matches the plan.
4. Output fields match the plan.
5. No existing non-empty fields are silently overwritten.
6. Source/confidence metadata is saved.
7. Cost/rate-limit behavior is understood.

### Exit Criteria

Phase 9 is complete when:

1. One controlled fetching pass works.
2. It follows the documented plan.
3. The human understands what it fetches and saves.
4. No hidden enrichment behavior exists.

---

## Future / Maybe Later

These are not part of the early rebuild.

Possible future features:

- radius search
- city/state search
- advanced filtering
- better firm ranking
- website health indicators
- contact completeness scoring
- CSV export
- CRM export
- outreach templates
- lead statuses
- notes
- follow-up reminders
- admin review queue
- duplicate firm resolution
- source conflict resolution
- paid data provider comparison
- multi-user team accounts
- billing

These should be considered only after the core flow and private workspace are stable.

---

## Explicit Anti-Roadmap

Do not do these early:

```text
Do not start with Clerk.
Do not start with auth.
Do not start with Prisma unless database is the approved task.
Do not start with scraping.
Do not start with enrichment.
Do not start with dashboard complexity.
Do not build saved leads before auth/user ownership.
Do not build recent ZIPs before user-specific behavior is stable.
Do not add external fetching without a documented pass.
Do not batch unrelated features into one coding-agent session.
```

---

## Roadmap Change Rule

A roadmap change should be recorded in:

```text
task/decisions.md
```

Record:

- what changed
- why it changed
- what risk it introduces
- what should be revisited later

Do not silently change the build order.

---

## How to Pick the Next Task

When choosing the next coding-agent task, ask:

1. Is it the next step in the roadmap?
2. Is it listed in `task/current-task.md`?
3. Does it have clear acceptance criteria?
4. Is it small enough for one session?
5. Does it avoid unrelated features?
6. Does it avoid destructive commands?
7. Can the human verify it?

If the answer is no, split or delay the task.

---

## Current Recommended Next Task

After all planning docs are saved, the next recommended task is:

```text
Create a basic app shell with a home/search page placeholder.
```

Before starting, update:

```text
task/current-task.md
```

The task should explicitly say:

- create app shell
- create home/search page placeholder
- no auth
- no database
- no seed data unless explicitly included
- no external fetching
- no saved leads
- no recent ZIPs
- human runs commands

---

## Next Recommended File

After this file is saved, fill in:

```text
README.md
```

That file should give a short project overview, explain where to start, and point to the control docs.