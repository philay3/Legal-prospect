import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { countSavedLeads, listSavedLeads } from "@/lib/leads";
import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Dashboard - Legal Prospector",
  description: "View your dashboard, saved leads, and prospecting statistics.",
};

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const count = await countSavedLeads(user.id);
  const recentLeads = await listSavedLeads(user.id, 5);

  return (
    <div className="app-wrapper" style={{ justifyContent: "center", minHeight: "60vh", maxWidth: "600px" }}>
      <header className="header" style={{ marginBottom: "1.5rem" }}>
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Prospecting Dashboard</span>
        </div>
        <h1 className="title">Welcome, {user.email}</h1>
        <p className="subtitle">Your central hub for saved leads and prospecting insights.</p>
      </header>

      <main className="search-card" style={{ padding: "2.5rem 2rem" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
          <div>
            <h3 className="placeholder-title" style={{ fontSize: "1.2rem", marginBottom: "0.25rem", textAlign: "left" }}>
              Saved Leads ({count})
            </h3>
            <p className="placeholder-desc" style={{ fontSize: "0.85rem", textAlign: "left" }}>
              Your bookmarked law firm prospects
            </p>
          </div>
          {count > 0 && (
            <Link href="/leads" className="contact-link" style={{ fontSize: "0.85rem", fontWeight: 600 }}>
              View all &rarr;
            </Link>
          )}
        </div>

        {recentLeads.length > 0 ? (
          <div style={{ display: "flex", flexDirection: "column", gap: "0.75rem", marginBottom: "1.5rem" }}>
            {recentLeads.map((lead) => (
              <div
                key={lead.id}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "0.75rem 1rem",
                  backgroundColor: "rgba(31, 41, 55, 0.3)",
                  border: "1px solid var(--card-border)",
                  borderRadius: "0.5rem",
                }}
              >
                <span style={{ fontWeight: 600, fontSize: "0.9rem" }}>{lead.firm.firmName}</span>
                <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>
                  {lead.firm.city}, {lead.firm.state}
                </span>
              </div>
            ))}
          </div>
        ) : (
          <div style={{ textAlign: "center", padding: "1.5rem 0" }}>
            <span className="placeholder-icon" style={{ fontSize: "1.5rem", marginBottom: "0.5rem", display: "block" }}>📋</span>
            <p className="placeholder-desc" style={{ marginBottom: "1.5rem" }}>
              No saved leads yet. Bookmark law firms during your searches to track them here.
            </p>
          </div>
        )}

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/" className="search-button" style={{ textDecoration: "none" }}>
            Start Searching
          </Link>
        </div>
      </main>
    </div>
  );
}
