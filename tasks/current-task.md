# Current Task: Extract prospect result card into a small component

## Status

Ready for coding agent.

## Goal

Extract the demo prospect result card UI from `src/app/page.tsx` into a small reusable component.

This is a cleanup/refactor task only. It should preserve the existing user-facing behavior exactly.

## Current project state

The app currently supports:

- ZIP input
- local/manual demo prospect search
- ZIP+4 normalization
- validation and empty states
- demo prospect result cards
- expandable/collapsible prospect details
- local-only in-memory save/unsave UI state
- ZIP utility tests including ZIP+4 regression coverage

The previous ZIP+4 regression test task has passed with 12 tests.

## Why this task matters

`src/app/page.tsx` now owns several responsibilities:

- search input state
- validation state
- matching logic
- expanded prospect state
- saved prospect state
- rendering each prospect card

Before adding more UI behavior, extract the prospect card markup into a focused component so the page remains easier to read and safer to modify.

## Scope

Allowed:

- Create a small component for a single prospect result card.
- Move existing prospect card markup from `src/app/page.tsx` into that component.
- Pass required values and callbacks as props.
- Preserve existing expand/collapse behavior.
- Preserve existing save/unsave behavior.
- Preserve existing CSS class names where practical.
- Update `tasks/work.md` with a brief note about the completed refactor.

Explicitly forbidden:

- No new user-facing feature.
- No behavior changes.
- No visual redesign.
- No database.
- No Prisma.
- No migrations.
- No auth.
- No user accounts.
- No dashboard.
- No backend API routes.
- No localStorage.
- No sessionStorage.
- No cookies.
- No external fetching.
- No scraping.
- No enrichment.
- No new dependencies.
- Do not run terminal commands.

## Suggested component shape

A reasonable file path would be:

```text
src/components/ProspectCard.tsx

Suggested props:

type ProspectCardProps = {
  prospect: Prospect;
  isExpanded: boolean;
  isSaved: boolean;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
};

Equivalent naming is fine if it is clearer.

Files likely involved

Likely files:

src/app/page.tsx
src/components/ProspectCard.tsx
tasks/work.md

Possibly involved:

src/types/prospect.ts

Only touch type files if needed for clean prop typing.

Do not touch ZIP utility files or tests unless there is a clear reason.

Testing guidance

No new tests are required for this refactor.

Preserve all existing tests.

Do not add:

React Testing Library
Playwright
Cypress
new test dependencies
Human-run verification commands

The coding agent must not run terminal commands.

After edits are complete, recommend that the human run:

npm run test
npm run build
npm run dev
git status

If everything is good, the human may commit with:

git add .
git commit -m "Extract prospect card component"
Acceptance criteria

This task is complete when:

Prospect card markup is extracted out of src/app/page.tsx.
Search behavior still works.
Expand/collapse behavior still works.
Save/unsave behavior still works.
Saved session count still works.
Existing tests still pass when the human runs them.
No persistence, auth, database, API route, dependency, dashboard, or new feature work was added.
tasks/work.md is updated with a brief note.
Final report required from coding agent

When finished, report:

Files changed.
What was extracted.
Confirmation that behavior was preserved.
Confirmation that no new feature/persistence/auth/database/API/dependency work was added.
Human verification steps to run.