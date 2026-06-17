# 04 — Technical Specs

## Current Tech Stack

- Next.js App Router
- React
- TypeScript
- Prisma ORM
- Neon serverless PostgreSQL
- Next.js route handlers
- OpenAI / LLM research worker

## Architecture Summary

```text
Frontend UI
  -> Next.js route handlers
    -> Research/search logic
      -> LLM/search source
    -> Prisma ORM
      -> Neon PostgreSQL
  -> Results table / ZIP sidebar
```

## Core Data Model Direction

Use this model:

```text
ZIP code = durable data bucket
Search = one research attempt / event log
Firm = durable prospect record inside a ZIP
```

Durable ownership:

```text
ZipCode -> Firm
```

Searches are event logs.

`Firm.searchId` may exist for backward compatibility, but it should not be treated as the durable owner of a firm.

## Firm Uniqueness Direction

Preferred uniqueness direction:

```text
zipCodeId + firmName
```

Not:

```text
searchId + firmName
```

## Search Flow

Fresh search:

```text
User enters ZIP
-> POST /api/searches
-> Create/record search attempt
-> Discover firms
-> Save/merge firms under ZipCode
-> Return combined ZIP dataset
-> UI renders results
```

Cached ZIP load:

```text
User clicks ZIP in sidebar
-> GET /api/searches?zipCode=<zip>
-> Return combined cached firms for ZIP
-> UI renders results
-> No fresh research runs
```

## Expected API Behavior

### `GET /api/searches`

Purpose:

- Return ZIP summaries for sidebar/history.
- Should aggregate by ZIP rather than showing duplicate search attempts.

### `GET /api/searches?zipCode=<zip>`

Purpose:

- Return all cached firms for that ZIP.
- Should be fast.
- Should not trigger fresh research.

### `POST /api/searches`

Purpose:

- Run a fresh research attempt.
- Save/merge discovered firms.
- Return combined ZIP dataset.

Preferred final return shape:

```ts
return NextResponse.json({
  searchId: search.id,
  zipCode,
  firms: combinedFirms,
});
```

## Combined ZIP Dataset Query

Preferred pattern after saving fresh results:

```ts
const combinedFirms = await prisma.firm.findMany({
  where: {
    zipCode: {
      code: zipCode,
    },
  },
  include: {
    attorneys: true,
    zipCode: true,
  },
  orderBy: {
    firmName: "asc",
  },
});
```

## Firm Save Shape

Research results passed to saving should match:

```ts
{
  attorney_name: string | null;
  firm_name: string;
  address: string | null;
  phone: string | null;
  website: string | null;
  email: string | null;
}
```

If the frontend or Prisma model uses camelCase, map fields carefully instead of changing this shape accidentally.

## Data Safety Rules

Never:

- Run `npx prisma db push --accept-data-loss`.
- Reset the database.
- Drop tables.
- Drop columns.
- Delete real firm/search/ZIP/contact records.
- Overwrite useful non-null values with null or empty strings.
- Let weaker new research erase stronger existing data.

Schema changes require explicit approval.

## Search Provider Notes

Search has been fixed and is currently doing much better.

Still, if DuckDuckGo HTML scraping is part of the current pipeline, treat it as a reliability risk. Future provider options may include:

- OpenAI Responses API with web search tool, if available.
- Tavily.
- SerpAPI.
- Brave Search API.
- Google Programmable Search.
- Bing Web Search.

Rules:

- Use environment variables for API keys.
- Do not hardcode secrets.
- Do not log secrets.
- Keep provider logic isolated if replacing search source.

## Validation Notes

Validation should reject obvious bad fits, but should not over-filter.

Do not reject only because:

- Attorney count is unknown.
- Single-office status is unknown.
- Firm size is uncertain.

## Contact Enrichment Notes

Contact enrichment should:

- Run after firms are found.
- Be allowed to fail without blocking base results.
- Never invent phone/email/address.
- Never overwrite good existing values with null.

## UI Rules

The v1 UI should stay simple:

```text
Enter ZIP -> Search
```

Do not expose:

- Quick/thorough mode.
- Force refresh.
- Model selector.
- Mode selector.
- Deeper research toggle.

## Future Technical Ideas

Only after MVP stability:

- Firm detail view.
- Lead task model.
- Firm activity model.
- Saved lead dashboard.
- Search provider abstraction.
- Validation/enrichment pipelines.
- Export/reporting improvements.

## User Workspace Data Ownership

The app now has two data layers:

```text
Global Research Layer
- ZipCode
- Search
- Firm
- Attorney
- Enrichment data
- Cached ZIP results

User Workspace Layer
- UserSavedLead
- UserRecentZip
- Future notes/status/tasks