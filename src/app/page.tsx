import HomePage from '@/components/HomePage';
import { getOptimizedStations, getOptimizedStationsByLine } from '@/utils/metroUtils';
import { parseEnrichedCSV } from '@/utils/intersectionUtils';
import { MetroLine } from '@/types/metro';
import fs from 'fs';
import path from 'path';

export default async function Page() {
  // Use the optimized pre-computed line data
  const stations = getOptimizedStations();
  const stationsByLine = getOptimizedStationsByLine();
  
  // Load enriched stations for the intersection quiz
  const enrichedCsvPath = path.join(process.cwd(), 'src/data/stations-enriched.csv');
  const enrichedCsvContent = fs.readFileSync(enrichedCsvPath, 'utf8');
  const enrichedStations = parseEnrichedCSV(enrichedCsvContent);

  // Convert to the lines format expected by HomePage
  const lines: MetroLine[] = Object.entries(stationsByLine).map(([lineKey, lineStations]) => {
    const [mode, line] = lineKey.split(' ');
    const typedMode = mode as "METRO" | "RER" | "TRAIN" | "TRAMWAY" | "VAL";
    return {
      line,
      mode: typedMode,
      stations: lineStations
    };
  });

  return <HomePage stations={stations} lines={lines} enrichedStations={enrichedStations} />;
}
