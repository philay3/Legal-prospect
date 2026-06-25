# Project Notebook — Legal Prospector

A running log of the things worth remembering: debugging war stories, design decisions, and the lessons behind them. Newest entries on top. Each entry is roughly *what happened → what we learned → what to carry forward*.

---

## 2026-06-18

### Emails are a fetch problem, not a search problem
We kept saying "we just need emails" and assumed a better search would deliver them. It wouldn't. Discovery only gives you the firm and a URL; an email lives on the firm's own contact page, so it only shows up if you successfully *fetch and parse* that page. Our actual bottleneck was the enrichment fetch failing (`fetch failed`), not discovery.
**Carry forward:** separate "find the entity" from "extract its details." They fail for different reasons and need different fixes — don't let a detail problem masquerade as a discovery problem.

### Tavily over DuckDuckGo, and over Google Places
DuckDuckGo HTML scraping was 403-ing constantly, which dumped us into an LLM-only fallback. We compared real search APIs. Google Places gives clean name/phone/address/website but has **no email field** and needs Google Cloud billing — and it wouldn't have touched our fetch problem. Tavily won because it's two tools: **Search** (reliable discovery, kills the 403s) and **Extract** (does the page fetch on its own infra and returns cleaned content — which is what actually unlocked emails).
**Carry forward:** pick the tool that attacks your real bottleneck, not the one that looks best on paper.

### Design for reversibility — the SEARCH_PROVIDER flag
We swapped DDG → Tavily behind a small provider interface with a `SEARCH_PROVIDER` env flag (default `tavily`, set `ddg` to revert) instead of ripping DDG out. The payoff came fast: when we wanted to test "did DDG actually surface more broken sites?", we flipped one env var and restarted — no code change, no coding agent.
**Carry forward:** when replacing a dependency, keep the old one one flag away. Cheap insurance, and it makes A/B experiments trivial.

### Vercel deploys from git — "works locally" can hide unpushed code
The live site "wasn't doing live search." The tell was in `git status`: whole directories (`src/lib/db/`) were untracked and had never been pushed. Vercel builds from `origin/main`, so the deployed app was missing core pipeline code while local had everything — they'd quietly drifted apart. Related: local `.env` and Vercel env vars are **separate stores** (the Neon DB is shared between local and prod; the env vars are not).
**Carry forward:** when prod misbehaves but local is fine, diff what's actually *deployed* — check git first. And remember every environment needs its own copy of each secret.

### The NUL byte that ate 20 firms (Postgres 22021)
A DDG run discovered and enriched 20 firms, then the save threw `invalid byte sequence for encoding "UTF8": 0x00`. A NUL byte (`\u0000`) from scraped text reached Postgres, which can't store it, and the **entire batch rolled back** — zero firms saved. The route degraded to empty results, and a leftover hardcoded "pilot dataset" empty-state made it look like DDG had found nothing.
**Carry forward:** (1) always sanitize untrusted/scraped text before a DB write — strip NUL and control chars; (2) one bad record shouldn't kill the batch (isolate per-record where you can); (3) don't trust the GUI symptom — the real story was three lines down in the logs; (4) a "clean" upstream tool (Tavily Extract) can *mask* a latent bug that still bites on other code paths.

### "More results" isn't "better results" — the LLM-fallback finding
When DDG fell back to the LLM-only path, gpt-5.5 listed firms from training memory and invented plausible-looking domains that were frequently dead — so Extract returned empty and direct fetches failed across the board. "DDG returns more broken sites" really meant "the LLM fallback invents dead URLs." DDG handed us 36/15/14 firms across three ZIPs but enriched far fewer, with broken links.
**Carry forward:** judge a data source by *enrichment success*, not raw count. An LLM recalling specifics from memory will surface stale/dead facts. And you can't trust discovery to return only live sites — broken-site detection needs an explicit liveness check (the planned `WebsiteCheck` table), not a vibe from whatever discovery returned.

### When to make a new table (normalizing the flat schema)
We started with one flat `Firm` table — a fine MVP call (ship fast, defer normalization). The rule for when something earns its own table: a distinct entity with its own attributes, a many-to-many relationship, a repeating group (a `String[]` column is the smell), or history/time-series. From that rule: `Attorney` (one-to-many off Firm), `PracticeArea` + `FirmPracticeArea` (many-to-many via a join table), `SavedLead` (a join table that also carries its own columns), `Zip` (a research ledger). Migration approach: **expand/contract** — add the new tables, dual-write, migrate reads, *then* drop the old columns.
**Carry forward:** normalize when the array/column starts hurting your queries, and always migrate additively first so nothing breaks mid-flight.

