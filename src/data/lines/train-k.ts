import { MetroLineData } from './types';

export const trainK: MetroLineData = {
  line: "K",
  mode: "TRAIN",
  color: "#8B5A00",
  stations: [
    {
      order: 1,
      name: "Thieux-Nantouillet",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.00811401774286, lng: 2.6802524559732173 }
    },
    {
      order: 2,
      name: "Gare du Nord",
      shortName: undefined,
      connections: ["4", "5", "B", "D", "H"],
      coordinates: { lat: 48.88092200667149, lng: 2.356328543670162 }
    },
    {
      order: 3,
      name: "Ormoy-Villers",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.200877079101126, lng: 2.8381084780365518 }
    },
    {
      order: 4,
      name: "Dammartin-Juilly-Saint-Mard",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.03227911091459, lng: 2.6992222536256385 }
    },
    {
      order: 5,
      name: "Mitry-Claye",
      shortName: undefined,
      connections: ["B"],
      coordinates: { lat: 48.97585875402046, lng: 2.6424063023101896 }
    },
    {
      order: 6,
      name: "Crépy-en-Valois",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.23101806016452, lng: 2.887366704975862 }
    },
    {
      order: 7,
      name: "Compans",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.99139140287416, lng: 2.6650598693073007 }
    },
    {
      order: 8,
      name: "Aulnay-sous-Bois",
      shortName: undefined,
      connections: ["B", "T4"],
      coordinates: { lat: 48.93219600596196, lng: 2.495513142584314 }
    },
    {
      order: 9,
      name: "Nanteuil-le-Haudouin",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.14288419832468, lng: 2.79445455010732 }
    },
    {
      order: 10,
      name: "Le Plessis-Belleville",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 49.09612080982237, lng: 2.744686207442424 }
    }
  ]
};
