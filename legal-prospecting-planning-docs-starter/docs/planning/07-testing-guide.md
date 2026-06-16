# Testing Guide

## Purpose

This document explains how testing and verification should work during the controlled rebuild of the legal prospecting app.

The goal is for the human user to understand what each check means instead of letting the coding agent run commands blindly.

The coding agent should suggest checks, explain them, and help interpret results.

The human user runs commands.

---

## Core Testing Rule

The coding agent should not run tests by default.

The coding agent should explain:

1. which check or test to run
2. why it matters
3. what passing means
4. what failing might mean
5. what result the human should paste back if help is needed

The human user runs the command.

---

## Human-Controlled Commands

The coding agent must not run these commands unless the human explicitly asks:

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

The coding agent must never run:

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

## What Different Checks Mean

Testing is not one thing.

Different checks prove different things.

---

## TypeScript Check

Possible command later:

```bash
npx tsc --noEmit
```

### What It Checks

This checks whether the TypeScript code compiles.

It can catch:

- missing imports
- wrong types
- invalid props
- invalid function arguments
- some broken refactors

### What Passing Means

```text
TypeScript passing means the project compiles.
It does not prove the app works.
```

### What Failing Might Mean

A failure may mean:

- a file imports something incorrectly
- a type does not match
- a function is being called incorrectly
- a route or component expects different data
- a dependency type is missing

### What To Paste Back

If it fails, paste:

- the full command
- the first error
- any file paths mentioned
- a few lines after the error

Do not paste hundreds of repeated errors unless asked.

---

## Build Check

Possible command later:

```bash
npm run build
```

### What It Checks

This checks whether the app can create a production build.

It may catch issues that do not appear during development.

### What Passing Means

The app built successfully.

This suggests the code can be bundled for production.

It does not prove every user flow works.

### What Failing Might Mean

A failure may mean:

- TypeScript errors
- framework build errors
- invalid server/client boundaries
- missing environment variables
- import problems
- unsupported runtime code
- route or page build issues

### What To Paste Back

If it fails, paste:

- the command
- the first error block
- the file path mentioned
- any message about missing environment variables

---

## Unit Tests

Possible command later:

```bash
npm run test
```

or:

```bash
npm run test:run
```

### What They Check

Unit tests check small pieces of behavior.

Examples:

- ZIP validation works
- search filtering returns expected firms
- formatting helper handles missing fields
- saved lead logic prevents duplicates
- auth code expiration works later

### What Passing Means

```text
Unit tests passing means tested behavior passed.
It does not prove untested flows work.
```

### What Failing Might Mean

A failure may mean:

- the code is wrong
- the test expectation is wrong
- a behavior changed intentionally but the test was not updated
- test data no longer matches the implementation
- async behavior is not handled correctly

### What To Paste Back

If tests fail, paste:

- failed test name
- expected value
- received value
- file path
- relevant stack trace

---

## Manual Browser Verification

Manual browser verification means the human opens the app and checks visible behavior.

### What It Checks

Manual verification proves what the user can actually see and do.

Examples:

- page loads
- ZIP input is visible
- user can type a ZIP code
- results appear
- empty state appears
- detail view opens
- sign-in flow works later

### What Passing Means

```text
Manual browser verification proves visible user flows.
It does not replace automated tests.
```

### What Failing Might Mean

A failure may mean:

- page route is broken
- UI state is wrong
- data is missing
- browser console has an error
- server route failed
- component behavior does not match expectations

### What To Paste Back

If browser verification fails, paste:

- what page you opened
- what you clicked or typed
- what you expected
- what actually happened
- any visible error
- any browser console error if available

---

## Lint Check

Possible command later:

```bash
npm run lint
```

### What It Checks

Lint checks code style and some common code problems.

Depending on project setup, it may catch:

- unused variables
- invalid React hook usage
- formatting issues
- accessibility warnings
- framework-specific warnings

