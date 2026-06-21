# 05 — Database Plan (revised 2026-06-18)

## 1. Purpose
Defines the database architecture, ownership boundaries, and safe sequencing for the Legal Prospector app. Originally written to guide the move from static seed data to persistence; now also governs the **normalization phase** (extracting the flat `Firm` table into related tables) and documents the future data-app schema. Goals: prevent migration drift, forbid destructive commands, keep a clean split between the shared firm corpus and private user data, and keep the schema additive.

---

## 2. Current State (LIVE)
The database is implemented and in production — this is no longer client-side seed data.
- **Stack:** Neon Postgres + Prisma, deployed on Vercel. Local dev and prod **share one Neon database** (so any migration hits prod immediately — additive-only matters even more here).
- **Implemented:** a single flat `Firm` table (schema in §11), populated by the live research engine (see `docs/03-data-fetching-plan.md`). Cache-first: a ZIP query reads `Firm`; on a miss it runs research, saves, and re-queries; `?refresh=true` forces a re-run.
- **Save path:** `src/lib/db/saveResearchFirms.ts` maps engine firms → `Firm` rows, dedupes by `[zip, firmName]` (findFirst → merge, never demoting an existing record), runs `sanitizeFirm` (strips NUL/C0 control chars — fixes Postgres 22021), and isolates each firm write in try/catch so one bad record can't abort the batch.
- **Not yet built:** auth, user-scoped tables, and the normalized `Attorney` / `PracticeArea` tables (in progress — §8).
- The original "seed data first" step was skipped in favor of going straight to live research (recorded in `decisions.md`, 2026-06-18).

---

## 3. MVP Stack — Neon Postgres + Prisma
Unchanged and confirmed in production. Neon: serverless provisioning, branching, pooling, generous free tier. Prisma: TypeScript types, readable `schema.prisma`, automated migrations, generated client. Aligns with what the developer is learning.

## 4. What Can Be Revisited Later
Still the MVP/learning stack, not a permanent commitment. Re-evaluate if we hit high serverless cost/scaling limits, cold-start latency, advanced geospatial query needs, or multi-tenant routing needs.

---

## 5. Data Ownership Boundaries (governing principle — unchanged)
Strict separation between **shared canonical research data** and **private user workflow data**.
- **Shared/canonical** (source-of-truth corpus, belongs to no single user): firm facts, attorneys, practice areas, source/confidence metadata, cached ZIP results. Expected to be continuously enriched.
- **Private/user-scoped:** saved leads, recent ZIP searches, notes, statuses, tasks, reminders. Must never affect the canonical corpus or be visible to other users.

Core rule: *global research data can be shared; user workflow data must be private.* This drives schema, API, auth, and UI design.

---

## 6. Normalization: now the active phase (was the "scale path")
The original plan stored `practiceAreas` and `attorneys` as `String[]` for MVP simplicity, noting a future "scale path" to relation tables. **That scale path is now the current phase.** We normalize additively:
- `Attorney` — one-to-many off `Firm` (in progress).
- `PracticeArea` + `FirmPracticeArea` — many-to-many via a join table (next, after practice-area extraction is fixed in the data-fetching pipeline).

**Transition strategy (expand / contract):** keep the `String[]` columns, dual-write to both the arrays and the new tables, migrate reads to the tables later, drop the arrays last. Every migration additive; never destructive.

---

## 7. Table Map (current → planned → future)
Supersedes the earlier speculative model list. Canonical names; full ERD + fields live in `docs/schema.md`.
- **Live:** `Firm`
- **Normalizing now:** `Attorney`, `PracticeArea`, `FirmPracticeArea`
- **Workspace (after auth):** `User`, `Session`, `LoginCode`, `SavedLead`, `LeadActivity`, recent-ZIP history
- **Data-app (future):** `Zip` (research ledger), `ResearchRun`, `WebsiteCheck`, `Prediction`, `DataPoint` (per-field provenance)

**Naming reconciliation** (earlier drafts → standardized ERD name): `DataSource` / `SourceRecord` / `CandidateFieldValue` → `DataPoint` + `ResearchRun`; `ZipCode` → `Zip`; `SearchRun` / `SearchResult` / `RecentSearch` / `UserRecentZip` → recent-ZIP history; `LeadNote` / `LeadStatus` / `UserFirmNote` → `LeadActivity`.

