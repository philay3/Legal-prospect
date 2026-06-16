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