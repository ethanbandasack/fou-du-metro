/**
 * Brings src/data in line with IDFM's emplacement-des-gares-idf:
 *   --add      append official stations missing locally, inserted in their line's order by
 *              smallest detour; curated columns are copied from a local row of the same zone
 *              (or same name nearby), otherwise left at 0 and listed for review
 *   --remove   drop local rows that have no official counterpart on their line
 * Then run `npm test` (the dataset characterization changes on purpose) and `npm run data:audit`.
 *
 * Usage: npm run data:import -- --add --remove
 */
import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { formatStationsCsv, type StopRow } from "@/domain/csv";
import { normalizeLineId } from "@/domain/lines";
import { normalizeName } from "@/domain/names";
import { matchRows, missingStops } from "@/server/idfm/audit";
import { IDFM_API, parseOfficialStops, type OfficialStop } from "@/server/idfm/official";
import { insertByDetour, orderByDetour } from "@/server/idfm/order";
import { loadSources } from "@/server/loadNetwork";

const DATA = path.join(process.cwd(), "src/data");
const LINES = path.join(DATA, "lines");
const today = new Date().toISOString().slice(0, 10);
const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
  Math.hypot((a.lat - b.lat) * 110.574, (a.lon - b.lon) * 73.3);

interface LineFile {
  file: string;
  data: { line: string | number; mode: string; stations: string[] };
  changed?: boolean;
}

function readLineFiles(): LineFile[] {
  return fs
    .readdirSync(LINES)
    .filter((f) => f.endsWith(".yaml"))
    .map((f) => ({ file: path.join(LINES, f), data: yaml.load(fs.readFileSync(path.join(LINES, f), "utf8")) as LineFile["data"] }));
}

const sameLine = (file: LineFile, row: { lineId: string; mode: string }) =>
  normalizeLineId(String(file.data.line)) === row.lineId && file.data.mode.toUpperCase() === row.mode;

/** Commune and arrondissement (1-20 in Paris, département elsewhere) from geo.api.gouv.fr. */
async function placeOf(lat: number, lon: number): Promise<{ commune: string; arrondissement: number }> {
  const get = async (query: string) => {
    const response = await fetch(`https://geo.api.gouv.fr/communes?lat=${lat}&lon=${lon}&${query}`);
    if (!response.ok) throw new Error(`geo.api.gouv.fr: HTTP ${response.status}`);
    return ((await response.json()) as { nom: string; code: string; codeDepartement?: string }[])[0];
  };
  const commune = await get("fields=nom,codeDepartement");
  if (!commune) throw new Error(`no commune at ${lat},${lon}`);
  if (commune.nom !== "Paris") return { commune: commune.nom, arrondissement: Number(commune.codeDepartement) };
  const arrondissement = await get("type=arrondissement-municipal&fields=nom,code");
  return { commune: "Paris", arrondissement: Number(arrondissement.code) - 75100 };
}

async function newRow(stop: OfficialStop, rows: StopRow[]): Promise<{ row: StopRow; curated: boolean }> {
  const template =
    rows.find((r) => r.zone === stop.zdcId) ??
    rows.find((r) => normalizeName(r.name) === normalizeName(stop.name) && km(r, stop) < 1);
  const place = template ?? (await placeOf(stop.lat, stop.lon));
  const opened = stop.openedOn && stop.openedOn <= today ? stop.openedOn : null;
  return {
    curated: template !== undefined,
    row: {
      name: stop.name,
      lineId: stop.lineId,
      mode: stop.mode,
      order: 0,
      lat: stop.lat,
      lon: stop.lon,
      arrondissement: place.arrondissement,
      historicFigure: template?.historicFigure ?? false,
      colorInName: template?.colorInName ?? false,
      openedAfter1980: template?.openedAfter1980 ?? (opened ?? stop.openedOn ?? "9999") >= "1981",
      leftBank: template?.leftBank ?? false,
      commune: place.commune,
      zone: stop.zdcId,
      opening: stop.openedOn && stop.openedOn > today ? stop.openedOn : null,
    },
  };
}

async function main() {
  const add = process.argv.includes("--add");
  const remove = process.argv.includes("--remove");
  if (!add && !remove) throw new Error("pass --add and/or --remove");

  const response = await fetch(`${IDFM_API}/emplacement-des-gares-idf/exports/json`);
  if (!response.ok) throw new Error(`emplacement-des-gares-idf: HTTP ${response.status}`);
  const official = parseOfficialStops((await response.json()) as unknown[]);

  let { rows } = loadSources();
  const lineFiles = readLineFiles();
  const matches = matchRows(rows, official);

  if (remove) {
    const unmatched = rows.filter((row) => !matches.has(row));
    rows = rows.filter((row) => matches.has(row));
    for (const gone of unmatched) {
      const file = lineFiles.find((f) => sameLine(f, gone));
      const stillServed = rows.some((r) => r.lineId === gone.lineId && normalizeName(r.name) === normalizeName(gone.name));
      if (file && !stillServed) {
        file.data.stations = file.data.stations.filter((n) => normalizeName(n) !== normalizeName(gone.name));
        file.changed = true;
      }
      console.log(`- removed ${gone.lineId} · ${gone.name}`);
    }
  }

  if (add) {
    const missing = missingStops(rows, official, new Set(matches.values()));
    const added: StopRow[] = [];
    for (const stop of missing) {
      const { row, curated } = await newRow(stop, rows);
      added.push(row);
      rows = [...rows, row];
      console.log(`+ added ${row.lineId} · ${row.name}${row.opening ? ` (opens ${row.opening})` : ""}${curated ? "" : "  [curated columns to review]"}`);
    }
    for (const lineId of new Set(added.map((r) => r.lineId))) {
      const newcomers = added.filter((r) => r.lineId === lineId);
      let file = lineFiles.find((f) => sameLine(f, newcomers[0]));
      if (!file) {
        const name = `${newcomers[0].mode.toLowerCase()}-${lineId.toLowerCase().replace(/\s+/g, "-")}.yaml`;
        file = { file: path.join(LINES, name), data: { line: lineId, mode: newcomers[0].mode, stations: [] } };
        lineFiles.push(file);
      }
      const located = file.data.stations
        .map((name) => rows.find((r) => r.lineId === lineId && normalizeName(r.name) === normalizeName(name)))
        .filter((r): r is StopRow => r !== undefined);
      const nearest = (r: StopRow) => Math.min(...located.map((l) => km(l, r)));
      const order =
        located.length === 0
          ? orderByDetour(newcomers)
          : [...newcomers].sort((a, b) => nearest(a) - nearest(b)).reduce((o, r) => insertByDetour(o, r), located);
      file.data.stations = order.map((r) => r.name);
      file.changed = true;
      for (const row of newcomers) row.order = file.data.stations.indexOf(row.name) + 1;
    }
  }

  fs.writeFileSync(path.join(DATA, "stations.csv"), formatStationsCsv(rows));
  for (const { file, data, changed } of lineFiles) {
    if (changed) fs.writeFileSync(file, yaml.dump(data, { noArrayIndent: true, lineWidth: -1 }));
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
