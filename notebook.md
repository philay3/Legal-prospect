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