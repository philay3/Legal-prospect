# BGlad Continuation Handoff — First Public MVP Deployed, Real Data Phase Next

Date: 2026-06-16

Purpose: Handoff for the next BGlad session so the project can continue from the current deployed MVP state without losing scope control, command discipline, roadmap context, or the real product objective.

---

## 1. Current Status

The project has moved beyond the prior local working state.

Current status is now:

```text
Phase 0: Control and Planning — complete
Phase 1: Basic App Shell — complete
Phase 2: ZIP-code Prospect Search Shell — complete
Phase 2.5: First Public Deployment — complete / deployed
Next phase: Phase 3: Real Data Acquisition Plan
```

Important wording correction:

Do not say “local ZIP” anymore.

Use:

```text
ZIP-code search
ZIP-code prospect search
seed-data ZIP-code search
real-data ZIP-code search
```

Reason: “local ZIP” sounded like a ZIP file or something on the local machine. The product is about postal ZIP codes.

---

## 2. Public Deployment

The site is deployed and publicly reachable at:

```text
https://legal-prospect.vercel.app
```

Earlier, a protected Vercel deployment URL was documented:

```text
https://legal-prospect-5wqeib9g3-philay3s-projects.vercel.app
```

That URL appeared to require Vercel verification/login.

The clean production URL is:

```text
https://legal-prospect.vercel.app
```

If project docs still reference the protected/specific deployment URL, update them to the clean public URL.

Likely docs to check:

```text
docs/planning/11-first-deploy-checklist.md
tasks/work.md
tasks/current-task.md
README.md
```

Recommended commit if this doc correction is not already committed:

```bash
git status
git diff
git add docs/planning/11-first-deploy-checklist.md tasks/work.md tasks/current-task.md README.md
git commit -m "Document public production deployment URL"
git push
```

Only the human should run these commands.

---

## 3. GitHub / Remote Status

The local repo was connected to GitHub at:

```text
https://github.com/philay3/Legal-prospect.git
```

A remote conflict happened because the GitHub repo already had content.

The conflict was in:

```text
.DS_Store
```

Resolution used:

```bash
git rm -f .DS_Store
printf "\n# macOS\n.DS_Store\n" >> .gitignore
git add .gitignore
git commit -m "Merge GitHub remote into local project"
git push -u origin main
```

After this, the project was pushed successfully.

Going forward, normal pushes should be:

```bash
git push
```

Keep `.DS_Store` ignored.

---

## 4. Actual Current Repo Shape

Use actual repo paths, not older idealized paths.

Current project shape is approximately:

```text
legal-prospecting-planning-docs-starter/
├── agents.md
├── README.md
├── package.json
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── components/
│   │   └── ProspectCard.tsx
│   ├── data/
│   │   └── prospects.ts
│   ├── types/
│   │   └── prospect.ts
│   └── utils/
│       ├── prospectMatcher.ts
│       └── prospectMatcher.test.ts
├── tasks/
│   ├── current-task.md
│   └── work.md
└── docs/
    └── planning/
        ├── -START-HERE.md
        ├── 07-testing-guide.md
        ├── 08-coding-agent-rules.md
        ├── 09-roadmap.md
        ├── 10-spawned-agent.md
        └── 11-first-deploy-checklist.md
```

The project started as planning docs, then became a working Next.js app inside the same repo.

---

## 5. What the App Currently Does

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
- public-facing copy is cleaner than earlier internal “Phase 2” wording
- site copy remains honest that data is manually curated sample prospect data

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

Current data disclaimer language should stay honest, along the lines of:

```text
Currently showing manually curated sample prospect data.
```

---

## 6. What Has Been Completed Since the Previous Handoff

Since the previous handoff, these tasks were completed.

### Local-only save/unsave UI

Completed:

- added in-memory saved prospect state
- Save/Unsave button per prospect
- visual saved state
- saved count
- no persistence
- no localStorage/sessionStorage/cookies
- no DB/auth/API routes

### ZIP+4 regression tests

Completed:

- added/expanded Vitest coverage
- ZIP+4 support tested
- `19103-1234` normalizes to `19103`
- invalid ZIP+4 formats rejected
- search using ZIP+4 returns same matches as base ZIP

