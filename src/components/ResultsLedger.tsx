"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import type { Prospect } from "@/types/prospect";
import { getPageCount, getPageItems } from "@/utils/pagination";
import { applyEnrichedEmail } from "@/utils/applyEnrichedEmail";
import { normalizeAttorneyName } from "@/lib/research/sanitize";
import { type SortField, type SortDir, filterProspects, sortProspects } from "@/utils/ledgerControls";

const PAGE_SIZE = 10;

const SORT_OPTIONS: { field: SortField; label: string }[] = [
  { field: "name", label: "Name" },
  { field: "areas", label: "Areas" },
  { field: "attorneys", label: "Attorneys" },
  { field: "confidence", label: "Confidence" },
];

const DEFAULT_DIR: Record<SortField, SortDir> = {
  name: "asc",        // A -> Z, arrow up
  areas: "desc",      // most first, arrow down
  attorneys: "desc",  // most first, arrow down
  confidence: "desc", // HIGH first, arrow down
};

interface ResultsLedgerProps {
  prospects: Prospect[];
  zipLabel?: string;
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

export function ResultsLedger({ prospects, zipLabel }: ResultsLedgerProps) {
  const router = useRouter();

  const [localProspects, setLocalProspects] = useState<Prospect[]>(() =>
    prospects.map((p) => ({
      ...p,
      attorneys: p.attorneys ? p.attorneys.map(normalizeAttorneyName) : [],
    }))
  );

  const [signedIn, setSignedIn] = useState(false);
  const [savedFirmIds, setSavedFirmIds] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);

  const [filterText, setFilterText] = useState("");
  const [sortField, setSortField] = useState<SortField | null>(null); // null = route order
  const [sortDir, setSortDir] = useState<SortDir>("asc");

