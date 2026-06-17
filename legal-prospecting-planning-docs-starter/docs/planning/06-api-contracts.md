# API Contracts

## Purpose

This document defines the planned API boundaries for the legal prospecting app rebuild.

The goal is to make route behavior clear before implementation.

No API route should be added unless it supports the current task in:

```text
task/current-task.md
```

This file is a plan, not an implementation.

---

## Current API Status

Current status:

```text
API implementation is not approved yet.
```

The project should first complete:

1. planning/control docs
2. basic app shell
3. database plan
4. seed data direction

API routes should be added only when a product task requires them.

---

## API Design Principles

Keep APIs simple and boring.

Prefer:

- clear route names
- small request bodies
- predictable response shapes
- explicit error messages
- server-side validation
- user-scoped private data
- no hidden external fetching
- no automatic overwrites

Avoid:

- over-abstracted APIs
- large multi-purpose endpoints
- routes that mix global and private data
- routes that trigger external fetching without approval
- routes that silently mutate data
- auth routes before auth is the approved task

---

## Core Product Flow

The first product flow is:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

This flow may be implemented without API routes at first if the app uses local seed data.

If API routes are added for this flow, they should stay small and read-only.

---

## Global vs Private API Rule

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

### Global Data Routes

Global data routes may return shared research data such as:

- firms
- attorneys
- practice areas
- ZIP research
- source metadata

These routes do not create private user workflow records.

### Private User Routes

Private routes must require a signed-in user once auth exists.

Private user routes may return or modify:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Private routes must always scope data by the current user.

Never trust a client-provided `userId` for private data access.

---

## Response Shape

Use a simple consistent response shape.

### Successful Response

```json
{
  "ok": true,
  "data": {}
}
```

For lists:

```json
{
  "ok": true,
  "data": []
}
```

Optional metadata:

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "count": 0
  }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable error message."
  }
}
```

Errors should be understandable but not leak sensitive details.

---

## HTTP Status Guidelines

Use common status codes.

```text
200 OK — successful read or update
201 Created — successful create
400 Bad Request — invalid input
401 Unauthorized — not signed in
403 Forbidden — signed in but not allowed
404 Not Found — resource not found
409 Conflict — duplicate or conflicting request
429 Too Many Requests — rate limited
500 Internal Server Error — unexpected server error
```

Do not return `200 OK` for errors.

---

## Validation Guidelines

Validate all API input on the server.

Do not rely on frontend-only validation.

Validate:

- required fields
- ZIP code format
- IDs
- email format
- enum values
- string lengths
- empty strings
- unexpected fields where needed

For early ZIP search, validate:

```text
ZIP must be 5 digits.
```

Later, ZIP+4 or radius search can be considered separately.

---

## MVP API Contracts

These routes are only needed if the app uses API routes for the seeded search flow.

They should be read-only.

---

## GET `/api/prospects`

### Purpose

Return law firm prospects matching a ZIP code.

### Status

Planned / MVP candidate.

### Auth Required

```text
No, not for the first seeded-data MVP.
```

This may change later if the product requires sign-in before search.

### Query Parameters

| Name | Type | Required | Notes |
|---|---|---:|---|
| `zip` | string | yes | 5-digit ZIP code |

### Example Request

```http
GET /api/prospects?zip=19103
```

### Success Response

```json
{
  "ok": true,
  "data": [
    {
      "id": "firm_001",
      "firmName": "Example Law Group",
      "website": "https://example.com",
      "phone": "555-555-5555",
      "email": "contact@example.com",
      "streetAddress": "123 Market St",
      "city": "Philadelphia",
      "state": "PA",
      "zipCode": "19103",
      "practiceAreas": ["Personal Injury", "Employment Law"],
      "attorneyNames": ["Jane Smith", "John Doe"],
      "sourceLabel": "Manual seed data",
      "sourceUrl": null,
      "confidenceLevel": "Manual seed"
    }
  ],
  "meta": {
    "count": 1,
    "zip": "19103"
  }
}
```

### Empty Response

```json
{
  "ok": true,
  "data": [],
  "meta": {
    "count": 0,
    "zip": "99999"
  }
}
```

### Error Responses

Invalid ZIP:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_ZIP",
    "message": "Enter a valid 5-digit ZIP code."
  }
}
```

### Behavior Rules

- This route should not trigger external fetching.
- This route should not save recent ZIPs during MVP.
- This route should not create saved leads.
- This route should only read controlled seed/global data.
- Empty results are not errors.

---

## GET `/api/prospects/:id`

### Purpose

Return detail for one law firm prospect.

### Status

Planned / MVP candidate.

### Auth Required

```text
No, not for the first seeded-data MVP.
```

This may change later.

### Path Parameters

| Name | Type | Required | Notes |
|---|---|---:|---|
| `id` | string | yes | Prospect/firm ID |

### Example Request

```http
GET /api/prospects/firm_001
```

### Success Response

