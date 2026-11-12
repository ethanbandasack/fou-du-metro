# Agent guide

Quiz about the Île-de-France rail network. Next.js 15, React 19, Tailwind 4, Vitest.

## Commands

- `npm run dev`: dev server (Turbopack)
- `npm test`: unit tests (Vitest)
- `npm run check`: lint + typecheck + tests (run before every commit)
- `npm run build`: production build (also lints)

Do not run `next build` while `next dev` is running: both write `.next/`.

## Where things are

Read `docs/ARCHITECTURE.md` (layers, vocabulary) and `docs/DATA.md` (data files).
Logic goes in `src/domain` (pure) or in a feature's pure helpers, with a test
next to it. Components stay thin.

## Rules

- Test first: write the failing test, watch it fail, then implement.
- `src/domain` must not import React, Next or Node APIs.
- Conventional Commits (`feat:`, `fix:`, `refactor:`, `test:`, `docs:`, `chore:`), one concern per commit.
- UI copy in French with correct accents. Code, comments and commits in English.
- Never commit `.claude/`, `src/data/users.json` or `dev/`.
