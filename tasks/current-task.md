# Task: Populate `practiceAreas` end-to-end (fix empty practice-area extraction)

> **No migration.** `Firm.practiceAreas String[]` already exists — this task only makes the pipeline produce and store values. Mirror exactly how `attorneys` already flows (discovery schema → enrichment schema → merge → save); practice areas are missing from every one of those hops.

## Root cause (confirmed by investigation)
`practiceAreas` is `[]` on every firm because the field is never requested or carried anywhere:
- Discovery (gpt-5.5) `ResearchFirmSchema` and enrichment (gpt-5.4-mini) `EnrichmentResultSchema` both omit it.
- The engine firm type and `ResearchFirmInput` never declare it.
- The merge in `runLeadResearch.ts` never sets it.
- `saveResearchFirms.ts` hardcodes `practiceAreas: []` on create (L121) and never sets it on update.

So this is purely additive: add the field at each hop. (Secondary, **out of scope** here: `pickContactLink` never targets a Practice-Areas/Services page — a quality follow-up, not a blocker, since both LLM calls already receive the Tavily search context.)

## Outcome / acceptance criteria
1. A fresh ZIP search (new ZIP or `?refresh=true`) populates `Firm.practiceAreas` with the firm's areas when present in the search context or page.
2. Re-running a ZIP **unions** new areas with existing ones — never demotes a non-empty list back to empty.
3. Area strings are normalized: trimmed, whitespace-collapsed, de-duplicated case-insensitively, empties dropped, NUL-safe.
4. Firms that aren't enriched (no website / enrichment timeout) still get areas from discovery when available.
5. Vitest passes; `npx tsc --noEmit` clean. UI/CSV unchanged (they already read `Firm.practiceAreas`; it'll simply start showing data).

## The deterministic seam (good live-TDD candidate)
The LLM output isn't unit-testable, but the normalize/merge helper is. **Build that helper test-first** (write the failing test → implement → green) — it's the clean TDD demo moment, and the same helper the upcoming table task reuses.

### New pure helper — `src/lib/research/sanitize.ts` (co-locate with `sanitizeText`, export)
```ts
export function normalizePracticeAreas(
  raw: (string | null | undefined)[] | null | undefined,
): string[] {
  if (!raw) return [];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of raw) {
    if (typeof item !== "string") continue;
    const clean = sanitizeText(item).replace(/\s+/g, " ").trim(); // NUL backstop + collapse ws
    if (!clean) continue;
    const key = clean.toLowerCase();
    if (seen.has(key)) continue; // case-insensitive dedupe, keep first-seen casing
    seen.add(key);
    out.push(clean);
  }
  return out;
}
```
> Note for the next task: the PracticeArea table's `buildPracticeAreaInputs` should call this, not duplicate the logic.

## The edits (exact locations from the investigation report)

### 1. Discovery Zod schema — `src/lib/research/parseResearchResponse.ts` L8-19 (`ResearchFirmSchema`)
Add, mirroring `attorneys`:
```ts
practice_areas: z.array(z.string()).nullable().optional(),
```

### 2. Discovery prompt — `src/lib/research/buildResearchPrompt.ts` (quick L43-56 and thorough L89-102)
Add to the JSON schema block and an instruction line:
```jsonc
"practice_areas": ["string"]   // firm's specialties, e.g. ["Family Law", "Personal Injury"]; [] if unclear
```
Instruction: "Include the firm's practice areas / specialties when evident from the results; use an empty array if not stated."

### 3. Enrichment prompt — `src/lib/research/buildResearchPrompt.ts` L164-221 (`buildEnrichmentPrompt`)
Add instruction `6` and the schema field:
```text
6. "practice_areas": An array of the firm's practice areas / specialties (e.g. ["Family Law","Estate Planning"]); empty array if none stated on the page or in context.
```
```jsonc
"practice_areas": ["string"]
```

### 4. Enrichment Zod schema — `src/lib/research/parseResearchResponse.ts` L177-191 (`EnrichmentResultSchema`)
```ts
practice_areas: z.array(z.string()).nullable().optional(),
```

### 5. Merge — `src/lib/research/runLeadResearch.ts` L378-423
Before the `return`, union discovery + enrichment areas, then add to the returned object:
```ts
const practiceAreas = normalizePracticeAreas([
  ...(candidate.practice_areas ?? []),
  ...(enriched.practice_areas ?? []),
]);
// ...
return {
  firm_name: candidate.firm_name,
  address, phone, website,
  email: finalEmail,
  attorney_name: attorneys.length > 0 ? attorneys[0].name : candidate.attorney_name,
  attorneys,
  practiceAreas,   // add
};
```
(Import `normalizePracticeAreas` from `./sanitize`.)

### 6. Save input type — `src/lib/db/saveResearchFirms.ts` L5-13 (`ResearchFirmInput`)
```ts
practiceAreas?: string[] | null;
```

### 7. Save create — `src/lib/db/saveResearchFirms.ts` L121
Replace the hardcoded empty array:
```ts
practiceAreas: normalizePracticeAreas(firm.practiceAreas),
```

### 8. Save update — `src/lib/db/saveResearchFirms.ts` L66-90 (the existing-firm branch)
Add to the update `data`, unioning with the existing record so re-research never demotes:
```ts
practiceAreas: normalizePracticeAreas([
  ...(existing.practiceAreas ?? []),
  ...(firm.practiceAreas ?? []),
]),
```
(Use whatever the found-existing-firm variable is named in that branch in place of `existing`.)

## Tests (Vitest, Prisma mocked)
- **`normalizePracticeAreas`** (in `sanitize.test.ts`) — TDD this first: trims, collapses whitespace, drops empties, case-insensitive dedupe (keeps first-seen casing), strips a NUL byte, handles `null` / `undefined` / `[]`, and unions two arrays with overlap.
- **Schema** (`parsers.test.ts`) — `ResearchFirmSchema` and `EnrichmentResultSchema` accept a `practice_areas` array, and tolerate it being absent (optional).
- **Save** (`saveResearchFirms.test.ts`) — create with `practiceAreas: ["Family Law","family law"]` writes `["Family Law"]`; update with existing `["Estate Planning"]` + new `["Family Law"]` writes `["Estate Planning","Family Law"]` (no demotion, no dupes).

## Docs to update (required by the data-fetching rule)
- `docs/03-data-fetching-plan.md`: §10 Pass 1 and Pass 2 output fields now include `practice_areas`; §13 — mark the "practiceAreas not extracted" gap **resolved** (leave a one-line note that areas are captured but not yet canonicalized — casing/synonyms are later entity-resolution work, same call as attorney name variants).
- `tasks/work.md`: add the work-log entry per the report format.

## Out of scope
- No `pickContactLink` scoring change (keep it for the demo TDD feature / a later quality task).
- No `PracticeArea` / `FirmPracticeArea` tables (that's the **next** task, now unblocked).
- No area canonicalization / synonym merging.
- No schema/migration. No UI/CSV edits.

## Commands for Human to Run
(Agent: list only, never run. Never `migrate reset` / `--accept-data-loss` / `git reset --hard`.)
- `npx vitest run` (new + changed tests).
- `npx tsc --noEmit`.
- `npm run dev`, then search a **fresh ZIP** (or append `?refresh=true` to a known one — cache-first means already-researched ZIPs won't re-run enrichment, so they'd stay `[]`). Then `npx prisma studio` to confirm `Firm.practiceAreas` is now populated.
- Commit code + tests + docs, then `git push` (Vercel rebuilds).

## Guardrails
- Additive only; mirror the `attorneys` flow. Never demote a non-empty `practiceAreas` to empty.
- Don't run commands. Canonical root only; ignore iCloud `" 2"` conflict files.
- Small commit: prompts + schemas + types + merge + save + tests + docs together (one feature).
- Stop after the task and report per `08-coding-agent-rules.md`, including full changed-file contents.