### Reading the live app — Vercel logs
`console.log` output shows up in Vercel's runtime logs. Two ways to watch: the dashboard **Logs** tab (real-time, filterable by route), or `vercel logs --follow` from the CLI (closest to watching local `npm run dev`). Gotchas: ~256 log lines per request (heavy runs get truncated), short retention on Pro, and the duration shown bundles in cold-start time.
**Carry forward:** instrument generously with `console.log` — it's basically free observability once deployed.

---

### Loose threads we noticed (to revisit)
- **Contact-link picker grabs directories.** `pickContactLink` sometimes chooses a third-party aggregator (allbiz.com, rcwba.org, nydivorcehelp.com) over the firm's own site, so we extract the directory's contact info, not the firm's.
- **City comes from the ZIP, not the firm.** Out-of-area firms get stamped with the ZIP's town (e.g. a San Francisco firm labeled "Peekskill"). City really belongs to the firm's actual address.
- **Attorney entity resolution.** Names like "Michael H. Joseph" vs "Michael H. Joseph Esq" are the same person stored twice. Deferred until extraction is cleaner.

## 2026-06-19

### Session: custom auth + the app shell (and a UI cleanup pass)
The whole session was about giving Legal Prospector a front door. We recovered a lost Results-UI spec from an old chat, verified and merged that UI v2 (click-to-toggle popovers, contact action-icons, a capped attorney column, CSV-across-all-pages), fixed two small bugs (a popover that closed when you scrolled *inside* it; stale "demo/seed/pilot" copy), walked the full data model as an ERD, then built **custom email-code authentication** end to end across three task specs — foundation (tables + crypto/db/cookie helpers), the login flow (request/verify/sign-out routes + login & account pages), and the app shell (auth-aware nav + a protected dashboard, currently in flight). 198 tests green; login works for real. Then wired up Resend + the env vars and wrote a handoff for the next chat.

### Why we built auth now — a scope call
My advice was to defer accounts until after the demo and keep the runway clear. Chops overruled it — accounts are non-negotiable for where this is headed, and he's shipped auth before. Right call for the owner to make; I logged the trade-off and we moved.
**Carry forward:** the planner flags the cost, the owner makes the call. Don't relitigate a decision once it's made.

### The test that failed because of *when* it computed a hash
A `checkLoginCode` test failed with a hash mismatch — and the cause wasn't the crypto, it was timing. The agent computed the expected hash at the **describe-body load time**, before `beforeEach` had stubbed the `AUTH_SESSION_SECRET` pepper (so it hashed with an empty pepper), while the test itself ran *after* the stub (real pepper). Same input, two peppers, two hashes. Fix: move the fixture inside `beforeEach`.
**Carry forward:** never compute a fixture that depends on env or stubs at module/describe load time — compute it inside `beforeEach`, after the stubs are in place. Purely a test-ordering trap, not a prod bug.

### One pepper, every environment
`AUTH_SESSION_SECRET` is the pepper we hash login codes and session tokens with. Local `.env` and Vercel are separate stores, and the Neon DB is shared between them — so if the two environments hold *different* peppers, a code hashed in one won't verify in the other and logins silently break. A `|| ""` fallback also makes a *missing* secret fail quietly.
**Carry forward:** any secret that participates in hashing must be byte-identical across every environment that touches the same DB. Set it in both stores, same value.

### Make the server-rendered nav update after login/logout
The nav reads auth state in a server layout (`getCurrentUser()`), so the client has to tell Next to refetch it after an auth change — `router.refresh()` after sign-in and after sign-out. Without it the header keeps showing "Sign in" until a hard reload.
**Carry forward:** when a client action changes something a server component renders, `router.refresh()` is what re-syncs it.

