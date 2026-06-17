# Current App Export

This file contains the files, configurations, and structures necessary for planning the integration of a live research/enrichment engine in the Legal Prospector application.

---

## 1. Folder Structure

Below is the directory tree (2–3 levels deep), skipping `node_modules`, `.next`, and `.git`:

```text
legal-prospecting-planning-docs-starter/
├── docs/
│   ├── planning/
│   │   ├── -START-HERE.md
│   │   ├── 00-product-brief.md
│   │   └── ... (14 other markdown documents)
│   └── scrapped/
│       └── ... (7 scrapped planning documents)
├── prisma/
│   ├── migrations/
│   │   ├── 20260617044354_init_firm_model/
│   │   └── migration_lock.toml
│   ├── schema.prisma
│   └── seed.ts
├── public/
│   ├── file.svg
│   ├── globe.svg
│   ├── next.svg
│   ├── vercel.svg
│   └── window.svg
├── src/
│   ├── app/
│   │   ├── api/
│   │   │   └── prospects/
│   │   │       └── search/
│   │   │           ├── route.test.ts
│   │   │           └── route.ts
│   │   ├── favicon.ico
│   │   ├── globals.css
│   │   ├── layout.tsx
│   │   ├── page.module.css
│   │   └── page.tsx
│   ├── components/
│   │   └── ProspectCard.tsx
│   ├── data/
│   │   ├── prospects.ts
│   │   └── real-firms.ts
│   ├── generated/
│   │   └── prisma/
│   ├── lib/
│   │   └── prisma.ts
│   ├── types/
│   │   └── prospect.ts
│   └── utils/
│       ├── prospectMatcher.test.ts
│       └── prospectMatcher.ts
├── tasks/
│   ├── current-task.md
│   ├── decisions.md
│   └── work.md
├── .env.example
├── .gitignore
├── BGLAD.md
├── CLAUDE.md
├── README.md
├── agents.md
├── eslint.config.mjs
├── next-env.d.ts
├── next.config.ts
├── package-lock.json
├── package.json
├── prisma.config.ts
└── tsconfig.json
```

---

## 2. package.json

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/package.json`
```json
{
  "name": "legal-prospecting-next-scaffold",
  "version": "0.1.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "eslint",
    "test": "vitest",
    "db:seed": "prisma db seed",
    "postinstall": "prisma generate"
  },
  "dependencies": {
    "@prisma/adapter-neon": "^7.8.0",
    "@prisma/client": "^7.8.0",
    "dotenv": "^17.4.2",
    "next": "16.2.9",
    "react": "19.2.4",
    "react-dom": "19.2.4"
  },
  "devDependencies": {
    "@types/node": "^20",
    "@types/react": "^19",
    "@types/react-dom": "^19",
    "eslint": "^9",
    "eslint-config-next": "16.2.9",
    "prisma": "^7.8.0",
    "tsx": "^4.22.4",
    "typescript": "^5",
    "vitest": "^1.6.0"
  },
  "prisma": {
    "seed": "tsx prisma/seed.ts"
  }
}
```

> [!NOTE]
> **OpenAI Dependency Status:** `openai` is **NOT** currently a dependency of the application.

---

## 3. Prisma

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/prisma/schema.prisma`
```prisma
// This is your Prisma schema file,
// learn more about it in the docs: https://pris.ly/d/prisma-schema

generator client {
  provider = "prisma-client-js"
  output   = "../src/generated/prisma"
}

datasource db {
  provider = "postgresql"
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
  zip                String
  zipExt             String?
  city               String
  state              String
  streetAddress      String?
  website            String?
  phone              String?
  email              String?
  practiceAreas      String[]
  attorneyCountRange String
  attorneys          String[]
  sourceType         SourceType
  sourceUrl          String?
  confidenceLevel    ConfidenceLevel    @default(UNKNOWN)
  verificationStatus VerificationStatus @default(CANDIDATE)
  lastCheckedDate    DateTime?
  globalNotes        String?
  createdAt          DateTime           @default(now())
  updatedAt          DateTime           @updatedAt

  @@index([zip])
  @@index([city, state])
}
```

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/prisma.config.ts`
```typescript
import "dotenv/config";
import { defineConfig, env } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts"
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
```

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/lib/prisma.ts`
```typescript
import "server-only";
import { PrismaNeon } from "@prisma/adapter-neon";
import { PrismaClient } from "../generated/prisma";

const prismaClientSingleton = () => {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error(
      "Database connection URL is missing. Please set DIRECT_URL or DATABASE_URL in your environment variables."
    );
  }
  const adapter = new PrismaNeon({ connectionString });
  return new PrismaClient({ adapter });
};

declare const globalThis: {
  prismaGlobal: ReturnType<typeof prismaClientSingleton>;
} & typeof global;

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton();

export default prisma;

if (process.env.NODE_ENV !== "production") {
  globalThis.prismaGlobal = prisma;
}
```

