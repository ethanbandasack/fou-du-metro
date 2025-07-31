#!/bin/bash

# Script to generate all line data files from CSV
CSV_FILE="src/data/emplacement-des-gares-idf.csv"
OUTPUT_DIR="src/data/lines"

echo "Generating line data files..."

# Get all unique line combinations (mode and line number)
grep -E "(METRO|RER|TRAM|TRAIN)" "$CSV_FILE" | cut -d';' -f13,14,15 | sort | uniq > lines_temp.txt

echo "Found lines:"
cat lines_temp.txt

# Function to generate TypeScript file for a line
generate_line_file() {
    local mode="$1"
    local line="$2"
    local res_com="$3"
    local filename=""
    local varname=""
    local color="#666666"
    
    # Determine filename and variable name
    if [ "$mode" = "METRO" ]; then
        if [ "$line" = "3bis" ]; then
            filename="metro-3bis.ts"
            varname="metroLine3bis"
            color="#87D3DF"
        elif [ "$line" = "7bis" ] || [ "$line" = "7b" ]; then
            filename="metro-7bis.ts"
            varname="metroLine7bis"
            color="#87D3DF"
        else
            filename="metro-${line}.ts"
            varname="metroLine${line}"
            case "$line" in
                "1") color="#FFCD00" ;;
                "2") color="#0055C8" ;;
                "3") color="#837902" ;;
                "4") color="#8B5A2B" ;;
                "5") color="#FF7E2E" ;;
                "6") color="#84C318" ;;
                "7") color="#FA9ABA" ;;
                "8") color="#CEADD2" ;;
                "9") color="#D5C900" ;;
                "10") color="#8B4513" ;;
                "11") color="#704B1C" ;;
                "12") color="#84C318" ;;
                "13") color="#87CEEB" ;;
                "14") color="#6E2C7F" ;;
            esac
        fi
    elif [ "$mode" = "RER" ]; then
        filename="rer-${line,,}.ts"
        varname="rer${line}"
        case "$line" in
            "A") color="#E2312A" ;;
            "B") color="#5291CE" ;;
            "C") color="#F99D1C" ;;
            "D") color="#00A88F" ;;
            "E") color="#C760A0" ;;
        esac
    elif [ "$mode" = "TRAM" ] || [ "$mode" = "TRAMWAY" ]; then
        filename="tram-${line}.ts"
        varname="tram${line}"
        color="#0080C7"
    elif [ "$mode" = "TRAIN" ]; then
        filename="train-${line,,}.ts"
        varname="train${line}"
        color="#8B5A00"
    fi
    
    echo "Generating $filename for $mode $line ($res_com)..."
    
    # Extract stations for this line
    grep ";$res_com;$line;$mode;" "$CSV_FILE" > "temp_stations_${line}.csv"
    
    if [ ! -s "temp_stations_${line}.csv" ]; then
        echo "No stations found for $mode $line, skipping..."
        rm -f "temp_stations_${line}.csv"
        return
    fi
    
    # Start generating TypeScript file
    cat > "$OUTPUT_DIR/$filename" << EOF
import { MetroLineData } from './types';

export const $varname: MetroLineData = {
  line: "$line",
  mode: "$mode",
  color: "$color",
  stations: [
EOF
    
    # Process each station
    order=1
    while IFS=';' read -r geo_point geo_shape gares_id nom_long nom_so_gar nom_su_gar id_ref_ZdC nom_ZdC id_ref_ZdA nom_ZdA idrefliga idrefligc res_com indice_lig mode_csv rest; do
        # Extract coordinates
        lat=$(echo "$geo_point" | cut -d',' -f1 | tr -d ' ')
        lng=$(echo "$geo_point" | cut -d',' -f2 | tr -d ' ')
        
        # Clean station name
        station_name=$(echo "$nom_long" | sed 's/"/\\"/g')
        short_name=""
        if [ -n "$nom_so_gar" ]; then
            short_name="\"$nom_so_gar\""
        else
            short_name="undefined"
        fi
        
        # For now, leave connections empty (would need complex logic to populate)
        connections="[]"
        
        cat >> "$OUTPUT_DIR/$filename" << EOF
    {
      order: $order,
      name: "$station_name",
      shortName: $short_name,
      connections: $connections,
      coordinates: { lat: $lat, lng: $lng }
    },
EOF
        
        order=$((order + 1))
    done < "temp_stations_${line}.csv"
    
    # Remove the last comma and close the file
    sed -i '$ s/,$//' "$OUTPUT_DIR/$filename"
    
    cat >> "$OUTPUT_DIR/$filename" << EOF
  ]
};
EOF
    
    rm -f "temp_stations_${line}.csv"
    echo "Generated $filename with $((order-1)) stations"
}

# Process each line
while IFS=';' read -r res_com indice_lig mode; do
    if [ -n "$res_com" ] && [ -n "$indice_lig" ] && [ -n "$mode" ]; then
        generate_line_file "$mode" "$indice_lig" "$res_com"
    fi
done < lines_temp.txt

rm -f lines_temp.txt

echo "Done generating line files!"
echo "Don't forget to import them in src/data/lines/index.ts"
