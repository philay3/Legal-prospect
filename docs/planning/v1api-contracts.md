# API Contracts

> The app's HTTP surface, verified against the route handlers in `src/app/api/**`. For request lifecycles (what happens inside each call) see [architecture.md](architecture.md); for the pipeline pass-by-pass see [data-pl-cur.md](data-pl-cur.md); for the firm field shapes see [database.md](database.md) and the `Prospect` type in `src/types/prospect.ts`.

## Principles (enforced in code)
- **Global research data is shareable; user workflow data is private.** Firm / attorney / practice-area data and its evidence trail are global. Saved leads, their status, and a user's activity are per-user; feedback attribution is per-user but optional.
- **Private routes derive the user from the session (`getCurrentUser`), never from a client-supplied `userId`.** Confirmed in the leads, enrich, recent-searches, and feedback handlers.
- **Validate every input server-side.** The search route normalizes the ZIP (`normalizeZipCode`); the auth routes validate email/code shape; leads validate body types and parse status; feedback validates the choice against an allow-list.
- **Saves never mutate global `Firm` data — with one scoped exception.** Enrichment runs through the search pipeline; the one write a user action triggers is the save-triggered email pass (`/api/leads/enrich`), which updates only that firm's `email` / `emailCheckedAt`.

## Response and status conventions (as actually implemented)
There is **no single envelope**; shapes are per-route:
- **Auth routes always return HTTP `200` with `{ ok: boolean }`, even on failure.** This is deliberate: a generic response prevents account enumeration and credential probing.
- The search route returns `{ query, results }`; leads return `{ ok, saved }` / `{ signedIn, firmIds }` / `{ ok, status }`; enrich returns `{ ok, email, cached? }`; recent searches return `{ searches }`; feedback returns `{ ok: true }`.
- **Error responses are `{ error: "<human-readable message>" }` with a status** (`400`, `401`, `403`, `404`, `500`). There are **no machine error-code strings** (nothing like `INVALID_ZIP`).
- Status codes in use: `200` success, `400` invalid input/JSON, `401` not signed in, `403` acting on a lead you don't own, `404` firm not found, `500` server error. The auth routes are the intentional exception to "never `200` on an error."

## Routes — current

### Search (public)
**`GET /api/prospects/search?zip={zip}&refresh={true|false}`**
- ZIP is normalized by `normalizeZipCode`: accepts a 5-digit code or ZIP+4, returns the 5-digit base; anything else is `400`. (Multi-ZIP is handled on the client, which fans out one call per ZIP — see [data-pl-cur.md](data-pl-cur.md).)
- Cache-first: reads `Firm` rows for `searchZip`; on empty results or `refresh=true`, runs `runLeadResearch(zip, "thorough")`, saves via `saveResearchFirms` (which also writes `DataPoint` provenance and the cached provenance columns), re-reads, then best-effort writes the research audit (`ResearchRun` + `WebsiteCheck`).
- Read-side: rows are passed through `filterByZip` (drops Google Places radius spillover), mapped to `Prospect` (now including `slug` and a derived `confidenceTier`), then **sorted: firms with an email first, then by confidence tier (`HIGH` > `MEDIUM` > `LOW`), then `firmName`**. The tier comes from `firmConfidenceTier` over the cached email/phone provenance.
- If a user is signed in and results came back, a `SEARCHED` activity row is logged (best-effort); zero-result searches are not logged.
- Success: `{ query: { zip, normalizedZip }, results: Prospect[] }`. Missing/invalid ZIP: `400 { error }`. Research failure: `200 { query, results: [], warning }`. Unexpected: `500 { error }`.
- No auth required; the only user data it touches is the optional `SEARCHED` activity log. The `Prospect` shape is in `src/types/prospect.ts`.

### Auth (public)
**`POST /api/auth/request-code`** — body `{ email }`.
- Always returns `{ ok: true }` (even on bad/missing email or internal error), so it can't reveal who has an account.
- Upserts an **active** user (signup is open / self-serve), then, if the email is under 5 codes in the last hour and outside a 60-second cooldown, creates a hashed **6-digit** code (10-minute expiry) and emails it via Resend.

**`POST /api/auth/verify-code`** — body `{ email, code }`.
- Returns `{ ok: true }` on success, `{ ok: false }` on any failure (all HTTP `200`).
- Looks up the latest unused code and checks it (max 5 attempts, unused, unexpired, hash match; a mismatch increments the attempt count), marks it used, then requires an **active** user (`isActive` is the ban switch, enforced here). On success it creates a session (random 32-byte token stored hashed), sets an **HttpOnly** session cookie (30-day lifetime), and records `lastLoginAt`.

