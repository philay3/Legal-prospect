# Product Scope

## Purpose

This document defines what is in scope and out of scope for the controlled rebuild of the legal prospecting app.

The goal is to keep the first build small, understandable, and useful.

This file should prevent feature creep.

---

## Product Summary

The app helps sales reps find small and boutique law firm prospects by ZIP code.

The first useful product flow is:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

The first version should prove the basic prospecting workflow before adding auth, saved leads, recent ZIPs, enrichment, scraping, or external APIs.

---

## Scope Principle

Build in controlled layers.

Do not combine unrelated product areas in one coding-agent session.

Core rule:

```text
One task per coding-agent session.
```

The coding agent should only work from:

```text
task/current-task.md
```

If work is not listed there, it is out of scope for that session.

---

## MVP Scope

The MVP should include only the minimum needed to prove that ZIP-based law firm prospecting is useful.

### MVP Feature 1: App Shell

The app should have a simple structure that can support the core flow.

In scope:

- basic home/search page
- simple layout
- clear navigation only if needed
- placeholder or static states where appropriate
- no complex dashboard yet

Out of scope:

- full dashboard
- multi-page CRM
- settings pages
- billing pages
- team management
- admin area

---

### MVP Feature 2: Manual Seed Data

The app should start with manually created seed data.

In scope:

- a small number of sample law firm prospect records
- one or a few test ZIP codes
- realistic enough data to test search and display
- source/confidence placeholders if useful

Out of scope:

- scraping
- live enrichment
- external search APIs
- browser automation
- AI research passes
- automated overwrite behavior

Reason:

Seed data lets the product flow and data model be tested before external data-fetching complexity is added.

---

### MVP Feature 3: ZIP Search Against Seed Data

The user should be able to search by ZIP code and see matching law firm prospects.

In scope:

- ZIP input
- basic validation for empty/invalid input
- results for matching seeded ZIPs
- useful empty state when no results exist
- clear loading state if the UI needs it

Out of scope:

- radius search
- nationwide live search
- fuzzy geography matching
- city/state search
- map UI
- saved recent ZIPs
- user-specific search history

---

### MVP Feature 4: Prospect Results List

Search results should show enough information for the user to decide whether to inspect a firm.

In scope:

- firm name
- city/state/ZIP
- phone if available
- website if available
- practice areas if available
- basic source/confidence indicator if available

Out of scope:

- AI scoring
- complex ranking
- CRM pipeline status
- bulk actions
- export
- email outreach
- enrichment buttons

---

### MVP Feature 5: Prospect Detail View

The user should be able to view more details about a selected prospect.

In scope:

- firm name
- website
- phone
- email if available
- address
- practice areas
- attorney names if available
- notes or source information if available

Out of scope:

- editable firm records
- user notes
- saved lead status
- follow-up reminders
- activity timeline
- CRM-style history

---

## Post-MVP Scope

These features are likely useful, but should come after the first search flow works.

### Post-MVP Feature: Saved Leads

The user can save good prospects for later.

In scope later:

- save a firm as a lead
- view saved leads
- remove a saved lead
- keep saved leads private to the user

Do not add until:

- search flow works
- prospect records are stable
- auth/account direction is clear

---

### Post-MVP Feature: Custom Email-Code Auth

Preferred auth direction:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

In scope later:

- email allowlist
- one-time login code
- HttpOnly session cookie
- private user workspace

Out of scope unless the user explicitly changes direction:

- Clerk
- passwords
- OAuth
- teams
- organizations
- billing
- enterprise SSO

---

### Post-MVP Feature: Recent ZIP Searches

The app may eventually show recent ZIP searches per user.

In scope later:

- recent ZIPs belong to a specific user
- recent ZIPs should not leak across users
- reload behavior should be clear and tested

Out of scope for early MVP:

- recent ZIP UI
- cross-device recent history
- anonymous recent history
- complex caching behavior

Reason:

Recent ZIP behavior caused confusion in the old app and should wait until user-specific behavior is stable.

---

### Post-MVP Feature: External Data Fetching

The app may eventually fetch or enrich law firm data from external sources.

Before any external fetching is built, it must be documented in:

```text
docs/03-data-fetching-plan.md
```

Each fetching pass must define:

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

Out of scope until documented:

- scraping
- enrichment
- browser automation
- external APIs
- prompt-based research passes
- automated overwrites

---

## Explicitly Out of Scope for the First Build Phase

The first build phase should not include:

- Clerk
- OAuth
- passwords
- teams
- organizations
- billing
- enterprise auth
- dashboard complexity
- recent ZIP behavior
- saved leads
- user notes
- lead statuses
- follow-up tasks
- reminders
- scraping
- enrichment
- browser automation
- external APIs
- AI-generated outreach
- email campaigns
- CRM import/export
- CSV export
- map UI
- radius search
- admin tools
- analytics dashboards

These are not rejected forever.

They are intentionally delayed.

---

## First Build Phase

The first build phase should answer:

```text
Can the user search a ZIP code and review useful law firm prospect results from controlled seed data?
```