### Why LoginCode has no foreign key (and Session does)
Chops asked why `Session` hangs off `User` with an FK but `LoginCode` is standalone, keyed only by email. The split is durable-relationship vs transient-credential: a session is an ongoing fact about a logged-in user (belongs to them, cascades when they're deleted); a login code is a pre-auth, single-use, expiring token that exists *before* we know who anyone is — so it keys off the email being verified, not a user row.
**Carry forward:** model the lifecycle, not just the shape of the data. "Belongs to a user" earns an FK; "exists before there's a user relationship" doesn't.

### Decision: search is public, an account unlocks the dashboard
Locked the routing model. `/` (the ZIP search) and `/login` are public; `/dashboard` and `/account` require login; a successful login lands on `/dashboard`. The dashboard is a shell for now and fills in when SavedLead lands.

### New idea (captured): gate all firm emails behind an account
Chops wants to hide **every firm email** behind login, so the email — the highest-value contact field — becomes the reward for having an account. Good lever. Two things to get right when we build it:
- **Strip it server-side, don't hide it in CSS.** The public results page has to *omit* the email from the data it sends to signed-out users (return an `emailLocked` flag instead). If we only hide it in the UI, the address is still sitting in the network response and the DOM — that's cosmetic, not gated. Same goes for CSV: signed-out exports must not contain emails, or make CSV account-only outright (a cleaner, stronger gate).
- **Mind the signup model.** Accounts are currently *allowlist / invite-only* (active `User` rows seeded by hand), so today this gates emails to approved users — that's access control. It only becomes a true "force people to sign up" funnel if/when signup goes self-serve. Worth deciding which one we're building toward before we lean on it as a growth move.

---

### Where things stand — structure reference

**The 7 tables.**
- *Research corpus (shared/global):* `Firm` — `searchZip` (the searched ZIP, our cache/dedupe key) kept separate from the firm's real `zip`/`city`/`state`, plus contact fields and confidence/verification metadata → `Attorney` (1:M off Firm, unique per `[firmId, name]`); `PracticeArea` (unique `name`) ↔ `Firm` many-to-many via `FirmPracticeArea` (composite PK `[firmId, practiceAreaId]`).
- *Auth layer (per-user/private):* `User` (email unique, `isActive` = the allowlist flag, lastLoginAt) → `Session` (1:M, hashed token, expiry, cascades on user delete); `LoginCode` standalone (email-keyed, single-use, expiring).
- `SavedLead` (future) is the bridge between `User` and `Firm`.

**Auth files** (`src/lib/auth/`, all `server-only`): `crypto.ts` (code/token generation + peppered sha256 + the check helpers), `db.ts` (user/code/session queries), `cookies.ts` (HttpOnly session cookie), `constants.ts`; plus `email.ts` (Resend `sendLoginCodeEmail`) and `session.ts` (`getCurrentUser`). Routes: `request-code`, `verify-code`, `sign-out`. Pages: `/login` (server page that redirects if already signed in + a `LoginForm` client child), `/account` (protected) + `SignOutButton`; `/dashboard` (in flight). Allowlist = active `User` rows; codes and tokens hashed; responses generic (no email enumeration); 60s resend cooldown.

**Pipeline** (untouched this session): ZIP → Google Places discovery → Tavily/direct extract + gpt-4o-mini → save → sortable, paginated results table with CSV.

### Plans for the future — roadmap
1. **App-shell nav** (in flight) — auth-aware header + the public/protected routing above.
2. **Gate emails behind login** (per the idea above) — pairs naturally with the nav work, since that's when the public results page becomes auth-aware. Remember: strip server-side.
3. **SavedLead** (+ `LeadActivity`) — private per user, bridges `User ↔ Firm`, fills the dashboard, needs route protection.
4. **Recent ZIPs** — user-scoped search history.
5. **Data-app layer:** `Zip` (research ledger), `ResearchRun`, `WebsiteCheck` (the explicit liveness check we keep wanting), `DataPoint` (per-field provenance), `Prediction` — turns the snapshot into continuously-enriched data.
6. **AI analysis** (deferred experiment): export leads → LLM for findings ("rank as Westlaw prospects," "practice-area gaps in this ZIP"); later an in-app "Generate insights" button.

### New loose thread
- **Dev-only "log the code" hack must not ship.** The agent suggested `console.log`-ing the login code in development to skip the email round-trip. Fine locally, but it can never reach production — a logged code is a logged credential. Watch for it when reviewing the login routes.

## June 24, 2026 — practice-area read migration + dupe finding
- Shipped: practice-area reads moved onto the normalized tables behind a shared
  include + projection (src/lib/practiceAreas.ts). Idempotent backfill closed the
  142-firm gap (2622 = 2622). 314 tests pass. Reversible; String[] kept.
- Found: case-variant dupes on screen ("Elder law"/"Elder Law"). Cause = historical
  non-canonical PracticeArea rows the additive backfill could not fix, plus the
  backfill's locally copied canonicalizer. Current save path canonicalizes fine.
- Two-layer split: (a) case variants, fixable now, see practice-area-dedup-cleanup.md;
  (b) "and" vs "&", slash, compound-phrase long tail, needs a stronger canonicalizer
  and is the prerequisite for a practice-area filter. Not Phase 2.
- Lessons now in guardrails: single source of truth for helpers; never tsc a single
  file (use tsx); an additive backfill closes gaps but does not fix bad rows.