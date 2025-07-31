import { MetroLineData } from './types';

export const tram13: MetroLineData = {
  line: "T13",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Noisy-le-Roi",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.84130814686566, lng: 2.061451984613521 }
    },
    {
      order: 2,
      name: "Mareil-Marly",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.880991440750805, lng: 2.0791773946942684 }
    },
    {
      order: 3,
      name: "Saint-Nom La Bretèche - Forêt de Marly",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.8679501427926, lng: 2.0508259503050965 }
    },
    {
      order: 4,
      name: "Les Portes de Saint-Cyr",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.806616979366716, lng: 2.077227624843006 }
    },
    {
      order: 5,
      name: "Saint-Cyr",
      shortName: undefined,
      connections: ["C", "N", "U"],
      coordinates: { lat: 48.79900981083569, lng: 2.0747465772642184 }
    },
    {
      order: 6,
      name: "Allée Royale",
      shortName: "Château de Versailles",
      connections: [],
      coordinates: { lat: 48.81564572892323, lng: 2.0788334686892225 }
    },
    {
      order: 7,
      name: "Saint-Germain-en-Laye",
      shortName: "Château",
      connections: ["A"],
      coordinates: { lat: 48.90171349442861, lng: 2.0952137438353384 }
    },
    {
      order: 8,
      name: "Lisière Pereire",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.90320461545236, lng: 2.0729714565656736 }
    },
    {
      order: 9,
      name: "L'Etang - Les Sablons",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.872154106313744, lng: 2.0687099863177365 }
    },
    {
      order: 10,
      name: "Bailly",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.837052612045234, lng: 2.0744435747033823 }
    },
    {
      order: 11,
      name: "Camp des Loges",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.91391885076652, lng: 2.081675938422832 }
    },
    {
      order: 12,
      name: "Fourqueux - Bel Air",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.89473714937683, lng: 2.0699743067802774 }
    }
  ]
};
