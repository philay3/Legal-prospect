"use client";

import { useState, useMemo, useEffect } from "react";
import type { Prospect } from "@/types/prospect";
import { formatAddress } from "@/utils/toCsv";

interface ResultsTableProps {
  prospects: Prospect[];
}

type SortField = "name" | "email" | "phone" | "website" | "address";
type SortOrder = "asc" | "desc";

export function ResultsTable({ prospects }: ResultsTableProps) {
  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Reset sorting and page whenever the search results change
  useEffect(() => {
    setCurrentPage(1);
    setSortField(null);
    setSortOrder(null);
  }, [prospects]);

  // Retrieve sortable values for compare
  const getSortValue = (prospect: Prospect, field: SortField): string => {
    switch (field) {
      case "name":
        return prospect.firmName || "";
      case "email":
        return prospect.email || "";
      case "phone":
        return prospect.phone || "";
      case "website":
        return prospect.website || "";
      case "address":
        return formatAddress(prospect);
      default:
        return "";
    }
  };

  // Sort prospects client-side over the entire result set
  const sortedProspects = useMemo(() => {
    if (!sortField || !sortOrder) {
      return prospects;
    }

    return [...prospects].sort((a, b) => {
      const valA = getSortValue(a, sortField).trim();
      const valB = getSortValue(b, sortField).trim();

      // Empty/null values sort to the bottom regardless of direction
      if (valA === "" && valB === "") return 0;
      if (valA === "") return 1;
      if (valB === "") return -1;

      const comp = valA.localeCompare(valB, undefined, { sensitivity: "base", numeric: true });
      return sortOrder === "asc" ? comp : -comp;
    });
  }, [prospects, sortField, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(sortedProspects.length / itemsPerPage));
  const activePage = Math.min(currentPage, totalPages);

  const startIndex = (activePage - 1) * itemsPerPage;
  const paginatedProspects = sortedProspects.slice(startIndex, startIndex + itemsPerPage);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      // Toggle order
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortOrder("asc");
    }
    setCurrentPage(1); // Reset to page 1 when sort changes
  };

  const renderHeader = (label: string, field: SortField) => {
    const isSorted = sortField === field;
    return (
      <th onClick={() => handleSort(field)} className="sortable-header">
        <span className="header-text">{label}</span>
        <span className="sort-indicator" aria-hidden="true">
          {isSorted ? (sortOrder === "asc" ? " ▲" : " ▼") : " ↕"}
        </span>
      </th>
    );
  };

  return (
    <div className="table-container">
      <table className="results-table">
        <thead>
          <tr>
            {renderHeader("Name", "name")}
            {renderHeader("Email", "email")}
            {renderHeader("Phone", "phone")}
            {renderHeader("Website", "website")}
            {renderHeader("Address", "address")}
          </tr>
        </thead>
        <tbody>
          {paginatedProspects.map((prospect) => {
            const displayAddress = formatAddress(prospect) || "—";
            const displayWebsite = prospect.website
              ? prospect.website.replace(/^https?:\/\/(www\.)?/, "")
              : "—";

            return (
              <tr key={prospect.id}>
                <td title={prospect.firmName}>{prospect.firmName}</td>
                <td>
                  {prospect.email ? (
                    <a href={`mailto:${prospect.email}`} className="contact-link" title={prospect.email}>
                      {prospect.email}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {prospect.phone ? (
                    <a href={`tel:${prospect.phone}`} className="contact-link" title={prospect.phone}>
                      {prospect.phone}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td>
                  {prospect.website ? (
                    <a
                      href={prospect.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contact-link"
                      title={prospect.website}
                    >
                      {displayWebsite}
                    </a>
                  ) : (
                    "—"
                  )}
                </td>
                <td title={displayAddress}>{displayAddress}</td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {totalPages > 1 && (
        <div className="pagination-container">
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
            disabled={activePage === 1}
          >
            Prev
          </button>
          <span className="page-indicator">
            Page {activePage} of {totalPages}
          </span>
          <button
            type="button"
            className="pagination-btn"
            onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
            disabled={activePage === totalPages}
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
}
