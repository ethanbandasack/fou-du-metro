import { MetroLineData } from './types';

export const tram5: MetroLineData = {
  line: "T5",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Lochères",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.97852462429191, lng: 2.385049192009275 }
    },
    {
      order: 2,
      name: "Garges-Sarcelles",
      shortName: undefined,
      connections: ["D"],
      coordinates: { lat: 48.9771607154856, lng: 2.39067488093308 }
    },
    {
      order: 3,
      name: "Les Cholettes",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.977493089975304, lng: 2.372242923708274 }
    },
    {
      order: 4,
      name: "Guynemer",
      shortName: "Stade Auguste Delaune",
      connections: [],
      coordinates: { lat: 48.948208127580116, lng: 2.35746152627313 }
    },
    {
      order: 5,
      name: "Suzanne Valadon",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95912109831728, lng: 2.3587425044757624 }
    },
    {
      order: 6,
      name: "Joncherolles",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.95557634800801, lng: 2.358322856150864 }
    },
    {
      order: 7,
      name: "Butte Pinson",
      shortName: "Parc Régional",
      connections: [],
      coordinates: { lat: 48.97359937603097, lng: 2.3660669758363624 }
    },
    {
      order: 8,
      name: "Baudelaire",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.94212545510683, lng: 2.356729741525478 }
    },
    {
      order: 9,
      name: "Petit Pierrefitte",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.952680187232, lng: 2.357983075325655 }
    },
    {
      order: 10,
      name: "Les Flanades",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.976665692351986, lng: 2.3774196746658713 }
    },
    {
      order: 11,
      name: "Paul Valéry",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.97927612626856, lng: 2.3802042543251356 }
    },
    {
      order: 12,
      name: "Roger Sémat",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.944818932672064, lng: 2.3570063564706416 }
    },
    {
      order: 13,
      name: "Jacques Prévert",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.97088340423818, lng: 2.366003889114339 }
    },
    {
      order: 14,
      name: "Marché de Saint-Denis",
      shortName: undefined,
      connections: ["T1"],
      coordinates: { lat: 48.93894788361666, lng: 2.356334439358093 }
    },
    {
      order: 15,
      name: "Alcide d'Orbigny",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.96562485801046, lng: 2.363302264997833 }
    },
    {
      order: 16,
      name: "Mairie de Pierrefitte",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.963502348377595, lng: 2.360213791734574 }
    }
  ]
};
