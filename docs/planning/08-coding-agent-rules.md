# 08 — Coding Agent Rules

This file is for any AI coding agent helping with the project.

## Main Rule

One feature or bug fix per session.

Do not bundle unrelated work.

## Required Workflow

For each task:

1. Read the relevant planning doc.
2. Confirm the exact story or bug fix.
3. Modify only the files needed for that task.
4. Add or update tests if relevant.
5. Run verification.
6. Stop and report back.
7. Wait for approval before doing anything else.

## Do Not Touch Unless Asked

Do not change:

- Dashboard.
- Navbar.
- SEO.
- CSV/export.
- Validation.
- Contact enrichment.
- Pagination styling.
- Schema.
- Authentication.
- Any future roadmap feature.
- Browser automation/subagents 

Unless the current task explicitly says to work on one of those.

## Data Safety Rules

Never run:

```bash
npx prisma db push --accept-data-loss
```

Never:

- Reset the database.
- Drop tables.
- Drop columns.
- Delete real firm/search/ZIP/contact records.
- Overwrite useful non-null values with null or empty strings.
- Let weaker new research erase stronger existing data.

Schema changes require explicit approval.

## Search Rules

Search is currently working better and should be protected.

Do not break:

- New ZIP search.
- Sidebar cached ZIP load.
- Combined ZIP dataset return.
- Loading state.
- Error state.
- Data preservation.

## ZIP Ownership Rule

Use this mental model:

```text
ZIP code = durable data bucket
Search = one research attempt / event log
Firm = durable prospect record inside a ZIP
```

Durable ownership:

```text
ZipCode -> Firm
```

Do not treat `searchId + firmName` as durable uniqueness.

## UI Simplicity Rule

For v1, keep search UI simple:

```text
Enter ZIP -> Search
```

Do not expose:

- Quick mode.
- Thorough mode.
- Force refresh.
- Deeper research toggle.
- Model selector.
- Mode selector.

## Required Report Format

At the end of every task, report:

1. Story/bug fixed.
2. Root cause or goal confirmation.
3. Files changed.
4. Tests run.
5. Manual browser/API verification.
6. Any skipped tests and why.
7. Confirmation no unrelated features were added.
8. Confirmation no schema changes were made unless approved.
9. Confirmation no destructive DB commands were used.
10. Full changed file contents.
11. Statement: “Stopping here and waiting for review.”

## Handoff Template

```markdown
# Coding Agent Task

## Current Task Only

[Insert one story or bug fix.]

## Do Not Touch

- [List out-of-scope areas]

## Acceptance Criteria

1. [Criterion]
2. [Criterion]
3. [Criterion]

## Required Verification

- [ ] `npx tsc --noEmit`
- [ ] API behavior checked
- [ ] Browser behavior checked
- [ ] No schema changes unless approved
- [ ] No destructive DB commands
- [ ] No unrelated features

## Final Report Required

Stop after the task and report:
1. What changed.
2. Files changed.
3. Tests run.
4. Verification result.
5. Full changed file contents.
```
