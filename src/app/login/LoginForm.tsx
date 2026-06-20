"use client";

import { useState } from "react";
import Link from "next/link";

export interface LoginFormProps {
  mode?: "login" | "signup";
}

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/request-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: trimmedEmail }),
      });

      if (!response.ok) {
        setError("We could not complete the request. Please try again.");
      } else {
        setStep(2);
      }
    } catch (err) {
      setError("We could not complete the request. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmedCode = code.trim();
    if (!trimmedCode || trimmedCode.length !== 6 || !/^\d+$/.test(trimmedCode)) {
      setError("Please enter a valid 6-digit login code.");
      return;
    }

    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch("/api/auth/verify-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim(), code: trimmedCode }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.ok) {
          window.location.assign("/dashboard");
        } else {
          setError("That code didn't work — check it and try again.");
        }
      } else {
        setError("That code didn't work — check it and try again.");
      }
    } catch (err) {
      setError("That code didn't work — check it and try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="search-card" style={{ maxWidth: "400px", width: "100%", margin: "0 auto" }}>
      {step === 1 ? (
        <form onSubmit={handleRequestCode}>
          <h2 className="results-title" style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>
            {mode === "signup" ? "Create your account" : "Sign In"}
          </h2>
          <p className="placeholder-desc" style={{ marginBottom: "1.5rem", textAlign: "left" }}>
            {mode === "signup"
              ? "Enter your email to get started."
              : "Enter your email address below to receive a secure one-time login code."}
          </p>

          <label className="search-label" htmlFor="email-input" style={{ display: "block", marginBottom: "0.5rem" }}>
            Email Address
          </label>
          <div className="search-group" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              id="email-input"
              type="email"
              className="search-input"
              placeholder="name@example.com"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
            />
            <button type="submit" className="search-button" disabled={isLoading} style={{ width: "100%" }}>
              {isLoading ? "Sending..." : (mode === "signup" ? "Send Signup Code" : "Send Login Code")}
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <h2 className="results-title" style={{ marginBottom: "1rem", fontSize: "1.5rem" }}>Verify Code</h2>
          <p className="placeholder-desc" style={{ marginBottom: "1.5rem", textAlign: "left", color: "#10b981" }}>
            {mode === "signup"
              ? "We've sent a verification code to your email."
              : "If that email is approved, we've sent a code."}
          </p>

          <label className="search-label" htmlFor="code-input" style={{ display: "block", marginBottom: "0.5rem" }}>
            6-Digit Code
          </label>
          <div className="search-group" style={{ display: "flex", flexDirection: "column", gap: "0.75rem" }}>
            <input
              id="code-input"
              type="text"
              className="search-input"
              placeholder="000000"
              maxLength={6}
              value={code}
              onChange={(e) => {
                setCode(e.target.value);
                if (error) setError(null);
              }}
              disabled={isLoading}
              style={{ letterSpacing: "0.25em", textAlign: "center", fontSize: "1.2rem" }}
            />
            <button type="submit" className="search-button" disabled={isLoading} style={{ width: "100%" }}>
              {isLoading ? "Verifying..." : (mode === "signup" ? "Verify & Create Account" : "Verify & Sign In")}
            </button>
            <button
              type="button"
              onClick={() => {
                setStep(1);
                setCode("");
                setError(null);
              }}
              className="prospect-toggle-btn"
              style={{ alignSelf: "center", marginTop: "0.5rem" }}
              disabled={isLoading}
            >
              ← Back to Email
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      )}

      <div style={{ marginTop: "1rem", textAlign: "center", borderTop: "1px solid var(--card-border)", paddingTop: "1rem", fontSize: "0.85rem" }}>
        {mode === "login" ? (
          <p style={{ color: "var(--text-muted, #9ca3af)" }}>
            Need an account?{" "}
            <Link
              href="/signup"
              className="contact-link"
              style={{ fontWeight: 600 }}
            >
              Sign up
            </Link>
          </p>
        ) : (
          <p style={{ color: "var(--text-muted, #9ca3af)" }}>
            Already have an account?{" "}
            <Link
              href="/login"
              className="contact-link"
              style={{ fontWeight: 600 }}
            >
              Sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}
