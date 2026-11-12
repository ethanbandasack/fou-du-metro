import { isMetroLine, lineColors, lineLabel, type LineColors } from "@/domain/lines";
import { normalizeName, simplifyName } from "@/domain/names";
import type { Station } from "@/domain/network";

export const CATEGORY_GROUPS = {
  line: "Lignes de Métro",
  groups: "Groupes de Lignes",
  geo: "Géographie (Paris/Banlieue)",
  arr_single: "Arrondissement (Unique)",
  arr_group: "Groupes d'Arrondissements",
  connect: "Connectivité",
  special: "Spécial (Histoire, Couleurs)",
  names: "Noms & Lettres",
} as const;

export type CategoryGroup = keyof typeof CATEGORY_GROUPS;
export type StationFilter = (station: Station) => boolean;

export interface Category {
  id: string;
  name: string;
  matches: StationFilter;
  colors: LineColors;
  /** Lines or arrondissements covered, shown as badges. */
  items?: string[];
  /** The player types the list of lines or arrondissements. */
  custom?: "lines" | "arrondissements";
}

const NEUTRAL: LineColors = { background: "#333333", text: "#FFFFFF" };
const LETTERS: LineColors = { background: "#444444", text: "#FFFFFF" };

const LINE_GROUPS: Record<string, string[]> = {
  Automatiques: ["1", "4", "14"],
  Jaunes: ["1", "10"],
  Bleues: ["2", "3bis", "13"],
  Violettes: ["4", "7", "8", "14"],
  Vertes: ["3", "7bis", "9", "12"],
  "Nord-Sud": ["12", "13", "4"],
  "Est-Ouest": ["1", "3"],
  Périphériques: ["2", "6"],
  "Lignes bis": ["3bis", "7bis"],
};

const RER_LINES = ["A", "B", "C", "D", "E"];
const isRer = (lineId: string) => RER_LINES.includes(lineId.toUpperCase());
const inParis = (s: Station) => s.arrondissement >= 1 && s.arrondissement <= 20;
const range = (from: number, to: number) => Array.from({ length: to - from + 1 }, (_, i) => from + i);

const category = (id: string, name: string, matches: StationFilter, extra: Partial<Category> = {}): Category => ({
  id,
  name,
  matches,
  colors: NEUTRAL,
  ...extra,
});

const arrondissementGroup = (id: string, name: string, arrondissements: number[]) =>
  category(id, name, (s) => arrondissements.includes(s.arrondissement), { items: arrondissements.map(String) });

export function buildCategories(stations: Station[]): Record<CategoryGroup, Category[]> {
  const metroLines = [...new Set(stations.flatMap((s) => s.lines).filter(isMetroLine))].sort((a, b) =>
    a.localeCompare(b, "fr", { numeric: true }),
  );

  return {
    line: metroLines.map((id) =>
      category(`line-${id}`, lineLabel("METRO", id), (s) => s.lines.includes(id), { colors: lineColors(id) }),
    ),
    groups: [
      ...Object.entries(LINE_GROUPS).map(([name, lines]) =>
        category(`group-${name.toLowerCase().replace(/ /g, "-")}`, name, (s) => s.lines.some((l) => lines.includes(l)), {
          items: lines,
        }),
      ),
      category("group-custom", "Groupe personnalisé", () => false, { custom: "lines" }),
    ],
    geo: [
      category("intra", "Paris Intra-muros", inParis),
      category("extra", "Banlieue", (s) => s.arrondissement > 20),
      category("rg", "Rive Gauche", (s) => s.leftBank),
      category("rd", "Rive Droite", (s) => !s.leftBank && inParis(s) && s.name !== "Cité"),
    ],
    arr_single: range(1, 20).map((n) => category(`arr-${n}`, `Arrondissement ${n}`, (s) => s.arrondissement === n)),
    arr_group: [
      arrondissementGroup("arr-group-1-9", "Arrondissements 1-9", range(1, 9)),
      arrondissementGroup("arr-group-10-20", "Arrondissements 10-20", range(10, 20)),
      arrondissementGroup("arr-pair", "Arrondissement Pair", range(1, 20).filter((n) => n % 2 === 0)),
      arrondissementGroup("arr-impair", "Arrondissement Impair", range(1, 20).filter((n) => n % 2 === 1)),
      category("arr-custom", "Groupe personnalisé", () => false, { custom: "arrondissements" }),
    ],
    connect: [
      category("c1", "Sur une seule ligne", (s) => s.lines.filter((l) => !isRer(l)).length === 1),
      category("c2", "Sur exactement 2 lignes", (s) => s.lines.filter((l) => !isRer(l)).length === 2),
      category("c3", "Sur 3+ lignes", (s) => s.lines.length >= 3),
      category("has-rer", "Correspondance RER", (s) => s.hasRer),
      category("has-tram", "Correspondance Tramway", (s) => s.hasTram),
    ],
    special: [
      category("hist", "Figure Historique", (s) => s.historicFigure),
      category("color", "Nom avec une couleur", (s) => s.colorInName),
      category("modern", "Ouverte après 1980", (s) => s.openedAfter1980),
    ],
    names: [
      ...["A", "E", "S", "M", "P"].map((l) =>
        category(`contains-${l}`, `Contient la lettre '${l}'`, (s) => s.name.toUpperCase().includes(l), { colors: LETTERS }),
      ),
      ...["A", "B", "C", "L", "M", "P", "S"].map((l) =>
        category(`starts-${l}`, `Commence par '${l}'`, (s) => s.name.toUpperCase().startsWith(l), { colors: LETTERS }),
      ),
      ...["E", "S", "T", "N"].map((l) =>
        category(`ends-${l}`, `Termine par '${l}'`, (s) => s.name.toUpperCase().endsWith(l), { colors: LETTERS }),
      ),
    ],
  };
}

/** The category's filter, or one built from the typed list for custom categories ("1, 4 14"). */
export function categoryFilter(category: Category, customValue: string): StationFilter {
  const items = customValue.split(/[, ]+/).filter((item) => item.trim() !== "");
  if (category.custom === "lines") {
    const lines = items.map((item) => item.toUpperCase());
    return (s) => s.lines.some((l) => lines.includes(l.toUpperCase()));
  }
  if (category.custom === "arrondissements") {
    const arrondissements = items.map((item) => parseInt(item, 10));
    return (s) => arrondissements.includes(s.arrondissement);
  }
  return category.matches;
}

/** Names of the stations matching every filter. */
export function findTargets(stations: Station[], filters: StationFilter[]): string[] {
  return [...new Set(stations.filter((s) => filters.every((matches) => matches(s))).map((s) => s.name))];
}

/** Stations whose name or alias contains the input; those starting with it come first. */
export function suggestStations(stations: Station[], input: string, limit = 8): Station[] {
  const query = simplifyName(input);
  if (input.trim().length < 2 || !query) return [];
  const forms = (name: string) => [simplifyName(name), normalizeName(name)];
  const startsWithQuery = (s: Station) => forms(s.name).some((form) => form.startsWith(query));

  return stations
    .filter((s) => s.aliases.some((alias) => forms(alias).some((form) => form.includes(query))))
    .sort((a, b) => Number(startsWithQuery(b)) - Number(startsWithQuery(a)) || a.name.localeCompare(b.name))
    .slice(0, limit);
}
