"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LeadStatusFilter } from "@/components/LeadStatusFilter";
import { ResultsTable } from "@/components/ResultsTable";
import type { Prospect } from "@/types/prospect";

interface SavedLeadsClientPageProps {
  initialLeads: Prospect[];
  counts: {
    active: number;
    won: number;
    lost: number;
  };
  savedFirmIds: string[];
}

export function SavedLeadsClientPage({
  initialLeads,
  counts,
  savedFirmIds,
}: SavedLeadsClientPageProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  // Read status from URL, defaulting to 'all'
  const statusParam = searchParams.get("status");
  const selected: "all" | "active" | "won" | "lost" =
    statusParam === "active" || statusParam === "won" || statusParam === "lost"
      ? statusParam
      : "all";

  // Handle updates to status parameter in the URL
  const handleSelect = (status: "all" | "active" | "won" | "lost") => {
    const params = new URLSearchParams(searchParams.toString());
    if (status === "all") {
      params.delete("status");
    } else {
      params.set("status", status);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  // Perform client-side filtering matching the pills' status property
  const filteredLeads = selected === "all"
    ? initialLeads
    : initialLeads.filter((lead) => {
        const leadStatus = lead.status || "ACTIVE";
        return leadStatus.toLowerCase() === selected;
      });

  return (
    <div className="results-section">
      <LeadStatusFilter
        activeCount={counts.active}
        wonCount={counts.won}
        lostCount={counts.lost}
        selected={selected}
        onSelect={handleSelect}
      />

      {filteredLeads.length > 0 ? (
        <ResultsTable
          prospects={filteredLeads}
          removeOnUnsave={true}
          initialSignedIn={true}
          initialSavedFirmIds={savedFirmIds}
          variant="leads"
        />
      ) : (
        <main
          className="search-card"
          style={{ padding: "2.5rem 2rem", textAlign: "center" }}
        >
          <span
            className="placeholder-icon"
            style={{ fontSize: "2rem", marginBottom: "1rem", display: "block" }}
          >
            🔖
          </span>
          <h3 className="placeholder-title" style={{ fontSize: "1.2rem", marginBottom: "0.5rem" }}>
            No {selected !== "all" ? selected : ""} Saved Leads Found
          </h3>
          <p
            className="placeholder-desc"
            style={{ marginBottom: "1.5rem", maxWidth: "450px", margin: "0 auto 1.5rem" }}
          >
            {selected === "all"
              ? "Firms you bookmark during your searches will be listed here."
              : `There are no saved leads currently marked as ${selected}.`}
          </p>
          <div style={{ display: "flex", justifyContent: "center", marginTop: "1rem" }}>
            <Link href="/" className="search-button" style={{ textDecoration: "none" }}>
              Start Searching
            </Link>
          </div>
        </main>
      )}
    </div>
  );
}
