import type { StopRow } from "@/domain/csv";
import { lineColors } from "@/domain/lines";
import { simplifyName } from "@/domain/names";
import { PROXIMITY_DEGREES, type Station } from "@/domain/network";
import type { OfficialLine, OfficialStop } from "@/server/idfm/official";

/** Differences between the local data and IDFM open data. */
export interface Audit {
  /** Local stops with no official counterpart on the same line. */
  unmatched: { lineId: string; name: string }[];
  /** Official stops with no local counterpart. */
  missing: { lineId: string; name: string }[];
  /** Stations whose lines differ from their official transfer zone (ZdC). */
  connections: { station: string; local: string[]; official: string[] }[];
  /** Local line colors that differ from the official web colors. */
  colors: { lineId: string; local: string; official: string }[];
}

const MAX_MATCH_KM = 1.5;
const MIN_MATCH_SCORE = -0.5;
const STOP_WORDS = new Set(["de", "la", "le", "les", "du", "des", "d", "l", "gare", "et"]);

const byId = (a: string, b: string) => a.localeCompare(b, "fr", { numeric: true });
const km = (a: { lat: number; lon: number }, b: { lat: number; lon: number }) =>
  Math.hypot((a.lat - b.lat) * 110.574, (a.lon - b.lon) * 73.3);
const bare = (name: string) => simplifyName(name.replace(/\([^)]*\)/g, ""));
const words = (name: string) =>
  new Set(name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").match(/[a-z0-9]+/g)?.filter((w) => !STOP_WORDS.has(w)));

/** 3 for the same name, 2 when one contains the other, otherwise the share of shared words. */
function nameSimilarity(local: string, official: string): number {
  const [a, b] = [bare(local), bare(official)];
  if (a === b) return 3;
  if (a.includes(b) || b.includes(a)) return 2;
  const localWords = words(local);
  const shared = [...words(official)].filter((w) => localWords.has(w)).length;
  return shared / Math.max(1, localWords.size);
}

/** Pairs each local row with the official stop of the same line that best fits its name and position. */
export function matchRows(rows: StopRow[], official: OfficialStop[]): Map<StopRow, OfficialStop> {
  const matches = new Map<StopRow, OfficialStop>();
  for (const row of rows) {
    let best: OfficialStop | undefined;
    let bestScore = MIN_MATCH_SCORE;
    for (const stop of official) {
      if (stop.lineId !== row.lineId) continue;
      const distance = km(row, stop);
      if (distance > MAX_MATCH_KM) continue;
      const score = nameSimilarity(row.name, stop.name) - distance;
      if (score > bestScore) [best, bestScore] = [stop, score];
    }
    if (best) matches.set(row, best);
  }
  return matches;
}

/** Same rule as buildNetwork: an alias name of the station within the proximity box. */
const belongsTo = (row: StopRow, station: Station) =>
  station.aliases.includes(row.name) &&
  station.lines.includes(row.lineId) &&
  Math.abs(row.lat - station.lat) < PROXIMITY_DEGREES &&
  Math.abs(row.lon - station.lon) < PROXIMITY_DEGREES;

export function auditNetwork(input: {
  rows: StopRow[];
  stations: Station[];
  official: OfficialStop[];
  officialLines: OfficialLine[];
}): Audit {
  const { rows, stations, official, officialLines } = input;
  const matches = matchRows(rows, official);
  const matched = new Set(matches.values());
  const localLines = new Set(rows.map((row) => row.lineId));

  const connections = stations.flatMap((station) => {
    const zones = new Set(rows.filter((row) => belongsTo(row, station)).flatMap((row) => matches.get(row)?.zdcId ?? []));
    if (zones.size === 0) return [];
    const officialIds = [...new Set(official.filter((s) => zones.has(s.zdcId) && localLines.has(s.lineId)).map((s) => s.lineId))];
    const local = [...station.lines].sort(byId);
    const officialSorted = officialIds.sort(byId);
    return local.join() === officialSorted.join() ? [] : [{ station: station.name, local, official: officialSorted }];
  });

  const colors = officialLines.flatMap(({ lineId, colors: expected }) => {
    if (!localLines.has(lineId)) return [];
    const actual = lineColors(lineId);
    const [local, wanted] = [`${actual.background} / ${actual.text}`, `${expected.background} / ${expected.text}`];
    return local === wanted ? [] : [{ lineId, local, official: wanted }];
  });

  return {
    unmatched: rows.filter((row) => !matches.has(row)).map(({ lineId, name }) => ({ lineId, name })),
    missing: official.filter((stop) => !matched.has(stop)).map(({ lineId, name }) => ({ lineId, name })),
    connections,
    colors,
  };
}

/** Plain-text report, French like the rest of the user-facing output. */
export function formatAudit(audit: Audit, limit = 30): string {
  const section = <T,>(title: string, items: T[], line: (item: T) => string) =>
    [
      `## ${title} : ${items.length}`,
      ...items.slice(0, limit).map((item) => `- ${line(item)}`),
      ...(items.length > limit ? [`- … et ${items.length - limit} de plus`] : []),
    ].join("\n");
  return [
    "# Audit des données (source : Île-de-France Mobilités open data)",
    section("Gares locales sans équivalent officiel", audit.unmatched, (s) => `${s.lineId} · ${s.name}`),
    section("Gares officielles absentes localement", audit.missing, (s) => `${s.lineId} · ${s.name}`),
    section("Correspondances différentes", audit.connections, (c) => `${c.station} : local ${c.local.join(", ")} / officiel ${c.official.join(", ")}`),
    section("Couleurs différentes", audit.colors, (c) => `${c.lineId} : local ${c.local} / officiel ${c.official}`),
  ].join("\n\n");
}
