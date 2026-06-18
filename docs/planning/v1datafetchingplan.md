# 03 — Data Fetching Plan (revised 2026-06-18)

## 1. Purpose
Governs how we discover, verify, structure, and store real small/boutique law-firm prospects by ZIP. Originally written before any fetching existed; now documents the **live pipeline** (the roadmap points here for the "documented fetching pass"), the rules it follows, and the known gaps between plan and reality.

---

## 2. Current State (LIVE)
Live data fetching is implemented and running in production — no longer static seed data.
- **Discovery:** **Tavily Search** returns web results as grounding → **gpt-5.5** returns candidate firms as JSON → dedupe. DuckDuckGo HTML scraping is retained as a fallback behind the `SEARCH_PROVIDER` env flag (it 403s often → an LLM-only fallback that's lower quality and tends to surface dead URLs).
- **Enrichment:** `pickContactLink` chooses a contact/about URL → **Tavily Extract** fetches cleaned page content (falls back to direct fetch if Extract returns empty) → **gpt-5.4-mini** extracts phone/email/attorneys → a regex `extractEmails` backstop prefers firm-domain emails.
- **Persistence:** `sanitizeFirm` (strip NUL/C0) → dedupe by `[zip, firmName]` → save to `Firm`; cache-first so each ZIP is only researched once (see `docs/05-database-plan.md`).
- **Deployed** on Vercel; kept private (no auth/rate-limiting yet).

---

## 3. Real-Data Objective
Provide sales reps with real, accurate, actionable leads for small/boutique firms (1–15 attorneys) by ZIP: contact details (phone, website, address), firm characteristics (size, practice areas), and trust signals (source URL, confidence, last-checked).

## 4. Prospect Record Fields
Matches the `Firm` schema in `docs/05-database-plan.md`: `id, firmName, website, phone, email, streetAddress, city, state, zip, zipExt, practiceAreas[], attorneyCountRange, attorneys[], sourceType, sourceUrl, confidenceLevel, verificationStatus, lastCheckedDate, globalNotes`.

## 5. Source Types and Quality Tiers
- **Tier 1 (highest trust):** law-firm official websites (addresses, direct dials, attorney names, practice areas); state bar registries (license status; formatting varies).
- **Tier 2 (medium):** Google Maps/Places (location, phone, website; weak on specialties/attorneys); reputable directories (Avvo, Martindale — structured but often stale).
- **Tier 3 (lowest):** search-engine snippets / web directories — messy, duplicate-prone; for discovery bootstrapping only.

*Current reality:* discovery rides Tier-3 (web search) to find candidates, then enrichment pulls Tier-1 (the firm's own site) via Tavily Extract. Google Places (Tier 2) was evaluated and deferred (no email field, needs billing).

## 6. Confidence Scoring and Verification Status
Confidence: **HIGH** (verified against live site or human audit), **MEDIUM** (Places + matching domain, no conflicts), **LOW** (snippet/secondary only), **UNKNOWN** (new/unassessed). Verification lifecycle: **CANDIDATE → PENDING_REVIEW → VERIFIED / REJECTED**, plus **STALE**.
*Current reality:* every saved record is `confidenceLevel = UNKNOWN`, `verificationStatus = CANDIDATE` — there is no scoring or human-review step yet. Both are future work.

## 7. ZIP and Geographic Matching
- Exact 5-digit base ZIP match against `Firm.zip`.
- ZIP+4 normalized to the 5-digit base; extension kept as metadata.
- *Planned, not built:* proximity expansion to adjacent ZIPs (Haversine on centroids) when a ZIP yields <3 results, with expanded results clearly demarcated in the UI.

## 8. Duplicate Handling
- **Target:** primary dedup key = canonical domain (`langergrogan.com`); secondary = normalized name + state + phone. On collision: keep existing unless new data is higher-confidence (then fill empties / flag for review); always bump `lastCheckedDate`.
- *Current reality:* dedup is by `[zip, firmName]` (findFirst → merge, never demote). Canonical-domain dedup is the target and a known gap (§13) — the same firm can appear under slightly different names across ZIPs.

## 9. Freshness and Last-Checked
- 90-day freshness window; past that, mark **STALE** and schedule re-verification.
- *Current reality:* `lastCheckedDate` is set on save, but there is no stale-detection or re-verify job yet — that arrives with the `Zip` ledger + `ResearchRun` (future).

---

## 10. The Live Pipeline — Documented Passes
Per the project rule that every fetching pass is documented (trigger, input, source, request, output, save, overwrite, cost), here is the live pipeline:

### Pass 1 — Discovery
- **Trigger:** cache miss on a ZIP, or `?refresh=true`.
- **Input:** normalized 5-digit ZIP.
- **Source:** Tavily Search (fallback: DuckDuckGo HTML → LLM-only).
- **Request → model:** law-firm-by-ZIP search query → grounding passed to **gpt-5.5**, which returns candidate firms as JSON.
- **Output fields:** `firmName`, `website`, optional `phone`/`address`/`attorneys[]`/`practice_areas[]`.
- **Save / overwrite:** candidates saved; dedupe by `[zip, firmName]`, merge, never demote.
- **Cost / limits:** ~1 Tavily search credit + one gpt-5.5 call per ZIP. Cache means once per ZIP.

### Pass 2 — Enrichment (per firm, up to ~20)
- **Trigger:** each discovered firm.
- **Input:** firm + its known website.
- **Source:** Tavily Extract on the `pickContactLink` URL (fallback: direct fetch).
- **Request → model:** cleaned page content → **gpt-5.4-mini** extracts phone/email/attorneys; regex `extractEmails` backstop prefers firm-domain addresses.
- **Output fields:** `phone`, `email`, `attorneys[]`, `practice_areas[]`.
- **Save / overwrite:** `sanitizeFirm` then merge into the `Firm` row.
- **Cost / limits:** ~1 Tavily extract credit per 5 URLs + one gpt-5.4-mini call per firm; 40s per-firm timeout.

---

## 11. Future Automation Options
- **Google Places hybrid:** Places for clean firm identity (name/phone/address/website), Tavily Extract for email — two integrations, post-MVP.
- **Background workers:** continuous enrichment driven by a `Zip` research ledger + `ResearchRun` history; stale re-verification.
- **Website liveness (`WebsiteCheck`):** HTTP-check each firm URL on a schedule → broken-site detection (signal + outreach hook). Note: discovery can't be trusted to surface only live sites, so this must be an explicit check.
- **Lead scoring (`Prediction`):** propensity-to-buy from fit + trigger signals; lookalikes off closed deals.
- **External data fusion:** state business-registration filings (new-firm signal, often pre-website), court filings (active firms), bar directories (attorney emails).
- *(Correction from the original draft: the LLM extraction step uses OpenAI gpt-5.5 / gpt-5.4-mini, not Gemini.)*

## 12. Risks and Constraints
- **Cost / rate limits:** third-party APIs cost money; cache aggressively. Tavily free tier covers demo volume (≈1,000 credits/mo); each ZIP spends credits once. Tavily was acquired by Nebius (Feb 2026) — pricing could shift. Google Places pricing is SKU-based; verify before adopting.
- **ToS / legal:** respect robots.txt; scraping SERPs or bar sites can violate ToS and trigger IP blocks (part of why DDG 403s).
- **AI hallucinations:** the LLM-only fallback invents plausible dead URLs — treat it as a backstop, not a source; a human-review step is needed for low-confidence inferences.
- **Bad bytes:** scraped/LLM text can contain NUL/control characters that crash Postgres (22021) — handled by `sanitizeFirm` at the save boundary.
- **Compliance:** prospecting contact data must respect CAN-SPAM / TCPA / GDPR; reps handle opt-outs.

## 13. Known Gaps (plan vs reality)
- `practiceAreas` is now extracted and stored (resolved) — *Note: areas are captured but not yet canonicalized (casing/synonyms are later entity-resolution work, same call as attorney name variants).*
- Dedup is `[zip, firmName]`, not canonical-domain.
- No proximity/adjacent-ZIP expansion.
- No human-review/verification step (everything stays CANDIDATE / UNKNOWN).
- No freshness/stale re-verification job.
- `pickContactLink` sometimes selects third-party directories (allbiz.com, rcwba.org, nydivorcehelp.com) over the firm's own site.

## 14. Non-Goals (for now)
- No new external provider added without documenting its pass here first.
- No auth/Resend work in this doc's scope (see `docs/04-auth-account-plan.md`).
- No background workers / cron yet.
- No proximity search or human-review UI yet.