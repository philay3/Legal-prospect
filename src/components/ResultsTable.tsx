"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import Link from "next/link";
import type { Prospect } from "@/types/prospect";
import { type LeadStatus } from "@/utils/leadStatus";
import { getPageCount, getPageItems, getPageWindow } from "@/utils/pagination";
import { capAttorneys } from "@/utils/attorneys";
import { toCsv } from "@/utils/toCsv";
import { applyEnrichedEmail } from "@/utils/applyEnrichedEmail";
import { normalizeAttorneyName } from "@/lib/research/sanitize";

const PAGE_SIZE = 10;

interface ResultsTableProps {
  prospects: Prospect[];
  removeOnUnsave?: boolean;
  initialSignedIn?: boolean;
  initialSavedFirmIds?: string[];
  variant?: "search" | "leads";
}

type SortField = "name" | "email" | "phone" | "website";
type SortOrder = "asc" | "desc";

interface PopoverProps {
  practiceAreas: string[];
  addressLines: string[];
  triggerRect: DOMRect | null;
  onClose: () => void;
}

function PhoneIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="action-icon"
      aria-hidden="true"
    >
      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
    </svg>
  );
}

function EnvelopeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="action-icon"
      aria-hidden="true"
    >
      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
      <polyline points="22,6 12,13 2,6" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="action-icon"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" />
      <line x1="2" y1="12" x2="22" y2="12" />
      <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  );
}

interface SignInPopoverProps {
  triggerRect: DOMRect | null;
  onClose: () => void;
}

function SignInPopover({ triggerRect, onClose }: SignInPopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      // Do not close if click is on one of the checkboxes that triggered this
      if (
        target.classList.contains("table-checkbox") ||
        target.closest(".table-checkbox")
      ) {
        return;
      }

      if (
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [mounted, onClose]);

  if (!mounted || !triggerRect) return null;

  const popoverWidth = 280;
  let top = triggerRect.bottom + window.scrollY + 6;
  let left = triggerRect.left + window.scrollX;

  if (triggerRect.left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - 16 + window.scrollX;
  }
  if (left < 16) {
    left = 16;
  }

  return createPortal(
    <div
      ref={popoverRef}
      className="signin-popover"
      style={{ top, left }}
      role="dialog"
      aria-label="Sign in required"
    >
      <div className="signin-popover-header">
        <h4 className="popover-section-title">Sign In Required</h4>
        <button
          type="button"
          className="signin-popover-close-btn"
          onClick={onClose}
          aria-label="Close popover"
        >
          &times;
        </button>
      </div>
      <p className="signin-popover-text">
        Sign in to select and export leads.
      </p>
      <div className="signin-popover-actions">
        <Link href="/login" className="signin-popover-btn primary">
          Sign In
        </Link>
        <Link href="/signup" className="signin-popover-btn secondary">
          Sign Up
        </Link>
      </div>
    </div>,
    document.body
  );
}

function getPopoverAddressLines(prospect: Prospect): string[] {
  const street = prospect.streetAddress?.trim() || "";
  const city = prospect.city?.trim() || "";
  const state = prospect.state?.trim() || "";
  const zip = prospect.zip?.trim() || "";

  const lines: string[] = [];
  if (street) {
    lines.push(street);
  }

  let cityStateZip = "";
  if (city && state) {
    cityStateZip = `${city}, ${state} ${zip}`.trim();
  } else if (city || state || zip) {
    const cityState = [city, state].filter(Boolean).join(", ");
    cityStateZip = `${cityState} ${zip}`.trim();
  }

  if (cityStateZip) {
    lines.push(cityStateZip);
  }

  return lines;
}