---

## 4. Search API Route

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/app/api/prospects/search/route.ts`
```typescript
import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { normalizeZipCode } from "../../../../utils/prospectMatcher";
import type { Prospect } from "../../../../types/prospect";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get("zip");

    if (!zip) {
      return NextResponse.json(
        { error: "ZIP code query parameter is required." },
        { status: 400 }
      );
    }

    const normalizedZip = normalizeZipCode(zip);
    if (!normalizedZip) {
      return NextResponse.json(
        { error: "Invalid ZIP code format. Please provide a valid 5-digit or ZIP+4 code." },
        { status: 400 }
      );
    }

    // Query Neon database via Prisma Client, ordering alphabetically by firmName ascending.
    const firms = await prisma.firm.findMany({
      where: {
        zip: normalizedZip,
      },
      orderBy: {
        firmName: "asc",
      },
    });

    // Map database rows to the frontend Prospect shape
    const results: Prospect[] = firms.map((firm) => ({
      id: firm.id,
      firmName: firm.firmName,
      zip: firm.zip,
      zipExt: firm.zipExt,
      city: firm.city,
      state: firm.state,
      streetAddress: firm.streetAddress,
      website: firm.website,
      phone: firm.phone,
      email: firm.email,
      practiceAreas: firm.practiceAreas,
      attorneyCountRange: firm.attorneyCountRange,
      attorneys: firm.attorneys,
      sourceType: firm.sourceType,
      sourceUrl: firm.sourceUrl,
      confidenceLevel: firm.confidenceLevel,
      verificationStatus: firm.verificationStatus,
      lastCheckedDate: firm.lastCheckedDate ? firm.lastCheckedDate.toISOString() : null,
      globalNotes: firm.globalNotes,
    }));

    // Sort results by confidence level: HIGH (3) > MEDIUM (2) > LOW (1) > UNKNOWN/others (0).
    // Within the same confidence level, sort alphabetically by firm name.
    const confidenceRank: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    results.sort((a, b) => {
      const bRank = confidenceRank[b.confidenceLevel] ?? 0;
      const aRank = confidenceRank[a.confidenceLevel] ?? 0;

      if (bRank !== aRank) {
        return bRank - aRank;
      }

      return a.firmName.localeCompare(b.firmName);
    });

    return NextResponse.json({
      query: {
        zip,
        normalizedZip,
      },
      results,
    });
  } catch (error) {
    console.error("Error searching prospects by ZIP code:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred while searching for prospects." },
      { status: 500 }
    );
  }
}
```

> [!NOTE]
> **Runtime / Duration Configuration:** There is **NO** custom `runtime` configuration (e.g. `export const runtime = 'edge'`) or `maxDuration` custom config defined in this route file or its GET handler. It executes on standard Node.js serverless functions with standard defaults.

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/app/api/prospects/search/route.test.ts`
```typescript
import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET } from "./route";
import { NextRequest } from "next/server";
import prisma from "../../../../lib/prisma";

// Mock the prisma client helper
vi.mock("../../../../lib/prisma", () => ({
  default: {
    firm: {
      findMany: vi.fn(),
    },
  },
}));

describe("GET /api/prospects/search", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should return 400 if zip query parameter is missing", async () => {
    const request = new NextRequest("http://localhost/api/prospects/search");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("ZIP code query parameter is required");
  });

  it("should return 400 if zip query parameter is invalid", async () => {
    const request = new NextRequest("http://localhost/api/prospects/search?zip=123");
    const response = await GET(request);
    expect(response.status).toBe(400);
    const data = await response.json();
    expect(data.error).toContain("Invalid ZIP code format");
  });

  it("should return 200 with matching prospects from the database", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Alpha Law",
        zip: "19103",
        zipExt: null,
        city: "Philadelphia",
        state: "PA",
        streetAddress: "123 Market St",
        website: "https://alpha.com",
        phone: "555-0101",
        email: "contact@alpha.com",
        practiceAreas: ["Corporate"],
        attorneyCountRange: "5-10",
        attorneys: ["John Doe"],
        sourceType: "MANUAL_SEED",
        sourceUrl: null,
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
        globalNotes: "Some note",
      },
    ];

    vi.mocked(prisma.firm.findMany).mockResolvedValue(mockFirms as any);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.query.zip).toBe("19103");
    expect(data.query.normalizedZip).toBe("19103");
    expect(data.results).toHaveLength(1);
    expect(data.results[0]).toEqual({
      id: "firm-1",
      firmName: "Alpha Law",
      zip: "19103",
      zipExt: null,
      city: "Philadelphia",
      state: "PA",
      streetAddress: "123 Market St",
      website: "https://alpha.com",
      phone: "555-0101",
      email: "contact@alpha.com",
      practiceAreas: ["Corporate"],
      attorneyCountRange: "5-10",
      attorneys: ["John Doe"],
      sourceType: "MANUAL_SEED",
      sourceUrl: null,
      confidenceLevel: "HIGH",
      verificationStatus: "VERIFIED",
      lastCheckedDate: "2026-06-17T12:00:00.000Z",
      globalNotes: "Some note",
    });

    expect(prisma.firm.findMany).toHaveBeenCalledWith({
      where: { zip: "19103" },
      orderBy: { firmName: "asc" },
    });
  });

  it("should support and normalize ZIP+4 format queries to the base 5 digits", async () => {
    vi.mocked(prisma.firm.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103-1234");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.query.zip).toBe("19103-1234");
    expect(data.query.normalizedZip).toBe("19103");
    expect(prisma.firm.findMany).toHaveBeenCalledWith({
      where: { zip: "19103" },
      orderBy: { firmName: "asc" },
    });
  });

  it("should return an empty results array with status 200 if no firms match the ZIP", async () => {
    vi.mocked(prisma.firm.findMany).mockResolvedValue([]);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=90210");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toEqual([]);
  });

  it("should return status 500 if the database query fails", async () => {
    vi.mocked(prisma.firm.findMany).mockRejectedValue(new Error("DB Connection Error"));

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(500);

    const data = await response.json();
    expect(data.error).toContain("unexpected error occurred");
  });

  it("should sort results by confidenceLevel descending, then alphabetically by firmName", async () => {
    const mockFirms = [
      {
        id: "firm-1",
        firmName: "Zeta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "LOW",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-2",
        firmName: "Alpha Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-3",
        firmName: "Beta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "MEDIUM",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-4",
        firmName: "Gamma Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "HIGH",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
      {
        id: "firm-5",
        firmName: "Delta Law",
        zip: "19103",
        sourceType: "MANUAL_SEED",
        confidenceLevel: "UNKNOWN",
        verificationStatus: "VERIFIED",
        lastCheckedDate: new Date("2026-06-17T12:00:00.000Z"),
      },
    ];

    vi.mocked(prisma.firm.findMany).mockResolvedValue(mockFirms as any);

    const request = new NextRequest("http://localhost/api/prospects/search?zip=19103");
    const response = await GET(request);
    expect(response.status).toBe(200);

    const data = await response.json();
    expect(data.results).toHaveLength(5);

    // Expected order:
    // 1. Alpha Law (HIGH)
    // 2. Gamma Law (HIGH) -> alphabetical tiebreaker: Alpha before Gamma
    // 3. Beta Law (MEDIUM)
    // 4. Zeta Law (LOW)
    // 5. Delta Law (UNKNOWN)
    expect(data.results[0].firmName).toBe("Alpha Law");
    expect(data.results[1].firmName).toBe("Gamma Law");
    expect(data.results[2].firmName).toBe("Beta Law");
    expect(data.results[3].firmName).toBe("Zeta Law");
    expect(data.results[4].firmName).toBe("Delta Law");
  });
});
```

