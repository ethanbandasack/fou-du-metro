/**
 * Terminal version of the classic quiz: type station names, see only how many
 * are found, overall or per line / arrondissement / city.
 *
 * Run with `npm run tui -- --help`.
 */
import readline from "node:readline";
import { formatDuration } from "@/domain/format";
import { MODE_LABELS, type Mode } from "@/domain/lines";
import { buildAnswerIndex } from "@/domain/matching";
import type { Line } from "@/domain/network";
import { answersOf, selectLines } from "@/domain/selection";
import { loadNetwork } from "@/server/loadNetwork";
import { parseOptions, USAGE, type TuiOptions } from "@/tui/options";
import { progressBy } from "@/tui/progress";
import { render, visibleRows } from "@/tui/render";
import { initialTuiState, tuiReducer, type TuiAction } from "@/tui/state";

const ENTER_ALT_SCREEN = "\x1b[?1049h\x1b[?25l";
const LEAVE_ALT_SCREEN = "\x1b[?25h\x1b[?1049l";

function titleOf(options: TuiOptions, lines: Line[]): string {
  if (options.lines.length > 0) return lines.map((line) => line.label).join(", ");
  if (options.modes.length === 0) return "Tout le réseau";
  return options.modes.map((mode) => MODE_LABELS[mode as Mode]).join(", ");
}

function main() {
  let options: TuiOptions;
  try {
    options = parseOptions(process.argv.slice(2), process.env);
  } catch (error) {
    console.error((error as Error).message);
    process.exit(2);
  }
  if (options.help) {
    console.log(USAGE);
    return;
  }
  if (!process.stdin.isTTY || !process.stdout.isTTY) {
    console.error("Le mode terminal a besoin d'un terminal interactif.");
    process.exit(1);
  }

  const lines = selectLines(loadNetwork().lines, {
    selectedModes: options.modes,
    selectedLines: options.lines,
    includeFuture: options.future,
    today: new Date().toISOString().slice(0, 10),
  });
  if (lines.length === 0) {
    console.error("Aucune ligne ne correspond à ces options.\n\n" + USAGE);
    process.exit(1);
  }

  const answers = answersOf(lines);
  const index = buildAnswerIndex(answers, { hardcore: options.hardcore });
  const names = new Map(answers.map((answer) => [answer.key, answer.names[0]]));
  const title = titleOf(options, lines) + (options.hardcore ? " · hardcore" : "");
  const startedAt = Date.now();
  const out = process.stdout;
  let state = initialTuiState(options.grouping);

  const size = () => ({ width: out.columns ?? 80, height: out.rows ?? 24 });
  const elapsed = () => Math.floor((Date.now() - startedAt) / 1000);
  const groups = () => progressBy(lines, new Set(state.found), state.grouping);

  const draw = () => {
    const frame = render({
      state,
      groups: groups(),
      title,
      found: state.found.length,
      total: answers.length,
      elapsedSeconds: elapsed(),
      lastFoundNames: state.lastFound.map((key) => names.get(key) ?? key),
      ...size(),
      color: options.color,
    });
    out.write("\x1b[H" + frame.map((line) => line + "\x1b[K").join("\n") + "\x1b[J");
  };

  const timer = setInterval(draw, 1000);
  const quit = () => {
    clearInterval(timer);
    process.stdin.setRawMode(false);
    out.write(LEAVE_ALT_SCREEN);
    const done = state.found.length === answers.length ? "Bravo ! " : "";
    console.log(`${done}${state.found.length} / ${answers.length} gares trouvées en ${formatDuration(elapsed())}.`);
    process.exit(0);
  };

  const dispatch = (action: TuiAction) => {
    state = tuiReducer(state, action, index);
    if (state.found.length === answers.length) quit();
    draw();
  };
  const scroll = (delta: number) =>
    dispatch({ type: "scroll", delta, max: groups().length - visibleRows(size().height) });

  readline.emitKeypressEvents(process.stdin);
  process.stdin.setRawMode(true);
  out.write(ENTER_ALT_SCREEN);
  out.on("resize", draw);
  process.on("uncaughtException", (error) => {
    out.write(LEAVE_ALT_SCREEN);
    console.error(error);
    process.exit(1);
  });

  process.stdin.on("keypress", (text: string | undefined, key: readline.Key | undefined) => {
    if (key?.ctrl && (key.name === "c" || key.name === "d")) return quit();
    const page = visibleRows(size().height);
    switch (key?.name) {
      case "tab":
        return dispatch({ type: "nextGrouping" });
      case "up":
        return scroll(-1);
      case "down":
        return scroll(1);
      case "pageup":
        return scroll(-page);
      case "pagedown":
        return scroll(page);
      case "backspace":
        return dispatch({ type: "backspace" });
      case "escape":
        return dispatch({ type: "clear" });
      case "return":
      case "enter":
        return dispatch({ type: "submit" });
    }
    if (text && !key?.ctrl && !key?.meta && text >= " ") dispatch({ type: "type", text });
  });

  draw();
}

main();
