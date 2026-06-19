"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Prospect } from "@/types/prospect";
import { getPageCount, getPageItems, getPageWindow } from "@/utils/pagination";
import { capAttorneys } from "@/utils/attorneys";

const PAGE_SIZE = 10;

interface ResultsTableProps {
  prospects: Prospect[];
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

export function ResultsTable({ prospects }: ResultsTableProps) {
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

  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Reset sorting, page, expanded, and popover states whenever the search results change
  useEffect(() => {
    setCurrentPage(1);
    setSortField(null);
    setSortOrder(null);
    setExpandedFirms({});
    setActivePopover(null);
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
      return prospects;
    }

    return [...prospects].sort((a, b) => {
      const valA = getSortValue(a, sortField).trim();
      const valB = getSortValue(b, sortField).trim();

      if (valA === "" && valB === "") return 0;
      if (valA === "") return 1;
      if (valB === "") return -1;

      const comp = valA.localeCompare(valB, undefined, { sensitivity: "base", numeric: true });
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [prospects, sortField, sortOrder]);

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
      <table className="results-table">
        <thead>
          <tr>
            {renderHeader("Name", "name")}
            {renderHeader("Email", "email")}
            {renderHeader("Phone", "phone")}
            {renderHeader("Website", "website")}
            <th style={{ cursor: "default" }} className="attorneys-cell">Attorneys</th>
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

            return (
              <tr key={prospect.id}>
                <td className="firm-name-cell">
                  <div className="firm-name-container">
                    <span className="firm-name-text">{prospect.firmName}</span>
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
                        {activePracticeAreas.length} {activePracticeAreas.length === 1 ? "area" : "areas"}
                      </button>
                    )}
                  </div>
                </td>
                <td className="email-cell">
                  {prospect.email ? (
                    <a
                      href={`mailto:${prospect.email}`}
                      className="action-icon-link"
                      title={prospect.email}
                      aria-label={`Email ${prospect.email}`}
                    >
                      <EnvelopeIcon />
                    </a>
                  ) : (
                    <span className="muted-dash">—</span>
                  )}
                </td>
                <td className="phone-cell">
                  {prospect.phone ? (
                    <a
                      href={`tel:${prospect.phone}`}
                      className="action-icon-link"
                      title={prospect.phone}
                      aria-label={`Call ${prospect.phone}`}
                    >
                      <PhoneIcon />
                    </a>
                  ) : (
                    <span className="muted-dash">—</span>
                  )}
                </td>
                <td className="website-cell">
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="action-icon-link"
                      title={prospect.website}
                      aria-label={`Visit website ${prospect.website}`}
                    >
                      <GlobeIcon />
                    </a>
                  ) : (
                    <span className="muted-dash">—</span>
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
                    <span className="muted-dash">—</span>
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

      {totalPages > 1 && (
        <div className="pagination-container">
          <div className="pagination-info">
            Showing <span className="page-indicator">{startIndex + 1}</span> to{" "}
            <span className="page-indicator">
              {Math.min(startIndex + PAGE_SIZE, sortedProspects.length)}
            </span>{" "}
            of <span className="page-indicator">{sortedProspects.length}</span> prospects
          </div>
          <div className="pagination-controls">
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(1)}
              disabled={activePage === 1}
              aria-disabled={activePage === 1}
            >
              « First
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={activePage === 1}
              aria-disabled={activePage === 1}
            >
              ‹ Prev
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
              className="pagination-btn"
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={activePage === totalPages}
              aria-disabled={activePage === totalPages}
            >
              Next ›
            </button>
            <button
              type="button"
              className="pagination-btn"
              onClick={() => setCurrentPage(totalPages)}
              disabled={activePage === totalPages}
              aria-disabled={activePage === totalPages}
            >
              Last »
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
