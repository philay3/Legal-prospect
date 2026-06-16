# Current Task

## Task Name

Create minimal app scaffold and basic home/search page placeholder.

## Task Status

Ready for coding-agent work.

## Purpose

Create the minimal application structure and scaffold needed to render a simple starting page for the legal prospecting workflow.

The goal is not to build search, databases, or auth.

The goal is to create a clean minimal scaffold where the future ZIP search flow will live.

---

## Allowed Scope

The coding agent may:

- Create the minimal app structure and scaffold needed to display a page (e.g., initial Next.js/React layout or basic HTML/JS files as approved by project structure).
- Create a simple home/search starting page placeholder.
- Add product-purpose copy to explain the app's focus (finding small/boutique law firms).
- Add a non-functional ZIP search placeholder/input field.
- Keep layout plain, readable, and clean (Basic CSS, HSL colors, or Outfit/Inter typography, no Tailwind unless explicitly approved).
- Update `tasks/work.md` in the current session.

---

## Explicitly Out of Scope

- Do not add authentication or Clerk.
- Do not add Prisma or database work.
- Do not create database models or migrations.
- Do not add seed data or JSON prospects.
- Do not add saved leads.
- Do not add recent ZIP behavior.
- Do not add scraping or enrichment.
- Do not add external API calls.
- Do not add dashboard complexity.
- Do not add billing, teams, organizations, or permissions.
- Do not install new dependencies unless explicitly approved.
- Do not run `npm run dev` or the development server.
- Do not run tests or build commands unless explicitly approved.
- Do not run git commands (commit, push, clean, reset, etc.).
- Do not run destructive cleanup commands.

---

## Expected Result

At the end of this task:

1. The app has a minimal, cleanly scaffolded folder structure.
2. A home/search page placeholder exists and displays basic product-purpose copy.
3. A non-functional ZIP search input field/placeholder is visible.
4. No search behavior, database, or auth is implemented.
5. `tasks/work.md` has a new entry documenting the session.

---

## Human Verification Steps

The human user runs commands and verifies the browser:

1. Start the local dev server (if desired):
   ```bash
   npm run dev
   ```
2. Open the browser and confirm:
   - The basic app shell/page loads without errors.
   - The product-purpose text is readable and clean.
   - The non-functional ZIP search placeholder/input is visible.
   - No auth prompts or dashboard redirects occur.
3. Verify that no Prisma, Clerk, or external dependencies have been added.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what changed
- why it changed
- commands suggested
- commands run by the human, if any
- manual verification steps
- known risks
- next recommended task

---

## Next Recommended Task After This

After this task is complete, the next recommended task is:

```text
Add manual seed prospect data for one test ZIP code.
```

Do not begin that task until the human updates `tasks/current-task.md`.

# Current Task

## Task Name

Add manual seed prospect data for one test ZIP code.

## Task Status

Ready for coding-agent work.

## Purpose

Create the first local data foundation for the legal prospecting workflow without adding database, search behavior, auth, scraping, enrichment, or external data fetching.

This task should give the app a small, clearly controlled manual dataset that future tasks can use.

The goal is not to make the ZIP search work yet.

The goal is to add a safe local seed-data file for one test ZIP code.

---

## Context

Phase 1 created the basic app shell and non-functional home/search page placeholder.

The next controlled step is to add local manual seed data only.

The product direction remains:

```text
User enters ZIP code → app eventually shows matching small/boutique law firm prospects.
```

This task only prepares the data side for that future flow.

---

## Allowed Scope

The coding agent may:

- create a local data file for manual prospect records
- create a simple TypeScript type or interface for a prospect record if helpful
- add several sample prospect records for one test ZIP code
- clearly label the data as manual/demo seed data
- keep the data structure simple and readable
- update `tasks/work.md`

Recommended file locations:

```text
src/data/prospects.ts
src/types/prospect.ts
```

The coding agent may choose a similarly simple path if it better fits the scaffold.

---

## Seed Data Requirements

Use one test ZIP code only.

