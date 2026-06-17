# 12 — Prospect Data Model Gap Analysis

## 1. Purpose

This document provides a detailed gap analysis between the current frontend-only `Prospect` data model and the requirements outlined in the [Real Data Acquisition Plan](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/03-data-fetching-plan.md). The goal is to identify which fields are currently supported, which are missing, how fields should be partitioned between shared global prospect directories and private user workflows, and which adjustments can be safely staged in the frontend before database/API design is finalized.

---

## 2. Current State

The application operates in a client-side environment utilizing static mock data:
- **Seed Data:** Four fictional law firm records representing the test ZIP code `19103` are defined in [prospects.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/data/prospects.ts) and conform to the `Prospect` interface.
- **Search UI:** Users search by ZIP code. Inputs are normalized and validated, displaying search results or empty states based on client-side matching.
- **UI Interaction:** The search results cards allow toggling detailed fields (expand/collapse) and toggling saved state (`Save` / `Saved` UI status) which updates client React memory only.
- **Data Persistence & Auth:** Zero database connections, API routes, scraping mechanisms, or authentication integrations are present.

---

## 3. Current `Prospect` Type Summary

The existing TypeScript interface is defined in [prospect.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/types/prospect.ts):

```typescript
export interface Prospect {
  id: string;
  firmName: string;
  zip: string;
  city: string;
  state: string;
  website: string | null;
  phone: string | null;
  practiceAreas: string[];
  attorneyCountRange: string;
  sourceType: string;
  confidence: string;
  notes: string | null;
}
```

### Field Definitions:
- `id`: Unique string key for list rendering (e.g., `"prospect_001"`).
- `firmName`: Legal or commercial name of the law firm.
- `zip`: 5-digit postal code.
- `city` / `state`: Regional geography.
- `website`: Optional URL string (nullable).
- `phone`: Optional contact number string (nullable).
- `practiceAreas`: Array of specialty labels.
- `attorneyCountRange`: Text representation of size (e.g., `"2-5"`, `"1"`, `"6-10"`).
- `sourceType`: Metadata string tracking data origin (e.g., `"Manual seed data"`).
- `confidence`: String tracking data confidence (e.g., `"High (Demo)"`, `"Medium (Demo)"`, `"Low (Demo)"`).
- `notes`: Descriptive profile notes (nullable).

---

## 4. Real-Data Plan Field Summary

The [Real Data Acquisition Plan](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/docs/planning/03-data-fetching-plan.md) defines 18 fields for a canonical real prospect record in a global database. These fields accommodate:
- Granular office addresses (`streetAddress`, `zipExt`).
- Legal discovery sources (`sourceUrl`, `sourceType`).
- attorney information (`attorneys` array, standardized `attorneyCountRange`).
- Data verification statuses (`confidenceLevel` and `verificationStatus`).
- Record lifecycle verification timestamps (`lastCheckedDate`).
- Contact methods (`email`).

---

## 5. Field-by-Field Gap Table

The table below maps the fields described in the Real Data Acquisition Plan to the existing `Prospect` type properties, indicating gap status and next-step actions:

| Real-Data Field | Current Field | Gap Status | Data Ownership | Recommendation |
| :--- | :--- | :--- | :--- | :--- |
| `id` | `id` | Supported (UUID in plan, string in current) | Global/Shared | Keep. Ensure schema implements standard UUID strings. |
| `firmName` | `firmName` | Supported | Global/Shared | Keep. |
| `website` | `website` | Supported | Global/Shared | Keep. In DB schema, website domain acts as the primary deduplication key. |
| `phone` | `phone` | Supported | Global/Shared | Keep. In DB schema, enforce normalized formatting. |
| `email` | None | **Missing** | Global/Shared | Add as `email: string \| null` during database design. |
| `streetAddress` | None | **Missing** | Global/Shared | Add as `streetAddress?: string` to support physical office mapping. |
| `city` | `city` | Supported | Global/Shared | Keep. |
| `state` | `state` | Supported | Global/Shared | Keep. |
| `zip` | `zip` | Supported | Global/Shared | Keep. Used for index lookups. |
| `zipExt` | None | **Missing** | Global/Shared | Add as `zipExt?: string \| null` to support ZIP+4 extensions. |
| `practiceAreas` | `practiceAreas` | Supported | Global/Shared | Keep. Standardize areas through backend lookup enums. |
| `attorneyCountRange` | `attorneyCountRange`| Supported (string in current, enum in plan) | Global/Shared | Keep. Restrict values in schema to: `'1-2' \| '3-5' \| '6-10' \| '11-20' \| '21+'`. |
| `attorneys` | None | **Missing** | Global/Shared | Add as `attorneys?: string[]` to list verified lawyers. |
| `sourceUrl` | None | **Missing** | Global/Shared | Add as `sourceUrl?: string` to trace discovery points. |
| `sourceType` | `sourceType` | Supported (string in current, enum in plan) | Global/Shared | Keep. Restrict values in schema to: `'BAR_DIRECTORY' \| 'GOOGLE_MAPS' \| 'WEB_SCRAPE' \| 'MANUAL'`. |
| `confidenceLevel` | `confidence` | **Name & Type Mismatch** | Global/Shared | Rename `confidence` to `confidenceLevel`. Restrict type to: `'HIGH' \| 'MEDIUM' \| 'LOW' \| 'UNKNOWN'`. |
| `verificationStatus`| None | **Missing** | Global/Shared | Add as `verificationStatus` to track administrative workflows. |
| `lastCheckedDate` | None | **Missing** | Global/Shared | Add as `lastCheckedDate: string` to handle data refresh scheduling. |
| `notes` | `notes` | Supported (as string \| null) | Global/Shared / Private | Split: Global mock notes represent a shared firm description (`globalNotes: string \| null`). User-specific notes should belong to private tables. |

---

## 6. Global/Shared Data Fields

Global/shared data represents objective, publicly sourced facts about a law firm. These records are compiled, normalized, and updated globally to serve all prospecting queries:
- **Firm Attributes:** `firmName`, `website`, `phone`, `email`, `streetAddress`, `city`, `state`, `zip`, `zipExt`, `practiceAreas`, `attorneyCountRange`, `attorneys`.
- **System Metrics:** `id`, `sourceUrl`, `sourceType`, `confidenceLevel`, `verificationStatus`, `lastCheckedDate`.
- **Global Notes:** Description of the firm, bar status updates, or crawl notifications that apply to the record globally (distinct from private annotations).

---

## 7. Private/User-Specific Fields to Defer

Private/user-specific data captures the workflow, actions, and history of individual users. These fields must **never** be merged directly into the global firm directory. They are deferred until auth and relational databases are designed:
- **Lead Save States:** Tracking whether a specific user has saved a prospect (e.g. `SavedLead` relation table mapping `userId` to `firmId`).
- **User outreach Notes:** Custom notes written by a sales rep after speaking to a firm.
- **Lead Workflow Statuses:** Rep-specific pipeline markers (e.g., `New`, `Contacted`, `Meeting Scheduled`, `Closed Won`).
- **Tasks & Reminders:** Rep-specific reminders for client follow-ups.
- **Recent Searches:** Persistent history of ZIP code searches executed by a user.

---

## 8. Frontend Sample-Data Fields that can be Added Later

To prepare the UI for real data without touching database layers, we can safely enrich the mock `Prospect` type and [prospects.ts](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/data/prospects.ts) mock dataset with several placeholder fields:
- **Add to Type:** `email`, `streetAddress`, `zipExt`, `attorneys`, `sourceUrl`, `lastCheckedDate`.
- **Update Type Values:** Restructure `confidence` to `confidenceLevel` (`'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'`) and add `verificationStatus`.
- **Benefit:** This allows [ProspectCard.tsx](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/components/ProspectCard.tsx) to be updated to show streets, verified attorneys, and source links, ensuring the visual grid matches real production prospects.

---

## 9. Database/API Fields that should Wait

Relational fields, system-generated fields, and user-scoped values must wait for Prisma database schema construction (Phase 5) and Auth implementation (Phase 6):
- **UUID Keys:** Standardized UUID generation for `id` values.
- **Private Save Mapping:** Relational entries linking a `User` table to a `SavedLead` join table.
- **User Activity Logs:** Search auditing and recent query logs.
- **Verification Logs:** Historical logs tracking edits to `confidenceLevel` or transitions in `verificationStatus`.

---

## 10. Confidence vs Verification Status Clarification

We maintain a strict separation between how we grade data quality and how we track its status in the administrative lifecycle:

