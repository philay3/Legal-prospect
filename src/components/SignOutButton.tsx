"use client";

import { useState } from "react";

interface SignOutButtonProps {
  variant?: "default" | "nav";
}

export function SignOutButton({ variant = "default" }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false);

  const handleSignOut = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/sign-out", {
        method: "POST",
      });
      if (response.ok) {
        window.location.assign("/login");
      }
    } catch (err) {
      console.error("Failed to sign out:", err);
    } finally {
      setIsLoading(false);
    }
  };

  const isNav = variant === "nav";

  const defaultStyle: React.CSSProperties = {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.3)",
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: "0.85rem",
    padding: "0.45rem 1rem",
    borderRadius: "0.5rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
    marginTop: "1.5rem",
  };

  const navStyle: React.CSSProperties = {
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    color: "#ef4444",
    border: "1px solid rgba(239, 68, 68, 0.2)",
    fontFamily: "inherit",
    fontWeight: 600,
    fontSize: "0.8rem",
    padding: "0.25rem 0.75rem",
    borderRadius: "0.375rem",
    cursor: "pointer",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.2s ease",
  };

  const activeStyle = isNav ? navStyle : defaultStyle;

  return (
    <button
      onClick={handleSignOut}
      disabled={isLoading}
      style={activeStyle}
      onMouseEnter={(e) => {
        e.currentTarget.style.backgroundColor = "#ef4444";
        e.currentTarget.style.color = "#ffffff";
        e.currentTarget.style.borderColor = "#ef4444";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.backgroundColor = "rgba(239, 68, 68, 0.1)";
        e.currentTarget.style.color = "#ef4444";
        e.currentTarget.style.borderColor = isNav
          ? "rgba(239, 68, 68, 0.2)"
          : "rgba(239, 68, 68, 0.3)";
      }}
    >
      {isLoading ? "Signing Out..." : "Sign Out"}
    </button>
  );
}
