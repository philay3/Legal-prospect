# Legal Prospector

![Next.js](https://img.shields.io/badge/Next.js-000000?style=flat&logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=flat&logo=typescript&logoColor=white)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=flat&logo=prisma&logoColor=white)
![Postgres](https://img.shields.io/badge/Neon_Postgres-336791?style=flat&logo=postgresql&logoColor=white)
![Vitest](https://img.shields.io/badge/tests-223_passing-success?style=flat&logo=vitest&logoColor=white)
![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000000?style=flat&logo=vercel&logoColor=white)

> **Turn a ZIP code into an accurate, exportable list of small and boutique law firms — with the contact and firm data that Google misses.**

Legal Prospector is a legal-sales prospecting tool built for a Thomson Reuters account executive who sells Westlaw to small and boutique law firms. Enter a ZIP code, and it discovers the firms in that area, visits each firm's website, and extracts structured contact and firm details — phone, attorneys, and practice areas — then lets a signed-in user save and export the best leads.

<!-- TODO: add a hero screenshot — the search results table for a real ZIP -->
<!-- ![Legal Prospector — search results](docs/images/results.png) -->

🔗 **Live demo:** [legal-prospect.vercel.app](https://legal-prospect.vercel.app)

---

## What it does

Finding small law firms is traditionally slow, manual work. Google Maps gives you a pin and maybe a phone number, but it misses attorneys, practice areas, and reliable contact details — and the data goes stale. Legal Prospector automates that research:

- **Search by ZIP** — discovers the firms in an area in one query.
- **Automatic enrichment** — visits each firm's site and pulls phone, attorneys, and practice areas with an LLM, grounded in the firm's real website.
- **Sortable results** — review firms in a clean, paginated table.
- **Save & export** — signed-in users bookmark firms to a private Leads list and export to CSV.
- **Email-code accounts** — passwordless sign-in via a one-time code.

---

## Tech stack

| Layer | Technology |
| --- | --- |
| Framework | Next.js (App Router) · React · TypeScript |
| Database | Neon Postgres (one shared DB for local + production) |
| ORM | Prisma |
| Firm discovery | Google Places API |
| Page extraction | Tavily Extract (falls back to direct fetch) |
| Structured extraction | OpenAI <!-- TODO: confirm exact model string in code (e.g. gpt-5.4-mini) --> |
| Auth email | Resend (one-time login codes) |
| Testing | Vitest (223 passing) |
| Hosting | Vercel (Pro) |

---

## Architecture

The app is **two journeys that share one database**: a public *search* journey, and a private *account* journey. Firm research is global and shared across all users; saved leads are private and scoped to one user.

```mermaid
flowchart TD
    User([User])

    subgraph Search["🔎 Search journey (public)"]
        Home["Home page<br/>ZIP search + results table"]
        Pipeline["Discovery + enrichment pipeline"]
    end

    subgraph Account["🔐 Account journey (private)"]
        Auth["Auth routes<br/>request-code / verify-code"]
        Leads["Leads page<br/>save + CSV export"]
    end

    DB[("Neon Postgres<br/>global firms + private leads")]

    User -->|enters ZIP| Home
    Home --> Pipeline
    Pipeline -->|Places → extract → save| DB
    DB -->|firms| Home

    User -->|email + code| Auth
    Auth -->|HttpOnly session cookie| DB
    User -->|save / export| Leads
    Leads -->|scoped by userId| DB
```

The dividing line is the whole reason auth exists in this app: **global research data can be shared, but user workflow data must be private.**

---

## How it works: the enrichment pipeline

A ZIP becomes real firm data in **two passes**. The key idea: the LLM does one narrow, supervised job — extracting fields from a real page — it never invents the list of firms.

```mermaid
flowchart LR
    ZIP([ZIP code]) --> P1

    subgraph P1["Pass 1 · Discovery"]
        Places["Google Places"] --> Cands["~60 candidate firms<br/>name, phone, address, site"]
    end

    Cands --> P2

    subgraph P2["Pass 2 · Enrichment (per firm, capped ~20)"]
        direction TB
        Pick["pickContactLink<br/>choose best contact page"] --> Ext["Tavily Extract<br/>clean page text"]
        Ext --> LLM["OpenAI<br/>phone · email · attorneys"]
        LLM --> Rgx["extractEmails<br/>regex backstop, prefers firm domain"]
    end

    P2 --> Save

    subgraph Save["Persistence"]
        San["sanitizeFirm<br/>strip bad bytes"] --> Dedupe["dedupe by<br/>searchZip + firmName"]
        Dedupe --> Firm[("Firm table")]
    end
```

**The `searchZip` design decision.** Discovery and dedupe key off `searchZip` — a column kept deliberately *separate* from the firm's real physical `zip`. Early on, one `zip` column did both jobs, and Google Places kept overwriting the search key with each firm's actual address, silently corrupting cache reads. Splitting the key from the real address fixed it. The lesson baked into the schema: **never overload one column as both a lookup key and mutable data.**

Persistence is **cache-first**, so each ZIP is only researched once. Known limitation: **email yield is low**, because law firm homepages rarely expose an email address — a dedicated contact-page pass is on the roadmap. Phone, the more useful number for outreach, comes back reliably from Places.

---

## Data model

Eight research + auth tables, plus a feedback table — in two layers, joined by a single bridge.

```mermaid
erDiagram
    Firm ||--o{ Attorney : "has"
    Firm ||--o{ FirmPracticeArea : "tagged"
    PracticeArea ||--o{ FirmPracticeArea : "tags"
    Firm ||--o{ SavedLead : "saved as"
    User ||--o{ SavedLead : "saves"
    User ||--o{ Session : "has"
    User ||--o{ Feedback : "submits"

    Firm {
        string id PK
        string firmName
        string searchZip "search + dedupe key"
        string zip "real address"
        string phone
        string email
        string[] attorneys
        enum confidenceLevel
        enum verificationStatus
    }
    Attorney {
        string id PK
        string firmId FK
        string name
        string email
    }
    PracticeArea {
        string id PK
        string name UK
    }
    FirmPracticeArea {
        string firmId FK
        string practiceAreaId FK
    }
    User {
        string id PK
        string email UK
        boolean isActive "ban switch"
        datetime lastLoginAt
    }
    Session {
        string id PK
        string userId FK
        string tokenHash
        datetime expiresAt
    }
    LoginCode {
        string id PK
        string email "no FK — transient"
        string codeHash
        datetime expiresAt
        datetime usedAt
    }
    SavedLead {
        string userId FK
        string firmId FK
    }
    Feedback {
        string id PK
        string choice
        string message "optional"
        string userId FK "nullable"
    }
```

**Research corpus (global, shared):** `Firm` is the center — `Attorney` hangs off it one-to-many, and `PracticeArea` is many-to-many with firms through the `FirmPracticeArea` join table.

**Auth layer (private):** `User` owns `Session` rows; `LoginCode` is standalone with no foreign key because it's a transient credential keyed by email.

**The bridge:** `SavedLead` is the only table connecting the two layers — a many-to-many between `User` and `Firm`, the same join-table pattern as `FirmPracticeArea`. `Feedback` is an optional, nullable link to `User`, so feedback can be anonymous or attributed.

---

## Project structure

```
legal-prospector/
├── prisma/
│   ├── schema.prisma           # 9 models, 3 enums
│   └── migrations/             # additive-only migration history
├── src/
│   ├── app/
│   │   ├── page.tsx            # home — ZIP search + results
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── login/page.tsx      # email-code sign in
│   │   ├── leads/page.tsx      # saved leads + CSV export  (private)
│   │   ├── account/page.tsx    # account info             (private) [confirm path]
│   │   ├── api/
│   │   │   ├── auth/
│   │   │   │   ├── request-code/route.ts
│   │   │   │   └── verify-code/route.ts
│   │   │   ├── leads/route.ts          # bulk save / remove
│   │   │   └── feedback/route.ts       # feedback capture
│   │   ├── layout.tsx          # NavBar + Footer + FeedbackWidget
│   │   └── globals.css
│   ├── components/
│   │   ├── NavBar.tsx · AvatarMenu.tsx · ResultsTable.tsx
│   │   ├── Footer.tsx · FeedbackWidget.tsx
│   ├── lib/
│   │   ├── prisma.ts           # Prisma client singleton
│   │   ├── auth/session.ts     # getCurrentUser, session helpers
│   │   ├── leads.ts · feedback.ts
│   │   └── ...                 # discovery / enrichment / pickContactLink [confirm filenames]
│   └── generated/prisma/       # generated Prisma client
└── tasks/
    └── current-task.md         # the one task currently in flight
```

---

## Routes

| Route | Type | Auth | Purpose |
| --- | --- | --- | --- |
| `/` | Page | Public | ZIP search + results table |
| `/about`, `/contact` | Page | Public | Static info |
| `/login` | Page | Public | Email-code sign in |
| `/leads` | Page | Private | Saved leads + CSV export |
| `/account` | Page | Private | Account info |
| `POST /api/auth/request-code` | API | Public | Send a one-time login code |
| `POST /api/auth/verify-code` | API | Public | Verify code, set session cookie |
| `/api/leads` | API | Private | Save / list / remove saved leads (bulk) |
| `POST /api/feedback` | API | Public | Capture in-app feedback |

> Search discovery + enrichment runs server-side off the home route. <!-- TODO: confirm whether this is a dedicated /api route or a server action -->

---

## Local setup

**Prerequisites:** Node.js, a Neon Postgres database, and API keys for Google Places, Tavily, OpenAI, and Resend.

```bash
# 1. install
npm install

# 2. configure environment (see table below)
cp .env.example .env        # then fill in real values

# 3. set up the database
npx prisma migrate dev      # applies migrations + generates the client

# 4. run
npm run dev                 # http://localhost:3000
```

> **Migrations are strictly additive.** Local and production share one Neon database, so this project never resets or drops — every schema change is a new additive migration, and the SQL is reviewed before it's applied.

### Environment variables

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Pooled Neon connection string |
| `DIRECT_URL` | Direct Neon connection (for migrations) |
| `GOOGLE_PLACES_API_KEY` | Firm discovery |
| `TAVILY_API_KEY` | Page content extraction |
| `OPENAI_API_KEY` | Structured field extraction |
| `SEARCH_PROVIDER` | Discovery provider switch (`places`) |
| `EXTRACT_PROVIDER` | Extraction provider switch (default `tavily`) |
| `RESEND_API_KEY` | Sending login-code emails |
| `AUTH_EMAIL_FROM` | From address for auth emails |
| `AUTH_SESSION_SECRET` | Pepper for hashing session tokens (identical local + prod) |
| `AUTH_SESSION_COOKIE_NAME` | Session cookie name |
| `APP_BASE_URL` | Base URL (differs per environment) |

---

## Testing

```bash
npx vitest run        # full suite (223 passing)
npx tsc --noEmit      # type check
```

The test suite is the safety net that makes it safe to move fast — every change, including ones implemented by the coding agent, runs against it. Development is **test-driven**: new behavior starts as a failing test, then the smallest change to make it pass. Route logic, auth flows, lead saving, dedupe edge cases, and pure helpers like `pickContactLink` are all covered.

> Vitest gotchas in this repo: route files and tests use **relative imports** (the `@/` alias isn't resolved by the runner), and any module importing `server-only` is mocked at the top of the test with `vi.mock("server-only", () => ({}))`.

---

## How this was built

This project was built with a deliberate **three-way development loop** — a human reviewer, a planning AI acting as architect, and a separate CLI coding agent doing implementation — with guardrails at every step (plans before code, additive-only migrations, full-file-contents reports, human-run commands). See **[`docs/HOW-WE-BUILD.md`](docs/HOW-WE-BUILD.md)** for the full process.

---

## Roadmap

**Near term**
- **Email yield** — a dedicated contact-page fetch and a harder `mailto:` scrape, triggered when a user *saves* a lead, to spend extraction effort where it matters.
- Persistent saved-leads dashboard and per-user search history.

**The bigger arc — from a search tool to a data product**
- Store *evidence*, not just answers: `ResearchRun`, `WebsiteCheck`, and `DataPoint` provenance tables.
- Continuous background enrichment with scheduled freshness re-checks.
- `Prediction` — propensity-to-buy lead scoring derived from the evidence.

---

<!--
SCREENSHOT SHOT-LIST (grab these once; also great for the demo):
1. Search results table for a real ZIP (hero image, top of README)
2. The avatar menu open (accounts)
3. The Leads page with a few saved firms + the export button
4. The feedback widget open
Drop them in docs/images/ and uncomment the image lines above.
-->