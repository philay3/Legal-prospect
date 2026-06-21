# Testing Guide

> How testing and verification work on the project. The one-line version — "tests are the gate" — lives in [how-we-build.md](how-we-build.md); this is the detail: what each check proves, how the TDD loop runs, and the gotchas specific to this stack.

## Tests are the gate
The suite is **223 tests**, and every change runs against it. A change that drops the test count or breaks the type-check doesn't ship — that's the rule that makes it safe to hand work to a coding agent. The agent suggests and explains checks; **the human runs every command.** No command runs blindly, and nothing destructive runs to "fix" a failure.

## The commands
- **`npx vitest run`** — the full suite (223 green).
- **`npx vitest run <name>`** — one file, e.g. `npx vitest run sanitize`. *(Vitest matches on the filename.)*
- **`npx tsc --noEmit`** — type-check; proves it compiles, not that it works.
- **`npm run dev`** — the dev server, for manual browser checks. **Only the human starts it.**

Never run, ever: `npx prisma db push --accept-data-loss`, `npx prisma migrate reset`, `git reset --hard`, `git clean -fd`. If a failure seems to *require* a destructive command, stop and review instead.

## What each check actually proves
They prove different things, and it's worth being precise about which:
- **`tsc` passes** → the project compiles. It does *not* prove the app works.
- **Unit tests pass** → the *tested* behavior is correct. Untested flows are still unknown.
- **Manual browser check passes** → a visible user flow works. It doesn't replace automated tests.
- **Lint passes** → style/rules are clean. Says nothing about behavior.
- **"No console errors"** → good, but data correctness still needs checking.

So "it compiles," "tests pass," and "the page loads" are three different, partial claims — none of them alone means "it works."

## TDD, the way we do it
The discipline is a clean **red → green**: describe the behavior you want as a *failing* test first, then make the smallest change that turns it green.

The key rule — and the one to say out loud when demoing — is **fix the function, never the test.** The test is the spec; if a change "passes" by rewriting the test to match broken code, that's backwards. (This is exactly the live demo: a new `normalizeAttorneyName`, a failing test that asserts a trailing `", Esq."` is stripped, then the function fix that makes it pass.)

A passing unit test proves the *function* — it doesn't prove the feature is wired into the UI. When a change needs to be visible, verify it in the browser too; the test and the on-screen behavior are separate checks.

## Vitest gotchas on this stack (hard-won)
- **The `@/` path alias doesn't resolve under Vitest** — use **relative imports** in tests (`./sanitize`, not `@/lib/research/sanitize`).
- **`server-only` modules** throw when imported in a test — mock them: `vi.mock("server-only", () => ({}))`.
- **Env-dependent fixtures fail if built in the `describe` body** — the env stubs haven't run yet at that point. Build them inside `beforeEach` instead.

## When a check fails
Don't panic, and don't reach for a destructive command. Copy the *smallest* useful error — the failed test name, expected vs. received, and the file path (not hundreds of repeated lines) — and work from that. Keep the fix scoped to the current task.

## Keep debugging scoped
A debugging task gets the same tight scope as a feature task. "Fix the ZIP validation error on the search form" is a good task; "clean up the app and fix anything broken" is not. One bug is never license to rewrite unrelated parts.

## Test data rules
Test data should be small, clear, predictable, and safe to inspect — and never contain real secrets, API keys, production credentials, or private personal information.