```json
{
  "ok": true,
  "data": {
    "id": "firm_001",
    "firmName": "Example Law Group",
    "website": "https://example.com",
    "phone": "555-555-5555",
    "email": "contact@example.com",
    "streetAddress": "123 Market St",
    "city": "Philadelphia",
    "state": "PA",
    "zipCode": "19103",
    "practiceAreas": ["Personal Injury", "Employment Law"],
    "attorneyNames": ["Jane Smith", "John Doe"],
    "sourceLabel": "Manual seed data",
    "sourceUrl": null,
    "confidenceLevel": "Manual seed",
    "notes": "Sample seeded prospect for local search testing."
  }
}
```

### Error Response

Not found:

```json
{
  "ok": false,
  "error": {
    "code": "PROSPECT_NOT_FOUND",
    "message": "Prospect not found."
  }
}
```

### Behavior Rules

- This route should not trigger enrichment.
- This route should not modify the prospect.
- This route should not create user workflow data.
- Missing optional fields should return `null`, empty arrays, or be omitted consistently.

---

## Future Auth API Contracts

Auth is delayed.

Do not implement these routes until auth is the approved current task.

Preferred auth direction:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

---

## POST `/api/auth/request-code`

### Purpose

Request a one-time email login code.

### Status

Future / Not MVP.

### Auth Required

No.

### Request Body

```json
{
  "email": "user@example.com"
}
```

### Success Response

Use a generic response to reduce account enumeration risk.

```json
{
  "ok": true,
  "data": {
    "message": "If this email is approved, a sign-in code will be sent."
  }
}
```

### Error Responses

Invalid email:

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_EMAIL",
    "message": "Enter a valid email address."
  }
}
```

Rate limited:

```json
{
  "ok": false,
  "error": {
    "code": "RATE_LIMITED",
    "message": "Too many attempts. Try again later."
  }
}
```

### Behavior Rules

- Do not reveal whether an email is allowlisted.
- Do not send codes to non-allowlisted emails.
- Rate limit requests.
- Do not store plain text codes if codes are stored.
- Do not add until Resend/domain/env setup is approved.

---

## POST `/api/auth/verify-code`

### Purpose

Verify a one-time email login code and create a session.

### Status

Future / Not MVP.

### Auth Required

No.

### Request Body

```json
{
  "email": "user@example.com",
  "code": "123456"
}
```

### Success Response

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "user_001",
      "email": "user@example.com"
    }
  }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "INVALID_OR_EXPIRED_CODE",
    "message": "The code is invalid or expired."
  }
}
```

### Behavior Rules

- Code must be one-time use.
- Code must expire.
- Successful verification sets an HttpOnly session cookie.
- Never return the session secret in JSON.
- Failed attempts should be limited.

---

## POST `/api/auth/sign-out`

### Purpose

Sign out the current user.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Request Body

```json
{}
```

### Success Response

```json
{
  "ok": true,
  "data": {
    "message": "Signed out."
  }
}
```

### Behavior Rules

- Clear the session cookie.
- Invalidate the server-side session if sessions are stored.
- Should be safe to call more than once.

---

## GET `/api/auth/me`

### Purpose

Return the current signed-in user.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Success Response

```json
{
  "ok": true,
  "data": {
    "user": {
      "id": "user_001",
      "email": "user@example.com"
    }
  }
}
```

### Error Response

```json
{
  "ok": false,
  "error": {
    "code": "UNAUTHORIZED",
    "message": "Sign in required."
  }
}
```

---

## Future Saved Leads API Contracts

Saved leads are delayed until auth exists.

A saved lead is private user workflow data.

Core rule:

```text
A saved lead belongs to one user.
```

Do not implement saved leads until:

- auth exists
- user model exists
- database plan defines private ownership
- `task/current-task.md` explicitly scopes saved leads

---

## GET `/api/saved-leads`

### Purpose

Return the signed-in user's saved leads.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Success Response

```json
{
  "ok": true,
  "data": [
    {
      "id": "saved_001",
      "firmId": "firm_001",
      "firmName": "Example Law Group",
      "status": "Saved",
      "createdAt": "2026-06-16T00:00:00.000Z"
    }
  ]
}
```

### Behavior Rules

- Return only the current user's saved leads.
- Do not accept `userId` from the client.
- Scope by session user on the server.

---

## POST `/api/saved-leads`

### Purpose

Save a prospect as a lead for the signed-in user.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Request Body

```json
{
  "firmId": "firm_001"
}
```

### Success Response

```json
{
  "ok": true,
  "data": {
    "id": "saved_001",
    "firmId": "firm_001",
    "status": "Saved"
  }
}
```

### Error Responses

Already saved:

```json
{
  "ok": false,
  "error": {
    "code": "ALREADY_SAVED",
    "message": "This prospect is already saved."
  }
}
```

Not found:

```json
{
  "ok": false,
  "error": {
    "code": "PROSPECT_NOT_FOUND",
    "message": "Prospect not found."
  }
}
```

### Behavior Rules

- Do not create duplicate saved leads for the same user and firm.
- Do not allow saving as another user.
- Do not modify global firm data.

---

## DELETE `/api/saved-leads/:id`

### Purpose

Remove a saved lead for the signed-in user.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Success Response

