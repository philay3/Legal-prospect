import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Contact - Legal Prospector",
  description: "Get in touch with the Legal Prospector support team.",
};

export default function ContactPage() {
  return (
    <div className="app-wrapper" style={{ maxWidth: "480px" }}>
      <header className="header">
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Get In Touch</span>
        </div>
        <h1 className="title">Contact Support</h1>
        <p className="subtitle">
          Have questions or feedback? We'd love to hear from you.
        </p>
      </header>

      <main className="search-card" style={{ gap: "1.5rem", textAlign: "center" }}>
        <p style={{ color: "var(--text-muted)", fontSize: "0.95rem", lineHeight: "1.6" }}>
          For inquiries, feature requests, or technical support, please reach out to our team directly.
        </p>

        <div style={{ margin: "1rem 0" }}>
          <a
            href="mailto:support@legalprospector.com"
            className="search-button"
            style={{ textDecoration: "none", display: "inline-flex", gap: "0.5rem" }}
          >
            ✉️ Email Support
          </a>
        </div>

        <p style={{ color: "#4b5563", fontSize: "0.8rem" }}>
          We typically respond to all inquiries within one business day.
        </p>
      </main>
    </div>
  );
}
