import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedLeads } from "@/lib/leads";
import { ResultsTable } from "@/components/ResultsTable";
import type { Prospect } from "@/types/prospect";
import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Saved Leads - Legal Prospector",
  description: "View and manage your saved law firm leads.",
};

export default async function LeadsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const saved = await listSavedLeads(user.id);

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
    practiceAreas: item.firm.practiceAreas,
    attorneyCountRange: item.firm.attorneyCountRange,
    attorneys: item.firm.attorneys,
    sourceType: item.firm.sourceType,
    sourceUrl: item.firm.sourceUrl,
    confidenceLevel: item.firm.confidenceLevel,
    verificationStatus: item.firm.verificationStatus,
    lastCheckedDate: item.firm.lastCheckedDate ? item.firm.lastCheckedDate.toISOString() : null,
    globalNotes: item.firm.globalNotes,
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

      {prospects.length > 0 ? (
        <section className="results-section">
          <ResultsTable
            prospects={prospects}
            removeOnUnsave={true}
            initialSignedIn={true}
            initialSavedFirmIds={savedFirmIds}
            variant="leads"
          />
        </section>
      ) : (
        <main className="search-card" style={{ padding: "2.5rem 2rem", textAlign: "center" }}>
          <span className="placeholder-icon" style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}>🔖</span>
          <h3 className="placeholder-title" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>No Saved Leads Yet</h3>
          <p className="placeholder-desc" style={{ marginBottom: "1.5rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}>
            Firms you bookmark during your searches will be listed here.
          </p>
          
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/" className="search-button" style={{ textDecoration: "none" }}>
              Start Searching
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}