  function handleSortClick(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDir(DEFAULT_DIR[field]);
    }
  }

  // Re-sync localProspects when the prospects prop changes
  useEffect(() => {
    setLocalProspects(
      prospects.map((p) => ({
        ...p,
        attorneys: p.attorneys ? p.attorneys.map(normalizeAttorneyName) : [],
      }))
    );
  }, [prospects]);

  // Reset page to 1 on prospects prop change
  useEffect(() => {
    setCurrentPage(1);
  }, [prospects]);

  // Reset page to 1 on filter/sort change
  useEffect(() => {
    setCurrentPage(1);
  }, [filterText, sortField, sortDir]);

  // Fetch signedIn and savedFirmIds on mount
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

  const visibleProspects = useMemo(() => {
    const filtered = filterProspects(localProspects, filterText);
    return sortField ? sortProspects(filtered, sortField, sortDir) : filtered;
  }, [localProspects, filterText, sortField, sortDir]);

  const totalPages = getPageCount(visibleProspects.length, PAGE_SIZE);
  const activePage = Math.min(currentPage, Math.max(totalPages, 1));
  const startIndex = (activePage - 1) * PAGE_SIZE;
  const paginatedProspects = getPageItems(visibleProspects, activePage, PAGE_SIZE);

  const handleToggleSave = async (e: React.MouseEvent, p: Prospect) => {
    e.stopPropagation();
    if (!signedIn) {
      router.push("/login");
      return;
    }

    const isSaved = savedFirmIds.has(p.id);

    if (isSaved) {
      // Optimistic remove
      const prevSaved = new Set(savedFirmIds);
      setSavedFirmIds((prev) => {
        const next = new Set(prev);
        next.delete(p.id);
        return next;
      });

      try {
        const res = await fetch("/api/leads", {
          method: "DELETE",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firmIds: [p.id] }),
        });
        if (!res.ok) throw new Error("Failed to delete lead");
      } catch (err) {
        console.error("Error unsaving lead:", err);
        setSavedFirmIds(prevSaved);
      }
    } else {
      // Optimistic add
      const prevSaved = new Set(savedFirmIds);
      setSavedFirmIds((prev) => {
        const next = new Set(prev);
        next.add(p.id);
        return next;
      });

      try {
        const res = await fetch("/api/leads", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ firmIds: [p.id] }),
        });
        if (!res.ok) throw new Error("Failed to save lead");

        // Enrichment on success if no email
        if (!p.email) {
          try {
            const enrichRes = await fetch("/api/leads/enrich", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ firmId: p.id }),
            });
            if (enrichRes.ok) {
              const enrichData = await enrichRes.json();
              if (enrichData.ok && enrichData.email) {
                setLocalProspects((prev) =>
                  applyEnrichedEmail(prev, p.id, enrichData.email)
                );
              }
            }
          } catch (enrichErr) {
            console.error("Enrichment failed:", enrichErr);
          }
        }
      } catch (err) {
        console.error("Error saving lead:", err);
        // Revert by re-fetching saved leads
        try {
          const fetchRes = await fetch("/api/leads");
          if (fetchRes.ok) {
            const data = await fetchRes.json();
            setSavedFirmIds(new Set(data.firmIds));
          }
        } catch (revertErr) {
          console.error("Revert failed:", revertErr);
          setSavedFirmIds(prevSaved);
        }
      }
    }
  };

  const handleRowClick = (p: Prospect) => {
    router.push("/firms/" + (p.slug ?? p.id));
  };

  return (
    <div className="rl-table-wrapper">
      <div className="rl-controls-row">
        <div className="rl-filter-field">
          <span className="rl-control-label">Filter</span>
          <input
            className="rl-filter-input"
            placeholder="name, practice area, attorney…"
            aria-label="Filter results"
            value={filterText}
            onChange={(e) => setFilterText(e.target.value)}
          />
        </div>
        <div className="rl-sort-group">
          <span className="rl-control-label">Sort</span>
          <div className="rl-sort-buttons">
            {SORT_OPTIONS.map(({ field, label }) => {
              const active = sortField === field;
              const arrow = active ? (sortDir === "asc" ? " \u2191" : " \u2193") : "";
              return (
                <button
                  key={field}
                  type="button"
                  className={`rl-sort-btn ${active ? "rl-active" : ""}`}
                  onClick={() => handleSortClick(field)}
                >
                  {label}{arrow}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Table Rules & Header */}
      <div className="rl-header-rules">
        <div className="rl-rule-top"></div>
        <div className="rl-rule-sub"></div>
      </div>

      <div className="rl-table-grid rl-table-header">
        <div className="rl-col-index"></div>
        <div className="rl-col-main rl-header-label">Firm · Contact · Attorneys</div>
        <div className="rl-col-stats rl-header-label text-right">
          Areas · Att · Confidence
        </div>
        <div className="rl-col-save"></div>
      </div>

      {/* Table Rows */}
      {visibleProspects.length === 0 ? (
        <div className="rl-empty-filter">No firms match.</div>
      ) : (
        <div className="rl-rows-container">
          {paginatedProspects.map((p, localIndex) => {
            const globalIdx = startIndex + localIndex + 1;
            const emailVal = p.email && p.email.trim();
            const telVal = p.phone && p.phone.trim();
          const webVal = p.website && p.website.trim();

          const activeAtts = p.attorneys
            ? p.attorneys.filter((att) => att && att.trim())
            : [];

          let attPreview = "";
          if (activeAtts.length > 0) {
            if (activeAtts.length <= 2) {
              attPreview = activeAtts.join(", ");
            } else {
              attPreview = `${activeAtts.slice(0, 2).join(", ")} +${activeAtts.length - 2}`;
            }
          }

          const leadVal =
            p.practiceAreas && p.practiceAreas.length > 0
              ? p.practiceAreas[0]
              : "";

          const thirdLine = [attPreview, leadVal].filter(Boolean).join(" · ") || "—";
          const paCount = p.practiceAreas ? p.practiceAreas.length : 0;
          const attCount = activeAtts.length;
          const tier = p.confidenceTier ?? "LOW";
          const ticksOn = { HIGH: 3, MEDIUM: 2, LOW: 1 }[tier] || 1;
          const isSaved = savedFirmIds.has(p.id);

          return (
            <div
              key={p.id}
              className="rl-table-grid rl-row"
              onClick={() => handleRowClick(p)}
            >
              {/* Index Column */}
              <div className="rl-col-index rl-index-num">
                {String(globalIdx).padStart(2, "0")}
              </div>

              {/* Main Content Column */}
              <div className="rl-col-main">
                <div className="rl-firm-name">{p.firmName}</div>
                
                {/* Contact Information Row */}
                <div className="rl-contact-row">
                  {/* Email */}
                  {emailVal ? (
                    <a
                      href={`mailto:${p.email}`}
                      className="rl-contact-link"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.email}
                    </a>
                  ) : (
                    <span className="rl-muted-dash">—</span>
                  )}
                  
                  {/* Divider */}
                  <div className="rl-contact-divider"></div>
                  
                  {/* Phone */}
                  {telVal ? (
                    <a
                      href={`tel:${p.phone}`}
                      className="rl-contact-phone"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {p.phone}
                    </a>
                  ) : (
                    <span className="rl-muted-dash">—</span>
                  )}
                  
                  {/* Divider */}
                  <div className="rl-contact-divider"></div>
                  
                  {/* Website */}
                  {webVal ? (
                    <a
                      href={p.website ?? undefined}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rl-contact-link rl-contact-web"
                      onClick={(e) => e.stopPropagation()}
                    >
                      {getDisplayDomain(p.website)}
                    </a>
                  ) : (
                    <span className="rl-muted-dash">—</span>
                  )}
                </div>

                {/* Third Line (Attorneys + Primary Practice Area) */}
                <div className="rl-third-line">{thirdLine}</div>
              </div>

              {/* Stats & Confidence Column */}
              <div className="rl-col-stats">
                {/* ZIP */}
                {p.zip && p.zip.trim() ? (
                  <div className="rl-zip-code">{p.zip.trim()}</div>
                ) : null}

                {/* Statistics blocks */}
                <div className="rl-stats-row">
                  {paCount === 1 ? (
                    <div className="rl-stats-block text-right">
                      <div className="rl-single-area" title={p.practiceAreas[0]}>
                        {p.practiceAreas[0]}
                      </div>
                      <div className="rl-stats-sublabel">Area</div>
                    </div>
                  ) : (
                    <div className="rl-stats-block text-right">
                      <div className="rl-stats-num">{paCount}</div>
                      <div className="rl-stats-sublabel">Areas</div>
                    </div>
                  )}

                  <div className="rl-stats-divider"></div>

                  <div className="rl-stats-block text-right">
                    <div className="rl-stats-num">{attCount}</div>
                    <div className="rl-stats-sublabel">Att</div>
                  </div>
                </div>

                {/* Confidence Ticks */}
                <div className="rl-confidence-row">
                  <div className="rl-confidence-ticks">
                    {[1, 2, 3].map((tick) => (
                      <span
                        key={tick}
                        className="rl-tick"
                        style={{
                          backgroundColor:
                            tick <= ticksOn ? "var(--ink)" : "var(--line2)",
                        }}
                      />
                    ))}
                  </div>
                  <div className="rl-confidence-label">{tier}</div>
                </div>
              </div>

              {/* Save Button Column */}
              <div className="rl-col-save">
                <button
                  type="button"
                  onClick={(e) => handleToggleSave(e, p)}
                  className={`rl-save-btn ${isSaved ? "rl-saved" : "rl-unsaved"}`}
                >
                  {isSaved ? "Saved" : "Save"}
                </button>
              </div>
            </div>
          );
        })}
        </div>
      )}

      {/* Pagination Footer */}
      <div className="rl-pagination-footer">
        <div className="rl-pagination-info">
          Showing {visibleProspects.length > 0 ? startIndex + 1 : 0}–
          {Math.min(startIndex + PAGE_SIZE, visibleProspects.length)} of{" "}
          {visibleProspects.length}
          {zipLabel ? ` · ZIP ${zipLabel}` : ""}
        </div>

        {totalPages > 1 && (
          <div className="rl-pagination-controls">
            <button
              type="button"
              className={`rl-page-arrow-btn ${activePage === 1 ? "rl-disabled" : ""}`}
              onClick={() => {
                if (activePage > 1) setCurrentPage((prev) => prev - 1);
              }}
              disabled={activePage === 1}
            >
              ‹ Prev
            </button>
            <span className="rl-current-page">{activePage}</span>
            <button
              type="button"
              className={`rl-page-arrow-btn ${activePage === totalPages ? "rl-disabled" : ""}`}
              onClick={() => {
                if (activePage < totalPages) setCurrentPage((prev) => prev + 1);
              }}
              disabled={activePage === totalPages}
            >
              Next ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
