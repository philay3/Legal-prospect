# Legal Prospector — Demo Run-of-Show (Monday)

**Total target: ~12 min** (core compresses to ~7 if time is tight — see "If running short").
**The job:** don't just show a working app — show the *engineering judgment* behind it. Every segment below is tagged with the pillar it proves: **[AI]** AI management · **[TDD]** testing · **[SQL]** data model.

The arc: *problem → it works, live → it's not a toy LLM wrapper → here's the engineering that makes it trustworthy (SQL, AI, TDD) → where it's going.*

---

## Pre-demo checklist (do this BEFORE you present — 5 min)
- [ ] **Hard-refresh the prod site** (Cmd+Opt+R). You hit a stale-Safari-CSS ghost before — don't let it happen live. Confirm the avatar menu and styling look right.
- [ ] **Pick a known-good ZIP** ahead of time — one you've already run that returns ~50–60 firms with good phone/attorney/practice-area coverage, **and where an attorney name ending in `", Esq."` is visible** (you'll point at it in Segment 6). Write it on a sticky note. Do **not** improvise a cold ZIP live.
- [ ] **Tabs open and ready:** (1) the prod Vercel app, (2) a raw ChatGPT/Claude tab for the comparison, (3) Prisma Studio (`npx prisma studio`) showing the tables — you'll use it for the ERD/data beat and to show a feedback row, (4) your editor + a terminal in the repo for the live TDD.
- [ ] **Dev server + localhost tab ready for Segment 6.** Have `npm run dev` already running and a **localhost browser tab** open — the live fix is shown there (the change is uncommitted; local and prod share one DB, so the same ZIP renders through the new code). Push to prod after.
- [ ] **Terminal pre-positioned** in the project, vitest command ready to type (`npx vitest run sanitize`). Test runner warm.
- [ ] **Have the ERD open** (`database.md`) — the 9-table mermaid diagram on screen.
- [ ] **A signed-in account ready** (so the save-to-leads / export beat works without a detour through signup).
- [ ] Close Slack/notifications. Silence the phone.

---

## Segment 1 — The problem (hook) · ~1 min
**Goal:** make them feel the pain before you show the fix.

**Say (skeleton):**
- "This is built for a Thomson Reuters rep who sells Westlaw to small and boutique law firms."
- "Their problem: there's no clean list of those firms. Google gives you a maps pin and maybe a phone number — but it misses attorneys, practice areas, and real contact info. Reps hand-build prospect lists by ZIP, one firm at a time. It's slow and the data's stale."
- "Legal Prospector turns a ZIP code into an accurate, exportable list of firms *with* the contact and firm data Google misses."

**Do:** nothing yet — just talk. Land the problem.

---

## Segment 2 — It works, live · ~2 min · **[AI]** (enrichment in action)
**Goal:** prove it's real and in production, not localhost.

**Do:**
1. Open the prod Vercel link. Say the words "this is live in production."
2. Type your known-good ZIP. Run the search.
3. As results stream in: "It's discovering ~60 firms in that ZIP through Google Places, then visiting each firm's website and extracting structured data — phone, attorneys, practice areas — with an LLM."
4. Show the table: sort by a column, show pagination.
5. Select 2–3 firms (the checkboxes) → **Save to Leads**. Then show the CSV export.
6. (Optional, fast) click the avatar → show the account menu / Leads page.

**Say:** "Phone comes reliably from Places. The attorney and practice-area data is the part that's hard to get anywhere else — that's the value."

**Bookmark for later:** note where a `", Esq."` attorney name is sitting in these results — you'll point back at it in Segment 6.

**Risk/fallback:** if a live search is slow or flaky on the network, have a *second* browser tab with a completed search already loaded. Don't stare at a spinner on stage.

---

## Segment 3 — Raw AI vs. the app · ~1.5 min · **[AI]**
**Goal:** kill the "isn't this just an LLM wrapper?" objection before anyone asks it.

**Do:**
1. Switch to the raw ChatGPT/Claude tab. Ask it: *"List law firms in ZIP [your ZIP] with their phone numbers and attorneys."*
2. Point at what comes back: generic, possibly hallucinated, no way to trust it, no sources, can't export, goes stale instantly.
3. Switch back to your app. "Same question — but this is grounded. Real discovery through Places, real extraction from each firm's actual website, deduped, and stored. The LLM is *one component* doing a narrow job — extracting fields from a page — not making up a list."

