# START-HERE

This is the starting point for the legal prospecting app rebuild.

Read this file before changing code, adding features, running commands, changing the database, adding auth, or adding external data-fetching logic.

---

## Project Summary

This project is a controlled rebuild of a legal prospecting web app.

The app helps sales reps find small and boutique law firm prospects by ZIP code.

Core user flow:

1. User searches a ZIP code.
2. App returns law firm prospects.
3. User reviews useful prospect details.
4. User saves good leads.
5. User returns to a private dashboard.

The product idea is not being restarted.

The repo and process are being restarted.

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```

---

## Why This Rebuild Exists

The previous app made real progress, especially around ZIP search and enrichment.

But the process became too hard to control.

Problems included:

- too much coding-agent autonomy
- unclear command boundaries
- Prisma migration drift
- confusing auth/account work
- unclear data-fetching prompts and passes
- AI running commands/tests without the human fully understanding them
- feature work getting mixed together
- long debugging loops around Clerk and Recent ZIP behavior

This rebuild exists to fix the process before rebuilding the product.

The goal is not speed at all costs.

The goal is controlled, understandable progress.

---

## Product Direction

The product is a prospecting tool for sales reps who sell legal software or legal-adjacent services to small and boutique law firms.

The long-term vision is a legal prospecting database by ZIP code.

Potential prospect fields:

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

The first version should stay much smaller than the long-term vision.

---

## Data Ownership Rule

The product must preserve a clear split between shared research data and private user workflow data.

Global/shared data:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Private/user-specific data:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

This rule should guide database design, API design, auth design, and UI behavior.

---

## Current Build Philosophy

Start with project control before product features.

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

Do not start with:

- auth
- scraping
- enrichment
- dashboard complexity
- Recent ZIP behavior
- saved leads
- external API integrations

Those features come later, after the foundation is controlled.

---

## Required Control Files

These files control how the project is worked on:

```text
AGENTS.md
task/current-task.md
task/work.md
task/decisions.md
```

### `AGENTS.md`

Defines how coding agents are allowed to behave.

It includes:

- command rules
- database rules
- testing rules
- auth rules
- data-fetching rules
- stop conditions
- final report rules
- one-task-per-session rule

The coding agent must follow this file.

### `task/current-task.md`

Defines the one task the coding agent is allowed to work on.

If a request is not in this file, the coding agent should stop and ask for the task file to be updated.

### `task/work.md`

Tracks what happened during each task.

Every coding-agent session should add a work log entry.

### `task/decisions.md`

Records important product, technical, and process decisions.

Do not delete old decisions.

If a decision changes, add a new entry explaining the change.

---

## Planning Docs

The `docs/` folder should contain:

```text
docs/START-HERE.md
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
```

Recommended reading order:

1. `docs/START-HERE.md`
2. `AGENTS.md`
3. `task/current-task.md`
4. `task/work.md`
5. `task/decisions.md`
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

---

## Human-Controlled Commands

The human user runs commands.

The coding agent may suggest commands and explain what they do.

The coding agent should not run development, test, build, database, or destructive git commands by default.

Do not run these commands unless the human explicitly asks:

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

Only the human starts the dev server.

```bash
npm run dev
```

---

## Testing Philosophy

Testing should be understandable to the human user.

The coding agent should explain:

1. which test or check to run
2. why it matters
3. what passing means
4. what failing might mean

Important distinctions:

```text
TypeScript passing means the project compiles.
It does not prove the app works.

Unit tests passing means tested behavior passed.
It does not prove untested flows work.

Manual browser verification proves visible user flows.
It does not replace automated tests.
```

---

## Auth Direction

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

Do not add:

- passwords
- OAuth
- teams
- organizations
- billing
- enterprise auth

Auth is not the first task.

Auth should come after:

1. project docs
2. app shell
3. clean database foundation
4. seed data or core local data model

---

## Data Fetching Direction

Start with manual seed data before external fetching.

No scraping, enrichment, API provider, browser automation, prompt pass, search pass, or source logic should be added until documented in:

```text
docs/03-data-fetching-plan.md
```

Every data-fetching pass must document:

1. trigger
2. input
3. source
4. exact prompt, query, or API request
5. pass number
6. output fields
7. confidence and source quality
8. save behavior
9. overwrite behavior
10. cost and rate-limit risk

The coding agent must not silently add enrichment logic.

---

## Database Direction

Database work should be planned before implementation.

Do not casually create, edit, reset, push, or migrate the database.

Before any database work, explain:

- what schema change is being made
- whether it creates a migration
- whether existing data could be affected
- what command the human should run
- how to verify the result

Never use destructive database commands to “fix” drift.

Database planning belongs in:

```text
docs/05-database-plan.md
```

---

## How Future Coding-Agent Sessions Should Work

Each coding-agent session should follow this pattern:

1. Read `AGENTS.md`.
2. Read `task/current-task.md`.
3. Confirm the requested work matches the current task.
4. Make only the allowed changes.
5. Do not run restricted commands.
6. Update `task/work.md`.
7. Report files changed, risks, suggested commands, and next step.

The coding agent is an assistant, not the project owner.

The human user owns scope, commands, and final approval.

---

## Current Status

The project is in the setup and planning phase.

The first goal is to complete useful markdown docs before starting feature work.

The next docs to fill are:

```text
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

Do not begin product features until the relevant planning docs exist.

---

## Next Recommended Step

After this file is saved, fill in:

```text
docs/00-product-brief.md
```

That file should define the product, user, problem, MVP direction, and high-level success criteria.