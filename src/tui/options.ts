import { parseArgs } from "node:util";
import { MODES, normalizeLineId, type Mode } from "@/domain/lines";
import type { Grouping } from "@/tui/progress";

export interface TuiOptions {
  /** Empty means every mode. */
  modes: string[];
  /** Empty means every line of the modes. */
  lines: string[];
  grouping: Grouping;
  color: boolean;
  /** Exact names only. */
  hardcore: boolean;
  /** Also play stations not open yet. */
  future: boolean;
  /** Listen to the microphone (macOS). */
  voice: boolean;
  help: boolean;
}

export const USAGE = `Usage: npm run tui -- [options]

  --modes <liste>   modes à jouer : metro, rer, transilien, train, tramway, val, cable, ou all (défaut : metro)
  --lines <liste>   lignes à jouer, ex. 1,4,14 (défaut : toutes celles des modes)
  --group <nom>     regroupement initial : global, ligne, arrondissement, ville (défaut : ligne)
  --future          inclure les lignes et prolongements pas encore ouverts
  --hardcore        noms exacts uniquement (casse, espaces et ponctuation ignorés)
  --voice           dicter au micro, en direct (macOS) : chaque gare citée compte
  --no-color        sans couleurs (aussi avec NO_COLOR)
  -h, --help        cette aide

Avec --voice ou la dictée du système, chaque gare citée dans une phrase compte ; en hardcore,
les accents ne sont pas exigés à la voix.`;

const GROUPING_NAMES: Record<string, Grouping> = {
  global: "global",
  total: "global",
  line: "line",
  ligne: "line",
  arrondissement: "arrondissement",
  ville: "commune",
  city: "commune",
  commune: "commune",
};

const list = (value: string | undefined) =>
  (value ?? "").split(",").map((item) => item.trim()).filter(Boolean);

export function parseOptions(argv: string[], env: Record<string, string | undefined>): TuiOptions {
  const { values } = parseArgs({
    args: argv,
    options: {
      modes: { type: "string" },
      lines: { type: "string" },
      group: { type: "string" },
      "no-color": { type: "boolean" },
      hardcore: { type: "boolean" },
      future: { type: "boolean" },
      voice: { type: "boolean" },
      help: { type: "boolean", short: "h" },
    },
  });

  const modeNames = list(values.modes ?? "metro").map((mode) => mode.toUpperCase());
  for (const mode of modeNames) {
    if (mode !== "ALL" && !MODES.includes(mode as Mode)) throw new Error(`Mode inconnu : ${mode.toLowerCase()}\n\n${USAGE}`);
  }
  const grouping = GROUPING_NAMES[(values.group ?? "ligne").toLowerCase()];
  if (!grouping) throw new Error(`Regroupement inconnu : ${values.group}\n\n${USAGE}`);

  return {
    modes: modeNames.includes("ALL") ? [] : modeNames,
    lines: list(values.lines).map(normalizeLineId),
    grouping,
    color: !values["no-color"] && !env.NO_COLOR,
    hardcore: values.hardcore ?? false,
    future: values.future ?? false,
    voice: values.voice ?? false,
    help: values.help ?? false,
  };
}
