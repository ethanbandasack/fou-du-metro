import HomePage from '@/components/HomePage';
import { parseEnrichedCSV } from '@/utils/intersectionUtils';
import { MetroLine, EnrichedStation, MetroStation, MetroLineData } from '@/types/metro';
import { groupStationsByLine, reorderStationsWithTS, getLineColor, getLineTextColor } from '@/utils/metroUtils';
import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';

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
          let line = String(data.line);
          if (line === "3B" || line === "3BIS") line = "3bis";
          if (line === "7B" || line === "7BIS") line = "7bis";
          
          allLinesData.push({
            line: line,
            mode: data.mode,
            color: getLineColor(`${data.mode} ${line}`),
            textColor: getLineTextColor(`${data.mode} ${line}`),
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
          let line = fields[1];
          if (line === "3B") line = "3bis";
          if (line === "7B") line = "7bis";
          const mode = fields[2] as MetroStation['mode'];
          const order = parseInt(fields[3]);
          const lat = parseFloat(fields[4]);
          const lon = parseFloat(fields[5]);
          const has_rer = fields[11] === '1';
          const has_tram = fields[12] === '1';

          rawStations.push({
            id: `${mode}-${line}-${nom}`,
            gares_id: `${line}-${order}`,
            nom_long: nom,
            line: line,
            lineColor: getLineColor(`${mode} ${line}`),
            lineTextColor: getLineTextColor(`${mode} ${line}`),
            mode: mode,
            exploitant: mode === 'METRO' ? 'RATP' : 'SNCF',
            connections: [], 
            has_rer,
            has_tram,
            coordinates: { lat, lng: lon },
            order: order,
            isGuessed: false
          });
        }
      }

      // 3. Calculate connections from the global pool (considering proximity)
      const stationsByName = new Map<string, MetroStation[]>();
      rawStations.forEach(s => {
        if (!stationsByName.has(s.nom_long)) stationsByName.set(s.nom_long, []);
        stationsByName.get(s.nom_long)!.push(s);
      });

      rawStations.forEach(s => {
        const potentialConnections = stationsByName.get(s.nom_long) || [];
        const validConnections = potentialConnections
          .filter(p => p.line !== s.line)
          .filter(p => {
            // ONLY consider connections that are explicitly marked in the CSV flags
            // If the target is RER/Tram, the source must have the corresponding flag
            if (p.mode === 'RER' && !s.has_rer) return false;
            if (p.mode === 'TRAMWAY' && !s.has_tram) return false;
            
            // For Metro/Train/Other, we still check proximity to avoid false positives 
            // like Saint-Fargeau
            if (!s.coordinates || !p.coordinates) return false;
            const latDiff = Math.abs(s.coordinates.lat - p.coordinates.lat);
            const lonDiff = Math.abs(s.coordinates.lng - p.coordinates.lng);
            return latDiff < 0.01 && lonDiff < 0.01;
          })
          .map(p => p.line);
        
        s.connections = Array.from(new Set(validConnections));
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
