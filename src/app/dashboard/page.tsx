import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { listSavedLeads, getPipelineCounts } from "@/lib/leads";
import { getRecentActivity, getRecentSearchesWithTime } from "@/lib/activity";
import { formatRelativeTime, formatActivityEvent } from "@/utils/activityFeed";
import { getPracticeAreaNames } from "@/lib/practiceAreas";
import { leadActivityLine } from "@/utils/leadActivity";
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
  const [pipelineCounts, recentActivity, recentSearches, savedLeads] = await Promise.all([
    getPipelineCounts(user.id),
    getRecentActivity(user.id, 8),
    getRecentSearchesWithTime(user.id, 6),
    listSavedLeads(user.id, 6),
  ]);

  // Extract first name from email
  const emailPart = user.email.split("@")[0];
  const namePart = emailPart.split(/[\._-]/)[0];
  const firstName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

  // Compute stats
  const total = pipelineCounts.active + pipelineCounts.won + pipelineCounts.lost;
  const closed = pipelineCounts.won + pipelineCounts.lost;
  const closeRate = closed > 0 ? Math.round((pipelineCounts.won / closed) * 100) : null;

  // Greeting word from hour
  const now = new Date();
  const hour = now.getHours();
  let greeting = "evening";
  if (hour < 12) {
    greeting = "morning";
  } else if (hour < 18) {
    greeting = "afternoon";
  }

  // Date line "Wed · Jun 25, 2026"
  const weekday = now.toLocaleDateString("en-US", { weekday: "short" });
  const datePart = now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  const dateLine = `${weekday} · ${datePart}`;

  return (
    <div className="app-wrapper rl-page">
      {/* Title Row */}
      <header className="rl-dash-header">
        <div className="rl-dash-header-left">
          <h1 className="rl-dash-title">Dashboard</h1>
          <p className="rl-dash-subtitle">
            Good {greeting}, {firstName} — <span className="rl-dash-subtitle-count">{total} leads</span> in play
          </p>
        </div>
        <div className="rl-dash-header-right">
          <Link href="/" className="rl-dash-new-search-btn">
            New search
          </Link>
          <span className="rl-dash-date">{dateLine}</span>
        </div>
      </header>

      {/* Stat Tiles Strip */}
      <section className="rl-dash-tiles">
        <Link href="/leads" className="rl-dash-tile">
          <span className="rl-dash-tile-num rl-dash-tile-num-ink">{total}</span>
          <span className="rl-dash-tile-label">Saved leads</span>
          <span className="rl-dash-tile-sub">In your pipeline</span>
        </Link>
        <Link href="/leads?status=active" className="rl-dash-tile">
          <span className="rl-dash-tile-num rl-dash-tile-num-ink">{pipelineCounts.active}</span>
          <span className="rl-dash-tile-label">Active</span>
          <span className="rl-dash-tile-sub">In progress</span>
        </Link>
        <Link href="/leads?status=won" className="rl-dash-tile">
          <span className="rl-dash-tile-num rl-dash-tile-num-accent">{pipelineCounts.won}</span>
          <span className="rl-dash-tile-label">Won</span>
          <span className="rl-dash-tile-sub">
            {closeRate !== null ? `${closeRate}% close rate` : "No closes yet"}
          </span>
        </Link>
        <Link href="/leads?status=lost" className="rl-dash-tile">
          <span className="rl-dash-tile-num rl-dash-tile-num-dim">{pipelineCounts.lost}</span>
          <span className="rl-dash-tile-label">Lost</span>
          <span className="rl-dash-tile-sub">Closed out</span>
        </Link>
      </section>

      {/* Main Two-Column Body */}
      <main className="rl-dash-body">
        {/* Left Column: Saved Leads */}
        <section className="rl-dash-leads">
          <div className="rl-dash-leads-header">
            <h2 className="rl-dash-leads-title">Saved leads</h2>
            {total > 0 && (
              <Link href="/leads" className="rl-dash-view-all">
                View all {total} &rarr;
              </Link>
            )}
          </div>

          <div className="rl-dash-leads-content">
            {savedLeads.length > 0 ? (
              <div className="rl-dash-leads-list">
                {savedLeads.map((lead) => {
                  const primaryPracticeArea = getPracticeAreaNames(lead.firm)[0];
                  const status = lead.status || "ACTIVE";

                  let dotClass = "";
                  let labelClass = "";
                  if (status === "WON") {
                    dotClass = "rl-dot-won";
                    labelClass = "rl-status-won";
                  } else if (status === "LOST") {
                    dotClass = "rl-dot-lost";
                    labelClass = "rl-status-lost";
                  } else {
                    dotClass = "rl-dot-active";
                    labelClass = "rl-status-active";
                  }

                  return (
                    <Link
                      key={lead.id}
                      href={`/firms/${lead.firm.slug ?? lead.firm.id}`}
                      className="rl-dash-lead-row"
                    >
                      <div className="rl-dash-lead-info">
                        <span className="rl-dash-lead-name">{lead.firm.firmName}</span>
                        {primaryPracticeArea && (
                          <span className="rl-dash-lead-area">{primaryPracticeArea}</span>
                        )}
                      </div>
                      <div className="rl-dash-lead-status-pill-container">
                        <div className="rl-dash-lead-status-pill">
                          <span className={`rl-dash-lead-status-dot ${dotClass}`} />
                          <span className={`rl-dash-lead-status-label ${labelClass}`}>{status}</span>
                        </div>
                      </div>
                      <div className="rl-dash-lead-activity">
                        {leadActivityLine({
                          status: lead.status,
                          savedAt: lead.createdAt.toISOString(),
                          statusChangedAt: lead.updatedAt.toISOString(),
                        })}
                      </div>
                      <div className="rl-dash-lead-arrow">&rarr;</div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="rl-dash-empty-state">
                No saved leads yet.{" "}
                <Link href="/" className="rl-dash-empty-link">
                  Start searching &rarr;
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Right Column: Rail */}
        <section className="rl-dash-rail">
          {/* Activity Section */}
          <div className="rl-dash-rail-section">
            <h3 className="rl-dash-rail-label">Activity</h3>
            {recentActivity.length > 0 ? (
              <div className="rl-dash-activity-list">
                {recentActivity.map((activity) => {
                  const details = formatActivityEvent(activity);
                  return (
                    <div key={activity.id} className="rl-dash-activity-row">
                      <span className="rl-dash-activity-time">
                        {formatRelativeTime(activity.createdAt)}
                      </span>
                      <span className="rl-dash-activity-text">
                        <span className="rl-dash-activity-label">{details.label}</span>{" "}
                        <span className="rl-dash-activity-subject">{details.subject}</span>
                      </span>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="rl-dash-rail-empty">No activity yet.</div>
            )}
          </div>

          {/* Recent Searches Section */}
          <div className="rl-dash-rail-section rl-dash-searches-section">
            <h3 className="rl-dash-rail-label">Recent searches</h3>
            {recentSearches.length > 0 ? (
              <div className="rl-dash-searches-list">
                {recentSearches.map((item) => (
                  <Link
                    key={item.zip}
                    href={`/?zip=${item.zip}`}
                    className="rl-dash-search-row"
                  >
                    <span className="rl-dash-search-zip">{item.zip}</span>
                    <span className="rl-dash-search-time">
                      {formatRelativeTime(item.searchedAt)}
                    </span>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="rl-dash-rail-empty">No searches yet.</div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
