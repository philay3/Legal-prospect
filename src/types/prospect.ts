import type { LeadStatus } from "../utils/leadStatus";

export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

export type ConfidenceTier = "HIGH" | "MEDIUM" | "LOW";

export type VerificationStatus =
  | "CANDIDATE"
  | "PENDING_REVIEW"
  | "VERIFIED"
  | "REJECTED"
  | "STALE";

export type SourceType =
  | "BAR_DIRECTORY"
  | "GOOGLE_MAPS"
  | "WEB_SCRAPE"
  | "MANUAL"
  | "MANUAL_SEED";

export interface Prospect {
  id: string;
  slug?: string | null;
  firmName: string;
  zip: string;
  zipExt?: string | null;
  searchZip?: string | null;
  city: string;
  state: string;
  streetAddress?: string | null;
  website: string | null;
  phone: string | null;
  email?: string | null;
  practiceAreas: string[];
  attorneyCountRange: string;
  attorneys: string[];
  sourceType: SourceType;
  sourceUrl?: string | null;
  confidenceLevel: ConfidenceLevel;
  confidenceTier?: ConfidenceTier;
  verificationStatus: VerificationStatus;
  lastCheckedDate?: string | null;
  globalNotes: string | null;
  status?: LeadStatus;
}

export interface SavedLeadRow extends Prospect {
  savedAt: string;          // SavedLead.createdAt, ISO
  statusChangedAt: string;  // SavedLead.updatedAt, ISO
}


