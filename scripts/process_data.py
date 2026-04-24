import csv
import io
import geopandas as gpd
from shapely.geometry import Point

csv_input = "src/data/metro-stations.csv"
geojson_file = "src/data/arrondissements.geojson"
output_csv = "src/data/stations-enriched.csv"

# Configuration
POST_1980_STATIONS = [
    "Bibliothèque François-Mitterrand",
    "Cour Saint-Émilion",
    "Bercy",
    "Gare de Lyon",
    "Châtelet",
    "Pyramides",
    "Madeleine",
    "Saint-Lazare",
    "Olympiades",
    "Pont Cardinet",
    "Saint-Ouen",
    "Mairie de Saint-Ouen",
    "Mairie de Clichy",
    "Gabriel Péri",
    "Les Agnettes",
    "Les Courtilles",
    "La Défense",
    "Esplanade de La Défense",
    "Mairie de Montrouge",
    "Barbara",
    "Bagneux - Lucie Aubrac",
    "Front Populaire",
    "Aimé Césaire",
    "Mairie d'Aubervilliers",
    "Pointe du Lac",
    "Villejuif - Léo Lagrange",
    "Villejuif - Paul Vaillant-Couturier",
    "Villejuif - Louis Aragon",
    "Bobigny - Pantin - Raymond Queneau",
    "Bobigny - Pablo Picasso",
    "Coteaux de Beauclair",
    "Rosny - Bois-Perrier",
    "Rosny - sous - Bois - Conti",
    "Montreuil - Hôpital",
    "Romainville - Carnot",
    "Serge Gainsbourg",
]

people_keywords = [
    "Alexandre Dumas",
    "Barbès",
    "Rochechouart",
    "Jean Jaurès",
    "Daumesnil",
    "Félix Éboué",
    "Étienne Marcel",
    "George V",
    "Richelieu",
    "Drouot",
    "Victor Hugo",
    "Pasteur",
    "Pierre et Marie Curie",
    "Lucie Aubrac",
    "Boucicaut",
    "Chardon-Lagache",
    "Louise Michel",
    "Bienvenüe",
    "Franklin D. Roosevelt",
    "Charles de Gaulle",
    "Étoile",
    "Clemenceau",
    "Anatole France",
    "Lamarck",
    "Caulaincourt",
    "Jules Joffrin",
    "Aimé Césaire",
    "Mabillon",
    "Cardinal Lemoine",
    "Jacques Bonsergent",
    "Colonel Fabien",
    "Gabriel Péri",
    "Guy Môquet",
    "Marx Dormoy",
    "Raspail",
    "Denfert",
    "Rochereau",
    "Gallieni",
    "Gambetta",
    "Parmentier",
    "Pereire",
    "Wagram",
    "Louis Blanc",
    "Hoche",
]

colors_keywords = [
    "Blanc",
    "Blanche",
    "Rouge",
    "Bleu",
    "Bleue",
    "Vert",
    "Verte",
    "Rose",
    "Orange",
    "Jaune",
    "Gris",
    "Grise",
    "Violet",
    "Violette",
    "Noir",
    "Noire",
    "Brun",
    "Brune",
    "Marron",
    "Argent",
    "Or",
]

# Geopandas processing
gdf_arr = gpd.read_file(geojson_file).to_crs(epsg=2154)

stations = []

with open(csv_input, "r", encoding="utf-8") as f:
    content = f.read()
    csv_part = content.split(
        "rownames,name,caption,lines,connect_rer,connect_tramway,connect_transilien,connect_other,passengers,latitude,longitude,location"
    )[1]
    reader = csv.reader(io.StringIO(csv_part))

    for row in reader:
        if not row or len(row) < 11:
            continue

        name = row[1].replace("—", " - ")
        metro_lines = [line.strip() for line in row[3].split(",")]
        rer_lines = [line.strip() for line in row[4].split(",") if line.strip()]

        all_lines_list = metro_lines + rer_lines
        lines_str = " ".join(all_lines_list)

        location_raw = row[11].lower()

        try:
            lat = float(row[9])
            lon = float(row[10])
        except (ValueError, TypeError):
            continue

        point = Point(lon, lat)
        station_gs = gpd.GeoSeries([point], crs="EPSG:4326").to_crs(epsg=2154)
        station_point = station_gs.iloc[0]

        # Arrondissement matching
        arr_match = gdf_arr[gdf_arr.contains(station_point)]
        arr_num = -1
        if not arr_match.empty:
            code_str = arr_match.iloc[0]["code"]
            try:
                arr_num = (
                    int(code_str[-2:])
                    if code_str.startswith("75")
                    else int(code_str[:2])
                )
            except ValueError:
                arr_num = -1

        if arr_num == -1 or arr_num > 94:
            if "92" in location_raw:
                arr_num = 92
            elif "93" in location_raw:
                arr_num = 93
            elif "94" in location_raw:
                arr_num = 94

        is_rive_gauche = 1 if arr_num in [5, 6, 7, 13, 14, 15] else 0
        is_historical = 1 if any(p in name for p in people_keywords) else 0
        is_modern = (
            1
            if name in POST_1980_STATIONS or any(line == "14" for line in metro_lines)
            else 0
        )
        has_rer = 1 if rer_lines else 0

        is_couleur = 0
        name_lower = name.lower()
        for ck in colors_keywords:
            if (
                f" {ck.lower()}" in name_lower
                or name_lower.startswith(ck.lower())
                or f"-{ck.lower()}" in name_lower
            ):
                if ck == "Jaune" and "jaurès" in name_lower:
                    continue
                is_couleur = 1
                break

        stations.append(
            [
                name,
                lines_str,
                lat,
                lon,
                arr_num,
                is_historical,
                is_couleur,
                is_modern,
                is_rive_gauche,
                has_rer,
            ]
        )

header = [
    "nom",
    "lines",
    "lat",
    "lon",
    "arrondissement",
    "figure_historique",
    "couleur",
    "ouverte_apres_1980",
    "rive_gauche",
    "has_rer",
]

with open(output_csv, "w", encoding="utf-8", newline="") as f:
    writer = csv.writer(f)
    writer.writerow(header)
    writer.writerows(stations)

print(f"Processed {len(stations)} stations. Included RER lines.")
