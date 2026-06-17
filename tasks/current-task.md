# Phase 5.8 — Production DB-Backed Search Deployment Readiness

## Goal

Safely prepare and verify the production deployment of the DB-backed ZIP-code prospect search now that the homepage UI calls the API route created in Phase 5.6.

The product should continue to behave like the existing public MVP, but the search results should now come through the database-backed API rather than frontend-only static seed data.

## User Review Required

> [!IMPORTANT]
> This task is primarily a verification/deployment-readiness checkpoint.
>
> Do not add new product features.
> Do not add auth, saved-lead persistence, search history, scraping, enrichment, or real firm records.
> Do not edit `.env` with real secrets in code or documentation.
> Do not commit generated Prisma client files.
> Human controls all terminal commands, Vercel settings, Neon settings, and deployment actions.

## Current Context

Completed immediately before this task:

- Phase 5.6 created `GET /api/prospects/search?zip=<zip>`.
- Phase 5.7 wired the homepage ZIP-code search UI to that API route.
- Saved leads remain in-memory/client-side only.
- The UI copy should remain honest that the app is currently showing seeded demo/sample prospect data from the database.

## Scope

### Allowed

- Review production-readiness for DB-backed search.
- Confirm required production environment variables are documented as placeholders only.
- Confirm Vercel has the necessary Neon/Prisma environment variables configured by the human.
- Confirm the deployed site still loads publicly.
- Confirm production API responses are JSON, not HTML error pages.
- Confirm `19103`, `19103-1234`, invalid ZIPs, and no-result ZIPs behave correctly in production.
- Update `tasks/work.md` with a concise Phase 5.8 verification/deployment-readiness entry if appropriate.
- Update `tasks/current-task.md` to the next recommended task only after this verification checkpoint is complete.

### Forbidden

- No schema changes.
- No migration files.
- No seed-data changes.
- No new database tables.
- No auth/user/session work.
- No saved leads persistence.
- No recent-search persistence.
- No scraping or enrichment.
- No real firm records.
- No dashboard expansion.
- No `.env` edits containing real secrets.
- No generated Prisma client files committed.
- No terminal commands run by the agent.

## Human Verification Commands

Run locally first:

```bash
npm run test
npm run build
npm run dev
```

Use the actual local port printed by Next.js:

```bash
curl -sS "http://localhost:<port>/api/prospects/search?zip=19103" | jq
curl -sS "http://localhost:<port>/api/prospects/search?zip=19103-1234" | jq
curl -sS "http://localhost:<port>/api/prospects/search?zip=90210" | jq
curl -i "http://localhost:<port>/api/prospects/search?zip=abc"
```

Expected local behavior:

- `19103` returns seeded demo prospects.
- `19103-1234` normalizes and returns the same seeded demo prospects.
- `90210` returns `200` with an empty `results` array.
- `abc` returns `400` with JSON, not HTML.

## Production Environment Checklist

The human should confirm in Vercel project settings that production has the required DB variables configured.

Likely required variables:

```text
DATABASE_URL=<Neon pooled connection string>
DIRECT_URL=<Neon direct connection string, if required by current Prisma/Neon setup>
```

Use actual project conventions from `.env.example` and `prisma.config.ts`.

Do not paste real values into chat, docs, commits, or task files.

## Production Verification

After deployment, test the public production URL:

```bash
curl -sS "https://legal-prospect.vercel.app/api/prospects/search?zip=19103" | jq
curl -sS "https://legal-prospect.vercel.app/api/prospects/search?zip=19103-1234" | jq
curl -sS "https://legal-prospect.vercel.app/api/prospects/search?zip=90210" | jq
curl -i "https://legal-prospect.vercel.app/api/prospects/search?zip=abc"
```

Also verify in the browser:

1. Open `https://legal-prospect.vercel.app`.
2. Search `19103`.
3. Search `19103-1234`.
4. Search `90210`.
5. Search invalid input like `abc`.
6. Confirm expand/collapse still works.
7. Confirm save/unsave still works during the browser session.
8. Refresh and confirm saved state clears as expected.
9. Confirm copy says the app is showing seeded demo/sample prospect data, not verified real firm records.

## Expected Completion Criteria

Phase 5.8 is complete when:

- Local tests pass.
- Local build passes.
- Local DB-backed UI behavior works.
- Production deployment has required environment variables configured by the human.
- Production API returns JSON responses for success and error cases.
- Production homepage search uses DB-backed results successfully.
- No secrets, generated files, schema changes, migrations, auth, saved-lead persistence, or scraping work were introduced.

## Next Recommended Task After Completion

After production DB-backed search is verified, the next safe product task is likely:

```text
Phase 6.1 — Define the first small verified real-firm data intake workflow
```

This should be planning-first, not scraping-first.

It should define:

- target geography
- allowed sources
- verification rules
- fields to capture
- confidence/verification status handling
- duplicate handling
- human review process
- what counts as a safe first real prospect record

Do not add real data until the intake workflow is approved.