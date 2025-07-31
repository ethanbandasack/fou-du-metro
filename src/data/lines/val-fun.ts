import { MetroLineData } from './types';

export const funiculaire: MetroLineData = {
  line: "FUN",
  mode: "VAL",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Funiculaire Montmartre Station Basse",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88468, lng: 2.33318 }
    },
    {
      order: 2,
      name: "Funiculaire Montmartre Station Haute",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88696, lng: 2.33428 }
    }
  ]
};
