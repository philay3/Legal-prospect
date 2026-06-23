import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "../../../../lib/auth/session";
import prisma from "../../../../lib/prisma";
import { enrichDecision } from "../../../../lib/research/enrichDecision";
import { findContactEmail } from "../../../../lib/research/enrichContactEmail";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    let body;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { firmId } = body;
    if (typeof firmId !== "string" || !firmId.trim()) {
      return NextResponse.json(
        { error: "firmId is required and must be a non-empty string" },
        { status: 400 }
      );
    }
    const id = firmId.trim();

    // Only enrich a firm the user has actually saved.
    const saved = await prisma.savedLead.findUnique({
      where: { userId_firmId: { userId: user.id, firmId: id } },
    });
    if (!saved) {
      return NextResponse.json({ error: "Lead not saved" }, { status: 403 });
    }

    const firm = await prisma.firm.findUnique({ where: { id } });
    if (!firm) {
      return NextResponse.json({ error: "Firm not found" }, { status: 404 });
    }

    const decision = enrichDecision(firm.email, firm.emailCheckedAt);
    if (decision === "use-email") {
      return NextResponse.json({ ok: true, email: firm.email, cached: true });
    }
    if (decision === "skip") {
      return NextResponse.json({ ok: true, email: null, cached: true });
    }

    // decision === "fetch": attempt enrichment and record the attempt
    const email = firm.website ? await findContactEmail(firm.website) : null;
    await prisma.firm.update({
      where: { id },
      data: { email: email ?? undefined, emailCheckedAt: new Date() },
    });
    return NextResponse.json({ ok: true, email: email ?? null });
  } catch (error) {
    console.error("Error in POST /api/leads/enrich:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
