# Agent guide

Quiz about the Île-de-France rail network: Next.js app (`src/app`, `src/features`) and a terminal
version (`src/tui`), both built on the pure `src/domain`. Scripts are in `package.json`.

Read `docs/ARCHITECTURE.md` before changing code and `docs/DATA.md` before touching `src/data/`.

## Workflow

1. One feature or fix = one branch from `main`, named `feat/…`, `fix/…`, `refactor/…`, `docs/…` or `chore/…`.
2. Test first: write the failing test, watch it go red, then implement. Logic lives in `src/domain` or a
   feature's pure helpers, next to its test; components stay thin.
3. Commit atomically with Conventional Commits. Every commit passes `npm run check`.
4. Before the PR: `npm run build`, then exercise the changed UI in a real browser.
5. Open a PR, merge it into `main` with a merge commit, delete the branch.

## Rules

- `src/domain` imports no React, Next or Node API.
- UI copy in French with correct accents; code, comments and commits in English.
- `.claude/`, `src/data/users.json` and `dev/` stay out of git.

## Gotchas

- `next build` and `next dev` both write `.next/`: stop the dev server before building.
- The home page is prerendered from `src/data/` at build time: data edits need a rebuild (or `next dev`).
- `npm run data:communes` calls geo.api.gouv.fr; run it after adding rows to `stations.csv`.
- `npm run tui -- --voice` runs `src/tui/listen.swift`: macOS prompts the terminal app for microphone and
  speech recognition access, so test the TUI wiring with a fake `node_modules/.cache/fou-du-metro/listen`
  script printing `ready` and `heard<TAB>text` lines.
- Chrome now exposes `SpeechRecognition` unprefixed: a fake for tests must replace both it and
  `webkitSpeechRecognition`.
