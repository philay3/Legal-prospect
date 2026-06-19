"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import type { Prospect } from "@/types/prospect";
import { getPageCount, getPageItems, getPageWindow } from "@/utils/pagination";

const PAGE_SIZE = 10;

interface ResultsTableProps {
  prospects: Prospect[];
}

type SortField = "name" | "email" | "phone" | "website";
type SortOrder = "asc" | "desc";

interface PopoverProps {
  practiceAreas: string[];
  attorneys: string[];
  triggerRect: DOMRect | null;
  onClose: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
}

function PracticeAreasPopover({
  practiceAreas,
  attorneys,
  triggerRect,
  onClose,
  onMouseEnter,
  onMouseLeave,
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
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target as Node)
      ) {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
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
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      role="tooltip"
    >
      <h4 className="popover-section-title">Practice Areas ({practiceAreas.length})</h4>
      <div className="popover-tags">
        {practiceAreas.map((area, idx) => (
          <span key={idx} className="practice-tag">
            {area}
          </span>
        ))}
      </div>
      {attorneys.length > 0 && (
        <>
          <h4 className="popover-section-title popover-divider">Attorneys ({attorneys.length})</h4>
          <div className="popover-attorneys">
            {attorneys.join(", ")}
          </div>
        </>
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
    attorneys: string[];
  } | null>(null);

  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tableContainerRef = useRef<HTMLDivElement>(null);

  // Reset sorting, page, expanded, and popover states whenever the search results change
  useEffect(() => {
    setCurrentPage(1);
    setSortField(null);
    setSortOrder(null);
    setExpandedFirms({});
    setActivePopover(null);
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  }, [prospects]);

  // Clean up timeout on unmount
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

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

  const handleOpenPopover = (
    e: React.SyntheticEvent,
    firmId: string,
    practiceAreas: string[],
    attorneys: string[]
  ) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    const rect = e.currentTarget.getBoundingClientRect();
    setActivePopover({
      firmId,
      triggerRect: rect,
      practiceAreas,
      attorneys,
    });
  };

  const handleClosePopover = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActivePopover(null);
    }, 150);
  };

  const handlePopoverMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
  };

  const handlePopoverMouseLeave = () => {
    setActivePopover(null);
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
            const displayWebsite = prospect.website
              ? prospect.website.replace(/^https?:\/\/(www\.)?/, "")
              : "—";

            const activePracticeAreas = prospect.practiceAreas
              ? prospect.practiceAreas.filter((area) => area && area.trim())
              : [];
            const hasPracticeAreas = activePracticeAreas.length > 0;

            const activeAttorneys = prospect.attorneys
              ? prospect.attorneys.filter((att) => att && att.trim())
              : [];
            const hasAttorneys = activeAttorneys.length > 0;

            const isExpanded = !!expandedFirms[prospect.id];
            const displayedAttorneys = isExpanded ? activeAttorneys : activeAttorneys.slice(0, 2);
            const remainingAttorneys = activeAttorneys.length - 2;

            return (
              <tr key={prospect.id}>
                <td className="firm-name-cell">
                  <button
                    type="button"
                    className="firm-name-trigger"
                    onMouseEnter={(e) => {
                      if (hasPracticeAreas) {
                        handleOpenPopover(e, prospect.id, activePracticeAreas, activeAttorneys);
                      }
                    }}
                    onMouseLeave={handleClosePopover}
                    onFocus={(e) => {
                      if (hasPracticeAreas) {
                        handleOpenPopover(e, prospect.id, activePracticeAreas, activeAttorneys);
                      }
                    }}
                    onBlur={handleClosePopover}
                    onClick={(e) => {
                      if (hasPracticeAreas) {
                        if (activePopover?.firmId === prospect.id) {
                          setActivePopover(null);
                        } else {
                          handleOpenPopover(e, prospect.id, activePracticeAreas, activeAttorneys);
                        }
                      }
                    }}
                  >
                    <span className="firm-name-text">{prospect.firmName}</span>
                    {hasPracticeAreas && (
                      <span className="practice-count-badge">
                        {activePracticeAreas.length} {activePracticeAreas.length === 1 ? "area" : "areas"}
                      </span>
                    )}
                  </button>
                </td>
                <td className="email-cell">
                  {prospect.email ? (
                    <a href={`mailto:${prospect.email}`} className="contact-link" title={prospect.email}>
                      {prospect.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="phone-cell">
                  {prospect.phone ? (
                    <a href={`tel:${prospect.phone}`} className="contact-link" title={prospect.phone}>
                      {prospect.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="website-cell">
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                      title={prospect.website}
                    >
                      {displayWebsite}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td className="attorneys-cell">
                  {hasAttorneys ? (
                    <div className="prospect-attorneys">
                      <span>{displayedAttorneys.join(", ")}</span>
                      {activeAttorneys.length > 2 && (
                        <button
                          type="button"
                          className="toggle-more-btn"
                          onClick={() => toggleFirmExpanded(prospect.id)}
                        >
                          {isExpanded ? "Show less" : `+${remainingAttorneys} more`}
                        </button>
                      )}
                    </div>
                  ) : (
                    "—"
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
          attorneys={activePopover.attorneys}
          triggerRect={activePopover.triggerRect}
          onClose={() => setActivePopover(null)}
          onMouseEnter={handlePopoverMouseEnter}
          onMouseLeave={handlePopoverMouseLeave}
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