**Say the line:** "It's the difference between asking a model to *guess* and building a system that *knows*."

---

## Segment 4 — The data model (ERD walk) · ~2.5 min · **[SQL]**
**Goal:** the mandatory one. Show you think in schemas, not just CRUD.

**Do:** put the 9-table ERD on screen.

**Say (walk it in this order):**
1. **Two layers.** "There's a research corpus — the firm data — and an auth layer — the user accounts. They're deliberately separate, joined by exactly one bridge table."
2. **Research corpus:** "`Firm` is the center. `Attorney` hangs off it one-to-many. `PracticeArea` is many-to-many with firms through a join table, `FirmPracticeArea` — because one firm has many practice areas and one practice area spans many firms."
3. **The M:N pattern:** "I use that same join-table pattern twice — `FirmPracticeArea`, and `SavedLead`, which is the bridge connecting a user to the firms they've saved."
4. **The bug story (this is your gold — slow down here):** "Early on I had one `zip` column doing two jobs: the *search key* I dedupe on, *and* the firm's real physical ZIP. Google Places was overwriting the real ZIP, which silently corrupted my cache reads — firms stopped matching. The fix was a schema decision: split it into a separate `searchZip` column for the search/dedupe key, kept apart from the real address. The lesson — never overload one column as both a key and real data."
5. **Feedback — the 9th table.** Flip to Prisma Studio: "I added a `Feedback` table — note the optional, nullable user relationship: feedback can be anonymous or tied to an account, and `onDelete: SetNull` means deleting a user keeps the signal, it just detaches it."

**Say the line:** "Decisions in the schema are where the real bugs live — and where the real design is."

---

## Segment 5 — Managing the AI · ~2 min · **[AI]**
**Goal:** show you *orchestrate* AI deliberately — you're not vibe-coding.

**Say:**
- "I build this with a three-way loop. I act as the architect — I write the spec. A separate CLI coding agent implements it. I review every diff and I run every command myself."
- "There are guardrails baked in: the agent returns a *plan* before it writes code so I can correct it first; migrations are strictly additive — never destructive; the agent never runs commands, I do."
- "Inside the product, the LLM is managed the same way — it has a narrow contract: take a messy firm webpage, return structured fields. It's a component, not magic."

**The measurement beat (tavily-vs-direct A/B):**
- "And I don't guess which approach is better — I measure. For extraction I A/B'd pulling pages through Tavily versus fetching them directly, and picked the winner on the data, not a hunch."

**Say the line:** "Managing AI well is mostly about guardrails and measurement — plans before code, tests around everything, and decisions settled by data."

---

## Segment 6 — TDD, live · ~2.5 min · **[TDD]** — THIS IS THE SHOWPIECE
**Goal:** prove you do real test-driven development, live, with a clean red→green — *and* the feature visibly working on the site, not just a green test.

**Frame it first (10 sec):** "The test suite — 223 passing — is *what makes it safe* to hand work to an AI agent. Every change it makes runs against this. Let me add to it, live."

**The live loop** (the agent writes the code under my spec; I run every command — full prompts in `live-tdd-segment.md`):
1. **Surface it.** Point back at the `", Esq."` attorney in your Segment 2 results. "See the credential on the end of that name? When the same attorney shows up on another firm's page *without* the 'Esq.', we store them as two different people. Real data-quality bug — let me fix it live."
2. **RED — Prompt 1 to the agent:** add a `normalizeAttorneyName` helper (a v1 that only tidies whitespace) plus a test asserting `", Esq."` is stripped. Run `npx vitest run sanitize`. **It fails.** Point at the red. *("My first version just tidies spaces, so 'Esq.' still slips through.")*
3. **GREEN + wire — Prompt 2:** fix *only the function* to strip the credential (keeping `Jr.`/`Sr.`/`II`…), and wire it into where results render attorney names. Run `npx vitest run sanitize`. **It passes.** Point at the green. *("I strip 'Esq.' because it's a credential, but I keep 'Jr.' because that's a different person.")*
4. **Visible on the site.** Re-search the same ZIP on localhost. **The "Esq." is gone.** *("Not just a passing test — the feature, live on the site.")*
5. **The line:** "That's the loop — describe the behavior I want as a failing test, the agent implements under a tight spec, the test proves it. And notice I tell it to fix the *function*, never the test — the test is the spec."