Preferred test ZIP:

```text
10001
```

If existing project docs already name a different test ZIP, use that instead and explain why in the final report.

Each prospect record should include simple fields such as:

```text
id
firmName
zip
city
state
website
phone
practiceAreas
attorneyCountRange
sourceType
confidence
notes
```

Keep fields simple.

Do not over-model.

Do not create relational structures.

Do not create database schema.

Do not create Prisma models.

Do not add migrations.

Important data rule:

```text
Seed records should be clearly marked as manual/demo data unless the human provides real verified firm data.
```

Do not invent real-world claims about actual law firms.

Use fictional/demo firm names if no real verified source data is provided by the human.

---

## Explicitly Out of Scope

Do not add search behavior.

Do not make the ZIP input functional.

Do not connect the seed data to the page unless explicitly approved.

Do not add database work.

Do not add Prisma.

Do not add migrations.

Do not add seed scripts.

Do not add auth.

Do not add Clerk.

Do not add saved leads.

Do not add recent ZIP searches.

Do not add dashboards.

Do not add scraping.

Do not add enrichment.

Do not add external APIs.

Do not add AI research passes.

Do not fetch data from the web.

Do not install dependencies.

Do not add state management libraries.

Do not add backend API routes.

Do not add billing, teams, organizations, or permissions.

Do not run terminal commands.

Do not run npm commands.

Do not run npx commands.

Do not run git commands.

Do not run dev, build, test, lint, or cleanup commands.

---

## Command Rule

The coding agent must not run terminal commands.

When a command is useful, list it under:

```text
Commands for human to run
```

Then stop and wait.

The human controls all commands.

---

## Expected Result

At the end of this task:

1. The repo has a small local manual seed-data file.
2. The data covers one test ZIP code only.
3. The data is clearly labeled as manual/demo seed data.
4. The data shape is simple and understandable.
5. No search behavior has been added.
6. No database work has been done.
7. No external fetching has been added.
8. No dependencies have been installed.
9. `tasks/work.md` has a new entry for this task.

---

## Human Verification Steps

The human should review the changed files and verify:

1. The seed data file exists.
2. The records use one ZIP code only.
3. The records are clearly manual/demo data.
4. The data fields are simple and readable.
5. No database, Prisma, auth, external API, or search behavior was added.
6. The ZIP input on the page is still non-functional unless a future task explicitly changes that.

Optional human-run command if the human wants to check TypeScript/build health:

```bash
npm run build
```

The coding agent must not run this command.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what changed
- why it changed
- commands suggested for the human
- commands run by the agent, which should be none
- manual verification steps
- known risks
- next recommended task

The coding agent must not claim the app works unless the human verifies it or approved commands are run by the human.

---

## Next Recommended Task After This

After this task is complete, the next likely task is:

```text
Display manual seed prospects for the test ZIP code in a read-only results placeholder.
```

Do not begin that task until the human updates `tasks/current-task.md`.

# Current Task

## Task Name

Display manual seed prospects for the test ZIP code in a read-only results placeholder.

## Task Status

Ready for coding-agent work.

## Purpose

Connect the existing manual/demo seed data to the visible app shell in the smallest possible way.

This task should show the seeded law firm prospect records on the page as a read-only placeholder.

The goal is not to build real ZIP search yet.

The goal is to prove that the app can display the local manual seed data in a simple, readable results area.

---

## Context

Phase 1 created the basic app shell and non-functional home/search page placeholder.

The previous task added local manual/demo prospect seed data.

Current seed data is expected to live in files similar to:

```text
src/types/prospect.ts
src/data/prospects.ts
```

The seed data uses one test ZIP code.

The previous coding-agent report said the test ZIP is:

```text
19103
```

Use the actual seed data file as the source of truth.

---

## Allowed Scope

The coding agent may:

- import the local manual seed data into the home page
- display the seeded prospects in a simple read-only results section
- show the test ZIP code associated with the displayed results
- show basic prospect details such as firm name, city/state, practice areas, website, phone, attorney count range, confidence, and notes
- keep the existing ZIP input and search button non-functional
- adjust simple vanilla CSS to make the results readable
- update `tasks/work.md`

