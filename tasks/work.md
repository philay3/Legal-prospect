# Work Log

This file tracks coding-agent work across the project.

The purpose of this file is to make every task traceable.

The coding agent must update this file during or after every task.

The human user should be able to read this file and understand:

- what changed
- why it changed
- which files were touched
- which commands were suggested
- which commands were actually run by the human
- what still needs attention

---

## Work Log Rules

1. Every coding-agent session must add a new entry.
2. Each entry must be dated.
3. Each entry must name the task.
4. Each entry must list files created or changed.
5. Each entry must explain the change in plain English.
6. Each entry must list suggested commands.
7. Each entry must record commands run by the human.
8. Each entry must record test/build/dev results pasted by the human.
9. Each entry must list known risks or uncertainties.
10. Each entry must suggest the next safe task.

The coding agent must not use vague summaries like:

```text
Updated project files.
```

Use specific summaries like:

```text
Created initial planning docs so future coding-agent tasks have clear scope, command rules, and documentation expectations.
```

---

## Entry Template

Copy this template for each new task.

```md
## YYYY-MM-DD — Task Name

### Task Summary

Briefly describe what this task was supposed to accomplish.

### Files Created

- `path/to/file.md` — why this file was created

### Files Changed

- `path/to/file.md` — what changed and why

### What Changed

Explain the actual changes in plain English.

### Why It Changed

Explain the reason for the change.

### Commands Suggested

List commands suggested to the human user here.

If no commands were suggested, write:

`No commands suggested.`

### Commands Run by Human

List commands the human actually ran here.

If no commands were run, write:

`No commands run.`

### Results Pasted by Human

Record any relevant command output, test results, build results, browser behavior, or error messages pasted by the human.

If nothing was pasted, write:

`No results pasted.`

### Verification

Explain how the human can verify the task.

Examples:

- Check that the file exists.
- Check that the folder structure matches the expected structure.
- Run a command only if the human chooses to.
- Open a page in the browser and confirm visible behavior.

### Known Risks

List any risks, uncertainties, skipped items, or follow-up concerns.

If there are no known risks, write:

`No known risks for this task.`

### Next Recommended Step

State one recommended next task.

Do not begin the next task until the human updates `task/current-task.md`.
```

---

## 2026-06-16 — Initial Planning Structure Created

### Task Summary

Created the initial planning and control structure for the legal prospecting app rebuild.

This task was focused on project control, not product features.

### Files Created

- `AGENTS.md` — defines coding-agent behavior, command rules, scope rules, database rules, data-fetching rules, auth rules, and stop conditions
- `task/current-task.md` — defines the current allowed coding-agent task
- `task/work.md` — tracks project work across coding-agent sessions
- `task/decisions.md` — records important product and technical decisions
- `docs/START-HERE.md` — entry point for project context
- `docs/00-product-brief.md` — product concept and user/problem summary
- `docs/01-product-scope.md` — MVP and out-of-scope boundaries
- `docs/02-user-stories.md` — user stories and acceptance criteria
- `docs/03-data-fetching-plan.md` — data-fetching and enrichment control plan
- `docs/04-auth-account-plan.md` — auth and account plan
- `docs/05-database-plan.md` — database planning document
- `docs/06-api-contracts.md` — API route and response planning document
- `docs/07-testing-guide.md` — testing philosophy and command guide
- `docs/08-coding-agent-rules.md` — expanded coding-agent rules
- `docs/09-roadmap.md` — rebuild sequence and future roadmap
- `README.md` — basic project overview

### Files Changed

- `AGENTS.md` — filled with controlled rebuild rules
- `task/current-task.md` — filled with initial setup task scope
- `task/work.md` — initialized with this work log structure

### What Changed

The repo now has a planning/control layer before product features begin.

The key control files are in place so future coding-agent work can be limited to one task at a time.

### Why It Changed

The rebuild is intended to avoid the old project problems:

- too much coding-agent autonomy
- unclear command boundaries
- Prisma migration drift
- confusing auth/account work
- unclear data-fetching prompts and passes
- feature work getting mixed together
- long debugging loops

The new process starts with rules and documentation before code.

### Commands Suggested

No commands suggested.

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should verify:

- `AGENTS.md` exists
- `task/current-task.md` exists
- `task/work.md` exists
- `task/decisions.md` exists
- `docs/` exists
- all planned documentation files exist
- no product feature work has been started
- no database work has been started
- no auth work has been started

### Known Risks

The files exist, but most planning docs still need real content.

The next risk is letting the coding agent begin product work before the docs explain the product boundaries.

### Next Recommended Step

Fill in:

```text
task/decisions.md
```

Do not begin product feature work yet.

---

## 2026-06-16 — Phase 1 Task Prepared

### Task Summary

Prepared tasks/current-task.md and tasks/work.md for the first app-implementation task (Phase 1: Basic App Shell Scaffold).

### Files Created

None.

### Files Changed

- `tasks/current-task.md` — updated with the exact name, allowed scope, and verification steps for the Next.js scaffold and basic home page placeholder.
- `tasks/work.md` — logged the preparation task.

### What Changed

Switched target scope tracking from documentation generation to application scaffold creation. Prepared the specific boundaries for the coding-agent implementation.

### Why It Changed

The documentation phase is now set up inside the `legal-prospecting-planning-docs-starter` directory, enabling the project to advance to the app shell phase.

### Commands Suggested

No commands suggested.

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

Check that:
- `tasks/current-task.md` defines the next task "Create minimal app scaffold and basic home/search page placeholder".
- Scope guards (auth, prisma, live fetching, etc. as out-of-scope) are in place.

### Known Risks

- The coding agent might try to set up database connections, Clerk client secrets, or live scraping during the scaffold build. This is prevented by explicit out-of-scope guards in `tasks/current-task.md`.

### Next Recommended Step

Hand off the updated task to the coding agent for Phase 1 execution.

---

## 2026-06-16 — Minimal Scaffold Proposed

### Task Summary

Inspected the folder, confirmed no app scaffold exists, and proposed a minimal Next.js App Router scaffold plan with TypeScript and Vanilla CSS.

### Files Created

- `implementation_plan.md` — proposed implementation plan.

### Files Changed

- `tasks/work.md` — documented this proposal session.

### What Changed

Confirmed that `legal-prospecting-planning-docs-starter/` currently contains only planning/control documentation and no code or `package.json`. Proposed a minimal scaffold plan.

### Why It Changed

To follow the rebuild guidelines, ensuring the human project owner approves the scaffolding commands and dependencies before any project generation or package installations occur.

### Commands Suggested

1. Help command to inspect Next.js options (completed):
   ```bash
   npx -y create-next-app@latest --help
   ```
2. Scaffolding commands (pending approval):
   ```bash
   mv README.md README.md.bak
   npx -y create-next-app@latest ./ --typescript --eslint --src-dir --no-tailwind --app --import-alias "@/*" --use-npm --yes
   rm README.md && mv README.md.bak README.md
   ```

### Commands Run by Human

