import HomePage from '@/components/HomePage';
import { groupStationsByLine, getLineColor } from '@/utils/metroUtils';
import { parseEnrichedCSV } from '@/utils/intersectionUtils';
import { MetroLine, EnrichedStation, MetroStation } from '@/types/metro';
import fs from 'fs';
import path from 'path';

export default async function Page() {
  // Load enriched stations for both quiz modes from the single stations.csv
  let enrichedStations: EnrichedStation[] = [];
  let stations: MetroStation[] = [];
  let dataError = false;
  
  try {
    const enrichedCsvPath = path.join(process.cwd(), 'src/data/stations.csv');
    if (fs.existsSync(enrichedCsvPath)) {
      const csvContent = fs.readFileSync(enrichedCsvPath, 'utf8');
      
      // 1. Get enriched stations (grouped by name) for Intersection Quiz
      enrichedStations = parseEnrichedCSV(csvContent);
      
      // 2. Parse raw CSV rows for Classic Quiz (one station object per line)
      const lines = csvContent.trim().split('\n');
      for (let i = 1; i < lines.length; i++) {
        const fields = lines[i].split(',');
        if (fields.length >= 13) {
          const nom = fields[0];
          const line = fields[1];
          const mode = fields[2] as MetroStation['mode'];
          const order = parseInt(fields[3]);
          const lat = parseFloat(fields[4]);
          const lon = parseFloat(fields[5]);
          const has_rer = fields[11] === '1';
          const has_tram = fields[12] === '1';

          stations.push({
            id: `${mode}-${line}-${nom}`,
            gares_id: `${line}-${order}`,
            nom_long: nom,
            line: line,
            lineColor: getLineColor(`${mode} ${line}`),
            mode: mode,
            exploitant: mode === 'METRO' ? 'RATP' : 'SNCF',
            connections: [], // Will be filled by groupStationsByLine or similar logic if needed
            coordinates: { lat, lng: lon },
            order: order,
            isGuessed: false
          });
        }
      }

      // Re-calculate connections for the Classic mode stations
      const stationsByName = new Map<string, string[]>();
      stations.forEach(s => {
        if (!stationsByName.has(s.nom_long)) stationsByName.set(s.nom_long, []);
        stationsByName.get(s.nom_long)!.push(s.line);
      });
      stations.forEach(s => {
        s.connections = stationsByName.get(s.nom_long)?.filter(l => l !== s.line) || [];
      });

    } else {
      console.error('Data file missing: stations.csv');
      dataError = true;
    }
  } catch (error) {
    console.error('Error loading stations:', error);
    dataError = true;
  }

  // Convert to the lines format expected by HomePage
  const lines: MetroLine[] = groupStationsByLine(stations);

  return <HomePage stations={stations} lines={lines} enrichedStations={enrichedStations} dataError={dataError} />;
}
