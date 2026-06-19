// src/lib/research/searchProviders/places.ts
import { SearchProvider, SearchResult, SearchContextResponse } from "./types";
import { TavilySearchProvider } from "./tavily";

export interface AddressComponent {
  longText?: string;
  shortText?: string;
  types: string[];
}

export interface PlaceLocation {
  latitude?: number;
  longitude?: number;
}

export interface GooglePlace {
  id?: string;
  displayName?: {
    text?: string;
    languageCode?: string;
  };
  formattedAddress?: string;
  addressComponents?: AddressComponent[];
  location?: PlaceLocation;
  nationalPhoneNumber?: string;
  websiteUri?: string;
  businessStatus?: string;
  types?: string[];
}

/**
 * Safely parses the address components array from Google Places API
 * to extract locality (city), administrative_area_level_1 (state), postal_code (zip), and country.
 */
export function parseAddressComponents(components: AddressComponent[]) {
  let city: string | null = null;
  let state: string | null = null;
  let zip: string | null = null;
  let country: string | null = null;

  if (Array.isArray(components)) {
    for (const comp of components) {
      const types = comp.types || [];
      if (types.includes("locality")) {
        city = comp.longText || comp.shortText || null;
      }
      if (types.includes("administrative_area_level_1")) {
        state = comp.shortText || comp.longText || null;
      }
      if (types.includes("postal_code")) {
        zip = comp.longText || comp.shortText || null;
      }
      if (types.includes("country")) {
        country = comp.shortText || comp.longText || null;
      }
    }
  }

  return { city, state, zip, country };
}

/**
 * Maps a single Google Place object to the engine's firm shape.
 */
export function mapPlaceToFirm(place: GooglePlace): any {
  const { city, state, zip, country } = parseAddressComponents(place.addressComponents || []);
  const isUS = !country || country.toUpperCase() === "US";
  
  return {
    firm_name: place.displayName?.text || "Unknown Firm",
    website: place.websiteUri || null,
    phone: place.nationalPhoneNumber || null,
    address: place.formattedAddress || null,
    city,
    state,
    zip,
    lat: place.location?.latitude || null,
    lng: place.location?.longitude || null,
    email: null,
    attorney_name: null,
    attorneys: [],
    practice_areas: [],
    sourceType: "GOOGLE_MAPS",
    isUS,
  };
}

/**
 * Executes a Text Search (New) request to Google Places API to discover law firms.
 * Uses pagination with nextPageToken up to 3 pages (60 results max).
 */
export async function searchPlaces(
  city: string,
  state: string,
  zipCode: string
): Promise<any[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    throw new Error("Missing GOOGLE_PLACES_API_KEY environment variable. Cannot perform search.");
  }

  const queryLocation = (city && state) ? `${city}, ${state} ${zipCode}` : zipCode;
  const headers = {
    "Content-Type": "application/json",
    "X-Goog-Api-Key": apiKey,
    "X-Goog-FieldMask": "places.id,places.displayName,places.formattedAddress,places.addressComponents,places.location,places.nationalPhoneNumber,places.websiteUri,places.businessStatus,places.types,nextPageToken",
  };

  let allPlaces: GooglePlace[] = [];
  let nextPageToken: string | undefined = undefined;
  let pageCount = 0;

  do {
    const body: any = {
      textQuery: `law firms in ${queryLocation}`,
      includedType: "lawyer",
    };
    if (nextPageToken) {
      body.pageToken = nextPageToken;
    }

    console.log(`[places] Querying page ${pageCount + 1} for location query: "${body.textQuery}"`);
    const res = await fetch("https://places.googleapis.com/v1/places:searchText", {
      method: "POST",
      headers,
      body: JSON.stringify(body),
    });

    if (!res.ok) {
      const errorText = await res.text().catch(() => "");
      throw new Error(`Google Places API error HTTP ${res.status}: ${errorText || res.statusText}`);
    }

    const data = await res.json();
    if (data.places && Array.isArray(data.places)) {
      allPlaces = allPlaces.concat(data.places);
    }
    nextPageToken = data.nextPageToken;
    pageCount++;
  } while (nextPageToken && pageCount < 3);

  console.log(`[places] Discovered ${allPlaces.length} total raw places from Google Places API across ${pageCount} pages`);
  return allPlaces.map(mapPlaceToFirm);
}

/**
 * Google Places search provider class implementing standard SearchProvider interface.
 */
export class PlacesSearchProvider implements SearchProvider {
  private tavilyDelegate: TavilySearchProvider;

  constructor() {
    this.tavilyDelegate = new TavilySearchProvider();
  }

  async getSearchContext(
    zipCode: string,
    mode: "quick" | "thorough",
    city?: string,
    state?: string
  ): Promise<SearchContextResponse> {
    // Under places provider, runLeadResearch bypasses getSearchContext.
    // If called directly, return a warning placeholder.
    return {
      queries: [],
      context: "Search context gathering is bypassed when using Google Places provider.",
      success: true,
      resultCount: 0
    };
  }

  async getFirmSearchContext(
    firmName: string,
    zipCode: string
  ): Promise<SearchResult[]> {
    // Delegate to Tavily search context to get secondary contact pages if the main website is missing or needs lookup.
    return this.tavilyDelegate.getFirmSearchContext(firmName, zipCode);
  }
}
