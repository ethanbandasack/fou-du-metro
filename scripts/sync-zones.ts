/**
 * Fills the `zone` column of src/data/stations.csv with the official IDFM transfer zone
 * (zone de correspondance) of each row, matched by line, name and distance.
 * Rows without an official counterpart keep an empty zone; they are listed.
 *
 * Usage: npm run data:zones
 */
import fs from "node:fs";
import path from "node:path";
import { formatStationsCsv, parseStationsCsv } from "@/domain/csv";
import { matchRows } from "@/server/idfm/audit";
import { IDFM_API, parseOfficialStops } from "@/server/idfm/official";

const FILE = path.join(process.cwd(), "src/data/stations.csv");

async function main() {
  const response = await fetch(`${IDFM_API}/emplacement-des-gares-idf/exports/json`);
  if (!response.ok) throw new Error(`emplacement-des-gares-idf: HTTP ${response.status}`);
  const official = parseOfficialStops((await response.json()) as unknown[]);

  const rows = parseStationsCsv(fs.readFileSync(FILE, "utf8"));
  const matches = matchRows(rows, official);
  const updated = rows.map((row) => ({ ...row, zone: matches.get(row)?.zdcId ?? "" }));
  fs.writeFileSync(FILE, formatStationsCsv(updated));

  const unmatched = updated.filter((row) => !row.zone);
  console.log(`${updated.length - unmatched.length} rows with a zone, ${unmatched.length} without:`);
  for (const row of unmatched) console.log(`  ${row.lineId} · ${row.name}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
