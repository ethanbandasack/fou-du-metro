# Architecture

Le Fou du Métro is a Next.js 16 (App Router) app with a static home page. All
network data is read at build time and passed to client components as plain
objects.

## Layers

```
src/
  data/       raw data: stations.csv, lines/*.yaml, corridors.json  (see DATA.md)
  domain/     pure TypeScript, no React / Next / fs. Fully unit tested.
  server/     Node-only code reading files (build time, API route, CLI)
  features/   one folder per feature: React components + hooks + pure helpers
  components/ UI shared by several features
  hooks/      generic React hooks
  app/        Next.js routes, kept thin
  tui/        terminal version (Node only, no dependency; a Swift helper for live dictation on macOS)
scripts/      data maintenance (add-communes.ts)
```

Dependencies point inwards: `app -> features -> domain`, `server -> domain`,
`tui -> server, domain`.
`domain` never imports from another layer.

## Data flow

```
stations.csv ──parseStationsCsv──┐
lines/*.yaml ──(server)──────────┼─ buildNetwork ─> Network { lines, stations }
corridors.json ─────────┘
```

`src/app/page.tsx` calls `loadNetwork()` (server) and renders `HomePage`.
The page is prerendered: changing a data file requires a rebuild (or the dev
server).

## Domain vocabulary

| Term | Meaning | Type |
|------|---------|------|
| Stop | a station as served by one line (one CSV row kept by the line's YAML order) | `Stop` |
| Line | ordered stops of one line, with label and official colors | `Line` |
| Station | an interchange: the CSV rows of one official transfer zone (`zone`) | `Station` |
| Corridor | hand-curated walking link between two zones: adds connections, never merges stations | `Corridor` |
| Key | `normalizeName(name)`: stops sharing a key are found together in the classic quiz | `Stop.key` |
| Answer | something to find: a key plus every name that designates it | `Answer` |

## Modules

- `domain/lines.ts`: modes, line ids (`3B` -> `3bis`), IDFM palette, labels, sort order.
- `domain/names.ts`: name normalization; `phoneticKey`, roughly how a French name sounds.
- `domain/csv.ts`: strict parser and writer for `stations.csv` (throws with a line number).
- `domain/network.ts`: `buildNetwork`, groups rows by transfer zone, adds corridors, computes connections, orders lines.
- `domain/matching.ts`: answer index. A guess matches a full name, or a part of a dashed or
  parenthesised name that only one station has. Prefixes never match. A hardcore index
  (`buildAnswerIndex(answers, { hardcore: true })`) accepts the exact full name only (`exactForm`).
  A spoken index (`spoken: true`, microphone only) also matches by `phoneticKey`, then
  `findMentionedAnswers` takes the one name within an edit or two of what was heard (7+ letters, same
  first sound); in hardcore it forgives spelling (`simplifyName`) but keeps full names only.
- `domain/format.ts`: durations.
- `domain/geo.ts`: projection to kilometres, map framing and zoom, line paths cut at branch jumps.
- `features/classic`: classic quiz. `quizReducer` is the state machine
  (idle / running / paused / finished + clock); `selection`, `scores` and `settings` are pure helpers.
- `features/intersection`: category quiz. `categories.ts` holds categories, targets and suggestions.
- `features/map`: `StationMap`, a dependency-free SVG map (pan, zoom, labels when zoomed in).
- `features/voice`: `voiceSession.ts` wraps the Web Speech API (restart after silences, errors);
  `useVoice` + `VoiceControls` plug it into a quiz. `findMentionedAnswers` (matching) extracts every
  station named in a transcript.
- `features/auth`: optional login by code (`/api/auth`, users in the untracked `src/data/users.json`).
- `domain/selection.ts`: lines in play for a mode/line selection and a day (future stations hidden unless
  included), their answers (one per key), open lines and stations. `hooks/useToday.ts` gives the day.
- `tui/`: `progress.ts` (found flag of each station per group: global, line, arrondissement, commune,
  first letter; in line order, branches one after the other, or alphabetically by letter), `state.ts`
  (input, guesses, grouping, scroll; `paste` is text read in one go, matched as typed; `hear` is the
  microphone transcript, matched by sound), `render.ts` (pure frame of strings; `stationBar` draws each
  station at its relative position), `options.ts` (CLI flags), `voice.ts` (compiles `listen.swift` into
  `node_modules/.cache` on first `--voice`, streams its transcripts as `hear` actions) and `main.ts`
  (raw-mode keyboard and screen IO only).
- `hooks/useLocalStorageState.ts`: localStorage through `useSyncExternalStore`, shared by every
  component using a key (scores, player, settings); `hooks/useHardcore.ts` is one such shared flag.

## Testing

`npm test` runs Vitest on `src/**/*.test.ts`. Pure modules are tested directly;
`server/loadNetwork.test.ts` characterizes the real dataset (counts, a few
connections). React components hold no logic worth testing on their own.

## Conventions

- Test first for any logic change (red, green, refactor).
- Conventional Commits, one concern per commit.
- UI text in French; code, comments and commits in English.
