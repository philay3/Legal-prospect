import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth/session";
import { SignOutButton } from "@/components/SignOutButton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Account Settings - Legal Prospector",
  description: "View your account details and manage sign-in settings on the Legal Prospecting platform.",
};

export default async function AccountPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="app-wrapper" style={{ justifyContent: "center", minHeight: "60vh", maxWidth: "480px" }}>
      <header className="header" style={{ marginBottom: "2rem" }}>
        <div className="badge">
          <span className="pulse-dot"></span>
          <span>Authorized Session</span>
        </div>
        <h1 className="title">Your Account</h1>
        <p className="subtitle">Manage your session status below.</p>
      </header>

      <main className="search-card" style={{ textAlign: "center", padding: "2.5rem 2rem" }}>
        <span className="placeholder-icon" style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}>👤</span>
        <h3 className="placeholder-title" style={{ fontSize: "1.1rem", marginBottom: "0.5rem" }}>Logged In Successfully</h3>
        <p className="placeholder-desc" style={{ marginBottom: "1rem" }}>
          You are signed in as:
        </p>
        <div style={{
          backgroundColor: "#0b0f19",
          border: "1px solid var(--card-border)",
          borderRadius: "0.5rem",
          padding: "0.75rem 1rem",
          fontFamily: "monospace",
          fontSize: "1rem",
          color: "#10b981",
          display: "inline-block",
          margin: "0 auto",
        }}>
          {user.email}
        </div>
        <div>
          <SignOutButton />
        </div>
      </main>
    </div>
  );
}
