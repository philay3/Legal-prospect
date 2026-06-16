"use client";

import { useState } from "react";
import { SEED_PROSPECTS } from "@/data/prospects";

export default function Home() {
  const [searchZip, setSearchZip] = useState("");
  const [searchedZip, setSearchedZip] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = searchZip.trim();

    if (!trimmed) {
      setError("Please enter a ZIP code.");
      setSearchedZip(null);
      return;
    }

    if (!/^\d{5}$/.test(trimmed)) {
      setError("Please enter a valid 5-digit ZIP code.");
      setSearchedZip(null);
      return;
    }

    setError(null);
    setSearchedZip(trimmed);
  };

  const matchingProspects = searchedZip
    ? SEED_PROSPECTS.filter((p) => p.zip === searchedZip)
    : [];

  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Phase 2: Seed Search</span>
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
            />
            <button type="submit" className="search-button">
              Search
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      </main>

      <section className="results-section">
        {searchedZip === null ? (
          <div className="placeholder-card">
            <span className="placeholder-icon">🔍</span>
            <h3 className="placeholder-title">Ready for Search</h3>
            <p className="placeholder-desc">
              Enter a 5-digit ZIP code above (try <strong>19103</strong> to see demo prospects) to begin searching local boutique law firms.
            </p>
          </div>
        ) : matchingProspects.length > 0 ? (
          <>
            <div className="results-header">
              <h2 className="results-title">Demo Prospects for ZIP {searchedZip}</h2>
              <p className="results-subtitle">Manual/demo seed data for testing purposes</p>
            </div>

            <div className="prospects-list">
              {matchingProspects.map((prospect) => (
                <div key={prospect.id} className="prospect-card">
                  <div className="prospect-header">
                    <h3 className="prospect-name">{prospect.firmName}</h3>
                    <span
                      className={`confidence-badge confidence-${prospect.confidence
                        .split(" ")[0]
                        .toLowerCase()}`}
                    >
                      {prospect.confidence}
                    </span>
                  </div>

                  <div className="prospect-meta">
                    <span className="meta-item location">
                      📍 {prospect.city}, {prospect.state} {prospect.zip}
                    </span>
                    <span className="meta-item size">
                      👥 {prospect.attorneyCountRange} attorneys
                    </span>
                  </div>

                  <div className="prospect-practice-areas">
                    {prospect.practiceAreas.map((area, i) => (
                      <span key={i} className="practice-tag">
                        {area}
                      </span>
                    ))}
                  </div>

                  <div className="prospect-contact">
                    {prospect.phone && (
                      <div className="contact-item">
                        <span className="contact-label">Phone:</span>{" "}
                        <span className="contact-value">{prospect.phone}</span>
                      </div>
                    )}
                    {prospect.website && (
                      <div className="contact-item">
                        <span className="contact-label">Website:</span>{" "}
                        <a
                          href={prospect.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="contact-link"
                        >
                          {prospect.website.replace("https://", "")}
                        </a>
                      </div>
                    )}
                  </div>

                  {prospect.notes && (
                    <div className="prospect-notes">
                      <span className="notes-label">Notes:</span> {prospect.notes}
                    </div>
                  )}

                  <div className="prospect-source">
                    Source: {prospect.sourceType}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="placeholder-card">
            <span className="placeholder-icon">⚠️</span>
            <h3 className="placeholder-title">No demo prospects are available for this ZIP yet</h3>
            <p className="placeholder-desc">
              There are no manual seed records configured for ZIP <strong>{searchedZip}</strong>. Please search for ZIP <strong>19103</strong> to view fictional law firm leads.
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

