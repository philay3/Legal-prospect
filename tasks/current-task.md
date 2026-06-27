# Task: Dashboard restyle to the ledger aesthetic

Move the dashboard from the old shared classes to the warm-paper ledger look,
matching the verbatim design (`Dashboard - Original.html`). This is mostly a
restyle of data the page already loads, plus one small additive data function for
recent-search timestamps. No schema change, no migration.

## Build to the verbatim design

Title row, four-tile stat strip, saved-leads preview, activity feed, and recent
searches all come from `Dashboard - Original.html`. Reproduce that markup
faithfully, with the two data-driven simplifications noted under Locked decisions.

## Context that shapes the scope (do not re-derive)

- **The dashboard stays a server component.** Every interaction in the design is
  navigation: the New search button, the stat tiles, the preview rows, and the
  recent-search rows are all `next/link`. No client component, no `router.push`.
- **The header is already global.** `NavBar` renders in `RootLayout`; the
  dashboard link is the active one on `/dashboard`. Do NOT add a header.
- **The page already loads almost everything.** `getPipelineCounts`,
  `getRecentActivity`, `listSavedLeads`, and the email-derived `firstName` are
  already in `dashboard/page.tsx`. The restyle reuses them.
- **Reuse existing helpers, do not reimplement.** `leadActivityLine`
  (`src/utils/leadActivity.ts`) for the preview activity line, `formatRelativeTime`
  and `formatActivityEvent` (`src/utils/activityFeed.ts`) for the feed and all
  timestamps, `getPracticeAreaNames` (`src/lib/practiceAreas`) for the preview
  practice area. All are pure and safe in the server component.
- **`rl-page` gutter.** The dashboard wrapper becomes `app-wrapper rl-page`.
- **Top spacing.** Match the mock's ~34px gap below the header. Do NOT use a large
  value like the `8rem` that landed on the leads header.

## Locked decisions (confirmed with the operator)

1. **Recent searches show ZIP + relative time only.** Neighborhood names are not
   stored anywhere, and a SEARCHED activity never records a result count, so the
   mock's neighborhood and count columns are dropped. Each row is ZIP plus the
   relative time of the last search, clickable to re-run (`/?zip={zip}`).
2. **The header inline ZIP box is replaced by the "New search" button.** Remove the
   `DashboardSearch` usage; the button is a `next/link` to `/`, where the same
   input lives. (`DashboardSearch.tsx` becomes unused and may be deleted in
   cleanup; leaving it in place is also fine.)
3. **Activity feed renders real events only.** The model knows SEARCHED, SAVED,
   WON, and LOST. The mock's "Edited … phone number", the "to leads" tails, and the
   "· Cambridge, MA" on a search are decoration and are not rendered. Each feed row
   is the real `{label}` (ink) plus `{subject}` (ink2). No leading dot (the mock
   has none).
4. **The Won tile shows close rate.** `won / (won + lost)`, replacing the current
   "+N this week" trend. `countWonThisWeek` is no longer displayed and its call can
   be removed.
5. **Stat tiles stay deep-links** to `/leads?status=` as they are today.

## Timestamp note (flagged, minor)

