# Task: Polish the dashboard (visual only)

Bring the signed-in dashboard up to the same visual quality as the restyled search screen, using the existing design tokens and fonts. This is a polish pass on the CURRENT dashboard — NOT a rebuild, and NOT the stat-cards / inline-search layout from the mockup.

## Why
After the foundation restyle the dashboard looks unfinished next to the search screen, and the saved-lead rows feel flat. Tighten it up so it matches the rest of the app.

## Scope (dashboard page only)
The signed-in home page: the welcome header, the "Saved Leads (N)" summary card and its firm rows, the "View all" link, and the search/start button.

Fixes:
1. Welcome header: the full email blown up as a giant heading is the main eyesore. Make "Welcome back" the heading (Hanken, --text) and drop the email to a smaller, muted line beneath it (--text-muted). Keep the existing "Your central hub…" subline. Don't let the email drive the heading size.
2. Saved-leads card + rows: use the same card treatment as the search screen (--surface bg, --border, rounded corners). Firm name in --text, city/state in --text-muted. Give each row a clear interactive hover state (subtle lift to --surface / --border-strong, pointer cursor) so it feels interactive again. Keep "Saved Leads (N)", the "View all →" link (accent), and any existing row links/behavior working exactly as-is.
3. Buttons: the green button ("Start Searching") uses solid --accent with an --accent-text (dark) label and 10px radius — same as the search button.
4. General spacing/typography polish to match the search screen.

## Out of scope
- NOT the mockup's three stat cards (SAVED LEADS / SEARCHES THIS MONTH / FIRMS SURFACED) and NOT the inline ZIP-search box — that means inventing metrics we don't track and is a rebuild, not a fix. Leave the dashboard's structure as-is.
- No data/route/logic changes, no new metrics, no other pages.

## Verification (manual)
- Dashboard looks consistent with the search screen; the heading is clean (no giant email); saved-lead rows hover and any links still work.
- `npx tsc --noEmit` clean; `npx vitest run` still passes.

## Commands for Human to Run (agent: list only, never run)
- npx tsc --noEmit
- npx vitest run
- npm run dev   (open the dashboard, check the header + row hovers + links)

## Guardrails
- Visual/CSS + markup-class only — keep all dashboard logic, links, and data exactly as-is. No destructive commands.
- Reuse the existing tokens/fonts; don't hardcode new colors.
- In globals.css, only touch dashboard styles; leave the search screen, nav, footer, and feedback styles alone.
- Ignore any iCloud " 2" conflict files; edit canonical files only.
- Report the full contents of every changed file, then stop.