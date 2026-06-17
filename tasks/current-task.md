# Current Task: Create Prisma + Neon database planning document

## Status

Ready for coding agent.

## Goal

Create a practical database planning document for the Legal Prospector app using the preferred learning/MVP stack:

- Neon Postgres for the SQL database
- Prisma as the ORM and schema modeling layer

This is a planning/documentation task only.

The goal is to define the future database shape, ownership boundaries, and sequencing before any database implementation begins.

Do not install Prisma, create a Prisma schema, connect to Neon, create migrations, add environment variables, add API routes, or implement persistence in this task.

## Current project state

The app is publicly deployed at:

https://legal-prospect.vercel.app

Completed phases:

- Phase 0: Control and Planning
- Phase 1: Basic App Shell
- Phase 2: ZIP-code Prospect Search Shell
- Phase 2.5: First Public Deployment
- Phase 3: Real Data Acquisition Plan
- Phase 3.1: Prospect Data Model Gap Analysis
- Phase 3.2: Frontend Prospect Model Alignment

The current app supports:

- ZIP-code prospect search against manually curated sample data
- ZIP+4 normalization
- validation and empty states
- prospect result cards
- expandable/collapsible prospect details
- browser-session save/unsave UI
- accessible ProspectCard buttons
- public-facing copy and metadata
- frontend `Prospect` type aligned with planned real-data fields

The project still does not use a real database, API routes, auth, scraping, or persistence.

## Important stack decision

For the next database phase, assume this stack unless a later product or scaling need requires changing it:

```text
Database hosting: Neon Postgres
ORM/schema layer: Prisma
```

Reason:

```text
This is the stack the human is currently learning and wants to use for the MVP database phase.
```

Important:

- Treat Prisma + Neon as the chosen MVP/learning stack.
- Do not frame it as the permanent final architecture forever.
- Note that the stack can be revisited later if scale, cost, performance, or product needs require it.

## Product objective

The real product objective remains:

A user or sales rep enters a postal ZIP code, and the site finds real small/boutique law firm prospects in or near that ZIP.

Eventually, users should be able to save and work leads, but private user workflow persistence must wait until auth and ownership are designed.

## Files to review first

Review these files before writing:

```text
docs/planning/03-data-fetching-plan.md
docs/planning/12-prospect-data-model-gap-analysis.md
docs/planning/09-roadmap.md
docs/planning/08-coding-agent-rules.md
src/types/prospect.ts
src/data/prospects.ts
tasks/work.md
```

Also check whether this file already exists:

```text
docs/planning/05-database-plan.md
```

If it exists, update it. If it does not exist, create it.

## Scope

Allowed:

- Create or update `docs/planning/05-database-plan.md`.
- Document Neon Postgres + Prisma as the preferred MVP/learning database stack.
- Define planned database entities at a conceptual level.
- Separate global/shared prospect data from private/user-specific data.
- Propose table/model boundaries.
- Identify what should be implemented first later.
- Identify what should be deferred.
- Identify environment variable needs conceptually, without adding them.
- Identify migration and data-loss safety rules conceptually.
- Update `docs/planning/09-roadmap.md` only if a small roadmap note is needed.
- Update `tasks/work.md` with a brief task note.

Explicitly forbidden:

- No `schema.prisma` changes.
- No Prisma install.
- No package installation.
- No migrations.
- No Neon connection setup.
- No database URL or environment variable creation.
- No `.env` edits.
- No API routes.
- No auth.
- No user accounts.
- No saved-lead persistence.
- No scraping code.
- No external fetching code.
- No app behavior changes.
- No new dependencies.
- Do not run terminal commands.

## Important command rule

Do not run terminal commands.

This includes, but is not limited to:

```bash
npm install
npx prisma init
npx prisma migrate dev
npx prisma db push
npm run test
npm run build
npm run dev
git status
git diff
git add
git commit
git push
```

You may recommend commands only under:

```text
Commands for human to run
```

The human runs all commands.

## Absolutely forbidden commands

Do not suggest or run these unless the human explicitly requests a future emergency/destructive workflow:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

If a future task involves force pushing, prefer:

```bash
git push --force-with-lease
```

Only after the human confirms it is safe.

## Data ownership rule

Keep this distinction central.

Global/shared data:

- ZIP research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results
- source URLs
- source type
- confidence level
- verification status
- last checked date

Private/user-specific data:

- saved leads
- user notes
- user-specific statuses
- tasks
- reminders
- recent searches
- follow-up workflow state
- ownership of a lead by a user or team

