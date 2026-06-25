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

  // Base buttons style generator
  const getButtonStyle = (status: "all" | "active" | "won" | "lost") => {
    const isSelected = selected === status;
    return {
      cursor: "pointer",
      appearance: "none" as const,
      fontFamily: "inherit",
      display: "flex",
      alignItems: "center",
      gap: "8px",
      border: "none",
      borderRadius: "9px",
      padding: "9px 16px",
      fontSize: "13.5px",
      fontWeight: 700,
      transition: "background .15s, color .15s",
      background: isSelected ? "#34d399" : "transparent",
      color: isSelected ? "#04120c" : "#cbd5d1",
    };
  };

  // Badge text style generator
  const getBadgeStyle = (status: "all" | "active" | "won" | "lost") => {
    const isSelected = selected === status;
    return {
      fontFamily: "'JetBrains Mono', monospace",
      fontSize: "12px",
      fontWeight: 600,
      color: isSelected ? "rgba(4,18,12,.55)" : "#5b6776",
      transition: "color .15s",
    };
  };

  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        gap: "16px",
        marginBottom: "8px",
        flexWrap: "wrap",
        width: "100%",
      }}
    >
      <h3 style={{ margin: 0, fontSize: "16px", fontWeight: 800, color: "#fff" }}>
        Saved leads
      </h3>

      <div
        role="group"
        aria-label="Filter saved leads by status"
        style={{
          display: "inline-flex",
          padding: "5px",
          gap: "4px",
          background: "#10171f",
          border: "1px solid rgba(255,255,255,.08)",
          borderRadius: "13px",
        }}
      >
        <style
          dangerouslySetInnerHTML={{
            __html: `
              .lp-seg[aria-pressed="false"]:hover { background: rgba(255,255,255,.05) !important; }
              .lp-seg:focus-visible { outline: 2px solid #34d399; outline-offset: 2px; }
            `,
          }}
        />

        <button
          className="lp-seg"
          type="button"
          onClick={() => onSelect("all")}
          aria-pressed={selected === "all"}
          style={getButtonStyle("all")}
        >
          All{" "}
          <span style={getBadgeStyle("all")}>
            {totalCount}
          </span>
        </button>

        <button
          className="lp-seg"
          type="button"
          onClick={() => onSelect("active")}
          aria-pressed={selected === "active"}
          style={getButtonStyle("active")}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#fbbf24",
            }}
          ></span>
          Active{" "}
          <span style={getBadgeStyle("active")}>
            {activeCount}
          </span>
        </button>

        <button
          className="lp-seg"
          type="button"
          onClick={() => onSelect("won")}
          aria-pressed={selected === "won"}
          style={getButtonStyle("won")}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#34d399",
            }}
          ></span>
          Won{" "}
          <span style={getBadgeStyle("won")}>
            {wonCount}
          </span>
        </button>

        <button
          className="lp-seg"
          type="button"
          onClick={() => onSelect("lost")}
          aria-pressed={selected === "lost"}
          style={getButtonStyle("lost")}
        >
          <span
            style={{
              width: "7px",
              height: "7px",
              borderRadius: "50%",
              background: "#f87171",
            }}
          ></span>
          Lost{" "}
          <span style={getBadgeStyle("lost")}>
            {lostCount}
          </span>
        </button>
      </div>
    </div>
  );
}
