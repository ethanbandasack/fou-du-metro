import { MetroLineData } from './types';

export const tram14: MetroLineData = {
  line: "T14",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Esbly",
      shortName: undefined,
      connections: ["P"],
      coordinates: { lat: 48.90307291510794, lng: 2.810248220730061 }
    },
    {
      order: 2,
      name: "Villiers-Montbarbin",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.863556144335746, lng: 2.882591322662619 }
    },
    {
      order: 3,
      name: "Couilly-Saint-Germain-Quincy",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88268104666968, lng: 2.8543159264638955 }
    },
    {
      order: 4,
      name: "Montry-Condé",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.89085679631404, lng: 2.826405497304068 }
    },
    {
      order: 5,
      name: "Crécy-la-Chapelle",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.8595573168744, lng: 2.9057369645485345 }
    }
  ]
};
