# Current Task

## Task Name

Create the initial project planning and control files.

## Task Status

Ready for coding-agent work.

## Purpose

Set up the project-control structure before any product features are built.

This task is about creating the files and folders that keep the rebuild controlled, understandable, and safe.

This is not a feature-building task.

---

## Allowed Scope

The coding agent may create this folder and file structure:

```text
/
├── AGENTS.md
├── README.md
├── task/
│   ├── current-task.md
│   ├── work.md
│   └── decisions.md
├── docs/
│   ├── START-HERE.md
│   ├── 00-product-brief.md
│   ├── 01-product-scope.md
│   ├── 02-user-stories.md
│   ├── 03-data-fetching-plan.md
│   ├── 04-auth-account-plan.md
│   ├── 05-database-plan.md
│   ├── 06-api-contracts.md
│   ├── 07-testing-guide.md
│   ├── 08-coding-agent-rules.md
│   └── 09-roadmap.md
```

The coding agent may add starter markdown content to these files.

The starter content should be simple, clear, and focused on project control.

---

## Files to Create or Update

### Required

- `AGENTS.md`
- `README.md`
- `task/current-task.md`
- `task/work.md`
- `task/decisions.md`
- `docs/START-HERE.md`
- `docs/00-product-brief.md`
- `docs/01-product-scope.md`
- `docs/02-user-stories.md`
- `docs/03-data-fetching-plan.md`
- `docs/04-auth-account-plan.md`
- `docs/05-database-plan.md`
- `docs/06-api-contracts.md`
- `docs/07-testing-guide.md`
- `docs/08-coding-agent-rules.md`
- `docs/09-roadmap.md`

---

## Explicitly Out of Scope

Do not add product features.

Do not add authentication.

Do not add Clerk.

Do not add Prisma.

Do not add database models.

Do not add migrations.

Do not add seed data.

Do not add scraping.

Do not add enrichment.

Do not add external API calls.

Do not add saved leads.

Do not add recent ZIP behavior.

Do not add dashboard functionality.

Do not add billing, teams, organizations, or permissions.

Do not install dependencies unless the human explicitly asks.

---

## Command Rules

The coding agent should not run commands by default.

The human user runs commands.

The coding agent may suggest commands and explain them.

Do not run:

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

Never run:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

---

## Expected Result

At the end of this task:

1. The repo has the required planning/control folder structure.
2. The project has an `AGENTS.md` file with operating rules.
3. The `task/` folder exists and includes the current task, work log, and decisions log.
4. The `docs/` folder exists and includes the planned documentation files.
5. No product features have been added.
6. No database work has been done.
7. No auth work has been done.
8. No external data fetching has been added.

---

## Human Verification Steps

After the coding agent finishes, the human should verify:

1. The expected files exist.
2. The files contain markdown content.
3. The coding agent did not add product code.
4. The coding agent did not install dependencies.
5. The coding agent did not run restricted commands.
6. `task/work.md` includes a work log entry for this task.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what each file is for
- commands suggested
- commands run by the human, if any
- known risks
- next recommended task

The coding agent must not claim the project is working as an app.

This task only creates the control structure.

---

## Next Recommended Task After This

After this task is complete, the next recommended task is:

```text
Fill in docs/START-HERE.md
```

Do not begin that task until the human updates `task/current-task.md`.