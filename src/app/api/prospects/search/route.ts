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
