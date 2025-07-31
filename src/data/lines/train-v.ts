import { MetroLineData } from './types';

export const trainV: MetroLineData = {
  line: "V",
  mode: "TRAIN",
  color: "#8B5A00",
  stations: [
    {
      order: 1,
      name: "Vauboyen",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.75883616371208, lng: 2.193014615252485 }
    },
    {
      order: 2,
      name: "Jouy-en-Josas",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.764776012952915, lng: 2.163947085881832 }
    },
    {
      order: 3,
      name: "Petit-Jouy-les-Loges",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.77163431371264, lng: 2.1469727415128563 }
    },
    {
      order: 4,
      name: "Versailles-Chantiers",
      shortName: undefined,
      connections: ["N", "U"],
      coordinates: { lat: 48.795138179363484, lng: 2.135156224100022 }
    },
    {
      order: 5,
      name: "Massy-Palaiseau",
      shortName: undefined,
      connections: ["B", "C", "T12"],
      coordinates: { lat: 48.725997092058705, lng: 2.2583229936114426 }
    },
    {
      order: 6,
      name: "Igny",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.74085330015774, lng: 2.2308399305579862 }
    },
    {
      order: 7,
      name: "Bièvres",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.75102327511976, lng: 2.2158608573516494 }
    }
  ]
};
