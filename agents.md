# AGENTS.md

## Project Operating Rules

This project is an owner-controlled rebuild of a legal prospecting web app.

The coding agent is an assistant, not the project owner.

The human user controls:

- project direction
- scope
- command execution
- database changes
- external service decisions
- authentication decisions
- final approval of all work

The coding agent must work in small, safe increments and must not expand scope without permission.

---

## Core Product Context

This app helps sales reps find small and boutique law firm prospects by ZIP code.

Long-term product direction:

1. Search a ZIP code.
2. Return law firm prospects.
3. Show useful prospect details.
4. Let the user save good leads.
5. Let the user return to a private dashboard.

Important data model principle:

```text
Global research data can be shared.
User workflow data must be private.
```

Global/shared data may include:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Private/user-specific data may include:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

---

## One Task Per Session

The coding agent must complete only one clearly defined task per session.

Do not combine unrelated work.

Examples of separate tasks:

- create project docs
- create app shell
- add Prisma
- add seed data
- add auth
- add saved leads
- add recent ZIPs
- add data fetching

If a requested change is outside the current task, stop and ask the user to update `task/current-task.md`.

---

## Current Task Rule

The coding agent must read and follow:

```text
task/current-task.md
```

before making changes.

If `task/current-task.md` does not exist, the coding agent may help create it.

If the requested work is not listed in `task/current-task.md`, the coding agent must not perform that work.

The coding agent may suggest a next task, but must not begin it.

---

## Required Work Log

The coding agent must update:

```text
task/work.md
```

during or after every task.

Each work log entry must include:

- date
- task name
- files changed
- what changed
- why it changed
- commands suggested
- commands run by the human
- test results pasted by the human
- known risks
- next recommended step

The work log is required so the human user can keep control of the project history.

---

## Human-Controlled Commands

The coding agent must not run development, test, build, database, or destructive git commands by default.

The coding agent may suggest commands, explain what they do, and explain how to interpret the result.

The human user runs commands and pastes results back when help is needed.

Do not run these commands unless the user explicitly asks:

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

---

## Absolutely Forbidden Commands

The coding agent must never run these commands:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

These commands may cause data loss, destroy local work, or hide project history.

If a database reset or destructive cleanup seems necessary, the coding agent must explain the issue in plain English and ask the human user to decide.

---

## Dev Server Rule

The coding agent must never run:

```bash
npm run dev
```

Only the human user starts or stops the dev server.

If browser verification is needed, the coding agent must tell the user:

1. what page to open
2. what to click
3. what result to expect
4. what error or behavior to paste back

---

## Testing Rule

The coding agent must not run tests by default.

Instead, the coding agent must explain:

1. which tests to run
2. why those tests matter
3. what passing means
4. what failing might mean

The human user runs the command and pastes back the result.

Important testing distinctions:

```text
TypeScript passing means the project compiles.
It does not prove the app works.

Unit tests passing means tested behavior passed.
It does not prove untested flows work.

Manual browser verification proves visible user flows.
It does not replace automated tests.
```

---

## Database Rule

Database work must be handled carefully from day one.

The coding agent must not create, edit, reset, push, or migrate the database casually.

Before any Prisma or database change, the coding agent must explain:

- what schema change is being made
- whether it creates a migration
- whether existing data could be affected
- what command the human should run
- how to verify the result

The coding agent must never use destructive database commands to "fix" migration drift.

No database work should begin until the relevant task is clearly defined in `task/current-task.md`.

---

## Data Fetching Rule

No scraping, enrichment, API provider, browser automation, prompt pass, search pass, or external data-fetching logic may be added until documented in:

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

Initial rebuild preference:

```text
Start with manual seed data before any external fetching.
```

The coding agent must not silently add enrichment logic.

---

## Auth Rule

Do not add Clerk unless the human user explicitly changes direction.

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

Auth is not the first rebuild task.

Auth should come after:

1. project docs
2. basic app shell
3. database foundation
4. seed data or core local data model

---

## Scope Guardrails

Do not rush into:

- auth
- Prisma migrations
- enrichment
- scraping
- dashboard complexity
- recent ZIP behavior
- saved leads
- external APIs
- billing
- teams
- organizations

Build the project in controlled layers.

Recommended rebuild order:

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

---

## File and Folder Expectations

The project should include:

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

The coding agent should help fill these files one at a time.

---

## Dependency Rule

Before adding a package, the coding agent must explain:

- why the package is needed
- what problem it solves
- whether the app can avoid it for now
- whether it affects security, auth, data fetching, or database behavior

Avoid unnecessary dependencies.

Use boring, understandable technology unless there is a clear reason not to.

---

## Final Report Rule

At the end of every task, the coding agent must provide a final report with:

- summary of changes
- files changed
- commands the human should run
- expected results
- manual verification steps
- risks or follow-up notes
- suggested next task

The coding agent must not claim something works unless it was verified by the human or by an explicitly approved command.

---

## Plain-English Rule

The coding agent must explain important technical decisions in plain English.

Good explanations include:

- what changed
- why it matters
- what could go wrong
- how the human can verify it

Avoid vague language like:

```text
I improved the architecture.
I cleaned things up.
I optimized the flow.
```

Prefer specific language like:

```text
I added a required work log so every coding-agent session leaves a record of changed files, suggested commands, and known risks.
```

---

## Stop Conditions

The coding agent must stop and ask for direction if:

- the task is not in `task/current-task.md`
- the change requires a destructive command
- a database reset seems necessary
- auth scope expands
- data-fetching scope expands
- a test/build/dev command seems necessary but the user has not approved it
- requirements conflict with these rules
- the agent is unsure whether work would cause data loss

---

## Project Mindset

This rebuild is not a restart of the product thinking.

It is a restart of the repo and process.

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```