Known human-run test status after that step:

```text
All tests passed.
```

### ProspectCard extraction

Completed:

- extracted result card markup into:

```text
src/components/ProspectCard.tsx
```

- kept behavior unchanged
- improved maintainability
- no new feature added

### ProspectCard accessibility hardening

Completed:

- added `aria-expanded` for expand/collapse
- added accessible labels for expand/collapse
- added `aria-pressed` for save/unsave
- used type-only import for `Prospect`

### Public deployment readiness

Completed and committed:

- replaced internal/developer-centric page labels
- improved public-facing wording
- kept sample-data disclaimer honest
- improved app metadata
- added first deploy checklist
- confirmed no env vars required for current app
- no app behavior changes intended

Important copy corrections made before commit:

- metadata description no longer implies persistent saved leads
- “demo session” wording changed to “browser session”

### First public deployment

Completed:

- GitHub remote connected
- project pushed
- Vercel deployment created
- production URL confirmed:

```text
https://legal-prospect.vercel.app
```

---

## 7. Testing State

Current automated test layer:

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

Testing philosophy going forward:

- keep testing pure business logic first
- do not jump to Playwright/Cypress yet
- do not add React Testing Library until component complexity justifies it
- human runs all test/build/dev commands

Recommended human verification commands after feature/doc tasks:

```bash
npm run test
npm run build
npm run dev
git status
```

---

## 8. Human-Controlled Command Rule

Coding agents must not run terminal commands.

This includes:

```text
cd
ls
pwd
git status
git add
git commit
git push
npm install
npm run dev
npm run build
npm run test
npm run lint
npx
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

BGlad should keep enforcing this.

---

## 9. Absolutely Forbidden / High-Risk Commands

Continue treating these as forbidden unless the human makes an explicit, informed exception:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

Also be cautious with any force push.

If force push is suggested, prefer:

```bash
git push --force-with-lease
```

Only after the human confirms the remote does not contain work they need.

---

## 10. Do Not Rush Into

Still do not rush into:

- Clerk
- custom auth
- Prisma
- migrations
- real database seeding
- saved leads persistence
- recent ZIP persistence
- scraping
- enrichment
- external APIs
- dashboard complexity
- billing
- teams
- organizations
- permissions
- analytics packages

These are later phases.

Important: the next phase is not “database first.”

The next phase should be:

```text
Phase 3: Real Data Acquisition Plan
```

A database may come after the real-data plan, but the project first needs clarity on what data is needed, where it comes from, how it is verified, and how it should be stored.

---

## 11. Correct Product Objective

The core product objective is:

```text
A user or sales rep enters a postal ZIP code → the site finds real small/boutique law firm prospects in or near that ZIP → the user reviews useful firm details → the user can eventually save and work those leads.
```

The current app is the deployed shell of that idea.

The real objective is not:

```text
show sample prospects forever
```

The real objective is:

```text
find and use real law firm prospect data
```

A useful real prospect record probably needs:

```text
firm name
website
phone
city/state/ZIP
practice areas
attorney count or size estimate
source URL
source type
confidence level
last checked date
```

---

## 12. Data Ownership Rule

This remains central.

Global/shared data:

- ZIP code research
- firm records
- attorney records
- practice areas
- data source records
- cached ZIP results

Private/user-specific data:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Do not let the coding agent blur this line.

This matters before adding persistence.

Firm/prospect data can eventually be global/shared.

Saved leads, notes, statuses, recent searches, tasks, and reminders are private user data and should not be persisted until auth/database/user ownership is designed.

---

## 13. Current Real Data Direction

The old approved data approach was:

```text
Manual/sample seed data only.
```

That is still true for the deployed Phase 2.5 app.

But the next product phase is to move toward real data.

Before implementing fetching, scraping, enrichment, provider use, or prompt-driven research, the project must document the data plan in:

```text
docs/planning/03-data-fetching-plan.md
```

The plan must define:

- trigger
- input
- source
- exact prompt/query/API request
- pass number
- output fields
- confidence/source quality
- save behavior
- overwrite behavior
- cost/rate-limit risk
- legal/terms-of-use considerations
- duplicate handling
- freshness/last-checked rules

The first real-data implementation should be deliberately small.

Preferred approach:

```text
Hybrid:
Start with a small, sourced, manually curated set of real firm records for one ZIP/area.
Add source metadata and confidence fields.
Then later automate discovery/refinement once the data shape is clear.
```

Do not build a giant scraper first.

Do not add a database before defining the data and source plan.

---

## 14. Recommended Next Phase

Next phase:

```text
Phase 3: Real Data Acquisition Plan
```

Recommended next task title:

```text
Create real data acquisition plan for ZIP-code law firm prospecting
```

Goal:

```text
Define how the app will find, verify, structure, and eventually store real small/boutique law firm prospect data by ZIP code.
```

This should be a planning/doc task, not an app-code task.

Likely output file:

```text
docs/planning/03-data-fetching-plan.md
```

Likely updates:

```text
docs/planning/09-roadmap.md
tasks/work.md
tasks/current-task.md
README.md if needed
```

Do not add:

- Prisma
- database schema
- migrations
- auth
- API routes
- scraping code
- external fetch code
- new packages
- saved leads persistence

The data plan should answer:

1. What counts as a prospect?
2. What fields are required for a useful first record?
3. Which fields are optional?
4. What sources are acceptable?
5. What sources are disallowed or risky?
6. How does the app decide confidence?
7. How are duplicates detected?
8. What does “near this ZIP” mean?
9. How will source URLs and last-checked dates be tracked?
10. What is the first manual real-data experiment?
11. What later automation paths are possible?
12. What must be true before adding database persistence?

---

## 15. Suggested Next `tasks/current-task.md`

Use this as the next disposable task.

```md
# Current Task: Create real data acquisition plan for ZIP-code law firm prospecting