**Risk/fallback:** it's live coding through the agent — rehearse until it's muscle memory (you have all weekend). The green test is your floor: if the localhost re-search glitches, the passing test still proves the fix. Worst case, run the full suite (`npx vitest run` → 223 green). **Either way you end on green.**

---

## Segment 7 — Where it's going (roadmap close) · ~1 min · **[SQL]**/**[AI]**
**Goal:** leave them with vision, not just a finished demo.

**Say:**
- "Near term: email yield. Firm homepages rarely expose email, so the next build is a dedicated contact-page fetch and a deeper scrape — triggered when a user *saves* a lead, so I spend the effort where it matters."
- "And it's responsive to real users — I got client feedback this week asking for tighter ZIP targeting and multi-ZIP search. The targeting fix ties right back to the `searchZip` column you just saw — I already separate the search ZIP from the firm's real ZIP, so filtering to exact matches is a small change."
- "Bigger arc: this becomes a real data product. Instead of just storing the answer, I store the *evidence* — research runs, website checks, individual data points with provenance — and derive predictions from it. Continuous backend enrichment, not one-shot search. That layer's already designed in the schema."

**Closing line:** "Today it turns a ZIP into a trustworthy prospect list. Where it's headed is a system that keeps that data fresh and ranks who's worth calling."

---

## If running short (compress to ~7 min)
Keep, in order: **Segment 1** (30 sec) → **Segment 2** (90 sec, live) → **Segment 4** ERD with the searchZip bug (2 min) → **Segment 6** live TDD (2.5 min) → one-line roadmap close (30 sec).
Cut/merge: Segment 3 (mention raw-vs-app in one sentence during Segment 2), Segment 5 (fold the three-way loop + A/B into one sentence during the TDD frame). You still hit all three pillars.

---

## Anticipated Q&A (rehearse these)
- **"Isn't this just an LLM wrapper?"** → No. Discovery is Google Places, extraction is grounded in each firm's real website, results are deduped and stored. The LLM does one narrow job — field extraction — and I measured it against alternatives.
- **"How do you trust code an AI agent wrote?"** → Plan-before-implement so I correct it first, I review every diff, 223 tests run on every change, migrations are additive-only, and I run every command myself.
- **"Why one shared DB for local and prod?"** → Honest tradeoff for a solo build on a deadline. I manage the risk by keeping every migration strictly additive and previewing the SQL before applying it — never a reset or a destructive push.
- **"Why is email yield low?"** → By design of the web, not the system — law firm homepages rarely show email. Phone, the more useful contact for outreach, comes reliably from Places. The roadmap is a dedicated contact-page pass for email.
- **"How does dedup work?"** → Application-level on `[searchZip, firmName]` via a lookup, not a DB unique constraint — deliberately, to avoid constraint collisions during concurrent saves.
- **"What stops someone just buying a list?"** → Freshness and accuracy, the attorney/practice-area data lists miss, and a per-rep workflow to save and export — not a static dump.

---

## Rehearsal script — the live `normalizeAttorneyName` red-green
The full segment — the exact two prompts and the narration — is in **`live-tdd-segment.md`**. Rehearse from that. The skeleton:

- **Surface** a `", Esq."` attorney in the live results (call back to Segment 2).
- **Prompt 1 → agent:** add `normalizeAttorneyName` (whitespace-only v1) + the failing test → you run `npx vitest run sanitize` → **RED**.
- **Prompt 2 → agent:** fix the function (strip the credential, keep generational suffixes) + wire it into the results display → you run `npx vitest run sanitize` → **GREEN**.
- **Re-search** the same ZIP on localhost (`npm run dev`) → the "Esq." is gone.
- **Key line:** "fix the function, not the test — the test is the spec."

You pass the prompts one at a time and run every command yourself; the agent runs nothing. The green test only depends on the function fix, so it's solid even if the localhost re-search needs a nudge.