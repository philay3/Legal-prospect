# Task — UI fixes: popover scroll-close bug + refresh stale demo copy

Two small, display-only fixes. No API, schema, migration, pipeline, or logic changes. The changes are fully specified below (exact before/after), so implement them directly — no separate plan step needed.

## Why
1. The firm-name popover closes on *any* scroll, including scrolling **inside** the popover itself — so a firm with enough practice areas to overflow the popover can't be scrolled (it closes instead). One-line fix.
2. The page copy still uses demo/pilot/seed language ("seeded demo prospects", "try 19103 to see pilot prospects", "pilot dataset"). The app now returns live, real-firm data for any ZIP, so this wording is inaccurate and undersells the product. Replace three strings.

## Step 0 — read first
Open `src/components/ResultsTable.tsx` (the `PracticeAreasPopover` component, its `handleScroll`) and `src/app/page.tsx` (the three copy strings below). Implement against what's actually there.

## Outcome / acceptance criteria
1. Scrolling inside an overflowing popover keeps it open and scrolls its content; scrolling the page still closes it. Second-click / outside-click / Escape still close it (unchanged).
2. The three strings below are replaced exactly. No "pilot", "seeded demo", "pilot dataset", or "pilot prospect data" language remains anywhere in `page.tsx`.
3. No behavior changes beyond these. Sorting, pagination, popover open/close, action icons, and CSV all still work.
4. `npx vitest run` still passes (166) and `npx tsc --noEmit` is clean. No new tests are needed (display-only copy + one event-handler line).

## The changes

### 1. `src/components/ResultsTable.tsx` — scroll handler (inside `PracticeAreasPopover`)
```js
// before
const handleScroll = () => {
  onClose();
};

// after
const handleScroll = (e: Event) => {
  if (popoverRef.current?.contains(e.target as Node)) return;
  onClose();
};
```
This ignores scroll events that originate inside the popover (its own overflow scroll) while still closing on any page scroll. Leave the `window.addEventListener("scroll", handleScroll, true)` registration as-is.

### 2. `src/app/page.tsx` — replace three copy strings

**a. "Ready for Search" placeholder description**
```jsx
// before
Enter a 5-digit ZIP code above (try <strong>19103</strong> to see pilot prospects) to begin ZIP-code search for boutique law firms.

// after
Enter a 5-digit ZIP code above (e.g., <strong>19103</strong>) to find small and boutique law firms in that area.
```

**b. Results subtitle (under the results header)**
```jsx
// before
Currently showing a small pilot dataset: seeded demo prospects plus manually reviewed real-firm records pending final verification.

// after
Law firms found for this ZIP, with contact details researched automatically. Coverage can vary by firm.
```

**c. "No prospects found" placeholder description**
```jsx
// before
No prospects found for this ZIP code in the current pilot dataset. Please search for ZIP <strong>19103</strong> to view pilot prospect data.

// after
No law firms found for this ZIP. Double-check the ZIP code and try again.
```

Leave the search-input placeholder (`Enter 5-digit ZIP code (e.g., 19103)`) and the loading copy as-is — those are fine.

## Verification (manual + regression)
1. `npx tsc --noEmit` clean; `npx vitest run` still green at 166.
2. `npm run dev`, then:
   - Open a ZIP whose firms have many practice areas so a popover overflows its height. Open the popover and scroll inside it → it stays open and scrolls. Scroll the page → it closes. Confirm second-click, outside-click, and Escape still close it.
   - Check the three states read with the new wording: the empty "Ready for Search" card, the results subtitle, and the "No prospects found" card. Confirm no "pilot"/"demo"/"seed" language remains.

## Guardrails
- Display-only. Only two files change: `ResultsTable.tsx` (the one `handleScroll` line) and `page.tsx` (the three strings). Nothing else.
- No API, schema, migration, pipeline, or logic changes. Don't touch the input-placeholder example or the loading copy.
- Don't run any commands (list them for the human only).
- The existing test suite must stay green — no tests removed.

Implement directly (the changes are exact) and report per `08-coding-agent-rules.md` with the full contents of both changed files, then stop.