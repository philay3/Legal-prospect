# 05 — Testing Plan

## Testing Goal

Prove that the core app works for bootcamp and protect the app from regressions as it grows.

## Testing Layers

Use a practical mix:

1. **TypeScript checks**
2. **Unit tests**
3. **API/route tests**
4. **Frontend interaction tests**
5. **Manual browser verification**

## Required Baseline Command

```bash
npx tsc --noEmit
```

This passing does not prove the app works by itself. It only proves type checking.

## Core Manual Verification ZIPs

Use these ZIPs for search verification:

```text
30309
90210
10001
```

For each ZIP, record:

- API status code.
- Returned firm count.
- Browser rendered results.
- Whether loading state ended.
- Whether error/empty state behaved clearly if no results.
- Whether results look like law firms.
- Whether results are plausibly local or local-facing.

## Search Regression Checklist

- [ ] User can enter ZIP.
- [ ] User can click `Search`.
- [ ] Loading state appears.
- [ ] Loading state ends.
- [ ] Firms render in table.
- [ ] Empty results are not silent fake success.
- [ ] Error state is readable.
- [ ] Search does not delete existing data.
- [ ] Search returns combined ZIP dataset after save/merge.
- [ ] TypeScript passes.

## Sidebar Cached Load Checklist

- [ ] Sidebar/history shows researched ZIPs.
- [ ] Clicking ZIP loads cached firms.
- [ ] Sidebar ZIP click uses cached endpoint.
- [ ] Sidebar ZIP click does not run fresh research.
- [ ] Cached load is fast.
- [ ] Loading state ends.
- [ ] Cached firms render correctly.
- [ ] No cached data is deleted or overwritten.

## Results Table Checklist

- [ ] Firm name renders.
- [ ] ZIP renders.
- [ ] Website renders when available.
- [ ] Phone/email render when available.
- [ ] Address is hidden from main table.
- [ ] Missing fields do not show `undefined`.
- [ ] Table works with fresh results.
- [ ] Table works with cached results.

## Data Safety Checklist

- [ ] No destructive DB commands.
- [ ] No `db push --accept-data-loss`.
- [ ] No table drops.
- [ ] No column drops.
- [ ] No deleting real firm/search/ZIP/contact records.
- [ ] No overwriting non-null values with null.
- [ ] No schema changes unless approved.

## Test-Writing Prompts

### Prompt 1 — Search Regression

```markdown
Write regression tests for the fixed ZIP search behavior.

Test:
1. Valid ZIP search sends a fresh search request.
2. Successful search returns a non-empty firm list when source finds firms.
3. UI renders at least one firm.
4. Loading state ends.
5. Failed or zero-result search shows clear error/empty state.
6. No path silently treats broken `firms: []` as success.
7. TypeScript passes.

Keep this focused on search behavior only.
```

### Prompt 2 — Sidebar Cached Load

```markdown
Write tests for sidebar cached ZIP loading.

Test:
1. Sidebar ZIP click calls `GET /api/searches?zipCode=<zip>`.
2. Sidebar ZIP click does not call `POST /api/searches`.
3. Sidebar ZIP click does not run fresh research.
4. Cached firms render.
5. Loading state ends.
6. Cached data is not modified or deleted.
```

### Prompt 3 — Data Preservation

```markdown
Write tests for firm data preservation.

Test:
1. Existing firm with non-null website/phone/email is not overwritten by null.
2. Duplicate firms are not created for the same ZIP + firm name.
3. New missing fields can be filled when stronger data is available.
4. No delete operation is called during search save/merge.
```

### Prompt 4 — Results Table

```markdown
Write frontend tests for the results table.

Test:
1. Firm name renders.
2. ZIP renders.
3. Website renders when present.
4. Phone/email render when present.
5. Address does not render in the main table.
6. Missing values render cleanly, not as `undefined`.
7. Fresh and cached result responses both render.
```

## Manual Demo Script

Use this during bootcamp demo:

1. Open app.
2. Explain the problem: finding small law firm prospects manually is slow.
3. Enter a ZIP code.
4. Click `Search`.
5. Show loading state.
6. Show firm results.
7. Point out key columns.
8. Click a previous ZIP in the sidebar.
9. Explain cached ZIP research.
10. Explain that firms are stored under ZIPs.
11. Mention future roadmap: dashboard, tasks, enrichment, better search provider.
