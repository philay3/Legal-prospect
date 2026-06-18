# Coding Agent Task — INVESTIGATION ONLY (read-only, no changes, no commands)

> This is the "investigate empty practice-area extraction" step from `docs/03-data-fetching-plan.md` §13 and the roadmap. It must land **before** the `PracticeArea` / `FirmPracticeArea` migration. This session does NOT implement a fix — it only reports code so the planning AI can pinpoint the break.

## Goal
`Firm.practiceAreas` comes back empty (`[]`) on every firm. Find out why. The break is one of:
1. the enrichment prompt/schema never asks for practice areas,
2. they're asked for but dropped during parsing, or
3. they're parsed but never mapped onto the firm object that `saveResearchFirms` writes.

Locate and report the exact code, verbatim, so we can confirm which.

## Current Task Only
Read the research + save pipeline and report the items under "What to report." Do not implement anything.

## Do Not Touch
- Do not edit any file (no code, schema, or doc changes).
- Do not run any terminal command (no `npm` / `npx` / `prisma` / `git` / dev / test / build / `rm` / `mv` / `cp`).
- Do not refactor, rename, reorder, or "clean up" anything.
- Do not add practice-area extraction in this session — that's the next task, after this report.
- Use your read-only file-read / file-search tools only (inspection is fine; shell commands are not).

## What to report (paste each VERBATIM, with file path + line range)
1. **Enrichment LLM call** (gpt-5.4-mini) — in `src/lib/research/runLeadResearch.ts` or the helper it calls: the full system + user prompt, the model + params, the `response_format`/JSON schema (if any), and the code that parses the model response into fields (phone / email / attorneys / …).
2. **Discovery LLM call** (gpt-5.5): its prompt, its schema/`response_format`, and its parse step — in case practice areas are meant to come from discovery, not enrichment.
3. **Engine firm type** — the TypeScript interface/type of the firm object the research engine produces and passes into `saveResearchFirms` (e.g. `ResearchFirm` / `LeadFirm` / whatever it's named). Show whether `practiceAreas` is declared on it, and its type.
4. **Enrichment → firm merge** — the code where the enrichment result is attached back onto the firm object (where `phone` / `email` / `attorneys` get set). Show whether `practiceAreas` is set here or not.
5. **Save mapping** — the part of `src/lib/db/saveResearchFirms.ts` that builds the Prisma `create` / `update` data, specifically the line that sets `practiceAreas` (and how the array is read off the engine firm).
6. **Every reference to practice areas in the pipeline** — using your file-search tool, list every file + line where `practiceArea` or `practiceAreas` appears under `src/lib/research/` and `src/lib/db/`. If it appears in the type and the save mapping but NOT in either LLM prompt or schema, state that explicitly — that alone likely confirms cause (1).
7. **Contact-page angle (secondary)** — `pickContactLink` and where its chosen URL is fetched (`fetchPageContent` or equivalent): just the signatures + the URL-selection logic, so we can judge whether the page being read would even contain practice areas (they usually live on a "Practice Areas" / "Services" page, not the contact page).

## Output format
For each item: a short heading, then a fenced block with the verbatim code, prefixed by path + line range. Example:

```
// src/lib/research/runLeadResearch.ts  L120-168  (enrichment prompt + parse)
<verbatim code here, unedited>
```

If an item lives in a different file than guessed, report it from wherever it actually is. If an item genuinely does not exist (e.g. there is no JSON schema), say "not present" rather than inventing it.

## Final Report Required
1. The seven items above, verbatim, with paths + line numbers.
2. A one-line hypothesis: which of causes (1) / (2) / (3) the evidence points to.
3. Confirmation: no files changed, no commands run.
4. Statement: "Stopping here and waiting for review."

## Commands for Human to Run (optional — only if the agent can't search files)
(Agent: list only, never run.)
- `grep -rni "practicearea" src/lib/research src/lib/db` — every reference, to gather item 6 by hand.