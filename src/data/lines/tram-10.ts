import { MetroLineData } from './types';

export const tram10: MetroLineData = {
  line: "T10",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Malabry",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76932378942164, lng: 2.2496529628620636 }
    },
    {
      order: 2,
      name: "Jardin Parisien",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.79007388694618, lng: 2.252720457075606 }
    },
    {
      order: 3,
      name: "Cité-Jardin",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76556476446966, lng: 2.259576114866507 }
    },
    {
      order: 4,
      name: "Le Hameau",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.78259287270798, lng: 2.253128058907652 }
    },
    {
      order: 5,
      name: "Hôpital Béclère",
      shortName: undefined,
      connections: ["T6"],
      coordinates: { lat: 48.78721089683679, lng: 2.253169144661627 }
    },
    {
      order: 6,
      name: "Les Peintres",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76472017954991, lng: 2.2658848665512106 }
    },
    {
      order: 7,
      name: "Petit-Châtenay",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76272627164296, lng: 2.2806978452723565 }
    },
    {
      order: 8,
      name: "Théâtre La Piscine",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76379364593003, lng: 2.272752403278821 }
    },
    {
      order: 9,
      name: "La Croix de Berny",
      shortName: "Parc de Sceaux",
      connections: [],
      coordinates: { lat: 48.762970470491084, lng: 2.3047519014655244 }
    },
    {
      order: 10,
      name: "Vallée aux Loups",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.766383427717415, lng: 2.25488776388709 }
    },
    {
      order: 11,
      name: "Parc des Sports",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.77983639446138, lng: 2.2518931566215312 }
    },
    {
      order: 12,
      name: "Noveos",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.77669474104493, lng: 2.250026069266826 }
    },
    {
      order: 13,
      name: "LaVallée",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.76142385263188, lng: 2.290444727862659 }
    }
  ]
};
