# Current Task: Align frontend Prospect type and sample data with real-data fields

## Status

Ready for coding agent.

## Goal

Update the frontend-only `Prospect` type, sample seed data, and result card display so the public MVP can represent the real-data fields identified in the prospect data model gap analysis.

This is a small controlled app-code task.

The goal is not to add real data fetching or persistence. The goal is to make the current seed-data app shape ready for real prospect fields later.

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

The current app supports:

- ZIP-code prospect search against manually curated sample data
- ZIP+4 normalization
- validation and empty states
- prospect result cards
- expandable/collapsible prospect details
- browser-session save/unsave UI
- accessible ProspectCard buttons
- public-facing copy and metadata
- deployed public MVP shell

The project now has planning docs for real-data acquisition and prospect model gaps.

## Product objective

The real product objective remains:

A user or sales rep enters a postal ZIP code, and the site finds real small/boutique law firm prospects in or near that ZIP.

Useful real prospect data should eventually include:

- firm name
- website
- phone
- city/state/ZIP
- street address
- ZIP+4 extension, if available
- practice areas
- attorney count or size estimate
- attorney names, if available and verified
- source URL
- source type
- confidence level
- verification status
- last checked date

## Files to review first

Review these files before editing:

```text
src/types/prospect.ts
src/data/prospects.ts
src/components/ProspectCard.tsx
src/utils/prospectMatcher.ts
src/utils/prospectMatcher.test.ts
docs/planning/03-data-fetching-plan.md
docs/planning/12-prospect-data-model-gap-analysis.md
tasks/work.md
```

Also review existing rules if needed:

```text
docs/planning/08-coding-agent-rules.md
```

## Scope

Allowed:

- Update `src/types/prospect.ts`.
- Update `src/data/prospects.ts`.
- Update `src/components/ProspectCard.tsx` to display the new frontend-safe fields.
- Update tests only if existing type/data changes require test adjustments.
- Update `tasks/work.md` with a brief task note.

Explicitly forbidden:

- No database.
- No Prisma.
- No migrations.
- No auth.
- No user accounts.
- No backend API routes.
- No scraping code.
- No external fetch code.
- No enrichment implementation.
- No provider/API integration.
- No saved leads persistence.
- No localStorage/sessionStorage/cookies.
- No dashboard.
- No new dependencies.
- No deployment changes.
- Do not run terminal commands.

## Important command rule

Do not run terminal commands.

This includes, but is not limited to:

```bash
npm run test
npm run build
npm run dev
git status
git diff
git add
git commit
git push
npm install
npx
```

You may recommend commands only under:

```text
Commands for human to run
```

The human runs all commands.

## Data ownership rule

Keep this distinction clear:

Global/shared prospect data:

- firm records
- attorney records
- practice areas
- source URLs
- source type
- confidence level
- verification status
- last checked date
- ZIP research
- cached ZIP results

Private/user-specific workflow data:

- saved leads
- notes written by a user
- user-specific statuses
- tasks
- reminders
- recent searches
- follow-up workflow state

This task may add frontend fields for global/shared prospect data only.

Do not persist or model private saved-lead/user workflow data.

## Required implementation

### 1. Update `src/types/prospect.ts`

Replace the loose current confidence/source strings with typed planning-safe fields.

Recommended shape:

```ts
export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';

export type VerificationStatus =
  | 'CANDIDATE'
  | 'PENDING_REVIEW'
  | 'VERIFIED'
  | 'REJECTED'
  | 'STALE';

export type SourceType =
  | 'BAR_DIRECTORY'
  | 'GOOGLE_MAPS'
  | 'WEB_SCRAPE'
  | 'MANUAL'
  | 'MANUAL_SEED';

export interface Prospect {
  id: string;
  firmName: string;
  zip: string;
  zipExt?: string | null;
  city: string;
  state: string;
  streetAddress?: string | null;
  website: string | null;
  phone: string | null;
  email?: string | null;
  practiceAreas: string[];
  attorneyCountRange: string;
  attorneys?: string[];
  sourceType: SourceType;
  sourceUrl?: string | null;
  confidenceLevel: ConfidenceLevel;
  verificationStatus: VerificationStatus;
  lastCheckedDate?: string | null;
  globalNotes: string | null;
}
```

