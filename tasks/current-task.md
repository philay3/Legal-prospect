# Task: Strip NUL/control bytes before save (fixes Postgres 22021 crash)

## Why
A live DDG run on ZIP 10962 discovered and enriched 20 firms successfully, then the save threw:
`invalid byte sequence for encoding "UTF8": 0x00` (Postgres code 22021) at `saveResearchFirms.ts:91`. Postgres text columns cannot store a NUL byte (`\u0000`); one slipped in from scraped/extracted text, and because the save isn't sanitized, the entire batch rolled back — all 20 firms lost, route returned empty (which is why the GUI showed the empty state). Tavily Extract masks this (it returns cleaned content), but it's a latent crash on any provider.

## Outcome / acceptance criteria
1. Re-running the ZIP that crashed (`/api/prospects/search?zip=10962&refresh=true`, with `SEARCH_PROVIDER=ddg`) saves firms successfully — no 22021 error.
2. Saved string fields contain no `\u0000` bytes; legitimate text (unicode, and `\t \n \r`) is preserved.
3. Works regardless of discovery/extraction provider — the fix lives at the save boundary.
4. Vitest passes; the sanitizer is covered by pure unit tests.
5. No schema change, no migration.

## Design

### Sanitizer (extend `src/lib/research/sanitize.ts`)
Add a pure function that removes the bytes Postgres rejects plus other junk control chars, while preserving normal whitespace:
```ts
// Remove NUL (mandatory — Postgres 22021) + other C0 controls except tab/newline/CR
export function sanitizeText(v: string): string {
  return v.replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F]/g, "");
}
```
And a helper that deep-cleans a firm before save — every string field and every string-array element (`attorneys[]`, `practiceAreas[]`, plus `firmName`, `streetAddress`, `website`, `phone`, `email`, `globalNotes`, etc.):
```ts
export function sanitizeFirm<T>(firm: T): T { /* walk values; sanitizeText on strings, map over string arrays */ }
```
Prefer a small generic walk over the object's string / string-array values so no field is missed if the shape changes.

### Apply at the save boundary
In `src/lib/db/saveResearchFirms.ts`, call `sanitizeFirm(firm)` once per firm immediately before the create/update (and before building attorney inputs, once the Attorney task lands). This keeps the fix provider-agnostic.

### Optional hardening (only if cheap)
Wrap each firm's save in try/catch and log+skip a failing record rather than letting one bad firm abort the whole batch. Today a single bad byte dropped all 20 firms; per-firm isolation would save 19 and log 1. Secondary to the sanitize fix — skip if it complicates the change.

## Tests (Vitest)
- `sanitizeText`: strips `\u0000` and other C0 controls; keeps `\t \n \r`, ASCII, and unicode (e.g. accented names); idempotent.
- `sanitizeFirm`: cleans nested string fields and array elements (`attorneys`, `practiceAreas`); leaves an already-clean firm unchanged.

## Out of scope
- The "search ZIP 19103 / pilot dataset" empty-state copy in the frontend — separate trivial change, not here.
- No discovery/extraction changes, no Attorney table work (that's the next task), no schema change.

## Commands for Human to Run
(Agent: list only.)
- `npx vitest run`
- With `SEARCH_PROVIDER=ddg` in local `.env`: `npm run dev`, then `curl "http://localhost:3000/api/prospects/search?zip=10962&refresh=true"` — confirm firms return and no 22021 in the logs.
- `npx prisma studio` to confirm rows saved.
- Commit + `git push`. (No migration needed.)

## Guardrails
- Canonical root only; ignore iCloud `" 2"` conflict files.
- No destructive commands.
- Pure code change — no schema/migration.
- Small commit: sanitizer + save change + tests together.