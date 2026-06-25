"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function DashboardSearch() {
  const [zip, setZip] = useState("");
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = zip.trim();
    if (trimmed) {
      router.push(`/?zip=${encodeURIComponent(trimmed)}`);
    }
  };

  return (
    <form onSubmit={handleSearch} className="dashboard-search-form">
      <input
        type="text"
        className="dashboard-search-input"
        placeholder="Enter ZIP code..."
        value={zip}
        onChange={(e) => setZip(e.target.value)}
      />
      <button type="submit" className="dashboard-search-button">
        Search
      </button>
    </form>
  );
}
