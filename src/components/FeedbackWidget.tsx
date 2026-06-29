"use client";

import { useState, useEffect, useRef } from "react";

export function FeedbackWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [choice, setChoice] = useState("");
  const [message, setMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const choices = [
    "More emails",
    "Faster search",
    "Better save & export",
    "Something else",
  ];

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };

    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (containerRef.current && !containerRef.current.contains(target)) {
        setIsOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      if (panelRef.current?.contains(e.target as Node)) return;
      setIsOpen(false);
    };

    document.addEventListener("keydown", handleKeyDown);
    document.addEventListener("mousedown", handleClickOutside);
    window.addEventListener("scroll", handleScroll, true);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.removeEventListener("mousedown", handleClickOutside);
      window.removeEventListener("scroll", handleScroll, true);
    };
  }, [isOpen]);

  // Reset form when panel is opened/closed
  useEffect(() => {
    if (!isOpen) {
      setChoice("");
      setMessage("");
      setError(null);
    } else {
      setIsSuccess(false);
    }
  }, [isOpen]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!choice) {
      setError("Please select an option.");
      return;
    }
    setError(null);
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/feedback", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ choice, message }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to submit feedback");
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="feedback-widget-container" ref={containerRef}>
      {/* Floating Bubble Button */}
      <button
        type="button"
        className={`feedback-bubble-btn ${isOpen ? "active" : ""}`}
        onClick={() => setIsOpen((prev) => !prev)}
        aria-haspopup="true"
        aria-expanded={isOpen}
        aria-label="Give feedback"
      >
        {isOpen ? (
          <span className="feedback-bubble-close">&times;</span>
        ) : (
          <span className="feedback-bubble-icon">💬</span>
        )}
      </button>

      {/* Feedback Panel */}
      {isOpen && (
        <div className="feedback-panel" ref={panelRef} role="dialog" aria-label="Feedback form">
          <div className="feedback-panel-header">
            <h3 className="feedback-panel-title">Share Feedback</h3>
            <button
              type="button"
              className="feedback-panel-close-btn"
              onClick={() => setIsOpen(false)}
              aria-label="Close feedback panel"
            >
              &times;
            </button>
          </div>

          {isSuccess ? (
            <div className="feedback-success-state">
              <span className="feedback-success-icon">✨</span>
              <h4>Thank you!</h4>
              <p>Your feedback helps us make Legal Prospector better.</p>
              <button
                type="button"
                className="search-button feedback-close-success-btn"
                onClick={() => setIsOpen(false)}
              >
                Close
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="feedback-form">
              <p className="feedback-question">What would make this more useful?</p>
              
              <div className="feedback-choices">
                {choices.map((item) => (
                  <label key={item} className="feedback-choice-label">
                    <input
                      type="radio"
                      name="feedback-choice"
                      value={item}
                      checked={choice === item}
                      onChange={(e) => setChoice(e.target.value)}
                      className="feedback-radio"
                    />
                    <span className="feedback-choice-text">{item}</span>
                  </label>
                ))}
              </div>

              <div className="feedback-textarea-group">
                <label htmlFor="feedback-msg" className="feedback-textarea-label">
                  Optional Details
                </label>
                <textarea
                  id="feedback-msg"
                  className="feedback-textarea"
                  style={{ color: "#ffffff" }}
                  placeholder="Tell us more..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  maxLength={1000}
                  rows={3}
                />
              </div>

              {error && <div className="feedback-error-msg">{error}</div>}

              <button
                type="submit"
                className="search-button feedback-submit-btn"
                disabled={isSubmitting || !choice}
              >
                {isSubmitting ? "Submitting..." : "Send Feedback"}
              </button>
            </form>
          )}
        </div>
      )}
    </div>
  );
}
