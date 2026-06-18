import { NextRequest, NextResponse } from "next/server";
import prisma from "../../../../lib/prisma";
import { normalizeZipCode } from "../../../../utils/prospectMatcher";
import type { Prospect } from "../../../../types/prospect";
import { runLeadResearch } from "../../../../lib/research/runLeadResearch";
import { saveResearchFirms } from "../../../../lib/db/saveResearchFirms";

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
        zip: normalizedZip,
      },
      orderBy: {
        firmName: "asc",
      },
    });

    // Cache-first: if no records found or refresh is requested, run live research
    if (firms.length === 0 || refresh) {
      console.log(`[api/search] Cache miss or refresh for ZIP ${normalizedZip}. Running research.`);
      try {
        const researchResult = await runLeadResearch(normalizedZip, "thorough");
        await saveResearchFirms(normalizedZip, researchResult.firms);

        // Re-query database to fetch newly saved results
        firms = await prisma.firm.findMany({
          where: {
            zip: normalizedZip,
          },
          orderBy: {
            firmName: "asc",
          },
        });
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
    }

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
