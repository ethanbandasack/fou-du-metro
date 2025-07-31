import { MetroLineData } from './types';

export const trainU: MetroLineData = {
  line: "U",
  mode: "TRAIN",
  color: "#8B5A00",
  stations: [
    {
      order: 1,
      name: "Trappes",
      shortName: undefined,
      connections: ["N"],
      coordinates: { lat: 48.77480280977952, lng: 2.006566869057666 }
    },
    {
      order: 2,
      name: "Chaville Rive Droite",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.81257171717767, lng: 2.188259860000294 }
    },
    {
      order: 3,
      name: "Sèvres-Ville-d'Avray",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.827238775409505, lng: 2.200721257947835 }
    },
    {
      order: 4,
      name: "Saint-Cloud",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.84610294864102, lng: 2.217621080890434 }
    },
    {
      order: 5,
      name: "La Verrière",
      shortName: undefined,
      connections: ["N"],
      coordinates: { lat: 48.75518504199213, lng: 1.9430499444004303 }
    },
    {
      order: 6,
      name: "Suresnes-Mont-Valérien",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.87171419115657, lng: 2.2210295504311297 }
    },
    {
      order: 7,
      name: "La Défense",
      shortName: "Grande Arche",
      connections: ["1", "A", "E", "L", "T2"],
      coordinates: { lat: 48.89218707644951, lng: 2.237018056395014 }
    },
    {
      order: 8,
      name: "Saint-Cyr",
      shortName: undefined,
      connections: ["C", "N", "T13"],
      coordinates: { lat: 48.79870763528835, lng: 2.0718470059294014 }
    },
    {
      order: 9,
      name: "Puteaux",
      shortName: undefined,
      connections: ["L", "T2"],
      coordinates: { lat: 48.88338381382527, lng: 2.233691920150409 }
    },
    {
      order: 10,
      name: "Saint-Quentin-en-Yvelines",
      shortName: undefined,
      connections: ["C", "N"],
      coordinates: { lat: 48.787390238291614, lng: 2.044621988534177 }
    },
    {
      order: 11,
      name: "Versailles-Chantiers",
      shortName: undefined,
      connections: ["N", "V"],
      coordinates: { lat: 48.795138179363484, lng: 2.135156224100022 }
    }
  ]
};