Expected editable files:

```text
src/app/page.tsx
src/app/globals.css
tasks/work.md
```

The coding agent may edit `src/app/layout.tsx` only if there is a small metadata correction directly related to this task.

---

## Display Requirements

The page should make it clear that the displayed records are:

```text
Manual demo seed data
```

The results area should be read-only.

The displayed records should not require user interaction.

The ZIP input should remain a placeholder.

The search button should remain non-functional.

The page can show the current test ZIP directly, for example:

```text
Showing demo prospects for ZIP 19103
```

Use the actual ZIP from the seed data.

---

## Explicitly Out of Scope

Do not add real search behavior.

Do not make the ZIP input filter records.

Do not add form submission behavior.

Do not add client-side state unless absolutely necessary for display.

Do not add backend API routes.

Do not add database work.

Do not add Prisma.

Do not add migrations.

Do not add seed scripts.

Do not add auth.

Do not add Clerk.

Do not add saved leads.

Do not add recent ZIP searches.

Do not add dashboards.

Do not add scraping.

Do not add enrichment.

Do not add external APIs.

Do not add AI research passes.

Do not fetch data from the web.

Do not install dependencies.

Do not add Tailwind CSS.

Do not add shadcn/ui.

Do not add component libraries.

Do not add Google fonts or external font loading.

Do not add state management libraries.

Do not add billing, teams, organizations, or permissions.

Do not run terminal commands.

Do not run npm commands.

Do not run npx commands.

Do not run git commands.

Do not run dev, build, test, lint, install, cleanup, move, copy, or shell inspection commands.

---

## Command Rule

The coding agent must not run terminal commands.

This includes harmless-looking commands such as:

```bash
cd
ls
pwd
git status
npm run build
```

When a command is useful, list it under:

```text
Commands for human to run
```

Then stop and wait.

The human controls all commands.

---

## Expected Result

At the end of this task:

1. The home page displays the local manual/demo seed prospects.
2. The displayed records are read-only.
3. The page clearly labels the records as manual/demo seed data.
4. The page shows the test ZIP associated with the records.
5. The ZIP input remains non-functional.
6. The search button remains non-functional.
7. No database work has been done.
8. No external fetching has been added.
9. No dependencies have been installed.
10. `tasks/work.md` has a new entry for this task.

---

## Human Verification Steps

The human should run the app if they choose:

```bash
npm run dev
```

The human should then verify:

1. The app loads.
2. The home page is visible.
3. The local demo prospect records are displayed.
4. The displayed ZIP matches the seed data.
5. The records are clearly labeled as manual/demo data.
6. The ZIP input does not perform real search.
7. The search button does not perform real search.
8. No sign-in is required.
9. No database, Prisma, auth, or external data fetching has been added.

Optional human-run build check:

```bash
npm run build
```

The coding agent must not run either command.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what changed
- why it changed
- commands suggested for the human
- commands run by the agent, which should be none
- manual verification steps
- known risks
- next recommended task

The coding agent must not claim the app works unless the human verifies it or approved commands are run by the human.

---

## Next Recommended Task After This

After this task is complete, the next likely task is:

```text
Make the ZIP input display matching local seed prospects for the test ZIP only.
```

Do not begin that task until the human updates `tasks/current-task.md`.

# Current Task

## Task Name

Display manual seed prospects for the test ZIP code in a read-only results placeholder.

## Task Status

Ready for coding-agent work.

## Purpose

Connect the existing manual/demo seed data to the visible app shell in the smallest possible way.

This task should show the seeded law firm prospect records on the page as a read-only placeholder.

The goal is not to build real ZIP search yet.

The goal is to prove that the app can display the local manual seed data in a simple, readable results area.

---

## Context

Phase 1 created the basic app shell and non-functional home/search page placeholder.

The previous task added local manual/demo prospect seed data.

Current seed data is expected to live in files similar to:

