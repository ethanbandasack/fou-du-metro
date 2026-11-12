import type { Answer } from "@/domain/matching";
import type { Line, Station } from "@/domain/network";

export interface LineSelection {
  /** Empty means every mode. */
  selectedModes: string[];
  /** Empty means every line of the selected modes. */
  selectedLines: string[];
  /** Also play stations that open after `today`. */
  includeFuture: boolean;
  /** ISO date (YYYY-MM-DD). */
  today: string;
}

/** Open on `today`: no opening date, or one on or before it (ISO dates compare as strings). */
export const isOpen = (opening: string | null, today: string) => opening === null || opening <= today;

export function selectLines(lines: Line[], selection: LineSelection): Line[] {
  const { selectedModes, selectedLines, includeFuture, today } = selection;
  return lines
    .filter(
      (line) =>
        (selectedModes.length === 0 || selectedModes.includes(line.mode)) &&
        (selectedLines.length === 0 || selectedLines.includes(line.id)),
    )
    .map((line) => (includeFuture ? line : { ...line, stops: line.stops.filter((stop) => isOpen(stop.opening, today)) }))
    .filter((line) => line.stops.length > 0);
}

/** Lines with at least one station open on `today`. */
export function openLineIds(lines: Line[], today: string): Set<string> {
  return new Set(lines.filter((line) => line.stops.some((stop) => isOpen(stop.opening, today))).map((line) => line.id));
}

/** One answer per stop key: a station served by several lines is found once. */
export function answersOf(lines: Line[]): Answer[] {
  const names = new Map<string, Set<string>>();
  for (const stop of lines.flatMap((line) => line.stops)) {
    names.set(stop.key, (names.get(stop.key) ?? new Set()).add(stop.name));
  }
  return [...names].map(([key, spellings]) => ({ key, names: [...spellings] }));
}

/** Stations open on `today`, each keeping only its open lines. */
export function openStations(stations: Station[], lines: Line[], today: string): Station[] {
  const open = openLineIds(lines, today);
  return stations
    .filter((station) => isOpen(station.opening, today))
    .map((station) => ({ ...station, lines: station.lines.filter((id) => open.has(id)) }));
}