```json
{
  "ok": true,
  "data": {
    "message": "Saved lead removed."
  }
}
```

### Behavior Rules

- User can only delete their own saved lead.
- Do not delete the global firm record.
- Deleting a saved lead should not affect other users.

---

## Future Recent ZIP API Contracts

Recent ZIPs are delayed until auth and user-specific behavior are stable.

Core rule:

```text
A recent ZIP belongs to one user.
```

Do not implement early.

Recent ZIP behavior caused confusion in the previous app.

---

## GET `/api/recent-zips`

### Purpose

Return the signed-in user's recent ZIP searches.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Success Response

```json
{
  "ok": true,
  "data": [
    {
      "zipCode": "19103",
      "searchedAt": "2026-06-16T00:00:00.000Z"
    }
  ]
}
```

### Behavior Rules

- Return only the current user's recent ZIPs.
- Do not show another user's search history.
- Sort by most recent first.

---

## POST `/api/recent-zips`

### Purpose

Record a valid ZIP search for the signed-in user.

### Status

Future / Not MVP.

### Auth Required

Yes.

### Request Body

```json
{
  "zipCode": "19103"
}
```

### Success Response

```json
{
  "ok": true,
  "data": {
    "zipCode": "19103",
    "searchedAt": "2026-06-16T00:00:00.000Z"
  }
}
```

### Behavior Rules

- Record only valid ZIP searches.
- Scope to the current user.
- Avoid duplicates where possible.
- Define max recent ZIP count before implementation.
- Test reload and user-switching behavior.

---

## Future Data Fetching API Contracts

External data fetching is not approved yet.

Do not add routes that trigger scraping, enrichment, provider calls, browser automation, or AI research until documented in:

```text
docs/03-data-fetching-plan.md
```

Any future data-fetching route must define:

1. trigger
2. input
3. source
4. exact prompt, query, or API request
5. pass number
6. output fields
7. confidence and source quality
8. save behavior
9. overwrite behavior
10. cost and rate-limit risk

---

## Future Admin Route Pattern

If external fetching is added later, prefer admin/manual routes at first.

Example future route:

```http
POST /api/admin/fetch-runs
```

Status:

```text
Future / Not approved.
```

This should not be public.

This should not run automatically during normal ZIP search.

---

## No Automatic Fetching From MVP Search

Early rule:

```text
GET /api/prospects?zip=XXXXX must not trigger external fetching.
```

It should only read controlled data.

This prevents search from becoming expensive, slow, unpredictable, or hard to debug.

---

## Error Code List

Use stable error codes.

Possible early codes:

```text
INVALID_ZIP
PROSPECT_NOT_FOUND
INVALID_REQUEST
UNAUTHORIZED
FORBIDDEN
RATE_LIMITED
INTERNAL_ERROR
```

Possible future auth codes:

```text
INVALID_EMAIL
INVALID_OR_EXPIRED_CODE
EMAIL_NOT_ALLOWED
SESSION_EXPIRED
```

Possible future saved lead codes:

```text
ALREADY_SAVED
SAVED_LEAD_NOT_FOUND
```

Possible future data-fetching codes:

```text
FETCH_PASS_NOT_APPROVED
SOURCE_UNAVAILABLE
PROVIDER_RATE_LIMITED
FETCH_RUN_FAILED
```

Do not expose raw provider errors directly to users.

---

## Pagination

MVP seeded search probably does not need pagination.

If result counts grow, use simple pagination.

Potential query params later:

```text
limit
offset
```

or:

```text
cursor
limit
```

Do not add pagination until result sizes require it.

---

## Sorting and Ranking

MVP search can use simple deterministic ordering.

Possible early order:

1. exact ZIP match
2. firm name alphabetical

Do not add AI ranking or scoring during MVP.

Future ranking should be documented before implementation.

---

## API Testing Notes

When routes are implemented, the coding agent should explain:

- which route to test
- what request to make
- what successful response looks like
- what error response looks like
- what manual browser behavior to verify

The human runs commands.

The coding agent should not run tests by default.

---

## API Task Readiness Checklist

An API route is ready to implement only when:

- route is listed in this file or added here first
- route is needed for the current task
- `task/current-task.md` explicitly includes it
- request shape is clear
- response shape is clear
- auth requirement is clear
- data ownership is clear
- external fetching behavior is clear
- validation rules are clear
- test/verification steps are clear

If these are not true, the route is not ready.

---

## Stop Conditions

Stop API work if:

- the route is not in `task/current-task.md`
- the route triggers external fetching without approval
- the route mixes public/global data with private user data
- the route accepts `userId` from the client for private data
- the route silently overwrites existing data
- auth behavior is unclear
- database schema required by the route is unclear
- the route is doing too many things
- errors or response shapes are undefined

---

## Current Decision

The current API decision is:

```text
Delay API implementation until needed.
Use simple read-only prospect routes for MVP if API routes are useful.
Do not add auth, saved leads, recent ZIPs, or external fetching APIs early.
Keep global research data separate from private user workflow data.
```

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/07-testing-guide.md
```

That file should explain how the human should run and interpret checks, tests, and manual verification.