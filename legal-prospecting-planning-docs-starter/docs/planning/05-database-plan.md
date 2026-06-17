# Database Plan

## Purpose

This document defines the database direction for the legal prospecting app rebuild.

The goal is to avoid Prisma drift, destructive database commands, unclear ownership, and accidental mixing of shared research data with private user workflow data.

No database work should begin until the relevant task is clearly listed in:

```text
task/current-task.md
```

---

## Current Database Status

Current status:

```text
Database implementation is not approved yet.
```

The project should first complete planning/control docs and the basic app shell.

Database work should come after the app shell is clear.

Do not add Prisma, migrations, seed scripts, or schema files until database work is the approved current task.

---

## Core Database Rule

Database work must be safe, planned, and human-visible.

Before any database change, the coding agent must explain:

- what schema change is being made
- why it is needed
- whether it creates a migration
- whether existing data could be affected
- what command the human should run
- how to verify the result
- what risks exist

The coding agent must not run database commands by default.

The human runs commands.

---

## Absolutely Forbidden Database Commands

Never run:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
```

These commands can destroy data or hide migration problems.

If the database gets into a bad state, stop and explain the issue in plain English.

Do not try to “fix” migration drift with destructive commands.

---

## Restricted Database Commands

Do not run these unless the human explicitly asks:

```bash
npx prisma migrate dev
npx prisma migrate deploy
npx prisma db push
```

The coding agent may suggest a command and explain what it does.

The human decides whether to run it.

---

## Database Philosophy

Use boring, understandable database design.

Prefer:

- clear tables
- explicit ownership
- simple relationships
- safe migrations
- seed data before external fetching
- source metadata before enrichment complexity

Avoid:

- premature multi-tenant architecture
- complex permission systems too early
- hidden global/user data mixing
- automated overwrites
- destructive migration shortcuts
- building schema for every future dream feature at once

---

## Global vs Private Data Split

This is the most important database rule.

```text
Global research data can be shared.
User workflow data must be private.
```

### Global / Shared Research Data

Global data may be visible to all approved users.

Examples:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Global data should not belong to one user.

### Private / User Workflow Data

Private data belongs to one user.

Examples:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Private data must always be scoped by user ID once auth exists.

---

## Initial Database Recommendation

Do not start with the full long-term schema.

Start with the smallest schema that supports the current task.

Recommended progression:

1. No database during pure planning.
2. App shell with no database.
3. Manual seed data, possibly as a simple file.
4. Add database only when the seed/search flow needs persistence.
5. Add user tables only when auth is ready.
6. Add saved leads only after auth/user ownership exists.
7. Add recent ZIPs only after user-specific behavior is stable.
8. Add external source/candidate tables only after data-fetching plan is approved.

---

## Seed Data Before Database Complexity

The first useful product flow can be proven with seed data.

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

This may not require a database immediately.

Acceptable early options:

- static TypeScript/JSON seed file
- simple local data module
- later seed script
- later database seed

The database should not be introduced just because it feels like a full-stack app should have one.

---

## Possible Future Tech Choice

Likely future stack:

```text
PostgreSQL
Prisma
```

This is a planning direction, not an implementation approval.

Before adding Prisma, confirm:

- package manager
- database provider
- local database setup
- migration strategy
- seed strategy
- environment variable names
- human-run commands
- rollback expectations
- no destructive reset behavior

---

## Future Environment Variables

Potential future environment variables:

```text
DATABASE_URL
DIRECT_URL
```

These are placeholders.

Actual names should be confirmed during the database setup task.

Do not commit real database credentials.

Use `.env.example` for placeholders only.

---

## Data Model Layers

The database should be designed in layers.

### Layer 1: Global Prospect Research

Supports basic searchable law firm data.

Possible future tables:

- `Firm`
- `Attorney`
- `PracticeArea`
- `FirmPracticeArea`
- `FirmAttorney`
- `ZipCode`
- `FirmLocation`
- `DataSource`

### Layer 2: Private User Workflow

Supports private user behavior after auth exists.

Possible future tables:

- `User`
- `SavedLead`
- `UserFirmNote`
- `LeadStatus`
- `UserRecentZip`
- `FollowUpTask`

### Layer 3: External Fetching and Review

Supports enrichment later.

Possible future tables:

- `FetchRun`
- `SourceRecord`
- `CandidateFirm`
- `CandidateFieldValue`
- `FieldConfidence`
- `ReviewDecision`

Layer 3 should not be implemented until `docs/03-data-fetching-plan.md` approves a specific fetching pass.

---

## Possible Initial Firm Model

This is a draft model concept, not final schema.

A simple early `Firm` record might include:

- `id`
- `name`
- `website`
- `phone`
- `email`
- `streetAddress`
- `city`
- `state`
- `zipCode`
- `sourceLabel`
- `sourceUrl`
- `confidenceLevel`
- `createdAt`
- `updatedAt`

This may be enough for an early seeded ZIP search.

Do not over-normalize too early.

---

## Possible Later Normalized Firm Model

Later, the app may need more structure.

Possible tables:

### `Firm`

Represents a law firm.

Possible fields:

- `id`
- `name`
- `website`
- `mainPhone`
- `mainEmail`
- `createdAt`
- `updatedAt`

### `FirmLocation`

Represents a firm office/location.

Possible fields:

- `id`
- `firmId`
- `streetAddress`
- `city`
- `state`
- `zipCode`
- `phone`
- `email`
- `createdAt`
- `updatedAt`

### `Attorney`

Represents an attorney.

Possible fields:

- `id`
- `fullName`
- `profileUrl`
- `createdAt`
- `updatedAt`

### `FirmAttorney`

Links attorneys to firms.

Possible fields:

- `id`
- `firmId`
- `attorneyId`
- `role`
- `sourceId`
- `createdAt`
- `updatedAt`

### `PracticeArea`

Represents a practice area.

Possible fields:

- `id`
- `name`
- `slug`

### `FirmPracticeArea`

Links firms to practice areas.

Possible fields:

- `id`
- `firmId`
- `practiceAreaId`
- `sourceId`
- `confidenceLevel`
- `createdAt`
- `updatedAt`

This structure may be useful later, but it is probably too much for the first seed-data search task.

---

## Possible User Model Later

Auth is delayed.

When auth is approved, a simple user model may include:

### `User`

Possible fields:

- `id`
- `email`
- `createdAt`
- `updatedAt`
- `lastLoginAt`
- `isActive`

### `AllowedEmail`

Possible fields:

- `id`
- `email`
- `createdAt`
- `createdBy`
- `isActive`

### `LoginCode`

Possible fields:

- `id`
- `email`
- `codeHash`
- `expiresAt`
- `usedAt`
- `createdAt`
- `attemptCount`

### `Session`

Possible fields:

- `id`
- `userId`
- `expiresAt`
- `createdAt`
- `lastSeenAt`

These should not be added until auth is the approved task.

---

## Possible Saved Lead Model Later

Saved leads should be private to one user.

### `SavedLead`

Possible fields:

- `id`
- `userId`
- `firmId`
- `status`
- `createdAt`
- `updatedAt`

Rules:

- `userId` is required.
- `firmId` points to global firm data.
- A saved lead belongs to one user.
- Other users should not see it.

Do not add saved leads before auth/user ownership exists unless the human explicitly approves a temporary local-only design.

---

## Possible Recent ZIP Model Later

Recent ZIPs should be private to one user.

### `UserRecentZip`

Possible fields:

- `id`
- `userId`
- `zipCode`
- `searchedAt`

Rules:

- `userId` is required.
- Recent ZIPs must not be shared globally.
- Recent ZIP behavior should be tested carefully across reloads and user switching.

Do not add Recent ZIPs early.

The previous app had confusion around this feature.

---

## Possible Source Metadata Model Later

When external fetching is approved, source records may be needed.

### `DataSource`

Possible fields:

- `id`
- `sourceType`
- `label`
- `url`
- `fetchedAt`
- `fetchRunId`
- `confidenceLevel`
- `createdAt`

### `FetchRun`

Possible fields:

- `id`
- `passName`
- `passVersion`
- `triggerType`
- `input`
- `startedAt`
- `finishedAt`
- `status`
- `error`

### `CandidateFieldValue`

Possible fields:

- `id`
- `entityType`
- `entityId`
- `fieldName`
- `proposedValue`
- `sourceId`
- `confidenceLevel`
- `status`
- `createdAt`
- `reviewedAt`

These are future planning ideas only.

Do not implement until the data-fetching plan approves a specific pass.

---

## Overwrite Rules

Default rule:

```text
Do not overwrite existing non-empty fields automatically.
```

This is especially important once external fetching exists.

Safer pattern:

1. Fill empty fields only.
2. Store conflicting values as candidates.
3. Preserve existing values.
4. Attach source/confidence metadata.
5. Let human-approved logic decide later.

Never overwrite private user workflow data from a global data-fetching pass.

---

## Migration Rules

When Prisma is eventually added:

1. Start from a clean schema.
2. Create small migrations.
3. Name migrations clearly.
4. Do not edit old migrations casually.
5. Do not delete migration history casually.
6. Do not use destructive reset commands.
7. The human runs migration commands.
8. The coding agent explains every migration.

Before any migration, the coding agent should explain:

- migration name
- schema changes
- tables affected
- data-loss risk
- command to run
- expected output
- verification steps

---

## Seed Rules

Seed data should be controlled and understandable.

Seed data should:

- be small at first
- support one or a few ZIP codes
- include realistic prospect fields
- avoid private/sensitive data
- be easy to inspect
- not depend on external fetching

Seed data should not:

- run destructive database operations
- overwrite private user data
- pretend to be verified live data
- hide source assumptions

---

## Database Task Readiness Checklist

Database implementation is ready only when:

- `docs/05-database-plan.md` exists.
- The human approves database work as the current task.
- `task/current-task.md` clearly defines the database task.
- The exact database provider is known.
- The package manager is known.
- The app shell exists or the task explains why it is not needed.
- The initial schema is small.
- Migration commands are explained.
- Seed strategy is explained.
- No destructive command is needed.

If these are not true, database work is not ready.

---

## First Database Task Recommendation

When database work begins, the first database task should be small.

Possible first database task:

```text
Add Prisma and a minimal Firm model for seeded ZIP search.
```

Allowed in that future task:

- install Prisma if approved
- add `.env.example` placeholders
- create minimal schema
- create one safe migration
- add small seed script or seed plan
- explain human-run commands

Not allowed in that same task:

- auth
- saved leads
- recent ZIPs
- external fetching
- enrichment
- source candidate system
- dashboard buildout
- destructive commands

---

## Human Verification Later

When database work begins, the human should verify:

1. Schema file exists.
2. Migration file exists if a migration was created.
3. `.env.example` has placeholders only.
4. No real secrets were committed.
5. The suggested migration command is understood before running.
6. Seed data can be inspected.
7. The app reads from the intended data source.
8. No destructive command was used.

Exact steps should be written in the task final report.

---

## Testing Notes Later

Potential checks later:

- TypeScript compile check
- seed script check
- search query unit test
- manual search verification
- database query test if test setup exists

Testing should be explained before commands are suggested.

The human runs commands and pastes results back when needed.

---

## Stop Conditions

Stop database work if:

- the task is not in `task/current-task.md`
- a destructive database command seems necessary
- migration history is confusing
- schema changes are larger than the current task
- auth tables are being added too early
- saved leads are being mixed into global firm data
- recent ZIPs are being added before auth
- external fetching tables are being added before the data-fetching plan approves them
- existing data could be lost
- the coding agent is unsure what a migration will do

---

## Current Decision

The current database decision is:

```text
Delay database implementation until after planning and app shell.
Start with the smallest useful schema.
Preserve the global/private data split.
Never use destructive database shortcuts.
Use manual seed data before external fetching.
```

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/06-api-contracts.md
```

That file should define the expected API boundaries before routes are built.