### Included

- app shell
- seed data
- ZIP search
- results list
- prospect detail view
- basic empty/error states
- human-visible testing instructions

### Excluded

- auth
- saved leads
- recent ZIPs
- enrichment
- external fetching
- dashboard complexity
- database destruction or migration shortcuts

---

## Suggested Build Phases

### Phase 0: Control and Planning

Status: current phase.

Includes:

- `AGENTS.md`
- `task/current-task.md`
- `task/work.md`
- `task/decisions.md`
- `docs/START-HERE.md`
- product brief
- product scope
- user stories
- data-fetching plan
- auth plan
- database plan
- API contracts
- testing guide
- coding-agent rules
- roadmap

Goal:

```text
Make the project safe to work on before building features.
```

---

### Phase 1: Basic App Shell

Includes:

- app structure
- basic pages
- simple layout
- home/search entry point

Does not include:

- auth
- database
- external data
- saved leads

Goal:

```text
Create a clean place for the product flow to live.
```

---

### Phase 2: Data Foundation and Seed Data

Includes:

- planned database setup
- safe Prisma setup if chosen
- seed prospect records
- clear migration process
- no destructive commands

Does not include:

- enrichment
- live fetching
- user-specific records unless explicitly scoped

Goal:

```text
Create controlled local data that supports ZIP search.
```

---

### Phase 3: ZIP Search Flow

Includes:

- ZIP search input
- matching seeded prospects
- results list
- empty state
- prospect detail view

Does not include:

- recent ZIPs
- saved leads
- auth
- external fetching

Goal:

```text
Prove the core prospecting workflow.
```

---

### Phase 4: Auth and Private Workspace

Includes later:

- custom email-code auth
- email allowlist
- HttpOnly session cookie
- private user identity

Does not include unless explicitly needed:

- Clerk
- OAuth
- passwords
- teams
- organizations

Goal:

```text
Allow user-specific workflow data safely.
```

---

### Phase 5: Saved Leads

Includes later:

- save a prospect
- view saved leads
- remove saved lead
- saved leads are private to the user

Goal:

```text
Let users build a private lead list from shared prospect research.
```

---

### Phase 6: Recent ZIPs

Includes later:

- recent ZIP searches per user
- reload-safe behavior
- clear manual and automated tests

Goal:

```text
Improve repeat usage without recreating old Recent ZIP confusion.
```

---

### Phase 7: External Data Fetching

Includes later only after documentation:

- selected source/provider
- controlled fetch pass
- source metadata
- confidence metadata
- save and overwrite rules
- cost/rate-limit controls

Goal:

```text
Improve prospect coverage without losing control of data behavior.
```

---

## Scope Boundaries by Data Type

### Firm Data

In scope early:

- seeded firm records
- firm name
- website
- phone
- address
- ZIP code
- practice areas

Out of scope early:

- automatic firm creation from external sources
- duplicate resolution
- firm merge tools
- user editing
- firm verification workflows

---

### Attorney Data

In scope early:

- optional seeded attorney names

Out of scope early:

- attorney profile pages
- attorney enrichment
- bar status lookup
- attorney-level CRM workflow

---

### User Workflow Data

In scope later:

- saved leads
- notes
- statuses
- recent ZIPs

Out of scope early:

- all private workflow features

Reason:

User workflow data depends on auth/account decisions.

---

### Source and Confidence Data

In scope early if simple:

- source label
- source URL
- confidence level

Out of scope early:

- complex source ranking
- automated trust scoring
- source conflict resolution
- overwrite rules before data-fetching plan exists

---

## UX Scope

The first UI should be plain and useful.

In scope:

- clear search input
- readable results
- useful empty states
- basic mobile-friendly layout
- simple detail view

Out of scope:

- polished marketing site
- complex animations
- map UI
- advanced filters
- multi-step onboarding
- enterprise dashboard

The app should be usable before it is fancy.

---

## Testing Scope

For each coding-agent task, the agent should explain:

- what to check
- which command the human may run
- why the command matters
- what passing means
- what failing might mean

In scope early:

- TypeScript checks when relevant
- unit tests when logic exists
- manual browser verification for visible flows

Out of scope:

- coding agent running tests by default
- large test suites before behavior exists
- pretending TypeScript means the app works

---

## Success Definition for MVP

The MVP is successful when:

1. A user can search a seeded ZIP code.
2. The app shows matching law firm prospects.
3. The user can inspect useful prospect details.
4. The project has safe docs and task controls.
5. The human user understands each change.
6. No uncontrolled auth, data-fetching, or database work has been added.

---

## Scope Change Rule

If a new feature is requested, ask:

1. Is it needed for the first ZIP search flow?
2. Does it require auth?
3. Does it require database changes?
4. Does it require external data fetching?
5. Does it mix multiple concerns?
6. Is it documented in the correct planning file?
7. Is it listed in `task/current-task.md`?

If the answer shows risk or scope creep, delay it.

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/02-user-stories.md
```

That file should turn this scope into concrete user stories and acceptance criteria.