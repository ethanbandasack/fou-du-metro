import fs from "node:fs";
import path from "node:path";
import yaml from "js-yaml";
import { parseStationsCsv, type StopRow } from "@/domain/csv";
import { MODES, normalizeLineId, type Mode } from "@/domain/lines";
import { buildNetwork, type Corridor, type LineOrder, type Network } from "@/domain/network";

const DEFAULT_DATA_DIR = path.join(process.cwd(), "src/data");

/** Reads the raw data files (Node only: build time or CLI). */
export function loadSources(dataDir: string = DEFAULT_DATA_DIR): {
  rows: StopRow[];
  lineOrders: LineOrder[];
  corridors: Corridor[];
} {
  const rows = parseStationsCsv(fs.readFileSync(path.join(dataDir, "stations.csv"), "utf8"));
  const { corridors } = JSON.parse(fs.readFileSync(path.join(dataDir, "corridors.json"), "utf8")) as {
    corridors: Corridor[];
  };
  return { rows, lineOrders: loadLineOrders(path.join(dataDir, "lines")), corridors };
}

export function loadNetwork(dataDir: string = DEFAULT_DATA_DIR): Network {
  return buildNetwork(loadSources(dataDir));
}

function loadLineOrders(linesDir: string): LineOrder[] {
  return fs
    .readdirSync(linesDir)
    .filter((file) => file.endsWith(".yaml"))
    .map((file) => parseLineOrder(file, fs.readFileSync(path.join(linesDir, file), "utf8")));
}

function parseLineOrder(file: string, text: string): LineOrder {
  const data = yaml.load(text) as { line?: unknown; mode?: unknown; stations?: unknown } | null;
  const mode = String(data?.mode ?? "").toUpperCase() as Mode;
  if (data?.line === undefined || !MODES.includes(mode) || !Array.isArray(data.stations)) {
    throw new Error(`${file}: expected "line", a known "mode" and a "stations" list`);
  }
  return { lineId: normalizeLineId(String(data.line)), mode, stations: data.stations.map(String) };
}
