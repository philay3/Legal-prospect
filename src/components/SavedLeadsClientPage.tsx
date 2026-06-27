"use client";

import React from "react";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LeadStatusFilter } from "@/components/LeadStatusFilter";
import { SavedLeadsLedger } from "@/components/SavedLeadsLedger";
import type { SavedLeadRow } from "@/types/prospect";

interface SavedLeadsClientPageProps {
  initialLeads: SavedLeadRow[];
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

  // Zero leads case - empty pipeline
  if (initialLeads.length === 0) {
    return (
      <div className="rl-empty-pipeline">
        <h3 className="rl-empty-title">Your pipeline is empty</h3>
        <p className="rl-empty-text">
          Firms you bookmark during your searches will be listed here.
        </p>
        <Link href="/" className="rl-empty-action">
          Find leads &rarr;
        </Link>
      </div>
    );
  }

  return (
    <div className="results-section">
      <div style={{ marginBottom: "20px" }}>
        <LeadStatusFilter
          activeCount={counts.active}
          wonCount={counts.won}
          lostCount={counts.lost}
          selected={selected}
          onSelect={handleSelect}
        />
      </div>

      <SavedLeadsLedger leads={filteredLeads} selected={selected} />
    </div>
  );
}