function PracticeAreasPopover({
  practiceAreas,
  addressLines,
  triggerRect,
  onClose,
}: PopoverProps) {
  const popoverRef = useRef<HTMLDivElement>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        target.classList.contains("practice-count-badge-btn") ||
        target.closest(".practice-count-badge-btn")
      ) {
        return;
      }

      if (
        popoverRef.current &&
        !popoverRef.current.contains(target)
      ) {
        onClose();
      }
    };

    const handleScroll = (e: Event) => {
      if (popoverRef.current?.contains(e.target as Node)) return;
      onClose();
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [mounted, onClose]);

  if (!mounted || !triggerRect) return null;

  const popoverWidth = 280;
  let top = triggerRect.bottom + window.scrollY + 6;
  let left = triggerRect.left + window.scrollX;

  if (triggerRect.left + popoverWidth > window.innerWidth) {
    left = window.innerWidth - popoverWidth - 16 + window.scrollX;
  }
  if (left < 16) {
    left = 16;
  }

  return createPortal(
    <div
      ref={popoverRef}
      className="practice-areas-popover"
      style={{ top, left }}
      role="tooltip"
    >
      <h4 className="popover-section-title">Practice Areas ({practiceAreas.length})</h4>
      {practiceAreas.length > 0 ? (
        <div className="popover-tags">
          {practiceAreas.map((area, idx) => (
            <span key={idx} className="practice-tag">
              {area}
            </span>
          ))}
        </div>
      ) : (
        <div className="muted-text" style={{ fontStyle: "italic", marginBottom: "0.5rem" }}>
          No practice areas listed
        </div>
      )}
      
      <h4 className="popover-section-title popover-divider">Address</h4>
      {addressLines.length > 0 ? (
        <div className="popover-address">
          {addressLines.map((line, idx) => (
            <div key={idx} className="address-line">
              {line}
            </div>
          ))}
        </div>
      ) : (
        <div className="muted-text" style={{ fontStyle: "italic" }}>
          Address not found
        </div>
      )}
    </div>,
    document.body
  );
}

function getDisplayDomain(url: string | null | undefined): string {
  if (!url) return "";
  try {
    let clean = url.trim();
    if (!/^https?:\/\//i.test(clean)) {
      clean = "http://" + clean;
    }
    const parsed = new URL(clean);
    return parsed.hostname.replace(/^www\./i, "");
  } catch (e) {
    return url;
  }
}

