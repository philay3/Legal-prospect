# BGlad Continuation Handoff — App Shell Built, Local ZIP Search Working, First TDD Layer Added

Date: 2026-06-16

Purpose: Handoff for the next BGlad session so the project can continue from the current working rebuild state without losing scope control, command discipline, or the small-step development process.

---

## 1. Current Status

The project has moved well past the original planning-only handoff.

Earlier status was:

```text
Phase 0 complete / nearly complete: Control and Planning
Next phase: Phase 1: Basic App Shell
```

Current status is now:

```text
Phase 0: Control and Planning — complete
Phase 1: Basic App Shell — complete
Phase 2: Local Manual Seed Data + Local ZIP Search — in progress / mostly complete
First TDD layer — added
```

The app is now visible and usable locally for a small demo flow.

Current working product flow:

```text
User enters ZIP code → app checks local/manual seed data → app displays matching local demo law firm prospects → user can review prospect details
```

Important: this is still a controlled local/demo workflow. It is not connected to a database, external APIs, auth, scraping, enrichment, saved leads, or a dashboard.

---

## 2. Actual Current Repo Shape

The original handoff expected paths like:

```text
AGENTS.md
task/current-task.md
docs/START-HERE.md
```

The actual working project appears to use paths closer to:

```text
legal-prospecting-planning-docs-starter/
├── agents.md
├── README.md
├── package.json
├── src/
│   ├── app/
│   │   ├── page.tsx
│   │   ├── globals.css
│   │   └── layout.tsx
│   ├── data/
│   │   └── prospects.ts
│   ├── types/
│   │   └── prospect.ts
│   └── utils/
│       ├── prospectMatcher.ts
│       └── prospectMatcher.test.ts
├── tasks/
│   ├── current-task.md
│   └── work.md
└── docs/
    └── planning/
        ├── -START-HERE.md
        ├── 07-testing-guide.md
        ├── 08-coding-agent-rules.md
        ├── 09-roadmap.md
        └── 10-spawned-agent.md
```

Use the actual repo paths, not the old idealized ones, unless the user explicitly decides to rename/move files.

---

## 3. What Has Been Completed Since the Earlier Handoff

### Planning and Process

Completed:

- planning/control docs established
- command-control rules strengthened
- one-task-per-agent-session process established
- coding-agent spawn prompt created/saved
- user clarified that the coding agent should not run terminal commands
- human controls `npm`, `npx`, `git`, `build`, `dev`, `test`, install, cleanup, and database commands

Important process improvement:

```text
The coding agent edits inside scope.
The human runs commands.
BGlad reviews plans/reports and writes tight handoffs.
```

### App Setup

Completed:

- Next.js app scaffold added into the planning repo
- `npm install` run by the human
- scaffold committed by the human
- app shell created
- home/search page placeholder created
- system fonts only
- no Tailwind
- no shadcn/ui
- no Google fonts
- no auth
- no database

### Manual Seed Data

Completed:

- local manual/demo seed prospect data added
- seed ZIP appears to be `19103`
- data is fictional/demo law firm data
- files likely include:
  - `src/types/prospect.ts`
  - `src/data/prospects.ts`

### Read-Only Prospect Display

Completed:

- home page displays local manual/demo seed prospects
- records are labeled as demo/manual seed data
- unsupported ZIP behavior added later
- no external fetching
- no database

### Local ZIP Search

Completed:

- ZIP input enabled
- Search button enabled
- user can search for the local test ZIP
- `19103` returns local demo prospects
- unsupported valid ZIP values return an empty state
- invalid ZIP values return validation behavior
- behavior remains local only

### TDD / Unit Test Setup

Completed:

- basic Vitest setup added
- `package.json` updated with test scripts and dev dependency
- pure utility created for ZIP normalization/matching
- test file added
- tests were run by the human and passed

Known test result shared by user:

```text
src/utils/prospectMatcher.test.ts (8)
  normalizeZipCode (3)
  matchProspectsByZip (5)

Test Files  1 passed (1)
Tests       8 passed (8)
```

### ZIP+4 Bugfix

Completed after user noticed an edge case.

The app should now accept both:

```text
19103
19103-1234
```

Expected normalization rule:

```text
Accept standard 5-digit ZIPs and ZIP+4 format.
Match prospects by the first 5 digits for now.
```

This means:

```ts
normalizeZipCode("19103")      // "19103"
normalizeZipCode("19103-1234") // "19103"
```

Invalid ZIP+4 shapes such as these should not match:

```text
19103-12
19103-12345
```

