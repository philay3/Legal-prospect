import { redirect } from "next/navigation";
import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedLeads, getPipelineCounts } from "@/lib/leads";
import { getPracticeAreaNames } from "@/lib/practiceAreas";
import { SavedLeadsClientPage } from "@/components/SavedLeadsClientPage";
import type { Prospect } from "@/types/prospect";
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

  const prospects: Prospect[] = saved.map((item) => ({
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
  }));

  const savedFirmIds = prospects.map((p) => p.id);

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Saved Leads</span>
        </div>
        <h1 className="title">Your Saved Leads</h1>
        <p className="subtitle">
          Keep track of promising boutique law firms you've bookmarked.
        </p>
      </header>

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
