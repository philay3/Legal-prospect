import { describe, it, expect } from "vitest";
import { getPageCount, getPageItems, getPageWindow } from "./pagination";

describe("pagination utils", () => {
  describe("getPageCount", () => {
    it("should return 1 page when there are 0 items", () => {
      expect(getPageCount(0, 10)).toBe(1);
    });

    it("should return exact multiple division", () => {
      expect(getPageCount(60, 10)).toBe(6);
    });

    it("should round up for partial last page", () => {
      expect(getPageCount(61, 10)).toBe(7);
      expect(getPageCount(5, 10)).toBe(1);
    });
  });

  describe("getPageItems", () => {
    const items = Array.from({ length: 25 }, (_, i) => i + 1);

    it("should return the first page slice", () => {
      expect(getPageItems(items, 1, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should return the last partial page slice", () => {
      expect(getPageItems(items, 3, 10)).toEqual([21, 22, 23, 24, 25]);
    });

    it("should clamp a page number too high to the last page slice", () => {
      expect(getPageItems(items, 99, 10)).toEqual([21, 22, 23, 24, 25]);
    });

    it("should clamp a page number too low to the first page slice", () => {
      expect(getPageItems(items, -5, 10)).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    });

    it("should return an empty array if the input array is empty", () => {
      expect(getPageItems([], 1, 10)).toEqual([]);
    });
  });

  describe("getPageWindow", () => {
    it("should show all pages and no ellipsis when pageCount is 7 or less", () => {
      expect(getPageWindow(1, 5)).toEqual([1, 2, 3, 4, 5]);
      expect(getPageWindow(3, 7)).toEqual([1, 2, 3, 4, 5, 6, 7]);
    });

    it("should show a trailing ellipsis when current page is near the start", () => {
      expect(getPageWindow(1, 10)).toEqual([1, 2, 3, 4, 5, "…", 10]);
      expect(getPageWindow(3, 10)).toEqual([1, 2, 3, 4, 5, "…", 10]);
      expect(getPageWindow(4, 10)).toEqual([1, 2, 3, 4, 5, "…", 10]);
    });

    it("should show a leading ellipsis when current page is near the end", () => {
      expect(getPageWindow(10, 10)).toEqual([1, "…", 6, 7, 8, 9, 10]);
      expect(getPageWindow(8, 10)).toEqual([1, "…", 6, 7, 8, 9, 10]);
      expect(getPageWindow(7, 10)).toEqual([1, "…", 6, 7, 8, 9, 10]);
    });

    it("should show both leading and trailing ellipses when current page is in the middle", () => {
      expect(getPageWindow(5, 10)).toEqual([1, "…", 4, 5, 6, "…", 10]);
      expect(getPageWindow(6, 10)).toEqual([1, "…", 5, 6, 7, "…", 10]);
    });
  });
});
