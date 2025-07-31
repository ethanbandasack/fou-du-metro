import { MetroLineData } from './types';

export const valCDG: MetroLineData = {
  line: "CDG",
  mode: "VAL",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Parc PX",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.01042, lng: 2.57034 }
    },
    {
      order: 2,
      name: "Terminal 2 - Gare TGV",
      shortName: undefined,
      connections: ["B"],
      coordinates: { lat: 49.00468, lng: 2.57077 }
    },
    {
      order: 3,
      name: "Terminal 1",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.01286, lng: 2.55513 }
    },
    {
      order: 4,
      name: "Parc PR",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.01042, lng: 2.57034 }
    },
    {
      order: 5,
      name: "Terminal 3 - Roissypole",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.00468, lng: 2.57077 }
    }
  ]
};
