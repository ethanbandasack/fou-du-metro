import HomePage from '@/components/HomePage';
import { parseEnrichedCSV } from '@/utils/intersectionUtils';
import { MetroLine, EnrichedStation, MetroStation } from '@/types/metro';
import { groupStationsByLine, reorderStationsWithTS, getLineColor } from '@/utils/metroUtils';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import { MetroLineData } from '@/data/lines/types';

export default async function Page() {
  // 1. Load manual line orders from YAML files
  const linesDir = path.join(process.cwd(), 'src/data/lines');
  const allLinesData: MetroLineData[] = [];
  
  if (fs.existsSync(linesDir)) {
    const files = fs.readdirSync(linesDir).filter(f => f.endsWith('.yaml'));
    files.forEach(file => {
      try {
        const content = fs.readFileSync(path.join(linesDir, file), 'utf8');
        const data = yaml.load(content) as any;
        if (data && data.line && data.mode && data.stations) {
          allLinesData.push({
            line: String(data.line),
            mode: data.mode,
            color: getLineColor(`${data.mode} ${data.line}`),
            stations: data.stations.map((name: string) => ({ name }))
          });
        }
      } catch (err) {
        console.error(`Error parsing YAML file ${file}:`, err);
      }
    });
  }

  let enrichedStations: EnrichedStation[] = [];
  let rawStations: MetroStation[] = [];
  let dataError = false;
  
  try {
    const csvPath = path.join(process.cwd(), 'src/data/stations.csv');
    if (fs.existsSync(csvPath)) {
      const csvContent = fs.readFileSync(csvPath, 'utf8');
      
      // 1. Get enriched stations for Intersection Quiz
      enrichedStations = parseEnrichedCSV(csvContent);
      
      // 2. Parse raw CSV rows into a flat pool
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

          rawStations.push({
            id: `${mode}-${line}-${nom}`,
            gares_id: `${line}-${order}`,
            nom_long: nom,
            line: line,
            lineColor: getLineColor(`${mode} ${line}`),
            mode: mode,
            exploitant: mode === 'METRO' ? 'RATP' : 'SNCF',
            connections: [], // Will be filled below
            coordinates: { lat, lng: lon },
            order: order,
            isGuessed: false
          });
        }
      }

      // 3. Calculate connections from the global pool
      const stationsByName = new Map<string, string[]>();
      rawStations.forEach(s => {
        if (!stationsByName.has(s.nom_long)) stationsByName.set(s.nom_long, []);
        stationsByName.get(s.nom_long)!.push(s.line);
      });
      rawStations.forEach(s => {
        s.connections = stationsByName.get(s.nom_long)?.filter(l => l !== s.line) || [];
      });

    } else {
      console.error('Critical data file missing: stations.csv');
      dataError = true;
    }
  } catch (error) {
    console.error('Error loading data:', error);
    dataError = true;
  }

  // 4. APPLY MANUAL ORDERING: Merge CSV data with TS sequences
  // This uses the TS files for the sequence but pulls ALL metadata (connections, coordinates) from CSV
  const stations = reorderStationsWithTS(rawStations, allLinesData);
  const lines: MetroLine[] = groupStationsByLine(stations);

  return <HomePage stations={stations} lines={lines} enrichedStations={enrichedStations} dataError={dataError} />;
}
