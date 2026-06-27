# Product Brief

## Product Name

Working name:

```text
Legal Prospecting App
```

This name is temporary.

The product name can change later.

---

## Product Summary

This app helps sales reps find small and boutique law firm prospects by ZIP code.

A user enters a ZIP code and sees law firm prospects in or near that area.

The app should help the user quickly answer:

- Which law firms are in this ZIP code?
- Which firms look like good prospects?
- What contact and firm details are available?
- Which leads should I save for follow-up?

The long-term vision is a legal prospecting database organized around ZIP code research.

The first version should stay focused on a small, understandable prospecting workflow.

---

## Target User

Primary user:

```text
A sales rep who sells legal software or legal-adjacent services to small and boutique law firms.
```

Examples of what this user might sell:

- case management software
- intake software
- answering services
- marketing services
- website services
- payment tools
- client communication tools
- document automation
- legal operations services

The user is not a lawyer searching for legal help.

The user is a seller looking for law firm prospects.

---

## User Problem

Sales reps need a faster way to find law firms in a specific local market.

Right now, a rep may have to search manually across:

- Google
- maps results
- firm websites
- directory listings
- bar association pages
- LinkedIn
- spreadsheets
- CRM records

This process is slow and inconsistent.

The rep may find a firm name but still need to figure out:

- whether the firm has a website
- what practice areas the firm handles
- whether there are attorneys listed
- whether there is a phone number
- whether there is an email address
- whether the firm looks active
- whether the firm is worth saving as a lead

The app should reduce manual research and make prospect review easier.

---

## Current Rebuild Context

This is a controlled rebuild.

The previous version of the app had useful progress, especially around ZIP search and enrichment.

However, the project became hard to control because several areas got mixed together:

- data fetching
- enrichment
- Clerk auth
- user-specific saved leads
- Recent ZIP behavior
- Prisma migration issues
- tests and commands being run without enough human visibility

This rebuild should keep the product lessons and restart the repo/process with tighter rules.

Core rebuild principle:

```text
Restart the repo.
Do not restart the product thinking.
Keep the lessons.
Rebuild with tighter rules.
```

---

## Product Goals

### Goal 1: Help the user search by ZIP code

The user should be able to enter a ZIP code and get law firm prospect results.

Early versions may use seed data.

External data fetching should come later.

### Goal 2: Show useful prospect details

The user should see enough detail to decide whether a firm is worth researching further or saving.

Useful details may include:

- firm name
- website
- phone
- email
- address
- attorneys
- practice areas
- source information
- confidence information

The first version does not need every field.

### Goal 3: Preserve the global/private data split

Shared research data should be reusable.

Private workflow data should stay user-specific.

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

### Goal 4: Keep the rebuild understandable

The user should understand what is being built, why it matters, and how to verify it.

Coding-agent work should happen in small, clear increments.

---

## Non-Goals for the First Build Phase

The first build phase should not include:

- Clerk
- OAuth
- passwords
- teams
- organizations
- billing
- enterprise auth
- scraping
- enrichment
- browser automation
- external API integrations
- full CRM functionality
- automated outbound sales
- email campaigns
- complex dashboards
- AI-generated outreach messages
- multi-tenant company accounts

These may be considered later only if the product direction requires them.

---

## MVP Direction

The MVP should prove the basic prospecting workflow before adding complex infrastructure.

A practical MVP sequence:

1. Create the app shell.
2. Create a clean database foundation.
3. Add manual seed data for law firm prospects.
4. Let the user search by ZIP code.
5. Show prospect results.
6. Show prospect detail.
7. Add saved leads after the search flow works.
8. Add auth after the core data model is clearer.
9. Add recent ZIPs after user-specific behavior is stable.
10. Add external data fetching last.

The MVP should not start with live enrichment.

---

## First Useful Product Flow

The first useful product flow should be:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

This flow proves:

- the app structure works
- ZIP search logic works
- prospect display works
- the data model is useful enough to continue

It does not require:

- auth
- saved leads
- recent ZIPs
- enrichment
- scraping
- external APIs

---

## Suggested Initial Prospect Fields

Early seeded prospect records may include:

- `firmName`
- `website`
- `phone`
- `email`
- `streetAddress`
- `city`
- `state`
- `zipCode`
- `practiceAreas`
- `attorneyNames`
- `sourceLabel`
- `sourceUrl`
- `confidenceLevel`
- `notes`

Not all fields are required for the first implementation.

The database plan should decide the actual schema later.

---

## Global Data vs Private Data

### Global / Shared Data

Global data is research data that can be reused across users.

Examples:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

This data should not belong to one user.

### Private / User-Specific Data

Private data is workflow data created by a user.

Examples:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

This data must belong to one user.

### Product Rule

```text
Global research data can be shared.
User workflow data must be private.
```

This rule should be repeated in the database plan, API contracts, and auth/account plan.

---

## Success Criteria for Early Build

The early build is successful when:

1. The project has clear planning and control docs.
2. The coding agent only works from `task/current-task.md`.
3. The human user controls commands.
4. A basic app shell exists.
5. Seeded prospect data can be displayed.
6. ZIP search works against seeded data.
7. The user can understand what changed after each task.
8. No auth, enrichment, or database complexity is added prematurely.

---

## Risks

### Risk: Rebuilding too much too fast

The project may become confusing again if several features are built at once.

Mitigation:

```text
One task per coding-agent session.
```

### Risk: Starting auth too early

Auth can create account, session, privacy, and routing complexity.

Mitigation:

```text
Delay auth until the app shell, database foundation, and seed data direction are stable.
```

### Risk: Data fetching becomes unclear again

External data fetching can quickly become confusing if prompts, providers, source rules, and overwrite behavior are not documented.

Mitigation:

```text
No external fetching until docs/03-data-fetching-plan.md is complete.
```

### Risk: Migration drift returns

Database work can become unsafe if schema changes are rushed or commands are run casually.

Mitigation:

```text
Plan Prisma/database work before implementation.
Never use destructive database commands to fix drift.
```

### Risk: User-specific data accidentally becomes global

Saved leads, notes, statuses, and recent ZIPs must not leak across users.

Mitigation:

```text
Keep global research data separate from private user workflow data.
```

---

## Open Questions

These questions do not need to be answered before the app shell, but they should be tracked.

1. What is the exact first seeded ZIP code or market?
2. How many seed firms should be included for the first test?
3. What prospect fields are required for the first useful search result?
4. What fields belong on the search results page vs. detail page?
5. When should saved leads be added?
6. When should auth be added?
7. What data source should be tried first when external fetching begins?
8. What confidence/source metadata should be saved?
9. Should ZIP search eventually include radius search?
10. Should the product focus on one state first or support any ZIP code?

---

## Recommended Next Docs

After this product brief, fill in:

```text
docs/01-product-scope.md
docs/02-user-stories.md
docs/03-data-fetching-plan.md
docs/04-auth-account-plan.md
docs/05-database-plan.md
docs/06-api-contracts.md
docs/07-testing-guide.md
docs/08-coding-agent-rules.md
docs/09-roadmap.md
```

The next recommended file is:

```text
docs/01-product-scope.md
```