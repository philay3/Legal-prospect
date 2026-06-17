import type { Prospect } from "../types/prospect";

/**
 * Manually reviewed real law firm records.
 *
 * Do not add records here unless each one has been checked against:
 * - official firm website
 * - attorney/bar status source where applicable
 * - physical office location
 * - duplicate/domain checks
 *
 * Automated/model-generated records must not be added here as VERIFIED.
 */
export const REAL_FIRMS: Prospect[] = [
  {
    id: "firm-real-19103-martin-law",
    firmName: "Martin Law LLC",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1818 Market St, 35th Floor",
    website: "https://www.paworkinjury.com",
    phone: "215-587-8400",
    email: null,
    practiceAreas: [
      "Workers' Compensation",
      "Social Security Disability",
      "Long-Term Disability",
      "Veterans Benefits"
    ],
    attorneyCountRange: "11-20",
    attorneys: ["George Martin", "Matthew L. Wilson"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.paworkinjury.com/locations/philadelphia/",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  },
  {
    id: "firm-real-19103-ballard-spahr",
    firmName: "Ballard Spahr LLP",
    zip: "19103",
    zipExt: "7599",
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1735 Market Street, 51st Floor",
    website: "https://www.ballardspahr.com",
    phone: "215-665-8500",
    email: null,
    practiceAreas: [
      "Litigation",
      "Business and Transactions",
      "Finance",
      "Real Estate",
      "Intellectual Property"
    ],
    attorneyCountRange: "21+",
    attorneys: ["Marcel S. Pratt"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.ballardspahr.com/offices/philadelphia",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  },
  {
    id: "firm-real-19103-nissenbaum-law-group",
    firmName: "Nissenbaum Law Group, LLC",
    zip: "19103",
    zipExt: null,
    city: "Philadelphia",
    state: "PA",
    streetAddress: "1650 Market St, Suite 3600",
    website: "https://www.gdnlaw.com",
    phone: "215-523-9350",
    email: "gdn@gdnlaw.com",
    practiceAreas: [
      "Internet & Technology Law",
      "Intellectual Property",
      "Commercial Litigation",
      "Commercial Contracts"
    ],
    attorneyCountRange: "6-10",
    attorneys: ["Gary D. Nissenbaum"],
    sourceType: "MANUAL",
    sourceUrl: "https://www.gdnlaw.com/pa-directions/",
    confidenceLevel: "MEDIUM",
    verificationStatus: "PENDING_REVIEW",
    lastCheckedDate: "2026-06-17",
    globalNotes: "Manual intake record reviewed against official source; pending final verification."
  }
];
