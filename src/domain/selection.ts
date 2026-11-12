import type { Answer } from "@/domain/matching";
import type { Line } from "@/domain/network";

export interface LineSelection {
  /** Empty means every mode. */
  selectedModes: string[];
  /** Empty means every line of the selected modes. */
  selectedLines: string[];
}

export function selectLines(lines: Line[], { selectedModes, selectedLines }: LineSelection): Line[] {
  return lines.filter(
    (line) =>
      (selectedModes.length === 0 || selectedModes.includes(line.mode)) &&
      (selectedLines.length === 0 || selectedLines.includes(line.id)),
  );
}

/** One answer per stop key: a station served by several lines is found once. */
export function answersOf(lines: Line[]): Answer[] {
  const names = new Map<string, Set<string>>();
  for (const stop of lines.flatMap((line) => line.stops)) {
    names.set(stop.key, (names.get(stop.key) ?? new Set()).add(stop.name));
  }
  return [...names].map(([key, spellings]) => ({ key, names: [...spellings] }));
}
