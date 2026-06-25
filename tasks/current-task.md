# Task: collapse duplicate practice areas (case variants) and stop them recurring

## What is wrong
After the read migration, the search and saved-leads screens show the same practice area twice when it differs only by capitalization: "Elder law" next to "Elder Law", "estate planning" next to "Estate Planning", "personal injury" next to "Personal Injury", "Civil litigation" next to "Civil Litigation".

The canonicalizer title-cases every word, so both forms should map to one name and the unique-name constraint should make them one row. They show twice because the `PracticeArea` table holds non-canonical rows, for example a literal "Elder law", alongside the canonical "Elder Law", and some firms link to both. The current save path canonicalizes correctly, so these are historical rows: from before the canonicalizer was in place, and from the backfill having used a locally redefined copy of the function rather than the real one. Two copies of that function is the underlying mistake. The read migration faithfully shows whatever is linked, so the dupes surfaced.

This task only collapses exact case variants. The and-versus-ampersand, slash, and compound-phrase variants are a separate, larger canonicalization task and are out of scope here.

## Part 1: one source of truth for the canonicalizer
`toCanonicalPracticeArea` currently lives in `saveResearchFirms.ts`, which imports prisma and therefore `server-only`, which is why the backfill could not import it and ended up with its own copy. Move `toCanonicalPracticeArea` into the pure `sanitize.ts` module next to `normalizePracticeAreas`. It is a plain string function with no prisma dependency. Export it, and have `saveResearchFirms`, the existing backfill script, and the cleanup script in Part 2 all import it from there. No second copy anywhere.

## Part 2: a one-time merge over the normalized tables
A script, for example `scripts/dedupe-practice-areas.ts`, that the operator runs once. For every `PracticeArea` row, compute its canonical name with the shared `normalizePracticeAreas` then `toCanonicalPracticeArea`. Group rows by canonical name. For any canonical name with more than one row:
- Pick the row whose name already equals the canonical name as the keeper. Create it if none exists.
- Re-point every `FirmPracticeArea` link from the other rows to the keeper. The join key is `(firmId, practiceAreaId)`, so when a firm already links to the keeper, drop the now-redundant duplicate link instead of inserting it.
- Leave the emptied non-canonical rows in place, orphaned. Do not delete `PracticeArea` rows in this task. An orphaned row links to nothing so it never shows. Sweeping orphans can ride with the filter work later.

This touches only the join and `PracticeArea` rows, never `Firm` and never the source `practiceAreas` arrays, so it stays reversible by rerunning the backfill. It is idempotent: once names are canonical and links de-duplicated, a second run changes nothing.

Report before-and-after counts: how many `PracticeArea` rows are non-canonical (name not equal to its canonical form), and how many `FirmPracticeArea` links exist.

This is a data script, not a Prisma schema migration. Run no command yourself; hand it to the operator.

## Part 3: a read-time safety net
In `getPracticeAreaNames`, de-duplicate the names before returning, case-insensitively, keeping the canonical casing. After Part 2 there should be nothing left to collapse, but this guarantees the screen never shows the same area twice even if a stray link slips in later. It is a small pure change to the existing projection.

## What this will and will not fix
Will collapse: "Elder law" with "Elder Law", "estate planning" with "Estate Planning", "personal injury" with "Personal Injury", "Civil litigation" with "Civil Litigation", and every other pair that differs only by case.

Will not collapse: "Elder Law" versus "Elder Law & Medicaid", "Estate Administration" versus "Estate Administration & Probate", and the and-versus-ampersand or slash forms. Those are genuinely different strings or need the stronger canonicalizer, which is the practice-area normalization task queued before the filter.

## Constraints
- Plan first, wait for approval. Build only what this describes.
- Run no commands; hand the merge run to the operator and wait.
- No Prisma schema migration. The merge is a data script, and it does not delete `PracticeArea` rows.
- Part 3's projection dedup is a pure function and may be covered first if you want. Parts 1 and 2 are verified live. Author no tests unless asked.
- Full file contents for everything created or changed, plus the before-and-after counts from Part 2.

## Verification, live, by the operator
- Re-open the Cortlandt Manor search and the Corliss firm popover. "Elder law" and "Elder Law" now show as one chip, and "estate planning" and "Estate Planning" as one. Compound entries like "Elder Law & Medicaid" remain, which is correct.
- The saved-leads Sheehan popover shows "Civil Litigation" once and "Estate Planning" once.
- The post-merge count of non-canonical `PracticeArea` rows is 0, or only orphaned rows remain.
- A fresh search and save still produce single, canonical chips, confirming the save path and the shared function agree.