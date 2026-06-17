# Current Task: Prepare app for first public deployment

## Status

Ready for coding agent.

## Goal

Prepare the current Next.js app for a first public deployment.

This task should make the site deployment-ready without adding database, auth, persistence, external APIs, scraping, or new product features.

## Important correction

The goal is not to keep polishing a local-only demo forever.

The goal is to get the website up and running publicly as a first MVP.

The app may still use manual/local seed data for now, but the site should be clean, buildable, and ready for deployment.

## Current project state

The app currently supports:

- ZIP input
- local/manual prospect search
- ZIP+4 normalization
- validation and empty states
- prospect result cards
- extracted `ProspectCard` component
- expandable/collapsible prospect details
- local-only in-memory save/unsave UI state
- accessible expand/collapse and save/unsave buttons
- ZIP utility tests including ZIP+4 regression coverage

The previous task improved `ProspectCard` accessibility.

## User-facing deployment goal

A visitor should be able to open the deployed website and:

- see a clean landing/search page
- search ZIP `19103`
- view available seed prospects
- expand prospect details
- save/unsave prospects during the current browser session
- understand that current saved state is session-only

## Scope

Allowed:

- Review public-facing copy for deployment readiness.
- Replace overly internal labels like `Phase 2` if they make the site feel unfinished.
- Keep any seed-data/demo disclaimers honest if the underlying data is still manual or fictional.
- Improve metadata in `src/app/layout.tsx` if needed.
- Add or update basic deployment notes in `README.md` or a planning doc.
- Add a simple first-deploy checklist if helpful.
- Confirm there are no required environment variables for the current app.
- Update `tasks/work.md` with a brief note about the completed work.

Explicitly forbidden:

- No database.
- No Prisma.
- No migrations.
- No auth.
- No user accounts.
- No dashboard.
- No backend API routes.
- No saved leads table.
- No saved lead model.
- No localStorage.
- No sessionStorage.
- No cookies.
- No external fetching.
- No scraping.
- No enrichment.
- No new dependencies.
- No large redesign.
- No new product feature.
- Do not run terminal commands.

## Deployment-readiness guidance

The current app should remain simple.

Focus on:

- clean public-facing language
- honest description of current data
- no broken internal wording
- no references that make the site look like a private coding exercise
- no misleading claim that data is real/live if it is still seed/manual data
- successful build readiness

Possible copy improvements:

Instead of:

```text
Phase 2: Seed Search
```

Use something like:

```text
Legal Prospect Search
```

Instead of:

```text
Manual/demo seed data for testing purposes.
```

Use honest public-facing wording such as:

```text
Currently showing manually curated sample prospect data.
```

Do not claim live, complete, verified, or production-grade data unless that is already true.

## Files likely involved

Likely files:

- `src/app/page.tsx`
- `src/app/layout.tsx`
- `README.md`
- `tasks/work.md`

Possibly involved:

- `docs/planning/11-first-deploy-checklist.md`

Do not touch ZIP utility files or tests unless there is a clear reason.

Do not touch database/auth/API/persistence files.

## Testing guidance

No new tests are required for this task.

Preserve all existing tests.

Do not add:

- React Testing Library
- Playwright
- Cypress
- new test dependencies

## Human-run verification commands

The coding agent must not run terminal commands.

After edits are complete, recommend that the human run:

```bash
npm run test
npm run build
npm run dev
git status
```

If everything is good, the human may commit with:

```bash
git add .
git commit -m "Prepare app for first public deployment"
```

## Manual browser verification

The human should verify locally:

1. Open the app.
2. Confirm the page looks appropriate for a first public MVP.
3. Search ZIP `19103`.
4. Confirm prospects appear.
5. Expand and collapse details.
6. Save and unsave a prospect.
7. Confirm the copy is honest about the current data.
8. Confirm there are no obvious internal-only labels or unfinished process labels.

## Acceptance criteria

This task is complete when:

- Public-facing copy is cleaner for a first deployed MVP.
- The app still honestly describes manual/sample seed data.
- The site does not imply live production data if that is not true.
- Basic app metadata is reasonable.
- Deployment notes or checklist exist.
- Existing search behavior is unchanged.
- Existing expand/collapse behavior is unchanged.
- Existing save/unsave behavior is unchanged.
- Existing tests still pass when the human runs them.
- No persistence, auth, database, API route, dependency, dashboard, external data, or saved-leads architecture was added.
- `tasks/work.md` is updated with a brief note.

## Final report required from coding agent

When finished, report:

1. Files changed.
2. Public-facing copy or metadata updates made.
3. Deployment notes/checklist added or updated.
4. Confirmation that core app behavior was preserved.
5. Confirmation that no persistence/auth/database/API/dependency/dashboard/external-data work was added.
6. Human verification steps to run.