The mock uses an ultra-compact time form ("2h", "1d", "Now"). To avoid a second
time formatter, use the existing `formatRelativeTime` ("2h ago", "1d ago", "just
now") for the activity feed and recent searches, and widen those time columns
enough to fit rather than the mock's 30px. If the compact form is wanted later, it
is a small follow-up with a tested helper. (Greeting separator: the mock uses an
em dash, "Good morning, Jordan — 6 leads in play"; reproduced as-is. Say if you
want a comma instead.)

---

## Files

### 1. `src/lib/activity.ts` — add recent-searches-with-time

Add a new function (additive, leaves `getRecentSearches` and its callers
untouched):

```ts
export async function getRecentSearchesWithTime(
  userId: string,
  limit = 6
): Promise<{ zip: string; searchedAt: string }[]> {
  const records = await prisma.activity.findMany({
    where: { userId, type: "SEARCHED" },
    orderBy: { createdAt: "desc" },
    take: 50,
    select: { query: true, createdAt: true },
  });
  // Mirror dedupeRecentSearches: keep the first (newest) occurrence per ZIP.
  const seen = new Set<string>();
  const result: { zip: string; searchedAt: string }[] = [];
  for (const r of records) {
    if (!r.query || seen.has(r.query)) continue;
    seen.add(r.query);
    result.push({ zip: r.query, searchedAt: r.createdAt.toISOString() });
    if (result.length === limit) break;
  }
  return result;
}
```

### 2. `src/app/dashboard/page.tsx` — restyle (server component)

Keep it a server component. Replace the data fetch and the entire returned markup.

Data:
- Fetch `getPipelineCounts`, `getRecentActivity(user.id, 8)`,
  `listSavedLeads(user.id, 6)`, `getRecentSearchesWithTime(user.id, 6)` in
  `Promise.all`. Drop `countWonThisWeek`.
- Keep the existing `firstName` derivation from the email.
- Compute: `total = counts.active + counts.won + counts.lost`;
  `closed = counts.won + counts.lost`;
  `closeRate = closed > 0 ? Math.round((counts.won / closed) * 100) : null`.
- Greeting word from the hour: `< 12` morning, `< 18` afternoon, else evening.
- Date line "Wed · Jun 25, 2026":
  `weekday short` + " · " + `month short, day numeric, year numeric`.

Markup, in order inside `<div className="app-wrapper rl-page">`:

**Title row** (`rl-dash-header`): left group with "Dashboard" (serif 30px, ink) and
the subtitle (mono 12px, ink2) reading `Good {greeting}, {firstName} — ` then
`{total} leads` in ink then ` in play`. Right group (column, end-aligned): the
"New search" `Link` to `/` styled as the accent button, then the date line (mono
10px, ink3) below it.

**Stat tiles** (`rl-dash-tiles`, 4-column grid with top and bottom 1px line2
rules): four tiles, each a `Link`, with a big serif number, an uppercase mono label,
and a mono ink3 sublabel:
- `{total}` ink, "Saved leads", "In your pipeline", to `/leads`.
- `{active}` ink, "Active", "In progress", to `/leads?status=active`.
- `{won}` accent, "Won", `{closeRate}% close rate` (or "No closes yet" when
  `closeRate` is null), to `/leads?status=won`.
- `{lost}` ink3, "Lost", "Closed out", to `/leads?status=lost`.

**Two-column body** (`rl-dash-body`, grid `1.4fr 1fr`, columns divided by the left
column's right border):

*Left column* (`rl-dash-leads`): a header row with "Saved leads" (serif 18px) and a
"View all {total} →" `Link` to `/leads`. Then up to 6 preview rows. Each row is a
`Link` to `/firms/{slug ?? id}` laid out on grid `minmax(0,1fr) 116px 132px 16px`:
- firm name (serif 15px, ink, truncated with ellipsis) above the primary practice
  area (`getPracticeAreaNames(firm)[0]`, mono 9.5px uppercase ink3; render nothing
  if the firm has no areas).
- status pill: a 6px dot plus an uppercase mono 10px label, reusing the status
  color modifiers from the leads ledger (`.rl-status-active|won|lost` for the label
  and `.rl-dot-active|won|lost` for the dot fill/border) with dashboard-sized base
  classes. Active ink, Won accent, Lost hollow dot + ink3 label struck through.
- activity line: `leadActivityLine({ status, savedAt: createdAt.toISOString(),
  statusChangedAt: updatedAt.toISOString() })`, right-aligned, mono 10.5px ink3.
- a right arrow "→" (mono 13px ink3).
- Empty (no saved leads): a quiet line, "No saved leads yet.", with a `Link` to `/`.

*Right column* (`rl-dash-rail`): 

- An "Activity" section label (uppercase mono 10px, .2em tracking, ink3). Then up
  to 8 feed rows, each a flex line (no dot): the relative time
  (`formatRelativeTime(activity.createdAt)`, mono, ink3, fixed narrow column) and
  the text `{label}` (ink) + " " + `{subject}` (ink2) from
  `formatActivityEvent(activity)`. Empty: "No activity yet."
- A "Recent searches" section label (same style, more top margin). Then the
  recent-search rows from `getRecentSearchesWithTime`: each a `Link` to
  `/?zip={zip}`, ZIP (mono 13px, ink) on the left and the relative time of
  `searchedAt` (mono 10px, ink3) on the right. Empty: "No searches yet."

Remove the `DashboardSearch` import and usage, the `formatRelativeTime`-only lead
rows' old markup, the activity dot, and the emoji empty states.

### 3. `src/app/globals.css` — additive `rl-dash-` classes

All new, all additive, all under `rl-dash-` (plus reuse of the existing
`.rl-status-*` and `.rl-dot-*` color modifiers for the pill, and the existing
tokens). Add classes for: the title row and New search button and date line; the
4-tile strip and tile/number/label/sublabel and tile hover; the two-column body
and its divider; the leads preview header, row, name, area, pill base sizes,
activity, and arrow; the rail section labels; the activity feed row, time, and
text; the recent-search row; and the three empty states. Include a
`@media (max-width: 768px)` block that stacks the title row, collapses the tiles to
two columns, and stacks the two-column body. Do not modify any existing rule and do
not redefine the tokens or the `.rl-status-*` / `.rl-dot-*` classes.

---

## Acceptance criteria

1. `npx tsc --noEmit` passes; `npx vitest run` passes with no test changes.
2. `/dashboard` renders in the ledger look: global header, the "Dashboard" title
   with the greeting and lead count, the New search button and date, the four-tile
   stat strip, the saved-leads preview, the activity feed, and recent searches.
3. The four tiles show the right numbers and colors (total ink, active ink, won
   accent, lost ink3), the Won tile shows the close rate (or "No closes yet" with
   no closed leads), and each tile links to its `/leads?status=` view.
4. Preview rows show firm name, primary practice area, the correct status pill, the
   "Saved/Closed · {time}" activity line, and an arrow; clicking a row opens that
   firm's detail page; "View all →" goes to `/leads`; the count fetched is 6.
5. The activity feed shows real SEARCHED / SAVED / WON / LOST events with the label
   in ink and the subject after it, no leading dot.
6. Recent searches show ZIP plus the relative time of the last search and link to
   `/?zip={zip}`. The New search button links to `/`.
7. Empty states render for zero leads, zero activity, and zero searches.
8. At widths below 1180px the page has the `rl-page` gutter, and below 768px the
   title row, tiles, and body stack without overflow.
9. The dashboard is a server component (no `"use client"`), and all existing CSS,
   tokens, and `.rl-status-*` / `.rl-dot-*` classes are unchanged. The only data
   addition is `getRecentSearchesWithTime`.

## After it ships

Regenerate the dumps via `make-dumps.sh` (`dashboard/page.tsx`, `lib/activity.ts`,
and `globals.css` change, spanning the frontend, project, and styles dumps). That
closes out the three-page restyle (results, saved leads, dashboard); the queued
backlog is next, starting with user-private lead overrides.