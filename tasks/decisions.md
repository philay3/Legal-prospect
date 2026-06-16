# Decisions Log

This file records important product, technical, and process decisions for the legal prospecting app rebuild.

The purpose of this file is to prevent the project from losing context over time.

A decision should be recorded when it affects:

- product direction
- rebuild sequence
- database design
- authentication
- data fetching
- user privacy
- command safety
- agent behavior
- testing process
- external services
- scope boundaries

---

## Decision Log Rules

1. Record decisions in plain English.
2. Include the date.
3. Explain what was decided.
4. Explain why the decision was made.
5. Note tradeoffs or risks.
6. Note what would cause the decision to be revisited.
7. Do not delete old decisions. Add a new decision if something changes.

---

## Decision Entry Template

Copy this template for future decisions.

```md
## YYYY-MM-DD — Decision Title

### Decision

State the decision clearly.

### Reason

Explain why this decision was made.

### Tradeoffs / Risks

List what this decision gives up, delays, or makes harder.

### Revisit If

List what would cause this decision to be reconsidered.
```

---

## 2026-06-16 — Controlled Rebuild Instead of Continuing Patch Work

### Decision

Restart the repo, but do not restart the product thinking.

This project will be rebuilt deliberately with tighter scope control, clearer documentation, and stricter coding-agent rules.

### Reason

The old app had valuable progress, but the process became too hard to control.

Known problems included:

- too much coding-agent autonomy
- unclear command boundaries
- Prisma migration drift
- confusing auth/account work
- unclear data-fetching prompts and passes
- AI running commands/tests without the human fully understanding them
- feature work getting mixed together
- long debugging loops around Clerk and Recent ZIP behavior

The issue is now project control, not just code quality.

### Tradeoffs / Risks

A rebuild delays feature work in the short term.

Some old app behavior may need to be re-created later.

There is a risk of over-documenting before building, so docs should stay practical and focused.

### Revisit If

Revisit only if there is a strong reason to salvage part of the old repo safely.

Do not revisit just because rebuilding feels slow.

---

## 2026-06-16 — Project Control Before Product Features

### Decision

The rebuild starts with control files and planning docs before product features.

Initial order:

1. `AGENTS.md`
2. `task/current-task.md`
3. `task/work.md`
4. `task/decisions.md`
5. `docs/START-HERE.md`
6. product docs
7. testing guide
8. data/auth/database plans

### Reason

The user wants more control and less AI autonomy.

The first goal is to create a safe operating system for the project.

### Tradeoffs / Risks

No visible app progress happens immediately.

This is intentional.

The risk is impatience causing a jump into auth, Prisma, enrichment, or dashboard work too early.

### Revisit If

Revisit if the documentation becomes too large or stops helping actual development.

---

## 2026-06-16 — One Task Per Coding-Agent Session

### Decision

The coding agent should work on one clearly defined task per session.

The task must be written in:

```text
task/current-task.md
```

If the requested work is not in that file, the coding agent should stop and ask for the task file to be updated.

### Reason

This prevents scope drift and keeps the human user in control.

### Tradeoffs / Risks

This may feel slower than letting the coding agent handle several related changes at once.

The benefit is that each change remains understandable and reviewable.

### Revisit If

Revisit only if the project becomes stable enough to safely batch very small documentation-only tasks.

Do not batch feature work, database work, auth work, or data-fetching work.

---

## 2026-06-16 — Human Controls Commands

### Decision

The human user runs development, test, build, database, and git commands.

The coding agent may suggest commands and explain what they do, but should not run them by default.

Restricted commands include:

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

Absolutely forbidden commands:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

### Reason

In the old process, commands and debugging loops became hard for the human user to follow.

The new process keeps command execution visible and intentional.

### Tradeoffs / Risks

The coding agent cannot fully verify some changes on its own.

The human must paste results back when help is needed.

### Revisit If

Revisit only for harmless read-only commands after the project is stable and the human explicitly wants that.

