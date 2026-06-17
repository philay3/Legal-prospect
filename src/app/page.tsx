"use client";

import { useState } from "react";
import { normalizeZipCode } from "@/utils/prospectMatcher";
import { ProspectCard } from "@/components/ProspectCard";
import type { Prospect } from "@/types/prospect";

export default function Home() {
  const [searchZip, setSearchZip] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expandedProspects, setExpandedProspects] = useState<Record<string, boolean>>({});
  const [savedProspectIds, setSavedProspectIds] = useState<string[]>([]);
  const [matchingProspects, setMatchingProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return; // Prevent duplicate searches while loading

    const trimmed = searchZip.trim();

    if (!trimmed) {
      setError("Please enter a ZIP code.");
      setSearchedZip(null);
      setMatchingProspects([]);
      setExpandedProspects({});
      return;
    }

    const normalized = normalizeZipCode(trimmed);
    if (!normalized) {
      setError("Please enter a valid ZIP code.");
      setSearchedZip(null);
      setMatchingProspects([]);
      setExpandedProspects({});
      return;
    }

    setError(null);
    setIsLoading(true);
    setExpandedProspects({});

    try {
      const response = await fetch(`/api/prospects/search?zip=${encodeURIComponent(trimmed)}`);
      
      if (!response.ok) {
        let errMsg = "We could not complete the search right now. Please try again.";
        try {
          const errData = await response.json();
          if (errData && errData.error) {
            errMsg = errData.error;
          }
        } catch (e) {
          // ignore parsing error
        }
        setError(errMsg);
        setSearchedZip(null);
        setMatchingProspects([]);
      } else {
        const data = await response.json();
        setSearchedZip(normalized);
        setMatchingProspects(data.results || []);
      }
    } catch (err) {
      setError("We could not complete the search right now. Please try again.");
      setSearchedZip(null);
      setMatchingProspects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleExpand = (id: string) => {
    setExpandedProspects((prev) => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const toggleSave = (id: string) => {
    setSavedProspectIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Legal Prospect Search</span>
        </div>
        <h1 className="title">Legal Prospector</h1>
        <p className="subtitle">
          ZIP-based law firm prospecting for finding small and boutique law firm leads.
        </p>
      </header>

      <main className="search-card">
        <form onSubmit={handleSearch}>
          <label className="search-label" htmlFor="zip-search">
            Search Law Firms by ZIP Code
          </label>
          <div className="search-group">
            <input
              id="zip-search"
              type="text"
              className="search-input"
              placeholder="Enter 5-digit ZIP code (e.g., 19103)"
              value={searchZip}
              onChange={(e) => {
                setSearchZip(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />
            <button type="submit" className="search-button" disabled={isLoading}>
              {isLoading ? "Searching..." : "Search"}
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      </main>

      <section className="results-section">
        {isLoading ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">⏳</span>
            <h3 className="placeholder-title">Searching Database...</h3>
            <p className="placeholder-desc">
              Querying seeded prospect records for ZIP <strong>{normalizeZipCode(searchZip) || searchZip}</strong>.
            </p>
          </div>
        ) : searchedZip === null ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">🔍</span>
            <h3 className="placeholder-title">Ready for Search</h3>
            <p className="placeholder-desc">
              Enter a 5-digit ZIP code above (try <strong>19103</strong> to see sample prospects) to begin searching local boutique law firms.
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-header-main">
                <h2 className="results-title">Sample Prospects for ZIP {searchedZip}</h2>
                {savedProspectIds.length > 0 && (
                  <span className="saved-count-badge">
                    Saved this session: {savedProspectIds.length}
                  </span>
                )}
              </div>
              <p className="results-subtitle">
                Currently showing seeded demo prospect data from the database.{" "}
                {savedProspectIds.length > 0 && (
                  <span className="saved-helper-text">Saved for this browser session only.</span>
                )}
              </p>
            </div>

            <div className="prospects-list">
              {matchingProspects.map((prospect) => (
                <ProspectCard
                  key={prospect.id}
                  prospect={prospect}
                  isExpanded={!!expandedProspects[prospect.id]}
                  isSaved={savedProspectIds.includes(prospect.id)}
                  onToggleExpand={toggleExpand}
                  onToggleSave={toggleSave}
                />
              ))}
            </div>
          </>
        ) : (
          <div className="placeholder-card">
            <span className="placeholder-icon">⚠️</span>
            <h3 className="placeholder-title">No sample prospects are available for this ZIP yet</h3>
            <p className="placeholder-desc">
              There are no manual seed records configured for ZIP <strong>{searchedZip}</strong>. Please search for ZIP <strong>19103</strong> to view fictional law firm leads.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}


