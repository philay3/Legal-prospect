import { describe, it, expect } from "vitest";
import { formatAddress, escapeCsvField, toCsv } from "./toCsv";
import type { Prospect } from "@/types/prospect";

describe("CSV Helper Utility Tests", () => {
  describe("formatAddress", () => {
    it("should use streetAddress + zip if streetAddress is present", () => {
      const prospect = {
        streetAddress: "123 Market St",
        city: "Philadelphia",
        state: "PA",
        zip: "19103",
      } as Prospect;
      expect(formatAddress(prospect)).toBe("123 Market St 19103");
    });

    it("should use city, state + zip if streetAddress is missing", () => {
      const prospect = {
        streetAddress: null,
        city: "Philadelphia",
        state: "PA",
        zip: "19103",
      } as Prospect;
      expect(formatAddress(prospect)).toBe("Philadelphia, PA 19103");
    });

    it("should handle lack of address information gracefully", () => {
      const prospect = {
        streetAddress: null,
        city: "",
        state: "",
        zip: "",
      } as unknown as Prospect;
      expect(formatAddress(prospect)).toBe("");
    });
  });

  describe("escapeCsvField", () => {
    it("should escape double quotes by doubling them and wrapping in quotes", () => {
      expect(escapeCsvField('Hello "World"')).toBe('"Hello ""World"""');
    });

    it("should wrap commas and newlines in double quotes", () => {
      expect(escapeCsvField("Hello, World")).toBe('"Hello, World"');
      expect(escapeCsvField("Line 1\nLine 2")).toBe('"Line 1\nLine 2"');
    });

    it("should output empty quotes for null or undefined", () => {
      expect(escapeCsvField(null)).toBe('""');
      expect(escapeCsvField(undefined)).toBe('""');
    });

    it("should format plain strings standardly", () => {
      expect(escapeCsvField("Simple String")).toBe('"Simple String"');
    });
  });

  describe("toCsv", () => {
    it("should generate full CSV string with correct headers and rows", () => {
      const prospects: Prospect[] = [
        {
          id: "p1",
          firmName: "Acme Legal, LLC",
          email: "contact@acmelegal.com",
          phone: "555-0199",
          website: "https://acmelegal.com",
          streetAddress: "100 Pine St",
          city: "Philadelphia",
          state: "PA",
          zip: "19103",
          practiceAreas: ["Corporate Law", "Intellectual Property"],
          attorneys: ["Jane Doe", "John Smith"],
        } as unknown as Prospect,
        {
          id: "p2",
          firmName: 'Beta "Boutique" Law',
          email: null,
          phone: null,
          website: null,
          streetAddress: null,
          city: "Harrisburg",
          state: "PA",
          zip: "17101",
          practiceAreas: [],
          attorneys: [],
        } as unknown as Prospect,
      ];

      const csv = toCsv(prospects);
      const lines = csv.split("\r\n");

      // Verify header row
      expect(lines[0]).toBe('"Name","Email","Phone","Website","Address","Practice Areas","Attorneys"');

      // Verify Acme Legal row (with comma in name)
      expect(lines[1]).toBe('"Acme Legal, LLC","contact@acmelegal.com","555-0199","https://acmelegal.com","100 Pine St 19103","Corporate Law, Intellectual Property","Jane Doe, John Smith"');

      // Verify Beta Boutique row (with quotes in name and empty cells)
      expect(lines[2]).toBe('"Beta ""Boutique"" Law","","","","Harrisburg, PA 17101","",""');
    });

    it("should export all rows across multiple pages (including index 10+ / Page 2+ items)", () => {
      // Create 12 mock prospects (UI page size is 10, so index 10 & 11 will reside on Page 2+)
      const prospects: Prospect[] = Array.from({ length: 12 }, (_, i) => ({
        id: `prospect-${i}`,
        firmName: `Firm ${i + 1}`,
        email: `contact${i + 1}@example.com`,
        phone: `555-010${i}`,
        website: `https://firm${i + 1}.com`,
        streetAddress: `${i + 1} Main St`,
        city: "Philadelphia",
        state: "PA",
        zip: "19103",
        practiceAreas: ["General Practice"],
        attorneys: [`Attorney ${i + 1}`],
      } as unknown as Prospect));

      const csv = toCsv(prospects);
      const lines = csv.split("\r\n");

      // We expect 1 header line + 12 prospect lines = 13 lines total
      expect(lines.length).toBe(13);

      // Verify header
      expect(lines[0]).toBe('"Name","Email","Phone","Website","Address","Practice Areas","Attorneys"');

      // Verify a Page 1 item (e.g. index 0 -> Firm 1)
      expect(lines[1]).toBe('"Firm 1","contact1@example.com","555-0100","https://firm1.com","1 Main St 19103","General Practice","Attorney 1"');

      // Verify Page 2 items (index 10 and 11 -> Firm 11 and Firm 12)
      expect(lines[11]).toBe('"Firm 11","contact11@example.com","555-01010","https://firm11.com","11 Main St 19103","General Practice","Attorney 11"');
      expect(lines[12]).toBe('"Firm 12","contact12@example.com","555-01011","https://firm12.com","12 Main St 19103","General Practice","Attorney 12"');
    });
  });
});

