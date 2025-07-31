import { MetroLineData } from './types';

export const tram8: MetroLineData = {
  line: "T8",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Les Mobiles",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.94993773565708, lng: 2.328832171353944 }
    },
    {
      order: 2,
      name: "Pablo Neruda",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.956671846031206, lng: 2.3431092357253798 }
    },
    {
      order: 3,
      name: "Saint-Denis - Porte de Paris",
      shortName: undefined,
      connections: ["13"],
      coordinates: { lat: 48.92981642738063, lng: 2.3572920708824574 }
    },
    {
      order: 4,
      name: "Gilbert Bonnemaison",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95543742610714, lng: 2.30787256835423 }
    },
    {
      order: 5,
      name: "Lacépède",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95587687488742, lng: 2.3115263086926325 }
    },
    {
      order: 6,
      name: "Saint-Denis",
      shortName: undefined,
      connections: ["D", "H", "T1"],
      coordinates: { lat: 48.93526614581904, lng: 2.3478624077555326 }
    },
    {
      order: 7,
      name: "Les Béatus",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.9515983836568, lng: 2.3207554481259183 }
    },
    {
      order: 8,
      name: "Paul Éluard",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.93968870865854, lng: 2.345207505927952 }
    },
    {
      order: 9,
      name: "Épinay-Orgemont",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95550447711861, lng: 2.295591694903069 }
    },
    {
      order: 10,
      name: "Blumenthal",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.94780764959913, lng: 2.339180923415564 }
    },
    {
      order: 11,
      name: "César",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.949581345117245, lng: 2.342521826040313 }
    },
    {
      order: 12,
      name: "Rose Bertin",
      shortName: "Centre Commercial l’Ilo",
      connections: [],
      coordinates: { lat: 48.953168246764456, lng: 2.3154036121121684 }
    },
    {
      order: 13,
      name: "Villetaneuse-Université",
      shortName: undefined,
      connections: ["11"],
      coordinates: { lat: 48.95931814416915, lng: 2.3420538013870744 }
    },
    {
      order: 14,
      name: "Pierre De Geyter",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.93205182271299, lng: 2.352701984386339 }
    },
    {
      order: 15,
      name: "Épinay-sur-Seine",
      shortName: undefined,
      connections: ["C", "T11"],
      coordinates: { lat: 48.95582939392718, lng: 2.3019910195900777 }
    },
    {
      order: 16,
      name: "Delaunay-Belleville",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.94555553922784, lng: 2.3473129251675138 }
    },
    {
      order: 17,
      name: "Jean Vilar",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.952726329897715, lng: 2.3434612795268257 }
    }
  ]
};