### Expand/Collapse Prospect Details

Most recent task appears to be completed.

The user says the result looks and feels much better than the first time.

Expected scope of that task:

- local UI-only expand/collapse or show/hide details
- uses existing seed-data fields only
- no saved leads
- no persistence
- no routing
- no database
- no API routes
- no external enrichment
- no auth

If this task has not already been committed, BGlad should recommend the human checkpoint before moving on:

```bash
npm run test
npm run build
npm run dev
git status
git add .
git commit -m "Add expandable prospect details"
```

Only the human should run those commands.

---

## 4. Current Product State in Plain English

The app currently demonstrates the first meaningful local version of the core product idea:

```text
A sales rep can type a ZIP code and see demo small/boutique law firm prospects for that ZIP.
```

What exists now:

- app shell
- ZIP input
- local ZIP matching
- ZIP+4 support
- demo prospect results
- empty state
- validation state
- expandable prospect details
- local business-logic tests

What does not exist yet:

- real data
- database
- authentication
- saved leads
- recent searches
- private dashboard
- scraping
- enrichment
- external APIs
- production search architecture
- user accounts
- persistence

---

## 5. Current Testing State

The project now has the first useful automated test layer.

Current test focus:

```text
Pure local ZIP matching logic
```

Known utility functions:

```text
normalizeZipCode
matchProspectsByZip
```

Known coverage:

- clean 5-digit ZIPs
- whitespace trimming
- invalid ZIP rejection
- matching prospects by ZIP
- unsupported ZIP empty result
- empty prospect array
- ZIP+4 support was added after the first TDD pass

Testing philosophy going forward:

- keep testing business logic first
- do not jump to UI/browser tests too early
- avoid Playwright/Cypress for now
- avoid React Testing Library until component complexity justifies it
- human runs test commands

Recommended human verification commands after feature tasks:

```bash
npm run test
npm run build
npm run dev
```

---

## 6. Guardrails That Must Continue

### Human-Controlled Commands

Coding agents must not run terminal commands.

This includes:

```text
cd
ls
pwd
git status
git add
git commit
npm install
npm run dev
npm run build
npm run test
npm run lint
npx
rm
mv
cp
cleanup commands
database commands
```

Agents may propose commands under:

```text
Commands for human to run
```

The human runs them.

### Absolutely Forbidden / High-Risk Commands

Continue treating these as forbidden unless the human makes an explicit, informed exception:

```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
git reset --hard
git clean -fd
```

### Do Not Rush Into

Still do not rush into:

- Clerk
- custom auth
- Prisma
- migrations
- real database seeding
- saved leads with persistence
- recent ZIP persistence
- scraping
- enrichment
- external APIs
- dashboard complexity
- billing
- teams
- organizations
- permissions

These are later phases.

---

## 7. MCP Note

The TA suggested adding `.mcp.json` for Next.js DevTools MCP:

```json
{
  "mcpServers": {
    "next-devtools": {
      "command": "npx",
      "args": ["-y", "next-devtools-mcp@latest"]
    }
  }
}
```

Decision for now:

```text
Do not add .mcp.json yet.
```

Reason:

- MCP clients may run the configured `npx` command automatically.
- This conflicts with the current human-controlled command policy.
- It can be revisited later as a deliberate tooling task.

---

## 8. Current Data Direction

Approved current data approach:

```text
Manual/demo local seed data only.
```

No external data fetching is approved yet.

Before any fetching, scraping, enrichment, provider use, or prompt-driven research pass is implemented, it must be documented in:

```text
docs/planning/03-data-fetching-plan.md
```

Future fetching/enrichment plans must define:

- trigger
- input
- source
- exact prompt/query/API request
- pass number
- output fields
- confidence/source quality
- save behavior
- overwrite behavior
- cost/rate-limit risk

---

## 9. Current Auth Direction

Auth is still delayed.

Do not recommend Clerk unless the user explicitly changes direction.

Preferred later auth direction remains:

- custom email-code auth
- Resend
- verified custom domain
- HttpOnly session cookie
- email allowlist
- small user base, roughly 10–50 users
- no passwords
- no OAuth
- no teams
- no organizations
- no billing

---

## 10. Data Ownership Rule

This remains central.

Global/shared data:

- ZIP code research
- firm records
- attorney records
- practice areas
- data source records
- cached ZIP results

Private/user-specific data:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Do not let the coding agent blur this line.

This matters especially for the next likely task if local-only saved leads are explored.

---

## 11. Recommended Next Step

If the latest expand/collapse details task has been verified and committed, the next likely controlled task is:

```text
Add a simple local-only saved leads placeholder state for demo prospects.
```

But be careful: “saved leads” is normally a later/user-workflow feature.

The only safe version right now is:

```text
Local-only, in-memory, demo placeholder state.
No persistence.
No database.
No auth.
No localStorage.
No recent searches.
No user account.
No dashboard.
```

A safer task title would be:

```text
Add local-only save/unsave UI state for demo prospects.
```

This would let the user click “Save” on a demo prospect and see it visually marked as saved during the current page session only.

It should not persist after refresh.

---

## 12. Suggested Next `tasks/current-task.md` Direction

Use this only after the latest task is verified/committed.

Task name:

```text
Add local-only save/unsave UI state for demo prospects.
```

Purpose:

```text
Let the user mark demo prospects as saved during the current browser session only, without adding database persistence, auth, dashboard, or saved-leads architecture.
```

Allowed:

- add a local Save/Unsave button to each displayed prospect
- use minimal React state
- visually mark saved demo prospects
- optionally show a simple count of saved prospects in the current session
- keep state in memory only
- update `tasks/work.md`

Explicitly forbidden:

- database
- Prisma
- migrations
- auth
- dashboard
- saved leads table
- localStorage/sessionStorage
- backend API routes
- external fetching
- lead notes
- lead status workflow
- recent searches
- user accounts
- dependencies
- commands run by agent

Testing guidance:

- no new UI tests required yet
- preserve existing ZIP utility tests
- do not alter `prospectMatcher` unless necessary
- human runs `npm run test`, `npm run build`, `npm run dev`

Risk note:

```text
This task introduces a user-workflow concept, so keep it explicitly local-only and non-persistent.
```

---

## 13. Alternative Next Step If BGlad Wants More Testing First

If the user wants stronger TDD before more UI, recommend:

```text
Add unit tests for ZIP+4 normalization and matching behavior.
```

Only do this if the ZIP+4 bugfix was not already covered by tests.

Expected tests:

- `normalizeZipCode("19103-1234")` returns `"19103"`
- `normalizeZipCode(" 19103-1234 ")` returns `"19103"`
- `matchProspectsByZip(SEED_PROSPECTS, "19103-1234")` returns same matches as `"19103"`
- invalid ZIP+4 values return no match

---

## 14. User Working Style Reminder

The user prefers:

- direct practical recommendations
- clean markdown handoffs
- downloadable `.md` files when useful
- one feature per coding-agent session
- small safe increments
- no overengineering
- no vague abstractions
- honest risk notes
- bootcamp-friendly explanations
- enough context to make product-owner decisions

The user likes to discuss “why” in plain English, especially around:

- TDD
- what should be tested
- what should be manual
- what is scope creep
- when to spawn a new agent
- whether to approve an agent plan
- whether an agent’s report is trustworthy

---

## 15. BGlad Role Going Forward

BGlad should continue acting as:

- product/technical planning partner
- scope-control reviewer
- coding-agent handoff writer
- coding-agent final-report reviewer
- risk checker
- migration/data-loss guardrail
- testing/process coach
- plain-English explainer
- product-owner support

BGlad is not the coding agent.

BGlad should not try to directly build the app unless the user specifically asks for markdown handoffs or review materials.

---

## 16. Watchouts for Future Sessions

### Watch for command-control drift

If an agent says it ran commands, clarify whether those were:

- actual terminal commands, or
- file-browser/view/edit actions inside the coding tool

Terminal commands remain human-only.

### Watch for unreported changed files

If the agent activity log says it edited files that are not in the final report, ask for clarification before commit.

### Watch for design scope creep

Phrases like:

```text
premium
beautiful
advanced
dashboard
production-ready
```

should be narrowed to:

```text
simple
readable
local-only
demo
controlled
```

### Watch for early persistence

Saved leads, recent ZIPs, notes, and statuses are private user-workflow data.

They should not be persisted until auth/data ownership/database plans are ready.

### Watch for database creep

Do not add Prisma/database until the user explicitly begins that phase and the current task file allows it.

---

## 17. Current Best Summary

The project has moved from:

```text
planning docs only
```

to:

```text
a working local demo of ZIP-based legal prospect search with tests
```

The current safe path is:

```text
Keep improving the local demo workflow one small task at a time.
Add persistence/auth/database only after the local workflow is clear and controlled.
```

Most likely next safe feature:

```text
Local-only in-memory save/unsave UI for demo prospects.
```

But only after the latest expand/collapse details task is verified and committed.