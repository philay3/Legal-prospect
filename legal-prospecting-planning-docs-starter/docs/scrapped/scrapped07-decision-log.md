# 07 — Decision Log

Use this file to record major project decisions.

## Decision Format

```markdown
## YYYY-MM-DD — Decision Title

**Decision:** What was decided.

**Why:** Reason for the decision.

**Alternatives Considered:** Other options.

**Impact:** What this changes.

**Status:** Proposed / Accepted / Reversed / Superseded
```

---

## 2026-06-15 — Use ZIP Code as Durable Firm Bucket

**Decision:** Firms should be durably owned by ZIP code rather than by a single search attempt.

**Why:** A ZIP represents the user's durable research area. A search is only one research attempt or event log.

**Alternatives Considered:** Treat each search as the durable owner of firms.

**Impact:** Future features should think in terms of `ZipCode -> Firm`, not `Search -> Firm`.

**Status:** Accepted

---

## 2026-06-15 — Keep Search UI Simple for v1

**Decision:** The search UI should be `Enter ZIP -> Search`.

**Why:** The app is for users who want results, not research-mode controls. Keeping the UI simple also helps bootcamp demo clarity.

**Alternatives Considered:** Expose quick/thorough modes, force refresh, deeper research toggle, or model selector.

**Impact:** Research behavior can be sophisticated behind the scenes, but the UI should stay simple.

**Status:** Accepted

---

## 2026-06-15 — Do Not Over-Filter Firm Results

**Decision:** Validation should reject obvious bad fits but keep plausible prospects when details are uncertain.

**Why:** It is better for v1 to include a few borderline leads than to remove useful firms because attorney count or firm size is unclear.

**Alternatives Considered:** Strictly filter out all firms without confirmed attorney count or single-office status.

**Impact:** Validation should be conservative and explainable.

**Status:** Accepted

---

## 2026-06-15 — Search Fixed and Now Working Better

**Decision:** Treat search as the current working baseline unless new evidence shows it has regressed.

**Why:** User clarified that search has been fixed and is performing much better.

**Alternatives Considered:** Continue treating search as the active emergency blocker.

**Impact:** Next work should focus on regression protection, source hardening, and controlled improvements rather than emergency repair.

**Status:** Accepted

---

## 2026-06-15 — One Feature or Bug Fix Per Coding-Agent Session

**Decision:** Each coding-agent session should handle exactly one feature or bug fix.

**Why:** Longer sessions caused scope drift and made review harder.

**Alternatives Considered:** Let coding agent bundle related improvements.

**Impact:** Planning docs and handoffs should stay small and focused.

**Status:** Accepted

---

## 2026-06-15 — No Destructive Database Commands

**Decision:** Do not run destructive DB commands or accept data loss.

**Why:** The app has useful firm/search/ZIP/contact data that should not be lost.

**Alternatives Considered:** Reset database or use destructive Prisma push during development.

**Impact:** Prefer additive migrations and explicit approval before schema changes.

**Status:** Accepted

---

## Template — Add New Decisions Below

## YYYY-MM-DD — [Decision Title]

**Decision:** 

**Why:** 

**Alternatives Considered:** 

**Impact:** 

**Status:** Proposed

## 2026-06-16 — Use Clerk for MVP Authentication

**Decision:** Use Clerk as the MVP authentication provider.

**Why:** Clerk provides the fastest safe path to real users, protected routes, and session handling.

**Alternatives Considered:** Custom Resend OTP auth, Better Auth + Resend OTP, fully custom auth.

**Impact:** MVP user-specific data uses Clerk user IDs.

**Status:** Accepted

---

## 2026-06-16 — Use Passwordless Email Code Auth

**Decision:** Configure Clerk to use passwordless email verification codes instead of password sign-in.

**Why:** The user prefers a fast email → 6-digit code flow and does not want users managing another password.

**Alternatives Considered:** Password auth, custom Resend OTP auth.

**Impact:** Auth UI should not encourage password login for the MVP.

**Status:** Accepted

---

## 2026-06-16 — Keep ZIP Research Global and User Workflow Private

**Decision:** ZIP research/results and firms remain globally reusable, while saved leads, dashboard data, and Recent ZIP history are user-specific.

**Why:** Shared research improves speed and avoids duplicate expensive searches, but sales workflow data must be private to each user.

**Alternatives Considered:** Make every ZIP result user-specific.

**Impact:** Data model uses shared `ZipCode`/`Firm` records plus user-owned tables like `UserSavedLead` and `UserRecentZip`.

**Status:** Accepted

---

## 2026-06-16 — Avoid Browser Automation Unless Requested

**Decision:** Coding agents should not use browser subagents or visual browser automation unless explicitly asked.

**Why:** Browser automation caused confusion during cross-account Recent ZIP debugging. The user should manually verify User A/User B behavior when needed.

**Alternatives Considered:** Let the coding agent use browser automation freely.

**Impact:** Coding-agent prompts should prefer code inspection, tests, API checks, and user-run manual verification steps.

**Status:** Accepted