# Current Task: Document first public MVP deployment

## Status

Completed. Deployed URL has been recorded and verified.


## Goal

Support and document the first public deployment of the Legal Prospector Next.js app.

The human will perform the actual GitHub/Vercel deployment steps. The coding agent should only inspect/update documentation and provide verification guidance.

## Current phase

```text
Phase 2.5: First Public Deployment
```

## Current project state

The app currently supports:

- ZIP-code prospect search against manually curated sample data
- ZIP+4 normalization
- validation and empty states
- prospect result cards
- expandable/collapsible prospect details
- browser-session save/unsave UI
- accessible `ProspectCard` buttons
- public-facing copy and metadata
- first-deploy checklist
- passing tests and build from human-run verification

The previous task, `Prepare app for first public deployment`, has been committed.

## Deployment split

The human will handle:

- terminal commands
- git push
- GitHub repository setup if needed
- Vercel project import
- deploy button clicks
- production deployment checks
- providing the deployed URL

The coding agent will handle:

- documentation updates
- deployment checklist cleanup
- recording the final deployment URL after the human provides it
- final report

## Human-controlled command rule

The coding agent must not run terminal commands.

This includes:

```text
git status
git add
git commit
git push
npm run test
npm run build
npm run dev
vercel
npx
```

Commands may be suggested under `Commands for human to run`, but not executed by the coding agent.

## Scope

Allowed:

- Inspect deployment-related files.
- Confirm the app has no required environment variables based on current code/docs.
- Confirm `package.json` has expected scripts if needed.
- Update `docs/planning/11-first-deploy-checklist.md` with deployment result details after the human provides the URL.
- Update `tasks/work.md` with a brief deployment task entry.
- Optionally update `README.md` only if the deployment documentation is clearly incomplete.
- Provide a post-deploy verification checklist.

Explicitly forbidden:

- No app feature changes.
- No visual redesign.
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
- No Vercel analytics package.
- No environment variables unless the human explicitly identifies a required one.
- Do not run terminal commands.

## Deployment URL

The human will provide the deployed URL.

When the human provides it, document it in:

```text
docs/planning/11-first-deploy-checklist.md
tasks/work.md
```

Use a clear format such as:

```text
Public deployment URL: https://example.vercel.app
Deployment date: YYYY-MM-DD
Deployment phase: Phase 2.5 first public MVP
```

## Post-deploy verification to document

Record whether the human verified:

1. Home page loads.
2. Browser tab title is correct.
3. Header badge reads `Legal Prospect Search`.
4. Search ZIP `19103`.
5. Sample prospects appear.
6. Expand/collapse works.
7. Save/unsave works.
8. Saved count updates.
9. Invalid ZIP validation works.
10. Unsupported ZIP empty state works.
11. Refresh clears saved browser-session state.
12. Public copy remains honest about manually curated sample data.

## Files likely involved

Likely files:

- `docs/planning/11-first-deploy-checklist.md`
- `tasks/work.md`

Possibly involved:

- `README.md`

Do not touch app source files unless there is a clear deployment-blocking issue and the human approves it.

## Testing guidance

No new tests are required.

Preserve all existing tests.

Do not add:

- React Testing Library
- Playwright
- Cypress
- new test dependencies

## Commands for human to run

The human may run these before deployment:

```bash
git status
npm run test
npm run build
git push
```

The human may run these after documentation updates:

```bash
git status
git diff
npm run test
npm run build
git add .
git commit -m "Document first public deployment"
git push
```

## Acceptance criteria

This task is complete when:

- The human has deployed the app to Vercel.
- The human has provided the public deployment URL.
- The deployment URL is documented.
- Post-deploy verification is documented.
- `tasks/work.md` is updated.
- No app code changes were made unless explicitly approved by the human.
- No persistence, auth, database, API route, dependency, analytics, dashboard, external data, scraping, or enrichment work was added.

## Final report required from coding agent

When finished, report:

1. Deployment URL documented.
2. Files changed.
3. Whether any deployment issue was found.
4. Whether any app code changes were required.
5. Confirmation that no persistence/auth/database/API/dependency/external-data work was added.
6. Human post-deploy verification checklist.