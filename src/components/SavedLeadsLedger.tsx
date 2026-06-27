"use client";

import React from "react";
import { useRouter } from "next/navigation";
import type { SavedLeadRow } from "@/types/prospect";
import { leadActivityLine } from "@/utils/leadActivity";

interface SavedLeadsLedgerProps {
  leads: SavedLeadRow[];
  selected: "all" | "active" | "won" | "lost";
}

export function SavedLeadsLedger({ leads, selected }: SavedLeadsLedgerProps) {
  const router = useRouter();

  const handleRowClick = (lead: SavedLeadRow) => {
    router.push("/firms/" + (lead.slug ?? lead.id));
  };

  return (
    <div className="rl-leads-list-container">
      {/* Table Rules */}
      <div className="rl-header-rules">
        <div className="rl-rule-top" />
        <div className="rl-rule-sub" />
      </div>

      {leads.length === 0 ? (
        <div className="rl-empty-status">No {selected} leads yet.</div>
      ) : (
        <div className="rl-rows-container">
          {leads.map((lead) => {
            const emailVal = lead.email && lead.email.trim();
            const phoneVal = lead.phone && lead.phone.trim();
            const status = lead.status || "ACTIVE";

            // Determine status display details
            let dotClass = "";
            let labelClass = "";
            if (status === "WON") {
              dotClass = "rl-dot-won";
              labelClass = "rl-status-won";
            } else if (status === "LOST") {
              dotClass = "rl-dot-lost";
              labelClass = "rl-status-lost";
            } else {
              dotClass = "rl-dot-active";
              labelClass = "rl-status-active";
            }

            return (
              <div
                key={lead.id}
                className="rl-leads-grid rl-leads-row"
                onClick={() => handleRowClick(lead)}
              >
                {/* Main Cell (Name & Contact Line) */}
                <div className="rl-col-main">
                  <div className="rl-lead-firm-name">{lead.firmName}</div>
                  <div className="rl-lead-contact-line">
                    {emailVal && phoneVal ? (
                      <>
                        <span className="rl-lead-email">{emailVal}</span>
                        <div className="rl-lead-contact-divider" />
                        <span className="rl-lead-phone">{phoneVal}</span>
                      </>
                    ) : emailVal ? (
                      <span className="rl-lead-email">{emailVal}</span>
                    ) : phoneVal ? (
                      <span className="rl-lead-phone">{phoneVal}</span>
                    ) : (
                      <span className="rl-lead-empty-dash">—</span>
                    )}
                  </div>
                </div>

                {/* Status Pill */}
                <div>
                  <div className={`rl-lead-status-pill ${labelClass}`}>
                    <span className={`rl-lead-status-dot ${dotClass}`} />
                    <span>{status}</span>
                  </div>
                </div>

                {/* Activity Cell */}
                <div className="rl-lead-activity">
                  {leadActivityLine(lead)}
                </div>

                {/* Arrow Cell */}
                <div className="rl-lead-arrow">→</div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
