# Data Fetching and Real Data Acquisition Plan

## 1. Purpose

This document governs the strategies, architectures, constraints, and rules for transitioning the Legal Prospector app from static fictional sample data to real law firm data. It defines how we discover, verify, structure, and store real small and boutique law firm prospect records by postal ZIP code.

The primary objective of these rules is to:
- Establish clear guidelines for data acquisition, preventing uncontrolled API usage, scraping legal liabilities, and data corruption.
- Ensure strict separation between shared global research data and private user workflow data.
- Document and manage all data enrichment logic, prompts, and scraping passes before implementation.

---

## 2. Current State

Currently, the application operates in a completely isolated client-side environment with zero database or API integrations:
- **Seed Data:** Fictional sample records representing four law firms in the test ZIP code `19103` are statically defined in `src/data/prospects.ts`.
- **Search UI:** The home search page handles input validation (including ZIP+4 normalization) and client-side filtering via `src/utils/prospectMatcher.ts`.
- **Save State:** Users can toggle "Save" on cards, updating an in-memory React state list that is cleared on page refresh.
- **Deployment:** The MVP is deployed publicly at [https://legal-prospect.vercel.app](https://legal-prospect.vercel.app).

---

## 3. Real-Data Objective

The product goal is to provide software sales reps with real, accurate, and actionable sales leads for small/boutique law firms (1-15 attorneys) in a given ZIP code. 

To achieve this, the system must eventually query, filter, and surface real law firms, including their:
- Exact contact details (phone, website, street address).
- Firm characteristics (size, primary practice areas).
- Verifiable trust signals (source URL, confidence level, and verification timestamp).

---

## 4. Prospect Record Fields

A canonical real prospect record within our global database should be structured as follows:

| Field | Type | Description | Example |
| :--- | :--- | :--- | :--- |
| `id` | `String (UUID)` | Unique global record identifier. | `"f81d4fae-7dec-11d0-a765-00a0c91e6bf6"` |
| `firmName` | `String` | Legal or trade name of the law firm. | `"Langer, Grogan & Diver, P.C."` |
| `website` | `String` | Fully qualified official website URL. | `"https://langergrogan.com"` |
| `phone` | `String` | E.164 normalized office phone number. | `"+12153205660"` |
| `email` | `String \| null` | General office or intake email, if public. | `"info@langergrogan.com"` |
| `streetAddress` | `String` | Physical street address including suite/floor. | `"1717 Arch Street, Suite 4020"` |
| `city` | `String` | City name. | `"Philadelphia"` |
| `state` | `String` | Two-letter state abbreviation. | `"PA"` |
| `zip` | `String` | 5-digit base postal ZIP code. | `"19103"` |
| `zipExt` | `String \| null` | 4-digit ZIP code extension. | `"2768"` |
| `practiceAreas` | `String[]` | Normalized array of primary practice areas. | `["Commercial Litigation", "Antitrust"]` |
| `attorneyCountRange`| `Enum` | Size estimate range: `1-2`, `3-5`, `6-10`, `11-20`, `21+` | `"6-10"` |
| `attorneys` | `String[]` | List of verified attorney names at this office. | `["John Langer", "Howard Langer"]` |
| `sourceUrl` | `String` | The specific web URL where discovery occurred. | `"https://www.langergrogan.com/contact"` |
| `sourceType` | `Enum` | Source origin: `BAR_DIRECTORY`, `GOOGLE_MAPS`, `WEB_SCRAPE`, `MANUAL` | `"MANUAL"` |
| `confidenceLevel` | `Enum` | Data confidence level: `HIGH`, `MEDIUM`, `LOW`, `UNKNOWN` | `"UNKNOWN"` |
| `verificationStatus`| `Enum` | Lifecycle review status: `CANDIDATE`, `PENDING_REVIEW`, `VERIFIED`, `REJECTED` | `"PENDING_REVIEW"` |
| `lastCheckedDate` | `String (ISO)`| Timestamp when the record was last verified. | `"2026-06-17T02:13:00Z"` |

---

## 5. Source Types and Source-Quality Levels

Data sources are categorized by credibility and structure. The system prioritizes primary sources over secondary aggregators:

### Tier 1: Authoritative / Primary Sources (Highest Trust)
- **Law Firm Official Websites:** The canonical source for office addresses, direct-dial numbers, attorney names, and specialized practice areas.
- **State Bar / Disciplinary Board Registries:** Authoritative for active license status, registration status, and legal name. However, formatting is state-specific and contact info may be outdated or personal.

### Tier 2: Structured Secondary Sources (Medium Trust)
- **Google Maps / Places API:** Highly accurate for physical location (latitude/longitude), standard business hours, phone number, and website URL. Weak for practice specialty breakdown and attorney details.
- **Reputable Legal Directories (e.g., Avvo, Martindale-Hubbell):** Highly structured listings of firms and lawyers, though entries are frequently stale or commercially biased.

### Tier 3: Unstructured Secondary Sources (Lowest Trust)
- **Search Engine Snippets & Web Directories:** Messy, unverified, and high rate of duplicate entries. Used primarily for initial discovery index bootstrapping.

---

## 6. Confidence Scoring and Verification Status

We separate how we grade the data quality from how we track its administrative lifecycle.

### Confidence Scoring
Confidence levels describe the system's trust in the source and accuracy of the field data:
- **HIGH Confidence:** The website, phone number, and address have been successfully verified directly against the firm's live website contact page, or verified via a manual human audit.
- **MEDIUM Confidence:** Sourced from Google Places API, has a valid matching website domain, and has no conflicting phone numbers across secondary directories.
- **LOW Confidence:** Inferred solely from search engine snippets or secondary directories without direct website verification.
- **UNKNOWN Confidence:** Newly imported, unassessed, or seed placeholder data.

### Verification Status
Verification status is an administrative state property tracking the human-in-the-loop lifecycle:
- **CANDIDATE:** System-proposed new firm from an automated pass, not yet reviewed or exposed to standard user search.
- **PENDING_REVIEW:** Flagged for manual inspect (e.g., during the manual first-pass experiment, or when a conflicting change is detected).
- **VERIFIED:** Human has explicitly approved this firm and its details.
- **REJECTED:** Human has flagged this record as invalid, closed, spam, or out-of-scope.

---

## 7. ZIP and Geographic Matching Rules

For Version 1, geographic searching is constrained to protect query quality:
- **Exact Match First:** The search query compares the normalized 5-digit base ZIP code against the `zip` field in the database.
- **Proximity Expansion:**
  - If a searched ZIP code yields fewer than 3 results, the app may expand the search radius to adjacent ZIP codes sharing a physical boundary (adjacent ZIP list).
  - Distance between ZIP code centroids (lat/long) is calculated using the Haversine formula.
  - Expanded results must be clearly demarcated in the UI (e.g., "Sample results in adjacent ZIP 19102 - 0.8 miles away").
- **ZIP+4 Handling:** Incoming searches in ZIP+4 format (e.g. `19103-1234`) are normalized to extract the 5-digit base (`19103`) for database matching, but the extension is preserved as metadata.

---

## 8. Duplicate Handling

To prevent multiple listings of the same physical law office, we use the following merging rules:

- **Primary Deduplication Key:** Canonical domain name.
  - Example: `https://www.langergrogan.com/index.html` and `http://langergrogan.com/contact` normalize to `langergrogan.com`.
  - No database write can create a new prospect if a record already exists with that canonical domain.
- **Secondary Deduplication Key:** (Normalized Name + State + Normalized Phone).
  - Used if no website is available.
  - Punctuation, capitalization, and suffixes (e.g., "LLC", "P.C.") are stripped before comparison.
- **Merge Logic on Collision:**
  - If an incoming scraping or API pass finds a duplicate canonical website domain:
    1. If the new data is of equal or lower confidence, preserve the existing fields.
    2. If the new data has higher confidence (e.g. verified website crawl vs old Google Place details), fill empty fields and suggest modifications as a review candidate.
    3. Update the `lastCheckedDate` to the current timestamp.

---

## 9. Freshness and Last-Checked Rules

Law firm structures, contact info, and website domains change regularly. We enforce the following lifecycle rules:

- **Freshness Window:** 90 days.
- **Stale State:** After 90 days since the `lastCheckedDate`, a record is marked as "Stale" and scheduled for re-verification.
- **Verification Lifecycle:**
  - Stale records are placed in a background verification queue.
  - The validator checks the website URL. If the HTTP status is a persistent error (e.g., 404, 500, DNS resolution failure) for 3 consecutive attempts over a 7-day period, the record confidence drops to `LOW` and a manual review flag is set.
  - Verified successful checks update `lastCheckedDate` and reset the 90-day timer.

---

## 10. Manual first-pass workflow

To validate our database schema and refine our prospect data fields before writing automation scripts, we propose a manual real-data experiment:

### Proposed Manual Verification Experiment for ZIP 19103
- **Target ZIP:** `19103` (Center City, Philadelphia, PA).
- **Target Count:** 5 to 10 real boutique law firms (typically 1-15 attorneys).
- **Manual Discovery Method:** The researcher conducts web searches, maps out candidate firms in the targeted ZIP code, and manually verifies their physical location, telephone, website, practice areas, and attorney rosters.

### Example Candidate Records for Future Manual Verification

Below are example candidate records identified as starting points for this proposed manual verification experiment:

#### Candidate Record 1
- **Firm Name:** Langer, Grogan & Diver, P.C.
- **Website:** `https://langergrogan.com`
- **Phone:** `215-320-5660`
- **Address:** 1717 Arch Street, Suite 4020, Philadelphia, PA 19103
- **Practice Areas:** `["Commercial Litigation", "Antitrust", "Class Actions", "Consumer Protection"]`
- **Attorney Count Range:** `6-10`
- **Attorneys:** `["John Langer", "Howard Langer", "Ned Diver", "Peter Leckman", "Irvin Diver"]`
- **Source URL:** `https://langergrogan.com/contact/`
- **Source Type:** `MANUAL`
- **Confidence Level:** `UNKNOWN` (confidence to be assigned after human verification completes)
- **Verification Status:** `PENDING_REVIEW`
- **Last Checked:** `2026-06-17T02:13:00Z`

#### Candidate Record 2
- **Firm Name:** Bodell Bové, LLC
- **Website:** `https://bodellbove.com`
- **Phone:** `215-864-6600`
- **Address:** 1845 Walnut Street, 11th Floor, Suite 1100, Philadelphia, PA 19103
- **Practice Areas:** `["Complex Litigation", "Insurance Coverage", "Bad Faith Litigation", "Product Liability"]`
- **Attorney Count Range:** `11-20`
- **Attorneys:** `["David Bodell", "Robert Bove", "Douglas Kent", "Susan Sullivan"]`
- **Source URL:** `https://bodellbove.com/contact/`
- **Source Type:** `MANUAL`
- **Confidence Level:** `UNKNOWN` (confidence to be assigned after human verification completes)
- **Verification Status:** `PENDING_REVIEW`
- **Last Checked:** `2026-06-17T02:13:00Z`

#### Candidate Record 3
- **Firm Name:** Tucker Law Group, LLC
- **Website:** `https://tlgattorneys.com`
- **Phone:** `215-875-0609`
- **Address:** Ten Penn Center, 1801 Market Street, Suite 2500, Philadelphia, PA 19103
- **Practice Areas:** `["Civil Litigation", "Personal Injury", "Employment Law", "Education Law"]`
- **Attorney Count Range:** `6-10`
- **Attorneys:** `["Joe Tucker", "Leslie Miller Greenspan", "Susie Young"]`
- **Source URL:** `https://www.tlgattorneys.com/contact-us/`
- **Source Type:** `MANUAL`
- **Confidence Level:** `UNKNOWN` (confidence to be assigned after human verification completes)
- **Verification Status:** `PENDING_REVIEW`
- **Last Checked:** `2026-06-17T02:13:00Z`

#### Candidate Record 4
- **Firm Name:** Galfand Berger, LLP
- **Website:** `https://galfandberger.com`
- **Phone:** `215-665-1600`
- **Address:** 1835 Market Street, Suite 2710, Philadelphia, PA 19103
- **Practice Areas:** `["Workers' Compensation", "Social Security Disability", "Personal Injury", "Product Liability"]`
- **Attorney Count Range:** `6-10`
- **Attorneys:** `["Richard Jurewicz", "Debra Jensen", "Gabriela Raful"]`
- **Source URL:** `https://galfandberger.com/contact-us/`
- **Source Type:** `MANUAL`
- **Confidence Level:** `UNKNOWN` (confidence to be assigned after human verification completes)
- **Verification Status:** `PENDING_REVIEW`
- **Last Checked:** `2026-06-17T02:13:00Z`

### Comparison Against Existing UI Types
The current typescript definition in `src/types/prospect.ts` defines a `Prospect` like this:
```typescript
export interface Prospect {
  id: string;
  firmName: string;
  zip: string;
  city: string;
  state: string;
  website: string;
  phone: string;
  practiceAreas: string[];
  attorneyCountRange: string;
  sourceType: string;
  confidence: 'High' | 'Medium' | 'Low' | 'Unknown';
  notes: string;
}
```

**Type changes needed later:**
- Update `confidence` type to match standard capitalizations: `'HIGH' | 'MEDIUM' | 'LOW' | 'UNKNOWN'`.
- Add new field `verificationStatus` to match: `'CANDIDATE' | 'PENDING_REVIEW' | 'VERIFIED' | 'REJECTED'`.
- Add optional fields for `zipExt` (string), `attorneys` (string array), `streetAddress` (string), `sourceUrl` (string), and `lastCheckedDate` (string/Date) so these attributes can be saved and displayed correctly in the detail collapse views.

---

## 11. Future Automation Options

Once the schema is integrated, discovery can scale using several automation paths:

- **Google Places API:**
  - Automated worker performs a Text Search query: `law firm near zip [ZIP_CODE]`.
  - Extracts the name, address, latitude/longitude, website, and phone number.
  - Creates the skeleton `Prospect` record with a status of `PENDING` and a confidence level of `MEDIUM`.
- **Targeted Web Crawling (Enrichment Worker):**
  - An automated worker visits the canonical website domain.
  - Scrapes the main page, contact page, and team page.
  - Matches phone numbers, emails, addresses, and attorney name lists.
- **LLM/AI Extraction Parser:**
  - Feeds the scraped contact page HTML or raw text to an AI model (e.g. Gemini 1.5/2.0) with a structured JSON schema.
  - Extracts practice areas, attorney names, and confirms the firm fits the "boutique" size category (1-15 attorneys).

---

## 12. Risks and Constraints

- **Rate Limits & API Costs:** Sourcing data from third-party lookup APIs (like Google Places) introduces cost and API rate limits. Google Places API pricing varies dynamically by SKU (e.g., Basic, Contact, or Atmosphere fields), field selection, and usage tier, and must be verified against official Google Places API pricing documentation prior to implementation. Data searches must be cached where permitted.
- **ToS and Legal Boundaries:** Scrapers must comply with robots.txt. Automated scraping of search engine result pages or state bar websites can violate Terms of Service and trigger IP blocks.
- **AI Hallucinations:** When parsing unstructured text, AI models might fabricate attorney names or mistake office hours for phone numbers. A human-in-the-loop review interface is necessary for low-confidence inferences.
- **Data Compliance (Privacy & Anti-Spam):** Collecting contact details for sales prospecting must comply with regional legislation (e.g., CAN-SPAM, TCPA, GDPR). Sales reps must handle opt-out records.

---

## 13. What Must Be True Before Database Persistence

Before we write schema models or spin up database tables, the following must occur:
1. **Schema Refinement:** Update `src/types/prospect.ts` to accommodate the physical addresses, attorney lists, source URLs, and last-checked timestamps.
2. **Database Design Review:** Define the exact schemas in a database design review document.
3. **Mock Contract Agreements:** Define API request/response structures matching the real fields.

---

## 14. Explicit Non-Goals for Now

- **No live API fetching implementation:** We will not install or configure Google Places SDK or scraping libraries in this phase.
- **No scraper scripts:** Writing automated python/node scripts to scan sites or bar websites is strictly out of scope.
- **No database schemas or migrations:** No Prisma schema changes or docker-postgres configurations.
- **No background workers or cron configuration:** Scheduling tasks is not part of this scope.
- **No auth setup:** No integration of Resend or cookies.

---

## Next Recommended File

After this data plan is approved by the human owner, proceed to human review of this plan. No subsequent planning documents or code files should be modified until review is completed.