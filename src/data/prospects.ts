import { Prospect } from "../types/prospect";

/**
 * Manual/Demo Seed Data for ZIP code 19103 (Center City, Philadelphia, PA).
 * Fictional firm names are used to comply with the project guidelines.
 */
export const SEED_PROSPECTS: Prospect[] = [
  {
    id: "prospect_001",
    firmName: "Liberty Legal Associates",
    zip: "19103",
    city: "Philadelphia",
    state: "PA",
    website: "https://libertylegalphilly-demo.com",
    phone: "215-555-0101",
    practiceAreas: ["Personal Injury", "Civil Litigation"],
    attorneyCountRange: "2-5",
    sourceType: "Manual seed data",
    confidence: "High (Demo)",
    notes: "Demo record representing a small personal injury firm in Center City Philadelphia."
  },
  {
    id: "prospect_002",
    firmName: "Rittenhouse Family Law Partners",
    zip: "19103",
    city: "Philadelphia",
    state: "PA",
    website: "https://rittenhousefamilylaw-demo.com",
    phone: "215-555-0102",
    practiceAreas: ["Divorce", "Child Custody", "Estate Planning"],
    attorneyCountRange: "1",
    sourceType: "Manual seed data",
    confidence: "High (Demo)",
    notes: "Demo record representing a solo practitioner specializing in family law."
  },
  {
    id: "prospect_003",
    firmName: "Schuylkill IP Law Group",
    zip: "19103",
    city: "Philadelphia",
    state: "PA",
    website: "https://schuylkillip-demo.com",
    phone: "215-555-0103",
    practiceAreas: ["Patents", "Trademarks", "Copyrights"],
    attorneyCountRange: "6-10",
    sourceType: "Manual seed data",
    confidence: "Medium (Demo)",
    notes: "Demo record representing a boutique intellectual property firm."
  },
  {
    id: "prospect_004",
    firmName: "Broad Street Employment Law Group",
    zip: "19103",
    city: "Philadelphia",
    state: "PA",
    website: null,
    phone: null,
    practiceAreas: ["Labor Relations", "Employment Law"],
    attorneyCountRange: "2-5",
    sourceType: "Manual seed data",
    confidence: "Low (Demo)",
    notes: "Demo record representing a boutique employment law firm with minimal contact details."
  }
];
