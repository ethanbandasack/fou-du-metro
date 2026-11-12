# Le Fou du Métro 🚇

An interactive quiz about the rail network of Île-de-France (Métro, RER, Transilien, Tramway, Train).

> [!NOTE]
> The game interface and station names are in French.

## Game modes

- **Classique**: type station names; they are revealed line by line. Choose the modes and lines to play,
  pause, show or hide connections, reveal the answers. Partial input never reveals anything: type a full
  name (accents, case and dashes don't matter) or an unambiguous part of it (`Étoile` for
  `Charles de Gaulle - Étoile`).
- **Hardcore** (both modes): only the exact name counts. Case, spaces and punctuation are ignored, but
  accents, every word and "Gare de" are required (`Charles de Gaulle Étoile`, not `Étoile`).
- **Lignes futures** (classic mode): add the lines and extensions under construction (lines 15 to 18,
  tram extensions...), off by default. Stations appear by themselves once their opening date has passed.
- **Intersection**: find the metro stations matching one or two categories (line, line group, Paris or
  suburbs, arrondissement, connections, names...).
- **Carte** (classic mode): a map of the lines in play that fills in as you find stations. Zoom with the
  wheel or buttons, drag to pan; hide it, or hide the gray dots of the stations still to find.
- **Dictée**: click the microphone or press `Alt+V` (`Option+V` on a Mac) and say station names, several
  per sentence if you like. Works in browsers with speech recognition (Chrome, Edge, Safari).

### Terminal version

```bash
npm run tui                                   # metro, progress per line
npm run tui -- --modes metro,rer --group ville
npm run tui -- --hardcore
npm run tui -- --future                       # include lines not open yet
npm run tui -- --help
```

Type station names; only the number found is shown, globally or per line, arrondissement or city
(`Tab` to switch, arrows to scroll, `Ctrl+C` to quit).

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
| `npm run tui` | terminal version |
| `npm run data:communes` | fill the `commune` column of `stations.csv` |

## Documentation

- [Architecture](docs/ARCHITECTURE.md): layers, data flow, vocabulary
- [Data](docs/DATA.md): `stations.csv`, line files, transfer zones and corridors
- [Data sources](docs/DATA-SOURCES.md): official IDFM open data, audit (`npm run data:audit`)
- [Agent guide](AGENTS.md): commands and rules for contributors and coding agents

> [!IMPORTANT]
> **Data quality**: station data was enriched semi-automatically; a few connections or orders may be wrong.
> Fixes to `src/data/` are welcome.

## Parisine font

The RATP signage font **Parisine** is proprietary and **not included**. If it is installed on your system
(as "Parisine" / "Parisine Regular" / "Parisine Bold"), the app uses it; otherwise it falls back to
Helvetica / Arial. Make sure you have the right to use it.
