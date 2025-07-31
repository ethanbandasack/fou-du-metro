import HomePage from '@/components/HomePage';
import { getOptimizedStations, getOptimizedStationsByLine } from '@/utils/metroUtils';
import { MetroLine } from '@/types/metro';

export default async function Page() {
  // Use the optimized pre-computed line data
  const stations = getOptimizedStations();
  const stationsByLine = getOptimizedStationsByLine();
  
  // Convert to the lines format expected by HomePage
  const lines: MetroLine[] = Object.entries(stationsByLine).map(([lineKey, lineStations]) => {
    const [mode, line] = lineKey.split(' ');
    return {
      line,
      mode: mode as "METRO" | "RER" | "TRAIN" | "TRAMWAY" | "VAL",
      stations: lineStations
    };
  });

  return <HomePage stations={stations} lines={lines} />;
}
