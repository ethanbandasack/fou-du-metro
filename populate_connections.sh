#!/bin/bash

# Script to populate connections in existing line data files
CSV_FILE="src/data/emplacement-des-gares-idf.csv"
LINES_DIR="src/data/lines"

echo "Populating connections in line data files..."

# Create a temporary mapping file of station names to their lines
echo "Building station-to-lines mapping..."
grep -E "(METRO|RER|TRAM|TRAIN)" "$CSV_FILE" | cut -d';' -f4,14,15 | sort | uniq > temp_station_lines.txt

# Function to get connections for a station name
get_connections() {
    local station_name="$1"
    local current_line="$2"
    local current_mode="$3"
    
    # Normalize station name (lowercase, remove special chars)
    local normalized_name=$(echo "$station_name" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
    
    # Find all lines for this station name, excluding current line
    local connections=""
    while IFS=';' read -r nom_long mode indice_lig; do
        local norm_csv_name=$(echo "$nom_long" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]//g')
        
        if [ "$norm_csv_name" = "$normalized_name" ] && [ "$indice_lig" != "$current_line" ]; then
            if [ -n "$connections" ]; then
                connections="${connections}, "
            fi
            
            # Format connection based on mode
            if [ "$mode" = "TRAMWAY" ]; then
                connections="${connections}\"T${indice_lig}\""
            else
                connections="${connections}\"${indice_lig}\""
            fi
        fi
    done < temp_station_lines.txt
    
    echo "[$connections]"
}

# Process each TypeScript file in the lines directory
for file in "$LINES_DIR"/*.ts; do
    if [[ $(basename "$file") == "types.ts" ]] || [[ $(basename "$file") == "index.ts" ]]; then
        continue
    fi
    
    echo "Processing $(basename "$file")..."
    
    # Extract line info from filename
    if [[ $(basename "$file") =~ ^(metro|rer|tram|train)-(.+)\.ts$ ]]; then
        mode_prefix="${BASH_REMATCH[1]}"
        line="${BASH_REMATCH[2]}"
        
        case "$mode_prefix" in
            "metro") mode="METRO" ;;
            "rer") mode="RER"; line=$(echo "$line" | tr '[:lower:]' '[:upper:]') ;;
            "tram") mode="TRAMWAY"; line=$(echo "$line" | tr '[:lower:]' '[:upper:]') ;;
            "train") mode="TRAIN"; line=$(echo "$line" | tr '[:lower:]' '[:upper:]') ;;
        esac
        
        # Create a temporary file to store the updated content
        cp "$file" "${file}.tmp"
        
        # Process each station in the file
        while IFS= read -r line_content; do
            if [[ "$line_content" =~ ^[[:space:]]*name:[[:space:]]*\"([^\"]+)\" ]]; then
                station_name="${BASH_REMATCH[1]}"
                # Get the next few lines to find and replace connections
                connections=$(get_connections "$station_name" "$line" "$mode")
                
                # Read ahead to find the connections line and replace it
                sed -i "/name: \"$station_name\"/,/connections: \[/ {
                    s/connections: \[\]/connections: $connections/
                    s/connections: \[.*\]/connections: $connections/
                }" "${file}.tmp"
            fi
        done < "$file"
        
        # Replace original file with updated one
        mv "${file}.tmp" "$file"
        echo "Updated connections in $(basename "$file")"
    fi
done

# Cleanup
rm -f temp_station_lines.txt

echo "Done populating connections!"
