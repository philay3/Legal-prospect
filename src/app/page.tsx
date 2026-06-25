"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeZipCode, matchProspectsByZip } from "@/utils/prospectMatcher";
import { parseZipInput } from "@/utils/parseZipInput";
import { ResultsTable } from "@/components/ResultsTable";
import type { Prospect } from "@/types/prospect";

function HomeContent() {
  const searchParams = useSearchParams();
  const zipParam = searchParams.get("zip");

  const [searchZip, setSearchZip] = useState("");
  const [searchedZips, setSearchedZips] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [matchingProspects, setMatchingProspects] = useState<Prospect[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [forceRefresh, setForceRefresh] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    const fetchRecent = async () => {
      try {
        const response = await fetch("/api/searches/recent");
        if (response.ok) {
          const data = await response.json();
          if (data && Array.isArray(data.searches)) {
            setRecentSearches(data.searches);
          }
        }
      } catch (error) {
        console.error("Failed to fetch recent searches:", error);
      }
    };
    fetchRecent();
  }, []);

  const runSearch = async (zipInput: string, bypassForceRefresh = false) => {
    const zips = parseZipInput(zipInput);
    if (zips.length === 0) {
      setError("Please enter at least one valid 5-digit ZIP code.");
      setSearchedZips([]);
      setMatchingProspects([]);
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const perZip = await Promise.all(
        zips.map(async (zip) => {
          try {
            const refreshParam = (forceRefresh && !bypassForceRefresh) ? "&refresh=true" : "";
            const response = await fetch(`/api/prospects/search?zip=${encodeURIComponent(zip)}${refreshParam}`);
            if (!response.ok) return { ok: false, prospects: [] as Prospect[] };
            const data = await response.json();
            return { ok: true, prospects: matchProspectsByZip(data.results || [], zip) };
          } catch {
            return { ok: false, prospects: [] as Prospect[] };
          }
        })
      );

      if (!perZip.some((r) => r.ok)) {
        setError("We could not complete the search right now. Please try again.");
        setSearchedZips([]);
        setMatchingProspects([]);
        return;
      }

      const byId = new Map<string, Prospect>();
      for (const r of perZip) {
        for (const p of r.prospects) {
          if (!byId.has(p.id)) byId.set(p.id, p);
        }
      }

      setSearchedZips(zips);
      setMatchingProspects(Array.from(byId.values()));
    } catch {
      setError("We could not complete the search right now. Please try again.");
      setSearchedZips([]);
      setMatchingProspects([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (zipParam) {
      setSearchZip(zipParam);
      runSearch(zipParam);
    }
  }, [zipParam]);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    await runSearch(searchZip);
  };

  const handleChipClick = (zip: string) => {
    setSearchZip(zip);
    runSearch(zip, true); // bypass force-refresh
  };

  const getResolvedLocationString = () => {
    const zipLabel = searchedZips.join(", ");
    if (matchingProspects.length === 0) return `ZIP ${zipLabel}`;
    if (searchedZips.length === 1) {
      const first = matchingProspects[0];
      const titleCase = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      };
      const city = first.city ? titleCase(first.city.trim()) : "";
      const state = first.state ? first.state.trim().toUpperCase() : "";
      if (city && state) {
        return `${city}, ${state} ${searchedZips[0]}`;
      }
    }
    return `ZIP ${zipLabel}`;
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
            <button
              type="button"
              className={`refresh-toggle-btn ${forceRefresh ? "active" : ""}`}
              onClick={() => setForceRefresh((prev) => !prev)}
              disabled={isLoading}
              title="Force fresh research and skip cached results. Slower."
              aria-label="Force fresh research and skip cached results. Slower."
            >
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
              >
                <polyline points="23 4 23 10 17 10" />
                <polyline points="1 20 1 14 7 14" />
                <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
              </svg>
            </button>
          </div>
          <p className="search-hint">Search up to 5 ZIP codes at once — separate them with commas.</p>
          {error && <div className="search-error">{error}</div>}
          {recentSearches.length > 0 && (
            <div className="recent-searches-section">
              <h3 className="recent-searches-title">Recent Searches</h3>
              <div className="search-chips-container">
                {recentSearches.map((zip, idx) => (
                  <button
                    key={`${zip}-${idx}`}
                    type="button"
                    className="search-chip mono"
                    onClick={() => handleChipClick(zip)}
                    style={{ cursor: "pointer", fontFamily: "inherit" }}
                    disabled={isLoading}
                  >
                    {zip}
                  </button>
                ))}
              </div>
            </div>
          )}
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
        ) : searchedZips.length === 0 ? (
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

export default function Home() {
  return (
    <Suspense fallback={
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
        <section className="results-section">
          <div className="placeholder-card dashed-panel">
            <span className="spinner-ring"></span>
            <h3 className="placeholder-title text-color">Loading search interface…</h3>
          </div>
        </section>
      </div>
    }>
      <HomeContent />
    </Suspense>
  );
}