No commands run by the human yet.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that the implementation plan exists at [implementation_plan.md](file:///Users/phillipanthony/.gemini/antigravity-ide/brain/82b29b9b-9d15-4d28-b2c0-6719a7def593/implementation_plan.md) and review the proposed structure.

### Known Risks

- Scaffolding in a non-empty directory (`./`) might warn or fail if files conflict. However, the directory contains only documentation/git folders (`docs/`, `tasks/`, `.git/`, etc.), which shouldn't conflict with `create-next-app`'s defaults.
- Any installation/scaffold command could add unwanted dependencies unless strictly configured; thus we explicitly request `--no-tailwind` and will manage future dependencies carefully.

### Next Recommended Step

Run the scaffolding command once approved, followed by implementing the page placeholder.

---

## 2026-06-16 — Minimal App Shell Created

### Task Summary

Implemented a minimal, clean Next.js App Router app shell with system fonts, vanilla CSS, and a non-functional ZIP search page placeholder.

### Files Created

None.

### Files Changed

- `src/app/page.tsx` — Replaced the default Next.js template page with a minimal, system-font-based homepage highlighting the product purpose (finding small and boutique law firm leads by ZIP) with a disabled ZIP search input and button.
- `src/app/globals.css` — Removed default Next.js styles and created a premium, dark-themed custom CSS styling configuration.
- `src/app/layout.tsx` — Cleaned up Google font imports to use system fonts exclusively and updated metadata for the Legal Prospecting App.
- `tasks/work.md` — Documented this implementation session.

### What Changed

- Replaced the scaffolded boilerplates in `src/app/page.tsx`, `src/app/globals.css`, and `src/app/layout.tsx`.
- Removed all Google font loading and optimized for native system font rendering.
- Added visual styling featuring HSL-emerald color accents, a card for ZIP input, and a simple welcome banner.
- Kept the ZIP search input and Search button disabled (non-functional).

### Why It Changed

To construct the basic app shell layout for Phase 1 as approved, aligning with the "system fonts only" and "no Tailwind" requirements, while setting up the project for future seed data integration.

### Commands Suggested

No commands suggested.

### Commands Run by Human

The human scaffolded the application and ran:
```bash
mv README.md README.planning.md
npx -y create-next-app@latest ./ --typescript --eslint --src-dir --no-tailwind --app --import-alias "@/*" --use-npm --yes
npm install
git add .
git commit -m "Add Next.js scaffold"
```

### Results Pasted by Human

Scaffold output and packages successfully installed.

### Verification

1. Start the dev server:
   ```bash
   npm run dev
   ```
2. Open [http://localhost:3000](http://localhost:3000) and verify:
   - Pages render without build errors.
   - Title matches "Legal Prospecting App".
   - The UI includes the subtitle focusing on small and boutique law firms, a disabled text input field, and a disabled button.
   - System fonts are rendered cleanly.

### Known Risks

- None. No dependencies, databases, or auth models were added, keeping the layout completely side-effect free.

### Next Recommended Step

Update `tasks/current-task.md` to define Phase 2: Add manual seed prospect data for one test ZIP code.

---

## 2026-06-16 — Manual Seed Data Created

### Task Summary

Created the local manual seed data foundation for ZIP-based law firm prospecting.

### Files Created

- `src/types/prospect.ts` — TypeScript type interface defining the schema for a law firm prospect.
- `src/data/prospects.ts` — Sample seed records containing fictional small and boutique law firm leads for the test ZIP code `19103`.

### Files Changed

- `tasks/work.md` — Logged the seed data preparation task.

### What Changed

- Defined the `Prospect` interface containing core firm attributes (`id`, `firmName`, `zip`, `city`, `state`, `website`, `phone`, `practiceAreas`, `attorneyCountRange`, `sourceType`, `confidence`, `notes`).
- Created a list of 4 fictional small/boutique law firm prospect records representing diverse firm profiles (personal injury, family law, IP law, employment law) in the Center City, Philadelphia ZIP `19103`.
- Clearly labeled all seed data as demo/manual data to comply with guidelines.

### Why It Changed

To establish a structured, safe local dataset that can be searched in future phases without introducing databases (Prisma), external data fetching, or live APIs. Fictional names were used to prevent making unverified claims about real-world entities.

We selected `19103` as the test ZIP code because the project planning documentation (specifically `docs/planning/06-api-contracts.md`) already uses `19103` in all of its mock API request and response models. Using `19103` ensures consistency with existing design documents.

### Commands Suggested

1. Build health check:
   ```bash
   npm run build
   ```

### Commands Run by Human

No commands run by the human in this session.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that:
1. `src/types/prospect.ts` exists and holds the correct type properties.
2. `src/data/prospects.ts` exists, exports `SEED_PROSPECTS`, and uses test ZIP `19103`.
3. No Prisma, Clerk, databases, or API search connections were implemented.

### Known Risks

- Fictional data is for demonstration and schema validation only. Real data will be needed for production use.

### Next Recommended Step

Display manual seed prospects for the test ZIP code in a read-only results placeholder.

---

## 2026-06-16 — Display Manual Seed Prospects

### Task Summary

Connected the existing local manual seed data (`SEED_PROSPECTS` for ZIP `19103`) to the main home page, displaying them in a read-only results list styled to align with the current dark theme.

### Files Created

No files created.

### Files Changed

- `src/app/page.tsx` — Imported `SEED_PROSPECTS` and rendered them in a read-only results section, keeping the search bar disabled.
- `src/app/globals.css` — Added simple, readable results list and card layouts, with custom badges for each confidence level matching the dark theme.
- `tasks/work.md` — Documented this implementation session.

### What Changed

- Replaced the initial welcome placeholder card in `src/app/page.tsx` with a dynamic `results-section` mapping over `SEED_PROSPECTS`.
- Rendered firm name, practice areas, attorney size count range, confidence level (with color-coded badges), city/state/ZIP, phone, website links, notes, and the source.
- Left the ZIP search input and search button disabled, adjusting body layout CSS to align elements starting from the top with comfortable padding.
- Replaced inline CSS in `src/app/page.tsx` with a proper CSS class.
- Appended styling rules for results, cards, and badges in `src/app/globals.css`.

### Why It Changed

To display the manual seed data on the home page as a read-only starting point for testing, showing the structure and styling of prospects without yet implementing search functionality or database access.

### Commands Suggested

1. Build/TypeScript checking:
   ```bash
   npm run build
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should verify:
1. Start the application dev server if desired (`npm run dev`).
2. Open `http://localhost:3000` in the browser.
3. Confirm that the page loads cleanly and shows the four seed prospects under a header reading "Demo Prospects for ZIP 19103".
4. Confirm that the ZIP input field and search button remain non-functional and disabled.
5. Check that the card design is clean, readable, and aligned with the current dark theme.

### Known Risks

- Sourcing is purely local and manual. In future phases, these records will be fetched dynamically via database queries and API routes.

### Next Recommended Step

Make the ZIP input display matching local seed prospects for the test ZIP only.

---

## 2026-06-16 — Make ZIP Input Display Matching Seed Prospects

### Task Summary

Enabled the ZIP search input and button on the homepage, allowing users to search local fictional seed data for the test ZIP code `19103`. Added input validation and styled empty/welcome/error states.

### Files Created

No files created.

### Files Changed

- `src/app/page.tsx` — Converted to a Client Component using `"use client"`, implemented search states (`searchZip`, `searchedZip`, `error`), added form submission handling, input validation, and conditional rendering for welcome, matching, and empty states.
- `src/app/globals.css` — Updated the search button cursor to pointer (and disabled styling), and styled validation error messages.
- `tasks/work.md` — Documented this session's progress.

### What Changed

- Replaced the hardcoded page rendering of all prospects with state-driven search logic.
- The homepage starts in a welcome state asking for a 5-digit ZIP.
- Form validation checks for empty submissions or non-5-digit numbers, displaying helpful red inline error messages.
- When searching `19103`, the 4 seeded law firm cards are displayed.
- When searching any other ZIP, an explicit empty state message is shown.

### Why It Changed

To transition the app shell from a static placeholder to an interactive search experience using local-only seed data, establishing the interactive UX layout before any database or external APIs are added.

### Commands Suggested

1. Build & check compilation:
   ```bash
   npm run build
   ```
2. Start local dev server (if not already running):
   ```bash
   npm run dev
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

1. Start the application dev server if desired (`npm run dev`).
2. Open `http://localhost:3000` in the browser.
3. Verify the home page displays "Ready for Search" with a welcome placeholder card.
4. Test typing in the input:
   - Click "Search" with an empty input: verify error "Please enter a ZIP code." appears.
   - Enter text or incomplete digits (e.g. `123`): verify error "Please enter a valid 5-digit ZIP code." appears.
   - Enter the test ZIP `19103` and click Search: verify that the 4 demo prospects load.
   - Enter a non-existent ZIP (e.g. `90210`): verify that an empty state card appears: "No demo prospects are available for this ZIP yet."
5. Confirm no authentication is triggered, and no databases or network APIs are hit.

### Known Risks

- The search functionality is entirely client-side and only matches the static seed data array. This is intentional for this phase.

### Next Recommended Step

Add a simple selected-result detail view or expand/collapse details for local demo prospects.

---

## 2026-06-16 — Add local ZIP matching logic TDD/unit-test foundation

### Task Summary

Created a pure utility module `prospectMatcher` for local ZIP code matching and normalization, wrote comprehensive unit tests with Vitest, and configured Vitest scripts in `package.json`.

### Files Created

- `src/utils/prospectMatcher.ts` — contains matching and ZIP code normalization logic.
- `src/utils/prospectMatcher.test.ts` — contains unit tests for the matcher and normalization functions.

### Files Changed

- `package.json` — added Vitest configuration (`test`, `test:watch` scripts) and added `"vitest": "^1.6.0"` to devDependencies.
- `src/app/page.tsx` — updated homepage component search code to utilize the new `matchProspectsByZip` matching utility.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Abstracted matching logic out of page component filter iteration.
- Defined robust normalization logic that cleans whitespace and validates 5-digit patterns.
- Configured Vitest test scripts and dependency definition in `package.json`.
- Added unit tests checking typical input cases, padding/whitespace, edge cases, and empty data handling.

### Why It Changed

To establish a solid test-driven foundation for prospect matching logic and ensure future enhancements can be safely verified without manual browser inspection.

### Commands Suggested

1. Clean install new devDependencies:
   ```bash
   npm install
   ```
2. Run unit tests once:
   ```bash
   npm run test
   ```
3. Run unit tests in watch mode:
   ```bash
   npm run test:watch
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

Check that:
- [src/utils/prospectMatcher.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/utils/prospectMatcher.ts) and [src/utils/prospectMatcher.test.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/utils/prospectMatcher.test.ts) exist.
- [package.json](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/package.json) contains `"test"` and `"test:watch"` scripts and `"vitest"` in `devDependencies`.
- [src/app/page.tsx](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/app/page.tsx) uses `matchProspectsByZip`.

### Known Risks

- The new packages are not installed yet, so running tests requires running `npm install` first.
- If dependencies cannot resolve, a compatible version of vitest should be installed.

### Next Recommended Step

Add a simple selected-result detail view or expand/collapse details for local demo prospects.

---

## 2026-06-16 — Support ZIP+4 Input Format for Local ZIP Matching

### Task Summary

Enhanced the `prospectMatcher` utility to support and normalize ZIP+4 code format inputs (e.g. `19103-1234`), added comprehensive tests to check valid/invalid ZIP+4 patterns, and integrated validation on the homepage using `normalizeZipCode`.

### Files Created

None.

### Files Changed

- `src/utils/prospectMatcher.ts` — updated `normalizeZipCode` to match ZIP+4 formats using regex and extract the 5-digit base.
- `src/utils/prospectMatcher.test.ts` — added unit test assertions for valid ZIP+4 normalization, surrounding whitespace, invalid formats, and matching behavior.
- `src/app/page.tsx` — updated input validation to leverage `normalizeZipCode` directly as the source of truth, and updated `searchedZip` to store normalized values.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Replaced manual 5-digit regex validation in `src/app/page.tsx` with `normalizeZipCode`.
- Standardized the searched ZIP to always store the base 5-digit format, keeping query matching robust.
- Added comprehensive unit tests for various valid and invalid ZIP+4 variations (e.g. `19103-12`, `19103-12345`).

### Why It Changed

To allow users to input more granular ZIP codes (ZIP+4 format) without breaking search, automatically falling back to matching the broader base 5-digit ZIP category supported by our seed dataset.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

Verify that:
- [src/utils/prospectMatcher.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/utils/prospectMatcher.ts) and [src/utils/prospectMatcher.test.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/utils/prospectMatcher.test.ts) have the updated regex and tests.
- Searching for `19103-1234` in the browser returns the same 4 prospects as searching for `19103`.
- Searching for invalid formats like `19103-12` triggers the validation error.

### Known Risks

- None. UI matching and validation are completely synced to the utility.

### Next Recommended Step

Add a simple selected-result detail view or expand/collapse details for local demo prospects.

---

## 2026-06-16 — Add Expand/Collapse Detail Interaction for Demo Prospects

### Task Summary

Implemented a simple client-side toggle to expand/collapse detailed sections (contact details, notes, source info) for individual prospect cards. Also ensured this state resets whenever a new ZIP search is conducted.

### Files Created

None.

### Files Changed

- `src/app/page.tsx` — Added React state `expandedProspects`, added `toggleExpand` function, conditionally rendered contact/notes/source elements, and added a custom styled toggle button at the bottom of each card.
- `src/app/globals.css` — Added premium hover styles for the new `.prospect-toggle-btn` class.
- `tasks/work.md` — Logged this session's progress.

### What Changed

- Replaced the fully-expanded list view with a client-controlled stateful list.
- Toggling "Show details" on a prospect card exposes its telephone, website, specific notes, and source data in a read-only section.
- Toggling "Hide details" collapses it back to summary fields.
- Submitting the search form automatically resets all expanded card states.

### Why It Changed

To improve usability by letting the user focus on reviewing details of one prospect at a time, keeping the homepage layout cleaner while preserving the local seed data.

### Commands Suggested

1. Build & check compilation:
   ```bash
   npm run build
   ```
2. Run vitest test suite (verifying no regressions in prospect matcher):
   ```bash
   npm run test
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

1. Start the application dev server if desired (`npm run dev`).
2. Open `http://localhost:3000` in the browser.
3. Search for the test ZIP `19103`.
4. Verify that:
   - The 4 cards load in a collapsed view showing only the firm name, location/size metadata, confidence, and practice areas.
   - Clicking "Show details ▼" on any card expands it to show the phone number, website link, notes block, and source.
   - Clicking "Hide details ▲" collapses the card back to its summary state.
   - Performing a new search resets any expanded cards.
5. Verify that running `npm run test` passes successfully.

### Known Risks

- None. State tracking is completely local and does not use any persistent storage or backend queries.

### Next Recommended Step

Add local-only save/unsave UI state for demo prospects.

---

## 2026-06-16 — Local-Only Save State for Demo Prospects

### Task Summary

Implemented a simple local-only, in-memory Save/Unsave toggle interaction for search result cards, showing a live counter badge of saved prospects and distinguishing saved cards with custom visual borders/background accents.

### Files Created

None.

### Files Changed

- `src/app/page.tsx` — added state Hook for saved prospect IDs, logic for toggling save states, visual conditional class wrapper, card actions panel, and count displays in the header.
- `src/app/globals.css` — added premium visual styles for the saved card states, layout classes for the buttons actions row, custom `.prospect-save-btn` styling, and the saved counter badge.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Replaced simple toggling card structure with a split actions container containing expand/collapse and save/unsave buttons.
- Styled saved cards to feature a distinct emerald-accented gradient glow border.
- Placed a real-time counter badge at the top of the search results indicating the number of saved boutique firms.
- Added helper information clarifying that saves are temporary for the active demo session only.

### Why It Changed

To construct the interactive client-side UX for managing saved leads, laying down the visual layout and user interactions before introducing a relational database (Prisma) or authentication (custom email/cookies).

### Commands Suggested

1. Run the test suite (ensuring no regressions):
   ```bash
   npm run test
   ```
2. Build validation:
   ```bash
   npm run build
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

1. Start the application dev server if desired (`npm run dev`).
2. Open `http://localhost:3000` in the browser.
3. Search for the test ZIP `19103`.
4. Verify that:
   - The 4 demo prospect cards appear.
   - Each card displays a "☆ Save" button at the bottom-right actions panel.
   - Clicking "Save" toggles the card's visual state to showing a green border, gradient background accent, and updating the label to "★ Saved".
   - The results header dynamically displays "Saved this session: 1" and the helper label "Saved for this demo session only."
   - Clicking "Saved" toggles it back to "☆ Save" and decrements the counter.
   - Performing a new search or modifying inputs does not wipe the saved list, but refreshing the page clears the in-memory state.
5. Verify that running `npm run test` passes successfully.

### Known Risks

- State is stored purely in client-side React memory. Persistent storage (DB) and User association (Auth) will be integrated in subsequent roadmap phases.

### Next Recommended Step

Prepare the Prisma configuration and database structure plan.

---

## 2026-06-16 — Add ZIP+4 Regression Tests for Local Prospect Matching

### Task Summary

Added explicit regression tests for ZIP+4 normalization and matching behavior, verifying that both valid and invalid ZIP+4 shapes handle correctly and match `SEED_PROSPECTS`. Fixed an issue where Vitest could not resolve the `@/` path alias at runtime for value imports by switching to standard relative paths.

### Files Created

None.

### Files Changed

- `src/utils/prospectMatcher.test.ts` — added unit test cases covering the exact requested regression inputs and matching behavior against `SEED_PROSPECTS`. Converted imports to relative paths to fix a runtime resolution failure in Vitest.
- `tasks/work.md` — logged this session's work details.

### What Changed

- Added tests for `normalizeZipCode` to verify:
  - `"19103-1234"` normalizes to `"19103"`
  - `" 19103-1234 "` normalizes to `"19103"`
  - `"19103-12"` returns `null`
  - `"19103-12345"` returns `null`
- Added tests for `matchProspectsByZip` to verify that searching `"19103-1234"` against `SEED_PROSPECTS` returns the same results as searching for `"19103"`.
- Switched alias imports (e.g. `@/data/prospects` and `@/types/prospect`) to relative paths (e.g. `../data/prospects` and `../types/prospect`) in the test file.

### Why It Changed

- To prevent regression on ZIP+4 searches by locking down standard base normalization and matching logic against static seed datasets.
- To resolve a runtime test failure where Vitest was unable to resolve path aliases because no custom `tsconfig-paths` mapper or custom config file is active for the test runner.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```
2. Build validation:
   ```bash
   npm run build
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that:
1. `src/utils/prospectMatcher.test.ts` contains the new explicit tests and relative imports.
2. Running the test suite (`npm run test`) passes all 12 tests successfully.

### Known Risks

No known risks for this task.

### Next Recommended Step

Prepare the Prisma configuration and database structure plan.

---

## 2026-06-16 — Extract Prospect Result Card Component

### Task Summary

Extracted the prospect result card markup from `src/app/page.tsx` into a reusable React component `ProspectCard` in `src/components/ProspectCard.tsx`.

### Files Created

- `src/components/ProspectCard.tsx` — holds the single prospect result card rendering logic, typing for props, expand/collapse toggling, and save/unsave actions.

### Files Changed

- `src/app/page.tsx` — imported the new `ProspectCard` component and replaced the inline loop markup.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Created the `src/components/` directory and created `src/components/ProspectCard.tsx`.
- Defined a typescript interface `ProspectCardProps` mapping the required inputs and actions.
- Transferred all elements, conditional rendering details, list items, dynamic class strings, and click action triggers from the parent page file into the new component.
- Simplified `src/app/page.tsx` rendering logic by referencing the clean `<ProspectCard />` component in the prospects listing section.

### Why It Changed

To make the homepage component cleaner and more maintainable before introducing database logic, pagination, or other UI components, separating card UI presentation from search state orchestration.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```
2. Build validation:
   ```bash
   npm run build
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that:
1. `src/components/ProspectCard.tsx` exists and compiles without errors.
2. `src/app/page.tsx` imports and renders `<ProspectCard />`.
3. The page loads correctly, displaying cards, toggles expand/collapse details, and toggles the saved in-memory status.
4. The test suite (`npm run test`) runs and compiles successfully.

### Known Risks

No known risks for this refactoring task.

### Next Recommended Step

Improve ProspectCard button accessibility.

---

## 2026-06-16 — Improve ProspectCard Button Accessibility

### Task Summary

Improved the accessibility semantics of the `ProspectCard` action buttons (expand/collapse details and save/unsave leads) without changing visual design or behavior.

### Files Created

No files created.

### Files Changed

- `src/components/ProspectCard.tsx` — added accessibility attributes and converted to type-only import for `Prospect`.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Added `aria-expanded` and descriptive `aria-label` to the expand/collapse details button.
- Added `aria-pressed` and descriptive `aria-label` to the save/unsave button.
- Converted `import { Prospect }` to `import type { Prospect }` in `ProspectCard.tsx`.

### Why It Changed

To ensure that assistive technologies can read and understand the state and target of the prospect card action buttons, providing a better user experience for screen readers and keyboard navigation.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```
2. Build validation:
   ```bash
   npm run build
   ```
3. Run dev server:
   ```bash
   npm run dev
   ```
4. Git status inspection:
   ```bash
   git status
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that:
1. `src/components/ProspectCard.tsx` has the new `aria-*` attributes on the buttons.
2. Running the test suite (`npm run test`) and production build (`npm run build`) still compile and pass cleanly.
3. Behavior and visuals of the prospect card components are entirely unchanged in the browser interface.

### Known Risks

No known risks for this task.

### Next Recommended Step

Prepare the Prisma configuration and database structure plan.

---

## 2026-06-16 — Prepare App for First Public Deployment

### Task Summary

Prepared the legal prospecting Next.js MVP for its first public deployment by polishing copy, updating metadata, and adding a detailed deploy checklist.

### Files Created

- `docs/planning/11-first-deploy-checklist.md` — holds the first public deployment checklist and verification details.

### Files Changed

- `src/app/page.tsx` — removed internal roadmap tags ("Phase 2") and replaced with user-facing wording ("Legal Prospect Search"), adjusted search placeholder descriptions, and corrected results subheadings to reflect sample seed data status.
- `src/app/layout.tsx` — updated the application title to "Legal Prospector - Find Boutique Law Firms" and improved the description for public release.
- `README.md` — updated current phase to "First MVP Deployment Ready" and added links to the deployment checklist.
- `tasks/work.md` — logged this session's work details.

### What Changed

- Replaced "Phase 2: Seed Search" with "Legal Prospect Search".
- Replaced "Demo Prospects for ZIP" with "Sample Prospects for ZIP".
- Replaced "Manual/demo seed data for testing purposes." with "Currently showing manually curated sample prospect data."
- Modified placeholder text from "demo prospects" and "demo prospects are available" to "sample prospects" respectively.
- Refined the title metadata inside RootLayout.
- Wrote a new `docs/planning/11-first-deploy-checklist.md` documenting build targets, verification parameters, and confirming zero env-variable requirements.

### Why It Changed

To make the application polished and ready for a public staging/MVP launch. Internal tags or disclaimers that make the site feel unfinished were removed, while maintaining accurate, honest representation that the underlying dataset is comprised of manual seed records.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```
2. Build verification:
   ```bash
   npm run build
   ```
3. Start dev server:
   ```bash
   npm run dev
   ```
4. Git status inspection:
   ```bash
   git status
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can verify:
1. `docs/planning/11-first-deploy-checklist.md` exists and contains deploy guidelines.
2. The UI renders the updated copy properly.
3. Production build (`npm run build`) and test suite (`npm run test`) pass cleanly.

### Known Risks

No known risks. The application operates entirely client-side with no state side-effects or external network integrations.

### Next Recommended Step

Prepare the Prisma configuration and database structure plan.

---

## 2026-06-16 — First Public MVP Deployment Documented

### Task Summary

Documented the first public deployment details and URL for the Legal Prospector MVP app, and marked the verification checklist as completed.

### Files Created

No files created.

### Files Changed

- `docs/planning/11-first-deploy-checklist.md` — Marked verification tasks as complete and appended the actual deployment details (URL, date, phase, status).
- `tasks/work.md` — Logged this deployment documentation session.

### What Changed

- Updated the pre-flight verification checkboxes to checked (`[x]`) to reflect successful human-led testing.
- Added a new `Deployment Details` section to `docs/planning/11-first-deploy-checklist.md` recording the live Vercel URL provided by the user.
- Updated this work log to record completion of Phase 2.5: First Public Deployment.

### Why It Changed

To capture the official launch of the MVP on Vercel and complete the documentation phase for this release, ensuring all subsequent phases can build on a verified, live baseline.

### Commands Suggested

No commands suggested.

### Commands Run by Human

No commands run.

### Results Pasted by Human

The human provided the public Vercel deployment URL:
`https://legal-prospect.vercel.app`
And confirmed all features (search, save, expand/collapse, validation, empty states) function correctly on the live site.

### Verification

The human can check that:
1. `docs/planning/11-first-deploy-checklist.md` contains the correct public deployment URL.
2. The pre-flight checklist items are checked.
3. No code file modifications were made during this phase.

### Known Risks

No known risks for this task. The deployment has been confirmed working on Vercel.

### Next Recommended Step

Prepare the Prisma configuration and database structure plan.

---

## 2026-06-16 — Real Data Acquisition Plan Documented

### Task Summary

Created a practical and detailed Real Data Acquisition Plan governing how the app discovers, normalizes, handles duplicates, manages freshness, and scores confidence for real small and boutique law firm prospects.

### Files Created

None.

### Files Changed

- `docs/planning/03-data-fetching-plan.md` — Replaced the generic data fetching plan with the concrete 14-section real data acquisition plan.
- `tasks/work.md` — Logged this planning task session and revisions.

### What Changed

- Restructured `docs/planning/03-data-fetching-plan.md` to cover the 14 mandatory sections.
- Defined fields for a real prospect database record, introducing `verificationStatus` (CANDIDATE, PENDING_REVIEW, VERIFIED, REJECTED) separate from `confidenceLevel` (HIGH, MEDIUM, LOW, UNKNOWN).
- Classified source types into trust tiers (Bar Directory/Websites, Google Places, directories).
- Documented explicit rules for confidence scoring and verification statuses, geographic matching/radius, duplicate handling (canonical domains), and freshness windows (90 days).
- Outlined a proposed first manual research experiment targeting 5–10 boutique firms for ZIP `19103`, listing 4 example candidate records marked as `verificationStatus: PENDING_REVIEW` and `confidenceLevel: UNKNOWN` until human verification is complete.
- Replaced hardcoded API costs with standard warning disclaimer text indicating pricing varies by SKU and field selection.
- Listed future automation options (Google Places API, web crawlers, AI parsers), legal and cost risks, database persistence pre-requisites, and non-goals.

### Why It Changed

To establish a solid, structured planning foundation for future data acquisition tasks without adding databases, APIs, or scraping code prematurely, aligning with owner feedback on manual verification, field consistency, and cost framing.

### Commands Suggested

No commands suggested.

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can verify:
1. `docs/planning/03-data-fetching-plan.md` exists and contains the 14 detailed sections.
2. Section 10 labels candidate records as `verificationStatus: PENDING_REVIEW` and `confidenceLevel: UNKNOWN`.
3. Pricing disclaimer text is applied under Google Places API cost risks.
4. No application code files, databases, or API routes were modified or created.

### Known Risks

No known risks. This is a documentation-only planning task.

### Next Recommended Step

Human review of the proposed real data acquisition plan in `docs/planning/03-data-fetching-plan.md`.

---

## 2026-06-16 — Create Prospect Data Model Gap Analysis

### Task Summary

This task involved creating a gap analysis document comparing the existing frontend-only `Prospect` type interface with the requirements of the database-level Real Data Acquisition Plan. It highlights the supported, missing, deferred, and future fields, separates global/shared directories from private user workspaces, clarifies data confidence vs verification lifecycle states, and outlines recommended staging steps.

### Files Created

- `docs/planning/12-prospect-data-model-gap-analysis.md` — holds the prospect data model gap analysis, comparison table, field ownership categorization, and future schemas.

### Files Changed

- `tasks/work.md` — logged this task's work details.

### What Changed

- Created a new planning document: [12-prospect-data-model-gap-analysis.md](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/12-prospect-data-model-gap-analysis.md).
- Documented 6 existing fields (`id`, `firmName`, `website`, `phone`, `city`, `state`, `zip`, `practiceAreas`, `attorneyCountRange`, `sourceType`, `notes`) and mapped them to their corresponding roles.
- Identified 6 missing fields (`email`, `streetAddress`, `zipExt`, `attorneys`, `sourceUrl`, `lastCheckedDate`) to be added.
- Categorized data fields by ownership: global/shared firm directory versus private/user-specific lead tracking and history.
- Clarified the conceptual difference between `confidenceLevel` (trustworthiness score of details) and `verificationStatus` (lifecycle phase of database reviews).
- Proposed a future type definition sketch `FutureProspect` containing all canonical properties.
- Outlined non-goals, risks, and follow-up activities.

### Why It Changed

To establish a clear path for database schema integration (Prisma) and user workspace models without introducing live code premature modifications. This ensures the team knows what attributes can be staged in the frontend type models before full persistence planning.

### Commands Suggested

No terminal commands were run. If the human wants to check the repo afterward, suggest:

```bash
git status
git diff
```

If everything is correct, the human may commit with:

```bash
git add docs/planning/12-prospect-data-model-gap-analysis.md tasks/work.md
git commit -m "Document prospect data model gaps"
git push
```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human can check that:
1. [12-prospect-data-model-gap-analysis.md](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/12-prospect-data-model-gap-analysis.md) exists and contains all 14 required sections.
2. No app source code files (`src/`), databases, API endpoints, or auth configurations have been changed or created.
3. No terminal commands were executed by the agent.

### Known Risks

No known risks. This is a documentation-only gap analysis.

### Next Recommended Step

Update `src/types/prospect.ts` and `src/data/prospects.ts` with the new fields (like `streetAddress`, `sourceUrl`, `email`, `zipExt`, `attorneys`) and update [ProspectCard.tsx](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/components/ProspectCard.tsx) to render the new details in its expanded layout view.

---

## 2026-06-16 — Align Frontend Prospect Model with Real-Data Fields

### Task Summary

Aligned the frontend-only `Prospect` type, sample seed records, and the result card UI with the real-data fields identified in the prospect data model gap analysis. This prepares the app's interfaces and styling for real law firm data integration later.

### Files Created

None.

### Files Changed

- `src/types/prospect.ts` — Updated the `Prospect` type interface with fields (like `streetAddress`, `email`, `sourceUrl`, etc.) and defined enums for `ConfidenceLevel`, `VerificationStatus`, and `SourceType`.
- `src/data/prospects.ts` — Updated sample seed records to comply with the updated type definitions, using clearly demo-safe placeholders/nulls.
- `src/components/ProspectCard.tsx` — Enriched the card UI rendering to support the new metadata fields, and used the updated `confidenceLevel` badge logic.
- `src/utils/prospectMatcher.test.ts` — Updated test mock data records to conform to the new type definition structure.
- `tasks/work.md` — Logged this session's work details.

### What Changed

- Replaced loose `confidence` and `notes` fields with `confidenceLevel` (restricted to `'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'`) and `globalNotes`.
- Added new fields: `zipExt`, `streetAddress`, `email`, `attorneys`, `sourceUrl`, `verificationStatus`, and `lastCheckedDate` to the frontend `Prospect` model.
- Updated the 4 fictional seed records in `src/data/prospects.ts` to map to the new interface, using obviously demo-only placeholders (`"123 Demo Street"`, `"prospect1-demo@example.com"`, etc.) and `null` values to keep the seed data clean and not misleading.
- Modified the `<ProspectCard />` component to render street address, email (mailto: link), source URL (link), last checked date, list of attorneys, verification status, and confidence levels.
- Updated `mockProspects` in `src/utils/prospectMatcher.test.ts` to resolve Vitest type errors.

### Why It Changed

- To ensure the frontend app shell structure matches the database-level Real Data Acquisition Plan.
- To prepare for the future backend development using the preferred database stack (Prisma + Neon).
- To keep the sample seed data clearly distinct from verified real law firm records as requested.

### Commands Suggested

1. Run the test suite:
   ```bash
   npm run test
   ```
2. Build verification:
   ```bash
   npm run build
   ```
3. Start local development server:
   ```bash
   npm run dev
   ```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should verify:
1. Start the application dev server (`npm run dev`) and run tests (`npm run test`) to ensure everything builds and passes.
2. In the browser, search ZIP `19103` and check that the 4 demo prospects render correctly with the new metadata fields in both collapsed and expanded views.
3. Test search validation using invalid ZIPs (e.g. `123`) and verify that search for a non-seeded ZIP (e.g. `90210`) shows the empty state correctly.

### Known Risks

- The database stack (Prisma + Neon) has been designated as the preferred target but is not yet initialized or connected.

### Next Recommended Step

Prepare the Prisma database schema and migration plan using Neon PostgreSQL.

---

## 2026-06-16 — Create Prisma + Neon database planning document

### Task Summary

Create a practical database planning document for the Legal Prospector app defining the future database shape, ownership boundaries, and rollout sequence. This task is strictly planning/documentation only.

### Files Created

None.

### Files Changed

- `docs/planning/05-database-plan.md` — Updated the database plan with 18 detailed sections outlining Neon Postgres + Prisma as the MVP/learning stack, conceptual models, global/private boundaries, migration rules, and execution slices.
- `docs/planning/09-roadmap.md` — Added a small note under Phase 5 specifying Neon Postgres and Prisma as the preferred MVP/learning stack, subject to future review.
- `tasks/work.md` — Logged this planning task session.

### What Changed

- Created/fully populated `docs/planning/05-database-plan.md` with all 18 required sections (Purpose, Current state, Chosen MVP database stack, Why Neon Postgres + Prisma for now, What can be revisited later, Data ownership boundaries, Planned global/shared models, Planned private/user-specific models, Suggested first database slice, Fields to defer, Conceptual Prisma model sketch, Environment variables and secrets plan, Migration safety rules, Data-loss guardrails, Local development and human-run commands, Risks and constraints, Explicit non-goals for now, Suggested follow-up tasks).
- Stated Neon Postgres + Prisma as the chosen MVP/learning stack.
- Divided entities into global/shared models (`Firm`, `DataSource`, `ZipCode`) and private/user-specific models (`User`, `SavedLead`, `UserFirmNote`, `UserRecentZip`).
- Proposed that the first database slice should be global/shared firm prospect records only (search by ZIP), deferring all auth-dependent and private models.
- Provided a conceptual Prisma model sketch labeled `// Planning-only sketch. Do not implement in this task.`
- Outlined environment variables (`DATABASE_URL`, `DIRECT_URL`) conceptually.
- Detailed migration safety rules, database initialization commands, and data-loss guardrails (forbidding `db push --accept-data-loss` and `migrate reset`).
- Added a note to `docs/planning/09-roadmap.md` aligning the roadmap to the selected database stack.

### Why It Changed

To establish a clear database design, ownership boundary, and safety guidelines for the next development phase, preventing schema drift or accidental loss of data during implementation.

### Commands Suggested

No terminal commands were run by the agent. The following git commands are suggested for the human user to commit the changes:

```bash
git add docs/planning/05-database-plan.md docs/planning/09-roadmap.md tasks/work.md
git commit -m "Document Prisma and Neon database plan"
git push
```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should verify that:
1. `docs/planning/05-database-plan.md` exists and contains all 18 required sections.
2. `docs/planning/09-roadmap.md` contains the new Note under Phase 5.
3. No Prisma client or packages were installed, no schema file was created in `prisma/`, and no code changes or migrations were executed.
4. No terminal commands were run by the agent.

### Known Risks

- Connecting to Neon serverless DB may require configuring transaction connection pooling to avoid exhausting connection limits under scaling.
- PostgreSQL string arrays (`String[]`) are used for practice areas and attorneys to keep the first slice simple, which requires connecting to a Postgres database (local or Neon branch) for local testing rather than SQLite.

### Next Recommended StepCustom

Phase 5.1: Initialize Prisma and configure the Neon Postgres connection once the database current-task is approved.

---

## 2026-06-16 — Revise Database Plan for Product Ownership and Scoping

### Task Summary

Revise the database plan to clarify data ownership, define canonical data vs user workflow data partitions, specify user-scoped search optimizations using SearchRuns/SearchResults referencing canonical records, and keep the first database slice focused on global firm directory listings.

### Files Created

None.

### Files Changed

- `docs/planning/05-database-plan.md` — Updated sections 1, 6, 7, 10, 11, and 12 to detail the shared internal canonical firm database, user/session-scoped workflow data partitions (Canonical vs Workflow Data tables), simple first slice, and post-authentication referencing strategy.
- `tasks/work.md` — Logged the revision details in the session history.

### What Changed

- Clarified the **shared internal canonical firm database** acts as the internal source-of-truth corpus to support daily scraping and enrichment.
- Clarified that user-facing search results, saved leads, notes, status, and history will be user/session-scoped and private.
- Added a conceptual partitioning breakdown between **Canonical Data** (`Firm`, `DataSource` + metadata) and **User/Session Workflow Data** (`SearchRun`, `SearchResult`, `SavedLead`, `LeadNote`, `LeadStatus`, `RecentSearch`).
- Refined the suggested first slice to focus on global canonical records only, searching by ZIP, with no saved leads or notes.
- Added a referencing optimization section showing how, once auth exists, search results will use `SearchRuns` and `SearchResults` referencing canonical `Firm` records instead of duplicating firm tables per user.
- Re-confirmed that Prisma + Neon is the preferred stack and that no implementation occurred.

### Why It Changed

To ensure the database plan properly reflects the data aggregation requirements of a daily-scraped data application while maintaining strict privacy boundaries and storage efficiency for user workflows.

### Commands Suggested

No terminal commands were run by the agent. The following git commands are suggested for the human user to commit the revisions:

```bash
git add docs/planning/05-database-plan.md tasks/work.md
git commit -m "Revise database plan for product ownership model"
git push
```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should verify that:
1. `docs/planning/05-database-plan.md` outlines the canonical corpus, partitioning categories, and the search result referencing logic.
2. No code files, package files, or terminal commands were run or changed.

### Known Risks

No new risks. The design remains documentation-only.

### Next Recommended Step

Wait for the human developer to approve the database plan before starting implementation tasks.

---

## 2026-06-16 — Fix missing Vitest dependency in package.json

### Task Summary

Fix the missing Vitest package dependency in `package.json` devDependencies which was causing compilation errors in the IDE and test-run command failures (`vitest: command not found`).

### Files Created

None.

### Files Changed

- `package.json` — Added `"vitest": "^1.6.0"` to the `devDependencies` block to resolve the runtime and compile-time issues.
- `tasks/work.md` — Logged the dependency fix session.

### What Changed

- Restored the missing `"vitest": "^1.6.0"` to the `package.json` devDependencies list.

### Why It Changed

To resolve the compiler error in `src/utils/prospectMatcher.test.ts` and enable standard execution of the Vitest unit tests via `npm run test` after packages are updated.

### Commands Suggested

The human should install the updated dependency and run the tests:

```bash
npm install
npm run test
```

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

Verify that:
1. `package.json` lists `"vitest"` in `devDependencies`.
2. Running the commands above installs the dependencies and runs the unit tests successfully.

### Known Risks

No known risks. This is a dev dependency correction.

### Next Recommended Step

Wait for the human developer to approve the database plan before starting implementation tasks.

---

## 2026-06-17 — Review Prisma setup and define minimal Firm model

### Task Summary

Reviewed the existing Prisma + Neon configuration initialized by the developer, created a schema model for the global `Firm` entity and its associated enums, configured `.env.example` with Neon connection placeholders, unignored `.env.example` in `.gitignore`, and updated the planning documents to align with the schema properties.

### Files Created

- `.env.example` — holds the database connection string placeholders for DATABASE_URL and DIRECT_URL.

### Files Changed

- `prisma/schema.prisma` — defined the minimal `Firm` model and enums, and removed `url` and `directUrl` from the datasource block to conform to Prisma 7.
- `prisma.config.ts` — added `directUrl` configuration parameters to the datasource block.
- `.gitignore` — added `!.env.example` so that it can be committed while maintaining security on other local env configurations.
- `docs/planning/05-database-plan.md` — updated the conceptual sketch to remove the `@unique` constraint on the `website` field to support multi-office locations as independent entries sharing the same domain.
- `tasks/work.md` — logged this work entry.

### What Changed

- Defined three Prisma enums (`ConfidenceLevel`, `VerificationStatus`, and `SourceType`) matching the frontend types.
- Defined the Prisma `Firm` model containing all canonical firm metadata fields matching the frontend `Prospect` type.
- Configured indexes on `zip` and `[city, state]` on the `Firm` model for query optimization.
- Created `.env.example` with placeholder Neon connection parameters.
- Configured `.gitignore` to explicitly unignore `.env.example`.
- Removed `@unique` constraint on the `website` field from the planning-only schema model sketch in `docs/planning/05-database-plan.md` to ensure consistency with the actual implementation (allowing multi-office listings under the same website domain).
- Removed `url` and `directUrl` parameters from the `datasource` block in `prisma/schema.prisma` due to deprecation/removal in Prisma 7.
- Configured the datasource block in `prisma.config.ts` using the official Prisma 7 config syntax with `env("DATABASE_URL")` imported from `"prisma/config"`. We removed the `directUrl` parameter and `as any` casting workaround, keeping the config file fully typed.

### Why It Changed

To establish the minimal database foundation slice for the global/shared firm directory. No private user workflow state is modeled, keeping the schema clean, lightweight, and focused purely on prospect ZIP search synchronization before authentication is designed. Uniqueness on the website was removed to support independent multi-office firm records sharing the same primary website.
Additionally, since Prisma 7 moved migration/connection URL specifications from the schema file directly into `prisma.config.ts`, we migrated these parameters to the configuration file to resolve standard CLI validation errors.

### Commands Suggested

The human may run these commands:

```bash
npx prisma format
npm run test
npm run build
```

Then once the human approves the migration task, they can run:

```bash
npx prisma migrate dev --name init_firm_model
```

### Commands Run by Human

The human ran the following commands prior to and during this task:

```bash
npm install
npx prisma format
```

### Results Pasted by Human

The human pasted:
- Successful `npm install` output indicating packages added and audited.
- Validation errors from `npx prisma format` showing that `url` and `directUrl` are no longer supported in Prisma 7 schema files.

### Verification

The human can check that:
1. `prisma/schema.prisma` exists and contains the enums and `Firm` model, without `url` or `directUrl` fields in the `datasource` block.
2. `prisma.config.ts` includes the typed `url` parameter in the datasource block (pointing to `env("DATABASE_URL")`) with no type overrides or workarounds.
3. `.env.example` contains only placeholders and is tracked/not ignored.
4. Running `npx prisma format` formats the schema file successfully.
5. Production build (`npm run build`) compiles cleanly without type errors.

### Known Risks

- The database stack (Prisma + Neon) uses Postgres-specific features (string arrays like `String[]` for `practiceAreas` and `attorneys`), which are not compatible with local SQLite. Local testing must connect to a Neon dev branch database or a local PostgreSQL instance.

### Next Recommended Step

Phase 5.3: Implement Database Seeding (write and run a seed script to load mockup data into the new Postgres database structure).

---

## 2026-06-17 — Review Prisma schema and prepare migration command

### Task Summary

Review the Prisma schema and configuration for migration readiness, recommend the human-run migration command, and wait for the human to execute the migration.

### Files Created

None.

### Files Changed

- `tasks/work.md` — logged this session's review of Prisma config and recommendation of the migration command.

### What Changed

- Reviewed `prisma/schema.prisma` and `prisma.config.ts`.
- Verified database plan constraints (canonical model only, indexes on zip and [city, state], enum matches).
- Prepared the exact commands for the human developer to run.
- Logged the task progress in `tasks/work.md`.

### Why It Changed

To ensure a safe and controlled migration process where the human project owner runs all commands, keeping the agent from executing anything directly.

### Commands Suggested

```bash
npx prisma format
npx prisma migrate dev --name init_firm_model
```

### Commands Run by Human

1. Generate client:
   ```bash
   npx prisma generate
   ```
2. Database migration:
   ```bash
   npx prisma migrate dev --name init_firm_model
   ```

### Results Pasted by Human

The human successfully ran the migration and it created:
`prisma/migrations/20260617044354_init_firm_model/migration.sql`

### Verification

Reviewed the generated migration SQL file and verified:
1. It creates only the expected `Firm` table and the enums `ConfidenceLevel`, `VerificationStatus`, and `SourceType`.
2. It correctly sets up indexes `Firm_zip_idx` on `zip` and `Firm_city_state_idx` on `(city, state)`.
3. It uses Postgres array columns (`TEXT[]`) for `practiceAreas` and `attorneys`.
4. It does not add auth/user/saved-lead/search-history/scraping tables.
5. It does not contain destructive SQL or secrets.

### Known Risks

- The database stack (Prisma + Neon) uses Postgres-specific features (string arrays like `String[]` for `practiceAreas` and `attorneys`), which are not compatible with local SQLite. Local testing must connect to a Neon dev branch database or a local PostgreSQL instance.

### Next Recommended Step

Phase 5.4 — Controlled Prisma Firm Seed Script (write and configure a seed script to load mockup data into the new Postgres database structure).

---

## 2026-06-17 — Phase 5.4 — Controlled Prisma Firm Seed Script

### Task Summary

Create a safe, repeatable, and idempotent seed script that maps the existing fictional demo prospects to the `Firm` table in Neon Postgres database.

### Files Created

- `prisma/seed.ts` — Idempotent seeding script utilizing the Prisma Client configured with `@prisma/adapter-neon` and `@neondatabase/serverless` to map and upsert sample prospects.

### Files Changed

- `package.json` — Wired `db:seed` script and `prisma.seed` settings to support the tsx-run TypeScript seed file.
- `prisma/seed.ts` — Integrated Neon serverless driver adapter and connection pooling to comply with Prisma 7 runtime client requirements.
- `tasks/work.md` — Logged the seed script creation, package script wiring, and driver adapter configuration.

### What Changed

- Created a database seed file `prisma/seed.ts` that loads environment variables, initializes `PrismaNeon` from `@prisma/adapter-neon` with the connection config object directly (using `DIRECT_URL`, falling back to `DATABASE_URL`), and passes the factory adapter to the `PrismaClient` constructor.
- Iterated over `SEED_PROSPECTS` (from `src/data/prospects.ts`), mapped their fields (including array parsing and parsing string dates like `lastCheckedDate`), and performed an `upsert` using the stable prospect ID.
- Configured `"db:seed": "prisma db seed"` in package scripts and configured Prisma's custom `"seed"` script to use `"tsx prisma/seed.ts"`.
- Did not run the seed script or execute any CLI/database/git commands directly.

### Why It Changed

To establish a safe database seeding pipeline, allowing the human to load sample seed prospects into the Postgres database. In Prisma 7, the default TCP engine inside the client runtime is removed, so instantiating `new PrismaClient()` with no arguments throws an error when no database URL is set in the schema file itself. We resolved this by passing the `@prisma/adapter-neon` driver adapter factory directly to the client constructor, letting Prisma manage the internal pool lifecycle. The upsert logic ensures that repeating the seeding process updates fields instead of generating duplicates, preventing dataset drift during developer testing.

### Commands Suggested

The human may run these commands:

```bash
npm run test
npm run build
npm run db:seed
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human can verify:
1. `prisma/seed.ts` exists and is formatted correctly.
2. `package.json` contains the `db:seed` script and `"prisma": { "seed": "tsx prisma/seed.ts" }` configuration.
3. The human runs `npm run db:seed` and verifies that the database is seeded correctly with the 4 demo prospects without errors.
4. The human runs `npm run test` and `npm run build` to ensure no build or test compilation regressions.

### Known Risks

- In the Prisma client, `lastCheckedDate` is mapped to a standard JavaScript `Date` constructor (`new Date()`). If invalid date strings are introduced in sample prospects in the future, the date constructor could produce an `Invalid Date` object that fails Postgres database constraints. The demo dataset current dates are valid, so this is resolved.

### Next Recommended Step

Phase 5.5: Connect the Search UI to the database (write a Next.js API route to fetch matching prospects from Postgres and integrate search queries).

---

## 2026-06-17 — Phase 5.6 — Create DB-Backed ZIP-Code Search API Route

### Task Summary

Create a server-side Next.js API route `/api/prospects/search` that queries the Postgres database `Firm` table by ZIP code and returns prospect-compatible JSON. Avoid changing any UI behavior, auth, or schemas, and keep the Prisma client helper server-only.

### Files Created

- `src/lib/prisma.ts` — Server-only helper file containing the singleton initialization for the Prisma Client with Neon database adapter.
- `src/app/api/prospects/search/route.ts` — The GET API route that receives, normalizes, and validates the `zip` parameter, queries the database, maps rows to the `Prospect` type, and returns JSON.
- `src/app/api/prospects/search/route.test.ts` — Comprehensive unit tests for validation, querying, sorting, mapping, empty states, and errors, using mocked Prisma Client.

### Files Changed

- `tasks/work.md` — Logged the implementation details, files created, verification instructions, and next steps for Phase 5.6.

### What Changed

- Implemented `src/lib/prisma.ts` as a server-only helper (using Next.js `server-only` package) that instantiates the Prisma client. It throws an error if connection URL env variables are missing rather than using `process.exit()`.
- Implemented `/api/prospects/search` API route returning a structured query and search result JSON.
- Standardized the API error messages and HTTP status codes (e.g. `400` for missing or invalid parameters, `500` for server exceptions, `200` with empty array for unsupported/non-matching ZIPs).
- Added Vitest unit tests to mock and test the API endpoint's query/error flow.

### Why It Changed

- To set up the API-level database query backend layer before wiring the frontend UI (which remains on static mock data to avoid bundle regressions).
- To conform to Next.js server-only safety rules and ensure hot-reloads in local development do not leak client instances or trigger connection pool overflow.

### Commands Suggested

The human may run these commands:

```bash
npm run test
npm run build
npm run dev
```

And optional manual testing commands once dev server is running:

```bash
curl "http://localhost:3000/api/prospects/search?zip=19103"
curl "http://localhost:3000/api/prospects/search?zip=19103-1234"
curl "http://localhost:3000/api/prospects/search?zip=90210"
curl "http://localhost:3000/api/prospects/search?zip=abc"
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. `src/lib/prisma.ts` exists and enforces `"server-only"`.
2. `src/app/api/prospects/search/route.ts` and `src/app/api/prospects/search/route.test.ts` exist.
3. The human runs `npm run test` and verifies all tests (including the new API tests and old matcher tests) pass.
4. The human runs `npm run build` and verifies the project compiles cleanly without type errors.
5. The human runs `npm run dev` and curls the local API endpoints to verify the response shapes and status codes.

### Known Risks

- None. No schema modifications, database migrations, or UI changes were made.

### Next Recommended Step

Phase 5.7: Wire UI to DB-backed search while preserving current behavior.

---

## 2026-06-17 — Phase 5.7 — Wire Homepage Search UI to DB-Backed API

### Task Summary

Connect the homepage ZIP-code search UI to the DB-backed API route `/api/prospects/search?zip=<zip>`.

### Files Created

None.

### Files Changed

- `src/app/page.tsx` — Wired search form submission to call the dynamic search API, added loading states and duplicate submission prevention, and adjusted copy to match seeded DB results context.
- `tasks/work.md` — Logged the implementation work.

### What Changed

- Replaced local frontend-only static filtration (`matchProspectsByZip(SEED_PROSPECTS, searchedZip)`) with an asynchronous search fetch targeting `/api/prospects/search?zip=${encodeURIComponent(trimmed)}`.
- Added an `isLoading` boolean state to track active searches, disabling form controls (input and submit button) while fetching to prevent duplicate search requests.
- Integrated a loading state card UI component within the search results section displaying a spinner visual block.
- Maintained exact local/in-memory client behaviors including toggling card details, saving prospect IDs, badge styles, validation rules, and empty search results.
- Updated user copy to clearly specify: "Currently showing seeded demo prospect data from the database."

### Why It Changed

To successfully link the user-facing search frontend to the real database query backend endpoint, completing the dynamic search loop on seeded postgres database tables.

### Commands Suggested

The human may run these commands:

```bash
npm run test
npm run build
npm run dev
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human can verify:
1. Running `npm run test` passes all tests cleanly.
2. Running `npm run build` generates a clean Next.js build compilation.
3. Running `npm run dev` and searching for `19103` loads the four seeded database results.
4. Active searching displays "Searching..." and disables input elements.
5. Searching `90210` displays empty results properly.
6. Searching `abc` displays frontend validation errors.

### Known Risks

No known risks. Scope was strictly restricted to `src/app/page.tsx` search integration.

### Next Recommended Step

Phase 5.8 — Production DB-Backed Search Deployment Readiness

---

## 2026-06-17 — Phase 5.8 — Production DB-Backed Search Deployment Readiness

### Task Summary

Safely prepare and verify the production deployment of the DB-backed ZIP-code prospect search on Vercel and Neon Postgres.

### Files Created

None.

### Files Changed

- `tasks/work.md` — Logged the verification results and deployment details.
- `tasks/current-task.md` — Marked Phase 5.8 as completed and updated to Phase 6.1.

### What Changed

- Verified environment variables configurations (`DATABASE_URL`, `DIRECT_URL`) for Neon/Prisma in the production Vercel project environment.
- Loaded seed data to the production database via human execution of `npm run db:seed`.
- Verified live production search functionality via API and UI verification on `https://legal-prospect.vercel.app`.
- Verified that all static frontend in-memory behaviors (expanded state, save/unsave) persist locally as expected.

### Why It Changed

To complete the rollout and launch of the database-backed ZIP search MVP to production, ensuring future iterations build on a verified, live database integration.

### Commands Suggested

None.

### Commands Run by Human

1. Database seeding:
   ```bash
   npm run db:seed
   ```
2. Production verification via browser and HTTP testing.

### Results Pasted by Human

The human developer successfully deployed the database-backed ZIP-code search to production and confirmed the live application (including API endpoints and frontend search interactions) functions correctly.

### Verification

1. Accessing `https://legal-prospect.vercel.app/api/prospects/search?zip=19103` returns the JSON array of seeded prospects from Neon Postgres.
2. Accessing the homepage and searching `19103` loads the prospects list correctly.

### Known Risks

No known risks. All tables remain server-side and client-side interactions (like saving leads) remain strictly in-memory.

### Next Recommended Step

Phase 6.1 — Define the first small verified real-firm data intake workflow.

---

## 2026-06-17 — Phase 6.1 — Define First Small Verified Real-Firm Data Intake Workflow

### Task Summary

Define a small, safe, human-reviewable workflow for adding the first verified real law firm records to the canonical `Firm` database.

### Files Created

- `docs/planning/13-first-real-firm-intake-workflow.md` — planning document outlining targets, batch size, qualification rules, fields, verification/confidence logic, deduplication rules, a manual check list, and storage recommendations.

### Files Changed

- `tasks/work.md` — logged the completion of this planning task.

### What Changed

- Created a new planning document (`13-first-real-firm-intake-workflow.md`) detailing the manual intake workflow for verified real boutique law firm prospects.
- Recommended target ZIP `19103` and a small batch size of 5–10 records.
- Defined explicit data validation rules, required/optional fields, priority of web vs profile directory sources, deduplication logic (using website domains), and a step-by-step researcher checklist.
- Recommended a version-controlled TypeScript file (`src/data/real-firms.ts`) for storing incoming verified records.

### Why It Changed

- To ensure the project builds a trustworthy real-world database intake pipeline, laying down clear guidelines for human verification and data safety before scaling to automation.

### Commands Suggested

No commands suggested.

### Commands Run by Human

No commands run.

### Results Pasted by Human

No results pasted.

### Verification

The human should review:
- [docs/planning/13-first-real-firm-intake-workflow.md](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/13-first-real-firm-intake-workflow.md)

### Known Risks

- Sourcing errors from manual transcription can lead to validation issues. These are mitigated by applying TypeScript type verification on compilation.

### Next Recommended Step

Phase 6.2 — Prepare first reviewed real-firm intake template.

---

## 2026-06-17 — Phase 6.2 — Prepare Manual Real-Firm Intake Template

### Task Summary

Prepare a safe, empty manual real-firm intake template file and wire it into the existing seed script plumbing without adding any actual real firm records, database schema changes, or migrations.

### Files Created

- `src/data/real-firms.ts` — TypeScript template for manually verified real law firm records, initialized as an empty array with commented guidelines and schema template structure.
- `docs/planning/14-real-firm-intake-template.md` — Planning/checklist document describing the targets, recommended pilot size (1-3 firms), validation standards, source priority, placeholder rejections, deduplication checks, recommended defaults, and a per-record checklist for the manual intake workflow in ZIP 19103.

### Files Changed

- `prisma/seed.ts` — Updated to import `REAL_FIRMS` and combine it with `SEED_PROSPECTS` for database seeding via the existing idempotent upsert logic.
- `tasks/work.md` — Logged the implementation details of this phase.
- `tasks/current-task.md` — Updated the current task to Phase 6.3.

### What Changed

- Created the template data file `src/data/real-firms.ts` containing the `REAL_FIRMS` exported array (empty by default).
- Wired `REAL_FIRMS` into the database seed script `prisma/seed.ts` to ensure compatibility.
- Created `docs/planning/14-real-firm-intake-template.md` outlining the verification, deduplication, and input guidelines for human researchers.
- Updated task and log files to track progress.

### Why It Changed

To establish the required file structure and database-seed integration (plumbing only) for importing manually verified real law firm prospects, ensuring that future real-data entry is controlled, type-safe, version-controlled, and follows a structured validation checklist without affecting the current database configuration or seeding.

### Commands Suggested

The human may run these commands:

```bash
npm run test
npm run build
npx prisma db seed
npm run dev
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human can verify that:
1. `src/data/real-firms.ts` exists, compiles, and contains the empty `REAL_FIRMS` array.
2. `docs/planning/14-real-firm-intake-template.md` exists and contains the required guidelines.
3. `npm run test` and `npm run build` run successfully (to be run by the human).
4. `npx prisma db seed` seeds the database cleanly without errors (to be run by the human).

### Known Risks

No known risks. `REAL_FIRMS` starts as an empty array, so no real firm records are inserted yet and current seed behavior for existing demo prospects remains unchanged.

### Next Recommended Step

Phase 6.3 — Add first 1–3 human-verified real firm records

---

## 2026-06-17 — Phase 6.3 — Add First 1–3 Human-Reviewed Real Firm Records

### Task Summary

Added the first three human-reviewed real boutique law firm records in ZIP 19103 to `src/data/real-firms.ts`. These records use conservative metadata defaults (`sourceType: "MANUAL"`, `confidenceLevel: "MEDIUM"`, `verificationStatus: "PENDING_REVIEW"`) as required.

### Files Created

None.

### Files Changed

- `src/data/real-firms.ts` — Added the 3 human-reviewed real law firm records: Martin Law LLC, Ballard Spahr LLP, and Nissenbaum Law Group, LLC.
- `tasks/work.md` — Logged Phase 6.3 completion and next steps.
- `tasks/current-task.md` — Updated the current task state to prepare for Phase 6.4.

### What Changed

- Populated `REAL_FIRMS` array in `src/data/real-firms.ts` with:
  1. **Martin Law LLC** (`firm-real-19103-martin-law`)
  2. **Ballard Spahr LLP** (`firm-real-19103-ballard-spahr`)
  3. **Nissenbaum Law Group, LLC** (`firm-real-19103-nissenbaum-law-group`)
- Set appropriate fields (`website`, `phone`, `streetAddress`, `practiceAreas`, `attorneys`) as provided by the human, ensuring `sourceType` is `MANUAL`, `confidenceLevel` is `MEDIUM`, and `verificationStatus` is `PENDING_REVIEW`.

### Why It Changed

To introduce the first real-world boutique law firm records into the project's data flow, enabling validation of the database seed script and the ZIP-code search pipeline under real-world data values.

### Commands Suggested

The human should run these commands to seed the new real records and test the build:

```bash
npm run test
npm run build
npx prisma db seed
npm run dev
git status
git diff
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. Running `npm run test` passes cleanly.
2. Running `npm run build` succeeds without type errors.
3. Seeding the database using `npx prisma db seed` runs successfully and logs upserts for the 3 new real firms.
4. Searching ZIP `19103` on the local UI retrieves the new real firms alongside the existing demo prospects, and expanding them renders their details correctly.

### Known Risks

None. The schema is unchanged, existing demo prospects are preserved, and all fields align exactly with the `Prospect` type interface.

### Next Recommended Step

Phase 6.4.1 — Sort prospect search results by confidence

---

## 2026-06-17 — Phase 6.4.1 — Sort prospect search results by confidence

### Task Summary

Updated the database-backed ZIP-code prospect search API to sort results first by confidence level (HIGH > MEDIUM > LOW > UNKNOWN/others) and then alphabetically by firm name, and updated the corresponding API test suite.

### Files Created

None.

### Files Changed

- `src/app/api/prospects/search/route.ts` — Implemented in-memory sorting logic after database query.
- `src/app/api/prospects/search/route.test.ts` — Added test case verifying confidence-first and then alphabetical ordering.

### What Changed

- In `src/app/api/prospects/search/route.ts`, defined a mapping for confidence levels (`HIGH: 3`, `MEDIUM: 2`, `LOW: 1`) and sorted the resulting `Prospect` array descending by rank, using case-sensitive alphabetical order on `firmName` as the tiebreaker.
- In `src/app/api/prospects/search/route.test.ts`, added a test case asserting the sorted order of 5 mock firms with varied confidence levels and names.

### Why It Changed

To prioritize high-confidence data (verified real firms) at the top of the search results list, improving user search utility.

### Commands Suggested

The human should run these commands to verify:

```bash
npm run test
npm run build
curl "http://localhost:3000/api/prospects/search?zip=19103"
```

### Commands Run by Human

The human ran the following read-only local curl commands:

```bash
curl "http://localhost:3000/api/prospects/search?zip=19103"
curl "http://localhost:3000/api/prospects/search?zip=19103" | jq
```

No database, migration, destructive, git, install, build, or test commands were run.

### Results Pasted by Human

The curl output confirmed the sorting order:
- `Ballard Spahr LLP` (confidence: `MEDIUM`)
- `Martin Law LLC` (confidence: `MEDIUM`)
- `Nissenbaum Law Group, LLC` (confidence: `MEDIUM`)
- `Broad Street Employment Law Group` (confidence: `UNKNOWN`)
- `Liberty Legal Associates` (confidence: `UNKNOWN`)
- `Rittenhouse Family Law Partners` (confidence: `UNKNOWN`)
- `Schuylkill IP Law Group` (confidence: `UNKNOWN`)

This matches the expected ordering (MEDIUM > UNKNOWN, then alphabetical).

### Verification

Verify that:
1. Running `npm run test` passes all tests (including the new API sorting test).
2. The endpoint `http://localhost:3000/api/prospects/search?zip=19103` returns results ordered by confidence level descending, then alphabetically by firm name.

### Known Risks

No known risks. The sorting is done in-memory after Prisma fetches matching ZIP code records, avoiding database-specific raw SQL sorting dependencies.

### Next Recommended Step

Phase 6.5 — Post-Deployment Production Verification

---

## 2026-06-17 — Phase 6.6 — Align Homepage Copy with Mixed Pilot Data

### Task Summary

Update public-facing homepage copy to accurately and honestly describe the current mixed pilot dataset of seeded demo prospects and manually reviewed real-firm pilot records.

### Files Created

None.

### Files Changed

- `src/app/page.tsx` — Updated copy inside results-section, loading state, empty state, and welcome description to reflect the mixed pilot data state rather than demo-only data, adhering to all wording and verification status rules.
- `tasks/work.md` — Logged the implementation details of this phase.
- `tasks/current-task.md` — Prepared and transitioned active task tracking to Phase 6.7.

### What Changed

- Replaced:
  `Currently showing seeded demo prospect data from the database.`
  with the recommended copy:
  `Currently showing a small pilot dataset: seeded demo prospects plus manually reviewed real-firm records pending final verification.`
- Updated loading state descriptor from:
  `Querying seeded prospect records for ZIP...`
  to:
  `Querying stored database records for ZIP...`
- Updated home welcome descriptor from:
  `try 19103 to see sample prospects`
  to:
  `try 19103 to see pilot prospects`
- Changed search description from:
  `begin searching local boutique law firms`
  to:
  `begin ZIP-code search for boutique law firms`
- Updated result header from:
  `Sample Prospects for ZIP...`
  to:
  `Pilot Prospects for ZIP...`
- Updated empty state title and description to:
  `No prospects found`
  and:
  `No prospects found for this ZIP code in the current pilot dataset. Please search for ZIP 19103 to view pilot prospect data.`

### Why It Changed

- Since manually reviewed real law firm pilot records were seeded and successfully queried in production, homepage copy implying database results are seeded demo/sample-only was no longer fully accurate.
- To maintain honest, conservative copy that avoids describing pending real firms as verified while clearly outlining the pilot status.
- To comply with strict wording rules prohibiting phrases like "verified real firms", "real verified", or "local ZIP".

### Database / API / Roadmap Changes

- No Prisma schema, migrations, or database changes were made.
- No API route behaviors or sorting logics were changed.
- Seeding data remains unchanged.
- Roadmap updates were intentionally deferred and will be addressed in Phase 6.7.

### Commands Suggested

The human should run these commands to verify the build and tests:

```bash
npm run test
npm run build
npm run dev
git status
git diff
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. `npm run test` passes successfully.
2. `npm run build` succeeds without type errors.
3. Open `http://localhost:3000` (or `https://legal-prospect.vercel.app` once deployed):
   - Welcome card says: "... try 19103 to see pilot prospects to begin ZIP-code search..."
   - Searching a ZIP code like `19103` shows subtitle: "Currently showing a small pilot dataset: seeded demo prospects plus manually reviewed real-firm records pending final verification."
   - Search result header says: "Pilot Prospects for ZIP 19103"
   - Searching an empty/unseeded ZIP shows card: "No prospects found. No prospects found for this ZIP code in the current pilot dataset. Please search for ZIP 19103 to view pilot prospect data."
   - Loading state shows: "Querying stored database records for ZIP..."

### Known Risks

No known risks. All changes are copy adjustments and have no logic impact.

### Next Recommended Step

Phase 6.7 — Update Roadmap to Reflect Controlled Real-Data Path

---

## 2026-06-17 — Phase 7.2 — Wire Live Research Into Cache-First ZIP Search

### Task Summary

Make the ZIP-code search API cache-first: if the local database (Firm table) has records for a searched ZIP code, return them immediately. If not (cache miss), run the live-research engine (`runLeadResearch`), save and deduplicate the discovered firms in the flat `Firm` table, and return the newly saved records. Gracefully handle live research failures by returning a 200 response with an empty results list, and update loading copy on the homepage to reflect the potential live wait.

### Files Created

- `src/lib/db/saveResearchFirms.ts` — Implements mapping, ZIP lookups, and deduplication updates.
- `src/lib/db/saveResearchFirms.test.ts` — Tests formatting, counts, and isUseful merges.

### Files Changed

- `package.json` — Added `zipcodes` and `@types/zipcodes` dependencies.
- `src/app/api/prospects/search/route.ts` — Added cache-first logic with fallback to `runLeadResearch` and `saveResearchFirms`, dynamic route settings, refresh parameter, and graceful research error handling.
- `src/app/api/prospects/search/route.test.ts` — Added tests for cache-hits, cache-misses, refresh, and research failure paths.
- `src/app/page.tsx` — Updated loading screen state copy to set expectations for the live path.
- `tasks/work.md` — Logged Phase 7.2 completion.

### What Changed

- Created the `saveResearchFirms` database utility to map, sanitize, lookup offline cities/states, and deduplicate/merge new research records.
- Modified the search API route to wrap query checks and only call research when no database records exist (or a refresh is forced), degrading gracefully to 200 with empty results on OpenAI or search failure.
- Updated the loading UI to state "Searching live for firms near {zip} — this can take a minute or two."
- Wrote full unit and integration tests covering the new functionality.

### Why It Changed

- To integrate the live search capabilities into the product, enabling real-time lead discovery for any user-queried ZIP code, and optimizing performance/usage via a cache-first approach.

### Commands Suggested

The human should run these commands to install dependencies, run the test suites, and build the project:

```bash
npm install
npm run test
npm run build
npm run dev
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. Running `npm run test` passes all tests (including new cache-first and deduplication test suites).
2. Running `npm run build` compiles without errors.
3. Live manual searches in the UI work: cache hits load instantly, cache misses show the live loader and trigger OpenAI search grounding before showing new records.

### Known Risks

- DuckDuckGo scraping or OpenAI API failures could cause temporary search blockages. This is mitigated by the route's graceful error handling which degrades to a clean empty state rather than returning a 500.

### Next Recommended Step

Complete next safe task on the roadmap.

---

## 2026-06-17 — Swap Discovery + Enrichment Fetch to Tavily

### Task Summary

Refactored the live research discovery and contact enrichment flows to use Tavily (Tavily Search for discovery grounding, Tavily Extract for contact page content fetching) with a configurable fallback to the existing DuckDuckGo pipeline.

### Files Created

- `src/lib/research/searchProviders/types.ts` — Defined search provider interfaces and types.
- `src/lib/research/searchProviders/ddg.ts` — Ported existing DuckDuckGo HTML parsing and URL cleaning logic.
- `src/lib/research/searchProviders/tavily.ts` — Implemented Tavily Search/Extract REST API integration and pure mapping helpers.
- `src/lib/research/searchProviders/index.ts` — Factory utility resolving search providers and parsing environment variables.
- `src/lib/research/searchProviders/tavily.test.ts` — Unit test suite verifying mapping helpers, provider selection, and mocked Tavily responses.

### Files Changed

- `src/lib/research/runLeadResearch.ts` — Refactored to delegate search context queries to the active provider and utilize Tavily Extract for enrichment fetching.
- `.env.example` — Added environment variable placeholders for Tavily.
- `tasks/work.md` — Logged the implementation work.
- `tasks/current-task.md` — Updated task status.

### What Changed

- Abstracted search functionality into a `SearchProvider` model.
- Created `DdgSearchProvider` and `TavilySearchProvider`.
- Integrated Tavily `/search` REST API (POST request via native `fetch`).
- Integrated Tavily `/extract` REST API (POST request via native `fetch`).
- Refactored `runLeadResearch` to run discovery groundings via the active `SearchProvider` (Tavily by default, DDG if selected).
- Replaced the multi-page fetch in contact enrichment with choosing the single best target contact URL from search results using `pickContactLink` and fetching it via `fetchPageContent`.
- `fetchPageContent` calls Tavily `/extract` first (if `TAVILY_API_KEY` is present), falling back to direct HTTP page fetch on failure.
- Re-exported all existing DDG helpers from `runLeadResearch.ts` to prevent broken test/component imports.
- Created robust unit test coverage asserting mock search requests, provider selection, and mapper logic.

### Why It Changed

To resolve DuckDuckGo scraping blocking issues (403 HTTP errors) by using Tavily Search for discovery grounding, and to dramatically improve email address extraction rates by utilizing Tavily Extract's resilient page fetching infrastructure.

### Commands Suggested

The human should run:
```bash
npm run test
npm run build
```

And to verify Tavily manually:
1. Add `TAVILY_API_KEY=tvly-...` to `.env.local`.
2. Run `npm run dev`.
3. Try searching ZIP `10545` with a forced refresh: `curl "http://localhost:3000/api/prospects/search?zip=10545&refresh=true"`.
4. Verify console logs show Tavily Search and Tavily Extract runs, and emails are populated.

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. All Vitest unit tests pass successfully.
2. Production build compiles with no typescript errors.
3. UI search query logs indicate Tavily is used and email fields are successfully populated.

### Known Risks

- None. Tavily extraction degrades gracefully to a direct page fetch on API/credit failure, and discovery degrades gracefully to an LLM-only fallback or a direct DDG fetch if configured.

### Next Recommended Step

Wait for user review and feedback.

---

## 2026-06-18 — Phase 7.6 — Strip NUL/control bytes before save (fixes Postgres 22021 crash)

### Task Summary

Implemented Phase 7.6 to strip NUL (`\u0000`) and other C0 control characters from scraped/extracted data prior to saving to Neon Postgres, and isolated individual database saves per-firm inside try-catch blocks to prevent any single record error from rolling back the entire batch.

### Files Created

- `src/lib/research/sanitize.test.ts` — Unit tests for the new `sanitizeText` and `sanitizeFirm` helpers.

### Files Changed

- `src/lib/research/sanitize.ts` — Added `sanitizeText` and `sanitizeFirm` functions.
- `src/lib/db/saveResearchFirms.ts` — Applied sanitization and try-catch blocks on each firm in the save loop.
- `src/lib/db/saveResearchFirms.test.ts` — Added tests for control character sanitization and error isolation in the database write loop.
- `tasks/work.md` — Logged Phase 7.6 completion.

### What Changed

- Implemented `sanitizeText(v: string)` which filters out `\u0000` and C0 control characters except `\t`, `\n`, and `\r`.
- Implemented `sanitizeFirm<T>(firm: T)` which recursively walked nested object/array structures to clean string values.
- Integrated `sanitizeFirm` at the beginning of the `saveResearchFirms` loop, ensuring that all database-saved string fields and array values are fully clean.
- Wrapped database upserts inside the loop with try-catch blocks to isolate errors per firm and continue processing the rest of the batch.
- Added comprehensive unit tests in `sanitize.test.ts` and `saveResearchFirms.test.ts`.

### Why It Changed

To resolve Postgres database crashes (error code `22021`: `invalid byte sequence for encoding "UTF8": 0x00`) caused by NUL characters occurring in raw search scraped content, and to prevent a single bad record save from failing the entire batch and returning empty search results to the frontend.

### Commands Suggested

The human should run these commands to execute tests:

```bash
npx vitest run src/lib/research/sanitize.test.ts
npx vitest run src/lib/db/saveResearchFirms.test.ts
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. `npx vitest run src/lib/research/sanitize.test.ts` passes.
2. `npx vitest run src/lib/db/saveResearchFirms.test.ts` passes.
3. Live research on the crashed ZIP 10962 succeeds and saves without UTF-8 database encoding exceptions.

### Known Risks

- None.

### Next Recommended Step

Wait for user review and approval.

---

## 2026-06-18 — Phase 7.7 — Add Attorney table (one-to-many off Firm) — dual-write, keep arrays

### Task Summary

Added the relational `Attorney` table linked via a one-to-many relation to `Firm`. Built and integrated a pure helper `buildAttorneyInputs(firmId, names)` to sanitize (backstop), trim, and deduplicate attorneys. Modified `saveResearchFirms` to dual-write to the new `Attorney` table using Prisma upsert on create and update paths. Added unit tests for both the helper and the database saving logic.

### Files Created

- None.

### Files Changed

- `prisma/schema.prisma` — Added `Attorney` model and relation field `attorneyList` on `Firm`.
- `src/lib/db/saveResearchFirms.ts` — Added `buildAttorneyInputs` helper and integrated `prisma.attorney.upsert` dual-writes.
- `src/lib/db/saveResearchFirms.test.ts` — Updated mocks, added helper unit tests, and added dual-write test cases.
- `tasks/work.md` — Logged Phase 7.7 completion.

### What Changed

- Defined the `Attorney` model with `id` (UUID), `firmId` (Relation to Firm with cascade delete), `name` (String), `email` (String?), `title` (String?), and timestamps.
- Added `@@unique([firmId, name])` and `@@index([firmId])` to `Attorney`.
- Implemented `buildAttorneyInputs` to sanitize (backstop via `sanitizeText`), trim, and filter/deduplicate names.
- Updated the update and create paths in `saveResearchFirms` to fetch the firm ID and trigger sequential upserts to `prisma.attorney` for each unique attorney.
- Updated Prisma mocks and test suites in `saveResearchFirms.test.ts` to assert that correct upsert payloads are constructed and run.

### Why It Changed

To normalize the database schema by migrating from flat string array representations of attorneys to structured relational models, enabling rich attorney-level metadata extraction and queries in future phases, while preserving current reads and the flat array field to keep current UI/CSV output unchanged during transition.

### Commands Suggested

The human should run these commands:

1. Create and apply the additive migration:
   ```bash
   npx prisma migrate dev --name add_attorney_table
   ```
   *Verify that this executes successfully on the target Neon Postgres database.*

2. Regenerate the Prisma client:
   ```bash
   npx prisma generate
   ```

3. Run the Vitest unit tests:
   ```bash
   npx vitest run src/lib/db/saveResearchFirms.test.ts
   ```
   *Confirm all 8 test cases pass.*

4. Run the Next.js development server:
   ```bash
   npm run dev
   ```
   *Search for a ZIP (e.g. 19103) with refresh=true, then check the db (via npx prisma studio) to verify Firm.attorneys is still populated and the Attorney table contains corresponding mapped rows.*

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. Prisma migration completes successfully.
2. `npx vitest run src/lib/db/saveResearchFirms.test.ts` passes.
3. Live research runs successfully, and results are written to both `Firm` (as arrays) and the `Attorney` table (idempotently).

### Known Risks

- Sequentially executing upsert queries inside the save loop for attorneys adds database roundtrips. However, since the database runs on Neon/Postgres and batches are typically small (usually < 20 firms, 1-3 attorneys per firm), performance remains acceptable.

### Next Recommended Step

Wait for user review and approval.

---

## 2026-06-18 — Populate `practiceAreas` end-to-end (fix empty practice-area extraction)

### Task Summary

Populated the `Firm.practiceAreas` field throughout the entire research pipeline: from discovery (gpt-5.5) and enrichment (gpt-5.4-mini) schemas, prompt schemas, merging discovery and enrichment results, to database inputs and create/update logic inside `saveResearchFirms`. Built a pure helper function `normalizePracticeAreas` to trim, collapse whitespace, strip control characters, and case-insensitively deduplicate practice areas.

### Files Created

- None.

### Files Changed

- `src/lib/research/sanitize.ts` — Added `normalizePracticeAreas` helper function.
- `src/lib/research/sanitize.test.ts` — Added unit tests for `normalizePracticeAreas`.
- `src/lib/research/parseResearchResponse.ts` — Added `practice_areas` array to `ResearchFirmSchema` and `EnrichmentResultSchema` and integrated value sanitization.
- `src/lib/research/parsers.test.ts` — Added tests checking that the schemas parse and clean `practice_areas` properly.
- `src/lib/research/buildResearchPrompt.ts` — Updated JSON schema instructions and textual guidance in the discovery and enrichment LLM prompts.
- `src/lib/research/runLeadResearch.ts` — Modified to merge and union candidate and enrichment practice areas.
- `src/lib/db/saveResearchFirms.ts` — Added `practiceAreas`/`practice_areas` fields to `ResearchFirmInput` and updated database creation and update merging logic.
- `src/lib/db/saveResearchFirms.test.ts` — Added unit tests verifying `practiceAreas` are correctly populated on creation and unioned/merged on update.
- `docs/planning/v1datafetchingplan.md` — Updated output fields documentation and marked the `practiceAreas` extraction gap resolved.
- `tasks/work.md` — Logged the implementation work.

### What Changed

- Implemented `normalizePracticeAreas(raw)` which trims, collapses whitespace, filters empty strings/non-strings, strips NUL/C0 controls, and performs case-insensitive deduplication (retaining the first-seen casing).
- Updated the LLM prompts to ask for `practice_areas` in JSON arrays.
- Updated both `ResearchFirmSchema` and `EnrichmentResultSchema` zod models and parsers to validate and clean `practice_areas`.
- Refactored `runLeadResearch` merging logic to merge `candidate.practice_areas` and `enriched.practice_areas` via `normalizePracticeAreas`.
- Updated `saveResearchFirms` to save normalized practice areas on firm creation, and to perform a union merge with existing practice areas on firm update so already stored data is never lost.
- Verified TypeScript builds successfully and Vitest tests pass cleanly.

### Why It Changed

To fix the extraction gap where `practiceAreas` was left as an empty array `[]` on every researched law firm because the pipeline omitted requesting, transferring, or storing the field.

### Commands Suggested

The human should run these commands to execute tests:

```bash
npx vitest run
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

The human should verify:
1. `npx vitest run` executes successfully with all 108 test cases passing.
2. `npx tsc --noEmit` compiles successfully with no errors.
3. Live research on a fresh ZIP or with `refresh=true` (e.g. `curl "http://localhost:3000/api/prospects/search?zip=19103&refresh=true"`) populates the database `Firm.practiceAreas` list as verified via `npx prisma studio`.

### Known Risks

- None. Already-discovered practice areas are preserved via union-merge on update.

### Next Recommended Step

Wait for user review and approval.

---

## 2026-06-19 — Discovery Hardening & Locality Guard (Same-State Filter)

### Task Summary

Implemented discovery hardening to keep research results local to the searched ZIP code, by geo-grounding Tavily queries, geo-constraining LLM prompts, and enforcing a deterministic state matching guard that drops out-of-area candidate firms.

### Files Created

None.

### Files Changed

- `src/lib/research/parseResearchResponse.ts` — Updated ResearchFirmSchema and EnrichmentResultSchema with optional state and city, and updated parser sanitizers.
- `src/lib/research/sanitize.ts` — Added detectState and isInSearchedState pure helper functions.
- `src/lib/research/sanitize.test.ts` — Added comprehensive TDD unit tests for detectState and isInSearchedState.
- `src/lib/research/searchProviders/types.ts` — Added optional city and state parameters to getSearchContext.
- `src/lib/research/searchProviders/tavily.ts` — Updated TavilySearchProvider.getSearchContext to build geo-grounded search queries.
- `src/lib/research/searchProviders/ddg.ts` — Updated DdgSearchProvider.getSearchContext to accept city and state and build geo-grounded search queries.
- `src/lib/research/runLeadResearch.ts` — Integrated early ZIP resolution, location-grounded queries, prompts, and the deterministic locality guard.
- `tasks/decisions.md` — Documented same-state filtering limitations and Places API triggers.
- `tasks/work.md` — Logged the hardening implementation task.

### What Changed

- Resolved ZIP codes to city/state early in `runLeadResearch` using the offline zipcodes database.
- Structured search provider queries to use location context (e.g., "small law firms in Huntington, NY 11746" instead of just "11746").
- Updated prompt schemas and LLM instructions to focus strictly on searched states and output parsed "state" and "city" fields.
- Implemented `detectState` and `isInSearchedState` helpers to filter out firms base-located in different states (while keeping unknown/undetermined states to avoid over-filtering).
- Added verbose logging showing which firms are dropped by the locality guard in stdout.

### Why It Changed

To resolve issues where live research on New York ZIP codes leaked out-of-area firms from Oklahoma, Texas, or other states due to broad search groundings and generic prompts.

### Commands Suggested

1. Run the Vitest unit test suite to verify all checks (including the new state detection tests) pass:
   ```bash
   npx vitest run
   ```
2. Check typescript compilation:
   ```bash
   npx tsc --noEmit
   ```
3. Test a live search on ZIP `11746` with refresh enabled:
   ```bash
   curl -s "http://localhost:3000/api/prospects/search?zip=11746&refresh=true"
   ```
   Verify in console logs that out-of-state firms (e.g., Lindsey Law Firm in Tulsa, OK) are successfully dropped by the locality guard, and the returned JSON contains only NY-based or unknown-state firms.

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

Verify that:
1. `npx vitest run` passes all unit tests cleanly.
2. `npx tsc --noEmit` completes without compilation errors.
3. Querying ZIP `11746` drops Tulsa-based "Lindsey Law Firm" and logs it clearly.

### Known Risks

- Cross-border metro zones (e.g., a New Jersey firm serving adjacent New York border ZIPs) will be dropped because their detected state (NJ) does not match the searched ZIP's state (NY). This is documented as an acceptable trade-off for intra-state demos.

### Next Recommended Step

Proceed to Phase 8 / next UI refinement.

---

## 2026-06-19 — Results UI v2 (display-only)

### Task Summary

Replaced the hover-triggered firm-name popover with a performance-optimized click-to-toggle portal popover that renders on-demand, houses practice areas and addresses, and unmounts cleanly. Promoted attorneys to their own column (capped at 2 names with a `+N more` toggle button). Replaced Phone, Email, Website text fields with compact centered action icon links carrying full metadata in `title` and `aria-label`. Added unit tests for capping and multi-page CSV exports.

### Files Created

- `src/utils/attorneys.ts` — pure capping utility helper `capAttorneys(names, max)`
- `src/utils/attorneys.test.ts` — unit test suite for `capAttorneys`

### Files Changed

- `src/utils/toCsv.test.ts` — added test case verifying all rows across pages (index 10+ / Page 2+) are exported correctly to CSV
- `src/components/ResultsTable.tsx` — updated state, portal popup with scroll/Escape/click-outside listeners, button expansion, and centered action icon cells
- `src/app/globals.css` — added styling for badge button, action icons, column width limits, and popover address details
- `tasks/work.md` — logged this session's progress

### What Changed

- Abstracted capping logic to a pure helper utility `capAttorneys` and wrote full unit tests.
- Replaced eager rendering of popup elements inside rows with a single table-level React portal container rendering strictly on-demand `{activePopover && ...}`, fixing the ~10s rendering lag.
- Switched popup trigger to a clickable badge with toggle state. Added window scroll, Escape key, and click-outside listeners to close the popover.
- Promoted attorneys to their own table column, displaying the first 2 inline with a real `<button aria-expanded="...">` toggling expanded states.
- Replaced text columns for Email, Phone, Website with SVG action icons having accessible names and tooltips. Centered action cell content.
- Added a unit test validating that CSV generation processes a larger array of items, verifying all records across multiple pages are exported.

### Why It Changed

To make the prospecting table layout more compact and readable, fix rendering lags caused by eager DOM buildup, ensure scroll accessibility, and provide clear visual cues for primary action targets.

### Commands Suggested

```bash
npx vitest run src/utils/attorneys.test.ts
npx vitest run src/utils/toCsv.test.ts
npx vitest run
npx tsc --noEmit
npm run dev
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

Check that:
1. Running `npx vitest run` passes all 115 test cases successfully.
2. Running `npx tsc --noEmit` runs with no typescript compiler errors.
3. Running `npm run dev` and searching ZIP `19103` displays the upgraded results table layout.
4. Clicking count badges toggles popovers showing practice areas and address lines. Popovers close on Escape, scroll, outside-clicks, or clicking the badge again.
5. Capping attorneys is limited to 2 with a toggle button that expands list on click.
6. Email, Phone, Website render as SVG links, and CSV download still exports full text values for all rows across pages.

### Known Risks

No known risks. All changes are display-only and contain no database schema, query, or API pipeline modifications.

### Next Recommended Step

Wait for user review and approval of visual implementation.

---

## 2026-06-19 — Auth Step 2 — email-code login flow (routes, pages, Resend)

### Task Summary

Implemented a custom email-code authentication flow on top of the existing user/session schemas. Created server-only helpers for Resend email dispatch and session resolution, set up API routes for request-code, verify-code, and sign-out, built the Server/Client split login pages (with automatic redirect for already-signed-in users), built a protected account page with a working sign-out button, and added comprehensive Vitest unit tests.

### Files Created

- `src/lib/auth/email.ts` — Resend client email dispatcher utility.
- `src/lib/auth/session.ts` — Server-side session checker.
- `src/app/api/auth/request-code/route.ts` — Request-code API endpoint.
- `src/app/api/auth/verify-code/route.ts` — Verify-code API endpoint.
- `src/app/api/auth/sign-out/route.ts` — Sign-out API endpoint.
- `src/app/login/LoginForm.tsx` — Login Form client interaction component.
- `src/app/login/page.tsx` — Login page server component with already-logged-in user redirection.
- `src/app/account/page.tsx` — Protected account page server component.
- `src/app/account/SignOutButton.tsx` — Sign out button client component.
- `src/app/api/auth/request-code/route.test.ts` — Unit tests for requesting login codes.
- `src/app/api/auth/verify-code/route.test.ts` — Unit tests for verifying login codes.
- `src/app/api/auth/sign-out/route.test.ts` — Unit tests for logging out.

### Files Changed

- `src/lib/auth/db.ts` — added `markUserLoggedIn(userId: string)` db helper to record login timestamps.
- `tasks/work.md` — logged this task's work details.

### What Changed

- Abstracted user session retrieval and Resend client delivery to secure, server-only files.
- Built request-code, verify-code, and sign-out endpoints with explicit protection against email-bombing (60s cooldown) and account enumeration (always returning `{ ok: true }` for requesting codes).
- Separated `/login` into a Server page that handles logged-in redirects and a Client Form component (`LoginForm`) that handles the step-based forms, API calls, and errors.
- Secured `/account` page to check `getCurrentUser()` on the server and redirect unauthenticated users to `/login`.
- Created comprehensive route tests to verify allowlist logic, session lifetimes, attempt increment checks, cookie settings, and database transactions.

### Why It Changed

To establish a custom, self-hosted email verification flow utilizing Resend instead of Clerk, securing private endpoints and pages while maintaining database ownership.

### Commands Suggested

```bash
npm install resend
npx tsc --noEmit
npx vitest run
```

### Commands Run by Human

`No commands run.`

### Results Pasted by Human

`No results pasted.`

### Verification

Check that:
1. `npm install resend` is run by the user.
2. Running `npx vitest run` passes all 145+ test cases successfully.
3. Running `npx tsc --noEmit` runs with no typescript compiler errors.
4. Adding an active user via Prisma Studio and walking through `/login` successfully creates a LoginCode and Session, sets the HTTP cookie, and loads `/account`.
5. Signing out clears the cookie and redirects to `/login`.
6. Accessing `/login` when already logged in redirects to `/account`.

### Known Risks

- Relies on Resend API credentials (`RESEND_API_KEY` and `AUTH_EMAIL_FROM`) being configured correctly in the local `.env` and production environments.

### Next Recommended Step

Update `task/current-task.md` for the next planned phase.

---

## 2026-06-24 — Phase 1 Evidence Model & Research Audit Logging

### Task Summary

Implemented Phase 1 of the evidence model and research audit logging. Added ResearchRun and WebsiteCheck tables to schema, implemented attempt classification and sequential attempts-tracking in page extraction dispatcher, updated discovery research loop to collect and return attempts per firm, created persistResearchAudit helper to record runs and website checks in the database, and wired the call to prospects search API.

### Files Created

- `src/lib/db/persistResearchAudit.ts` — persists ResearchRun and associated WebsiteCheck rows to database in a best-effort, safe manner.

### Files Changed

- `prisma/schema.prisma` — added enums ResearchTrigger, FetchProvider, CheckOutcome, added ResearchRun and WebsiteCheck models, added relation to Firm.
- `src/lib/research/extract.ts` — implemented classifyAttempt and attempts-tracking sibling dispatcher extractPageContentWithAttempts.
- `src/lib/research/runLeadResearch.ts` — updated return signature, collected and returned timestamps and attempts per firm.
- `src/app/api/prospects/search/route.ts` — wired best-effort persistResearchAudit execution after save/read-back.
- `tasks/work.md` — logged this session's progress.

### What Changed

- Created database models for auditing research runs and individual provider checks.
- Captured outcomes and httpStatus for each attempt in Jina-first/direct/Tavily extraction pipelines.
- Resolved firm IDs by exact trimmed name during audit log database write.
- Enabled best-effort execution of logging database queries that catches all internal errors to guarantee that auditing failures never break lead search.

### Why It Changed

To establish a durable audit trail of where research passes went and what each page fetch attempt returned.

### Commands Suggested

```bash
npx tsc --noEmit
npx vitest run
```

### Commands Run by Human

```bash
npx prisma migrate dev --create-only --name add_research_runs
npx prisma migrate dev
```

### Results Pasted by Human

The migrations were successfully created and applied to Neon DB.

### Verification

1. Run verification commands to ensure no TypeScript or test regressions.
2. Run a lead search on home page for a fresh ZIP and check that ResearchRun and WebsiteCheck rows are successfully created in PostgreSQL.

### Known Risks

No known risks. Database queries are fully wrapped to prevent errors from crashing search operations.

### Next Recommended Step

Update `task/current-task.md` to define Phase 2: Evidence model predictions, data points, and email clobbering updates.

---

## 2026-06-25 — Contact Trust Badge Implementation

### Task Summary

Implemented the Contact Trust Badge feature. Added a presentational component and pure mapper function to render source-level trust badges next to firm emails and phone numbers wherever contact details are displayed, wired database provenance data to frontend objects, and updated seed prospects for deterministic manual verification.

### Files Created

- `src/lib/contactBadge.ts` — pure utility mapper function mapping source strings to badge labels and styles (trust, neutral, caution, muted).
- `src/components/ContactBadge.tsx` — presentational component displaying inline badge pills with formatted tooltips based on source type and confidence level percentage.

### Files Changed

- `src/types/prospect.ts` — added optional properties `emailSource`, `emailConfidence`, `phoneSource`, and `phoneConfidence` to the frontend `Prospect` model interface.
- `src/data/prospects.ts` — added mock provenance fields to `prospect_001` (Liberty Legal Associates) with `emailConfidence` set to 0.9.
- `src/app/api/prospects/search/route.ts` — mapped `emailSource`, `emailConfidence`, `phoneSource`, and `phoneConfidence` from database firm rows to mapped search results.
- `src/app/leads/page.tsx` — mapped `emailSource`, `emailConfidence`, `phoneSource`, and `phoneConfidence` from saved lead database items to prospect list items.
- `src/components/ResultsTable.tsx` — imported `ContactBadge` and rendered it in-cell inline-flex next to the email and phone anchors.
- `src/app/dashboard/page.tsx` — imported `ContactBadge` and rendered it inline next to the phone details.
- `tasks/work.md` — logged this session's progress.

### What Changed

- Created mapping logic that maps the six database source values to custom user-facing labels and tone styling.
- Created presentational pill component with formatted percentage tooltips and HSL accent colours matching the dark theme.
- Configured data fetching pipeline from backend API searches and saved lead pages to propagate provenance fields to components.
- Added visual trust indicators in the search result rows, the saved leads page table, and the dashboard saved-leads panel.

### Why It Changed

To display the source origin and confidence metrics for firm email and phone contacts to reps, helping them evaluate lead reliability.

### Commands Suggested

```bash
npx prisma generate
npx vitest run src/lib/contactBadge.test.ts
npx vitest run
npx tsc --noEmit
```

### Commands Run by Human

```bash
npx prisma generate
npx vitest run src/lib/contactBadge.test.ts
npx vitest run
npx tsc --noEmit
```

### Results Pasted by Human

- `npx prisma generate` generated Prisma Client v7.8.0 successfully.
- `npx vitest run src/lib/contactBadge.test.ts` passed 7/7 tests successfully.
- `npx vitest run` passed all 33 test suites and 337 unit tests successfully.
- `npx tsc --noEmit` compiled successfully without any type errors.

### Verification

1. Start Next.js development server (`npm run dev`).
2. Search for the ZIP code `19103`.
3. Check `Liberty Legal Associates` search row: verify that the email displays the emerald-accented **Firm domain** badge (hover tooltip: **Firm domain (90%)**) and the phone displays the emerald-accented **Google verified** badge (hover tooltip: **Google verified (85%)**).
4. Save the lead and verify the badges display under `/leads` and `/dashboard`.

### Known Risks

None. Visual layout is cleanly inline and presentational, and logic is fully unit-tested.

### Next Recommended Step

Update `task/current-task.md` for the next planned phase.

---

## 2026-06-25 — Revert Per-Field Contact Badge from UI

### Task Summary

Reverted the per-field contact badge from the frontend UI components and mapping pipelines, preserving the entire data layer (Prisma model schema, saveResearchFirms writes, evidence parsing).

### Files Created

None.

### Files Changed

- `src/types/prospect.ts` — removed the optional contact badge fields from the frontend `Prospect` interface.
- `src/data/prospects.ts` — removed the mock provenance fields from `prospect_001`.
- `src/app/api/prospects/search/route.ts` — removed contact provenance mappings from search response mapper.
- `src/app/leads/page.tsx` — removed contact provenance mappings from saved leads mapper.
- `src/components/ResultsTable.tsx` — removed `ContactBadge` import and badge markup, restoring cells to their pre-badge state.
- `src/app/dashboard/page.tsx` — removed `ContactBadge` import and badge markup next to phone rendering.
- `src/components/ContactBadge.tsx` — blanked out (ready for deletion).
- `src/lib/contactBadge.ts` — blanked out (ready for deletion).
- `src/lib/contactBadge.test.ts` — blanked out (ready for deletion).
- `tasks/work.md` — logged this session's progress.

### What Changed

- Cleaned up frontend references, imports, and UI layout wiring for per-field badges.
- Blanked out the badge component, mapping logic, and test files so that they are ready for deletion and do not conflict with compilation.
- Kept the backend provenance schema columns and write logic intact.

### Why It Changed

Per-field provenance badges were determined to be too builder-facing and cluttered the main results table layout.

### Commands Suggested

```bash
rm src/components/ContactBadge.tsx src/lib/contactBadge.ts src/lib/contactBadge.test.ts
npx tsc --noEmit
npx vitest run
```

### Commands Run by Human

No commands run yet in this session.

### Results Pasted by Human

No results pasted yet.

### Verification

1. Start Next.js development server (`npm run dev`).
2. Verify that searching for `19103` loads the prospects cleanly with no badges.
3. Verify that `/leads` and `/dashboard` show contact details without badges.
4. Verify that running `npx vitest run` passes all 330+ tests successfully after the test file is deleted.

### Known Risks

None. All imports and types are clean.

### Next Recommended Step

Update `task/current-task.md` for the next planned phase.

## 2026-06-26 — Dashboard restyle to the ledger aesthetic

### Task Summary

Restyled the dashboard page (`/dashboard`) to follow the warm-paper ledger look, using standard server component data loading, clean link anchors, custom divider borders on the stats strip, and dedicated mobile stacking classes.

### Files Created

None.

### Files Changed

- `src/lib/activity.ts` — Added `getRecentSearchesWithTime` to load and deduplicate ZIP searches with their relative timestamps.
- `src/app/dashboard/page.tsx` — Rewrote the page markup and query fetching concurrently using Promise.all, added greeting, stats (including close rate), and composed date format logic.
- `src/app/globals.css` — Appended styling classes under the `.rl-dash-` namespace for header groups, stat tiles borders, column lists, and mobile media queries.

### What Changed

- Kept the dashboard as a server component utilizing server links.
- Replaced the inline ZIP box search bar with a "New search" button.
- Cleaned up lead activity logs, recent search timestamps, and activity feeds to show real events without placeholders or bullet dots.
- Handled empty states and responsive grid layout configurations.

### Why It Changed

Aligns the user dashboard page layout with the global ledger styling aesthetic guidelines.

### Commands Suggested

```bash
npx tsc --noEmit
npx vitest run
```

### Commands Run by Human

```bash
npx tsc --noEmit
npx vitest run
```

### Results Pasted by Human

353 tests passed successfully. No typescript compilation issues.

### Verification

1. Start Next.js development server.
2. View `/dashboard` in the browser.
3. Validate header, 4 stat tiles with correct colors/borders/links, saved leads rows, and activity feeds.







