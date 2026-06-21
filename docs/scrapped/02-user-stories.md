# User Stories

## Purpose

This document turns the product scope into concrete user stories and acceptance criteria.

These stories should guide future coding-agent tasks.

The goal is to keep development small, testable, and understandable.

---

## Product Summary

The app helps sales reps find small and boutique law firm prospects by ZIP code.

The first useful product flow is:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

The first version should use controlled seed data before any external data fetching.

---

## User Role

Primary user:

```text
Sales rep selling legal software or legal-adjacent services to small and boutique law firms.
```

The user wants to find law firm prospects quickly in a local market.

---

## Story Status Labels

Use these status labels when stories are eventually worked:

```text
Draft
Approved
In Progress
Review
Done
```

Only one story should be in progress at a time.

---

## Epic 1: Project Control Foundation

### Story 1.1: Read Project Rules Before Work

As the project owner, I want the coding agent to read the project rules before making changes, so that work stays controlled and safe.

#### Acceptance Criteria

- `AGENTS.md` exists.
- `task/current-task.md` exists.
- The coding agent checks that requested work is listed in `task/current-task.md`.
- The coding agent does not work outside the current task.
- The coding agent stops if scope is unclear.

#### Out of Scope

- Product features
- Auth
- Database work
- External data fetching

#### Verification

The human can verify this by checking that future coding-agent final reports mention the current task and files changed.

---

### Story 1.2: Track Every Coding-Agent Task

As the project owner, I want every coding-agent task logged, so that I can understand what changed over time.

#### Acceptance Criteria

- `task/work.md` exists.
- Each task adds a dated work log entry.
- Each entry lists files created or changed.
- Each entry explains what changed and why.
- Each entry lists suggested commands.
- Each entry lists commands run by the human, if any.
- Each entry lists known risks.
- Each entry recommends one next step.

#### Out of Scope

- Automated changelog generation
- Git commits
- CI integration

#### Verification

The human can open `task/work.md` and confirm a new entry exists after each task.

---

### Story 1.3: Record Product and Technical Decisions

As the project owner, I want important decisions recorded, so that future sessions do not lose context.

#### Acceptance Criteria

- `task/decisions.md` exists.
- Decisions include date, decision, reason, risks, and revisit conditions.
- Old decisions are not deleted.
- Changed decisions are recorded as new entries.

#### Out of Scope

- Formal architecture decision records
- Automatic decision tracking

#### Verification

The human can open `task/decisions.md` and see the major rebuild decisions.

---

## Epic 2: App Shell

### Story 2.1: Show a Basic App Home Page

As a sales rep, I want to open the app and see a clear starting point, so that I know where to begin.

#### Acceptance Criteria

- A home page exists.
- The page explains the core purpose of the app.
- The page includes a ZIP search entry point or placeholder.
- The page does not require auth.
- The page does not require database data yet unless that task explicitly includes it.

#### Out of Scope

- Auth
- Dashboard
- Saved leads
- Recent ZIPs
- External fetching
- Polished marketing site

#### Verification

The human opens the app in the browser and confirms the home page is visible.

---

### Story 2.2: Show a Simple Layout

As a sales rep, I want the app to be easy to read, so that I can focus on prospecting.

#### Acceptance Criteria

- The app has a simple readable layout.
- Main content is not cramped.
- Search/results space is obvious.
- Layout works reasonably on desktop.
- Layout does not add unnecessary navigation.

#### Out of Scope

- Complex responsive design
- Animations
- Marketing pages
- Full dashboard layout

#### Verification

The human opens the page and confirms it is readable.

---

## Epic 3: Seed Prospect Data

### Story 3.1: Create Manual Seed Prospect Data

As the project owner, I want sample law firm prospect data, so that the app can prove the search flow without live fetching.

#### Acceptance Criteria

- Seed data includes a small number of law firm prospects.
- Seed data includes at least one known test ZIP code.
- Records include enough fields to display a useful result.
- Seed data is clearly marked as manual/test data.
- No external data fetching is added.

