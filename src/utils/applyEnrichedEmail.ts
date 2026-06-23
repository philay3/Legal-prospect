export function applyEnrichedEmail<T extends { id: string; email?: string | null }>(
  rows: T[],
  firmId: string,
  email: string | null
): T[] {
  if (email === null) {
    return rows;
  }
  const index = rows.findIndex((r) => r.id === firmId);
  if (index === -1) {
    return rows;
  }
  const updatedRows = [...rows];
  updatedRows[index] = { ...rows[index], email };
  return updatedRows;
}
