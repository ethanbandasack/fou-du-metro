import { MetroLineData } from './types';

export const tram3B: MetroLineData = {
  line: "T3B",
  mode: "TRAMWAY",
  color: "#0080C7",
  stations: [
    {
      order: 1,
      name: "Canal Saint-Denis",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.89873399065294, lng: 2.380537035488634 }
    },
    {
      order: 2,
      name: "Anny Flore",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88115461321984, lng: 2.2855056217327667 }
    },
    {
      order: 3,
      name: "Ella Fitzgerald",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.89742996177998, lng: 2.394968407167715 }
    },
    {
      order: 4,
      name: "Porte de Clichy",
      shortName: undefined,
      connections: ["13", "14", "C"],
      coordinates: { lat: 48.8946243340091, lng: 2.3142338462894254 }
    },
    {
      order: 5,
      name: "Porte de la Chapelle",
      shortName: undefined,
      connections: ["12"],
      coordinates: { lat: 48.898392125677425, lng: 2.3583754693257846 }
    },
    {
      order: 6,
      name: "Porte de Bagnolet",
      shortName: undefined,
      connections: ["3"],
      coordinates: { lat: 48.86343374196473, lng: 2.4088324651439725 }
    },
    {
      order: 7,
      name: "Porte de Pantin",
      shortName: "Parc de la Villette",
      connections: ["5"],
      coordinates: { lat: 48.889007649506944, lng: 2.3956810747116024 }
    },
    {
      order: 8,
      name: "Porte Maillot",
      shortName: undefined,
      connections: ["1", "E"],
      coordinates: { lat: 48.87793813782425, lng: 2.283913993903496 }
    },
    {
      order: 9,
      name: "Butte du Chapeau Rouge",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88501678919352, lng: 2.3967512888038973 }
    },
    {
      order: 10,
      name: "Porte de Champerret​",
      shortName: undefined,
      connections: ["3"],
      coordinates: { lat: 48.88597054515737, lng: 2.2921354803495397 }
    },
    {
      order: 11,
      name: "Porte de la Villette",
      shortName: "Cité des Sciences et de l’Industrie",
      connections: ["7"],
      coordinates: { lat: 48.8974287355787, lng: 2.3865814331137196 }
    },
    {
      order: 12,
      name: "Porte de Clignancourt",
      shortName: undefined,
      connections: ["4"],
      coordinates: { lat: 48.898041450337814, lng: 2.3450784496454857 }
    },
    {
      order: 13,
      name: "Porte de Saint-Ouen",
      shortName: undefined,
      connections: ["13"],
      coordinates: { lat: 48.89767181948477, lng: 2.3298303344938858 }
    },
    {
      order: 14,
      name: "Marie de Miribel",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.85870401022034, lng: 2.409685685604103 }
    },
    {
      order: 15,
      name: "Hôpital Robert Debré",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87945550325808, lng: 2.4012336448556546 }
    },
    {
      order: 16,
      name: "Thérèse Pierre",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88342328560661, lng: 2.2880331154619915 }
    },
    {
      order: 17,
      name: "Angélique Compoint",
      shortName: "Porte de Montmartre",
      connections: [],
      coordinates: { lat: 48.89783032629845, lng: 2.3382304271335834 }
    },
    {
      order: 18,
      name: "Anna de Noailles​",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.87456815028877, lng: 2.278256505242517 }
    },
    {
      order: 19,
      name: "Séverine",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.867521357214756, lng: 2.4089789397445087 }
    },
    {
      order: 20,
      name: "Porte Dauphine",
      shortName: "Avenue Foch",
      connections: ["2"],
      coordinates: { lat: 48.870180418141544, lng: 2.274627543314604 }
    },
    {
      order: 21,
      name: "Porte de Vincennes",
      shortName: undefined,
      connections: ["1", "T3A"],
      coordinates: { lat: 48.847393890496086, lng: 2.40965605640417 }
    },
    {
      order: 22,
      name: "Delphine Seyrig",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.893880282529935, lng: 2.3977388506469794 }
    },
    {
      order: 23,
      name: "Square Sainte-Odile",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.88737589044046, lng: 2.296965185039929 }
    },
    {
      order: 24,
      name: "Rosa Parks",
      shortName: undefined,
      connections: ["E"],
      coordinates: { lat: 48.897552809900425, lng: 2.3733837959986004 }
    },
    {
      order: 25,
      name: "Porte de Montreuil",
      shortName: undefined,
      connections: ["9"],
      coordinates: { lat: 48.85298727790375, lng: 2.4107411361264375 }
    },
    {
      order: 26,
      name: "Diane Arbus",
      shortName: "Porte des Poissoniers",
      connections: [],
      coordinates: { lat: 48.898329104399316, lng: 2.3517120717216238 }
    },
    {
      order: 27,
      name: "Épinettes - Pouchet",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.89754933179902, lng: 2.3249055851394216 }
    },
    {
      order: 28,
      name: "Adrienne Bolland",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.872097029931695, lng: 2.40862005517699 }
    },
    {
      order: 29,
      name: "Colette Besson",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.898491101556885, lng: 2.3636513821811374 }
    },
    {
      order: 30,
      name: "Honoré de Balzac",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.8963084706968, lng: 2.318804401344239 }
    },
    {
      order: 31,
      name: "Porte d'Aubervilliers",
      shortName: undefined,
      connections: [],
      coordinates: { lat: 48.898601172178374, lng: 2.3690369493169228 }
    },
    {
      order: 32,
      name: "Porte des Lilas",
      shortName: undefined,
      connections: ["11", "3bis"],
      coordinates: { lat: 48.87663081498978, lng: 2.406999582693831 }
    },
    {
      order: 33,
      name: "Porte d'Asnières",
      shortName: "Marguerite Long",
      connections: [],
      coordinates: { lat: 48.88973995110524, lng: 2.3032760496929354 }
    }
  ]
};
