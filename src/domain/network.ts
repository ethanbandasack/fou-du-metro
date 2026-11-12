import type { StopRow } from "@/domain/csv";
import { compareLines, lineColors, lineLabel, type LineColors, type Mode } from "@/domain/lines";
import { createAliasMatcher, normalizeName, type AliasPair } from "@/domain/names";

/** A station as served by one line. */
export interface Stop {
  id: string;
  /** Guess identity: stops sharing a key are found together. */
  key: string;
  name: string;
  lineId: string;
  mode: Mode;
  /** 1-based position along the line. */
  order: number;
  lat: number;
  lon: number;
  arrondissement: number;
  /** Other lines reachable at this interchange. */
  connections: string[];
}

export interface Line {
  id: string;
  mode: Mode;
  label: string;
  colors: LineColors;
  /** Ordered along the line. */
  stops: Stop[];
}

/** A physical interchange: every row of the same place, across lines and spellings. */
export interface Station {
  name: string;
  aliases: string[];
  lines: string[];
  lat: number;
  lon: number;
  arrondissement: number;
  historicFigure: boolean;
  colorInName: boolean;
  openedAfter1980: boolean;
  leftBank: boolean;
  hasRer: boolean;
  hasTram: boolean;
}

export interface Network {
  lines: Line[];
  stations: Station[];
}

/** Station order of one line, as declared in `src/data/lines/*.yaml`. */
export interface LineOrder {
  lineId: string;
  mode: Mode;
  stations: string[];
}

/** Two rows are the same place when their names are aliases and they lie within ~1 km. */
const PROXIMITY_DEGREES = 0.01;

export function buildNetwork(input: { rows: StopRow[]; lineOrders: LineOrder[]; aliases: AliasPair[] }): Network {
  const groups = groupRows(input.rows, createAliasMatcher(input.aliases));
  const connections = connectionsByRow(groups);
  return {
    lines: orderLines(input.rows, input.lineOrders, connections),
    stations: groups.map(toStation),
  };
}

/** Assigns each row to the first group whose first row is a nearby alias (input order matters). */
function groupRows(rows: StopRow[], areAliases: (a: string, b: string) => boolean): StopRow[][] {
  const groups: StopRow[][] = [];
  for (const row of rows) {
    const group = groups.find(([first]) => {
      const near =
        Math.abs(first.lat - row.lat) < PROXIMITY_DEGREES && Math.abs(first.lon - row.lon) < PROXIMITY_DEGREES;
      return near && areAliases(first.name, row.name);
    });
    if (group) group.push(row);
    else groups.push([row]);
  }
  return groups;
}

function connectionsByRow(groups: StopRow[][]): Map<StopRow, string[]> {
  const result = new Map<StopRow, string[]>();
  for (const group of groups) {
    for (const row of group) {
      const others = group
        .filter((other) => other.lineId !== row.lineId)
        .filter((other) => (other.mode === "RER" ? row.hasRer : true))
        .filter((other) => (other.mode === "TRAMWAY" ? row.hasTram : true))
        .map((other) => other.lineId);
      result.set(row, [...new Set(others)]);
    }
  }
  return result;
}

function orderLines(rows: StopRow[], lineOrders: LineOrder[], connections: Map<StopRow, string[]>): Line[] {
  return lineOrders
    .map((lineOrder): Line => {
      const byKey = new Map<string, StopRow>();
      for (const row of rows) {
        if (row.lineId === lineOrder.lineId && row.mode === lineOrder.mode) byKey.set(normalizeName(row.name), row);
      }
      const stops = lineOrder.stations
        .map((name) => byKey.get(normalizeName(name)))
        .filter((row): row is StopRow => row !== undefined)
        .map((row, index) => toStop(row, index + 1, connections.get(row) ?? []));
      return {
        id: lineOrder.lineId,
        mode: lineOrder.mode,
        label: lineLabel(lineOrder.mode, lineOrder.lineId),
        colors: lineColors(lineOrder.lineId),
        stops,
      };
    })
    .sort(compareLines);
}

function toStop(row: StopRow, order: number, connections: string[]): Stop {
  return {
    id: `${row.mode}-${row.lineId}-${row.name}`,
    key: normalizeName(row.name),
    name: row.name,
    lineId: row.lineId,
    mode: row.mode,
    order,
    lat: row.lat,
    lon: row.lon,
    arrondissement: row.arrondissement,
    connections,
  };
}

function toStation(group: StopRow[]): Station {
  const [first] = group;
  return {
    name: first.name,
    aliases: [...new Set(group.map((row) => row.name))],
    lines: [...new Set(group.map((row) => row.lineId))],
    lat: first.lat,
    lon: first.lon,
    arrondissement: first.arrondissement,
    historicFigure: first.historicFigure,
    colorInName: first.colorInName,
    openedAfter1980: first.openedAfter1980,
    leftBank: first.leftBank,
    hasRer: group.some((row) => row.hasRer),
    hasTram: group.some((row) => row.hasTram),
  };
}
