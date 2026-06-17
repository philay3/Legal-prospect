# Current Task — Phase 7.1 — Port Live Research Engine (Library + TDD), No Wiring

## Status

Current active task.

## Goal

Bring the proven live-research engine from the old app into this repo as a self-contained library under `src/lib/research/`, and cover its pure (non-network, non-AI) functions with Vitest unit tests.

No API route changes, no database changes, no UI changes, no live OpenAI/DuckDuckGo calls. This task makes the engine present and tested. Wiring it into search is the next task (7.2).

## Context

The deployed app currently does DB-only ZIP search (queries the `Firm` table). The product's real value is live discovery + enrichment (DuckDuckGo grounding + OpenAI). We are porting that engine in controlled slices. This first slice lands the code and its tests with zero risk to the live search path, and gives a clean TDD story: pure functions with clear inputs and outputs.

## Prerequisite (human, before the agent starts)

Copy these three files from the old app into this repo at `src/lib/research/` (the agent cannot access the old repo). Their sibling imports are already relative, so they drop in as-is:

```text
runLeadResearch.ts
buildResearchPrompt.ts
parseResearchResponse.ts
```

Do NOT copy `saveResearchResults.ts` — it targets the old normalized schema and will be rewritten for this repo's flat `Firm` model in task 7.2.

## Scope

- Add `openai` AND `zod` to dependencies (human runs the install). `zod` is required by `parseResearchResponse.ts` — do not skip it.
- Place the three research files under `src/lib/research/`.
- Remove the unused imports `buildValidationPrompt` and `parseValidationResponse` from `runLeadResearch.ts` — they are imported but never called (dead code). Leave those functions defined in their own files; only remove the unused imports so build/lint stays clean.
- Export the pure helpers so they're unit-testable: `cleanDdgUrl`, `isDirectoryOrSocial`, `getLikelyOfficialWebsite`, and the placeholder check `isUseful` (extract `isUseful` to a named export — e.g. `src/lib/research/sanitize.ts` — since it's used in more than one place).
- Fix imports to match this repo: use RELATIVE imports inside `src/lib/research/` and in the test files. This repo's Vitest has no path-alias config, and `@/` aliases fail at test runtime (known issue — see `src/utils/prospectMatcher.test.ts`).
- Add Vitest tests for the pure helpers AND for the parser functions `parseResearchResponse` / `parseEnrichmentResponse` (these are deterministic string-in/object-out functions and need no network).
- Add `OPENAI_API_KEY` and the model env vars the engine reads (`DEFAULT_RESEARCH_MODEL`, `QUICK_RESEARCH_MODEL`) to `.env.example` as placeholders only.

## Out of Scope

- No changes to `src/app/api/prospects/search/route.ts` or any route.
- No database reads/writes, no Prisma schema changes, no migrations, no seed changes.
- No UI changes (`page.tsx`, `ProspectCard.tsx` untouched).
- No live OpenAI or DuckDuckGo calls — tests cover pure functions only; the network/AI functions (`getSearchContext`, `runLeadResearch`) are not invoked.
- No auth, saved leads, or dashboard work.
- Do NOT edit the nested duplicate folder of the same name. Work only in the canonical project root the human specifies. Do not rename folders.

## Files to Inspect

```text
src/lib/prisma.ts                          (import conventions, server-only)
src/app/api/prospects/search/route.ts      (do not edit — context for task 7.2)
src/app/api/prospects/search/route.test.ts (test + import style to match)
src/utils/prospectMatcher.test.ts          (existing test style; relative imports)
src/types/prospect.ts                      (target data contract for later)
package.json                               (scripts; confirm openai and zod are absent)
```

## Files Expected to Change / Create

