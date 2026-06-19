import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { parseAddressComponents, mapPlaceToFirm, searchPlaces, PlacesSearchProvider } from "./places";
import { selectProvider, getSearchProvider } from "./index";

describe("Google Places Search Provider", () => {
  describe("parseAddressComponents", () => {
    it("should correctly parse city, state, zip, and country from address components", () => {
      const mockComponents = [
        { longText: "Boston", shortText: "Boston", types: ["locality", "political"] },
        { longText: "Massachusetts", shortText: "MA", types: ["administrative_area_level_1", "political"] },
        { longText: "02108", shortText: "02108", types: ["postal_code"] },
        { longText: "United States", shortText: "US", types: ["country", "political"] }
      ];

      const result = parseAddressComponents(mockComponents);
      expect(result).toEqual({
        city: "Boston",
        state: "MA",
        zip: "02108",
        country: "US"
      });
    });

    it("should handle missing components safely without crashing", () => {
      const result = parseAddressComponents([]);
      expect(result).toEqual({
        city: null,
        state: null,
        zip: null,
        country: null
      });
    });
  });

  describe("mapPlaceToFirm", () => {
    it("should map Google Place structure to the internal firm shape", () => {
      const mockPlace = {
        displayName: { text: "Example Law Firm" },
        websiteUri: "https://examplelaw.com",
        nationalPhoneNumber: "+1 617-555-0199",
        formattedAddress: "123 Beacon St, Boston, MA 02108",
        addressComponents: [
          { longText: "Boston", shortText: "Boston", types: ["locality"] },
          { longText: "Massachusetts", shortText: "MA", types: ["administrative_area_level_1"] },
          { longText: "02108", shortText: "02108", types: ["postal_code"] },
          { longText: "United States", shortText: "US", types: ["country"] }
        ],
        location: { latitude: 42.3584, longitude: -71.0637 }
      };

      const firm = mapPlaceToFirm(mockPlace);
      expect(firm).toEqual({
        firm_name: "Example Law Firm",
        website: "https://examplelaw.com",
        phone: "+1 617-555-0199",
        address: "123 Beacon St, Boston, MA 02108",
        city: "Boston",
        state: "MA",
        zip: "02108",
        lat: 42.3584,
        lng: -71.0637,
        email: null,
        attorney_name: null,
        attorneys: [],
        practice_areas: [],
        sourceType: "GOOGLE_MAPS",
        isUS: true
      });
    });

    it("should fallback safely if fields are missing", () => {
      const mockPlace = {};
      const firm = mapPlaceToFirm(mockPlace);
      expect(firm).toEqual({
        firm_name: "Unknown Firm",
        website: null,
        phone: null,
        address: null,
        city: null,
        state: null,
        zip: null,
        lat: null,
        lng: null,
        email: null,
        attorney_name: null,
        attorneys: [],
        practice_areas: [],
        sourceType: "GOOGLE_MAPS",
        isUS: true
      });
    });
  });

  describe("searchPlaces (API Fetch)", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
      vi.stubGlobal("fetch", vi.fn());
    });

    afterEach(() => {
      process.env = originalEnv;
      vi.unstubAllGlobals();
      vi.restoreAllMocks();
    });

    it("should fetch Places and throw if API key is missing", async () => {
      delete process.env.GOOGLE_PLACES_API_KEY;
      await expect(searchPlaces("Boston", "MA", "02108")).rejects.toThrow("Missing GOOGLE_PLACES_API_KEY");
    });

    it("should query Places Text Search (New) and return mapped results", async () => {
      process.env.GOOGLE_PLACES_API_KEY = "places-mock-key";

      const mockResponse = {
        places: [
          {
            displayName: { text: "Mock Boston Law" },
            websiteUri: "https://bostonlaw.com",
            formattedAddress: "456 Tremont St, Boston, MA 02108",
            addressComponents: [
              { longText: "Boston", shortText: "Boston", types: ["locality"] },
              { longText: "Massachusetts", shortText: "MA", types: ["administrative_area_level_1"] }
            ]
          }
        ]
      };

      const mockFetch = vi.fn().mockResolvedValue({
        ok: true,
        json: () => Promise.resolve(mockResponse)
      });
      vi.stubGlobal("fetch", mockFetch);

      const results = await searchPlaces("Boston", "MA", "02108");

      expect(mockFetch).toHaveBeenCalledTimes(1);
      const [url, options] = mockFetch.mock.calls[0];
      expect(url).toBe("https://places.googleapis.com/v1/places:searchText");
      expect(options.method).toBe("POST");
      expect(options.headers["X-Goog-Api-Key"]).toBe("places-mock-key");
      expect(options.headers["X-Goog-FieldMask"]).toContain("places.displayName");
      
      const body = JSON.parse(options.body);
      expect(body.textQuery).toBe("law firms in Boston, MA 02108");
      expect(body.includedType).toBe("lawyer");

      expect(results.length).toBe(1);
      expect(results[0].firm_name).toBe("Mock Boston Law");
      expect(results[0].website).toBe("https://bostonlaw.com");
      expect(results[0].city).toBe("Boston");
      expect(results[0].state).toBe("MA");
    });

    it("should paginate up to 3 pages if nextPageToken is provided", async () => {
      process.env.GOOGLE_PLACES_API_KEY = "places-mock-key";

      const mockFetch = vi.fn()
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            places: [{ displayName: { text: "Firm Page 1" } }],
            nextPageToken: "token-page-2"
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            places: [{ displayName: { text: "Firm Page 2" } }],
            nextPageToken: "token-page-3"
          })
        })
        .mockResolvedValueOnce({
          ok: true,
          json: () => Promise.resolve({
            places: [{ displayName: { text: "Firm Page 3" } }],
            nextPageToken: "token-page-4" // should stop because page count reaches 3
          })
        });
      vi.stubGlobal("fetch", mockFetch);

      const results = await searchPlaces("Boston", "MA", "02108");

      expect(mockFetch).toHaveBeenCalledTimes(3);
      expect(results.length).toBe(3);
      expect(results[0].firm_name).toBe("Firm Page 1");
      expect(results[1].firm_name).toBe("Firm Page 2");
      expect(results[2].firm_name).toBe("Firm Page 3");

      // Verify the pageToken body argument in subsequent requests
      const body2 = JSON.parse(mockFetch.mock.calls[1][1].body);
      expect(body2.pageToken).toBe("token-page-2");

      const body3 = JSON.parse(mockFetch.mock.calls[2][1].body);
      expect(body3.pageToken).toBe("token-page-3");
    });
  });

  describe("Provider Factory Integration", () => {
    const originalEnv = process.env;

    beforeEach(() => {
      process.env = { ...originalEnv };
    });

    afterEach(() => {
      process.env = originalEnv;
    });

    it("should resolve places provider in selectProvider", () => {
      expect(selectProvider("places")).toBe("places");
      expect(selectProvider("PLACES")).toBe("places");
    });

    it("should return PlacesSearchProvider if SEARCH_PROVIDER=places and key exists", () => {
      process.env.SEARCH_PROVIDER = "places";
      process.env.GOOGLE_PLACES_API_KEY = "mock-key";
      const provider = getSearchProvider();
      expect(provider).toBeInstanceOf(PlacesSearchProvider);
    });

    it("should throw a loud error if SEARCH_PROVIDER=places but API key is missing", () => {
      process.env.SEARCH_PROVIDER = "places";
      delete process.env.GOOGLE_PLACES_API_KEY;
      expect(() => getSearchProvider()).toThrow("SEARCH_PROVIDER is set to 'places' but GOOGLE_PLACES_API_KEY is not set. Fail loudly.");
    });
  });
});