```text
src/types/prospect.ts
src/data/prospects.ts
```

The seed data uses one test ZIP code.

The previous coding-agent report said the test ZIP is:

```text
19103
```

Use the actual seed data file as the source of truth.

---

## Allowed Scope

The coding agent may:

- import the local manual seed data into the home page
- display the seeded prospects in a simple read-only results section
- show the test ZIP code associated with the displayed results
- show basic prospect details such as firm name, city/state, practice areas, website, phone, attorney count range, confidence, and notes
- keep the existing ZIP input and search button non-functional
- adjust simple vanilla CSS to make the results readable
- update `tasks/work.md`

Expected editable files:

```text
src/app/page.tsx
src/app/globals.css
tasks/work.md
```

The coding agent may edit `src/app/layout.tsx` only if there is a small metadata correction directly related to this task.

---

## Display Requirements

The page should make it clear that the displayed records are:

```text
Manual demo seed data
```

The results area should be read-only.

The displayed records should not require user interaction.

The ZIP input should remain a placeholder.

The search button should remain non-functional.

The page can show the current test ZIP directly, for example:

```text
Showing demo prospects for ZIP 19103
```

Use the actual ZIP from the seed data.

---

## Explicitly Out of Scope

Do not add real search behavior.

Do not make the ZIP input filter records.

Do not add form submission behavior.

Do not add client-side state unless absolutely necessary for display.

Do not add backend API routes.

Do not add database work.

Do not add Prisma.

Do not add migrations.

Do not add seed scripts.

Do not add auth.

Do not add Clerk.

Do not add saved leads.

Do not add recent ZIP searches.

Do not add dashboards.

Do not add scraping.

Do not add enrichment.

Do not add external APIs.

Do not add AI research passes.

Do not fetch data from the web.

Do not install dependencies.

Do not add Tailwind CSS.

Do not add shadcn/ui.

Do not add component libraries.

Do not add Google fonts or external font loading.

Do not add state management libraries.

Do not add billing, teams, organizations, or permissions.

Do not run terminal commands.

Do not run npm commands.

Do not run npx commands.

Do not run git commands.

Do not run dev, build, test, lint, install, cleanup, move, copy, or shell inspection commands.

---

## Command Rule

The coding agent must not run terminal commands.

This includes harmless-looking commands such as:

```bash
cd
ls
pwd
git status
npm run build
```

When a command is useful, list it under:

```text
Commands for human to run
```

Then stop and wait.

The human controls all commands.

---

## Expected Result

At the end of this task:

1. The home page displays the local manual/demo seed prospects.
2. The displayed records are read-only.
3. The page clearly labels the records as manual/demo seed data.
4. The page shows the test ZIP associated with the records.
5. The ZIP input remains non-functional.
6. The search button remains non-functional.
7. No database work has been done.
8. No external fetching has been added.
9. No dependencies have been installed.
10. `tasks/work.md` has a new entry for this task.

---

## Human Verification Steps

The human should run the app if they choose:

```bash
npm run dev
```

The human should then verify:

1. The app loads.
2. The home page is visible.
3. The local demo prospect records are displayed.
4. The displayed ZIP matches the seed data.
5. The records are clearly labeled as manual/demo data.
6. The ZIP input does not perform real search.
7. The search button does not perform real search.
8. No sign-in is required.
9. No database, Prisma, auth, or external data fetching has been added.

Optional human-run build check:

```bash
npm run build
```

The coding agent must not run either command.

---

## Required Final Report From Coding Agent

At the end of the task, the coding agent must report:

- files created
- files changed
- what changed
- why it changed
- commands suggested for the human
- commands run by the agent, which should be none
- manual verification steps
- known risks
- next recommended task

The coding agent must not claim the app works unless the human verifies it or approved commands are run by the human.

---

## Next Recommended Task After This

After this task is complete, the next likely task is:

```text
Make the ZIP input display matching local seed prospects for the test ZIP only.
```

Do not begin that task until the human updates `tasks/current-task.md`.