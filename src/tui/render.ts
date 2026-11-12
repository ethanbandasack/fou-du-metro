import { formatDuration } from "@/domain/format";
import { GROUPING_LABELS, type GroupProgress } from "@/tui/progress";
import type { TuiState } from "@/tui/state";

export interface Screen {
  state: TuiState;
  groups: GroupProgress[];
  /** What is being played, e.g. "Métro". */
  title: string;
  found: number;
  total: number;
  elapsedSeconds: number;
  lastFoundNames: string[];
  width: number;
  height: number;
  color: boolean;
}

/** Header, separator, rows, separator, feedback, input, help. */
const CHROME_LINES = 6;
const HELP = "Tab regroupement · ↑↓ PgPréc/PgSuiv défiler · Entrée valider · Échap effacer · Ctrl+C quitter";

export function visibleRows(height: number): number {
  return Math.max(1, height - CHROME_LINES);
}

const fit = (text: string, width: number) => (text.length > width ? `${text.slice(0, Math.max(0, width - 1))}…` : text);

function paint(text: string, enabled: boolean, code: string): string {
  return enabled && text ? `\x1b[${code}m${text}\x1b[0m` : text;
}

function hexToAnsi(hex: string): string {
  const value = parseInt(hex.replace("#", ""), 16);
  return `38;2;${(value >> 16) & 255};${(value >> 8) & 255};${value & 255}`;
}

const MIN_BAR_WIDTH = 4;

function groupRow(group: GroupProgress, labelWidth: number, countWidth: number, width: number, color: boolean): string {
  const complete = group.total > 0 && group.found === group.total;
  const count = `${group.found} / ${group.total}`.padStart(countWidth);
  const barWidth = width - labelWidth - countWidth - 3;
  if (barWidth < MIN_BAR_WIDTH) {
    // Too narrow for a bar: label and count only.
    const narrowLabel = fit(group.label, Math.max(0, width - countWidth - 2)).padEnd(Math.max(0, width - countWidth - 2));
    return ` ${paint(narrowLabel, color && complete, "32")} ${count}`;
  }
  const filled = group.total > 0 ? Math.round((group.found / group.total) * barWidth) : 0;
  const label = fit(group.label, labelWidth).padEnd(labelWidth);
  const bar =
    paint("█".repeat(filled), color, complete ? "32" : group.color ? hexToAnsi(group.color) : "37") +
    paint("░".repeat(barWidth - filled), color, "90");
  return ` ${paint(label, color && complete, "32")} ${bar} ${count}`;
}

/** The whole terminal frame: exactly `height` lines, each at most `width` visible characters. */
export function render(screen: Screen): string[] {
  const { state, groups, width, height, color } = screen;
  const rows = visibleRows(height);

  const percent = screen.total > 0 ? Math.round((screen.found / screen.total) * 100) : 0;
  const left = ` Fou du métro · ${screen.title} · ${screen.found} / ${screen.total} (${percent} %) · ${formatDuration(screen.elapsedSeconds)}`;
  const right = `${GROUPING_LABELS[state.grouping]} [Tab] `;
  const header = left.length + right.length <= width ? left + " ".repeat(width - left.length - right.length) + right : fit(left, width);

  const labelWidth = Math.min(32, Math.floor(width * 0.4), Math.max(0, ...groups.map((g) => g.label.length)));
  const countWidth = Math.max(0, ...groups.map((g) => `${g.total} / ${g.total}`.length));
  const start = Math.min(state.scroll, Math.max(0, groups.length - rows));
  const hidden = groups.length - start - rows;
  const shown = groups.slice(start, start + (hidden > 0 ? rows - 1 : rows));
  const body = shown.map((group) => groupRow(group, labelWidth, countWidth, width, color));
  if (hidden > 0) body.push(paint(` ↓ ${groups.length - start - shown.length} de plus`, color, "90"));
  while (body.length < rows) body.push("");

  const feedback = state.feedback
    ? paint(fit(` ${state.feedback}`, width), color, "33")
    : screen.lastFoundNames.length > 0
      ? paint(fit(` ✓ ${screen.lastFoundNames.join(", ")}`, width), color, "32")
      : "";
  const separator = paint("─".repeat(width), color, "90");

  return [
    paint(header, color, "1"),
    separator,
    ...body,
    separator,
    feedback,
    fit(` > ${state.input}█`, width),
    paint(fit(` ${HELP}`, width), color, "90"),
  ].slice(0, height);
}
