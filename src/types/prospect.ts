export type ConfidenceLevel = "HIGH" | "MEDIUM" | "LOW" | "UNKNOWN";

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
  verificationStatus: VerificationStatus;
  lastCheckedDate?: string | null;
  globalNotes: string | null;
}

