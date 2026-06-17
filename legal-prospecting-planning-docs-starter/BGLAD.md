# BGlad Continuation Handoff — Planning Docs Complete, Ready for First Build Task

**Date:** 2026-06-16  
**Purpose:** Handoff for the next BGlad session so the project can move from planning/control docs into the first small implementation task without losing scope control.

---

## 1. Current Status

The user has created the planned repo folders and files.

The initial planning/control documentation set has been filled in.

This means the project is now ready to prepare the first coding-agent task, but it is **not** ready for a giant full-stack build.

The correct next step is still small and controlled.

Current phase:

```text
Phase 0 complete / nearly complete: Control and Planning
Next phase: Phase 1: Basic App Shell
```

---

## 2. Current File Structure

The repo should now have this structure:

```text
/
├── AGENTS.md
├── README.md
├── task/
│   ├── current-task.md
│   ├── work.md
│   └── decisions.md
├── docs/
│   ├── START-HERE.md
│   ├── 00-product-brief.md
│   ├── 01-product-scope.md
│   ├── 02-user-stories.md
│   ├── 03-data-fetching-plan.md
│   ├── 04-auth-account-plan.md
│   ├── 05-database-plan.md
│   ├── 06-api-contracts.md
│   ├── 07-testing-guide.md
│   ├── 08-coding-agent-rules.md
│   └── 09-roadmap.md
```

---

## 3. What Has Been Completed

The following files have been prepared:

1. `AGENTS.md`
2. `task/current-task.md`
3. `task/work.md`
4. `task/decisions.md`
5. `docs/START-HERE.md`
6. `docs/00-product-brief.md`
7. `docs/01-product-scope.md`
8. `docs/02-user-stories.md`
9. `docs/03-data-fetching-plan.md`
10. `docs/04-auth-account-plan.md`
11. `docs/05-database-plan.md`
12. `docs/06-api-contracts.md`
13. `docs/07-testing-guide.md`
14. `docs/08-coding-agent-rules.md`
15. `docs/09-roadmap.md`
16. `README.md`

These docs establish:

- coding-agent boundaries
- human-controlled command rules
- one-task-per-session process
- work log process
- decision log process
- data-fetching controls
- delayed auth direction
- safe database direction
- API route planning
- testing philosophy
- roadmap sequence

---

## 4. Core Project Reminder

The app helps sales reps find small and boutique law firm prospects by ZIP code.

Core product flow:

```text
User searches ZIP code.
App returns law firm prospects.
User reviews useful prospect details.
User later saves good leads.
User later returns to a private dashboard.
```

Long-term idea:

```text
A legal prospecting database organized around ZIP code research.
```

But the first build should stay smaller:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

---

## 5. Critical Rebuild Principle

This is not a product reset.

This is a controlled repo/process rebuild.

Use this framing:

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```

The previous app had value, but the process became too messy.

The user is trying to regain control.

---

## 6. BGlad Role Going Forward

BGlad is not the coding agent.

BGlad should continue acting as:

- product/technical planning partner
- scope-control reviewer
- coding-agent handoff writer
- risk checker
- migration/data-loss guardrail
- testing/process coach
- plain-English explainer
- product-owner support

The user may bring BGlad:

- coding-agent plans
- coding-agent final reports
- errors
- app architecture questions
- task/current-task updates
- implementation proposals
- testing results

BGlad should help decide what to do next and produce clean markdown handoffs.

---

## 7. User Working Style

The user prefers:

- direct practical recommendations
- markdown handoffs
- downloadable `.md` files when useful
- one feature per coding-agent session
- small safe increments
- no overengineering
- no vague abstractions
- honest risk notes
- bootcamp-friendly explanations
- enough context to understand product-owner decisions

Important process shift:

```text
Old way:
AI runs, tests, fixes, runs again, and the user tries to catch up.

