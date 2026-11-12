import type { Line, Stop } from "@/domain/network";

export type Grouping = "global" | "line" | "arrondissement" | "commune";

export const GROUPINGS: readonly Grouping[] = ["global", "line", "arrondissement", "commune"];

export const GROUPING_LABELS: Record<Grouping, string> = {
  global: "Global",
  line: "Ligne",
  arrondissement: "Arrondissement",
  commune: "Ville",
};

export interface GroupProgress {
  label: string;
  found: number;
  total: number;
  /** Line color, when grouping by line. */
  color?: string;
}

interface Group {
  label: string;
  order: number | string;
  keys: Set<string>;
  color?: string;
}

const inParis = (stop: Stop) => stop.arrondissement >= 1 && stop.arrondissement <= 20;

function arrondissementGroup(stop: Stop): Pick<Group, "label" | "order"> {
  if (inParis(stop)) {
    const n = stop.arrondissement;
    return { label: `Paris ${n}${n === 1 ? "er" : "e"}`, order: n };
  }
  return { label: `Hors Paris (${stop.arrondissement})`, order: 100 + stop.arrondissement };
}

/** Found / total distinct stations, overall or per line, arrondissement or commune. */
export function progressBy(lines: Line[], found: ReadonlySet<string>, grouping: Grouping): GroupProgress[] {
  const groups = new Map<string, Group>();
  const add = (id: string, group: Omit<Group, "keys">, key: string) => {
    const existing = groups.get(id) ?? { ...group, keys: new Set<string>() };
    existing.keys.add(key);
    groups.set(id, existing);
  };

  lines.forEach((line, lineIndex) => {
    for (const stop of line.stops) {
      if (grouping === "global") add("total", { label: "Total", order: 0 }, stop.key);
      if (grouping === "line") add(line.id, { label: line.label, order: lineIndex, color: line.colors.background }, stop.key);
      if (grouping === "arrondissement") {
        const group = arrondissementGroup(stop);
        add(group.label, group, stop.key);
      }
      if (grouping === "commune") add(stop.commune, { label: stop.commune, order: stop.commune }, stop.key);
    }
  });

  return [...groups.values()]
    .sort((a, b) =>
      typeof a.order === "number" && typeof b.order === "number"
        ? a.order - b.order
        : String(a.order).localeCompare(String(b.order), "fr"),
    )
    .map(({ label, keys, color }) => ({
      label,
      found: [...keys].filter((key) => found.has(key)).length,
      total: keys.size,
      ...(color ? { color } : {}),
    }));
}
