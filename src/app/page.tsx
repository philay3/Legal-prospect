"use client";

import { useState } from "react";
import { normalizeZipCode } from "@/utils/prospectMatcher";
import { ResultsTable } from "@/components/ResultsTable";
import type { Prospect } from "@/types/prospect";

export default function Home() {
  const [searchZip, setSearchZip] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
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
      return;
    }

    const normalized = normalizeZipCode(trimmed);
    if (!normalized) {
      setError("Please enter a valid ZIP code.");
      setSearchedZip(null);
      setMatchingProspects([]);
      return;
    }

    setError(null);
    setIsLoading(true);

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



  const getResolvedLocationString = () => {
    if (matchingProspects.length === 0) return `ZIP ${searchedZip}`;
    const first = matchingProspects[0];
    const titleCase = (str: string) => {
      if (!str) return "";
      return str
        .toLowerCase()
        .replace(/\b\w/g, (c) => c.toUpperCase());
    };
    const city = first.city ? titleCase(first.city.trim()) : "";
    const state = first.state ? first.state.trim().toUpperCase() : "";
    if (city && state) {
      return `${city}, ${state} ${searchedZip}`;
    }
    return `ZIP ${searchedZip}`;
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
              {isLoading ? (
                <>
                  <span className="btn-spinner"></span>
                  Searching
                </>
              ) : (
                "Search"
              )}
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      </main>

      <section className="results-section">
        {isLoading ? (
          <div className="placeholder-card dashed-panel">
            <span className="spinner-ring"></span>
            <h3 className="placeholder-title text-color">Searching for prospects…</h3>
            <p className="placeholder-desc text-muted-color">
              Searching live for firms near <strong className="accent-text">{normalizeZipCode(searchZip) || searchZip}</strong> — this can take a minute or two.
            </p>
            <div className="pulsing-dots">
              <span className="pulsing-dot"></span>
              <span className="pulsing-dot"></span>
              <span className="pulsing-dot"></span>
            </div>
          </div>
        ) : searchedZip === null ? (
          <div className="placeholder-card dashed-panel">
            <div className="badge-circle">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="search-icon-svg"
              >
                <circle cx="11" cy="11" r="8" />
                <path d="m21 21-4.3-4.3" />
              </svg>
            </div>
            <h3 className="placeholder-title text-color">Ready to prospect</h3>
            <p className="placeholder-desc text-muted-color">
              Enter a 5-digit ZIP code above (e.g., <strong className="accent-text">19103</strong>) to find small and boutique law firms in that area.
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-header-main">
                <h2 className="results-title">Law firms near {getResolvedLocationString()}</h2>
                <span className="results-count">{matchingProspects.length} {matchingProspects.length === 1 ? "firm" : "firms"} found</span>
              </div>
              <p className="results-subtitle">
                Contact details researched automatically. Coverage can vary by firm.
              </p>
            </div>



            <ResultsTable prospects={matchingProspects} variant="search" />
          </>
        ) : (
          <div className="placeholder-card">
            <span className="placeholder-icon">⚠️</span>
            <h3 className="placeholder-title">No prospects found</h3>
            <p className="placeholder-desc">
              No law firms found for this ZIP. Double-check the ZIP code and try again.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
