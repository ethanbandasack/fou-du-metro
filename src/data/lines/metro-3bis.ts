import { MetroLineData } from './types';

export const metroLine3bis: MetroLineData = {
  line: "3bis",
  mode: "METRO",
  color: "#87D3DF",
  stations: [
    {
      order: 1,
      name: "Gambetta",
      shortName: undefined,
      connections: ["3"],
      coordinates: { lat: 48.86516343488149, lng: 2.3987465934425916 }
    },
    {
      order: 2,
      name: "Pelleport",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.86844016327547, lng: 2.401561712742542 }
    },
    {
      order: 3,
      name: "Saint-Fargeau",
      shortName: undefined,
      connections: ["D"],
      coordinates: { lat: 48.87210144213156, lng: 2.4045149423791043 }
    },
    {
      order: 4,
      name: "Porte des Lilas",
      shortName: undefined,
      connections: ["11", "T3B"],
      coordinates: { lat: 48.87711051176337, lng: 2.40672924554309 }
    },
  ]
};
