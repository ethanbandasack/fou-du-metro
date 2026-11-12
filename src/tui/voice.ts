/**
 * Live dictation for the terminal (macOS): listen.swift streams what the microphone hears through
 * Apple's speech recognition, partial results included. It is compiled on first use with the
 * Xcode command line tools; its Info.plist carries the microphone and speech usage descriptions
 * macOS asks for.
 */
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import readline from "node:readline";

export type ListenEvent =
  | { type: "ready" }
  | { type: "heard"; transcript: string }
  | { type: "error"; message: string };

/** One line printed by listen.swift. */
export function parseListenLine(line: string): ListenEvent | null {
  const [kind, ...rest] = line.split("\t");
  if (kind === "ready") return { type: "ready" };
  if (kind === "heard") return { type: "heard", transcript: rest.join("\t") };
  if (kind === "error") return { type: "error", message: rest.join("\t") };
  return null;
}

/** Path of the compiled listener, rebuilt when its sources changed. Throws a message for the player. */
function listener(): string {
  if (process.platform !== "darwin") throw new Error("--voice n'existe que sur macOS.");
  const sources = ["listen.swift", "listen.plist"].map((file) => path.join(__dirname, file));
  const binary = path.join(__dirname, "../../node_modules/.cache/fou-du-metro/listen");
  const built = fs.existsSync(binary) ? fs.statSync(binary).mtimeMs : 0;
  if (sources.every((source) => fs.statSync(source).mtimeMs < built)) return binary;

  console.error("Préparation de la dictée (une seule fois)...");
  fs.mkdirSync(path.dirname(binary), { recursive: true });
  const [swift, plist] = sources;
  try {
    execFileSync(
      "swiftc",
      ["-O", "-swift-version", "5", swift, "-o", binary, ...["-sectcreate", "__TEXT", "__info_plist", plist].flatMap((arg) => ["-Xlinker", arg])],
      { stdio: ["ignore", "ignore", "inherit"] },
    );
  } catch {
    throw new Error("Compilation de la dictée impossible : installez les outils Xcode (xcode-select --install).");
  }
  return binary;
}

/**
 * Starts listening; station names help the recognizer. Returns a function that stops it.
 * Throws when dictation cannot start (not macOS, no compiler).
 */
export function startListening(hints: string[], onEvent: (event: ListenEvent) => void): () => void {
  const child = spawn(listener(), ["fr-FR"], { stdio: ["pipe", "pipe", "ignore"] });
  child.stdin.end(hints.join("\n"));
  readline.createInterface({ input: child.stdout }).on("line", (line) => {
    const event = parseListenLine(line);
    if (event) onEvent(event);
  });
  child.on("error", (error) => onEvent({ type: "error", message: error.message }));
  return () => child.kill();
}
