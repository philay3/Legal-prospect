# 09 — Feature Planning Template

Copy this template whenever planning a new feature or bug fix.

---

# Feature / Bug Fix: [Name]

## Status

Proposed / Approved / In Progress / Done / Deferred

## Phase

Bootcamp MVP / v1 Polish / v1.1 / Future Product

## Problem

What problem does this solve?

## User Story

As a [type of user],  
I want [action/capability],  
so that [benefit/value].

## Why This Matters

Explain the user value or project value.

## Scope

### In Scope

- Item 1
- Item 2
- Item 3

### Out of Scope

- Item 1
- Item 2
- Item 3

## Acceptance Criteria

1. Criterion 1.
2. Criterion 2.
3. Criterion 3.

## Technical Notes

- Relevant files:
  - `path/to/file`
- API routes:
  - `GET /api/...`
  - `POST /api/...`
- Data model notes:
  - Any model impacted.
- Risk areas:
  - Any fragile behavior.

## Data Safety Notes

- [ ] No destructive DB commands.
- [ ] No schema change unless approved.
- [ ] No deletion of real records.
- [ ] No overwriting useful non-null values with null.

## Test Plan

### Automated Tests

- [ ] Unit test:
- [ ] API/route test:
- [ ] Frontend test:

### Manual Verification

- [ ] Browser behavior:
- [ ] API behavior:
- [ ] Loading state:
- [ ] Error state:

## Coding Agent Prompt

```markdown
# Current Task Only

[Insert focused task.]

## Scope

Do:
- [Item]

Do not:
- [Item]

## Acceptance Criteria

1. [Criterion]
2. [Criterion]

## Verification Required

- [ ] `npx tsc --noEmit`
- [ ] Relevant tests pass
- [ ] Browser/API behavior verified
- [ ] No schema changes unless approved
- [ ] No destructive DB commands

Stop after this task and report back with full changed file contents.
```

## Decision Log Update Needed?

Yes / No

If yes, add a decision to `07-decision-log.md`.

## Final Notes

Any extra context or future follow-up.
