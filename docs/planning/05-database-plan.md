# 05 — Database Plan

## 1. Purpose

This document defines the database architecture, ownership boundaries, and safe execution sequencing for the Legal Prospector application. 

The primary goal of this plan is to establish the database direction for the MVP phase, ensuring the developer can transition from static frontend seed data to persistent storage safely. It defines rules to:
- Prevent Prisma schema and migration drift.
- Eliminate destructive database commands.
- Enforce clear boundaries between the shared canonical firm corpus and private user-scoped workflows.
- Outline the step-by-step rollout sequence for database features.

---

## 2. Current State

The application operates in a completely isolated client-side environment:
- **Seed Data:** Four fictional law firm records representing the test ZIP code `19103` are defined statically in [prospects.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/data/prospects.ts) and conform to the frontend `Prospect` interface.
- **Search UI:** Users enter a ZIP code, which is normalized (including ZIP+4) and validated, displaying search results or empty states based on client-side matching.
- **Interactions:** The search results cards allow toggling detailed fields (expand/collapse) and toggling saved state ("Save" / "Saved" UI status), which updates local React memory only.
- **Database & Auth:** Zero database connections, Prisma schemas, API routes, scraping mechanisms, or authentication integrations are present.
- **Deployment:** The current frontend shell is live at [https://legal-prospect.vercel.app](https://legal-prospect.vercel.app).

---

## 3. Chosen MVP Database Stack

For the initial MVP database implementation, the chosen stack is:
- **Database Hosting:** Neon Postgres (Serverless PostgreSQL)
- **ORM & Schema Modeling Layer:** Prisma

This stack is selected as the preferred learning and MVP foundation for this project.

---

## 4. Why Neon Postgres + Prisma for Now

- **Neon Postgres:** Offers instant serverless provisioning, branching capabilities (allowing separate databases for dev/staging/prod), built-in connection pooling, and a generous free tier.
- **Prisma:** Provides full TypeScript type safety, an easy-to-read schema language (`schema.prisma`), automated migration generation, and an auto-generated client that simplifies SQL interactions.
- **Developer Learning Path:** It aligns directly with the technologies the human developer wants to learn and master during this project phase.

---

## 5. What Can Be Revisited Later

This stack is selected specifically for the MVP and learning phase. It is not considered the permanent, final architecture for the life of the product. The stack may be re-evaluated and adjusted in the future if we encounter:
- High serverless compute costs or scaling limits under Neon.
- Cold start latency issues in serverless database connections.
- Advanced querying needs (e.g. complex geospatial operations) that could benefit from other ORMs or raw SQL libraries.
- The need for multi-tenant isolation that requires specialized DB routing.

---

## 6. Data Ownership Boundaries

We maintain a strict separation between objective, backend-managed canonical research data and subjective, private user-scoped workflows.

### Shared Internal Canonical Firm Database
The database includes a shared internal canonical firm database. This functions as the **internal source-of-truth corpus** containing all deduplicated, enriched law firm records.
- **Daily Scraping/Enrichment Needs:** Because this is a data-driven prospecting application, we expect daily automated crawler sweeps and enrichment processes to populate and maintain the canonical directory globally.
- **Purpose:** The canonical database is the master repository of law firm facts and discovery metadata. It does not belong to any single user.

### User/Session-Scoped Workflow Data
User-facing search actions, results, saved leads, and history are strictly isolated to individual users or sessions to protect private workspaces:
- **Search Scoping:** Results returned to a user must eventually be user/session-scoped.
- **Private Data:** A user's saved leads, personal notes, outreach statuses, tasks, reminders, and history of searches are strictly private. They must never affect the canonical corpus or be visible to other users.

---

## 7. Conceptual Partitioning: Canonical vs. Workflow Data

To ensure clean database schemas and prevent mixing concerns, entities are classified into two partitions:

### A. Canonical Data (Shared Corpus)
Objective, scraped, or audited attributes tracking facts about law firms.
- `Firm`: Canonical law firm record (name, website, normalized contact info, address, practice areas, size range, attorney lists).
- `DataSource`: Metadata tracking data discovery runs and credentials.
- **Associated Fields:** `website`, `phone`, `email`, `streetAddress`, `city`, `state`, `zip`, `zipExt`, `practiceAreas`, `attorneyCountRange`, `attorneys`, `sourceType`, `sourceUrl`, `confidenceLevel`, `verificationStatus`, `lastCheckedDate`, `globalNotes`.

### B. User/Session Workflow Data (Private Scoping)
Subjective annotations, settings, history logs, and pipelines managed by individual sales reps.
- `SearchRun`: Tracks search parameters (queried ZIP, search timestamp, userId).
- `SearchResult`: Junction model mapping a `SearchRun` to canonical `Firm` records, capturing what was visible to the user at the time of their search.
- `SavedLead`: Connects a user's account to a canonical `Firm` record, storing lead state.
- `LeadNote`: Private rep notes for outreach activities.
- `LeadStatus`: Custom pipeline markers (e.g., "Contacted").
- `RecentSearch`: Private list of ZIP codes searched by the user.

---

## 8. Planned Global/Shared Models

Conceptually, the shared database layer will utilize the following entities:
- `Firm`: Represents the physical law office location. Acts as the primary prospect record.
- `DataSource`: Tracks the origin of records (crawlers, Google maps, manual entries).
- `ZipCode`: Represents a postal ZIP code boundary, useful for proximity/distance expansions and caching counts.

### Normalization vs. Simplicity for MVP
For the first slice, we will prioritize simplicity over full database normalization:
- **Postgres Arrays:** Practice areas (`practiceAreas`) and attorney lists (`attorneys`) will be stored directly as string arrays (`String[]`) within the `Firm` table using PostgreSQL's native array support. 
- **Why?** This avoids introducing intermediate joint tables (`FirmPracticeArea`, `FirmAttorney`) early on. It simplifies database queries, speeds up initial development, and maps directly to our existing frontend typescript interfaces.
- **Scale Path:** If practice areas or individual attorneys later require rich relationships (e.g., tracking an attorney's license history or linking practice areas to taxonomy trees), we can extract them into separate relation tables during a future refactoring phase.

---

## 9. Planned Private/User-Specific Models

These models are fully deferred until user authentication and ownership structures are designed:
- `User`: Represents user accounts, emails, and active sessions.
- `SavedLead`: Connects a `User` to a global `Firm` record, enabling private lead lists.
- `UserFirmNote`: Stores private outreach notes created by a specific user for a specific firm.
- `UserRecentZip`: Persists a user's search history across devices and sessions.

> [!WARNING]
> Do not design or create schemas for private/user-specific tables until Phase 6 (Authentication) has been successfully finalized.

---

## 10. Suggested First Database Slice

The first database implementation slice must be kept simple and focus solely on the **canonical firm prospect directory**:
- **Goal:** Store canonical firm/prospect records in Neon Postgres first, replacing the static client-side `SEED_PROSPECTS` array.
- **Features Supported:**
  - Querying prospects by 5-digit base ZIP code directly from the canonical `Firm` table.
  - Returning fields matching the frontend `Prospect` structure.
- **Excluded:** Do not add saved leads, search history tracking, or user notes until auth and user ownership are planned.

---

## 11. Post-Authentication Search Result References

Once authentication and private data scoping are introduced:
- **No duplication:** Search results and query histories should be stored as user-scoped `SearchRuns` and `SearchResults` that link to the canonical `Firm` table via foreign keys.
- **Benefit:** This prevents duplicating firm data per user, saves database space, and ensures updates to canonical firm facts (e.g., corrected telephone numbers or practice areas) propagate automatically, while keeping the user's search history log private and fast.

---

## 12. Fields to Defer

The following fields and models are deferred to limit complexity and focus on search reliability first:
- All authentication and user session tables (`User`, `LoginCode`, `Session`, `AllowedEmail`).
- All user-specific interaction states (`SavedLead`, `UserFirmNote`, `UserRecentZip`, `SearchRun`, `SearchResult`).
- External scraping run trackers (`FetchRun`, `SourceRecord`, `CandidateFieldValue`).
- Multi-office mapping models (storing multiple physical locations per firm will be deferred; the MVP will treat each physical office address as an independent `Firm` entry).

---

## 13. Conceptual Prisma Model Sketch

Below is the planning-only sketch of the schema for the first global database slice:

> [!NOTE]
> This is a planning-only sketch. Do not implement these changes in the source code during this task.

```prisma
// Planning-only sketch. Do not implement in this task.

datasource db {
  provider  = "postgresql"
  url       = env("DATABASE_URL")
  directUrl = env("DIRECT_URL")
}

generator client {
  provider = "prisma-client-js"
}

enum ConfidenceLevel {
  HIGH
  MEDIUM
  LOW
  UNKNOWN
}

enum VerificationStatus {
  CANDIDATE
  PENDING_REVIEW
  VERIFIED
  REJECTED
  STALE
}

enum SourceType {
  BAR_DIRECTORY
  GOOGLE_MAPS
  WEB_SCRAPE
  MANUAL
  MANUAL_SEED
}

model Firm {
  id                 String             @id @default(uuid())
  firmName           String
  website            String?            @unique // Enforces domain deduplication
  phone              String?
  email              String?
  streetAddress      String?
  city               String
  state              String
  zip                String             // Indexed for fast ZIP queries
  zipExt             String?
  practiceAreas      String[]           // Native Postgres String Array
  attorneyCountRange String             // e.g. "1-2", "3-5", "6-10", "11-20", "21+"
  attorneys          String[]           // Native Postgres String Array
  sourceType         SourceType
  sourceUrl          String?
  confidenceLevel    ConfidenceLevel
  verificationStatus VerificationStatus
  lastCheckedDate    DateTime?          @default(now())
  globalNotes        String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([zip])
}
```

---

## 14. Environment Variables and Secrets Plan

To integrate Prisma and Neon, the project will conceptually require two environment variables:
- `DATABASE_URL`: Connection string pointing to the Neon transaction connection pooler (port 5432 or with pool query params) to manage serverless connection spikes.
- `DIRECT_URL`: Direct connection string pointing directly to Neon's database instance, bypassing connection pooling (required for running migrations safely).

### Secrets Protection Guidelines
- **No commits:** Under no circumstances should database credentials or real credentials be written to version control.
- **Config files:** Real values will only be stored in local `.env` files (which are ignored in `.gitignore`).
- **Templates:** A `.env.example` file containing blank placeholder keys will be provided for other developers.

---

## 15. Migration Safety Rules

Database migrations must be performed under strict guidelines to ensure system stability:
1. **Reviewed Migrations:** Generate and review migrations manually. Avoid blind pushes that bypass migration histories.
2. **Human Control:** The human developer is the sole executor of migration commands. The AI agent will only suggest and explain commands.
3. **Descriptive Naming:** Name migrations clearly to represent the exact schema change (e.g. `npx prisma migrate dev --name create_firm_table`).
4. **Staging Review:** Before running any production migration, the migration SQL files must be audited.

---

## 16. Data-Loss Guardrails

To prevent accidental data loss in the database:
- **Forbidden Commands:** Never run or suggest destructive reset commands:
  ```bash
  npx prisma db push --accept-data-loss
  npx prisma migrate reset
  ```
- **Migration Drift Resolution:** If the local schema drifts from the database state:
  1. Inspect the Prisma migration log table (`_prisma_migrations`).
  2. Explain the schema discrepancy in plain English.
  3. Propose manual adjustments to `schema.prisma` or database structures to align the environments without discarding data.
- **Backup Verification:** Recommend backing up seed data before running schema migrations.

---

## 17. Local Development and Human-Run Commands (Conceptual Only)

When the database implementation phase begins, the following sequence of commands will be recommended for the human developer to run:

1. **Install Dependencies:**
   ```bash
   npm install @prisma/client
   npm install -D prisma
   ```
2. **Initialize Prisma:**
   ```bash
   npx prisma init
   ```
3. **Generate First Migration (after editing `schema.prisma`):**
   ```bash
   npx prisma migrate dev --name init_firm_model
   ```
4. **Run Seed Script (after writing a seed function):**
   ```bash
   npx prisma db seed
   ```

---

## 18. Risks and Constraints

- **Neon Connection Limits:** Serverless environments can spawn many parallel database requests, exceeding Neon connection limits. Enforce Transaction connection pooling in Neon and configure pooling parameters in `DATABASE_URL`.
- **SQLite Incompatibility:** Local SQLite database files do not support Postgres-specific fields like native string arrays (`String[]`). Therefore, developers must connect to a local Postgres instance or a dedicated Neon development branch for all local development testing.
- **Freshness Stale Flags:** Automated crawlers must update the `lastCheckedDate` and toggle `verificationStatus` without wiping out manual review statuses.

---

## 19. Explicit Non-Goals for Now

The following actions are strictly out-of-scope for the current planning task:
- Installing Prisma or other npm packages.
- Creating or editing the `schema.prisma` file.
- Connecting to Neon or provisioning database branches.
- Editing the `.env` or setting up environment variables.
- Creating migration files or executing database migrations.
- Adding API endpoints or database query routes.
- Writing data scraping scripts or connection code.

---

## 20. Suggested Follow-Up Tasks

Upon approval of this database plan, the recommended sequence of next steps is:
1. **Phase 5.1: Initialize Prisma & Configure Connection:** Human installs Prisma, creates the schema template, and adds database connection URLs.
2. **Phase 5.2: Create Global Firm Model & Migrate:** Define the `Firm` model inside `schema.prisma` and execute the initial migration on Neon.
3. **Phase 5.3: Implement Database Seeding:** Write and run a database seeding script (`src/data/seed.ts`) that loads the mock prospects dataset into Neon Postgres.
4. **Phase 5.4: Connect Search UI to Database API:** Write a Next.js API route that queries Neon Postgres for matching ZIP codes, and update `src/app/page.tsx` to fetch search results from this endpoint.