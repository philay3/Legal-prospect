# Current Task — Direct-fetch-first page extraction behind `EXTRACT_PROVIDER` (Tavily stays the fallback + the revert)

## Why

Tavily Extract runs once per enriched firm (~60 per search), which burns credits fast. Two low-risk moves: (1) a **fresh Tavily key** for headroom, and (2) **invert the fetch order** — try a free direct fetch first and only fall back to Tavily Extract when direct fetch fails or returns empty. That cuts paid Tavily calls down to just the sites a plain fetch can't handle, while keeping Tavily — the proven extractor — in the loop. We do it behind an `EXTRACT_PROVIDER` flag (mirrors `SEARCH_PROVIDER`) so it's fully reversible: one env var flips back to today's Tavily-first behavior.

**No new vendor before the demo.** Jina / Firecrawl remain drop-in future values behind the same flag, but are **out of scope here** — this task introduces no new dependency and no new API key.

> Reversibility is the point. Tavily must stay fully wired so `EXTRACT_PROVIDER=tavily` restores current behavior with no code change.

## Step 0 — Read first

- `runLeadResearch.ts` `enrichFirm` calls `fetchPageContent(targetUrl)` (imported from `./searchProviders/tavily`), wrapped in try/catch so a failure still saves the firm with Places data.
- Where the **direct-fetch + HTML-clean** routine lives — the logs show `fetchPageContent` falling back to a direct fetch ("falling back to direct fetch" / "Fetching page directly"), so there's already a direct-fetch routine (likely inside `searchProviders/tavily.ts`, using `cleanHtmlToText`). **Reuse it**; don't write a new one.
- The existing `SEARCH_PROVIDER` wiring and `.env.example`, so `EXTRACT_PROVIDER` follows the same conventions.

If reality differs from these assumptions, **surface it in your implementation plan and stop for review before coding.**

## Acceptance criteria

1. `EXTRACT_PROVIDER` selects the fetch order, with two values:
   - `tavily` — Tavily Extract → direct-fetch fallback. (**today's exact behavior; the revert**)
   - `direct` — direct fetch → Tavily Extract fallback. (the cost-saver)
2. **Default is `tavily`** when `EXTRACT_PROVIDER` is unset — prod/demo stay on the proven path; `direct` is an opt-in.
3. **Reverting / staying safe is one env var:** `EXTRACT_PROVIDER=tavily` is current behavior, no code change.
4. Graceful failure preserved: if the primary **and** the fallback both fail, the firm still saves with its Places data; one bad fetch never aborts the batch.
5. Logs say which path ran (e.g. `Extracting via direct fetch`, `direct fetch empty/failed, falling back to Tavily`, `Extracting via Tavily`), so the A/B is visible in the logs.
6. `npx vitest run` and `npx tsc --noEmit` pass.

## The change

Add a small extractor module (e.g. `src/lib/research/extract.ts` — confirm placement in Step 0) exporting `extractPageContent(url: string): Promise<string>` that dispatches on `EXTRACT_PROVIDER`:

- `tavily` → call the existing `fetchPageContent` (Tavily Extract → direct fallback). **Leave that function untouched.**
- `direct` → `fetchDirect(url)` first; on throw/empty, `fetchPageContent(url)` (Tavily) as the fallback.

Where `fetchDirect(url)` reuses the existing direct-fetch + `cleanHtmlToText` routine — extract it into a shared, reusable function if it's currently inlined inside the Tavily fallback. Reuse the existing timeout wrapper (`withTimeout` / `fetchWithTimeout`).

Then, in `runLeadResearch.ts` `enrichFirm`, replace the `fetchPageContent(targetUrl)` call with `extractPageContent(targetUrl)`. Nothing else in the pipeline changes — the rest of enrichment, the `extractEmails` backstop, save, route, and UI all stay the same.

Env:
- `EXTRACT_PROVIDER` (default `tavily`; `direct` is the cost-saver) — add to `.env.example` with a comment noting `direct` tries a free direct fetch first and falls back to Tavily. **No new keys** — keep using `TAVILY_API_KEY`.

## Tests

Keep light — the real proof is the live A/B run, and the fetchers do network I/O:
- Dispatch / order selection: given each `EXTRACT_PROVIDER` value, the correct primary-then-fallback order is selected (`tavily` → Tavily-then-direct, `direct` → direct-then-Tavily), and an unknown/unset value falls back to `tavily`.
- If the harness allows mocking the fetchers, add one test that the fallback fires: the primary throws/returns empty → the fallback is called and its result returned.
- Keep all existing enrichment / `extractEmails` / `pickContactLink` tests green.

## Commands for Human to Run (list only — do not run these)

```bash
npx vitest run
npx tsc --noEmit
# A/B the fetch order on the SAME ZIP and compare the yield line + time.
# Restart the dev server with each value, then curl the same ZIP with refresh=true:
#   EXTRACT_PROVIDER=tavily  → curl ".../api/prospects/search?zip=48306&refresh=true"   (note: "E with email" and total time)
#   EXTRACT_PROVIDER=direct  → curl ".../api/prospects/search?zip=48306&refresh=true"   (compare)
# Confirm for each: failed=0 on save, all firms still saved, total time well under 300s.
# If direct-first HOLDS the email yield → set EXTRACT_PROVIDER=direct on Vercel to start saving Tavily credits.
# If it DIPS → leave it on tavily (the default). Reverting is just EXTRACT_PROVIDER=tavily.
```

## Guardrails

- **No schema change, no migration, no destructive DB commands.**
- Touch **only** the new extractor module, the `enrichFirm` call site in `runLeadResearch.ts`, and `.env.example`. Do **not** touch discovery, the save path / `searchZip` dedupe, the route response shape, or the UI.
- **Keep the Tavily path fully working** — it's both the fallback and the revert. Do not delete `fetchPageContent` or change its behavior.
- Preserve graceful failure (a firm with no usable page still saves with Places data) and the existing timeout/concurrency.
- Keep enrichment on `gpt-5.4-mini`.
- Do **not** add Jina / Firecrawl in this task — they're future values behind the same flag.

When done, report per `08-coding-agent-rules.md` (including full changed-file contents), then stop and wait for review.