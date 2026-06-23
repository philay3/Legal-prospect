"use client";

import { useState, useReducer, useRef, useEffect } from "react";
import Link from "next/link";
import {
  createInitialOtpState,
  otpReducer,
  otpValue,
} from "@/utils/otpInput";

export interface LoginFormProps {
  mode?: "login" | "signup";
}

export function LoginForm({ mode = "login" }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [step, setStep] = useState<1 | 2>(1);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [otp, dispatch] = useReducer(otpReducer, undefined, createInitialOtpState);
  const code = otpValue(otp);

  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  useEffect(() => {
    if (step === 2) {
      const activeInput = inputRefs.current[otp.focus];
      if (activeInput) {
        activeInput.focus();
        activeInput.select();
      }
    }
  }, [otp.focus, step]);

  const sendCode = async (emailVal: string) => {
    const trimmedEmail = emailVal.trim();
    if (!trimmedEmail) {
      setError("Please enter your email address.");
      return false;
    }
    if (!trimmedEmail.includes("@")) {
      setError("Please enter a valid email address.");
      return false;
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
        return false;
      } else {
        return true;
      }
    } catch (err) {
      setError("We could not complete the request. Please try again.");
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const handleRequestCode = async (e: React.FormEvent) => {
    e.preventDefault();
    const success = await sendCode(email);
    if (success) {
      setStep(2);
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

  const handleResend = async () => {
    if (isLoading) return;
    dispatch({ type: "reset" });
    await sendCode(email);
  };

  const handleDifferentEmail = () => {
    setStep(1);
    dispatch({ type: "reset" });
    setError(null);
  };

  return (
    <div className="auth-card">
      <div className="auth-badge">
        <span className="auth-badge-dot" />
        <span className="auth-badge-text">PASSWORDLESS</span>
      </div>

      {step === 1 ? (
        <form onSubmit={handleRequestCode}>
          <h2 className="auth-title">
            {mode === "signup" ? "Create your account" : "Sign in"}
          </h2>
          <p className="auth-subtext">
            {mode === "signup"
              ? "Enter your email to get started."
              : "Enter your work email and we'll send you a one-time code. No password needed."}
          </p>

          <label className="auth-label" htmlFor="email-input">
            Work email
          </label>
          <input
            id="email-input"
            type="email"
            className="auth-input"
            placeholder="you@firm.com"
            value={email}
            onChange={(e) => {
              setEmail(e.target.value);
              if (error) setError(null);
            }}
            disabled={isLoading}
          />
          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Sending..." : (mode === "signup" ? "Send Signup Code" : "Send code")}
          </button>
          {error && <div className="search-error">{error}</div>}
        </form>
      ) : (
        <form onSubmit={handleVerifyCode}>
          <h2 className="auth-title">Enter your code</h2>
          <p className="auth-subtext">
            We sent a 6-digit code to <span>{email}</span>
          </p>

          <label className="auth-label">
            6-Digit Code
          </label>
          <div className="auth-code-row">
            {Array.from({ length: 6 }).map((_, i) => (
              <input
                key={i}
                ref={(el) => {
                  inputRefs.current[i] = el;
                }}
                type="text"
                inputMode="numeric"
                maxLength={1}
                value={otp.digits[i]}
                aria-label={`Digit ${i + 1} of 6`}
                disabled={isLoading}
                autoComplete={i === 0 ? "one-time-code" : undefined}
                className={`auth-code-box ${otp.digits[i] ? "filled" : ""}`}
                onChange={(e) => {
                  dispatch({ type: "type", index: i, value: e.target.value });
                  if (error) setError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace") {
                    dispatch({ type: "backspace", index: i });
                    if (error) setError(null);
                  }
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  e.preventDefault();
                  dispatch({ type: "paste", index: i, text });
                  if (error) setError(null);
                }}
              />
            ))}
          </div>

          <button type="submit" className="auth-btn" disabled={isLoading}>
            {isLoading ? "Verifying..." : (mode === "signup" ? "Verify & Create Account" : "Sign in")}
          </button>

          <div className="auth-code-actions">
            <button
              type="button"
              className="auth-link-btn resend"
              onClick={handleResend}
              disabled={isLoading}
            >
              Resend code
            </button>
            <button
              type="button"
              className="auth-link-btn different-email"
              onClick={handleDifferentEmail}
              disabled={isLoading}
            >
              Use a different email
            </button>
          </div>
          {error && <div className="search-error">{error}</div>}
        </form>
      )}

      <div style={{ marginTop: "1.5rem", textAlign: "center", borderTop: "1px solid var(--border)", paddingTop: "1.5rem", fontSize: "0.85rem" }}>
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
