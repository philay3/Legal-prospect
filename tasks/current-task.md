# Current Task — Results UI v2 (display-only)

## Why
Frontend v2: tighten the results table for the demo. The firm-name popover currently opens on hover and blocks scrolling (and likely drives a ~10s render lag from eagerly building a hidden popover for every row). This task switches it to click-to-toggle + on-demand render, moves the address into the popover, promotes attorneys to their own column, and collapses phone/email/website to action icons. **Display-only — no API, schema, migration, or pipeline changes.** Firm-rows stay (no attorney-row restructure).

## Step 0 — read first
Read the results table component and the current firm-name popover implementation. Implement against what's actually there. Also check the CSV export helper and the pagination helpers (`src/utils/pagination.ts`) so you don't regress them.

## Acceptance criteria
- The firm-name popover opens on click of its cue and closes on a second click, an outside click, Escape, and scroll. It renders on-demand (not eagerly per row), isn't clipped by table/row overflow, and the prior render lag is gone.
- The popover contains **practice areas + address only** (no attorneys).
- Attorneys appear as their own table column, capped at the first 2 with a `+N more` indicator.
- Phone, email, and website are action icons (`tel:` / `mailto:` / link), each carrying the real value in `title` and `aria-label`; a missing value shows a muted dash, not a dead icon.
- CSV export includes **all rows across all pages** (not just the current page) with the **full** phone/email/website values (not icons).
- Sorting, pagination, and loading/error states still work. Firm-name wrap, the area header, and the clickable/copyable API endpoint are preserved.

## The change

### A. Click-to-toggle popover (stop blocking scroll)
Change the firm-name popover from sticky-hover to **click-to-open (toggle)**:
- The discoverability cue (e.g. the practice-area count chip) is the click target; click opens, click again or click outside closes.
- **Close on scroll**, on outside-click, and on Escape.
- **Render the popover content on-demand** — only build it when open, not eagerly for every row. (This also likely fixes the ~10s render lag: eagerly rendering a hidden popover per row builds a lot of DOM up front.)
- Keep it from being clipped by row/table overflow (high `z-index` or a portal).

### B. Address inside the popover
Since the address column is gone, show each firm's address in its popover:
```
{streetAddress}
{city}, {state} {zip}
```
Omit empty lines; show a muted "Address not found" if all parts are missing.

### C. Attorneys out of the popover; kept in the table
- The popover contains **practice areas + address only** — not attorneys.
- Attorneys stay as their own table column, capped (first 2 + `+N more`), since this tool is ultimately for contacting them and they should be visible at a glance.

### D. Phone / email / website → action icons
Shrink these three columns by replacing the full text with a click-to-act icon:
- Phone → phone icon, `<a href="tel:{phone}">`.
- Email → envelope icon, `<a href="mailto:{email}">`.
- Website → globe/link icon, `<a href="{website}" target="_blank" rel="noopener noreferrer">`.
So no data is lost:
- Each icon carries the real value in `title` and an `aria-label` (e.g. `aria-label="Call (631) 555-1212"`).
- Missing value → a muted dash, not a dead icon.
- CSV export keeps the **full** phone/email/website values (don't reduce the export to icons).
- (Tradeoff: this trades glanceability for compactness. If you later want the number visible, show it next to the icon — icons-only for now.)

### Keep from v1 (don't regress)
Firm name wraps; the area header ("Law firms near {city}, {state} {zip}"); the clickable/copyable API endpoint.

## Tests
- Pure helper for the capped attorney display (e.g. `capAttorneys(names, max)`) → returns the first `max` names plus a remainder count. Unit-test 0, 1, exactly `max`, and `max+` names, and the `+N more` math.
- Popover behavior: opens on cue click; closes on second click, outside-click, Escape, and scroll; content is not in the DOM until opened.
- Action icons: a present value renders an icon with the correct `href`, `title`, and `aria-label`; a missing value renders a muted dash with no link.
- CSV: export contains the full phone/email/website (not icons) for **all** rows across pages, not just the visible page.

## Commands for Human to Run (list only — do not run)
```
npx tsc --noEmit
npx vitest run
npm run dev   # then manually check a dense ZIP (e.g. 10510): popover toggle, icons, attorney column, CSV row count
```

## Guardrails
- **Display-only.** No API, schema, migration, or pipeline changes. No Places work. No social-media display.
- No attorney-row restructure — firm-rows stay.
- Don't break sorting, pagination, loading/error states, or CSV.
- No visual redesign beyond the changes above — reuse the existing styling/tokens.
- Do not run any commands (including `npx`/`git`) — list them for the human only.

Return an implementation plan first (file-by-file `[NEW]`/`[MODIFY]` list + verification plan) — do not implement yet. After approval, report per `08-coding-agent-rules.md` with the full contents of every changed and created file, then stop.