**`POST /api/auth/sign-out`**
- Deletes the session row (if any) and clears the cookie. Returns `{ ok: true }`, and still clears the cookie even if the DB call fails.

### Leads (private — auth required)
**`GET /api/leads`**
- Signed out: `200 { signedIn: false, firmIds: [] }`. Signed in: `{ signedIn: true, firmIds: string[] }` (the user's saved firm IDs). Error: `500 { error }`.

**`POST /api/leads`** — body `{ firmId }` or `{ firmIds: string[] }`.
- `401 { error: "Unauthorized" }` if not signed in. Saving is idempotent (`upsert` on `[userId, firmId]`). Single → `{ ok: true, saved: true }`. Batch → `{ ok: true, saved: <count> }`. Bad input → `400 { error }`.
- Logs activity (best-effort): a single save writes a `SAVED` row for that firm; a batch collapses into one `SAVED` row with `count` set.

**`DELETE /api/leads`** — body `{ firmId }` or `{ firmIds: string[] }`.
- Note: this takes a JSON **body** on `/api/leads`, not a `/{id}` path. `401` if not signed in. Removal is idempotent (`deleteMany`). Single → `{ ok: true, saved: false }`. Batch → `{ ok: true, removed: <count> }`.

**`PATCH /api/leads`** — body `{ firmId, status }`.
- Updates a saved lead's pipeline status. `status` is parsed by `parseLeadStatus` and must resolve to `ACTIVE`, `WON`, or `LOST`. `401` if not signed in; `400` on invalid/missing status or bad input. Success → `{ ok: true, status }`.
- A `WON` or `LOST` transition logs the matching activity row (best-effort).
- The user always comes from the session; a user can only touch their own leads, and global `Firm` rows are never modified by save, remove, or status change.

**`POST /api/leads/enrich`** — body `{ firmId }`. (`maxDuration = 60`.)
- The save-triggered deep email pass. `401` if not signed in; `400` on invalid JSON or missing `firmId`; `403` if the firm isn't one the caller has saved; `404` if the firm doesn't exist.
- `enrichDecision(firm.email, firm.emailCheckedAt)` then decides: an existing useful email → `{ ok: true, email, cached: true }`; a firm checked within the 30-day cooldown → `{ ok: true, email: null, cached: true }`; otherwise it fetches the contact page, updates `Firm.email` / `Firm.emailCheckedAt`, and returns `{ ok: true, email }`.

### Searches (private — auth required)
**`GET /api/searches/recent`**
- Signed out: `200 { searches: [] }`. Signed in: `{ searches }` — the user's recent, de-duplicated search ZIPs (derived from the `Activity` log), used for the recent-search chips on the home and dashboard. Error: `500 { error }`.

### Feedback (public; attribution optional)
**`POST /api/feedback`** — body `{ choice, message? }`.
- `choice` is **required** and must be one of: `"More emails"`, `"Faster search"`, `"Better save & export"`, `"Something else"`. `message` is optional, max 1000 characters.
- Writes a `Feedback` row (`choice`, `message`, `userId`); `userId` comes from the session if signed in, else `null` (anonymous). **There is no email field on feedback.**
- Success: `{ ok: true }`. Invalid input: `400 { error }`. Save failure: `500 { error: "Failed to save feedback" }`.

## Not built (roadmap)
- **Admin / data-fetching routes:** none; enrichment runs inline on a search cache-miss (see [data-pl-cur.md](data-pl-cur.md)). The save-triggered email pass (`/api/leads/enrich`) is the only out-of-search enrichment, and it's shipped.
- **Scheduled re-check / background enrichment routes:** not built; they wait on the background engine (see [roadmap.md](roadmap.md) and [data-pl-fut.md](data-pl-fut.md)).
- **User-private lead overrides:** the edit-your-own-lead route is the next workspace-layer addition (nullable columns on `SavedLead` or a small edit table, read-time precedence), not yet built.

## Stop conditions (when not to add or extend a route)
Don't ship a route that: isn't in `tasks/current-task.md`; triggers external fetching without a documented pass; mixes global and private data; trusts a client `userId` for private data; silently overwrites existing global data; or has an undefined request/response shape.