Use this as guidance, but adapt carefully to the existing codebase.

### 2. Update `src/data/prospects.ts`

Update existing manually curated sample records to match the new type.

Important:

- Keep the data honest as sample/seed data.
- Do not replace the current sample data with real law firms in this task.
- Do not add scraped or externally sourced records.
- Use `sourceType: 'MANUAL_SEED'`.
- Use `confidenceLevel: 'UNKNOWN'` or another honest value appropriate for sample data.
- Use `verificationStatus: 'CANDIDATE'` or another honest value appropriate for sample/demo data.
- Preserve ZIP `19103` behavior.
- Preserve unsupported-ZIP empty state behavior.
- Preserve ZIP+4 normalization behavior.

For fields that are not meaningful in sample data, use `null`, empty arrays, or clearly fake/demo-safe values.

### 3. Update `src/components/ProspectCard.tsx`

Update the card to use the renamed/added fields.

Required display behavior:

- Preserve existing card layout and behavior.
- Preserve expand/collapse behavior.
- Preserve save/unsave behavior.
- Preserve accessibility attributes already added.
- Display `streetAddress` if present.
- Display `sourceUrl` if present.
- Display `confidenceLevel`.
- Display `verificationStatus`.
- Display `lastCheckedDate` if present.
- Display attorney names if `attorneys` has values.
- Use `globalNotes` instead of `notes`.

Important:

- Do not add large UI redesign.
- Do not add routing.
- Do not add new components unless clearly necessary.
- Do not make source links misleading. If sample data has no real source URL, do not show one.

### 4. Preserve behavior

Do not intentionally change:

- search input behavior
- invalid ZIP validation
- unsupported ZIP empty state
- ZIP+4 normalization
- matching logic
- saved count
- save/unsave state being browser-session only
- public copy/disclaimer that data is manually curated sample data

### 5. Update tests only if needed

If the type/data changes break existing tests, update tests minimally.

Do not add a new test framework.

Do not add Playwright/Cypress/React Testing Library.

Keep tests focused on existing pure business logic unless a tiny type/data update is required.

### 6. Update `tasks/work.md`

Add a brief log entry explaining:

- frontend prospect type aligned with real-data planning fields
- sample seed records updated to match new shape
- ProspectCard updated to render new fields
- no database/auth/API/scraping/persistence/dependency work added
- no terminal commands run

## Acceptance criteria

This task is complete when:

- `src/types/prospect.ts` defines typed `ConfidenceLevel`, `VerificationStatus`, and `SourceType`.
- `Prospect` uses `confidenceLevel` instead of loose `confidence`.
- `Prospect` uses `globalNotes` instead of `notes`.
- `src/data/prospects.ts` compiles conceptually against the new `Prospect` shape.
- Sample data remains clearly manually curated seed/demo data.
- `ProspectCard` renders the updated fields without changing the core interaction behavior.
- ZIP `19103` sample search behavior is preserved.
- ZIP+4 normalization behavior is preserved.
- Save/unsave remains in-memory only.
- No database/auth/API/scraping/fetching/dependency/persistence work is added.
- `tasks/work.md` is updated.
- No terminal commands were run.

## Commands for human to run

After the agent finishes, the human may run:

```bash
npm run test
npm run build
npm run dev
git status
git diff
```

If everything looks good, the human may commit with:

```bash
git add src/types/prospect.ts src/data/prospects.ts src/components/ProspectCard.tsx src/utils/prospectMatcher.test.ts tasks/work.md
git commit -m "Align frontend prospect model with real-data fields"
git push
```

Adjust the `git add` command if no test file was changed.

## Final report required from coding agent

When finished, report:

1. Files changed.
2. Summary of type changes.
3. Summary of sample-data changes.
4. Summary of ProspectCard display changes.
5. Whether any tests were edited and why.
6. Confirmation that search, ZIP+4 normalization, save/unsave, and empty states were intended to remain unchanged.
7. Confirmation that no database, auth, API routes, scraping, external fetching, new dependencies, deployment changes, or persistence work was added.
8. Confirmation that no terminal commands were run.
9. Commands for the human to run.
10. Suggested human review steps.