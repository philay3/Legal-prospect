# Phase 6.5 — Post-Deployment Production Verification

## Coding-Agent Handoff

Phase 6.4.2 was completed successfully. The API Contracts document has been updated, local test results have been documented, and the codebase is ready to be committed and deployed.

This active task (Phase 6.5) defines the post-deployment verification plan for the live environment.

---

## Goal

Verify that both the confidence-sorting logic and the Phase 6.3 manual real-firm records are active and correct in the production environment.

---

## Scope

- Production validation only.
- Do not change application behavior.
- Do not change schema, migrations, seed records, or UI copy.
- Do not run terminal commands.

---

## Recommended Verification Plan & Checklist

> [!IMPORTANT]
> Code deployment and production database seeding are separate concerns. Production verification must confirm both of the following:
> 1. **Code is deployed**: The API logic implements the confidence-sorting rule (HIGH > MEDIUM > LOW > UNKNOWN, then alphabetical by firm name).
> 2. **Database is seeded**: The production database contains the Phase 6.3 manual real-firm records (Ballard Spahr LLP, Martin Law LLC, and Nissenbaum Law Group, LLC).

### Verification Steps

1. Make a request to the live search endpoint:
   ```bash
   curl "https://legal-prospect.vercel.app/api/prospects/search?zip=19103"
   ```
2. Verify that the response includes:
   - Ballard Spahr LLP, Martin Law LLC, and Nissenbaum Law Group, LLC as the first three records (under `MEDIUM` confidence level).
   - Alphabetical sorting is applied correctly: Ballard Spahr -> Martin Law -> Nissenbaum Law.
   - Demo prospects follow (under `UNKNOWN` confidence level), sorted alphabetically (Broad Street -> Liberty -> Rittenhouse -> Schuylkill).

---

## Acceptance Criteria

Phase 6.5 is complete when:
- The live endpoint `https://legal-prospect.vercel.app/api/prospects/search?zip=19103` returns results in the correct confidence-first, alphabetical-second order.
- The three real-firm records are successfully verified as present in the production database.
- The user interface at `https://legal-prospect.vercel.app` is verified as functional.

---

## Commands for Human to Run

The coding agent must not run terminal commands.

The human should run:

```bash
# Verify production sorting and record presence
curl "https://legal-prospect.vercel.app/api/prospects/search?zip=19103"
```

---

## Final Report Format for Coding Agent

Use this format:

```markdown
# Phase 6.5 Completion Report

## Production Sorting Verification

## Database Record Presence Verification

## Production URL Checked

## Next Safe Task
```

---

## Guardrails

Do not edit code, schema, seed data, or UI copy.
Do not run terminal commands.

---

## Next Safe Task After Completion

Recommended next task:

```text
Phase 7.1 — Saved Leads Schema Design
```