# Data Fetching Plan

## Purpose

This document controls all external data fetching, enrichment, scraping, search passes, browser automation, and prompt-based research behavior for the legal prospecting app.

No data-fetching logic should be added until it is documented here.

The goal is to prevent unclear enrichment behavior, uncontrolled overwrites, hidden prompts, source confusion, and cost/rate-limit surprises.

---

## Core Rule

Do not add any of the following until documented in this file:

- scraping
- enrichment
- external search APIs
- external data providers
- browser automation
- prompt-based research passes
- AI extraction passes
- background fetching jobs
- automated refresh jobs
- overwrite behavior
- source ranking
- confidence scoring

Initial rebuild preference:

```text
Start with manual seed data before any external fetching.
```

---

## Current Data Fetching Status

Current status:

```text
External data fetching is not approved yet.
```

The project should begin with manual seed data.

Allowed now:

- manually created sample law firm records
- clearly marked test/seed data
- ZIP search against controlled seed data
- static source/confidence placeholders if useful

Not allowed yet:

- live search
- scraping
- enrichment
- automated firm discovery
- automated website discovery
- automated attorney discovery
- automated email/phone discovery
- browser automation
- AI research passes
- paid data providers
- background refresh jobs

---

## Why This Plan Exists

The previous version of the app made meaningful progress with ZIP search and enrichment, but the data-fetching process became hard to understand.

Known problems to avoid:

- unclear prompt passes
- unclear source priority
- unclear save behavior
- unclear overwrite behavior
- uncertainty about which data was fresh vs. stale
- difficulty knowing why a field changed
- difficulty knowing whether a missing field was searched for
- mixing data fetching with unrelated feature work
- debugging loops where enrichment and UI behavior got mixed together

This rebuild should make every data-fetching pass explicit before implementation.

---

## Manual Seed Data First

The first useful product flow should use manual seed data:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

This proves:

- app structure
- ZIP search flow
- prospect display
- basic data shape
- empty states
- detail views

It does not require external fetching.

### Seed Data Rules

Manual seed data should be:

- small
- understandable
- easy to inspect
- safe to change
- clearly marked as test or seed data

Seed data should not pretend to be live, complete, or verified unless it truly is.

### Suggested Seed Fields

Seed records may include:

- firm name
- website
- phone
- email
- street address
- city
- state
- ZIP code
- practice areas
- attorney names
- source label
- source URL
- confidence level
- notes

The database plan decides the final schema.

---

## Required Documentation for Every Future Fetching Pass

Every future data-fetching pass must be documented before implementation.

Each pass must include:

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

If any of these are unknown, the pass is not ready.

---

## Fetching Pass Template

Copy this template before adding a future data-fetching pass.

```md
## Fetching Pass X: Pass Name

### Status

Draft / Approved / Implemented / Paused / Removed

### Purpose

Explain what this pass is trying to discover or improve.

### Trigger

What causes this pass to run?

Examples:

- human clicks a button
- admin runs a script
- user searches a ZIP
- scheduled job runs
- coding agent runs a one-time import

### Input

What information does this pass receive?

Examples:

- ZIP code
- firm name
- firm website
- city/state
- existing firm ID
- source URL

### Source

Where does the data come from?

Examples:

- manually entered data
- Google search
- firm website
- state bar website
- directory
- paid API
- public API
- AI model response

### Exact Prompt / Query / API Request

Write the exact query, prompt, URL pattern, or API request.

Do not summarize it vaguely.

### Output Fields

List the fields this pass may produce.

Examples:

- firm name
- website
- phone
- email
- address
- attorneys
- practice areas
- source URL
- confidence level

### Confidence and Source Quality

Explain how trustworthy the source is.

Include:

- high/medium/low confidence
- source type
- whether it is primary or secondary
- known weaknesses

### Save Behavior

Explain what gets saved.

Examples:

- create new firm record
- update missing website only
- attach source record
- save candidate result for review
- do not save automatically

### Overwrite Behavior

Explain whether existing data can be overwritten.

Default rule:

```text
Do not overwrite existing non-empty fields automatically.
```

Allowed overwrite behavior must be specific.

### Cost and Rate-Limit Risk

Explain:

- expected cost
- rate limit risk
- provider limits
- retry behavior
- failure behavior

### Human Review Needed?

State whether the result must be reviewed before saving.

### Failure Behavior

Explain what happens if the pass fails.

Examples:

- show error
- skip record
- retry later
- save partial result
- save nothing

### Privacy / Compliance Notes

Mention any privacy, terms-of-service, or compliance concern.

### Approved By

Human owner approval:

```text
Not approved yet.
```
```

---

## Source Types

### Manual Source

Manual source means a human added the data directly.

Use for:

- seed data
- test data
- known sample firms
- manually verified corrections

Pros:

- easiest to understand
- low technical risk
- no provider cost
- no scraping risk

Cons:

