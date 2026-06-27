"use client";

import { useState } from "react";
import Link from "next/link";
import type { Prospect } from "@/types/prospect";
import { type LeadStatus } from "@/utils/leadStatus";

interface FirmDetailProps {
  prospect: Prospect;
  isSignedIn: boolean;
  isSaved: boolean;
  savedStatus: LeadStatus | null;
  savedAt: string | null;
}

function getConfidenceMeta(tier: string | undefined) {
  const t = tier || "LOW";
  const label = t.charAt(0).toUpperCase() + t.slice(1).toLowerCase();
  const filled = t === "HIGH" ? 3 : t === "MEDIUM" ? 2 : 1;
  return { label, filled };
}

function getDaysAgo(dateString: string | null | undefined): string | null {
  if (!dateString) return null;
  const date = new Date(dateString);
  if (isNaN(date.getTime())) return null;
  const now = new Date();
  
  // Calculate diff
  const diffMs = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
  
  if (diffDays <= 0) {
    return "Researched today";
  } else if (diffDays === 1) {
    return "Researched 1 day ago";
  } else {
    return `Researched ${diffDays} days ago`;
  }
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "";
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return "";
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

export function FirmDetail({
  prospect,
  isSignedIn,
  isSaved,
  savedStatus,
  savedAt,
}: FirmDetailProps) {
  const [isSavedState, setIsSavedState] = useState(isSaved);
  const [statusState, setStatusState] = useState<LeadStatus | null>(savedStatus);
  const [savedAtState, setSavedAtState] = useState<string | null>(savedAt);
  const [showAllAreas, setShowAllAreas] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmId: prospect.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to save lead");
      }
      const data = await response.json();
      if (data.ok) {
        setIsSavedState(true);
        setStatusState("ACTIVE");
        setSavedAtState(new Date().toISOString());
      }
    } catch (err) {
      console.error(err);
      alert("Error saving lead. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleUnsave = async () => {
    if (isUpdating) return;
    setIsUpdating(true);
    try {
      const response = await fetch("/api/leads", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmId: prospect.id }),
      });
      if (!response.ok) {
        throw new Error("Failed to unsave lead");
      }
      const data = await response.json();
      if (data.ok) {
        setIsSavedState(false);
        setStatusState(null);
        setSavedAtState(null);
      }
    } catch (err) {
      console.error(err);
      alert("Error unsaving lead. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleStatusChange = async (newStatus: LeadStatus) => {
    if (isUpdating || newStatus === statusState) return;
    setIsUpdating(true);
    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmId: prospect.id, status: newStatus }),
      });
      if (!response.ok) {
        throw new Error("Failed to update status");
      }
      const data = await response.json();
      if (data.ok) {
        setStatusState(newStatus);
      }
    } catch (err) {
      console.error(err);
      alert("Error updating status. Please try again.");
    } finally {
      setIsUpdating(false);
    }
  };

  const primaryArea = prospect.practiceAreas[0] || null;
  const locationStr = `${prospect.city}, ${prospect.state} ${prospect.zip}`;
  const daysAgoText = getDaysAgo(prospect.lastCheckedDate);
  const { label: confLabel, filled: confFilled } = getConfidenceMeta(prospect.confidenceTier);

  // Practice Areas pagination/slice
  const displayedAreas = showAllAreas
    ? prospect.practiceAreas
    : prospect.practiceAreas.slice(0, 10);
  const hasMoreAreas = prospect.practiceAreas.length > 10;

  return (
    <div className="firm-detail-container">
      {/* Breadcrumb / Back Navigation */}
      <div className="firm-detail-breadcrumbs">
        <Link href="/" className="firm-detail-back-link">
          ← RESULTS
        </Link>
        <div className="firm-detail-crumb-trail">
          <Link href="/">Results</Link>
          <span className="crumb-separator">/</span>
          <span className="crumb-current">{prospect.firmName}</span>
        </div>
      </div>

      {/* Header Section */}
      <header className="firm-detail-header-section">
        <div className="firm-detail-header-left">
          <h1 className="firm-detail-name">{prospect.firmName}</h1>
          <div className="firm-detail-meta-line">
            {primaryArea && (
              <>
                <span>{primaryArea}</span>
                <span className="meta-separator">·</span>
              </>
            )}
            <span>{locationStr}</span>
            {prospect.website && (
              <>
                <span className="meta-separator">·</span>
                <span className="firm-detail-meta-website">{prospect.website}</span>
              </>
            )}
          </div>
        </div>

        <div className="firm-detail-header-right">
          {isSignedIn ? (
            <div className="firm-detail-controls">
              {isSavedState ? (
                <div className="firm-detail-status-group">
                  <div className="status-segmented-control" role="group" aria-label="Lead pipeline status">
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("ACTIVE")}
                      className={`status-segment ${statusState === "ACTIVE" ? "selected-ACTIVE" : ""}`}
                    >
                      Active
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("WON")}
                      className={`status-segment ${statusState === "WON" ? "selected-WON" : ""}`}
                    >
                      Won
                    </button>
                    <button
                      type="button"
                      disabled={isUpdating}
                      onClick={() => handleStatusChange("LOST")}
                      className={`status-segment ${statusState === "LOST" ? "selected-LOST" : ""}`}
                    >
                      Lost
                    </button>
                  </div>
                  <button
                    type="button"
                    disabled={isUpdating}
                    onClick={handleUnsave}
                    className="firm-detail-save-btn saved"
                  >
                    Saved ✓
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={isUpdating}
                  onClick={handleSave}
                  className="firm-detail-save-btn not-saved"
                >
                  Save Lead
                </button>
              )}
            </div>
          ) : (
            <span className="firm-detail-signin-notice">Sign in to save this lead</span>
          )}
        </div>
      </header>

      {/* Meta Bar (Confidence Tier + Last Checked) */}
      <div className="firm-detail-meta-bar">
        <div className="firm-detail-confidence-container">
          <span className="firm-detail-meta-label">CONFIDENCE</span>
          <span className="firm-detail-confidence-text">{confLabel}</span>
          <div className="firm-detail-confidence-ticks">
            <span className={`confidence-tick ${confFilled >= 1 ? "filled" : ""}`}></span>
            <span className={`confidence-tick ${confFilled >= 2 ? "filled" : ""}`}></span>
            <span className={`confidence-tick ${confFilled >= 3 ? "filled" : ""}`}></span>
          </div>
        </div>
        {daysAgoText && (
          <div className="firm-detail-researched-container">
            <span className="firm-detail-researched-text">{daysAgoText}</span>
          </div>
        )}
      </div>

      {/* Grid Layout Body */}
      <div className="firm-detail-body-grid">
        {/* Left Column (Core details) */}
        <div className="firm-detail-left-col">
          {/* Contact Details */}
          <section className="firm-detail-section">
            <h2 className="firm-detail-section-title">Contact</h2>
            <div className="firm-detail-contact-list">
              <div className="firm-detail-contact-row">
                <div className="contact-info">
                  <span className="contact-label">EMAIL</span>
                  <span className="contact-value">{prospect.email || "—"}</span>
                </div>
              </div>
              <div className="firm-detail-contact-row">
                <div className="contact-info">
                  <span className="contact-label">PHONE</span>
                  <span className="contact-value">{prospect.phone || "—"}</span>
                </div>
              </div>
              <div className="firm-detail-contact-row">
                <div className="contact-info">
                  <span className="contact-label">WEBSITE</span>
                  <span className="contact-value">{prospect.website || "—"}</span>
                </div>
                {prospect.website && (
                  <a
                    href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contact-action-link"
                  >
                    Open website
                  </a>
                )}
              </div>
            </div>
          </section>

          {/* Attorneys */}
          <section className="firm-detail-section">
            <h2 className="firm-detail-section-title">
              Attorneys <span className="section-count">· {prospect.attorneys.length}</span>
            </h2>
            {prospect.attorneys.length > 0 ? (
              <div className="firm-detail-attorney-list">
                {prospect.attorneys.map((name, index) => (
                  <div key={index} className="firm-detail-attorney-row">
                    <span className="attorney-name">{name}</span>
                  </div>
                ))}
              </div>
            ) : (
              <div className="firm-detail-empty-message">No attorneys listed.</div>
            )}
          </section>

          {/* Practice Areas */}
          <section className="firm-detail-section">
            <h2 className="firm-detail-section-title">
              Practice Areas <span className="section-count">· {prospect.practiceAreas.length}</span>
            </h2>
            {prospect.practiceAreas.length > 0 ? (
              <>
                <div className="firm-detail-areas-grid">
                  {displayedAreas.map((area, index) => (
                    <div key={index} className="firm-detail-area-item">
                      <span className="area-dash">—</span>
                      <span className="area-name">{area}</span>
                    </div>
                  ))}
                </div>
                {hasMoreAreas && (
                  <button
                    type="button"
                    className="firm-detail-toggle-btn"
                    onClick={() => setShowAllAreas(!showAllAreas)}
                  >
                    {showAllAreas ? "Show fewer" : `Show all ${prospect.practiceAreas.length}`}
                  </button>
                )}
              </>
            ) : (
              <div className="firm-detail-empty-message">No practice areas specified.</div>
            )}
          </section>
        </div>

        {/* Right Column (Pipeline / Notes status) */}
        <div className="firm-detail-right-col">
          {/* Pipeline Card */}
          <div className="firm-detail-pipeline-card">
            <h3 className="pipeline-card-title">Pipeline Status</h3>
            {isSavedState && statusState ? (
              <div className="pipeline-status-info">
                <div className="pipeline-status-display">
                  <span className={`pipeline-status-dot ${statusState}`}></span>
                  <span className="pipeline-status-text">{statusState}</span>
                </div>
                {savedAtState && (
                  <div className="pipeline-added-date">
                    Added {formatDate(savedAtState)}
                  </div>
                )}
              </div>
            ) : (
              <div className="pipeline-placeholder">
                {isSignedIn ? "Not saved to your pipeline" : "Sign in to save lead"}
              </div>
            )}
          </div>

          {/* Notes Card (Stub/Disabled) */}
          <div className="firm-detail-notes-card">
            <h3 className="notes-card-title">Notes</h3>
            <div className="notes-box-container">
              <textarea
                className="notes-textarea"
                disabled
                placeholder="Add notes about this prospect here..."
              />
              <div className="notes-coming-soon">
                <span>Coming soon</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="firm-detail-footer">
        {prospect.website ? (
          <a
            href={prospect.website.startsWith("http") ? prospect.website : `https://${prospect.website}`}
            target="_blank"
            rel="noopener noreferrer"
            className="firm-detail-footer-btn"
          >
            Open Website
          </a>
        ) : (
          <button className="firm-detail-footer-btn" disabled>
            No Website
          </button>
        )}
        <Link href="/" className="firm-detail-footer-back">
          Back to Results
        </Link>
      </div>
    </div>
  );
}
