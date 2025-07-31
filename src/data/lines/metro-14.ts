import { MetroLineData } from './types';

export const metroLine14: MetroLineData = {
  line: "14",
  mode: "METRO",
  color: "#6E2C7F",
  stations: [
    {
      order: 1,
      name: "Saint-Denis – Pleyel",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.91746894101899, lng: 2.3465446215359846 }
    },
    {
      order: 2,
      name: "Mairie de Saint-Ouen",
      shortName: "Région Île-de-France",
      connections: ["13"],
      coordinates: { lat: 48.91320209515785, lng: 2.334663150119759 }
    },
    {
      order: 3,
      name: "Saint-Ouen",
      shortName: undefined,
      connections: ["C"],
      coordinates: { lat: 48.904496420574624, lng: 2.321743589558779 }
    },
    {
      order: 4,
      name: "Porte de Clichy",
      shortName: "Tribunal de Paris",
      connections: ["13", "C", "T3B"],
      coordinates: { lat: 48.89498081072532, lng: 2.312791961501292 }
    },
    {
      order: 5,
      name: "Pont Cardinet",
      shortName: undefined,
      connections: ["L"],
      coordinates: { lat: 48.88956082831538, lng: 2.3151768973047844 }
    },
    {
      order: 6,
      name: "Saint-Lazare",
      shortName: undefined,
      connections: ["12", "13", "3", "J", "L"],
      coordinates: { lat: 48.87571908982334, lng: 2.324224580938853 }
    },
    {
      order: 7,
      name: "Madeleine",
      shortName: undefined,
      connections: ["12", "8"],
      coordinates: { lat: 48.87066702089795, lng: 2.3257526352867255 }
    },
    {
      order: 8,
      name: "Pyramides",
      shortName: undefined,
      connections: ["7"],
      coordinates: { lat: 48.86590673959417, lng: 2.3341895419682497 }
    },
    {
      order: 9,
      name: "Châtelet",
      shortName: undefined,
      connections: ["1", "11", "4", "7"],
      coordinates: { lat: 48.859589655582816, lng: 2.346478183587595 }
    },
    {
      order: 10,
      name: "Gare de Lyon",
      shortName: undefined,
      connections: ["1", "A", "D", "R"],
      coordinates: { lat: 48.843486761806766, lng: 2.3739225903167545 }
    },
    {
      order: 11,
      name: "Bercy",
      shortName: undefined,
      connections: ["6"],
      coordinates: { lat: 48.840001388648794, lng: 2.3795540112141405 }
    },
    {
      order: 12,
      name: "Cour Saint-Émilion",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.83333855925167, lng: 2.386632402066985 }
    },
    {
      order: 13,
      name: "Bibliothèque François Mitterrand",
      shortName: undefined,
      connections: ["C"],
      coordinates: { lat: 48.829990199899186, lng: 2.375747983215603 }
    },
    {
      order: 14,
      name: "Olympiades",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.82727083601133, lng: 2.3680326484142777 }
    },
    {
      order: 15,
      name: "Maison Blanche",
      shortName: undefined,
      connections: ["7"],
      coordinates: { lat: 48.82142042957708, lng: 2.3590551543843183 }
    },
    {
      order: 16,
      name: "Hôpital Bicêtre",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.80981003194872, lng: 2.349750100298353 }
    },
    {
      order: 17,
      name: "Villejuif – Gustave Roussy",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.80981003194872, lng: 2.349750100298353 }
    },
    {
      order: 18,
      name: "L'Haÿ-les-Roses",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.77531361288962, lng: 2.3543649431994953 }
    },
    {
      order: 19,
      name: "Chevilly-Larue",
      shortName: "Marché International",
      connections: ["14", "T7"],
      coordinates: { lat: 48.75955015404931, lng: 2.366485372253663 }
    },
    {
      order: 20,
      name: "Thiais - Orly",
      shortName: "Pont de Rungis",
      connections: [],
      coordinates: { lat: 48.746978700693774, lng: 2.372839696785623 }
    },
    {
      order: 21,
      name: "Aéroport d'Orly",
      shortName: undefined,
      connections: ["T7"],
      coordinates: { lat: 48.7280833904763, lng: 2.3625914696897388 }
    }
  ]
};