New way:
AI proposes and edits only inside scope.
The user runs commands.
The user reads results.
AI helps interpret when asked.
```

---

## 8. Guardrails That Must Continue

### Human-Controlled Commands

The coding agent should not run these by default:

```bash
npm run dev
npm run build
npm run test
npm run test:run
npx tsc --noEmit
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push
npx prisma db push --accept-data-loss
npx prisma migrate reset
git commit
git push
git reset
git clean
```

Absolutely forbidden:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

Only the human starts the dev server:

```bash
npm run dev
```

---

## 9. Do Not Rush Into These

Do not recommend starting with:

- Clerk
- auth
- Prisma
- migrations
- seed database
- saved leads
- recent ZIPs
- scraping
- enrichment
- external APIs
- dashboard complexity
- billing
- teams
- organizations

These are later phases.

---

## 10. Current Data Direction

Current approved data approach:

```text
Manual seed data only.
```

No external data fetching is approved yet.

Before any fetching/enrichment/scraping/provider/prompt pass is implemented, it must be documented in:

```text
docs/03-data-fetching-plan.md
```

Every future fetching pass must define:

1. trigger
2. input
3. source
4. exact prompt, query, or API request
5. pass number
6. output fields
7. confidence/source quality
8. save behavior
9. overwrite behavior
10. cost/rate-limit risk

---

## 11. Current Auth Direction

Auth is delayed.

Do not use Clerk unless the user explicitly changes direction.

Preferred later auth model:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

No passwords.

No OAuth.

No teams.

No organizations.

No billing.

No enterprise auth.

---

## 12. Data Ownership Rule

This remains central:

```text
Global research data can be shared.
User workflow data must be private.
```

Global/shared:

- ZIP code research
- firm records
- attorney records
- practice areas
- data source records
- cached ZIP results

Private/user-specific:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Do not let the coding agent blur this line.

---

## 13. Next Recommended Step

The next practical step is to prepare the first coding-agent implementation task:

```text
Create a basic app shell with a home/search page placeholder.
```

This should be done by updating:

```text
task/current-task.md
```

The task should explicitly allow:

- basic app shell
- home page or search page placeholder
- simple readable layout
- product purpose copy
- ZIP search placeholder/input if safe
- no unnecessary navigation

The task should explicitly forbid:

- auth
- Clerk
- Prisma
- database work
- migrations
- seed data unless explicitly included
- saved leads
- recent ZIPs
- scraping
- enrichment
- external API calls
- dashboard complexity
- running dev server
- running tests unless the human chooses

---

## 14. Suggested BGlad Response If User Says “Let’s Start Building”

BG should respond:

```text
Good. The planning/control docs are in place, so the next safe move is the first app-shell task.

We should update task/current-task.md to allow only:

- create a basic app shell
- add a home/search page placeholder
- add simple product copy
- keep layout plain and readable

And explicitly forbid:

- auth
- Prisma/database
- seed data
- saved leads
- recent ZIPs
- external fetching
- dashboard complexity

After that, you can hand the task to the coding agent.
```

Then BG should generate a clean downloadable `current-task.md` for the app-shell task.

---

## 15. Suggested Next `task/current-task.md` Content

Use this as the next task file when the user is ready to start coding.

```md
# Current Task

## Task Name

Create basic app shell with home/search page placeholder.

## Task Status

Ready for coding-agent work.

## Purpose

Create the first visible app structure without adding product complexity.

This task should give the project a simple starting page for the legal prospecting workflow.

The goal is not to build search yet.

The goal is to create a clean shell where the future ZIP search flow will live.

---

## Allowed Scope

The coding agent may:

- create or update the basic app shell
- create a home page or search page placeholder
- add simple product-purpose copy
- add a ZIP search placeholder or non-functional input if appropriate
- add simple readable layout
- add basic empty/placeholder state
- keep the UI plain and understandable
- update `task/work.md`

---

## Explicitly Out of Scope

Do not add auth.

Do not add Clerk.

Do not add Prisma.

Do not add database models.

Do not add migrations.

Do not add seed data.

Do not add saved leads.

Do not add recent ZIPs.

Do not add scraping.

Do not add enrichment.

Do not add external API calls.

Do not add AI research passes.

Do not add dashboard complexity.

Do not add billing, teams, organizations, or permissions.

Do not install dependencies unless the human explicitly approves.

Do not run the dev server.

Do not run tests or build commands unless the human explicitly asks.

---

## Expected Result

At the end of this task:

1. The app has a visible home/search starting page.
2. The page explains the product purpose.
3. The page has a clear placeholder for ZIP search.
4. No real search behavior is required yet.
5. No auth has been added.
6. No database work has been done.
7. No external data fetching has been added.
8. `task/work.md` has a new entry for this task.

---

## Human Verification Steps

The human should run the dev server if they choose:

```bash
npm run dev
```

The human should then verify:

1. The app loads.
2. The home/search page is visible.
3. The page is readable.
4. The page clearly points toward ZIP-based law firm prospecting.
5. No sign-in is required.
6. No real data/search behavior is expected yet.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what changed
- why it changed
- commands suggested
- commands run by the human, if any
- manual verification steps
- known risks
- next recommended task

The coding agent must not claim the app works unless the human verifies it or approved commands are run.

---

## Next Recommended Task After This

After this task is complete, the next likely task is:

```text
Add manual seed prospect data for one test ZIP code.
```

Do not begin that task until the human updates `task/current-task.md`.
```

---

## 16. Risk Note for BGlad

The next risk is accidentally turning “app shell” into a bigger first build.

Watch for coding-agent plans that sneak in:

- database setup
- Prisma
- auth
- seed data
- search logic
- saved leads
- recent ZIPs
- dashboard components
- external providers
- dependency installs

Push back and narrow the task.

The next session should be boring on purpose.

---

## 17. Best Summary

The project has moved from:

```text
Prepare control docs.
```

to:

```text
Prepare the first small coding-agent task.
```

The next coding-agent task should be:

```text
Basic app shell only.
```

Not:

```text
Build the MVP.
```