This task should plan both categories, but it must clearly mark private/user-specific persistence as a later phase that depends on auth/user ownership design.

## Required sections for `docs/planning/05-database-plan.md`

Include these sections:

1. Purpose
2. Current state
3. Chosen MVP database stack
4. Why Neon Postgres + Prisma for now
5. What can be revisited later
6. Data ownership boundaries
7. Planned global/shared models
8. Planned private/user-specific models
9. Suggested first database slice
10. Fields to defer
11. Conceptual Prisma model sketch
12. Environment variables and secrets plan
13. Migration safety rules
14. Data-loss guardrails
15. Local development and human-run commands, conceptual only
16. Risks and constraints
17. Explicit non-goals for now
18. Suggested follow-up tasks

## Guidance for planned global/shared models

At a conceptual level, consider models such as:

```text
Firm
Attorney
PracticeArea
FirmPracticeArea
FirmAttorney
DataSource
ZipArea
ZipSearchCache
```

Do not overbuild. If a simpler MVP shape is better, explain why.

The most important global model is the future law firm/prospect record.

## Guidance for private/user-specific models

At a conceptual level, future private models may include:

```text
User
SavedLead
LeadNote
LeadStatus
Task
Reminder
RecentSearch
```

However:

- Do not design full auth yet.
- Do not implement private persistence yet.
- Mark these as future/private models requiring auth and ownership decisions.

## Suggested first database slice

Recommend the smallest safe future implementation slice.

Preferred direction:

```text
First future DB slice should store global/shared firm prospect records only.
```

It should not include private saved leads yet.

The first slice should likely support:

- creating/storing firm records
- ZIP-based firm lookup
- source metadata
- confidence level
- verification status
- last checked date

Do not implement it in this task.

## Conceptual Prisma model sketch

The document may include Prisma-like pseudocode, but it must be clearly labeled:

```text
Planning-only sketch. Do not implement in this task.
```

The sketch should be intentionally small and understandable.

Avoid writing a production-ready `schema.prisma`.

## Environment variables and secrets plan

Document expected future environment variables conceptually, such as:

```text
DATABASE_URL
DIRECT_URL
```

Important:

- Do not add real values.
- Do not edit `.env`.
- Do not create `.env.example` unless explicitly requested in a separate future task.
- Explain that secrets must not be committed.

## Migration safety rules

Include clear rules:

- Prefer reviewed migrations over blind database pushes.
- Never use destructive migration commands casually.
- Never run data-loss commands without explicit human confirmation.
- In this project, the human runs all database commands.
- Production database changes require extra review.

## Roadmap note

If updating `docs/planning/09-roadmap.md`, keep it small.

Suggested note:

```text
Future database phase assumes Neon Postgres + Prisma for the MVP/learning stack, subject to later review if product or scaling needs change.
```

Do not make roadmap changes broad or speculative.

## Human-run verification commands

No commands are required for a docs-only task.

If the human wants to check the repo afterward, recommend:

```bash
git status
git diff
```

If everything is good, the human may commit with:

```bash
git add docs/planning/05-database-plan.md docs/planning/09-roadmap.md tasks/work.md
git commit -m "Document Prisma and Neon database plan"
git push
```

Adjust the `git add` command if `docs/planning/09-roadmap.md` was not changed.

Only the human should run these commands.

## Acceptance criteria

This task is complete when:

- `docs/planning/05-database-plan.md` exists or is updated.
- The document identifies Neon Postgres + Prisma as the preferred MVP/learning database stack.
- The document clearly states this stack can be revisited later.
- The document separates global/shared data from private/user-specific data.
- The document recommends the first future database slice as global/shared firm prospect records only.
- The document defers saved leads, notes, statuses, tasks, reminders, recent searches, and other private workflow data until auth/user ownership is designed.
- The document includes migration and data-loss safety rules.
- The document does not implement Prisma, Neon, migrations, API routes, auth, persistence, scraping, fetching, app behavior changes, dependencies, or environment variable changes.
- `tasks/work.md` is updated.
- No terminal commands were run.

## Final report required from coding agent

When finished, report:

1. Files changed.
2. Summary of the database plan.
3. How Neon Postgres + Prisma were documented.
4. What is recommended for the first future database slice.
5. What private/user-specific data was deferred.
6. Key migration/data-loss guardrails.
7. Confirmation that no Prisma setup, Neon connection, migrations, API routes, auth, persistence, dependencies, `.env` changes, or app behavior changes were added.
8. Confirmation that no terminal commands were run.
9. Commands for the human to run.
10. Suggested human review steps.