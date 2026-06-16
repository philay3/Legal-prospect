import { SEED_PROSPECTS } from "@/data/prospects";

export default function Home() {
  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Phase 2: Seed Display</span>
        </div>
        <h1 className="title">Legal Prospector</h1>
        <p className="subtitle">
          ZIP-based law firm prospecting for finding small and boutique law firm leads.
        </p>
      </header>

      <main className="search-card">
        <label className="search-label" htmlFor="zip-search">
          Search Law Firms by ZIP Code
        </label>
        <div className="search-group">
          <input
            id="zip-search"
            type="text"
            className="search-input"
            placeholder="Enter 5-digit ZIP code (e.g., 19103)"
            disabled
          />
          <button type="button" className="search-button" disabled>
            Search
          </button>
        </div>
        <div className="search-placeholder-desc">
          ZIP search input is currently a placeholder during early scaffolding.
        </div>
      </main>

      <section className="results-section">
        <div className="results-header">
          <h2 className="results-title">Demo Prospects for ZIP 19103</h2>
          <p className="results-subtitle">Manual/demo seed data for testing purposes</p>
        </div>

        <div className="prospects-list">
          {SEED_PROSPECTS.map((prospect) => (
            <div key={prospect.id} className="prospect-card">
              <div className="prospect-header">
                <h3 className="prospect-name">{prospect.firmName}</h3>
                <span className={`confidence-badge confidence-${prospect.confidence.split(" ")[0].toLowerCase()}`}>
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
      </section>
    </div>
  );
}

