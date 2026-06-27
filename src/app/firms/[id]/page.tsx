import { notFound } from "next/navigation";
import type { Metadata } from "next";
import prisma from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth/session";
import { practiceAreaInclude, getPracticeAreaNames } from "@/lib/practiceAreas";
import { firmConfidenceTier } from "@/lib/confidence";
import type { Prospect } from "@/types/prospect";
import { FirmDetail } from "@/components/FirmDetail";

interface PageProps {
  params: Promise<{ id: string }>;
}

// Resolves a firm by its slug first, falling back to the raw id
async function getFirmBySlugOrId(param: string, includePracticeAreas = false) {
  return prisma.firm.findFirst({
    where: {
      OR: [
        { slug: param },
        { id: param }
      ]
    },
    ...(includePracticeAreas ? { include: practiceAreaInclude } : {})
  });
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { id } = await params;
  const firm = await getFirmBySlugOrId(id);

  if (!firm) {
    return {
      title: "Firm Profile Not Found - Legal Prospector",
    };
  }

  return {
    title: `${firm.firmName} - Legal Prospector`,
    description: `View profile and prospecting details for ${firm.firmName} in ${firm.city}, ${firm.state}.`,
  };
}

export default async function FirmDetailPage({ params }: PageProps) {
  const { id } = await params;

  // Retrieve firm from DB including practice area links
  const firm = await getFirmBySlugOrId(id, true);

  if (!firm) {
    notFound();
  }

  // Retrieve current user and look up saved lead if signed in
  const user = await getCurrentUser();
  let isSaved = false;
  let savedStatus: any = null;
  let savedAt: any = null;

  if (user) {
    const lead = await prisma.savedLead.findUnique({
      where: {
        userId_firmId: {
          userId: user.id,
          firmId: firm.id,
        },
      },
    });
    if (lead) {
      isSaved = true;
      savedStatus = lead.status ?? null;
      savedAt = lead.createdAt ?? null;
    }
  }

  // Map firm DB fields to the Prospect interface
  const prospect: Prospect = {
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
    practiceAreas: getPracticeAreaNames(firm),
    attorneyCountRange: firm.attorneyCountRange,
    attorneys: firm.attorneys,
    sourceType: firm.sourceType,
    sourceUrl: firm.sourceUrl,
    confidenceLevel: firm.confidenceLevel,
    confidenceTier: firmConfidenceTier({
      emailSource: firm.emailSource,
      phoneSource: firm.phoneSource,
    }),
    verificationStatus: firm.verificationStatus,
    lastCheckedDate: firm.lastCheckedDate ? firm.lastCheckedDate.toISOString() : null,
    globalNotes: firm.globalNotes,
  };

  return (
    <div className="app-wrapper">
      <FirmDetail
        prospect={prospect}
        isSignedIn={!!user}
        isSaved={isSaved}
        savedStatus={savedStatus}
        savedAt={savedAt ? savedAt.toISOString() : null}
      />
    </div>
  );
}
