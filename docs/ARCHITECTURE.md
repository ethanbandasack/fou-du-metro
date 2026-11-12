# Architecture

Le Fou du Métro is a Next.js 15 (App Router) app with a static home page. All
network data is read at build time and passed to client components as plain
objects.

## Layers

```
src/
  data/       raw data: stations.csv, lines/*.yaml, connection-aliases.json  (see DATA.md)
  domain/     pure TypeScript, no React / Next / fs. Fully unit tested.
  server/     Node-only code reading files (build time, API route, CLI)
  features/   one folder per feature: React components + hooks + pure helpers
  components/ UI shared by several features
  hooks/      generic React hooks
  app/        Next.js routes, kept thin
```

Dependencies point inwards: `app -> features -> domain`, `server -> domain`.
`domain` never imports from another layer.

## Data flow

```
stations.csv ──parseStationsCsv──┐
lines/*.yaml ──(server)──────────┼─ buildNetwork ─> Network { lines, stations }
connection-aliases.json ─────────┘
```

`src/app/page.tsx` calls `loadNetwork()` (server) and renders `HomePage`.
The page is prerendered: changing a data file requires a rebuild (or the dev
server).

## Domain vocabulary

| Term | Meaning | Type |
|------|---------|------|
| Stop | a station as served by one line (one CSV row kept by the line's YAML order) | `Stop` |
| Line | ordered stops of one line, with label and official colors | `Line` |
| Station | a physical interchange: CSV rows with alias names within ~1 km, merged | `Station` |
| Key | `normalizeName(name)`: stops sharing a key are found together in the classic quiz | `Stop.key` |
| Answer | something to find: a key plus every name that designates it | `Answer` |

## Modules

- `domain/lines.ts`: modes, line ids (`3B` -> `3bis`), IDFM palette, labels, sort order.
- `domain/names.ts`: name normalization and alias matching.
- `domain/csv.ts`: strict parser for `stations.csv` (throws with a line number).
- `domain/network.ts`: `buildNetwork`, groups rows into stations, computes connections, orders lines.
- `domain/matching.ts`: answer index. A guess matches a full name, or a part of a dashed or
  parenthesised name that only one station has. Prefixes never match.
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
- `hooks/useLocalStorageState.ts`: state mirrored in localStorage (scores, player, settings).

## Testing

`npm test` runs Vitest on `src/**/*.test.ts`. Pure modules are tested directly;
`server/loadNetwork.test.ts` characterizes the real dataset (counts, a few
connections). React components hold no logic worth testing on their own.

## Conventions

- Test first for any logic change (red, green, refactor).
- Conventional Commits, one concern per commit.
- UI text in French; code, comments and commits in English.
