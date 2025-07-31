import { MetroStation } from '@/types/metro';
import { MetroLineData, LineStation } from './types';
import { metroLine1 } from './metro-1';
import { metroLine2 } from './metro-2';
import { metroLine3 } from './metro-3';
import { metroLine3bis } from './metro-3bis';
import { metroLine4 } from './metro-4';
import { metroLine5 } from './metro-5';
import { metroLine6 } from './metro-6';
import { metroLine7 } from './metro-7';
import { metroLine7bis } from './metro-7bis';
import { metroLine8 } from './metro-8';
import { metroLine9 } from './metro-9';
import { metroLine10 } from './metro-10';
import { metroLine11 } from './metro-11';
import { metroLine12 } from './metro-12';
import { metroLine13 } from './metro-13';
import { metroLine14 } from './metro-14';

// RER lines
import { rerA } from './rer-a';
import { rerB } from './rer-b';
import { rerC } from './rer-c';
import { rerD } from './rer-d';
import { rerE } from './rer-e';

// Tram lines
import { tram1 } from './tram-1';
import { tram2 } from './tram-2';
import { tram3A } from './tram-3A';
import { tram3B } from './tram-3B';
import { tram4 } from './tram-4';
import { tram5 } from './tram-5';
import { tram6 } from './tram-6';
import { tram7 } from './tram-7';
import { tram8 } from './tram-8';
import { tram9 } from './tram-9';
import { tram10 } from './tram-10';
import { tram11 } from './tram-11';
import { tram12 } from './tram-12';
import { tram13 } from './tram-13';
import { tram14 } from './tram-14';

// Train lines
import { trainGL } from './train-gl';
import { trainH } from './train-h';
import { trainJ } from './train-j';
import { trainK } from './train-k';
import { trainL } from './train-l';
import { trainN } from './train-n';
import { trainP } from './train-p';
import { trainR } from './train-r';
import { trainU } from './train-u';
import { trainV } from './train-v';

// VAL lines
import { valCDG } from './val-cdg';
import { valOrly } from './val-orly';
import { funiculaire } from './val-fun';

// Import all line data here
const ALL_LINES: MetroLineData[] = [
  metroLine1, metroLine2, metroLine3, metroLine3bis, metroLine4, metroLine5, metroLine6, 
  metroLine7, metroLine7bis, metroLine8, metroLine9, metroLine10, metroLine11, metroLine12, metroLine13, metroLine14,
  rerA, rerB, rerC, rerD, rerE,
  tram1, tram2, tram3A, tram3B, tram4, tram5, tram6, tram7, tram8, tram9, tram10, tram11, tram12, tram13, tram14,
  trainGL, trainH, trainJ, trainK, trainL, trainN, trainP, trainR, trainU, trainV,
  valCDG, valOrly, funiculaire
];

/**
 * Convert line data to MetroStation format for compatibility
 */
function convertLineStationToMetroStation(lineData: MetroLineData, station: LineStation): MetroStation {
  return {
    id: `${lineData.line}-${station.order}`,
    gares_id: `${lineData.line}-${station.order}`,
    nom_long: station.name,
    nom_so_gar: station.shortName,
    line: lineData.line,
    lineColor: lineData.color,
    mode: lineData.mode as "METRO" | "RER" | "TRAIN" | "TRAMWAY" | "VAL",
    exploitant: lineData.mode === 'METRO' ? 'RATP' : 'SNCF',
    connections: station.connections,
    coordinates: station.coordinates,
    order: station.order // Add ordering information
  };
}

/**
 * Get all stations from line data files
 */
export function getStationsFromLineData(): MetroStation[] {
  const stations: MetroStation[] = [];
  
  ALL_LINES.forEach(lineData => {
    lineData.stations.forEach(station => {
      stations.push(convertLineStationToMetroStation(lineData, station));
    });
  });
  
  return stations;
}

/**
 * Get stations grouped by line with proper ordering
 */
export function getOrderedStationsByLine(): Record<string, MetroStation[]> {
  const stationsByLine: Record<string, MetroStation[]> = {};
  
  ALL_LINES.forEach(lineData => {
    const lineKey = `${lineData.mode} ${lineData.line}`;
    stationsByLine[lineKey] = lineData.stations
      .sort((a, b) => a.order - b.order)
      .map(station => convertLineStationToMetroStation(lineData, station));
  });
  
  return stationsByLine;
}
