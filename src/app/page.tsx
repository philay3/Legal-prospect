export default function Home() {
  return (
    <div className="app-wrapper">
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Phase 1 Shell</span>
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
        <div className="placeholder-desc" style={{ textAlign: "center", fontSize: "0.8rem", marginTop: "0.25rem" }}>
          ZIP search input is currently a placeholder during early scaffolding.
        </div>
      </main>

      <section className="placeholder-section">
        <div className="placeholder-card">
          <span className="placeholder-icon">📂</span>
          <div className="placeholder-title">Welcome to Legal Prospector</div>
          <p className="placeholder-desc">
            This workspace will display search results from our manual seed data once the local database foundation is activated.
          </p>
        </div>
      </section>
    </div>
  );
}
