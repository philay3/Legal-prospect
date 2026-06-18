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
        } as Prospect,
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
        } as Prospect,
      ];

      const csv = toCsv(prospects);
      const lines = csv.split("\r\n");

      // Verify header row
      expect(lines[0]).toBe('"Name","Email","Phone","Website","Address"');

      // Verify Acme Legal row (with comma in name)
      expect(lines[1]).toBe('"Acme Legal, LLC","contact@acmelegal.com","555-0199","https://acmelegal.com","100 Pine St 19103"');

      // Verify Beta Boutique row (with quotes in name and empty cells)
      expect(lines[2]).toBe('"Beta ""Boutique"" Law","","","","Harrisburg, PA 17101"');
    });
  });
});