---

## 5. Search UI

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/app/page.tsx`
```tsx
"use client";

import { useState } from "react";
import { normalizeZipCode } from "@/utils/prospectMatcher";
import { ProspectCard } from "@/components/ProspectCard";
import type { Prospect } from "@/types/prospect";

export default function Home() {
  const [searchZip, setSearchZip] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedProspects, setExpandedProspects] = useState<Record<string, boolean>>({});
  const [savedProspectIds, setSavedProspectIds] = useState<string[]>([]);
  const [matchingProspects, setMatchingProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate searches while loading

    const trimmed = searchZip.trim();

    if (!trimmed) {
      setError("Please enter a ZIP code.");
      setSearchedZip(null);
      setMatchingProspects([]);
      setExpandedProspects({});
      return;
    }

    const normalized = normalizeZipCode(trimmed);
    if (!normalized) {
      setError("Please enter a valid ZIP code.");
      setSearchedZip(null);
      setMatchingProspects([]);
      setExpandedProspects({});
      return;
    }

    setError(null);
    setIsLoading(true);
    setExpandedProspects({});

    try {
      const response = await fetch(`/api/prospects/search?zip=${encodeURIComponent(trimmed)}`);
      
      if (!response.ok) {
        let errMsg = "We could not complete the search right now. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {
          // ignore parsing error
        }
        setError(errMsg);
        setSearchedZip(null);
        setMatchingProspects([]);
      } else {
        const data = await response.json();
        setSearchedZip(normalized);
        setMatchingProspects(data.results || []);
      }
    } catch (err) {
      setError("We could not complete the search right now. Please try again.");
      setSearchedZip(null);
      setMatchingProspects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProspects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSave = (id: string) => {
    setSavedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Legal Prospect Search</span>
        </div>
        <h1 className="title">Legal Prospector</h1>
        <p className="subtitle">
          ZIP-based law firm prospecting for finding small and boutique law firm leads.
        </p>
      </header>

      <main className="search-card">
        <form onSubmit={handleSearch}>
          <label className="search-label" htmlFor="zip-search">
            Search Law Firms by ZIP Code
          </label>
          <div className="search-group">
            <input
              id="zip-search"
              type="text"
              className="search-input"
              placeholder="Enter 5-digit ZIP code (e.g., 19103)"
              value={searchZip}
              onChange={(e) => {
                setSearchZip(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      </main>

      <section className="results-section">
        {isLoading ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">⏳</span>
            <h3 className="placeholder-title">Searching Database...</h3>
            <p className="placeholder-desc">
              Querying stored database records for ZIP <strong>{normalizeZipCode(searchZip) || searchZip}</strong>.
            </p>
          </div>
        ) : searchedZip === null ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">🔍</span>
            <h3 className="placeholder-title">Ready for Search</h3>
            <p className="placeholder-desc">
              Enter a 5-digit ZIP code above (try <strong>19103</strong> to see pilot prospects) to begin ZIP-code search for boutique law firms.
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-header-main">
                <h2 className="results-title">Pilot Prospects for ZIP {searchedZip}</h2>
                {savedProspectIds.length > 0 && (
                  <span className="saved-count-badge">
                    Saved this session: {savedProspectIds.length}
                  </span>
                )}
              </div>
              <p className="results-subtitle">
                Currently showing a small pilot dataset: seeded demo prospects plus manually reviewed real-firm records pending final verification.{" "}
                {savedProspectIds.length > 0 && (
                  <span className="saved-helper-text">Saved for this browser session only.</span>
                )}
              </p>
            </div>

            <div className="prospects-list">
              {matchingProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  isExpanded={!!expandedProspects[prospect.id]}
                  isSaved={savedProspectIds.includes(prospect.id)}
                  onToggleExpand={toggleExpand}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="placeholder-card">
            <span className="placeholder-icon">⚠️</span>
            <h3 className="placeholder-title">No prospects found</h3>
            <p className="placeholder-desc">
              No prospects found for this ZIP code in the current pilot dataset. Please search for ZIP <strong>19103</strong> to view pilot prospect data.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
```

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/components/ProspectCard.tsx`
```tsx
import type { Prospect } from "@/types/prospect";

interface ProspectCardProps {
  prospect: Prospect;
  isExpanded: boolean;
  isSaved: boolean;
  onToggleExpand: (id: string) => void;
  onToggleSave: (id: string) => void;
}

export function ProspectCard({
  prospect,
  isExpanded,
  isSaved,
  onToggleExpand,
  onToggleSave,
}: ProspectCardProps) {
  return (
    <div className={`prospect-card ${isSaved ? "saved" : ""}`}>
      <div className="prospect-header">
        <h3 className="prospect-name">{prospect.firmName}</h3>
        <span
          className={`confidence-badge confidence-${prospect.confidenceLevel.toLowerCase()}`}
        >
          {prospect.confidenceLevel}
        </span>
      </div>

      <div className="prospect-meta">
        <span className="meta-item location">
          📍 {prospect.streetAddress ? `${prospect.streetAddress}, ` : ""}{prospect.city}, {prospect.state} {prospect.zip}{prospect.zipExt ? `-${prospect.zipExt}` : ""}
        </span>
        <span className="meta-item size">
          👥 {prospect.attorneyCountRange} attorneys
        </span>
      </div>

      <div className="prospect-practice-areas">
        {prospect.practiceAreas.map((area, i) => (
          <span key={i} className="practice-tag">
            {area}
          </span>
        ))}
      </div>

      {isExpanded && (
        <>
          <div className="prospect-contact">
            {prospect.phone && (
              <div className="contact-item">
                <span className="contact-label">Phone:</span>{" "}
                <span className="contact-value">{prospect.phone}</span>
              </div>
            )}
            {prospect.email && (
              <div className="contact-item">
                <span className="contact-label">Email:</span>{" "}
                <a href={`mailto:${prospect.email}`} className="contact-link">
                  {prospect.email}
                </a>
              </div>
            )}
            {prospect.website && (
              <div className="contact-item">
                <span className="contact-label">Website:</span>{" "}
                <a
                  href={prospect.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  {prospect.website.replace("https://", "")}
                </a>
              </div>
            )}
            {prospect.sourceUrl && (
              <div className="contact-item">
                <span className="contact-label">Source URL:</span>{" "}
                <a
                  href={prospect.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="contact-link"
                >
                  {prospect.sourceUrl.replace("https://", "").split("/")[0]}
                </a>
              </div>
            )}
            {prospect.attorneys && prospect.attorneys.length > 0 && (
              <div className="contact-item">
                <span className="contact-label">Attorneys:</span>{" "}
                <span className="contact-value">{prospect.attorneys.join(", ")}</span>
              </div>
            )}
          </div>

          {prospect.globalNotes && (
            <div className="prospect-notes">
              <span className="notes-label">Notes:</span> {prospect.globalNotes}
            </div>
          )}

          <div className="prospect-source">
            Verification: {prospect.verificationStatus} | Source: {prospect.sourceType}
            {prospect.lastCheckedDate && ` | Checked: ${prospect.lastCheckedDate}`}
          </div>
        </>
      )}

      <div className="prospect-actions">
        <button
          type="button"
          className="prospect-toggle-btn"
          onClick={() => onToggleExpand(prospect.id)}
          aria-expanded={isExpanded}
          aria-label={isExpanded ? `Hide details for ${prospect.firmName}` : `Show details for ${prospect.firmName}`}
        >
          {isExpanded ? "Hide details ▲" : "Show details ▼"}
        </button>
        <button
          type="button"
          className={`prospect-save-btn ${isSaved ? "saved" : ""}`}
          onClick={() => onToggleSave(prospect.id)}
          aria-pressed={isSaved}
          aria-label={isSaved ? `Unsave ${prospect.firmName}` : `Save ${prospect.firmName}`}
        >
          {isSaved ? "★ Saved" : "☆ Save"}
        </button>
      </div>
    </div>
  );
}
```

---

## 6. Data Contract

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/types/prospect.ts`
```typescript
export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type VerificationStatus =
  | "CANDIDATE"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "STALE";

export type SourceType =
  | "BAR_DIRECTORY"
  | "GOOGLE_MAPS"
  | "WEB_SCRAPE"
  | "MANUAL"
  | "MANUAL_SEED";

export interface Prospect {
  id: string;
  firmName: string;
  zip: string;
  zipExt?: string | null;
  city: string;
  state: string;
  streetAddress?: string | null;
  website: string | null;
  phone: string | null;
  email?: string | null;
  practiceAreas: string[];
  attorneyCountRange: string;
  attorneys?: string[];
  sourceType: SourceType;
  sourceUrl?: string | null;
  confidenceLevel: ConfidenceLevel;
  verificationStatus: VerificationStatus;
  lastCheckedDate?: string | null;
  globalNotes: string | null;
}
```

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/data/prospects.ts`
```typescript
import { Prospect } from "../types/prospect";

/**
 * Manual/Demo Seed Data for ZIP code 19103 (Center City, Philadelphia, PA).
 * Fictional firm names are used to comply with the project guidelines.
 */
export const SEED_PROSPECTS: Prospect[] = [
  {
    id: "prospect_001",
    firmName: "Liberty Legal Associates",
    zip: "19103",
    zipExt: "9999",
    city: "Philadelphia",
    state: "PA",
    streetAddress: "123 Demo Street (Demo Office)",
    website: "https://libertylegalphilly-demo.com",
    phone: "215-555-0101",
    email: "prospect1-demo@example.com",
    practiceAreas: ["Personal Injury", "Civil Litigation"],
    attorneyCountRange: "2-5",
    attorneys: ["Attorney Demo One, Esq.", "Attorney Demo Two, Esq."],
    sourceType: "MANUAL_SEED",
    sourceUrl: "https://example.com/demo-source-001",
    confidenceLevel: "UNKNOWN",
    verificationStatus: "CANDIDATE",
    lastCheckedDate: "2026-06-16",
    globalNotes: "Demo record representing a small personal injury firm in Center City Philadelphia."
  },
  {
    id: "prospect_002",
    firmName: "Rittenhouse Family Law Partners",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "456 Demo Avenue (Family Law Demo Suite)",
    website: "https://rittenhousefamilylaw-demo.com",
    phone: "215-555-0102",
    email: "prospect2-demo@example.com",
    practiceAreas: ["Divorce", "Child Custody", "Estate Planning"],
    attorneyCountRange: "1",
    attorneys: ["Solo Practitioner Demo, Esq."],
    sourceType: "MANUAL_SEED",
    sourceUrl: null,
    confidenceLevel: "UNKNOWN",
    verificationStatus: "CANDIDATE",
    lastCheckedDate: "2026-06-16",
    globalNotes: "Demo record representing a solo practitioner specializing in family law."
  },
  {
    id: "prospect_003",
    firmName: "Schuylkill IP Law Group",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "789 Demo Boulevard (IP Demo Suite)",
    website: "https://schuylkillip-demo.com",
    phone: "215-555-0103",
    email: null,
    practiceAreas: ["Patents", "Trademarks", "Copyrights"],
    attorneyCountRange: "6-10",
    attorneys: [],
    sourceType: "MANUAL_SEED",
    sourceUrl: "https://example.com/demo-source-003",
    confidenceLevel: "UNKNOWN",
    verificationStatus: "CANDIDATE",
    lastCheckedDate: null,
    globalNotes: "Demo record representing a boutique intellectual property firm."
  },
  {
    id: "prospect_004",
    firmName: "Broad Street Employment Law Group",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: null,
    website: null,
    phone: null,
    email: null,
    practiceAreas: ["Labor Relations", "Employment Law"],
    attorneyCountRange: "2-5",
    attorneys: undefined,
    sourceType: "MANUAL_SEED",
    sourceUrl: null,
    confidenceLevel: "UNKNOWN",
    verificationStatus: "CANDIDATE",
    lastCheckedDate: null,
    globalNotes: "Demo record representing a boutique employment law firm with minimal contact details."
  }
];
```

### File Path: `/Users/phillipanthony/Desktop/Phase02/legal-prospecting-planning-docs-starter/src/data/real-firms.ts`
```typescript
import type { Prospect } from "../types/prospect";

/**
 * Manually reviewed real law firm records.
 *
 * Do not add records here unless each one has been checked against:
 * - official firm website
 * - attorney/bar status source where applicable
 * - physical office location
 * - duplicate/domain checks
 *
 * Automated/model-generated records must not be added here as VERIFIED.
 */
export const REAL_FIRMS: Prospect[] = [
  {
    id: "firm-real-19103-martin-law",
    firmName: "Martin Law LLC",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1818 Market St, 35th Floor",
    website: "https://www.paworkinjury.com",
    phone: "215-587-8400",
    email: null,
    practiceAreas: [
      "Workers' Compensation",
      "Social Security Disability",
      "Long-Term Disability",
      "Veterans Benefits"
    ],
    attorneyCountRange: "11-20",
    attorneys: ["George Martin", "Matthew L. Wilson"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.paworkinjury.com/locations/philadelphia/",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  },
  {
    id: "firm-real-19103-ballard-spahr",
    firmName: "Ballard Spahr LLP",
    zip: "19103",
    zipExt: "7599",
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1735 Market Street, 51st Floor",
    website: "https://www.ballardspahr.com",
    phone: "215-665-8500",
    email: null,
    practiceAreas: [
      "Litigation",
      "Business and Transactions",
      "Finance",
      "Real Estate",
      "Intellectual Property"
    ],
    attorneyCountRange: "21+",
    attorneys: ["Marcel S. Pratt"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.ballardspahr.com/offices/philadelphia",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  },
  {
    id: "firm-real-19103-nissenbaum-law-group",
    firmName: "Nissenbaum Law Group, LLC",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1650 Market St, Suite 3600",
    website: "https://www.gdnlaw.com",
    phone: "215-523-9350",
    email: "gdn@gdnlaw.com",
    practiceAreas: [
      "Internet & Technology Law",
      "Intellectual Property",
      "Commercial Litigation",
      "Commercial Contracts"
    ],
    attorneyCountRange: "6-10",
    attorneys: ["Gary D. Nissenbaum"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.gdnlaw.com/pa-directions/",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  }
];
```

---

## 7. Environment Variable Names

The following environment variables are referenced in code or `.env.example`:

- `DATABASE_URL` (pasted as `REDACTED` value placeholder)
- `DIRECT_URL` (pasted as `REDACTED` value placeholder)
- `NODE_ENV` (checked in conditional check inside `prisma.ts`)

---

## 8. Tests

### Vitest Configuration:
There is **NO** standalone configuration file (such as `vitest.config.ts` or `vite.config.ts`) present in the root directory. Instead, Vitest is configured to execute directly under standard Next.js typescript environments relying on script mappings in `package.json` and imports:
- `"test": "vitest"` script mapping inside `package.json`.

### Existing Test Files:
1. `src/utils/prospectMatcher.test.ts` — Tests standard 5-digit and ZIP+4 format normalizations, robust spaces handling, regression assertions, and ZIP matching functions.
2. `src/app/api/prospects/search/route.test.ts` — Tests route search logic, query validation errors, normalized matching, mock Neon DB queries, empty results handling, and confidence level ranking sort order regression tests.

---

## Inventory Notes

When a user performs a search, the flow begins on `src/app/page.tsx`, where the typed ZIP code is normalized on the client and sent as a query parameter in a GET request to `/api/prospects/search?zip=<zip>`. The serverless route handler normalizes the input again to resolve base 5-digit segments and queries the Neon PostgreSQL database using the Prisma Client instance. The resulting rows are then mapped into standard `Prospect` shapes, sorted descending by their `confidenceLevel` (HIGH > MEDIUM > LOW > UNKNOWN) and ascending alphabetically by `firmName`, and returned to the client to render inside standard `ProspectCard` elements. The `Prospect`/`Firm` schema holds firm details (names, contacts, locations, practice areas, attorney count range, and status markers). Grafting a live OpenAI-based research and enrichment process synchronously within this flow presents three major challenges:
1. First, `openai` is missing from `package.json` dependencies and must be installed.
2. Second, the API route currently operates under Next.js serverless functions without explicit timeouts configured, meaning the standard execution limits of hosting platforms (like Vercel's 10-second serverless execution limits) will likely timeout if real-time web scraping and LLM processing are done synchronously.
3. Third, the current Prisma setup uses Neon database pooling with a `server-only` import, meaning database connection pooling must remain highly efficient and any asynchronous research engine worker threads or background tasks would need to coordinate carefully with global database pools to avoid connection leaks or exhaustion.

---
