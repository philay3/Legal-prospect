"use client";

import { useState } from "react";
import { normalizeZipCode } from "@/utils/prospectMatcher";
import { ResultsTable } from "@/components/ResultsTable";
import { toCsv } from "@/utils/toCsv";
import type { Prospect } from "@/types/prospect";

export default function Home() {
  const [searchZip, setSearchZip] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [matchingProspects, setMatchingProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);

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

  const handleDownloadCsv = () => {
    if (matchingProspects.length === 0) return;
    const csvContent = toCsv(matchingProspects);
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `leads-${searchedZip || "export"}.csv`);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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
            <h3 className="placeholder-title">Searching for prospects...</h3>
            <p className="placeholder-desc">
              Searching live for firms near <strong>{normalizeZipCode(searchZip) || searchZip}</strong> — this can take a minute or two.
            </p>
          </div>
        ) : searchedZip === null ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">🔍</span>
            <h3 className="placeholder-title">Ready for Search</h3>
            <p className="placeholder-desc">
              Enter a 5-digit ZIP code above (try <strong>19103</strong> to see pilot prospects) to begin ZIP-code search for boutique law firms.
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <>
            <div className="results-header">
              <div className="results-header-main">
                <h2 className="results-title">Law firms near {getResolvedLocationString()}</h2>
                <button
                  type="button"
                  className="download-csv-btn"
                  onClick={handleDownloadCsv}
                  aria-label="Download all search results as CSV"
                >
                  📥 Download CSV
                </button>
              </div>
              <p className="results-subtitle">
                Currently showing a small pilot dataset: seeded demo prospects plus manually reviewed real-firm records pending final verification.
              </p>
            </div>

            {searchedZip && (
              <div className="api-endpoint-container">
                <span className="api-badge">API</span>
                <span className="api-method">GET</span>
                <a
                  href={`/api/prospects/search?zip=${encodeURIComponent(searchedZip)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-link"
                  title="Open raw JSON search endpoint in a new tab"
                >
                  /api/prospects/search?zip={searchedZip}
                </a>
                <button
                  type="button"
                  onClick={() => {
                    const apiPath = `/api/prospects/search?zip=${encodeURIComponent(searchedZip)}`;
                    const absoluteUrl = `${window.location.origin}${apiPath}`;
                    navigator.clipboard.writeText(absoluteUrl);
                    setCopied(true);
                    setTimeout(() => setCopied(false), 2000);
                  }}
                  className="api-copy-btn"
                  aria-label="Copy API URL to clipboard"
                >
                  {copied ? "Copied! ✓" : "📋 Copy"}
                </button>
                
                <span className="api-divider">|</span>
                
                <a
                  href={`/api/prospects/search?zip=${encodeURIComponent(searchedZip)}&refresh=true`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="api-refresh-link"
                  title="Triggers live search (takes ~80s)"
                  onClick={(e) => {
                    if (
                      !confirm(
                        "Are you sure you want to trigger a live re-run? This takes around 80 seconds and runs real-time queries."
                      )
                    ) {
                      e.preventDefault();
                    }
                  }}
                >
                  ⚡ Force Live Re-run (?refresh=true)
                </a>
              </div>
            )}

            <ResultsTable prospects={matchingProspects} />
          </>
        ) : (
          <div className="placeholder-card">
            <span className="placeholder-icon">⚠️</span>
            <h3 className="placeholder-title">No prospects found</h3>
            <p className="placeholder-desc">
              No prospects found for this ZIP code in the current pilot dataset. Please search for ZIP <strong>19103</strong> to view pilot prospect data.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
