# Coding Agent Spawn Prompt

Use this prompt when starting a fresh coding-agent session.

The goal is to keep every agent session small, controlled, and tied to the current task file.

---

## Fresh Agent Prompt

```text
You are starting a fresh coding-agent session for this project.

Project folder:

legal-prospecting-planning-docs-starter/

Read these files first:

- agents.md
- README.md
- docs/planning/-START-HERE.md
- docs/planning/08-coding-agent-rules.md
- tasks/current-task.md
- tasks/work.md

Your only assignment is the active task in:

tasks/current-task.md

Do not expand scope beyond tasks/current-task.md.

Do not begin the next recommended task.

Do not do opportunistic cleanup.

Do not refactor unrelated files.

Do not install dependencies.

Do not add new tools or frameworks.

Do not add auth, Clerk, Prisma, database work, migrations, seed scripts, saved leads, recent ZIPs, scraping, enrichment, external API calls, AI research passes, dashboard complexity, billing, teams, organizations, or permissions unless tasks/current-task.md explicitly allows it.

Command rule:

Do not run terminal commands.

Do not run npm commands.

Do not run npx commands.

Do not run git commands.

Do not run dev, build, test, lint, install, cleanup, delete, move, copy, or shell inspection commands.

Do not run harmless-looking commands such as:

cd
ls
pwd
git status
npm run build

When a command is useful, list it under:

Commands for human to run

Then stop and wait.

The human controls all commands.

Before editing files:

1. Read the required files.
2. Summarize the active task in your own words.
3. List the files you expect to edit.
4. Confirm that the work stays inside the allowed scope.
5. Then proceed only with the current task.

At the end, update:

tasks/work.md

Final report must include:

- files created
- files changed
- what changed
- why it changed
- commands suggested for the human
- commands run by the agent, which should be none
- manual verification steps
- known risks
- next recommended task

Do not claim the app works unless the human verifies it or the human runs approved commands and shares the result.
```

---

## Current Task Variant

Use this shorter version when the task file is already updated and you are ready for implementation:

```text
You are starting a fresh coding-agent session.

Read:

- agents.md
- README.md
- docs/planning/-START-HERE.md
- docs/planning/08-coding-agent-rules.md
- tasks/current-task.md
- tasks/work.md

Your only assignment is tasks/current-task.md.

Do not expand scope.

Do not run terminal commands.

Do not run cd, ls, pwd, git, npm, npx, dev, build, test, lint, install, cleanup, delete, move, copy, or shell inspection commands.

When a command is useful, write it under “Commands for human to run” and stop.

Before editing, briefly summarize:
- the active task
- files you expect to edit
- what is explicitly out of scope

Then complete only the current task and update tasks/work.md.

Final report must include files changed, what changed, commands suggested for the human, commands run by agent, manual verification steps, known risks, and next recommended task.
```

---

## When to Spawn a New Agent

Start a fresh coding-agent session:

- after each completed task
- before starting a new task from `tasks/current-task.md`
- before anything involving database, auth, migrations, or external data
- after an agent makes a scope or command-control mistake
- when the current chat gets long or messy

Do not let one agent continue into the next task just because it suggested the next task.

The human updates `tasks/current-task.md` first, then starts a fresh agent.