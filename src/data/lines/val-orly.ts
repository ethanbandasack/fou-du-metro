import { MetroLineData } from './types';

export const valOrly: MetroLineData = {
  line: "ORL",
  mode: "VAL",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Antony",
      shortName: undefined,
      connections: ["B"],
      coordinates: { lat: 48.75484, lng: 2.29975 }
    },
    {
      order: 2,
      name: "Orly 4",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.72572, lng: 2.35929 }
    },
    {
      order: 3,
      name: "Orly 1-2-3",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.72625, lng: 2.36469 }
    }
  ]
};
