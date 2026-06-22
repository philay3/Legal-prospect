# API Contracts

> The app's HTTP surface, verified against the route handlers in `src/app/api/**`. For request lifecycles (what happens inside each call) see [architecture.md](architecture.md); for the firm field shapes see [database.md](database.md) and the `Prospect` type in `src/types/prospect.ts`.

## Principles (enforced in code)
- **Global research data is shareable; user workflow data is private.** Firm / attorney / practice-area data is global. Saved leads are per-user; feedback attribution is per-user but optional.
- **Private routes derive the user from the session (`getCurrentUser`), never from a client-supplied `userId`.** Confirmed in the leads and feedback handlers.
- **Validate every input server-side.** The search route normalizes the ZIP (`normalizeZipCode`); the auth routes validate email/code shape; leads and feedback validate body types.
- **Saves never mutate global `Firm` data.** Enrichment runs only through the search pipeline.

## Response and status conventions (as actually implemented)
There is **no single envelope**; shapes are per-route:
- **Auth routes always return HTTP `200` with `{ ok: boolean }`, even on failure.** This is deliberate: a generic response prevents account enumeration and credential probing.
- The search route returns `{ query, results }`; leads return `{ ok, saved }` or `{ signedIn, firmIds }`; feedback returns `{ ok: true }`.
- **Error responses are `{ error: "<human-readable message>" }` with a status** (`400`, `401`, `500`). There are **no machine error-code strings** (nothing like `INVALID_ZIP`).
- Status codes in use: `200` success, `400` invalid input/JSON, `401` not signed in (leads), `500` server error. The auth routes are the intentional exception to "never `200` on an error."

## Routes — current

### Search (public)
**`GET /api/prospects/search?zip={zip}&refresh={true|false}`**
- ZIP is normalized by `normalizeZipCode`: accepts a 5-digit code or ZIP+4, returns the 5-digit base; anything else is `400`.
- Cache-first: reads `Firm` rows for `searchZip`; on empty results or `refresh=true`, runs `runLeadResearch(zip, "thorough")`, saves via `saveResearchFirms`, then re-reads.
- Success: `{ query: { zip, normalizedZip }, results: Prospect[] }`. Results are ordered by confidence (HIGH → MEDIUM → LOW → everything else) then `firmName`.
- Missing/invalid ZIP: `400 { error: "..." }`. Research failure: `200 { query, results: [], warning }`. Unexpected: `500 { error }`.
- No auth; creates no user data. The `Prospect` shape is in `src/types/prospect.ts`.

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

**`DELETE /api/leads`** — body `{ firmId }` or `{ firmIds: string[] }`.
- Note: this takes a JSON **body** on `/api/leads`, not a `/{id}` path. `401` if not signed in. Removal is idempotent (`deleteMany`). Single → `{ ok: true, saved: false }`. Batch → `{ ok: true, removed: <count> }`.
- The user always comes from the session; a user can only touch their own leads. Global `Firm` rows are never modified.

### Feedback (public; attribution optional)
**`POST /api/feedback`** — body `{ choice, message? }`.
- `choice` is **required** and must be one of: `"More emails"`, `"Faster search"`, `"Better save & export"`, `"Something else"`. `message` is optional, max 1000 characters.
- Writes a `Feedback` row (`choice`, `message`, `userId`); `userId` comes from the session if signed in, else `null` (anonymous). **There is no email field on feedback.**
- Success: `{ ok: true }`. Invalid input: `400 { error }`. Save failure: `500 { error: "Failed to save feedback" }`.

## Not built (roadmap)
- **Recent ZIPs** (user-scoped search history): not implemented, not in the schema.
- **Admin / data-fetching routes:** none; enrichment runs inline on a search cache-miss (see [data-pipeline.md](data-pipeline.md)). A save-triggered email pass is the next addition (see [roadmap.md](roadmap.md)).

## Stop conditions (when not to add or extend a route)
Don't ship a route that: isn't in `tasks/current-task.md`; triggers external fetching without a documented pass; mixes global and private data; trusts a client `userId` for private data; silently overwrites existing data; or has an undefined request/response shape.