#### Suggested Fields

Seed records may include:

- firm name
- website
- phone
- email
- address
- city
- state
- ZIP code
- practice areas
- attorney names
- source label
- confidence level

#### Out of Scope

- Scraping
- Enrichment
- External APIs
- Browser automation
- Automated source verification
- Duplicate resolution

#### Verification

The human can inspect the seed data file or database seed and confirm sample firms exist.

---

### Story 3.2: Keep Seed Data Separate From External Fetching

As the project owner, I want seed data to stay clearly separate from external fetching, so that data behavior remains controlled.

#### Acceptance Criteria

- Seed data is manually defined.
- No provider, scraper, browser automation, or prompt pass is added.
- Any future external fetching is deferred to `docs/03-data-fetching-plan.md`.
- Seed data does not overwrite user workflow data.

#### Out of Scope

- Live enrichment
- Source ranking
- Cost tracking
- Provider selection

#### Verification

The human can review changed files and confirm no external-fetching code was added.

---

## Epic 4: ZIP Search

### Story 4.1: Enter a ZIP Code

As a sales rep, I want to enter a ZIP code, so that I can search for law firm prospects in that area.

#### Acceptance Criteria

- A ZIP input is visible.
- The user can type a ZIP code.
- Empty input shows a helpful message or prevents search.
- Invalid input shows a helpful message or prevents search.
- Valid seeded ZIP input can trigger a search.

#### Out of Scope

- Radius search
- City/state search
- Recent ZIPs
- Autocomplete
- Map UI
- External fetching

#### Verification

The human types a valid and invalid ZIP code and confirms the expected behavior.

---

### Story 4.2: Show Matching Seeded Prospects

As a sales rep, I want to see law firm prospects for the ZIP code I searched, so that I can decide who to research further.

#### Acceptance Criteria

- Searching a seeded ZIP shows matching prospects.
- Each result shows firm name.
- Each result shows location.
- Each result shows website or phone if available.
- Each result shows practice areas if available.
- Results are based only on controlled data for this phase.

#### Out of Scope

- Ranking algorithm
- AI scoring
- Enrichment
- Saved leads
- Recent ZIPs
- Dashboard

#### Verification

The human searches a seeded ZIP and confirms matching firms appear.

---

### Story 4.3: Show an Empty State

As a sales rep, I want a clear message when no prospects are found, so that I understand the app is not broken.

#### Acceptance Criteria

- Searching a ZIP with no seed data shows an empty state.
- The empty state explains that no seeded prospects were found.
- The empty state does not trigger external fetching.
- The user can search again.

#### Out of Scope

- Automatically finding live results
- Suggesting paid enrichment
- Saving empty searches
- Recent ZIP tracking

#### Verification

The human searches a ZIP without seed data and confirms the empty state appears.

---

## Epic 5: Prospect Results and Detail

### Story 5.1: View a Prospect Result Card or Row

As a sales rep, I want each prospect result to show key information, so that I can quickly scan the list.

#### Acceptance Criteria

Each result should show available fields such as:

- firm name
- city/state/ZIP
- website
- phone
- practice areas
- confidence/source label, if available

The result should not show broken or misleading empty fields.

#### Out of Scope

- Editing firm records
- Saved lead status
- Notes
- Follow-up reminders
- Email outreach

#### Verification

The human searches a seeded ZIP and checks that each result is readable and useful.

---

### Story 5.2: Open a Prospect Detail View

As a sales rep, I want to open a prospect detail view, so that I can review more information about a firm.

#### Acceptance Criteria

- The user can select a prospect from the result list.
- The detail view shows the selected firm.
- The detail view includes available contact and firm details.
- The detail view handles missing fields clearly.
- The user can return to search results.

#### Out of Scope

- Editing details
- Saving the lead
- User notes
- Activity timeline
- Enrichment actions

#### Verification

The human opens a prospect and confirms the correct details are displayed.

