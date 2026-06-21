# Legal Prospector — data model (ERD)

Today only the `Firm` table exists; everything else here is the additive roadmap.

Render this anywhere that supports Mermaid:
- **VS Code** — open this file and use Markdown preview (with a Mermaid extension)
- **GitHub** — renders the diagram inline when committed to the repo
- **mermaid.live** — paste the diagram below, switch theme to "dark" or "default" for full contrast, and export PNG/SVG

**Clusters:**
- Data spine: `ZIP → FIRM → ATTORNEY`, with `PRACTICE_AREA` via the `FIRM_PRACTICE_AREA` join (many-to-many)
- Time-series (what makes it a data app): `RESEARCH_RUN`, `WEBSITE_CHECK`, `PREDICTION`
- Workspace (sales CRM): `USER → SESSION` / `LOGIN_CODE`, and `USER → SAVED_LEAD → LEAD_ACTIVITY`

```mermaid
erDiagram
  ZIP ||--o{ FIRM : locates
  ZIP ||--o{ RESEARCH_RUN : logs
  FIRM ||--o{ ATTORNEY : employs
  FIRM ||--o{ FIRM_PRACTICE_AREA : has
  PRACTICE_AREA ||--o{ FIRM_PRACTICE_AREA : in
  FIRM ||--o{ WEBSITE_CHECK : monitors
  FIRM ||--o{ PREDICTION : scores
  USER ||--o{ SESSION : has
  USER ||--o{ LOGIN_CODE : requests
  USER ||--o{ SAVED_LEAD : saves
  FIRM ||--o{ SAVED_LEAD : appears
  SAVED_LEAD ||--o{ LEAD_ACTIVITY : tracks
  ZIP {
    string zip PK
    string city
    string state
    timestamp lastResearchedAt
    int firmCount
  }
  FIRM {
    uuid id PK
    string zip FK
    string firmName
    string website
    string email
    string verificationStatus
  }
  ATTORNEY {
    uuid id PK
    uuid firmId FK
    string name
    string email
    string title
  }
  PRACTICE_AREA {
    uuid id PK
    string name
  }
  FIRM_PRACTICE_AREA {
    uuid firmId FK
    uuid practiceAreaId FK
  }
  RESEARCH_RUN {
    uuid id PK
    string zip FK
    string source
    int firmsFound
    timestamp startedAt
  }
  WEBSITE_CHECK {
    uuid id PK
    uuid firmId FK
    int statusCode
    bool isAlive
    timestamp checkedAt
  }
  PREDICTION {
    uuid id PK
    uuid firmId FK
    string scoreType
    float value
    timestamp computedAt
  }
  USER {
    uuid id PK
    string email
    string name
    timestamp createdAt
  }
  SESSION {
    uuid id PK
    uuid userId FK
    string token
    timestamp expiresAt
  }
  LOGIN_CODE {
    uuid id PK
    uuid userId FK
    string code
    timestamp expiresAt
  }
  SAVED_LEAD {
    uuid id PK
    uuid userId FK
    uuid firmId FK
    string status
    timestamp savedAt
  }
  LEAD_ACTIVITY {
    uuid id PK
    uuid savedLeadId FK
    string type
    timestamp createdAt
  }
```