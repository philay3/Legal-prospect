"use client";

import React from "react";

interface LeadStatusFilterProps {
  activeCount: number;
  wonCount: number;
  lostCount: number;
  selected: "all" | "active" | "won" | "lost";
  onSelect: (status: "all" | "active" | "won" | "lost") => void;
}

export function LeadStatusFilter({
  activeCount,
  wonCount,
  lostCount,
  selected,
  onSelect,
}: LeadStatusFilterProps) {
  const totalCount = activeCount + wonCount + lostCount;

  return (
    <div
      role="group"
      aria-label="Filter saved leads by status"
      className="rl-seg-control"
    >
      <button
        type="button"
        className={`rl-seg-btn ${selected === "all" ? "rl-active" : ""}`}
        onClick={() => onSelect("all")}
      >
        All <span className="rl-seg-count">{totalCount}</span>
      </button>

      <button
        type="button"
        className={`rl-seg-btn ${selected === "active" ? "rl-active" : ""}`}
        onClick={() => onSelect("active")}
      >
        Active <span className="rl-seg-count">{activeCount}</span>
      </button>

      <button
        type="button"
        className={`rl-seg-btn ${selected === "won" ? "rl-active" : ""}`}
        onClick={() => onSelect("won")}
      >
        Won <span className="rl-seg-count">{wonCount}</span>
      </button>

      <button
        type="button"
        className={`rl-seg-btn ${selected === "lost" ? "rl-active" : ""}`}
        onClick={() => onSelect("lost")}
      >
        Lost <span className="rl-seg-count">{lostCount}</span>
      </button>
    </div>
  );
}