export function ResultsTable({
  prospects,
  removeOnUnsave = false,
  initialSignedIn,
  initialSavedFirmIds,
  variant = "search",
}: ResultsTableProps) {
  const router = useRouter();
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [expandedFirms, setExpandedFirms] = useState<Record<string, boolean>>({});
  const [activePopover, setActivePopover] = useState<{
    firmId: string;
    triggerRect: DOMRect;
    practiceAreas: string[];
    addressLines: string[];
  } | null>(null);

  const [signedIn, setSignedIn] = useState(initialSignedIn ?? false);
  const [savedFirmIds, setSavedFirmIds] = useState<Set<string>>(() => new Set(initialSavedFirmIds ?? []));
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [activeSignInPopover, setActiveSignInPopover] = useState<{
    triggerRect: DOMRect;
  } | null>(null);
  const [localProspects, setLocalProspects] = useState<Prospect[]>(() =>
    prospects.map((p) => ({
      ...p,
      attorneys: p.attorneys ? p.attorneys.map(normalizeAttorneyName) : [],
    }))
  );

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Sync prospects prop with local state
  useEffect(() => {
    setLocalProspects(
      prospects.map((p) => ({
        ...p,
        attorneys: p.attorneys ? p.attorneys.map(normalizeAttorneyName) : [],
      }))
    );
  }, [prospects]);

  useEffect(() => {
    let active = true;
    async function fetchLeads() {
      try {
        const res = await fetch("/api/leads");
        if (!res.ok) return;
        const data = await res.json();
        if (!active) return;
        setSignedIn(data.signedIn);
        setSavedFirmIds(new Set(data.firmIds));
      } catch (err) {
        console.error("Failed to fetch saved leads:", err);
      }
    }
    fetchLeads();
    return () => {
      active = false;
    };
  }, []);

  const handleDownloadCsvSelected = () => {
    const selectedProspects = filteredProspects.filter((p) => selectedIds.has(p.id));
    if (selectedProspects.length === 0) return;
    const csvContent = toCsv(selectedProspects);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    const firstZip = selectedProspects[0]?.zip || "export";
    link.setAttribute("download", `leads-${firstZip}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleSaveSelected = async () => {
    const idsToSave = Array.from(selectedIds);
    if (idsToSave.length === 0) return;

    // Optimistic update of savedFirmIds
    setSavedFirmIds((prev) => {
      const next = new Set(prev);
      idsToSave.forEach((id) => next.add(id));
      return next;
    });

    try {
      const response = await fetch("/api/leads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmIds: idsToSave }),
      });

      if (!response.ok) {
        throw new Error("Failed to save leads");
      }

      // Best-effort enrichment pass
      idsToSave.forEach((id) => {
        const row = localProspects.find((p) => p.id === id);
        if (!row || row.email) return;

        fetch("/api/leads/enrich", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ firmId: id }),
        })
          .then(async (res) => {
            if (!res.ok) {
              throw new Error(`Enrichment failed with status ${res.status}`);
            }
            const data = await res.json();
            if (data.ok && data.email) {
              setLocalProspects((prev) => applyEnrichedEmail(prev, id, data.email));
            }
          })
          .catch((error) => {
            console.error(`Failed to enrich lead ${id}:`, error);
          });
      });

      setSelectedIds(new Set());
    } catch (err) {
      console.error("Error saving leads:", err);
      // Revert savedFirmIds by fetching current database state
      try {
        const res = await fetch("/api/leads");
        if (res.ok) {
          const data = await res.json();
          setSavedFirmIds(new Set(data.firmIds));
        }
      } catch (revertErr) {
        console.error("Failed to revert saved leads state:", revertErr);
      }
    }
  };

  const handleRemoveSelected = async () => {
    const idsToRemove = Array.from(selectedIds);
    if (idsToRemove.length === 0) return;

    // Save previous state for reverting on error
    const prevSavedIds = new Set(savedFirmIds);
    const prevLocalProspects = [...localProspects];

    // Optimistic update: filter from localProspects and delete from savedFirmIds
    setSavedFirmIds((prev) => {
      const next = new Set(prev);
      idsToRemove.forEach((id) => next.delete(id));
      return next;
    });
    setLocalProspects((prev) => prev.filter((p) => !idsToRemove.includes(p.id)));

    // Clear selection
    setSelectedIds(new Set());

    try {
      const response = await fetch("/api/leads", {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmIds: idsToRemove }),
      });

      if (!response.ok) {
        throw new Error("Failed to remove leads");
      }
    } catch (err) {
      console.error("Error removing leads:", err);
      // Revert optimistic changes
      setSavedFirmIds(prevSavedIds);
      setLocalProspects(prevLocalProspects);
    }
  };

  const handleSetStatus = async (firmId: string, status: LeadStatus) => {
    // Save previous state for reverting on error
    const prevProspects = [...localProspects];

    // Optimistic update
    setLocalProspects((prev) =>
      prev.map((p) => (p.id === firmId ? { ...p, status } : p))
    );

    try {
      const response = await fetch("/api/leads", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ firmId, status }),
      });

      if (!response.ok) {
        throw new Error("Failed to update status");
      }
    } catch (err) {
      console.error("Error setting lead status:", err);
      // Revert optimistic change
      setLocalProspects(prevProspects);
    }
  };

  const filteredProspects = useMemo(() => {
    if (removeOnUnsave) {
      return localProspects.filter((p) => savedFirmIds.has(p.id));
    }
    if (variant === "search") {
      return localProspects.filter((p) => !savedFirmIds.has(p.id));
    }
    return localProspects;
  }, [localProspects, savedFirmIds, removeOnUnsave, variant]);

  // Reset sorting, page, expanded, selection, and popover states whenever the search results change
  useEffect(() => {
    setCurrentPage(1);
    setSortField(null);
    setSortOrder(null);
    setExpandedFirms({});
    setActivePopover(null);
    setSelectedIds(new Set());
    setActiveSignInPopover(null);
  }, [prospects]);

  // Scroll to the top of the table on page changes
  useEffect(() => {
    tableContainerRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }, [currentPage]);

  const toggleFirmExpanded = (firmId: string) => {
    setExpandedFirms((prev) => ({
      ...prev,
      [firmId]: !prev[firmId],
    }));
  };

  const getSortValue = (prospect: Prospect, field: SortField): string => {
    switch (field) {
      case "name":
        return prospect.firmName || "";
      case "email":
        return prospect.email || "";
      case "phone":
        return prospect.phone || "";
      case "website":
        return prospect.website || "";
      default:
        return "";
    }
  };

  const sortedProspects = useMemo(() => {
    if (!sortField || !sortOrder) {
      return filteredProspects;
    }

    return [...filteredProspects].sort((a, b) => {
      const valA = getSortValue(a, sortField).trim();
      const valB = getSortValue(b, sortField).trim();

      if (valA === "" && valB === "") return 0;
      if (valA === "") return 1;
      if (valB === "") return -1;

      const comp = valA.localeCompare(valB, undefined, { sensitivity: "base", numeric: true });
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [filteredProspects, sortField, sortOrder]);

  const totalPages = getPageCount(sortedProspects.length, PAGE_SIZE);
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedProspects = getPageItems(sortedProspects, activePage, PAGE_SIZE);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1);
  };

  const renderHeader = (label: string, field: SortField) => {
    const isSorted = sortField === field;
    const columnClass =
      field === "name" ? "firm-name-cell" :
      field === "email" ? "email-cell" :
      field === "phone" ? "phone-cell" :
      field === "website" ? "website-cell" : "";

    return (
      <th onClick={() => handleSort(field)} className={`sortable-header ${columnClass}`}>
        <span className="header-text">{label}</span>
        <span className="sort-indicator" aria-hidden="true">
          {isSorted ? (sortOrder === "asc" ? " ▲" : " ▼") : " ↕"}
        </span>
      </th>
    );
  };

  return (
    <div ref={tableContainerRef} className="table-container">
      {selectedIds.size > 0 && (
        <div className="selection-action-bar">
          <div className="selection-count">
            {selectedIds.size} firm(s) selected
          </div>
          <div className="selection-actions">
            {variant === "search" ? (
              <button
                type="button"
                onClick={handleSaveSelected}
                className="action-bar-btn save-btn"
              >
                Save to leads
              </button>
            ) : (
              <button
                type="button"
                onClick={handleRemoveSelected}
                className="action-bar-btn delete-btn"
              >
                Remove from leads
              </button>
            )}
            <button
              type="button"
              onClick={handleDownloadCsvSelected}
              className="action-bar-btn export-btn"
            >
              Export CSV
            </button>
            <button
              type="button"
              onClick={() => setSelectedIds(new Set())}
              className="action-bar-btn clear-btn"
            >
              Clear
            </button>
          </div>
        </div>
      )}

      <table className="results-table">
        <thead>
          <tr>
            <th style={{ width: "44px", cursor: "default" }} className="checkbox-cell">
              <input
                type="checkbox"
                className="table-checkbox"
                checked={
                  filteredProspects.length > 0 &&
                  filteredProspects.every((p) => selectedIds.has(p.id))
                }
                onChange={(e) => {
                  if (!signedIn) {
                    const rect = e.currentTarget.getBoundingClientRect();
                    setActiveSignInPopover({ triggerRect: rect });
                    return;
                  }
                  if (e.target.checked) {
                    setSelectedIds(new Set(filteredProspects.map((p) => p.id)));
                  } else {
                    setSelectedIds(new Set());
                  }
                }}
                aria-label="Select all prospects"
              />
            </th>
            {renderHeader("NAME", "name")}
            {renderHeader("EMAIL", "email")}
            {renderHeader("PHONE", "phone")}
            {renderHeader("WEBSITE", "website")}
            <th style={{ cursor: "default" }} className="attorneys-cell text-muted-header">ATTORNEYS</th>
          </tr>
        </thead>
        <tbody>
          {paginatedProspects.map((prospect) => {
            const activePracticeAreas = prospect.practiceAreas
              ? prospect.practiceAreas.filter((area) => area && area.trim())
              : [];
            const hasPracticeAreas = activePracticeAreas.length > 0;

            const activeAttorneys = prospect.attorneys
              ? prospect.attorneys.filter((att) => att && att.trim())
              : [];
            const hasAttorneys = activeAttorneys.length > 0;

            const { visible, remaining } = capAttorneys(activeAttorneys, 2);
            const isExpanded = !!expandedFirms[prospect.id];
            const isSaved = savedFirmIds.has(prospect.id);
            const isSelected = selectedIds.has(prospect.id);

            return (
              <tr key={prospect.id} className={isSelected ? "selected-row" : ""}>
                <td className="checkbox-cell">
                  <input
                    type="checkbox"
                    className="table-checkbox"
                    checked={selectedIds.has(prospect.id)}
                    onChange={(e) => {
                      if (!signedIn) {
                        const rect = e.currentTarget.getBoundingClientRect();
                        setActiveSignInPopover({ triggerRect: rect });
                        return;
                      }
                      setSelectedIds((prev) => {
                        const next = new Set(prev);
                        if (e.target.checked) {
                          next.add(prospect.id);
                        } else {
                          next.delete(prospect.id);
                        }
                        return next;
                      });
                    }}
                    aria-label={`Select ${prospect.firmName}`}
                  />
                </td>
                <td className="firm-name-cell">
                  <div className="firm-name-container">
                    <span className="firm-name-text">{prospect.firmName}</span>
                    {variant === "search" && signedIn && isSaved && (
                      <span className="saved-indicator-badge" title="Saved to Leads">
                        🔖 Saved
                      </span>
                    )}
                    {hasPracticeAreas && (
                      <button
                        type="button"
                        className="practice-count-badge-btn"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (activePopover?.firmId === prospect.id) {
                            setActivePopover(null);
                          } else {
                            const rect = e.currentTarget.getBoundingClientRect();
                            setActivePopover({
                              firmId: prospect.id,
                              triggerRect: rect,
                              practiceAreas: activePracticeAreas,
                              addressLines: getPopoverAddressLines(prospect),
                            });
                          }
                        }}
                        aria-label={`Show practice areas and address for ${prospect.firmName}`}
                      >
                        {activePracticeAreas.length === 1 ? "1 area" : `${activePracticeAreas.length} areas`}
                      </button>
                    )}
                  </div>
                  {variant === "leads" && (
                    <div style={{ marginTop: "0.5rem", display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span className={`lead-status ${prospect.status?.toLowerCase() || "active"}`}>
                        {prospect.status || "ACTIVE"}
                      </span>
                      <div className="status-actions-container">
                        {prospect.status === "ACTIVE" || !prospect.status ? (
                          <>
                            <button
                              type="button"
                              className="status-action-btn won-btn"
                              onClick={() => handleSetStatus(prospect.id, "WON")}
                              title="Mark Won"
                            >
                              Won
                            </button>
                            <button
                              type="button"
                              className="status-action-btn lost-btn"
                              onClick={() => handleSetStatus(prospect.id, "LOST")}
                              title="Mark Lost"
                            >
                              Lost
                            </button>
                          </>
                        ) : (
                          <button
                            type="button"
                            className="status-action-btn active-btn"
                            onClick={() => handleSetStatus(prospect.id, "ACTIVE")}
                            title="Reopen"
                          >
                            Reopen
                          </button>
                        )}
                      </div>
                    </div>
                  )}
                </td>
                <td className="email-cell mono">
                  {prospect.email ? (
                    <a
                      href={`mailto:${prospect.email}`}
                      className="email-link"
                    >
                      {prospect.email}
                    </a>
                  ) : (
                    <span className="text-dim-dash">—</span>
                  )}
                </td>
                <td className="phone-cell mono">
                  {prospect.phone ? (
                    <a
                      href={`tel:${prospect.phone}`}
                      className="phone-link"
                    >
                      {prospect.phone}
                    </a>
                  ) : (
                    <span className="text-dim-dash">—</span>
                  )}
                </td>
                <td className="website-cell mono">
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="website-link"
                    >
                      <span>{getDisplayDomain(prospect.website)}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        className="external-link-icon"
                      >
                        <path d="M15 3h6v6" />
                        <path d="M10 14 21 3" />
                        <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                      </svg>
                    </a>
                  ) : (
                    <span className="text-dim-dash">—</span>
                  )}
                </td>
                <td className="attorneys-cell">
                  {hasAttorneys ? (
                    <div className="prospect-attorneys">
                      <span>
                        {isExpanded ? activeAttorneys.join(", ") : visible.join(", ")}
                      </span>
                      {activeAttorneys.length > 2 && (
                        <button
                          type="button"
                          className="toggle-more-btn"
                          onClick={() => toggleFirmExpanded(prospect.id)}
                          aria-expanded={isExpanded}
                        >
                          {isExpanded ? "Show less" : `+${remaining} more`}
                        </button>
                      )}
                    </div>
                  ) : (
                    <span className="text-dim-dash">—</span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {activePopover && (
        <PracticeAreasPopover
          practiceAreas={activePopover.practiceAreas}
          addressLines={activePopover.addressLines}
          triggerRect={activePopover.triggerRect}
          onClose={() => setActivePopover(null)}
        />
      )}

      {activeSignInPopover && (
        <SignInPopover
          triggerRect={activeSignInPopover.triggerRect}
          onClose={() => setActiveSignInPopover(null)}
        />
      )}

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-arrow-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              aria-label="Previous page"
            >
              ‹
            </button>

            {getPageWindow(activePage, totalPages).map((page, idx) => {
              if (page === "…") {
                return (
                  <span key={`ellipsis-${idx}`} className="pagination-ellipsis">
                    …
                  </span>
                );
              }
              const isCurrent = page === activePage;
              return (
                <button
                  key={`page-${page}`}
                  type="button"
                  className={`pagination-btn ${isCurrent ? "active" : ""}`}
                  onClick={() => setCurrentPage(Number(page))}
                  aria-current={isCurrent ? "page" : undefined}
                >
                  {page}
                </button>
              );
            })}

            <button
              type="button"
              className="pagination-arrow-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              aria-label="Next page"
            >
              ›
            </button>
          </div>

          <div className="pagination-info">
            Showing {startIndex + 1}–{Math.min(startIndex + PAGE_SIZE, sortedProspects.length)} of {sortedProspects.length}
          </div>
        </div>
      )}
    </div>
  );
}
