import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About - Legal Prospector",
  description: "Learn more about Legal Prospector, the premier ZIP-based law firm prospecting tool.",
};

export default function AboutPage() {
  return (
    <div className="app-wrapper" style={{ maxWidth: "680px" }}>
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>About Our Platform</span>
        </div>
        <h1 className="title">Legal Prospector</h1>
        <p className="subtitle">
          ZIP-based law firm prospecting built for rapid data acquisition.
        </p>
      </header>

      <main className="search-card" style={{ gap: "1.5rem" }}>
        <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: "700" }}>The Platform</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Legal Prospector is designed specifically for high-efficiency legal services sales representatives—specifically tailored for Thomson Reuters representatives targeting small and boutique law firms.
          </p>
        </section>

        <section style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
          <h2 style={{ fontSize: "1.25rem", color: "#ffffff", fontWeight: "700" }}>Our Value</h2>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Finding and qualifying small law firms is traditionally a manual, slow process. Google Maps and generic searches miss the crucial details or provide outdated information.
          </p>
          <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
            Our platform automatically researches targets, verifying contact details, practice areas, and attorney count. We uncover precise contact and firm data that general search engines miss, putting direct links, active emails, and qualified attorney lists right at your fingertips.
          </p>
        </section>

        <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
          <Link href="/" className="search-button" style={{ textDecoration: "none" }}>
            Start Prospecting
          </Link>
        </div>
      </main>
    </div>
  );
}
