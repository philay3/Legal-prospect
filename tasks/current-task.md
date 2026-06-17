# Current Task: Create prospect data model gap analysis

## Status

Ready for coding agent.

## Goal

Create a practical gap analysis between the current sample-data `Prospect` type and the new real-data acquisition plan.

The goal is to understand what the current app data model supports, what the real-data plan will eventually require, and which type/model changes should be deferred until database, API, and user ownership decisions are made.

This is a planning/documentation task only.

Do not implement type changes, database changes, auth, API routes, scraping, external fetching, or saved-lead persistence yet.

## Current project state

The app is publicly deployed at:

https://legal-prospect.vercel.app

Completed phases:

- Phase 0: Control and Planning
- Phase 1: Basic App Shell
- Phase 2: ZIP-code Prospect Search Shell
- Phase 2.5: First Public Deployment
- Phase 3: Real Data Acquisition Plan

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

The real-data acquisition plan has now been created and committed.

## Product objective

The real product objective remains:

A user or sales rep enters a postal ZIP code, and the site finds real small/boutique law firm prospects in or near that ZIP.

Useful real prospect data should eventually include:

- firm name
- website
- phone
- city/state/ZIP
- street address
- practice areas
- attorney count or size estimate
- attorney names, if available and verified
- source URL
- source type
- confidence level
- verification status
- last checked date

## Files to review

Review these files first:

```text
src/types/prospect.ts
src/data/prospects.ts
src/components/ProspectCard.tsx
docs/planning/03-data-fetching-plan.md
tasks/work.md
```

Also review existing planning docs if needed, especially:

```text
docs/planning/09-roadmap.md
docs/planning/08-coding-agent-rules.md
```

## Scope

Allowed:

- Create a new planning document, preferably:

```text
docs/planning/12-prospect-data-model-gap-analysis.md
```

- Compare the current `Prospect` type against the fields described in the real-data acquisition plan.
- Identify which fields are already supported.
- Identify which fields are missing.
- Identify which fields belong to global/shared prospect data.
- Identify which fields belong to private/user-specific workflow data.
- Recommend future type/model changes at a planning level only.
- Identify which fields should be added later to the frontend sample type.
- Identify which fields should wait for database/API planning.
- Update `tasks/work.md` with a brief note.

Explicitly forbidden:

- No app source-code changes.
- No edits to `src/types/prospect.ts`.
- No edits to `src/data/prospects.ts`.
- No edits to `src/components/ProspectCard.tsx`.
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
- No dashboard.
- No new dependencies.
- Do not run terminal commands.

## Data ownership rule

Keep this distinction clear:

Global/shared data:

- ZIP research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results
- source URLs
- confidence level
- verification status
- last checked date

Private/user-specific data:

- saved leads
- notes
- statuses
- tasks
- reminders
- recent searches
- user-specific lead ownership
- follow-up workflow state

This task is about planning the global/shared prospect data model.

Do not design private saved-lead persistence yet.

## Required sections for the new gap-analysis document

The new document should include these sections:

1. Purpose
2. Current state
3. Current `Prospect` type summary
4. Real-data plan field summary
5. Field-by-field gap table
6. Global/shared data fields
7. Private/user-specific fields to defer
8. Frontend sample-data fields that can be added later
9. Database/API fields that should wait
10. Confidence vs verification status clarification
11. Recommended future model shape
12. Risks and scope-control notes
13. Explicit non-goals for now
14. Suggested follow-up tasks

## Guidance for the field-by-field gap table

Create a table like this:

| Field | Current support | Real-data need | Ownership | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `firmName` | Supported | Required | Global/shared | Keep |
| `streetAddress` | Missing | Required later | Global/shared | Add later after UI/type planning |
| `sourceUrl` | Missing | Required later | Global/shared | Add before real-data records are displayed |
| `saved` | In-memory only | Private user workflow | Private/user-specific | Do not persist until auth/database ownership is planned |

Use the actual current type and real-data plan as the source of truth.

## Confidence vs verification status clarification

The gap analysis should clearly separate these two concepts:

```text
confidenceLevel = how trustworthy the data is after review
verificationStatus = where the record is in the research workflow
```

Recommended future values:

```text
confidenceLevel: HIGH | MEDIUM | LOW | UNKNOWN
verificationStatus: CANDIDATE | PENDING_REVIEW | VERIFIED | REJECTED | STALE
```

Do not implement these values yet. Document them only.

## Recommended future model shape

The document may propose a future interface shape, but it must be clearly labeled as planning-only pseudocode.

Example:

```ts
// Planning-only sketch. Do not implement in this task.
interface FutureProspect {
  id: string;
  firmName: string;
  website: string;
  phone: string;
  streetAddress?: string;
  city: string;
  state: string;
  zip: string;
  zipExt?: string;
  practiceAreas: string[];
  attorneyCountRange: string;
  attorneys?: string[];
  sourceUrl?: string;
  sourceType: string;
  confidenceLevel: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
  verificationStatus: 'CANDIDATE' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'STALE';
  lastCheckedDate?: string;
}
```

The coding agent may refine this sketch based on the actual current code and planning document.

## Human-run verification commands

No commands are required for a docs-only task.

If the human wants to check the repo afterward, recommend:

```bash
git status
git diff
```

If everything is good, the human may commit with:

```bash
git add docs/planning/12-prospect-data-model-gap-analysis.md tasks/work.md
git commit -m "Document prospect data model gaps"
git push
```

Only the human should run these commands.

## Acceptance criteria

This task is complete when:

- `docs/planning/12-prospect-data-model-gap-analysis.md` exists.
- The document compares the current `Prospect` type with the real-data acquisition plan.
- The document clearly identifies supported, missing, deferred, and future fields.
- The document separates global prospect data from private user workflow data.
- The document clarifies `confidenceLevel` vs `verificationStatus`.
- The document does not implement app-code, database, auth, API, scraping, fetching, dependency, or persistence changes.
- `tasks/work.md` is updated with a brief task note.
- No terminal commands were run.

## Final report required from coding agent

When finished, report:

1. Files changed.
2. Summary of the gap analysis.
3. Key fields already supported.
4. Key fields missing or deferred.
5. Recommendation for the next smallest safe task.
6. Confirmation that no app code, database, auth, API routes, scraping, external fetching, dependencies, or persistence work was added.
7. Confirmation that no terminal commands were run.
8. Suggested human review steps.