**Ownership classification:** shared/canonical = `Firm`, `Attorney`, `PracticeArea`, `FirmPracticeArea`, `Zip`, `ResearchRun`, `WebsiteCheck`, `DataPoint`, `Prediction`. Private/user = `User`, `Session`, `LoginCode`, `SavedLead`, `LeadActivity`, recent ZIPs.

---

## 8. Current Schema + Planned Relations

Enums (live):
```prisma
enum ConfidenceLevel { HIGH MEDIUM LOW UNKNOWN }
enum VerificationStatus { CANDIDATE PENDING_REVIEW VERIFIED REJECTED STALE }
enum SourceType { BAR_DIRECTORY GOOGLE_MAPS WEB_SCRAPE MANUAL MANUAL_SEED }
```

`Firm` (live), with the relations being added during normalization:
```prisma
model Firm {
  id                 String   @id @default(uuid())
  firmName           String
  website            String?  // domain is the intended dedup key; not unique (multi-office)
  phone              String?
  email              String?
  streetAddress      String?
  city               String
  state              String
  zip                String   // @@index for fast ZIP queries
  zipExt             String?
  practiceAreas      String[] // keep during transition → PracticeArea/FirmPracticeArea
  attorneyCountRange String
  attorneys          String[] // keep during transition → Attorney
  sourceType         SourceType
  sourceUrl          String?
  confidenceLevel    ConfidenceLevel
  verificationStatus VerificationStatus
  lastCheckedDate    DateTime? @default(now())
  globalNotes        String?
  createdAt          DateTime  @default(now())
  updatedAt          DateTime  @updatedAt

  attorneyList       Attorney[]          // added now
  areaLinks          FirmPracticeArea[]  // added with practice-area phase

  @@index([zip])
}
```

Being added now (Attorney) and next (PracticeArea + join) — full definitions in `docs/schema.md` and the Attorney `current-task.md`:
```prisma
model Attorney {
  id     String @id @default(uuid())
  firmId String
  firm   Firm   @relation(fields: [firmId], references: [id], onDelete: Cascade)
  name   String
  email  String?   // null for now; attorney-level email is a later enrichment pass
  title  String?
  @@unique([firmId, name])  // idempotent upsert target
  @@index([firmId])
}
```

---

## 9. Migration Safety Rules (unchanged — still essential)
1. Reviewed, descriptively-named migrations (`--name add_attorney_table`); no blind pushes.
2. Human is the sole executor of migration commands; the agent only suggests + explains.
3. Audit migration SQL before running.
4. Because local and prod **share one Neon DB**, every migration applies to prod immediately — so migrations must be strictly additive.

## 10. Data-Loss Guardrails (unchanged)
Never run or suggest:
```bash
npx prisma db push --accept-data-loss
npx prisma migrate reset
```
On drift: inspect `_prisma_migrations`, explain the discrepancy in plain English, propose non-destructive alignment. Never use destructive commands to "fix" drift.

## 11. Environment Variables
- `DATABASE_URL` (Neon pooled), `DIRECT_URL` (direct, for migrations). Prisma 7 wires URLs in `prisma.config.ts`; `DIRECT_URL` lives in `.env`/`.env.example`.
- Also live: `OPENAI_API_KEY`, `TAVILY_API_KEY` (data pipeline — see `docs/03-data-fetching-plan.md`), optional `SEARCH_PROVIDER`.
- Secrets only in local `.env` (gitignored); `.env.example` has blank placeholders. Never commit real values.

---

## 12. Next Steps
1. **Attorney migration** (current task) — additive, dual-write.
2. **Fix practice-area extraction** (data-fetching pipeline) so the table has data.
3. **PracticeArea + FirmPracticeArea** migration.
4. *(after auth)* workspace tables: `User`, `Session`, `LoginCode`, `SavedLead`, `LeadActivity`, recent ZIPs.
5. *(future)* data-app tables: `Zip`, `ResearchRun`, `WebsiteCheck`, `Prediction`, `DataPoint`.

Each is its own additive, human-run, reviewable migration.