### What Passing Means

The code passes configured lint rules.

It does not prove the app works.

### What Failing Might Mean

A failure may mean:

- unused code
- bad import
- hook rule violation
- formatting issue
- lint config issue

### What To Paste Back

Paste:

- command
- first lint error
- file path
- line number

---

## Database Checks Later

Database checks should be handled carefully.

The coding agent must explain database commands before suggesting them.

Possible future commands:

```bash
npx prisma migrate dev
npx prisma generate
npx prisma db seed
```

These are not approved until database work is the current task.

### What Database Checks May Prove

They may prove:

- schema is valid
- migration can be created
- Prisma client can be generated
- seed data can be loaded
- app can query data

### What They Do Not Prove

They do not prove:

- data model is correct long-term
- privacy rules are correct
- user-specific data is scoped correctly
- external fetching is safe

### Database Command Warning

Never run:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
```

If a database error suggests reset or data loss, stop and review.

---

## Auth Checks Later

Auth is delayed.

When auth is eventually implemented, manual checks should include:

1. allowed email can request a code
2. disallowed email does not gain access
3. valid code signs in
4. invalid code fails
5. expired code fails
6. used code cannot be reused
7. sign out works
8. protected page redirects when signed out
9. protected page loads when signed in
10. private data is scoped to the signed-in user

Auth tests should not be added until auth is the approved current task.

---

## Data Fetching Checks Later

External data fetching is delayed.

No scraping, enrichment, provider call, browser automation, or AI research pass should be tested until documented in:

```text
docs/03-data-fetching-plan.md
```

When external fetching exists later, tests/checks should verify:

- pass only runs from approved trigger
- input is validated
- exact source/query/prompt matches the plan
- output fields are saved as expected
- existing data is not silently overwritten
- source metadata is saved
- confidence metadata is saved
- failures are handled clearly
- cost/rate-limit behavior is understood

---

## Suggested Verification by Phase

## Phase 0: Planning and Control Docs

### What To Verify

- files exist
- docs are readable
- no product code was added
- no database work was started
- no auth work was started
- no external fetching was started

### Human Verification

Open the repo and confirm these exist:

```text
AGENTS.md
task/current-task.md
task/work.md
task/decisions.md
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
README.md
```

No command required.

---

## Phase 1: Basic App Shell

### What To Verify

- app starts when the human runs dev server
- home page loads
- page has clear product purpose
- search placeholder or input is visible
- no auth required
- no database required unless scoped

### Possible Human Command

```bash
npm run dev
```

### Manual Browser Steps

1. Open the local app URL.
2. Confirm the home page loads.
3. Confirm there is a clear starting point.
4. Confirm no sign-in is required.
5. Confirm no product feature beyond the task was added.

### What Passing Means

The app shell is visible and usable enough to continue.

---

## Phase 2: Seed Data

### What To Verify

- seed data exists
- seed data is small and inspectable
- seed data includes at least one test ZIP
- no external fetching was added
- no private user data is mixed into seed data

### Possible Checks

No command may be required if seed data is a static file.

If a seed script exists later, the coding agent must explain the command before suggesting it.

### What Passing Means

The project has controlled sample data for the search flow.

---

## Phase 3: ZIP Search

### What To Verify

- ZIP input accepts a 5-digit ZIP
- invalid ZIP is handled clearly
- seeded ZIP returns prospects
- unknown ZIP shows empty state
- search does not trigger external fetching
- recent ZIPs are not added unless explicitly scoped

### Manual Browser Steps

1. Start app if needed.
2. Enter a seeded ZIP code.
3. Confirm matching prospects appear.
4. Enter an invalid ZIP.
5. Confirm helpful validation appears.
6. Enter a ZIP with no data.
7. Confirm empty state appears.

### What Passing Means

The core search flow works against controlled data.

---

## Phase 4: Prospect Detail

### What To Verify

- user can open a prospect
- correct firm details appear
- missing fields are handled cleanly
- user can return to results
- no save/edit/enrichment behavior is added unless scoped

### Manual Browser Steps

1. Search a seeded ZIP.
2. Click a prospect.
3. Confirm detail page or detail panel shows the selected firm.
4. Confirm contact/location/practice fields are readable.
5. Return to results.

### What Passing Means

The user can inspect a prospect after search.

---

## Phase 5: Auth Later

Auth checks should wait until auth is explicitly in `task/current-task.md`.

### What To Verify Later

- allowlist works
- email code works
- session cookie works
- sign out works
- protected routes work
- private data is user-scoped

### What Passing Means

Approved users can sign in and private workspace behavior is possible.

---

## Phase 6: Saved Leads Later

Saved leads should wait until auth exists.

### What To Verify Later

- user can save a prospect
- saved lead belongs to signed-in user
- saved lead appears in private list
- user can remove saved lead
- another user cannot see it

### What Passing Means

The global/private split works for saved leads.

---

## Phase 7: Recent ZIPs Later

Recent ZIPs should wait until auth and user-specific behavior are stable.

### What To Verify Later

- recent ZIP saves after valid search
- recent ZIP persists across reload
- recent ZIP belongs to current user
- user switching does not leak history
- invalid searches are not saved

### What Passing Means

Recent ZIP behavior is private and predictable.

---

## How Coding-Agent Final Reports Should Handle Testing

At the end of every task, the coding agent should include:

```text
Suggested checks:
- command, if any
- why to run it
- what passing means
- what failing might mean

