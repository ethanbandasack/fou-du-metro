import { MetroLineData } from './types';

export const tram11: MetroLineData = {
  line: "T11",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Épinay Villetaneuse",
      shortName: undefined,
      connections: ["H"],
      coordinates: { lat: 48.95900165546215, lng: 2.3283518828743333 }
    },
    {
      order: 2,
      name: "Stains La Cerisaie",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95473074848043, lng: 2.3917951396342727 }
    },
    {
      order: 3,
      name: "Pierrefitte Stains",
      shortName: undefined,
      connections: ["D"],
      coordinates: { lat: 48.96013454228842, lng: 2.3672565834726305 }
    },
    {
      order: 4,
      name: "Épinay-sur-Seine",
      shortName: undefined,
      connections: ["C", "T8"],
      coordinates: { lat: 48.95456256277917, lng: 2.302305082030494 }
    },
    {
      order: 5,
      name: "Dugny - La Courneuve",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.94393432566968, lng: 2.4111217548968242 }
    },
    {
      order: 6,
      name: "Villetaneuse - Université",
      shortName: undefined,
      connections: ["8"],
      coordinates: { lat: 48.96000579243069, lng: 2.3423685974925013 }
    },
    {
      order: 7,
      name: "Le Bourget",
      shortName: undefined,
      connections: ["B"],
      coordinates: { lat: 48.930287861801865, lng: 2.42338510679798 }
    }
  ]
};
