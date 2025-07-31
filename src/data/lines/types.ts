export interface LineStation {
  order: number;
  name: string;
  shortName?: string;
  connections: string[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

// Alias for backward compatibility
export type MetroStationData = LineStation;

export interface MetroLineData {
  line: string;
  mode: string;
  color: string;
  stations: LineStation[];
}