## Status

Ready for coding agent.

## Goal

Create a practical real-data acquisition plan for the Legal Prospector app.

The goal is to define how the app will find, verify, structure, and eventually store real small/boutique law firm prospect data by postal ZIP code.

This is a planning/documentation task only.

Do not implement real fetching, scraping, database storage, auth, or API routes yet.

## Current project state

The app is publicly deployed at:

https://legal-prospect.vercel.app

The current app supports:

- ZIP-code prospect search against manually curated sample data
- ZIP+4 normalization
- validation and empty states
- prospect result cards
- expandable/collapsible prospect details
- browser-session save/unsave UI
- accessible ProspectCard buttons
- public-facing copy and metadata
- first public deployment completed

The current app does not yet use real data.

## Product objective

The real product objective is:

A user or sales rep enters a postal ZIP code, and the site finds real small/boutique law firm prospects in or near that ZIP.

Useful real prospect data should eventually include:

- firm name
- website
- phone
- city/state/ZIP
- practice areas
- attorney count or size estimate
- source URL
- source type
- confidence level
- last checked date

## Scope

Allowed:

- Create or update `docs/planning/03-data-fetching-plan.md`.
- Review existing planning docs if needed.
- Define real prospect data fields.
- Define source criteria and source-quality levels.
- Define confidence rules.
- Define duplicate-handling rules.
- Define freshness and last-checked rules.
- Define what “near this ZIP” means for the first version.
- Propose a small first manual real-data experiment.
- Identify future automation paths.
- Update `tasks/work.md` with a brief note.

Explicitly forbidden:

- No database.
- No Prisma.
- No migrations.
- No auth.
- No user accounts.
- No backend API routes.
- No scraping code.
- No external fetch code.
- No enrichment implementation.
- No provider/API integration.
- No saved leads persistence.
- No dashboard.
- No new dependencies.
- No app source-code changes unless required only to fix documentation links, and ask first.
- Do not run terminal commands.

## Data ownership rule

Keep this distinction clear:

Global/shared data:

- ZIP research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Private/user-specific data:

- saved leads
- notes
- statuses
- tasks
- reminders
- recent searches

This task is about global/shared prospect data only.

Do not design private saved-lead persistence yet.

## Required sections for `docs/planning/03-data-fetching-plan.md`

Include these sections:

1. Purpose
2. Current state
3. Real-data objective
4. Prospect record fields
5. Source types and source-quality levels
6. Confidence scoring
7. ZIP and geographic matching rules
8. Duplicate handling
9. Freshness and last-checked rules
10. Manual first-pass workflow
11. Future automation options
12. Risks and constraints
13. What must be true before database persistence
14. Explicit non-goals for now

