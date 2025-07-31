import { MetroLineData } from './types';

export const metroLine1: MetroLineData = {
  line: "1",
  mode: "METRO",
  color: "#FFCD00",
  stations: [
    {
      order: 1,
      name: "La Défense",
      shortName: "Grande Arche",
      connections: ["A", "E", "L", "T2", "U"],
      coordinates: { lat: 48.89218707644951, lng: 2.237018056395014 }
    },
    {
      order: 2,
      name: "Esplanade de la Défense",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88813847761218, lng: 2.2497927690097654 }
    },
    {
      order: 3,
      name: "Pont de Neuilly",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88470820133096, lng: 2.260515079251701 }
    },
    {
      order: 4,
      name: "Les Sablons",
      shortName: "Jardin d'Acclimatation",
      connections: [],
      coordinates: { lat: 48.88101649749112, lng: 2.272238940611057 }
    },
    {
      order: 5,
      name: "Porte Maillot",
      shortName: "Palais des Congrès",
      connections: ["E", "T3B"],
      coordinates: { lat: 48.87755125180425, lng: 2.2831622422302296 }
    },
    {
      order: 6,
      name: "Argentine",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87533684211653, lng: 2.2901275088247015 }
    },
    {
      order: 7,
      name: "Charles de Gaulle - Étoile",
      shortName: undefined,
      connections: ["2", "6", "A"],
      coordinates: { lat: 48.87514981972761, lng: 2.295904904713175 }
    },
    {
      order: 8,
      name: "George V",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87255999031847, lng: 2.300698113709449 }
    },
    {
      order: 9,
      name: "Franklin D. Roosevelt",
      shortName: undefined,
      connections: ["9"],
      coordinates: { lat: 48.87034534615471, lng: 2.308868827138999 }
    },
    {
      order: 10,
      name: "Champs-Élysées – Clémenceau",
      shortName: undefined,
      connections: ["13"],
      coordinates: { lat: 48.86777088072031, lng: 2.314814119140639 }
    },
    {
      order: 11,
      name: "Concorde",
      shortName: undefined,
      connections: ["12", "8"],
      coordinates: { lat: 48.86555649127031, lng: 2.3211819344142244 }
    },
    {
      order: 12,
      name: "Tuileries",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.86434377873392, lng: 2.330129877112862 }
    },
    {
      order: 13,
      name: "Palais Royal - Musée du Louvre",
      shortName: undefined,
      connections: ["7"],
      coordinates: { lat: 48.86199756825301, lng: 2.337100455969654 }
    },
    {
      order: 14,
      name: "Louvre-Rivoli",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.860525123084556, lng: 2.341746969804264 }
    },
    {
      order: 15,
      name: "Châtelet",
      shortName: undefined,
      connections: ["11", "14", "4", "7"],
      coordinates: { lat: 48.859287325170946, lng: 2.345803056189527 }
    },
    {
      order: 16,
      name: "Hôtel de Ville",
      shortName: undefined,
      connections: ["11"],
      coordinates: { lat: 48.857477982529346, lng: 2.3515775629949967 }
    },
    {
      order: 17,
      name: "Saint-Paul",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.85558481736351, lng: 2.361177041739386 }
    },
    {
      order: 18,
      name: "Bastille",
      shortName: undefined,
      connections: ["5", "8"],
      coordinates: { lat: 48.852009030520556, lng: 2.36867458439179 }
    },
    {
      order: 19,
      name: "Gare de Lyon",
      shortName: undefined,
      connections: ["14", "A", "D", "R"],
      coordinates: { lat: 48.84586897868619, lng: 2.373774422563834 }
    },
    {
      order: 20,
      name: "Reuilly - Diderot",
      shortName: undefined,
      connections: ["8"],
      coordinates: { lat: 48.84672652050801, lng: 2.3861953966156063 }
    },
    {
      order: 21,
      name: "Nation",
      shortName: undefined,
      connections: ["2", "6", "9", "A"],
      coordinates: { lat: 48.847579367477074, lng: 2.3955545121706874 }
    },
    {
      order: 22,
      name: "Porte de Vincennes",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.847252745036024, lng: 2.411101488088493 }
    },
    {
      order: 23,
      name: "Saint-Mandé",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.84588100924002, lng: 2.4191652734458124 }
    },
    {
      order: 24,
      name: "Bérault",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.845178095414104, lng: 2.4283069059169633 }
    },
    {
      order: 25,
      name: "Château de Vincennes",
      shortName: undefined,
      connections: ["A"],
      coordinates: { lat: 48.84458024298627, lng: 2.4359869071850594 }
    }
  ]
};
