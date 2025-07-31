import { MetroLineData } from './types';

export const tram12: MetroLineData = {
  line: "T12",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Parc du Château",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.66789284567248, lng: 2.3547385741448146 }
    },
    {
      order: 2,
      name: "Épinay-sur-Orge",
      shortName: undefined,
      connections: ["C"],
      coordinates: { lat: 48.67063926645666, lng: 2.335359426259652 }
    },
    {
      order: 3,
      name: "Bois Briard",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.622133794575866, lng: 2.415448100577441 }
    },
    {
      order: 4,
      name: "Chilly-Mazarin",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.70068080405286, lng: 2.307841187260169 }
    },
    {
      order: 5,
      name: "Bois de Saint-Eutrope",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.63395897487315, lng: 2.3953415083710685 }
    },
    {
      order: 6,
      name: "Ferme Neuve",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.652128692965135, lng: 2.3834023771622075 }
    },
    {
      order: 7,
      name: "Petit-Vaux",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.67638132516642, lng: 2.333249458612988 }
    },
    {
      order: 8,
      name: "Champlan",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.70854821544341, lng: 2.280123756150529 }
    },
    {
      order: 9,
      name: "Traité de Rome",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.625084210003685, lng: 2.4075767680639473 }
    },
    {
      order: 10,
      name: "Massy-Palaiseau",
      shortName: undefined,
      connections: ["B", "C", "V"],
      coordinates: { lat: 48.724729144431606, lng: 2.2575150045840386 }
    },
    {
      order: 11,
      name: "Gravigny-Balizy",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.68571362596709, lng: 2.317626404411973 }
    },
    {
      order: 12,
      name: "Amédée Gordini",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.65901888279668, lng: 2.3738506210934753 }
    },
    {
      order: 13,
      name: "Massy Europe",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.723433035455024, lng: 2.272637936363908 }
    },
    {
      order: 14,
      name: "Longjumeau",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.70223938711072, lng: 2.2945577492421245 }
    },
    {
      order: 15,
      name: "Évry - Courcouronnes",
      shortName: undefined,
      connections: ["D"],
      coordinates: { lat: 48.62468182599698, lng: 2.4275947804437275 }
    },
    {
      order: 16,
      name: "Coteaux de l'Orge",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.66531992340216, lng: 2.362618263949531 }
    }
  ]
};
