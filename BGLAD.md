# BGlad Continuation Handoff — Real Data Plan Complete, Prisma/Neon Foundation Started

Date: 2026-06-17

Purpose: Handoff for the next BGlad session so the Legal Prospector project can continue from the current Prisma/Neon database foundation state without losing scope control, command discipline, phase numbering clarity, or the product objective.

---

## 1. Current Project Status

The project has advanced significantly beyond the prior handoff.

Current status is now:

```text
Phase 0: Control and Planning — complete
Phase 1: Basic App Shell — complete
Phase 2: ZIP-code Prospect Search Shell — complete
Phase 2.5: First Public Deployment — complete / deployed
Phase 3: Real Data Acquisition Plan — complete
Phase 3.1: Prospect Data Model Gap Analysis — complete
Phase 3.2: Frontend Prospect Model Alignment — complete

Phase 4: Database Planning and Stack Decision — complete
Phase 4.1: Prisma + Neon Database Plan — complete
Phase 4.2: Product Ownership Model Clarified — complete

Phase 5: Clean Database Foundation — in progress
Phase 5.1: Human Prisma/Neon setup — complete
Phase 5.2: Minimal Prisma Firm model — complete
Phase 5.3: Initial Firm migration — complete / pushed
Next safe task: Phase 5.4: Controlled Firm seed script
```

Important phase-number cleanup:

The previous conversation temporarily jumped from Phase 3.x to Phase 5.x, which made it look like Phase 4 was skipped. The correct interpretation is:

```text
Phase 4 = Database planning / stack decision / ownership model clarification.
Phase 5 = Actual database foundation implementation.
```

Do not continue the confusing numbering.

---

## 2. Public Deployment

The site remains publicly reachable at:

```text
https://legal-prospect.vercel.app
```

Use this clean production URL in future docs.

Avoid referencing older protected/specific deployment URLs.

---

## 3. Correct Product Objective

The product objective remains:

```text
A user or sales rep enters a postal ZIP code → the site finds real small/boutique law firm prospects in or near that ZIP → the user reviews useful firm details → the user can eventually save and work those leads.
```

The current app is the deployed shell plus an early database foundation for that idea.

The objective is not:

```text
show sample prospects forever
```

The objective is:

```text
find, enrich, verify, store, and use real law firm prospect data by ZIP code.
```

---

## 4. Important Wording Rule

Do not say:

```text
local ZIP
```

Use:

```text
ZIP-code search
ZIP-code prospect search
seed-data ZIP-code search
real-data ZIP-code search
DB-backed ZIP-code search
```

Reason: “local ZIP” sounds like a ZIP file or local machine artifact. The product is about postal ZIP codes.

---

## 5. Current App Behavior

Current public MVP flow:

```text
User opens the website → enters a postal ZIP code → app searches manually curated sample prospect data → app displays matching law firm prospects → user can expand details → user can save/unsave during the current browser session
```

Current supported user-visible behavior:

- homepage loads publicly
- ZIP-code search input
- search button
- validation for invalid ZIP input
- unsupported-ZIP empty state
- ZIP `19103` returns sample prospects
- ZIP+4 normalization works, e.g. `19103-1234` matches `19103`
- prospect result cards
- expandable/collapsible prospect details
- in-memory save/unsave state
- saved count
- browser refresh clears saved state
- public-facing copy remains honest that the data is manually curated sample prospect data

Current deployed public copy includes:

```text
Legal Prospect Search
Legal Prospector
ZIP-based law firm prospecting for finding small and boutique law firm leads.
```

Current metadata title:

```text
Legal Prospector - Find Boutique Law Firms
```

The data disclaimer should remain honest, along the lines of:

```text
Currently showing manually curated sample prospect data.
```

---

## 6. Major Work Completed Since Prior Handoff

### Phase 3 — Real Data Acquisition Plan

Completed and committed:

```text
docs/planning/03-data-fetching-plan.md
tasks/work.md
```

The plan defines:

- what counts as a real prospect
- required and optional prospect fields
- source types and source-quality levels
- confidence rules
- ZIP/geographic matching
- duplicate handling
- freshness and last-checked rules
- manual first-pass workflow
- future automation options
- risks and constraints
- what must be true before persistence

Important correction made during review:

The first version overclaimed that example real firms were verified. It was revised so any real firm examples are candidate records pending verification, not high-confidence verified records.

Important confidence/status distinction:

```text
confidenceLevel = how trustworthy the data is after review
verificationStatus = where the record is in the research workflow
```

Recommended future values:

```text
confidenceLevel: HIGH | MEDIUM | LOW | UNKNOWN
verificationStatus: CANDIDATE | PENDING_REVIEW | VERIFIED | REJECTED | STALE
```

---

### Phase 3.1 — Prospect Data Model Gap Analysis

Completed and committed:

```text
docs/planning/12-prospect-data-model-gap-analysis.md
tasks/work.md
```

The gap analysis compared the current frontend `Prospect` type against the real-data acquisition plan.

It clarified:

- currently supported fields
- missing real-data fields
- fields that belong to global/canonical prospect data
- fields that belong to private user workflow data
- future model shape
- confidence vs verification status

Important outcome:

The project now clearly separates objective firm data from private user workflow data.

---

### Phase 3.2 — Frontend Prospect Model Alignment

Completed and pushed.

Frontend model and demo data were updated so the app can represent planned real-data fields.

Likely files changed:

```text
src/types/prospect.ts
src/data/prospects.ts
src/components/ProspectCard.tsx
src/utils/prospectMatcher.test.ts
tasks/work.md
```

Current frontend type direction includes:

```ts
ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'
VerificationStatus = 'CANDIDATE' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'STALE'
SourceType = 'BAR_DIRECTORY' | 'GOOGLE_MAPS' | 'WEB_SCRAPE' | 'MANUAL' | 'MANUAL_SEED'
```

Important review point:

All demo seed records currently use:

```text
confidenceLevel: UNKNOWN
verificationStatus: CANDIDATE
sourceType: MANUAL_SEED
```

This is correct and honest because the current seed records are fictional/demo-safe, not verified real firms.

Do not “improve” the demo records to HIGH/MEDIUM unless they are real, sourced, and verified.

---

## 7. Phase 4 — Database Planning and Ownership Model

Completed and pushed:

```text
docs/planning/05-database-plan.md
docs/planning/09-roadmap.md
tasks/work.md
```

The chosen MVP/learning database stack is:

```text
Database hosting: Neon Postgres
ORM/schema layer: Prisma
```

This stack is locked in for the MVP/learning phase because the human is currently learning it.

Important framing:

```text
Use Prisma + Neon for the MVP/learning database phase.
Do not treat it as the permanent final architecture forever.
Revisit later if product, scale, cost, or performance needs require it.
```

### Ownership Model Clarification

A key product-owner decision was made:

Do not make every firm record fully user-specific.

Do not make every user’s search workflow globally shared either.

The correct model is:

```text
Shared/internal canonical data corpus
+
private user/session workflow data
```

In plain English:

```text
The raw law-firm data library is shared internally.
Each user’s search runs, saved leads, notes, statuses, reminders, and recent searches are private.
```

This solves the previous ownership problem without duplicating firm records per user.

### Canonical/Internal Data

Examples:

- `Firm`
- source metadata
- confidence level
- verification status
- last checked date
- global firm facts
- future scrape/enrichment results

### Private/User Workflow Data — Deferred

Examples:

- user search runs
- displayed search results per user/session
- saved leads
- user notes
- user-specific statuses
- tasks
- reminders
- recent searches
- follow-up workflow state

Do not add private/user workflow tables yet.

Auth and user ownership must be designed first.

---

## 8. Phase 5 — Database Foundation Current State

The human completed the Prisma/Neon setup and first migration work.

Known completed:

- Prisma / Neon-related packages installed by the human
- Prisma initialized
- real Neon pooler/direct connection values added to local `.env` by the human
- `.env` confirmed not staged
- `.env.example` created with placeholders only
- generated Prisma client output is ignored
- minimal `Firm` model defined
- initial Prisma migration generated by the human
- migration SQL reviewed
- migration committed and pushed

### Important File/Ignore Notes

The generated Prisma client output path is intended to be ignored.

The project already had:

```text
src/generated/prisma/
```

in `.gitignore`.

An unnecessary `/generated` ignore rule was removed because it was confusing and did not target the actual generated client path.

Do not commit generated Prisma client files.

Do not commit `.env`.

Keep `.DS_Store` ignored and do not commit `docs/.DS_Store`.

---

## 9. Current Prisma Schema Direction

The initial schema uses a minimal canonical `Firm` model only.

Important constraints:

- no `User`
- no `SavedLead`
- no `LeadNote`
- no `LeadStatus`
- no `SearchRun`
- no `SearchResult`
- no `RecentSearch`
- no auth/session tables
- no scraping/enrichment run tables
- no billing/team/organization models

The `website` field intentionally should **not** be unique yet.

Reason:

```text
Some firms may have multiple offices sharing one domain.
Forcing website uniqueness too early may create avoidable data problems.
```

The schema includes query indexes:

```text
@@index([zip])
@@index([city, state])
```

The initial migration SQL was reviewed and reported clean:

- creates enum types for `ConfidenceLevel`, `VerificationStatus`, `SourceType`
- creates `Firm` table only
- creates expected indexes
- uses Postgres array columns for `practiceAreas` and `attorneys`
- contains no destructive SQL
- contains no user/auth/saved-lead/search-history/scraping tables
- contains no secrets

---

## 10. Prisma 7 Config Note

The project appears to be using Prisma 7 style config.

Important review happened:

The agent initially used an `as any` workaround in `prisma.config.ts` to include `directUrl`. This was rejected.

Final direction:

- no `as any` workaround
- keep config typed
- no secrets in code
- `.env.example` has placeholders only
- `.env` has real local values but must never be committed

The exact final config should be checked in the repo if needed.

Do not assume `directUrl` is wired unless confirmed in the actual file.

If migration/direct connection behavior needs more work later, treat it as a separate human-reviewed workflow.

---

## 11. Current Recommended Next Task

Next safe task:

```text
Phase 5.4: Controlled Firm seed script
```

Goal:

```text
Create a safe, repeatable Prisma seed script that loads the existing frontend demo prospects into the new Firm table.
```

This task should prepare seed code only.

The human runs the seed.

Do not connect the app UI to the database yet.

Suggested current-task file was prepared in the previous session:

```text
current-task-controlled-prisma-seed-script.md
```

If the file has not been copied into the repo, recreate or paste it into:

```text
tasks/current-task.md
```

### Phase 5.4 Allowed

- create `prisma/seed.ts` or equivalent
- use existing `src/data/prospects.ts` demo records
- seed only the `Firm` table
- use idempotent upsert by stable `id`
- add a package script such as `db:seed` if appropriate
- update `tasks/work.md`

### Phase 5.4 Forbidden

- no agent-run terminal commands
- no `.env` edits
- no secret exposure
- no running the seed by the agent
- no new database models
- no migrations
- no API routes
- no DB-backed app search yet
- no auth
- no saved leads
- no recent ZIP persistence
- no scraping/enrichment
- no real firm records
- no generated Prisma client files committed

### Expected Seed Behavior

The seed script should:

1. create a `PrismaClient`
2. read or import `SEED_PROSPECTS`
3. map each prospect to the `Firm` model
4. upsert by stable `id`
5. update existing demo records on repeat runs instead of duplicating
6. disconnect in a `finally` block
7. print a small success summary when the human runs it
8. exit non-zero on errors

Do not rely on website uniqueness.

---

## 12. After Seed Script

After Phase 5.4, likely next steps:

```text
Phase 5.5: Human runs controlled seed and verifies in Prisma Studio
Phase 5.6: Create DB-backed ZIP search API route
Phase 5.7: Wire UI to DB-backed search while preserving current behavior
```

Do not jump directly to DB-backed search until the seed script is reviewed and run successfully.

Do not add saved leads/auth before user ownership is designed.

---

## 13. Testing State

Current automated testing layer:

```text
Vitest tests for ZIP normalization and prospect matching
```

Known tested functions:

```text
normalizeZipCode
matchProspectsByZip
```

Known behavior covered:

- clean 5-digit ZIPs
- whitespace trimming
- ZIP+4 normalization
- invalid ZIP rejection
- matching prospects by ZIP
- unsupported ZIP empty result
- empty prospect array
- search using ZIP+4 returns same results as base ZIP

Testing philosophy:

- keep testing pure business logic first
- do not jump to Playwright/Cypress yet
- do not add React Testing Library until component complexity justifies it
- human runs all test/build/dev/database commands

Recommended human verification after code tasks:

```bash
npm run test
npm run build
npm run dev
git status
git diff
```

For database tasks, the human may also run:

```bash
npx prisma format
npx prisma migrate dev --name <name>
npx prisma studio
npm run db:seed
```

Only when the relevant task explicitly calls for it.

---

## 14. Human-Controlled Command Rule

Coding agents must not run terminal commands.

This includes:

```text
cd
ls
pwd
git status
git diff
git add
git commit
git push
npm install
npm run dev
npm run build
npm run test
npm run lint
npx
npx prisma format
npx prisma generate
npx prisma migrate dev
npx prisma db push
npx prisma migrate reset
rm
mv
cp
cleanup commands
database commands
deployment commands
```

Agents may propose commands only under:

```text
Commands for human to run
```

The human runs them.

Important nuance:

Some logs may show commands at the top of a report. Clarify whether they were human-run commands or agent-run commands before assuming a violation.

Terminal commands remain human-only.

---

## 15. Absolutely Forbidden / High-Risk Commands

Continue treating these as forbidden unless the human makes an explicit, informed exception:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

Also be cautious with force pushes.

If force push is suggested, prefer:

```bash
git push --force-with-lease
```

Only after the human confirms the remote does not contain work they need.

---

## 16. Data Ownership Guardrail

This remains central.

### Shared/Internal Canonical Data

- firm records
- attorney names / attorney count where verified
- practice areas
- source URLs
- source type
- confidence level
- verification status
- last checked date
- source/enrichment metadata
- ZIP research
- cached ZIP results later

### Private/User-Specific Data

- saved leads
- user notes
- user-specific statuses
- tasks
- reminders
- recent searches
- search runs
- search results seen by a user/session
- follow-up workflow state

Do not let coding agents blur this line.

The canonical firm corpus may be shared internally.

User workflow data should remain private and must wait for auth/user ownership design.

---

## 17. Real Data / Scraping Direction

The product is a data app.

The likely future path is:

```text
seed demo data → DB-backed seed data → small verified real dataset → controlled scraping/enrichment → daily enrichment pipeline
```

But do not jump to scraping yet.

Before scraping/enrichment implementation, define:

- source
- terms/risk
- output fields
- confidence
- duplicate handling
- freshness
- save/overwrite behavior
- human review / verification process

The project will likely build toward a 3k–5k firm canonical dataset, then worry more deeply about shared result scale, enrichment, and workflow layers.

---

## 18. Watchouts for Future Sessions

### Watch for command-control drift

If an agent says it ran commands, clarify whether those were:

- actual terminal commands run by the agent
- human-run commands included in the log
- file-browser/view/edit actions inside the coding tool

Terminal commands remain human-only.

### Watch for unreported changed files

If the activity log says files were edited but the final report omits them, ask for clarification before commit.

Use `git status` as the source of truth.

### Watch for generated files

Do not commit generated Prisma client files.

Expected generated path to ignore:

```text
src/generated/prisma/
```

### Watch for `.DS_Store`

Do not commit:

```text
.DS_Store
docs/.DS_Store
```

Restore/remove accidental `.DS_Store` changes before commit.

### Watch for database scope creep

Do not add:

- auth
- saved leads
- recent ZIP persistence
- user notes
- statuses
- search history
- scraping/enrichment tables
- dashboard complexity
- teams/organizations/billing

unless the current task explicitly covers that one slice.

### Watch for “real data” overclaims

Do not mark records as verified or high-confidence unless they are sourced and verified.

Demo records should stay honest:

```text
sourceType: MANUAL_SEED
confidenceLevel: UNKNOWN
verificationStatus: CANDIDATE
```

---

## 19. User Working Style Reminder

The user prefers:

- direct practical recommendations
- clean markdown handoffs
- downloadable `.md` files when useful
- one feature per coding-agent session
- small safe increments
- no overengineering
- no vague abstractions
- honest risk notes
- bootcamp-friendly explanations
- enough context to make product-owner decisions

The user likes to discuss “why” in plain English, especially around:

- TDD
- what should be tested
- what should be manual
- what is scope creep
- when to spawn a new agent
- whether to approve an agent plan
- whether an agent’s report is trustworthy
- how to split human tasks from coding-agent tasks
- migration and data-loss guardrails
- how to sequence database tasks safely

---

## 20. Current Best Summary

The project has moved from:

```text
planning docs only
```

to:

```text
a deployed public MVP shell with a committed Prisma/Neon Firm database foundation.
```

What exists:

```text
A public Next.js app where a user can search a postal ZIP code and see manually curated sample law firm prospects.
```

What also now exists:

```text
A minimal Prisma/Neon database foundation with a canonical Firm model and an initial migration.
```

What comes next:

```text
Create a controlled, idempotent seed script to load the existing demo prospects into the Firm table.
```

Do not jump straight to:

```text
DB-backed UI search
auth
saved leads
recent ZIP persistence
scraping
real firm enrichment
dashboard features
```

Most likely next safe task:

```text
Phase 5.4: Create controlled Prisma seed script for demo Firm records.
```

BGlad should continue acting as the product/technical planning partner, scope-control reviewer, coding-agent handoff writer, final-report reviewer, migration/data-loss guardrail, testing/process coach, and plain-English explainer.

BGlad is not the coding agent.