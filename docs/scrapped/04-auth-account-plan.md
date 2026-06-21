# Auth and Account Plan

## Purpose

This document defines the intended authentication and account direction for the legal prospecting app rebuild.

Auth should not be built first.

This file exists so the project does not repeat the confusion from the previous Clerk/auth work.

---

## Current Auth Status

Current status:

```text
Auth is not approved for implementation yet.
```

The rebuild should begin with:

1. project control docs
2. app shell
3. database foundation
4. manual seed data
5. ZIP search against seed data

Auth should come later, after the app has a stable foundation.

---

## Core Auth Decision

Do not use Clerk unless the human user explicitly changes direction.

Preferred future auth model:

```text
custom email-code auth
Resend
verified custom domain
HttpOnly session cookie
email allowlist
10-50 users
```

No passwords.

No OAuth.

No teams.

No organizations.

No billing.

No enterprise auth.

---

## Why Auth Is Delayed

The previous app became confusing partly because auth work mixed with:

- saved leads
- Recent ZIP behavior
- user switching
- reload behavior
- Clerk account state
- database ownership
- private vs. global data rules

This rebuild should not start there.

The app should first prove the core prospecting flow:

```text
User enters ZIP code → app shows matching seeded law firm prospects → user reviews result details.
```

That flow does not require auth.

---

## Intended User Model

The app is expected to serve a small controlled group at first.

Expected early user count:

```text
10-50 users
```

Users are likely sales reps or internal testers.

The first auth system should be designed for a small approved-user workflow, not a public self-serve SaaS product.

---

## Account Access Model

Preferred access model:

```text
Email allowlist
```

Only approved email addresses can sign in.

A user should not be able to create an account just by visiting the app.

### In Scope Later

- approved email list
- one-time email login code
- session cookie
- sign out
- private user identity
- private saved leads later
- private recent ZIPs later
- private notes/statuses/tasks later

### Out of Scope

- public sign-up
- username/password accounts
- OAuth login
- Google login
- Microsoft login
- Clerk
- organizations
- teams
- roles/permissions beyond basic allowlist
- billing
- paid plans
- enterprise SSO

---

## Preferred Sign-In Flow

Future login flow:

1. User enters email address.
2. App checks whether email is on allowlist.
3. If allowed, app sends a one-time code by email.
4. User enters the code.
5. App verifies the code.
6. App creates a secure HttpOnly session cookie.
7. User is signed in.
8. User can sign out.

The flow should not require a password.

---

## Email Code Rules

When implemented later, the email code system should consider:

- short expiration window
- one-time use
- rate limiting
- resend limits
- generic error messages
- no account enumeration
- secure random code generation
- hashed code storage if codes are stored
- audit-friendly login records if needed

Example behavior:

```text
If an email is not allowed, do not reveal too much.
Show a generic message like: If this email is approved, a code will be sent.
```

Exact copy can be decided later.

---

## Session Rules

Preferred session model:

```text
HttpOnly session cookie
```

Session requirements later:

- cookie is HttpOnly
- cookie is secure in production
- cookie has SameSite protection
- session can expire
- sign out clears session
- session identifies one user
- private user data is queried by user ID

Do not store sensitive session state in localStorage.

---

## Resend Direction

Preferred email provider:

```text
Resend
```

Resend should only be added when auth implementation is approved.

Before adding Resend, document:

- why it is needed
- required environment variables
- verified sending domain
- from address
- local development behavior
- production behavior
- failure behavior
- rate limits or cost concerns

Do not install or configure Resend during early planning or app shell work.

---

## Environment Variables Later

Potential future environment variables:

```text
RESEND_API_KEY
AUTH_EMAIL_FROM
AUTH_SESSION_SECRET
AUTH_SESSION_COOKIE_NAME
APP_BASE_URL
```

These names are placeholders.

The actual names should be confirmed during the auth task.

Do not create real secrets in committed files.

Use `.env.example` for placeholders only.

---

## User Data Ownership

Auth exists mainly to support private user workflow data.

Private/user-specific data may include:

- saved leads
- recent ZIP searches
- notes
- statuses
- tasks
- follow-up reminders

Global/shared research data may include:

- ZIP code research
- firm records
- attorney records
- practice areas
- source records
- cached ZIP results

Core rule:

```text
Global research data can be shared.
User workflow data must be private.
```

Auth implementation must support that split.

---

## User Table Direction

The database plan will define the final schema.

A simple future user model may include:

- `id`
- `email`
- `createdAt`
- `updatedAt`
- `lastLoginAt`
- `isActive`

Potential allowlist model:

- `id`
- `email`
- `createdAt`
- `createdBy`
- `isActive`

Potential login code model:

- `id`
- `email`
- `codeHash`
- `expiresAt`
- `usedAt`
- `createdAt`
- `attemptCount`

Potential session model:

- `id`
- `userId`
- `expiresAt`
- `createdAt`
- `lastSeenAt`

