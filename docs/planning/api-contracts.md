# API Contracts

> The app's HTTP surface as it stands today. For request *lifecycles* (what happens inside each call) see [architecture.md](architecture.md); for the field shapes returned, see [database.md](database.md). Exact request/response bodies should be confirmed against the route handlers in `src/app/api/**` — a few are marked *verify*, and pasting those files lets me lock them byte-exact.

## Principles (still enforced)
- **Global research data is shareable; user workflow data is private.** Firm / attorney / practice-area data is global. Saved leads are private, always scoped to one user.
- **Private routes derive the user from the session — never a client-supplied `userId`.** This is the backbone of the global/private split.
- **Validate every input server-side.** Never rely on frontend validation. (ZIP must normalize to a 5-digit base, else `400`.)
- **No hidden external fetching, no silent overwrites.** Enrichment runs only through the search pipeline; saves never mutate global `Firm` data.

## Conventions
- **Response envelope:** *[verify against a handler — the planning version assumed `{ ok, data }` / `{ ok, error }`; confirm what the routes actually return.]*
- **Status codes:** `200` read/update · `201` create · `400` invalid input · `401` not signed in · `403` not allowed · `404` not found · `409` conflict/duplicate · `429` rate limited · `500` server error. Never `200` for an error.
- **Error codes** (confirm the exact strings in the handlers): `INVALID_ZIP`, `INVALID_EMAIL`, `INVALID_OR_EXPIRED_CODE`, `EMAIL_NOT_ALLOWED`, `UNAUTHORIZED`, `ALREADY_SAVED`, `RATE_LIMITED`, `INTERNAL_ERROR`. Raw provider errors are never exposed to users.

## Routes — current

### Search (public)
**`GET /api/prospects/search?zip={zip}&refresh={bool}`**
Returns enriched firms for the ZIP. Cache-first — each ZIP is researched once; `?refresh=true` forces a re-run of the pipeline. Invalid ZIP → `400 INVALID_ZIP`. No auth; creates no user data. Results are ordered by confidence (`HIGH → MEDIUM → LOW → UNKNOWN`) then alphabetically by `firmName`. Firm fields are the `Firm` shape in [database.md](database.md). *[verify exact response envelope]*

### Auth (public)
**`POST /api/auth/request-code`** — body `{ email }`. Find-or-create the user, store a **hashed** one-time code (short expiry), send it via Resend. Returns a **deliberately generic** response so it can't be used to discover who has an account.
**`POST /api/auth/verify-code`** — body `{ email, code }`. Looks up an active user and an unexpired, unused code, creates a session, and sets an **HttpOnly** session cookie. `isActive` is enforced here — a deactivated user can't complete sign-in (the ban switch).
**`POST /api/auth/sign-out`** — clears the session. *[verify exact path]*

### Leads (private — auth required)
**`POST /api/leads`** — save firm(s) to the signed-in user's leads. The user comes from the session; no duplicate per `[user, firm]`; global `Firm` data is never modified.
**`DELETE /api/leads/{id}`** — remove one saved lead; a user can only delete their own. *[verify exact path/body]*
**`GET /api/leads`** — the user's saved leads. *[verify whether this route exists or leads load server-side on the dashboard]*

### Feedback
**`POST /api/feedback`** — body `{ message, email?, category? }`. Creates a `Feedback` row; the user link is optional/nullable, so feedback can be anonymous or account-tied. *[verify exact payload + path]*

## Not built (roadmap)
- **Recent ZIPs** (user-scoped search history) — planned, not implemented; not in the current schema.
- **Data-fetching admin routes** — there are none; enrichment runs inline on a search cache-miss (see [data-pipeline.md](data-pipeline.md)). A dedicated save-triggered email pass is the next addition (see [roadmap.md](roadmap.md)).

## Stop conditions (when not to add or extend a route)
Don't ship a route that: isn't in `tasks/current-task.md`; triggers external fetching without a documented pass; mixes global and private data; trusts a client `userId` for private data; silently overwrites existing data; or has an undefined request/response shape.