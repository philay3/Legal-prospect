"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { normalizeZipCode, matchProspectsByZip } from "@/utils/prospectMatcher";
import { parseZipInput } from "@/utils/parseZipInput";
import { ResultsLedger } from "@/components/ResultsLedger";
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

  useEffect(() => {
    fetchRecent();
  }, []);

  const runSearch = async (zipInput: string, bypassForceRefresh = false) => {
    const { zips, error: parseError } = parseZipInput(zipInput);
    if (parseError) {
      setError(parseError);
      setSearchedZips([]);
      setMatchingProspects([]);
      return;
    }
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
      await fetchRecent();
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
    if (searchedZips.length === 1 && matchingProspects.length > 0) {
      const first = matchingProspects[0];
      const titleCase = (str: string) => {
        if (!str) return "";
        return str.toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
      };
      const city = first.city ? titleCase(first.city.trim()) : "";
      const state = first.state ? first.state.trim().toUpperCase() : "";
      if (city && state) {
        return `${city}, ${state}`;
      }
    }
    if (searchedZips.length > 1) {
      return `${searchedZips.length} ZIPs`;
    }
    return `ZIP ${searchedZips.join(", ")}`;
  };

  const showRightGroup = searchedZips.length > 0 && matchingProspects.length > 0;

  return (
    <div className="app-wrapper rl-page">
      {/* Top Bar with Search Input & Action Button / Resolved Location */}
      <form onSubmit={handleSearch} className="rl-search-top-bar">
        {/* Left Input/Search Group */}
        <div className="rl-search-left-group">
          <div className="rl-search-field">
            <label className="rl-search-label" htmlFor="zip-search">
              Search ZIP / Postal
            </label>
            <div className="rl-search-input-container">
              <input
                id="zip-search"
                type="text"
                className="rl-search-input"
                placeholder="19103"
                value={searchZip}
                onChange={(e) => {
                  setSearchZip(e.target.value);
                  if (error) setError(null);
                }}
                disabled={isLoading}
              />
            </div>
          </div>
          <button type="submit" className="rl-search-submit-btn" disabled={isLoading}>
            {isLoading ? "Searching" : "Search"}
          </button>
          <button
            type="button"
            className={`rl-refresh-toggle-btn ${forceRefresh ? "rl-active" : ""}`}
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
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <polyline points="23 4 23 10 17 10" />
              <polyline points="1 20 1 14 7 14" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
          </button>
        </div>

        {/* Right Location/Count Group */}
        {showRightGroup && (
          <div className="rl-search-right-group">
            <h2 className="rl-location-title">{getResolvedLocationString()}</h2>
            <div className="rl-location-count-line">
              <span className="rl-count-highlight">{matchingProspects.length}</span>{" "}
              {matchingProspects.length === 1 ? "firm" : "firms"}
            </div>
          </div>
        )}
      </form>

      {/* Hint, Error and Recent Searches section */}
      <div className="rl-search-status-area">
        {error && <div className="rl-search-error">{error}</div>}
        
        {recentSearches.length > 0 && (
          <div className="rl-recent-section">
            <h3 className="rl-recent-title">Recent Searches</h3>
            <div className="rl-recent-chips">
              {recentSearches.map((zip, idx) => (
                <button
                  key={`${zip}-${idx}`}
                  type="button"
                  className="rl-recent-chip"
                  onClick={() => handleChipClick(zip)}
                  disabled={isLoading}
                >
                  {zip}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Results Area */}
      <section className="rl-results-wrapper">
        {isLoading ? (
          <div className="rl-placeholder-panel">
            <h3 className="rl-placeholder-heading">Searching for prospects…</h3>
            <p className="rl-placeholder-subline">
              Searching live for firms near {normalizeZipCode(searchZip) || searchZip} — this can take a minute or two
            </p>
          </div>
        ) : searchedZips.length === 0 ? (
          <div className="rl-placeholder-panel">
            <h3 className="rl-placeholder-heading rl-placeholder-heading-muted">Ready to prospect</h3>
            <p className="rl-placeholder-subline">
              Enter a 5-digit ZIP code above (e.g., 19103) to find small and boutique law firms in that area
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <ResultsLedger prospects={matchingProspects} zipLabel={searchedZips.join(", ")} />
        ) : (
          <div className="rl-placeholder-panel">
            <h3 className="rl-placeholder-heading rl-placeholder-heading-muted">No prospects found</h3>
            <p className="rl-placeholder-subline">
              No law firms found for this ZIP. Double-check the ZIP code and try again
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

export default function Home() {
  return (
    <Suspense
      fallback={
        <div className="app-wrapper rl-page">
          <div className="rl-placeholder-panel">
            <h3 className="rl-placeholder-heading-serif">Loading search interface…</h3>
          </div>
        </div>
      }
    >
      <HomeContent />
    </Suspense>
  );
}