### Confidence Level
Describes the system's trust in the accuracy and completeness of the firm's details based on verification paths.
- **`HIGH`**: Verified directly against the firm's website or audit.
- **`MEDIUM`**: Google Maps data with a valid matching domain.
- **`LOW`**: Inferred from secondary directories, unverified contact numbers.
- **`UNKNOWN`**: Unassessed imports or static seed placeholders.

### Verification Status
Tracks the workflow review lifecycle state for the record inside the system.
- **`CANDIDATE`**: Automatically discovered via crawlers, not yet reviewed or searchable by normal users.
- **`PENDING_REVIEW`**: Flagged for human review due to stale updates or conflicting details.
- **`VERIFIED`**: Explicitly approved by an admin.
- **`REJECTED`**: Flagged as invalid, closed, spam, or out-of-scope.
- **`STALE`**: Verified data that has passed its freshness window (90 days) and requires re-evaluation.

---

## 11. Recommended Future Model Shape

Below is the planning-only TypeScript model sketch for the expanded prospect entity. 

> [!NOTE]
> This is a planning-only sketch. Do not implement these changes in the source code during this task.

```typescript
// Planning-only sketch. Do not implement in this task.

export type ConfidenceLevel = 'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN';
export type VerificationStatus = 'CANDIDATE' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED' | 'STALE';
export type SourceType = 'BAR_DIRECTORY' | 'GOOGLE_MAPS' | 'WEB_SCRAPE' | 'MANUAL';

export interface FutureProspect {
  // Global / Shared Data
  id: string; // Global UUID
  firmName: string;
  website: string; // Canonical domain name (deduplication key)
  phone: string; // Normalized phone string
  email: string | null;
  streetAddress: string;
  city: string;
  state: string;
  zip: string; // 5-digit base ZIP
  zipExt: string | null; // Optional 4-digit ZIP+4
  practiceAreas: string[];
  attorneyCountRange: '1-2' | '3-5' | '6-10' | '11-20' | '21+';
  attorneys: string[];
  sourceUrl: string;
  sourceType: SourceType;
  confidenceLevel: ConfidenceLevel;
  verificationStatus: VerificationStatus;
  lastCheckedDate: string; // ISO String
  globalNotes: string | null; // Shared firm profile description
  
  // Note: Private user workflow states (isSaved, userNotes, status)
  // are NOT included here. They belong in separate user-scoped models.
}
```

---

## 12. Risks and Scope-Control Notes

- **Field Merges vs Overwrites:** Scrapers must not overwrite high-confidence manually verified fields with lower-confidence automated attributes.
- **Array Query Performance:** In relational database structures, searching array fields (`practiceAreas`, `attorneys`) directly can cause performance bottlenecks. Junction tables or indexed Postgres GIN arrays should be budgeted during database design.
- **Mock Type Divergence:** Staging frontend type modifications before database creation can introduce sync errors if database schema names drift. Frontend types should act as a strict contract.
- **UI State Leakage:** Keep UI-specific presentation states (e.g. `isExpanded`) separated from data properties.

---

## 13. Explicit Non-Goals for Now

- **No Code Base Edits:** Do not modify `src/types/prospect.ts`, `src/data/prospects.ts`, `src/components/ProspectCard.tsx`, or any Next.js app components.
- **No Database Config:** Do not define Prisma schemas, run migrations, or configure local/production database setups.
- **No Integration Code:** Do not write scrapers, configure Resend auth, or connect external third-party search APIs.
- **No Persistent Saved States:** Do not implement local storage or cookie caches for search states.

---

## 14. Suggested Follow-Up Tasks

Upon approval of this gap analysis, the following tasks are recommended:
1. **Mock Type Update:** Safely update `src/types/prospect.ts` and `src/data/prospects.ts` with the new properties (like `streetAddress`, `sourceUrl`, `email`, `zipExt`, `attorneys`) to enable visual and component test preparation.
2. **ProspectCard UI Enrichment:** Update [ProspectCard.tsx](file:///Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/components/ProspectCard.tsx) to render the street address, source website reference links, and attorney names, verifying the design system looks polished in expanded views.
3. **Database Schema Design:** Write a database design review document defining the schema for global `Firm` records and user-scoped lead tables, ensuring proper join configurations.