These are planning notes, not final schema.

The final database design belongs in:

```text
docs/05-database-plan.md
```

---

## Private Data Access Rules

When auth exists, private data queries must always be scoped to the current user.

Examples:

```text
Saved leads must be filtered by userId.
Recent ZIPs must be filtered by userId.
Notes must be filtered by userId.
Statuses must be filtered by userId.
Tasks must be filtered by userId.
```

The app should never show one user's private workflow data to another user.

---

## Public vs. Protected Routes

Early app routes can be public if they only show seed/global data.

Future route categories:

### Public Routes

Potential examples:

- home page
- login page
- request code page
- verify code page

### Protected Routes

Potential examples:

- saved leads
- recent ZIPs
- notes
- statuses
- user dashboard
- account page

### Mixed Routes

The ZIP search page may begin public during seed-data MVP.

Later it may become protected if product direction requires users to sign in before searching.

This decision should be revisited after the MVP search flow exists.

---

## What Auth Should Not Do Yet

Do not add auth to solve problems that do not require auth.

Auth should not be used as a shortcut for:

- project structure
- search functionality
- seed data
- firm detail display
- database planning
- data-fetching control
- UI layout

Build those first.

---

## Saved Leads Dependency

Saved leads should wait until auth exists or until a deliberate temporary local-only design is approved.

Preferred later rule:

```text
A saved lead belongs to one user.
```

Saved lead implementation should not begin until:

1. user model exists
2. session model exists
3. database plan defines private ownership
4. API contracts define user-scoped access

---

## Recent ZIP Dependency

Recent ZIPs should wait until auth/user identity exists.

Preferred later rule:

```text
A recent ZIP belongs to one user.
```

Recent ZIP implementation should not begin until:

1. auth exists
2. user-specific database model exists
3. reload behavior is defined
4. user switching behavior is defined
5. manual verification steps are clear

Reason:

Recent ZIP behavior caused confusion in the previous app.

---

## Security Notes

When auth is eventually implemented, consider:

- session fixation protection
- secure cookie settings
- CSRF risk depending on architecture
- rate limiting login attempts
- rate limiting code requests
- generic auth messages
- server-side user checks
- never trusting client-only user IDs
- avoiding sensitive data in localStorage
- not committing secrets
- validating all route access on the server

This app does not need enterprise security architecture at first, but it must not be careless with private user workflow data.

---

## Auth Implementation Readiness Checklist

Auth is ready to implement only when all of these are true:

- `docs/04-auth-account-plan.md` exists.
- `docs/05-database-plan.md` defines user/session/private data tables.
- `docs/06-api-contracts.md` defines auth routes.
- `docs/07-testing-guide.md` explains how auth will be checked.
- `task/current-task.md` explicitly scopes the auth task.
- The human user approves auth as the current task.
- Resend setup requirements are understood.
- Required environment variable names are documented.
- The app has a basic shell and data flow already.

If these are not true, auth is not ready.

---

## Future Auth Task Scope

When auth is eventually implemented, keep the first auth task small.

Possible first auth task:

```text
Add basic custom email-code auth skeleton without saved leads or recent ZIPs.
```

Allowed in that task later:

- auth route placeholders
- email allowlist model
- login code model
- session cookie helper
- sign-in page
- sign-out behavior
- `.env.example` updates

Not allowed in that same task:

- saved leads
- recent ZIPs
- notes
- statuses
- dashboard buildout
- external fetching
- billing
- teams
- organizations

---

## Manual Verification Later

When auth is implemented, the human should verify:

1. Allowed email can request a code.
2. Disallowed email does not gain access.
3. Valid code signs in.
4. Expired code does not sign in.
5. Used code cannot be reused.
6. Sign out works.
7. Protected page redirects when signed out.
8. Protected page loads when signed in.
9. Private data is scoped to the signed-in user.

Exact verification steps should be written during the auth implementation task.

---

## Testing Notes Later

Potential tests later:

- allowlist check
- code expiration
- code one-time use
- session creation
- session lookup
- sign-out behavior
- protected route behavior
- private data user scoping

Testing should be explained before commands are suggested.

The human runs commands and pastes results back when needed.

---

## Stop Conditions

Stop auth work if:

- Clerk is added without explicit approval
- OAuth is added without explicit approval
- password auth is added without explicit approval
- teams/organizations are added without explicit approval
- billing is added
- saved leads are mixed into the first auth task
- Recent ZIPs are mixed into the first auth task
- database schema changes are unclear
- destructive database commands seem necessary
- session behavior is unclear
- private data scoping is unclear

---

## Current Decision

The current auth decision is:

```text
Delay auth.
Do not use Clerk by default.
Prefer custom email-code auth later.
Keep first implementation small.
```

---

## Next Recommended File

After this file is saved, fill in:

```text
docs/05-database-plan.md
```

That file should define the global/private data split and safe database strategy before Prisma or schema work begins.