import type { Prospect } from "@/types/prospect";

/**
 * Formats the address for visual scanning and CSV export.
 * Address = streetAddress if present, otherwise city, state; append zip.
 * Returns an empty string if there is no address info.
 */
export function formatAddress(prospect: Prospect): string {
  const base = prospect.streetAddress
    ? prospect.streetAddress
    : (prospect.city && prospect.state ? `${prospect.city}, ${prospect.state}` : "");
  
  if (!base && !prospect.zip) return "";
  return base ? `${base} ${prospect.zip}` : prospect.zip;
}

/**
 * Escapes a cell value according to RFC 4180 CSV standard.
 * Double quotes are doubled, and the value is wrapped in double quotes.
 */
export function escapeCsvField(val: string | null | undefined): string {
  if (val === null || val === undefined) {
    return '""';
  }
  const clean = String(val);
  const escaped = clean.replace(/"/g, '""');
  return `"${escaped}"`;
}

/**
 * Converts an array of Prospect objects to a CSV string.
 * Ordered columns: Name, Email, Phone, Website, Address
 */
export function toCsv(prospects: Prospect[]): string {
  const headers = ["Name", "Email", "Phone", "Website", "Address", "Practice Areas", "Attorneys"];
  const lines = [headers.map(h => `"${h}"`).join(",")];

  for (const p of prospects) {
    const practiceAreasStr = p.practiceAreas ? p.practiceAreas.filter(a => a && a.trim()).join(", ") : "";
    const attorneysStr = p.attorneys ? p.attorneys.filter(a => a && a.trim()).join(", ") : "";

    const row = [
      escapeCsvField(p.firmName || ""),
      escapeCsvField(p.email || ""),
      escapeCsvField(p.phone || ""),
      escapeCsvField(p.website || ""),
      escapeCsvField(formatAddress(p)),
      escapeCsvField(practiceAreasStr),
      escapeCsvField(attorneysStr)
    ];
    lines.push(row.join(","));
  }

  return lines.join("\r\n");
}
