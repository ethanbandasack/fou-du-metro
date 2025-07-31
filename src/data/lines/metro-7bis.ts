import { MetroLineData } from './types';

export const metroLine7bis: MetroLineData = {
  line: "7b",
  mode: "METRO",
  color: "#87D3DF",
  stations: [
    {
      order: 1,
      name: "Louis Blanc",
      shortName: undefined,
      connections: ["7"],
      coordinates: { lat: 48.881192119070995, lng: 2.364378741179748 }
    },
    {
      order: 2,
      name: "Jaurès",
      shortName: undefined,
      connections: ["2", "5"],
      coordinates: { lat: 48.88246524557207, lng: 2.370157961739611 }
    },
    {
      order: 3,
      name: "Bolivar",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.880667463456206, lng: 2.374495966260425 }
    },
    {
      order: 4,
      name: "Buttes-Chaumont",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87851411402383, lng: 2.3816145119289653 }
    },
    {
      order: 5,
      name: "Botzaris",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87949310793359, lng: 2.3885668704791967 }
    },
    {
      order: 6,
      name: "Place des Fêtes",
      shortName: undefined,
      connections: ["11"],
      coordinates: { lat: 48.87694984811022, lng: 2.3929839648173936 }
    },
    {
      order: 7,
      name: "Pré Saint-Gervais",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.880271957029535, lng: 2.3984681722681724 }
    },
    {
      order: 8,
      name: "Danube",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88181610818685, lng: 2.394012398359364 }
    },
  ]
};