```text
src/lib/research/runLeadResearch.ts        (ported; drop unused validation imports)
src/lib/research/buildResearchPrompt.ts    (ported as-is)
src/lib/research/parseResearchResponse.ts  (ported as-is)
src/lib/research/sanitize.ts               (extracted isUseful) — or export in place
src/lib/research/*.test.ts                 (new tests for helpers + parsers)
package.json                               (openai + zod dependencies)
.env.example                               (placeholders only)
```

## Implementation Notes

- Keep the engine server-only in usage. It will be imported by a server route later; do not import it from any client component now. It assumes a Node 18+ runtime (global `fetch`, `AbortController`, `URL`).
- Do NOT change the engine's behavior beyond what's needed to compile, remove dead imports, and export the pure helpers. We want the proven logic intact. (Quick-mode tuning for speed happens in task 7.2, not here.)
- Pure helpers to export and test:
  - `cleanDdgUrl(url)` — resolves DuckDuckGo redirect URLs (decodes the `uddg` param) and handles protocol-relative `//` URLs.
  - `isDirectoryOrSocial(url)` — true for justia/avvo/findlaw/facebook/linkedin/etc.; false for an apparent official firm site; true on parse failure.
  - `getLikelyOfficialWebsite(results)` — returns the origin of the first non-directory/social result, or null.
  - `isUseful(value)` — false for null/undefined/empty and placeholder strings ("n/a", "none", "unknown", "not available", "placeholder", etc.); true otherwise.
- Suggested test cases (these double as the "talk about your tests" material):
  - `cleanDdgUrl`: `https://duckduckgo.com/l/?uddg=https%3A%2F%2Ffirm.com` -> `https://firm.com`; a `//html.duckduckgo.com/...` input gets an `https:` prefix; a plain `https://firm.com` passes through unchanged.
  - `isDirectoryOrSocial`: `https://www.avvo.com/x` -> true; `https://www.smithlaw.com` -> false; `"not a url"` -> true.
  - `getLikelyOfficialWebsite`: `[avvo, smithlaw]` -> `https://www.smithlaw.com` origin; all-directory list -> null; empty list -> null.
  - `isUseful`: `"  "` -> false; `"N/A"` -> false; `"unknown"` -> false; `"Smith Law"` -> true.
  - `parseResearchResponse`: valid JSON parses; JSON wrapped in ```json ... ``` fences still parses; a firm field of the string `"null"` becomes real `null`; a firm with an empty `firm_name` throws (Zod rejection).
  - `parseEnrichmentResponse`: placeholder values like `"example@example.com"` / `"unknown"` become `null`; valid enrichment objects parse.
- Do NOT unit-test the network/AI functions (`getSearchContext`, `runLeadResearch`) in this task — those need live keys and belong to a later integration step.

## Acceptance Criteria

- The three research files exist under `src/lib/research/` and the project type-checks and builds (human verifies).
- The unused validation imports are removed from `runLeadResearch.ts`.
- The pure helpers and the parser functions are exported and have Vitest tests; `npm run test` passes (human runs).
- `openai` and `zod` are both in `package.json` dependencies.
- `.env.example` has `OPENAI_API_KEY`, `DEFAULT_RESEARCH_MODEL`, `QUICK_RESEARCH_MODEL` as placeholders, no real secrets.
- No changes to the search route, DB, schema, or UI. The live site behaves exactly as before.

## Commands for Human to Run

```bash
npm install openai zod
npm run test
npm run build
git status
git diff
```

The agent suggests; the human runs.

## Agent Command Rule

The agent must not run terminal commands. It may list them only under "Commands for Human to Run." If any command is run anyway, the final report must say so honestly.

## Stop Conditions

Stop and ask the human if:

- Porting seems to require substantial changes to the engine's logic.
- The engine imports something not available in this repo.
- It can't compile without touching the route, DB, or UI.
- There's any ambiguity about which folder is the canonical project root.

## Final Report Format

```markdown
# Phase 7.1 Completion Report

## What changed

## What it means for the product

## What did not change

## Files changed

## Tests run

## Commands for human to run

## Risks or follow-ups

## Next safe task
```