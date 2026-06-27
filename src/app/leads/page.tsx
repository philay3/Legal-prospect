import { redirect } from "next/navigation";
import { Suspense } from "react";
import Link from "next/link";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedLeads, getPipelineCounts } from "@/lib/leads";
import { getPracticeAreaNames } from "@/lib/practiceAreas";
import { SavedLeadsClientPage } from "@/components/SavedLeadsClientPage";
import type { SavedLeadRow } from "@/types/prospect";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Saved Leads - Legal Prospector",
  description: "View and manage your saved law firm leads.",
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  // Load all saved leads and status pipeline counts from DB
  const [saved, counts] = await Promise.all([
    listSavedLeads(user.id),
    getPipelineCounts(user.id),
  ]);

  const prospects: SavedLeadRow[] = saved.map((item) => ({
    id: item.firm.id, // Explicit database ID mapping
    firmName: item.firm.firmName,
    zip: item.firm.zip,
    zipExt: item.firm.zipExt,
    searchZip: item.firm.searchZip,
    city: item.firm.city,
    state: item.firm.state,
    streetAddress: item.firm.streetAddress,
    website: item.firm.website,
    phone: item.firm.phone,
    email: item.firm.email,
    practiceAreas: getPracticeAreaNames(item.firm),
    attorneyCountRange: item.firm.attorneyCountRange,
    attorneys: item.firm.attorneys,
    sourceType: item.firm.sourceType,
    sourceUrl: item.firm.sourceUrl,
    confidenceLevel: item.firm.confidenceLevel,
    verificationStatus: item.firm.verificationStatus,
    lastCheckedDate: item.firm.lastCheckedDate ? item.firm.lastCheckedDate.toISOString() : null,
    globalNotes: item.firm.globalNotes,
    status: item.status,
    savedAt: item.createdAt.toISOString(),
    statusChangedAt: item.updatedAt.toISOString(),
  }));

  const savedFirmIds = prospects.map((p) => p.id);
  const total = counts.active + counts.won + counts.lost;

  return (
    <div className="app-wrapper rl-page">
      <div className="rl-leads-header">
        <div className="rl-leads-title-group">
          <h1 className="rl-leads-title">Saved leads</h1>
          <p className="rl-leads-subtitle">
            <span className="rl-count-highlight">{total}</span> leads in your pipeline
          </p>
        </div>
        <Link href="/" className="rl-leads-find-more">
          Find more &rarr;
        </Link>
      </div>

      {/* 
        Wrap searchParams client component in Suspense boundary 
        to ensure safety during static generation.
      */}
      <Suspense
        fallback={
          <div
            style={{
              textAlign: "center",
              color: "var(--text-muted)",
              marginTop: "2rem",
            }}
          >
            Loading saved leads...
          </div>
        }
      >
        <SavedLeadsClientPage
          initialLeads={prospects}
          counts={counts}
          savedFirmIds={savedFirmIds}
        />
      </Suspense>
    </div>
  );
}