Do not revisit destructive database or git commands.

---

## 2026-06-16 — No Clerk by Default

### Decision

Do not use Clerk in the fresh rebuild unless the human user explicitly changes direction.

Preferred future auth direction:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

Do not add:

- passwords
- OAuth
- teams
- organizations
- billing
- enterprise auth

### Reason

Clerk caused confusion and bugs in the old app.

The intended user base is small enough that custom email-code auth with an allowlist is likely simpler and more controllable.

### Tradeoffs / Risks

Custom auth requires careful implementation.

It should not be rushed.

Auth must wait until the app shell, docs, database foundation, and seed data direction are clearer.

### Revisit If

Revisit if the product requirements change to include teams, organizations, enterprise SSO, or many external users.

---

## 2026-06-16 — Global Research Data vs Private User Workflow Data

### Decision

The product will preserve a clear data ownership split.

Global/shared data:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Private/user-specific data:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

### Reason

Law firm research can be reused across users, but a user's saved leads and workflow activity should stay private.

This supports a future product where multiple sales reps benefit from shared research while keeping their personal pipeline separate.

### Tradeoffs / Risks

The database model needs to be designed carefully.

Recent ZIPs, saved leads, notes, and statuses must not accidentally become global.

### Revisit If

Revisit only if the product changes away from multi-user use or if all data becomes single-user/local.

---

## 2026-06-16 — Start With Manual Seed Data Before External Fetching

### Decision

The rebuild should start with manual seed data before adding scraping, enrichment, APIs, browser automation, or prompt-based data fetching.

No data-fetching logic should be added until documented in:

```text
docs/03-data-fetching-plan.md
```

### Reason

The old app became confusing partly because data-fetching prompts, passes, source behavior, and save behavior were not clearly controlled.

Manual seed data lets the app flow and database model be designed before external complexity is added.

### Tradeoffs / Risks

Early search results will not be live or comprehensive.

This is acceptable for the controlled rebuild.

### Revisit If

Revisit after the app has a stable database model, seed data, basic search flow, and clear data-fetching plan.

---

## 2026-06-16 — Auth Is Not the First Build Task

### Decision

Auth should not be the first feature in the new repo.

Recommended build order:

1. new repo
2. docs and control files
3. basic app shell
4. clean Prisma setup
5. seed data
6. custom auth
7. saved leads
8. recent ZIPs
9. external data fetching

### Reason

Auth work created confusion in the old repo.

A basic app and data model should exist before account behavior is added.

### Tradeoffs / Risks

The early app may not have private user behavior.

That is acceptable during the foundation phase.

### Revisit If

Revisit if the app is being deployed publicly earlier than expected.

---

## 2026-06-16 — Testing Should Be Human-Visible and Explained

### Decision

The coding agent should not blindly run tests by default.

For each task, the coding agent should explain:

1. which test or check to run
2. why it matters
3. what passing means
4. what failing might mean

The human runs the command and pastes the result back if help is needed.

### Reason

The user wants to understand testing instead of watching the coding agent run commands automatically.

### Tradeoffs / Risks

Debugging may be slower.

The benefit is that the human user learns what each test means and keeps control of the process.

### Revisit If

Revisit only if the human user explicitly asks the coding agent to run a specific command in a specific session.

---

## 2026-06-16 — Keep the MVP Small

### Decision

The first product version should focus on a simple prospecting workflow:

1. Search by ZIP code.
2. Show law firm prospect results.
3. View useful prospect details.
4. Save good leads later, after the foundation is stable.
5. Add dashboard/private workflow later.

### Reason

The prior project became messy partly because auth, saved leads, recent ZIPs, enrichment, and dashboard behavior overlapped.

The rebuild should prove the core search/prospect flow first.

### Tradeoffs / Risks

Some useful features will be delayed.

This is necessary to avoid another uncontrolled build.

### Revisit If

Revisit after the app shell, seed data, database plan, and first search flow are stable.