## Recommended first real-data experiment

Define a small manual experiment such as:

- choose one ZIP code, likely `19103`
- manually identify 5–10 real small/boutique law firm prospects
- record source URLs
- record confidence level
- record last checked date
- compare fields against the existing `Prospect` type
- decide what type changes will be needed later

Do not add those records to the app in this task unless the human explicitly asks for a separate follow-up task.

## Human-run verification commands

No commands are required for a docs-only task.

If the human wants to check the repo afterward, recommend:

```bash
git status
git diff
```

If everything is good, the human may commit with:

```bash
git add docs/planning/03-data-fetching-plan.md tasks/work.md
git commit -m "Create real data acquisition plan"
git push
```

## Acceptance criteria

This task is complete when:

- `docs/planning/03-data-fetching-plan.md` exists or is updated.
- The plan clearly defines the first real-data acquisition approach.
- The plan does not jump straight to implementation.
- The plan separates global prospect data from private user data.
- The plan identifies the smallest safe first real-data experiment.
- The plan names risks around source quality, freshness, duplicates, rate limits, cost, and terms of use.
- No database/auth/API/scraping/fetching/dependency/app-code work was added.
- `tasks/work.md` is updated.

## Final report required from coding agent

When finished, report:

1. Files changed.
2. Summary of the real-data plan.
3. Proposed first manual real-data experiment.
4. Key risks identified.
5. Confirmation that no implementation/database/auth/API/scraping/dependency/app-code work was added.
6. Suggested human review steps.
```

---

## 16. BGlad Role Going Forward

BGlad should continue acting as:

- product/technical planning partner
- scope-control reviewer
- coding-agent handoff writer
- coding-agent final-report reviewer
- risk checker
- migration/data-loss guardrail
- testing/process coach
- plain-English explainer
- product-owner support

BGlad is not the coding agent.

BGlad should not try to directly build the app unless the user specifically asks for markdown handoffs, review materials, or project documentation.

---

## 17. Watchouts for Future Sessions

### Watch for command-control drift

If an agent says it ran commands, clarify whether those were:

- actual terminal commands, or
- file-browser/view/edit actions inside the coding tool

Terminal commands remain human-only.

### Watch for unreported changed files

If the agent activity log says it edited files that are not in the final report, ask for clarification before commit.

### Watch for “database first” drift

The agent recently suggested:

```text
Phase 5: Clean Database Foundation
```

Do not accept that as the next step.

Correct next step:

```text
Phase 3: Real Data Acquisition Plan
```

Database planning comes after the data acquisition plan is clear.

### Watch for design scope creep

Phrases like:

```text
premium
beautiful
advanced
dashboard
production-ready
```

should be narrowed to:

```text
simple
readable
public MVP
controlled
honest
```

### Watch for early persistence

Saved leads, recent ZIPs, notes, and statuses are private user-workflow data.

They should not be persisted until auth/data ownership/database plans are ready.

### Watch for real-data shortcuts

Do not let the agent jump straight into scraping or external API usage.

First define:

- source
- terms/risk
- output fields
- confidence
- duplicate handling
- freshness
- save/overwrite behavior

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

The user likes to discuss “why” in plain English, especially around:

- TDD
- what should be tested
- what should be manual
- what is scope creep
- when to spawn a new agent
- whether to approve an agent plan
- whether an agent’s report is trustworthy
- how to split human tasks from coding-agent tasks

---

## 19. Current Best Summary

The project has moved from:

```text
planning docs only
```

to:

```text
a deployed public MVP shell for ZIP-code legal prospect search
```

The site is live at:

```text
https://legal-prospect.vercel.app
```

What exists:

```text
A public Next.js app where a user can search a postal ZIP code and see manually curated sample law firm prospects.
```

What comes next:

```text
Create the real data acquisition plan.
```

The next phase should answer:

```text
How do we find real law firm prospects by ZIP code, verify them, source them, structure them, and prepare for storage later?
```

Do not jump straight to Prisma, database, auth, scraping, or saved-lead persistence.

Most likely next safe task:

```text
Create real data acquisition plan for ZIP-code law firm prospecting.
```