- not scalable
- may be incomplete
- may become stale

Current status:

```text
Approved for initial build.
```

---

### Firm Website Source

Firm website source means data comes directly from a law firm's own website.

Potential fields:

- firm name
- phone
- email
- address
- attorneys
- practice areas
- contact page
- about page

Pros:

- often a primary source
- useful for contact details
- useful for attorney and practice area info

Cons:

- websites vary widely
- scraping may violate terms or be fragile
- emails may be hidden or protected
- data may be outdated

Current status:

```text
Not approved for implementation yet.
```

Must be documented as a specific fetching pass before use.

---

### Search Engine Source

Search engine source means using search results to discover firms, websites, or contact info.

Potential uses:

- find law firms by ZIP
- discover firm website
- find contact pages
- find attorney pages

Pros:

- useful discovery layer
- broad coverage

Cons:

- result quality varies
- search APIs may cost money
- scraping search pages may violate terms
- snippets may be wrong or stale
- duplicate detection is difficult

Current status:

```text
Not approved for implementation yet.
```

Must be documented as a specific fetching pass before use.

---

### Directory Source

Directory source means public or commercial legal directories.

Potential examples:

- legal directories
- local business directories
- bar directory pages
- review sites

Pros:

- can contain structured firm info
- may help discover firms

Cons:

- may be incomplete
- may contain ads or paid placements
- terms may restrict automated use
- data may be stale
- duplicates are likely

Current status:

```text
Not approved for implementation yet.
```

Must be documented as a specific fetching pass before use.

---

### Bar Association / Government Source

Bar or government source means attorney or firm data from official/public institutional sources.

Potential uses:

- attorney verification
- bar status
- office location
- practice status

Pros:

- often authoritative
- useful for verification

Cons:

- formats vary by state
- may have use restrictions
- not always firm-focused
- may not include prospecting-friendly contact info

Current status:

```text
Not approved for implementation yet.
```

Must be documented as a specific fetching pass before use.

---

### Paid Data Provider Source

Paid provider source means a commercial API or database.

Pros:

- structured data
- predictable API behavior
- potentially better coverage

Cons:

- cost
- rate limits
- licensing restrictions
- vendor lock-in
- may still be incomplete

Current status:

```text
Not approved for implementation yet.
```

No provider should be added until compared and approved.

---

### AI Model Source

AI model source means using an AI model to extract, classify, summarize, or infer data.

Potential uses:

- classify practice areas
- extract attorneys from page text
- summarize website quality
- normalize addresses
- infer confidence

Pros:

- flexible
- useful for messy text
- can improve usability

Cons:

- hallucination risk
- cost
- unclear confidence if not controlled
- requires source text and audit trail
- should not be treated as a primary source by itself

Current status:

```text
Not approved for implementation yet.
```

AI output must cite or attach source context when saved.

---

## Data Save Rules

### Default Save Rule

Default behavior:

```text
Do not save externally fetched data automatically unless the pass explicitly allows it.
```

The safest early pattern is:

```text
Fetch → show candidate → human review → save approved fields.
```

### Required Metadata for Saved External Data

When external data is eventually saved, each field or source record should be traceable.

Potential metadata:

- source label
- source URL
- fetched at timestamp
- pass name
- pass version
- confidence level
- raw value
- normalized value
- review status
- reviewed by
- reviewed at

The database plan will decide exact implementation.

---

## Overwrite Rules

### Default Overwrite Rule

```text
Do not overwrite existing non-empty fields automatically.
```

### Safer Update Pattern

Use this order:

1. Fill empty fields.
2. Save conflicting values as candidates.
3. Preserve existing values.
4. Show source/confidence.
5. Let human-approved logic decide later.

### Never Silently Overwrite

Do not silently overwrite:

- firm name
- website
- phone
- email
- address
- attorney list
- practice areas
- user notes
- saved lead status
- follow-up tasks
- recent ZIP history

Private user workflow data should never be overwritten by global fetching.

---

## Global Data vs Private Data

### Global / Shared Research Data

External fetching may eventually affect global data such as:

- firm records
- attorney records
- practice areas
- ZIP research
- source records
- cached ZIP results

### Private / User Workflow Data

External fetching must not overwrite private user data such as:

- saved leads
- notes
- statuses
- tasks
- follow-up reminders
- recent ZIP searches

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

---

## Confidence Levels

Use simple confidence levels at first.

```text
High
Medium
Low
Unknown
```

### High Confidence

Use when:

- source is primary
- value is directly visible
- field is recent enough
- value does not conflict with existing data

Example:

```text
Phone number listed on the firm's official contact page.
```

### Medium Confidence

Use when:

- source is secondary but credible
- value appears consistent
- some freshness uncertainty exists

Example:

```text
Address from a reputable directory that matches city/state.
```

### Low Confidence

Use when:

- source is weak
- value is inferred
- source is stale
- conflicting values exist

Example:

```text
Practice area inferred from search snippet only.
```

### Unknown Confidence

Use when:

- confidence has not been assessed
- seed data is placeholder only
- source is missing

---

## Candidate Data Pattern

For future enrichment, prefer a candidate pattern.

Instead of immediately updating firm records, external passes may create candidate data.

Example:

```text
FirmCandidateWebsite
FirmCandidatePhone
FirmCandidateEmail
FirmCandidateAddress
FirmCandidatePracticeArea
```

A candidate should include:

- proposed value
- source
- confidence
- pass name
- fetched at
- status

Possible statuses:

```text
Pending
Approved
Rejected
Superseded
```

This may be overkill for the first MVP, but it is safer than uncontrolled overwrites.

---

## Cost and Rate Limit Rules

Before adding a provider or API, document:

- pricing model
- free tier
- expected calls per ZIP search
- expected calls per firm
- rate limits
- daily/monthly limit
- retry behavior
- timeout behavior
- failure behavior
- whether results can be cached
- whether terms allow the intended use

Do not add a provider just because it is convenient.

---

## Trigger Rules

External data fetching should not run automatically from normal user actions unless explicitly approved.

Safer early triggers:

- admin-only manual action
- local script run by human
- one-time controlled import
- explicit "research this ZIP" button later

Riskier triggers:

- every page load
- every ZIP search
- background cron without review
- automatic refresh of all records
- automatic enrichment of saved leads

Default early rule:

```text
No automatic external fetching from user ZIP search.
```

---

## Prompt Rules

If AI prompts are used later, the exact prompt must be documented here.

Prompt documentation must include:

- model/provider
- system prompt if any
- user prompt template
- input variables
- expected JSON/output format
- validation rules
- refusal/failure handling
- hallucination controls
- source citation requirements
- save behavior

Do not use vague prompt descriptions like:

```text
Ask AI to enrich the firm.
```

Use exact prompts when implementation is approved.

---

## Example Future Passes

These are examples only.

They are not approved yet.

### Example Pass 1: ZIP Firm Discovery

Possible purpose:

```text
Find candidate law firms for a ZIP code.
```

Possible trigger:

```text
Admin runs controlled research for one ZIP.
```

Possible output:

- firm name
- website candidate
- address candidate
- source URL
- confidence

Status:

```text
Not approved.
```

---

### Example Pass 2: Firm Website Contact Extraction

Possible purpose:

```text
Extract phone, email, address, attorneys, and practice areas from a known firm website.
```

Possible trigger:

```text
Admin enriches one selected firm.
```

Possible output:

- phone
- email
- address
- attorney names
- practice areas
- source page URLs
- confidence

Status:

```text
Not approved.
```

---

### Example Pass 3: Website Health Review

Possible purpose:

```text
Estimate whether a firm's website looks outdated, broken, or incomplete.
```

Possible trigger:

```text
Admin runs review on one known firm website.
```

Possible output:

- website exists
- loads successfully
- mobile-friendly signal
- SSL signal
- last visible update clue
- contact form presence
- confidence

Status:

```text
Not approved.
```

---

## First Approved Data Approach

For now, the only approved data approach is:

```text
Manual seed data.
```

### Approved Pass 0: Manual Seed Data

#### Status

Approved for initial build.

#### Purpose

Provide controlled sample law firm prospect data so the app can prove ZIP search and prospect display without external fetching.

#### Trigger

Human creates or edits seed data manually.

#### Input

Human-provided sample firm information.

#### Source

Manual/test data.

If real public information is used, include source labels where practical.

#### Exact Prompt / Query / API Request

None.

No external prompt, query, or API request is used.

#### Output Fields

Possible fields:

- firm name
- website
- phone
- email
- street address
- city
- state
- ZIP code
- practice areas
- attorney names
- source label
- source URL
- confidence level
- notes

#### Confidence and Source Quality

Default confidence may be:

```text
Unknown
```

or

```text
Manual seed
```

Do not imply the data is complete or verified unless it has been reviewed.

#### Save Behavior

Seed data may be saved in a fixture, seed script, local database, or simple data file depending on the implementation phase.

#### Overwrite Behavior

Manual seed data should not overwrite private user workflow data.

#### Cost and Rate-Limit Risk

No provider cost.

No rate limit risk.

#### Human Review Needed?

Yes.

The human should review the seed data shape and sample records.

#### Failure Behavior

If seed data is missing or invalid, the app should show a clear empty state or development error depending on the phase.

#### Privacy / Compliance Notes

Do not include private, sensitive, or non-public personal data in seed data.

---

## Approval Rule

A future data-fetching pass is approved only when:

1. It is documented in this file.
2. The human user reviews it.
3. The human user explicitly says it is approved.
4. It is added to `task/current-task.md` for implementation.

Until then, it is out of scope.

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/04-auth-account-plan.md
```

That file should define the delayed custom email-code auth direction and what auth should not include.