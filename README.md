# Legal Prospecting App

## Project Summary

This is a controlled rebuild of a legal prospecting web app.

The app helps sales reps find small and boutique law firm prospects by ZIP code.

The long-term product direction is a legal prospecting database organized around local ZIP code research.

The first useful product flow is:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

---

## Rebuild Principle

This repo is a restart of the codebase and process, not a restart of the product thinking.

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```

The previous version of the app made real progress, but the process became too hard to control.

This rebuild starts with documentation, task boundaries, command rules, and clear scope before feature work.

---

## Target User

Primary user:

```text
A sales rep who sells legal software or legal-adjacent services to small and boutique law firms.
```

The user wants to quickly find law firm prospects in a specific ZIP code and decide which firms are worth saving or researching further.

---

## Core Product Direction

The app should eventually help the user:

1. Search a ZIP code.
2. See law firm prospects.
3. Review useful prospect details.
4. Save good leads.
5. Return to a private dashboard.

Potential future prospect fields:

- firm name
- website
- phone
- email
- address
- attorneys
- practice areas
- website health indicators
- contact completeness
- source metadata
- confidence metadata

The first version should stay smaller than this long-term vision.

---

## Current Phase

Current phase:

```text
First MVP Deployment Ready
```

The application has been scaffolded and the client-side interactive search flow against sample seed data has been completed. The app is polished, validated, and prepared for its first public deployment.

---

## Required Reading

Before changing code, adding features, running commands, changing the database, adding auth, or adding external data fetching, read these files:

```text
docs/START-HERE.md
AGENTS.md
task/current-task.md
task/work.md
task/decisions.md
```

Recommended full reading order:

```text
docs/START-HERE.md
AGENTS.md
task/current-task.md
task/work.md
task/decisions.md
docs/00-product-brief.md
docs/01-product-scope.md
docs/02-user-stories.md
docs/03-data-fetching-plan.md
docs/04-auth-account-plan.md
docs/05-database-plan.md
docs/06-api-contracts.md
docs/07-testing-guide.md
docs/08-coding-agent-rules.md
docs/09-roadmap.md
README.md
```

---

## Project Control Files

### `AGENTS.md`

Defines how coding agents are allowed to behave.

This includes:

- one task per session
- human-controlled commands
- testing rules
- database rules
- auth rules
- data-fetching rules
- stop conditions
- final report requirements

### `task/current-task.md`

Defines the one task the coding agent is allowed to work on.

If a requested change is not listed here, the coding agent should stop and ask for the task file to be updated.

### `task/work.md`

Tracks every coding-agent task.

Each entry should explain:

- what changed
- why it changed
- files created or changed
- commands suggested
- commands run by the human
- results pasted by the human
- known risks
- next recommended step

### `task/decisions.md`

Records important product, technical, and process decisions.

Do not delete old decisions.

If a decision changes, add a new decision entry.

---

## Documentation Map

### `docs/START-HERE.md`

Project entry point.

Explains the rebuild context, product direction, data ownership rule, and safe working process.

### `docs/00-product-brief.md`

Defines the product concept, target user, problem, MVP direction, and early success criteria.

### `docs/01-product-scope.md`

Defines what is in scope and out of scope for the controlled rebuild.

Helps prevent feature creep.

### `docs/02-user-stories.md`

Turns the scope into user stories and acceptance criteria.

Future coding tasks should map back to these stories.

### `docs/03-data-fetching-plan.md`

Controls all scraping, enrichment, APIs, browser automation, prompt passes, and external data behavior.

Current approved approach:

```text
Manual seed data only.
```

### `docs/04-auth-account-plan.md`

Defines the delayed auth direction.

Current auth decision:

```text
Do not use Clerk by default.
Prefer custom email-code auth later.
Delay auth until the app foundation is stable.
```

### `docs/05-database-plan.md`

Defines safe database direction and the global/private data split.

Important rule:

```text
Global research data can be shared.
User workflow data must be private.
```

### `docs/06-api-contracts.md`

Defines planned API shapes before routes are built.

Keeps API behavior predictable and scoped.

### `docs/07-testing-guide.md`

Explains how the human should run and interpret checks.

Important testing distinction:

```text
TypeScript passing means the project compiles.
It does not prove the app works.

Unit tests passing means tested behavior passed.
It does not prove untested flows work.

Manual browser verification proves visible user flows.
It does not replace automated tests.
```

### `docs/08-coding-agent-rules.md`

Expanded rules for future coding-agent sessions.

### `docs/09-roadmap.md`

Defines the safe rebuild sequence.

---

## Data Ownership Rule

This rule should guide database design, API design, auth design, and UI behavior.

```text
Global research data can be shared.
User workflow data must be private.
```

### Global / Shared Research Data

Examples:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

### Private / User Workflow Data

Examples:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

---

## Human-Controlled Commands

The human user runs commands.

The coding agent may suggest commands and explain them, but should not run development, test, build, database, or destructive git commands by default.

Do not run these unless the human explicitly approves:

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

Never run:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

Only the human starts or stops the dev server:

```bash
npm run dev
```

---

## Current Auth Direction

Auth is delayed.

Do not use Clerk unless the human explicitly changes direction.

Preferred future auth model:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

Do not add early:

- passwords
- OAuth
- teams
- organizations
- billing
- enterprise SSO

---

## Current Data Fetching Direction

External data fetching is delayed.

Current approved approach:

```text
Manual seed data only.
```

Do not add until documented and approved in `docs/03-data-fetching-plan.md`:

- scraping
- enrichment
- external APIs
- browser automation
- AI research passes
- background fetch jobs
- source ranking
- automated overwrites

---

## Current Database Direction

Database implementation is delayed until the app shell and planning docs are ready.

When database work begins, it should be small and safe.

Possible future direction:

```text
PostgreSQL
Prisma
minimal Firm model first
manual seed data
safe migrations only
```

Never use destructive database commands to fix migration drift.

---

## Recommended Rebuild Order

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

Do not start with:

- auth
- scraping
- enrichment
- dashboard complexity
- saved leads
- recent ZIPs

---

## Public Deployment

The client-side search MVP is ready for public deployment. Refer to [11-first-deploy-checklist.md](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/11-first-deploy-checklist.md) for step-by-step instructions on deploying the application to platforms like Vercel or Netlify.

---

## Coding-Agent Final Report Requirement

At the end of every coding-agent task, the coding agent must report:

- task completed
- summary of changes
- files created
- files changed
- commands suggested
- commands run by the human, if known
- manual verification steps
- known risks or skipped items
- next recommended task

The coding agent must also update:

```text
task/work.md
```

---

## Project Mindset

This project should be built in small, safe increments.

The human owns scope and commands.

The coding agent helps, but does not run the project.