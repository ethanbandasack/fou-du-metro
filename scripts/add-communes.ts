/**
 * Fills the `commune` column of src/data/stations.csv (adds it if missing).
 * Paris arrondissements (1-20) get "Paris"; other rows are looked up by
 * coordinates on geo.api.gouv.fr (public French administrative API).
 *
 * Usage: npm run data:communes [-- --force]   (--force refreshes existing values)
 */
import fs from "node:fs";

const FILE = "src/data/stations.csv";
const API = "https://geo.api.gouv.fr/communes";
const CONCURRENCY = 5;
const force = process.argv.includes("--force");

async function communeAt(lat: string, lon: string): Promise<string> {
  const response = await fetch(`${API}?lat=${lat}&lon=${lon}&fields=nom`);
  if (!response.ok) throw new Error(`${API} answered ${response.status} for ${lat},${lon}`);
  const [commune] = (await response.json()) as { nom: string }[];
  if (!commune) throw new Error(`no commune at ${lat},${lon}`);
  if (commune.nom.includes(",")) throw new Error(`commune name with a comma: ${commune.nom}`);
  return commune.nom;
}

async function main() {
  const [header, ...rows] = fs.readFileSync(FILE, "utf8").split(/\r?\n/).filter((line) => line.trim() !== "");
  const columns = header.split(",");
  const hasColumn = columns.includes("commune");
  const fields = rows.map((row) => row.split(","));
  const communeIndex = hasColumn ? columns.indexOf("commune") : columns.length;
  const [latIndex, lonIndex, arrIndex] = ["lat", "lon", "arrondissement"].map((c) => columns.indexOf(c));

  const toLookUp = new Map<string, [string, string]>();
  for (const f of fields) {
    const inParis = Number(f[arrIndex]) >= 1 && Number(f[arrIndex]) <= 20;
    if (inParis) f[communeIndex] = "Paris";
    else if (force || !f[communeIndex]) toLookUp.set(`${f[latIndex]},${f[lonIndex]}`, [f[latIndex], f[lonIndex]]);
  }

  const found = new Map<string, string>();
  const queue = [...toLookUp];
  await Promise.all(
    Array.from({ length: CONCURRENCY }, async () => {
      for (let item = queue.shift(); item; item = queue.shift()) found.set(item[0], await communeAt(...item[1]));
    }),
  );

  for (const f of fields) {
    const commune = found.get(`${f[latIndex]},${f[lonIndex]}`);
    if (commune) f[communeIndex] = commune;
  }
  const outHeader = hasColumn ? header : `${header},commune`;
  fs.writeFileSync(FILE, [outHeader, ...fields.map((f) => f.join(","))].join("\n") + "\n");
  console.log(`${found.size} coordinates looked up, ${fields.length} rows written to ${FILE}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
