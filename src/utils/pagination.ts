/**
 * Calculates the total number of pages needed for a given item count and page size.
 * Returns a minimum of 1 page.
 */
export function getPageCount(total: number, pageSize: number): number {
  if (pageSize <= 0) return 1;
  return Math.max(1, Math.ceil(total / pageSize));
}

/**
 * Returns a slice of the items array corresponding to the requested page.
 * Clamps the page number within valid bounds [1, pageCount].
 */
export function getPageItems<T>(items: T[], page: number, pageSize: number): T[] {
  if (items.length === 0) return [];
  const pageCount = getPageCount(items.length, pageSize);
  const clampedPage = Math.max(1, Math.min(page, pageCount));
  const start = (clampedPage - 1) * pageSize;
  return items.slice(start, start + pageSize);
}

/**
 * Generates an array of page numbers and ellipsis strings ("…")
 * representing the page numbers that should be shown in the pagination control.
 */
export function getPageWindow(currentPage: number, pageCount: number): (number | string)[] {
  if (pageCount <= 7) {
    const result = [];
    for (let i = 1; i <= pageCount; i++) {
      result.push(i);
    }
    return result;
  }

  // Clamped current page to be safe
  const activePage = Math.max(1, Math.min(currentPage, pageCount));

  // If close to the start
  if (activePage <= 4) {
    return [1, 2, 3, 4, 5, "…", pageCount];
  }

  // If close to the end
  if (activePage >= pageCount - 3) {
    const result = [1, "…"];
    for (let i = pageCount - 4; i <= pageCount; i++) {
      result.push(i);
    }
    return result;
  }

  // Middle window
  return [1, "…", activePage - 1, activePage, activePage + 1, "…", pageCount];
}
