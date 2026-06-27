import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { normalizeZipCode, filterByZip } from "../../../../utils/prospectMatcher";
import type { Prospect } from "../../../../types/prospect";
import { runLeadResearch } from "../../../../lib/research/runLeadResearch";
import { saveResearchFirms } from "../../../../lib/db/saveResearchFirms";
import { practiceAreaInclude, getPracticeAreaNames } from "../../../../lib/practiceAreas";
import { firmConfidenceTier } from "../../../../lib/confidence";

export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const zip = searchParams.get("zip");
    const refresh = searchParams.get("refresh") === "true";

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
    let firms = await prisma.firm.findMany({
      where: {
        searchZip: normalizedZip,
      },
      ...(process.env.NODE_ENV !== "test" ? { include: practiceAreaInclude } : {}),
      orderBy: {
        firmName: "asc",
      },
    });

    // Cache-first: if no records found or refresh is requested, run live research
    if (firms.length === 0 || refresh) {
      console.log(`[api/search] Cache miss or refresh for ZIP ${normalizedZip}. Running research.`);
      try {
        const researchResult = await runLeadResearch(normalizedZip, "thorough");
        console.log(`[api/search] Discovered ${researchResult.firms.length} firms from live research.`);
        await saveResearchFirms(normalizedZip, researchResult.firms);

        // Re-query database to fetch newly saved results
        firms = await prisma.firm.findMany({
          where: {
            searchZip: normalizedZip,
          },
          ...(process.env.NODE_ENV !== "test" ? { include: practiceAreaInclude } : {}),
          orderBy: {
            firmName: "asc",
          },
        });
        console.log(`[api/search] DB read-back after save returned ${firms.length} rows for ZIP ${normalizedZip}.`);

        // Best-effort audit trail persistence
        if (researchResult.audit && researchResult.audit.length > 0) {
          try {
            const { persistResearchAudit } = await import("../../../../lib/db/persistResearchAudit");
            await persistResearchAudit({
              searchZip: normalizedZip,
              savedFirms: firms,
              auditEntries: researchResult.audit,
            });
          } catch (auditError) {
            console.error("[api/search] Failed to persist research audit:", auditError);
          }
        }
      } catch (researchError) {
        console.error(`[api/search] Live research failed for ZIP ${normalizedZip}:`, researchError);
        return NextResponse.json({
          query: {
            zip,
            normalizedZip,
          },
          results: [],
          warning: "Live research failed. Returning empty results.",
        });
      }
    } else {
      console.log(`[api/search] Cache hit: DB returned ${firms.length} rows for ZIP ${normalizedZip}.`);
    }

    // Filter database rows to return only matching ZIP codes
    const matched = filterByZip(firms, normalizedZip);

    // Map database rows to the frontend Prospect shape
    const results: Prospect[] = matched.map((firm) => ({
      id: firm.id,
      slug: firm.slug,
      firmName: firm.firmName,
      zip: firm.zip,
      zipExt: firm.zipExt,
      searchZip: firm.searchZip,
      city: firm.city,
      state: firm.state,
      streetAddress: firm.streetAddress,
      website: firm.website,
      phone: firm.phone,
      email: firm.email,
      practiceAreas: getPracticeAreaNames(firm as any),
      attorneyCountRange: firm.attorneyCountRange,
      attorneys: firm.attorneys,
      sourceType: firm.sourceType,
      sourceUrl: firm.sourceUrl,
      confidenceLevel: firm.confidenceLevel,
      confidenceTier: firmConfidenceTier({ emailSource: firm.emailSource, phoneSource: firm.phoneSource }),
      verificationStatus: firm.verificationStatus,
      lastCheckedDate: firm.lastCheckedDate ? firm.lastCheckedDate.toISOString() : null,
      globalNotes: firm.globalNotes,
    }));

    // Sort results:
    // 1. Email first: non-empty string vs. null/empty/undefined
    // 2. Then tier: HIGH > MEDIUM > LOW
    // 3. Then name: alphabetical ascending
    const tierRank: Record<string, number> = {
      HIGH: 3,
      MEDIUM: 2,
      LOW: 1,
    };

    results.sort((a, b) => {
      const aHasEmail = typeof a.email === "string" && a.email.length > 0;
      const bHasEmail = typeof b.email === "string" && b.email.length > 0;

      if (aHasEmail !== bHasEmail) {
        return aHasEmail ? -1 : 1;
      }

      const aTierRank = tierRank[a.confidenceTier ?? "LOW"] ?? 0;
      const bTierRank = tierRank[b.confidenceTier ?? "LOW"] ?? 0;
      if (aTierRank !== bTierRank) {
        return bTierRank - aTierRank;
      }

      return a.firmName.localeCompare(b.firmName);
    });

    console.log(`[api/search] Response will contain ${results.length} firms for ZIP ${normalizedZip}.`);

    // Best-effort user activity logging
    if (process.env.NODE_ENV !== "test" && results.length > 0) {
      try {
        const { getCurrentUser } = await import("../../../../lib/auth/session");
        const { logActivity } = await import("../../../../lib/activity");
        const user = await getCurrentUser().catch(() => null);
        if (user) {
          await logActivity(user.id, { type: "SEARCHED", query: normalizedZip }).catch(() => {});
        }
      } catch (error) {
        console.error("Failed to log SEARCHED activity dynamically:", error);
      }
    }

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
