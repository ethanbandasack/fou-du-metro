# Official data sources

Research of 2026-11-12: where clean stations, lines, colors and connections can be fetched, and how
the local data in `src/data/` compares. Run `npm run data:audit` for the current comparison.

## Île-de-France Mobilités open data (primary)

Portal: [data.iledefrance-mobilites.fr](https://data.iledefrance-mobilites.fr), Opendatasoft Explore
API v2.1, no key, updated daily. Whole datasets download as JSON from
`https://data.iledefrance-mobilites.fr/api/explore/v2.1/catalog/datasets/<id>/exports/json`
(optionally `?where=<ODSQL>`). Also mirrored on [data.gouv.fr](https://www.data.gouv.fr/datasets/arrets-et-lignes-associees).

| Dataset id | What it gives | Useful fields |
|------------|---------------|---------------|
| `emplacement-des-gares-idf` | every rail station × line (métro, RER, Transilien, TER, tram, VAL, câble): 1287 records | `nom_gares`, `res_com` / `indice_lig`, `mode`, `geo_point_2d`, **`id_ref_zdc`** (transfer zone), `date_mise` (opening), terminus flags |
| `zones-de-correspondance` | official transfer zones (ZdC): stops in one zone are one interchange | `zdcid`, `zdcname`, `zdctown` (commune, or "Paris 11e"), `zdcpostalregion` (INSEE code, 751xx in Paris) |
| `referentiel-des-lignes` | every line with its official colors and status | `shortname_line`, `transportmode`, `colourweb_hexa`, `textcolourweb_hexa`, `status` |
| `arrets-lignes` | every stop served by every line (all modes, 72k records) | `stop_name`, `route_long_name`, `mode`, `nom_commune`, `code_insee` |
| `projets_lignes_idf` | lines and extensions under construction or planned, by operation | `res_com`, `operation`, `statut`, `mes_estime` (estimated opening), `rvb` (color) |
| `projets_arrets_idf` | their stops | `nom_arret`, `res_com`, `id_operati`, `variante`, `geo_point_2d` |
| `offre-horaires-tc-gtfs-idfm` ([PRIM](https://prim.iledefrance-mobilites.fr/en/jeux-de-donnees/offre-horaires-tc-gtfs-idfm), zip of 115 MB at `https://eu.ftp.opendatasoft.com/stif/GTFS/IDFM-gtfs.zip`) | full GTFS timetable | `stop_times` sequences give line order (branches included); `transfers.txt` gives walking transfers, also between zones |

Notes:

- The stop referential distinguishes stops, stop zones (ZdA) and transfer zones (ZdC); RER and
  Transilien stops appear in GTFS as `IDFM:monomodalStopPlace:<id>`
  ([IDFM referential guide](https://data.iledefrance-mobilites.fr/api/v2/catalog/datasets/referentiel-des-lignes/attachments/2023_idfm_referentiels_pdf)).
- A ZdC is strict: Châtelet (métro) and Châtelet-Les Halles (RER) are two zones; Saint-Lazare,
  Haussmann Saint-Lazare and Auber are three. Corridors between zones are only in GTFS `transfers.txt`.
- Official web colors differ from the palette the app used before (for example line 1 is `#FFBE00`).

## Wikidata (cultural attributes)

SPARQL at [query.wikidata.org](https://query.wikidata.org). Of 422 items whose transport network is the
Paris Métro (`P16 = Q50716`): 344 have "named after" (`P138`, a human when the target is an instance of
`Q5`), 344 an opening date (`P1619`), 381 adjacent stations (`P197`, with the line as qualifier). This can
derive `figure_historique`, `ouverte_apres_1980` and a cross-check of line order. Community data: check
before trusting.

## OpenStreetMap

Route relations (`type=route`, `route=subway|train|tram`) list stops in order per direction, and
stations carry `ref:FR:STIF` (the IDFM id), see the
[OSM wiki](https://wiki.openstreetmap.org/wiki/Key:ref:FR:STIF). Good for geometry (line shapes for the
map); heavier to query (Overpass API).

## Comparison with the local data (first audit)

| Finding | Count | Example |
|---------|-------|---------|
| local rows with no official counterpart on that line | 13 | `L · Poissy`, `J · Sartrouville` (probably wrong lines) |
| official stations missing locally | 28 | line 18 (new), tram T1 extension (Asnières, Gennevilliers, Villeneuve-la-Garenne) |
| stations whose lines differ from their ZdC | 55 | Porte de Pantin lacks T3b, CDG 2 lacks CDG VAL |
| line colors differing from the official web colors | 47 | line 1 `#FFCE00` locally, `#FFBE00` officially |

Matching is by line, name similarity and distance (99 % of local rows match); the 13 leftovers are real
differences.

## Recommendation

1. **Now (automatic check)**: `npm run data:audit` compares `src/data/` with IDFM open data and lists
   differences. Run it before editing data and after each IDFM update.
2. **Colors** (done): the palette uses the official web colors from `referentiel-des-lignes`.
3. **Connections** (done): stations are grouped by official transfer zone (`zone` column, filled by
   `npm run data:zones`), `corridors.json` keeps the hand-curated links between zones, and the hand-set
   `has_rer` / `has_tram` flags are gone. Next: cross-check corridors with GTFS `transfers.txt`.
4. **Lines under construction** (done): `npm run data:import -- --projects` adds lines 15 to 18 and the
   tram and RER extensions with their estimated opening dates (off by default in the game).
5. **Later**: regenerate `stations.csv` from `emplacement-des-gares-idf` (names, coordinates, commune
   from the ZdC, opening date) with the hand-curated columns kept in an overrides file; derive line order
   from GTFS stop sequences; derive `figure_historique` from Wikidata.
