# Le Fou du Métro 🚇

An interactive quiz about the rail network of Île-de-France (Métro, RER, Transilien, Tramway, Train).

> [!NOTE]
> The game interface and station names are in French.

## Game modes

- **Classique**: type station names; they are revealed line by line. Choose the modes and lines to play,
  pause, show or hide connections, reveal the answers. Partial input never reveals anything: type a full
  name (accents, case and dashes don't matter) or an unambiguous part of it (`Étoile` for
  `Charles de Gaulle - Étoile`).
- **Intersection**: find the metro stations matching one or two categories (line, line group, Paris or
  suburbs, arrondissement, connections, names...).
- **Carte** (classic mode): a map of the lines in play that fills in as you find stations. Zoom with the
  wheel or buttons, drag to pan; hide it, or hide the gray dots of the stations still to find.

Settings and scores are kept in your browser. Saving scores requires a login code (see `docs/DATA.md`).

## Getting started

```bash
git clone https://github.com/ethanbandasack/fou-du-metro.git
cd fou-du-metro
npm install
npm run dev
```

| Command | Purpose |
|---------|---------|
| `npm run dev` | development server |
| `npm test` | unit tests |
| `npm run check` | lint, typecheck and tests |
| `npm run build` | production build |

## Documentation

- [Architecture](docs/ARCHITECTURE.md): layers, data flow, vocabulary
- [Data](docs/DATA.md): `stations.csv`, line files, aliases
- [Agent guide](AGENTS.md): commands and rules for contributors and coding agents

> [!IMPORTANT]
> **Data quality**: station data was enriched semi-automatically; a few connections or orders may be wrong.
> Fixes to `src/data/` are welcome.

## Parisine font

The RATP signage font **Parisine** is proprietary and **not included**. If it is installed on your system
(as "Parisine" / "Parisine Regular" / "Parisine Bold"), the app uses it; otherwise it falls back to
Helvetica / Arial. Make sure you have the right to use it.
