import type { StopRow } from "@/domain/csv";

/**
 * One row per line and transfer zone: duplicates (the same station listed twice on a line under
 * two spellings) keep the name used most often in that zone, so it shares the answer of the other lines.
 */
export function dedupeByZone(rows: StopRow[]): { kept: StopRow[]; dropped: StopRow[] } {
  const uses = new Map<string, number>();
  for (const row of rows) if (row.zone) uses.set(`${row.zone}|${row.name}`, (uses.get(`${row.zone}|${row.name}`) ?? 0) + 1);
  const popularity = (row: StopRow) => uses.get(`${row.zone}|${row.name}`) ?? 0;

  const best = new Map<string, StopRow>();
  for (const row of rows) {
    if (!row.zone) continue;
    const key = `${row.lineId}|${row.zone}`;
    const current = best.get(key);
    if (!current || popularity(row) > popularity(current)) best.set(key, row);
  }
  const keep = (row: StopRow) => !row.zone || best.get(`${row.lineId}|${row.zone}`) === row;
  return { kept: rows.filter(keep), dropped: rows.filter((row) => !keep(row)) };
}
