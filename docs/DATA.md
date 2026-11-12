# Data

All files live in `src/data/` and are read at build time by
`src/server/loadNetwork.ts`. A malformed file fails the build with the file
name (and line number for the CSV).

## `stations.csv`

One row per station and line (a station served by 3 lines has 3 rows).
Comma separated, no quoting, header required:

| Column | Meaning |
|--------|---------|
| `nom` | station name as displayed |
| `line` | line id: `1`..`14`, `3B`, `7B` (read as `3bis`, `7bis`), `A`..`E`, `T1`.., `H`..`V`, `C1`, `TER ...`, `ORLYVAL`... |
| `mode` | `METRO`, `RER`, `TRANSILIEN`, `TRAIN`, `TRAMWAY`, `VAL`, `CABLE` |
| `order` | legacy position along the line (the YAML file wins) |
| `lat`, `lon` | WGS84 coordinates |
| `arrondissement` | 1-20 inside Paris, otherwise the département number (92, 93...) |
| `figure_historique` | `1` if named after a historical figure |
| `couleur` | `1` if the name contains a color |
| `ouverte_apres_1980` | `1` if opened after 1980 |
| `rive_gauche` | `1` if on the left bank |
| `commune` | commune of the station (`Paris` for arrondissements 1-20) |
| `zone` | official IDFM transfer zone id (`id_ref_zdc`); empty when IDFM has no such station on that line |
| `opening` | `YYYY-MM-DD` opening date of a station not open yet (official or estimated); empty when open |

`commune` is filled by `npm run data:communes` (`scripts/add-communes.ts`), which looks up the
coordinates of non-Paris rows on [geo.api.gouv.fr](https://geo.api.gouv.fr). Run it after adding rows
(`-- --force` refreshes every value). `zone` is filled by `npm run data:zones`
(`scripts/sync-zones.ts`), which matches each row to its IDFM station. The parser accepts LF and CRLF
line endings.

## `lines/*.yaml`

One file per line. It sets the order of stops and which CSV rows are played:
a CSV row whose name is not listed in its line's YAML file is ignored.

```yaml
line: '1'        # same id as the CSV (3B and 7B are fine)
mode: METRO
stations:
- La Défense (Grande Arche)
- Esplanade de la Défense
```

Names are matched with `normalizeName` (case, accents and punctuation
ignored). Branching lines list their branches one after the other.

## Stations and connections

Rows sharing a `zone` form one station: its names are the rows' names, its lines the rows' lines, and
each stop lists the other lines of the zone as connections. Rows without a zone (future stations) join
a station with the same name less than 0.01° away (~1 km).

Stations with a future `opening` are hidden unless the player turns on "Lignes futures" (classic quiz)
or passes `--future` (terminal); the intersection quiz plays the open network only.

## `corridors.json`

Hand-curated walking links between two different zones, named by one station of each, for example
`Saint-Lazare` ↔ `Haussmann Saint-Lazare` or `Châtelet` ↔ `Châtelet - Les Halles`. A corridor adds the
lines of the other zone to the connections (and to the RER / tram flags) of each side; it never merges
the two stations. Both ends must be less than 0.01° apart.

## Adding or fixing a line

1. Add or edit its rows in `stations.csv`, then run `npm run data:zones` and `npm run data:communes`.
2. List its stations in order in `lines/<mode>-<id>.yaml`.
3. Add a corridor only for a walking link between two different zones.
4. Run `npm test` (the dataset characterization test lists expected counts; update it on purpose).

## Checking against official data

`npm run data:audit` downloads Île-de-France Mobilités open data and lists stations missing on either
side, connections that differ from the official transfer zones and colors that differ from the official
ones. Sources and the migration plan: [DATA-SOURCES.md](DATA-SOURCES.md).

## Untracked files

- `src/data/users.json`: login codes for `/api/auth` (`[{ id, username, hash, createdAt }]`).
- `dev/`: private scripts used to fetch and enrich IDFM open data. Not versioned.
