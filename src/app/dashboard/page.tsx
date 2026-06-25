import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedLeads, getPipelineCounts } from "@/lib/leads";
import { getRecentActivity, getRecentSearches, countWonThisWeek } from "@/lib/activity";
import { formatRelativeTime, formatActivityEvent } from "@/utils/activityFeed";
import { DashboardSearch } from "@/components/DashboardSearch";
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

  // Fetch all dashboard data concurrently
  const [pipelineCounts, wonThisWeek, recentActivity, recentSearches, savedLeads] = await Promise.all([
    getPipelineCounts(user.id),
    countWonThisWeek(user.id),
    getRecentActivity(user.id, 8), // fetch up to 8 activity items
    getRecentSearches(user.id, 6),   // fetch up to 6 recent search chips
    listSavedLeads(user.id, 5),      // fetch up to 5 saved leads
  ]);

  // Extract first name from email
  const emailPart = user.email.split("@")[0];
  const namePart = emailPart.split(/[\._-]/)[0];
  const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  return (
    <div className="app-wrapper dashboard-container">
      <header className="dashboard-header">
        <div className="dashboard-header-left">
          <div className="badge">
            <span className="pulse-dot"></span>
            <span>Prospecting Dashboard</span>
          </div>
          <h1 className="title">Welcome back, {firstName}</h1>
          <p className="subtitle">Your central hub for saved leads and prospecting insights.</p>
        </div>
        <div className="dashboard-header-right">
          <DashboardSearch />
        </div>
      </header>

      {/* Pipeline Cards Grid */}
      <section className="pipeline-grid">
        <Link
          href="/leads?status=active"
          className="pipeline-card active-card"
          style={{ textDecoration: "none" }}
        >
          <span className="pipeline-label">Active Leads</span>
          <span className="pipeline-count mono">{pipelineCounts.active}</span>
          <span className="pipeline-trend text-active">Currently prospecting</span>
        </Link>
        <Link
          href="/leads?status=won"
          className="pipeline-card won-card"
          style={{ textDecoration: "none" }}
        >
          <span className="pipeline-label">Won Leads</span>
          <span className="pipeline-count mono">{pipelineCounts.won}</span>
          <span className="pipeline-trend text-won">
            {wonThisWeek > 0 ? `+${wonThisWeek} this week` : "High value targets"}
          </span>
        </Link>
        <Link
          href="/leads?status=lost"
          className="pipeline-card lost-card"
          style={{ textDecoration: "none" }}
        >
          <span className="pipeline-label">Lost Leads</span>
          <span className="pipeline-count mono">{pipelineCounts.lost}</span>
          <span className="pipeline-trend text-lost">Closed prospects</span>
        </Link>
      </section>

      {/* Main Two-Column Layout */}
      <main className="dashboard-main-grid">
        {/* Left Column: Saved Leads */}
        <section className="dashboard-card-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Saved Leads</h2>
              <p className="panel-subtitle">Your bookmarked law firm prospects</p>
            </div>
            {pipelineCounts.active + pipelineCounts.won + pipelineCounts.lost > 0 && (
              <Link href="/leads" className="panel-link">
                View all &rarr;
              </Link>
            )}
          </div>

          <div className="panel-content">
            {savedLeads.length > 0 ? (
              <div className="dashboard-leads-list">
                {savedLeads.map((lead) => {
                  const statusClass = lead.status.toLowerCase();
                  return (
                    <div key={lead.id} className="dashboard-lead-row">
                      <div className="lead-row-left">
                        <div className="lead-name-row">
                          <span className="lead-firm-name">{lead.firm.firmName}</span>
                          <span className={`lead-status ${statusClass}`}>{lead.status}</span>
                        </div>
                        <div className="lead-details-row">
                          <span>{lead.firm.city}, {lead.firm.state}</span>
                          {lead.firm.phone && (
                            <>
                              <span className="bullet-divider">&bull;</span>
                              <span>{lead.firm.phone}</span>
                            </>
                          )}
                        </div>
                      </div>
                      <div className="lead-row-right">
                        <span className="lead-time">{formatRelativeTime(lead.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-panel">
                <span className="empty-icon">📋</span>
                <p className="empty-text">No saved leads yet. Bookmark law firms during searches to track them here.</p>
                <Link href="/" className="empty-action-btn">Start Searching</Link>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Activity Feed */}
        <section className="dashboard-card-panel">
          <div className="panel-header">
            <div>
              <h2 className="panel-title">Recent Activity</h2>
              <p className="panel-subtitle">History of searches, saves, and updates</p>
            </div>
          </div>

          <div className="panel-content">
            {recentActivity.length > 0 ? (
              <div className="activity-feed">
                {recentActivity.map((activity) => {
                  const details = formatActivityEvent(activity);
                  return (
                    <div key={activity.id} className="activity-row">
                      <span className={`activity-dot dot-${details.kind}`}></span>
                      <div className="activity-text-container">
                        <div className="activity-main-text">
                          <span className="activity-label">{details.label}</span>{" "}
                          <span className="activity-subject">{details.subject}</span>
                        </div>
                        <span className="activity-time">{formatRelativeTime(activity.createdAt)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-panel">
                <span className="empty-icon">⚡</span>
                <p className="empty-text">No recent activity. Perform searches or save leads to generate activity logs.</p>
              </div>
            )}

            {/* Recent Searches Chips */}
            <div className="recent-searches-section">
              <h3 className="recent-searches-title">Recent Searches</h3>
              {recentSearches.length > 0 ? (
                <div className="search-chips-container">
                  {recentSearches.map((zip, idx) => (
                    <Link key={`${zip}-${idx}`} href={`/?zip=${zip}`} className="search-chip mono">
                      {zip}
                    </Link>
                  ))}
                </div>
              ) : (
                <p className="empty-chips-text">No recent ZIP searches.</p>
              )}
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