Manual verification:
- page to open
- action to take
- expected result

Known risks:
- what was not tested
- what remains uncertain
```

The coding agent should not claim a feature works unless:

- the human verified it manually, or
- the human ran the suggested command and shared passing results, or
- the coding agent was explicitly allowed to run a command and reports the result honestly

---

## Common Result Interpretation

### “It compiles”

Good.

But it does not mean the user flow works.

### “Tests pass”

Good.

But only tested behavior passed.

### “The page loads”

Good.

But deeper flows may still fail.

### “No errors in terminal”

Good.

But browser behavior still needs manual verification.

### “No console errors”

Good.

But data correctness still needs checking.

---

## What To Do When Something Fails

When a check fails:

1. Do not panic.
2. Do not run destructive commands.
3. Copy the smallest useful error output.
4. Paste it back for interpretation.
5. Ask what it means before trying fixes.
6. Keep the fix limited to the current task.

Avoid letting a failed test turn into a broad refactor.

---

## Debugging Scope Rule

A debugging task should be scoped just like a feature task.

Good debugging task:

```text
Fix the ZIP validation error on the search form.
```

Bad debugging task:

```text
Clean up the app and fix anything broken.
```

The coding agent should not use one bug to rewrite unrelated parts of the app.

---

## Test Data Rules

Test data should be:

- small
- clear
- predictable
- easy to inspect
- safe to reset
- not private/sensitive

Test data should not include:

- real secrets
- private personal information
- hidden API keys
- production credentials
- unapproved scraped data

---

## No Destructive Fixes

Do not fix test failures with destructive commands.

Never use:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

If a test or database issue seems to require a destructive command, stop and explain the situation.

---

## Testing Readiness Checklist

Before suggesting a test command, the coding agent should know:

- what behavior changed
- what command checks it
- whether the command is safe
- whether it touches the database
- whether it requires the dev server
- what output means success
- what output means failure
- what the human should paste back

If these are unclear, do not suggest the command yet.

---

## Current Decision

The current testing decision is:

```text
The human runs commands.
The coding agent explains checks before suggesting them.
Manual browser verification matters.
TypeScript, tests, builds, and browser checks each prove different things.
Do not use destructive commands to fix failures.
```

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/08-coding-agent-rules.md
```

That file should repeat and expand the rules the coding agent must follow during implementation sessions.