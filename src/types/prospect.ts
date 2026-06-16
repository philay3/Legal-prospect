export interface Prospect {
  id: string;
  firmName: string;
  zip: string;
  city: string;
  state: string;
  website: string | null;
  phone: string | null;
  practiceAreas: string[];
  attorneyCountRange: string;
  sourceType: string;
  confidence: string;
  notes: string | null;
}