---

## Epic 6: Saved Leads Later

### Story 6.1: Save a Prospect as a Lead

Status:

```text
Future / Not MVP
```

As a sales rep, I want to save a good prospect as a lead, so that I can follow up later.

#### Acceptance Criteria

Future acceptance criteria should include:

- user can save a prospect
- saved lead belongs to the signed-in user
- saved lead is not visible to other users
- saved lead can be removed
- saved leads can be viewed later

#### Out of Scope for Now

- All saved lead implementation
- User notes
- Statuses
- Follow-up reminders
- CRM export

#### Blocked Until

- Search flow works
- Auth/account plan is implemented
- Database plan clearly separates global and private data

---

## Epic 7: Auth Later

### Story 7.1: Sign In With Email Code

Status:

```text
Future / Not MVP
```

As an approved user, I want to sign in with an email code, so that I can access my private workspace without a password.

#### Acceptance Criteria

Future acceptance criteria should include:

- user enters email
- app checks allowlist
- app sends one-time code through Resend
- user enters code
- app creates HttpOnly session cookie
- user can sign out

#### Out of Scope for Now

- Clerk
- passwords
- OAuth
- teams
- organizations
- billing
- enterprise SSO

#### Blocked Until

- Auth plan is complete
- Database plan is complete
- App shell and seed data flow are stable

---

## Epic 8: Recent ZIPs Later

### Story 8.1: View Recent ZIP Searches

Status:

```text
Future / Not MVP
```

As a signed-in sales rep, I want to see my recent ZIP searches, so that I can return to prior markets.

#### Acceptance Criteria

Future acceptance criteria should include:

- recent ZIPs belong to one user
- recent ZIPs persist across reloads
- recent ZIPs do not appear for other users
- recent ZIPs are updated only after valid searches
- behavior is tested manually and/or automatically

#### Out of Scope for Now

- Recent ZIP implementation
- Anonymous recent history
- Cross-user behavior
- Complex caching

#### Blocked Until

- Auth exists
- User-specific database model exists
- Search flow is stable

---

## Epic 9: External Data Fetching Later

### Story 9.1: Run a Controlled Data-Fetching Pass

Status:

```text
Future / Not MVP
```

As the project owner, I want data fetching to be documented before implementation, so that I know what sources, prompts, fields, and save rules are being used.

#### Acceptance Criteria

Before implementation, `docs/03-data-fetching-plan.md` must define:

1. trigger
2. input
3. source
4. exact prompt, query, or API request
5. pass number
6. output fields
7. confidence and source quality
8. save behavior
9. overwrite behavior
10. cost and rate-limit risk

#### Out of Scope for Now

- Scraping
- Enrichment
- External APIs
- Browser automation
- Prompt-based research passes
- Automated overwrites

#### Blocked Until

- Seeded search flow works
- Database model is stable
- Data-fetching plan is complete

---

## First Implementation Story Recommendation

When product coding begins, the first implementation story should be:

```text
Create a basic app shell with a home/search page placeholder.
```

Do not start with:

- auth
- Prisma
- seed data
- saved leads
- Recent ZIPs
- enrichment
- external fetching

The next implementation story after app shell should be chosen only after the human updates:

```text
task/current-task.md
```

---

## Definition of Ready

A story is ready for coding-agent work only when:

1. It is listed in `task/current-task.md`.
2. It has clear acceptance criteria.
3. It has clear out-of-scope items.
4. It does not require undocumented auth, data-fetching, or database behavior.
5. The human user understands the expected result.

---

## Definition of Done

A story is done only when:

1. The coding agent reports files changed.
2. `task/work.md` is updated.
3. The human has run any suggested commands, if needed.
4. The human has verified visible behavior, if applicable.
5. Risks or skipped items are recorded.
6. The next recommended task is stated but not started.

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/03-data-fetching-plan.md
```

That file should define strict rules before any scraping, enrichment, provider, prompt pass, or external search behavior is added.