import type { StopRow } from "@/domain/csv";
import { compareLines, lineColors, lineLabel, type LineColors, type Mode } from "@/domain/lines";
import { normalizeName } from "@/domain/names";

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
  commune: string;
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

/** An interchange: the rows of one official transfer zone, across lines and spellings. */
export interface Station {
  name: string;
  aliases: string[];
  /** Lines serving the zone itself (not those across a corridor). */
  lines: string[];
  lat: number;
  lon: number;
  arrondissement: number;
  historicFigure: boolean;
  colorInName: boolean;
  openedAfter1980: boolean;
  leftBank: boolean;
  /** An RER line serves the zone or a zone linked by a corridor. */
  hasRer: boolean;
  /** A tram line serves the zone or a zone linked by a corridor. */
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

/** Walking link between two transfer zones, named by one station of each (src/data/corridors.json). */
export interface Corridor {
  name1: string;
  name2: string;
}

/** Rows without a zone, and corridor ends, must lie within this box (~1 km). */
const PROXIMITY_DEGREES = 0.01;

const near = (a: StopRow, b: StopRow) =>
  Math.abs(a.lat - b.lat) < PROXIMITY_DEGREES && Math.abs(a.lon - b.lon) < PROXIMITY_DEGREES;

export function buildNetwork(input: { rows: StopRow[]; lineOrders: LineOrder[]; corridors: Corridor[] }): Network {
  const groups = groupRows(input.rows);
  const linked = linkGroups(groups, input.corridors);
  const reachable = (group: StopRow[]) => [group, ...(linked.get(group) ?? [])].flat();

  const connections = new Map<StopRow, string[]>();
  for (const group of groups) {
    const lines = [...new Set(reachable(group).map((row) => row.lineId))];
    for (const row of group) connections.set(row, lines.filter((line) => line !== row.lineId));
  }

  return {
    lines: orderLines(input.rows, input.lineOrders, connections),
    stations: groups.map((group) => toStation(group, reachable(group))),
  };
}

/** One group per official zone; rows without a zone join a nearby row with the same name. */
function groupRows(rows: StopRow[]): StopRow[][] {
  const groups: StopRow[][] = [];
  const byZone = new Map<string, StopRow[]>();
  for (const row of rows) {
    const group = row.zone
      ? byZone.get(row.zone)
      : groups.find(([first]) => !first.zone && near(first, row) && normalizeName(first.name) === normalizeName(row.name));
    if (group) {
      group.push(row);
    } else {
      groups.push([row]);
      if (row.zone) byZone.set(row.zone, groups[groups.length - 1]);
    }
  }
  return groups;
}

/** Groups reachable through each corridor (not transitive: a corridor links its two ends only). */
function linkGroups(groups: StopRow[][], corridors: Corridor[]): Map<StopRow[], StopRow[][]> {
  const links = new Map<StopRow[], StopRow[][]>();
  const named = (name: string) => groups.filter((group) => group.some((row) => normalizeName(row.name) === normalizeName(name)));
  const link = (from: StopRow[], to: StopRow[]) => links.set(from, [...(links.get(from) ?? []), to]);
  for (const { name1, name2 } of corridors) {
    for (const a of named(name1)) {
      for (const b of named(name2)) {
        if (a !== b && near(a[0], b[0])) {
          link(a, b);
          link(b, a);
        }
      }
    }
  }
  return links;
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
    commune: row.commune,
    connections,
  };
}

function toStation(group: StopRow[], reachable: StopRow[]): Station {
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
    hasRer: reachable.some((row) => row.mode === "RER"),
    hasTram: reachable.some((row) => row.mode === "TRAMWAY"),
  };
}
