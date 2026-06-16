# Current Task: Improve ProspectCard button accessibility

## Status

Ready for coding agent.

## Goal

Improve the accessibility semantics of the `ProspectCard` action buttons without changing behavior or visual design.

This is a small hardening/refactor task only.

## Current project state

The app currently supports:

- ZIP input
- local/manual demo prospect search
- ZIP+4 normalization
- validation and empty states
- demo prospect result cards
- expandable/collapsible prospect details
- local-only in-memory save/unsave UI state
- extracted `ProspectCard` component
- ZIP utility tests including ZIP+4 regression coverage

The previous task extracted the prospect result card into `src/components/ProspectCard.tsx`.

## Why this task matters

Now that the card UI is isolated, the expand/collapse and save/unsave buttons should expose their state clearly to assistive technologies.

This improves quality without expanding product scope.

## Scope

Allowed:

- Add appropriate accessibility attributes to the expand/collapse button.
- Add appropriate accessibility attributes to the save/unsave button.
- Use firm-specific accessible labels if helpful.
- Convert `Prospect` import in `ProspectCard.tsx` to a type-only import if appropriate.
- Preserve the current UI and behavior exactly.
- Update `tasks/work.md` with a brief note about the completed work.

Explicitly forbidden:

- No new user-facing feature.
- No visual redesign.
- No CSS changes unless absolutely necessary.
- No behavior changes.
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

## Implementation guidance

In `src/components/ProspectCard.tsx`, consider adding:

```tsx
aria-expanded={isExpanded}
aria-label={isExpanded ? `Hide details for ${prospect.firmName}` : `Show details for ${prospect.firmName}`}

to the expand/collapse button.

For the save/unsave button, consider adding:

aria-pressed={isSaved}
aria-label={isSaved ? `Unsave ${prospect.firmName}` : `Save ${prospect.firmName}`}

Also consider changing:

import { Prospect } from "@/types/prospect";

to:

import type { Prospect } from "@/types/prospect";

if that fits the project TypeScript setup.

Files likely involved

Likely files:

src/components/ProspectCard.tsx
tasks/work.md

Do not touch src/app/page.tsx unless there is a clear reason.

Do not touch ZIP utility files or tests.

Testing guidance

No new tests are required for this task.

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
git commit -m "Improve prospect card accessibility"
Acceptance criteria

This task is complete when:

Expand/collapse button exposes its expanded/collapsed state.
Save/unsave button exposes its pressed/saved state.
Accessible labels clearly identify the prospect affected by each button.
Existing UI behavior is unchanged.
Existing visual design is unchanged.
Existing tests still pass when the human runs them.
No persistence, auth, database, API route, dependency, dashboard, or new feature work was added.
tasks/work.md is updated with a brief note.
Final report required from coding agent

When finished, report:

Files changed.
Accessibility attributes added.
Whether any type-only import cleanup was made.
Confirmation that behavior and visuals were preserved.
Confirmation that no new feature/persistence/auth/database/API/dependency work was added.
Human verification steps to run.