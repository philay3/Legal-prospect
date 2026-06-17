# 03 — Acceptance Criteria

## Acceptance Criteria Rule

Acceptance criteria define what “done” means.

Good acceptance criteria are:

- Specific.
- Testable.
- Small enough to verify.
- Written from the product/user behavior point of view.
- Not mixed with unrelated future work.

---

# Epic 1 — Bootcamp MVP Search and Results

## Story 1.1 — Search by ZIP Code

Acceptance Criteria:

1. User can enter a valid 5-digit ZIP code.
2. User can click a button labeled `Search`.
3. App sends a fresh search request.
4. Search returns firm candidates when the source finds relevant firms.
5. Search results are saved under the searched ZIP.
6. UI displays the returned firms.
7. Loading state starts when search begins.
8. Loading state ends when search completes or fails.
9. Invalid ZIP input is handled with a clear message.
10. No destructive database command is required.

## Story 1.2 — View Firm Results

Acceptance Criteria:

1. Results table displays firm name.
2. Results table displays ZIP.
3. Results table displays website if known.
4. Results table displays phone/email if known.
5. Address is not shown in the main results table.
6. Unknown values do not render as `undefined`.
7. Table works for fresh search results.
8. Table works for cached ZIP results.

## Story 1.3 — Reopen Previous ZIP Research

Acceptance Criteria:

1. Sidebar/history shows one row per researched ZIP.
2. Clicking a ZIP loads all cached firms for that ZIP.
3. Sidebar click uses `GET /api/searches?zipCode=<zip>`.
4. Sidebar click does not use `POST /api/searches`.
5. Sidebar click does not trigger fresh research.
6. Cached firms render in the table.
7. Loading state ends after cached firms load.
8. No cached data is modified by sidebar loading.

## Story 1.4 — Handle Loading and Error States

Acceptance Criteria:

1. Search button or UI indicates loading while search runs.
2. Loading state ends after success.
3. Loading state ends after error.
4. User sees a clear error if search fails.
5. User sees a clear empty state if no results are found.
6. App does not spin forever.
7. App does not silently treat failed empty search as success.

## Story 1.5 — Preserve Existing Firm Data

Acceptance Criteria:

1. Existing firms are not deleted during a search.
2. Existing non-null fields are not overwritten with null or empty values.
3. Duplicate firm records are not created for the same ZIP + firm name.
4. Fresh research may add missing information when stronger data is available.
5. The durable owner of a firm is the ZIP, not a single search event.
6. No schema changes are made without explicit approval.

---

# Epic 2 — Search Regression Protection

## Story 2.1 — Verify Fixed Search Behavior

Acceptance Criteria:

1. ZIP `30309` is manually verified.
2. ZIP `90210` is manually verified.
3. ZIP `10001` is manually verified.
4. For each ZIP, record API status code.
5. For each ZIP, record returned firm count.
6. For each ZIP, confirm browser results render.
7. Sidebar cached load still works.
8. `npx tsc --noEmit` passes.

## Story 2.2 — Prevent Empty Success

Acceptance Criteria:

1. A failed search does not return silent fake success.
2. If zero firms are returned, the UI clearly communicates no results or an error.
3. If cached firms exist, cached firms are shown instead of empty failure.
4. If no cached firms exist, a clear error is shown.
5. No path treats broken `firms: []` as a successful search.

## Story 2.3 — Confirm Sidebar Uses Cached Data

Acceptance Criteria:

1. Sidebar ZIP click calls cached-data endpoint.
2. Sidebar ZIP click does not run research.
3. Sidebar ZIP click is faster than a fresh search.
4. Cached firm count matches stored ZIP dataset.
5. No data is deleted or overwritten by cached load.

---

# Epic 3 — Search Quality Improvements

## Story 3.1 — Replace or Harden Search Provider

Acceptance Criteria:

1. Current search source is documented.
2. Search provider API keys are read from environment variables.
3. No provider key is hardcoded.
4. Missing key produces a clear configuration error.
5. Provider returns normalized context to the research worker.
6. Existing fixed search behavior is preserved.
7. Browser tests pass for core ZIPs.

## Story 3.2 — Validate Obvious Bad Fits

Acceptance Criteria:

1. Reject obvious non-law-firms.
2. Reject firms clearly outside the searched geography.
3. Reject clearly large national firms.
4. Reject obvious duplicates.
5. Log how many records were kept/rejected.

## Story 3.3 — Avoid Over-Filtering

Acceptance Criteria:

1. Do not reject a firm only because attorney count is unknown.
2. Do not reject a firm only because single-office status is unknown.
3. Keep plausible local-facing firms.
4. A few borderline firms may pass.
5. Results are not dominated by large national/regional firms.

## Story 3.4 — Enrich Contact Information

Acceptance Criteria:

1. Enrichment runs after firms are discovered.
2. Enrichment failure does not block base results.
3. Do not invent emails.
4. Do not invent phone numbers.
5. Do not invent addresses.
6. Unknown contact fields remain null.
7. Existing useful values are not overwritten with null.

---

# Global Definition of Done

A story is done only when:

1. Acceptance criteria are satisfied.
2. Required tests or manual verification are complete.
3. TypeScript passes.
4. Browser behavior is checked if UI changed.
5. API behavior is checked if route handlers changed.
6. No unrelated feature work is included.
7. Data safety rules are followed.
8. Changed files are listed.
9. The coding agent stops and waits for review.
