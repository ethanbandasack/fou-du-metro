import { promises as fs } from 'fs';
import path from 'path';
import { QuizGame } from '@/components/QuizGame';
import { parseMetroStationsCSV, groupStationsByLine } from '@/utils/metroUtils';

export default async function Home() {
  // Read and parse the metro stations data from the new CSV file
  const csvPath = path.join(process.cwd(), 'src/data/emplacement-des-gares-idf.csv');
  const csvContent = await fs.readFile(csvPath, 'utf-8');
  const stations = parseMetroStationsCSV(csvContent);
  const lines = groupStationsByLine(stations);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <QuizGame stations={stations} lines={lines} />
    </div>
  );
}
