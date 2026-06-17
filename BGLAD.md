# BGlad Continuation Handoff — Legal Prospector Through Phase 6.1

Date: 2026-06-17  
Purpose: Continue the Legal Prospector project in a fresh BGlad session without losing context, scope guardrails, phase numbering, product objective, or the current real-data intake direction.

---

## 1. Current Project Status

The project has progressed from a static frontend MVP shell to a deployed production app with database-backed ZIP-code prospect search.

Current phase status:

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

Phase 5: Clean Database Foundation — complete
Phase 5.1: Human Prisma/Neon setup — complete
Phase 5.2: Minimal Prisma Firm model — complete
Phase 5.3: Initial Firm migration — complete / pushed
Phase 5.4: Controlled Firm seed script — complete
Phase 5.5: Human seed verification — complete
Phase 5.6: DB-backed ZIP-code search API route — complete
Phase 5.7: Homepage wired to DB-backed API — complete
Phase 5.8: Production DB-backed search deployment readiness — complete / verified

Phase 6.1: First real-firm intake workflow planning — complete
Next active task: Phase 6.2 — Prepare Manual Real-Firm Intake Template
```

Important phase-number cleanup remains:

```text
Phase 4 = Database planning / stack decision / ownership clarification.
Phase 5 = Actual database foundation and DB-backed search implementation.
Phase 6 = First controlled real-data intake process.
```

Do not restart confusing numbering.

---

## 2. Public Production URL

Use the clean production URL:

```text
https://legal-prospect.vercel.app
```

The production site is now deployed with DB-backed ZIP-code search.

Avoid referencing old protected/specific deployment URLs.

---

## 3. Product Objective

The product objective remains:

```text
A user or sales rep enters a postal ZIP code → the site finds small/boutique law firm prospects in or near that ZIP → the user reviews useful firm details → the user can eventually save and work those leads.
```

The product is not:

```text
show sample prospects forever
```

The product is:

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

Current deployed flow:

```text
User opens the website → enters a postal ZIP code → homepage calls /api/prospects/search?zip=<zip> → API searches the Neon/Postgres Firm table → app displays matching law firm prospects → user can expand details → user can save/unsave during the current browser session
```

Current supported user-visible behavior:

- homepage loads publicly
- ZIP-code search input
- search button
- DB-backed search API call
- validation for invalid ZIP input
- unsupported-ZIP empty state
- ZIP `19103` returns seeded database prospects
- ZIP+4 normalization works, e.g. `19103-1234` matches `19103`
- prospect result cards
- expandable/collapsible prospect details
- in-memory save/unsave state
- saved count
- browser refresh clears saved state
- public-facing copy remains honest that current data is seeded demo/sample data from the database

Current UI copy should remain honest, along the lines of:

```text
Currently showing seeded demo prospect data from the database.
```

Do not imply that current records are verified real firms unless that is actually true.

---

## 6. Current Technical Foundation

Current stack:

```text
Frontend/app: Next.js
Database hosting: Neon Postgres
ORM/schema: Prisma
Deployment: Vercel
Testing: Vitest
```

Current production data path:

```text
src/app/page.tsx
→ fetch("/api/prospects/search?zip=<zip>")
→ src/app/api/prospects/search/route.ts
→ src/lib/prisma.ts
→ Neon/Postgres Firm table
```

Current Prisma model direction:

```text
Minimal canonical Firm model only.
```

Still no:

- User
- SavedLead
- LeadNote
- LeadStatus
- SearchRun
- SearchResult
- RecentSearch
- auth/session tables
- scraping/enrichment run tables
- billing/team/organization models

The `website` field intentionally should not be unique yet because some firms may have multiple offices sharing one domain.

Indexes currently intended:

```text
@@index([zip])
@@index([city, state])
```

---

## 7. Phase 5.4 Completed — Controlled Seed Script

Phase 5.4 created the controlled Prisma seed script.

Key behaviors:

- `prisma/seed.ts` upserts seeded demo prospects into `Firm`
- seed is idempotent by stable `id`
- does not rely on website uniqueness
- uses Prisma 7 + Neon adapter initialization
- uses `DIRECT_URL` or `DATABASE_URL`
- exits non-zero on CLI script error
- does not add schema or migrations

Important command clarification:

```bash
npm run db:seed
```

and

```bash
npx prisma db seed
```

are effectively equivalent in this project because `package.json` defines:

```json
"db:seed": "prisma db seed"
```

and Prisma seed config points to:

```json
"prisma": {
  "seed": "tsx prisma/seed.ts"
}
```

The user may prefer `npx prisma db seed` because that is what their instructor taught.

---

## 8. Phase 5.6 Completed — DB-backed ZIP Search API

Phase 5.6 added:

```text
src/lib/prisma.ts
src/app/api/prospects/search/route.ts
src/app/api/prospects/search/route.test.ts
```

API route:

```text
GET /api/prospects/search?zip=<zip>
```

Behavior:

- missing ZIP → 400 JSON
- invalid ZIP → 400 JSON
- valid ZIP with matches → 200 JSON with results
- valid ZIP with no matches → 200 JSON with empty array
- ZIP+4 normalizes to base 5-digit ZIP
- database failure → 500 JSON with generic safe error

Testing note:

- route tests mock Prisma
- no live database required for unit tests
- earlier Vitest alias issue was fixed by switching route/test imports to relative paths

Manual debugging note:

The user had a port mix-up during API testing. Next.js started on port `3002` because `3000` was already in use. The API was working on the active Next port. `jq` failed only when the user accidentally curled an old stale server on `3000` that returned an HTML 404 page.

---

## 9. Phase 5.7 Completed — Homepage Wired to API

Phase 5.7 modified:

```text
src/app/page.tsx
tasks/work.md
```

New behavior:

```text
Homepage ZIP search → /api/prospects/search?zip=<zip> → DB-backed results
```

Changes included:

- removed local static prospect filtering as search source
- added async `fetch()` call to API
- added `isLoading` state
- added `matchingProspects` state
- disabled input/button while searching
- added loading/spinner placeholder
- preserved validation, ZIP+4 support, empty state, expand/collapse, saved count, and in-memory save/unsave state
- updated copy to say seeded demo data from database

No UI persistence was added.

---

## 10. Phase 5.8 Completed — Production Deployment Readiness

Phase 5.8 verified production deployment.

Important result:

```text
https://legal-prospect.vercel.app
```

now uses DB-backed search in production.

Completed checks included:

- Vercel environment variables configured
- database-backed route deployed
- homepage deployed
- production search endpoint verified
- seeded demo records accessible in production
- work log updated
- current task moved to Phase 6.1

---

## 11. Phase 6.1 Completed — First Real-Firm Intake Workflow

Phase 6.1 created:

```text
docs/planning/13-first-real-firm-intake-workflow.md
```

and updated:

```text
tasks/work.md
tasks/current-task.md
```

Phase 6.1 defined the first controlled real-data intake plan.

Decisions:

```text
First target geography: ZIP 19103, Philadelphia, PA
Initial real-data batch: originally 5–10, but BGlad recommends a smaller 1–3 pilot first
Manual intake before scraping
Official sources preferred
Records must be human-reviewed before being treated as verified
```

Important adjustment from BGlad:

Use conservative defaults for first real records:

```ts
sourceType: "MANUAL"
confidenceLevel: "MEDIUM"
verificationStatus: "PENDING_REVIEW"
```

Only upgrade to:

```ts
confidenceLevel: "HIGH"
verificationStatus: "VERIFIED"
```

after human review confirms the record is clean.

Do not show “Real Verified” badge unless the record is actually:

```text
sourceType = MANUAL
confidenceLevel = HIGH
verificationStatus = VERIFIED
```

---

## 12. Old Project Review — Use as Inspiration Only

The user provided old Legal Prospector project material with:

- LLM/web research worker
- DuckDuckGo search context collection
- prompt builder/parser concepts
- old normalized Prisma schema
- old dedupe/save helpers
- old search/save/saved API ideas

Important decision:

```text
Do not give the coding agent access to old project files.
Do not copy old project code into the current project.
Use old project ideas only when BGlad needs product/architecture context.
```

Useful ideas to carry forward conceptually:

- prefer official firm websites as primary sources
- filter out directory/social URLs as primary sources
- normalize website domains for dedupe
- reject placeholder values like `unknown`, `n/a`, `none`, `placeholder`
- preserve existing useful verified values when incoming data is weaker or empty
- keep discovery, enrichment, verification, and saving as separate steps
- automated/model output should be `CANDIDATE` or `PENDING_REVIEW`, never `VERIFIED`
- future dedupe should use normalized domain first, then normalized firm name + ZIP, then phone/address

What not to copy now:

- old full schema
- auth/session models
- saved-lead persistence
- recent ZIP persistence
- search-run tables
- attorney/practice area normalized tables
- live research worker
- OpenAI/DuckDuckGo scraping/enrichment logic

Those are future reference points, not Phase 6.2 implementation.

---

## 13. Current Active Task — Phase 6.2

Next task:

```text
Phase 6.2 — Prepare Manual Real-Firm Intake Template
```

Purpose:

```text
Prepare the project structure needed to safely add first manually verified real firm records later.
```

Primary scope:

- create `src/data/real-firms.ts`
- export empty `REAL_FIRMS: Prospect[]`
- include comments/template guidance only
- update `prisma/seed.ts` to import `REAL_FIRMS`
- seed `SEED_PROSPECTS + REAL_FIRMS`
- create `docs/planning/14-real-firm-intake-template.md`
- update `tasks/work.md`
- update `tasks/current-task.md` to Phase 6.3

No actual real firm records should be added in Phase 6.2.

Recommended next phase after 6.2:

```text
Phase 6.3 — Add first 1–3 human-verified real firm records
```

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

The user's pasted logs may include commands they ran personally. Do not assume a process violation when the user says they ran them.

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

Shared/internal canonical data:

- firm records
- source URLs
- source type
- confidence level
- verification status
- last checked date
- practice areas
- attorney names/counts where verified
- future enrichment metadata

Private/user-specific data, deferred until auth/ownership design:

- saved leads
- user notes
- user-specific statuses
- tasks
- reminders
- recent searches
- search runs
- search results seen by a user/session
- follow-up workflow state

Do not blur this line.

---

## 17. Testing State

Current automated testing:

- Vitest tests for ZIP normalization and prospect matching
- API route tests for `/api/prospects/search`

Known behavior covered:

- clean 5-digit ZIPs
- whitespace trimming
- ZIP+4 normalization
- invalid ZIP rejection
- matching prospects by ZIP
- unsupported ZIP empty result
- empty prospect array
- API invalid/missing ZIP errors
- API empty results
- API database error handling
- API database mapping

Recommended human verification after code tasks:

```bash
npm run test
npm run build
npm run dev
git status
git diff
```

For database tasks:

```bash
npx prisma db seed
npx prisma studio
```

Only when the relevant task explicitly calls for it.

---

## 18. User Working Style Reminder

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
- clear summaries of “what changed” every time an agent completes work

The user specifically asked:

```text
Every time we paste an agent completion report, summarize the new features/changes.
```

Use a consistent structure:

```text
What changed
What it means for the product
What did not change
What to verify
Next safe task
```

---

## 19. Current Best Summary

The project has moved from:

```text
planning docs + static frontend sample data
```

to:

```text
a deployed public Next.js app with Prisma/Neon database-backed ZIP-code prospect search.
```

What exists now:

```text
A public website where a user can search a postal ZIP code and see seeded database-backed law firm prospects.
```

What comes next:

```text
Prepare an empty/manual real-firm intake template and seed plumbing, then later add 1–3 human-verified real law firm records.
```

Do not jump to:

```text
bulk real-data loading
scraping
OpenAI enrichment
DuckDuckGo worker
auth
saved leads in DB
recent ZIP persistence
search history
normalized attorney/practice-area schema
dashboard features
```

Most likely next safe task:

```text
Phase 6.2 — Prepare Manual Real-Firm Intake Template
```

BGlad should continue acting as the product/technical planning partner, scope-control reviewer, coding-agent handoff writer, final-report reviewer, migration/data-loss guardrail, testing/process coach, and plain-English explainer.

BGlad is not the coding agent.