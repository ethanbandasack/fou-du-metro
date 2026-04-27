import { EnrichedStation } from '@/types/metro';

// Official RATP/IDFM Color Palette
const COLORS = {
  ROUGE_COQUELICOT: { bg: "#E3051C", text: "#FFFFFF" },
  ORANGE: { bg: "#F28E42", text: "#000000" },
  JAUNE_VIF: { bg: "#FFCE00", text: "#000000" },
  JAUNE_OCRE: { bg: "#E3B32A", text: "#000000" },
  MARRON: { bg: "#8D5E2A", text: "#FFFFFF" },
  OLIVE_CLAIR: { bg: "#D5C900", text: "#000000" },
  OLIVE_FONCE: { bg: "#9F9825", text: "#FFFFFF" },
  VERT_FONCE: { bg: "#00814F", text: "#FFFFFF" },
  VERT_CLAIR: { bg: "#83C491", text: "#000000" },
  TURQUOISE: { bg: "#00A88F", text: "#FFFFFF" },
  BLEU_CLAIR: { bg: "#98D4E2", text: "#000000" },
  BLEU_OUTREMER: { bg: "#5291CE", text: "#FFFFFF" },
  BLEU_FONCE: { bg: "#0064B0", text: "#FFFFFF" },
  VIOLET: { bg: "#662483", text: "#FFFFFF" },
  MAGENTA: { bg: "#C04191", text: "#FFFFFF" },
  LILAS: { bg: "#CEADD2", text: "#000000" },
  ROSE: { bg: "#F3A4BA", text: "#000000" },
  ROUGE_FRAMBOISE: { bg: "#B90845", text: "#FFFFFF" },
  BLEU_NUIT: { bg: "#003264", text: "#FFFFFF" },
};

// Map of line identifiers to their official colors
export const LINE_COLORS: Record<string, string> = {
  // Métro
  "1": COLORS.JAUNE_VIF.bg,
  "2": COLORS.BLEU_FONCE.bg,
  "3": COLORS.OLIVE_FONCE.bg,
  "3bis": COLORS.BLEU_CLAIR.bg,
  "3B": COLORS.BLEU_CLAIR.bg,
  "4": COLORS.MAGENTA.bg,
  "5": COLORS.ORANGE.bg,
  "6": COLORS.VERT_CLAIR.bg,
  "7": COLORS.ROSE.bg,
  "7bis": COLORS.VERT_CLAIR.bg,
  "7B": COLORS.VERT_CLAIR.bg,
  "8": COLORS.LILAS.bg,
  "9": COLORS.OLIVE_CLAIR.bg,
  "10": COLORS.JAUNE_OCRE.bg,
  "11": COLORS.MARRON.bg,
  "12": COLORS.VERT_FONCE.bg,
  "13": COLORS.BLEU_CLAIR.bg,
  "14": COLORS.VIOLET.bg,
  "15": COLORS.ROUGE_FRAMBOISE.bg,
  "16": COLORS.ROSE.bg,
  "17": COLORS.OLIVE_CLAIR.bg,
  "18": COLORS.TURQUOISE.bg,

  // RER
  "A": COLORS.ROUGE_COQUELICOT.bg,
  "B": COLORS.BLEU_OUTREMER.bg,
  "C": COLORS.JAUNE_VIF.bg,
  "D": COLORS.VERT_FONCE.bg,
  "E": COLORS.MAGENTA.bg,

  // Tramway
  "T1": COLORS.BLEU_FONCE.bg,
  "T2": COLORS.MAGENTA.bg,
  "T3a": COLORS.ORANGE.bg,
  "T3b": COLORS.VERT_FONCE.bg,
  "T4": COLORS.JAUNE_OCRE.bg,
  "T5": COLORS.VIOLET.bg,
  "T6": COLORS.ROUGE_COQUELICOT.bg,
  "T7": COLORS.MARRON.bg,
  "T8": COLORS.OLIVE_FONCE.bg,
  "T9": COLORS.BLEU_OUTREMER.bg,
  "T10": COLORS.OLIVE_FONCE.bg,
  "T11": COLORS.ORANGE.bg,
  "T12": COLORS.ROUGE_FRAMBOISE.bg,
  "T13": COLORS.MARRON.bg,
  "T14": COLORS.TURQUOISE.bg,

  // Transilien
  "H": COLORS.MARRON.bg,
  "J": COLORS.OLIVE_CLAIR.bg,
  "K": COLORS.OLIVE_FONCE.bg,
  "L": COLORS.LILAS.bg,
  "N": COLORS.TURQUOISE.bg,
  "P": COLORS.ORANGE.bg,
  "R": COLORS.ROSE.bg,
  "U": COLORS.ROUGE_FRAMBOISE.bg,
  "V": COLORS.OLIVE_FONCE.bg,

  // Cable
  "C1": COLORS.BLEU_OUTREMER.bg,
};

export const LINE_TEXT_COLORS: Record<string, string> = {
  // Métro
  "1": COLORS.JAUNE_VIF.text,
  "2": COLORS.BLEU_FONCE.text,
  "3": COLORS.OLIVE_FONCE.text,
  "3bis": COLORS.BLEU_CLAIR.text,
  "3B": COLORS.BLEU_CLAIR.text,
  "4": COLORS.MAGENTA.text,
  "5": COLORS.ORANGE.text,
  "6": COLORS.VERT_CLAIR.text,
  "7": COLORS.ROSE.text,
  "7bis": COLORS.VERT_CLAIR.text,
  "7B": COLORS.VERT_CLAIR.text,
  "8": COLORS.LILAS.text,
  "9": COLORS.OLIVE_CLAIR.text,
  "10": COLORS.JAUNE_OCRE.text,
  "11": COLORS.MARRON.text,
  "12": COLORS.VERT_FONCE.text,
  "13": COLORS.BLEU_CLAIR.text,
  "14": COLORS.VIOLET.text,
  "15": COLORS.ROUGE_FRAMBOISE.text,
  "16": COLORS.ROSE.text,
  "17": COLORS.OLIVE_CLAIR.text,
  "18": COLORS.TURQUOISE.text,

  // RER
  "A": COLORS.ROUGE_COQUELICOT.text,
  "B": COLORS.BLEU_OUTREMER.text,
  "C": COLORS.JAUNE_VIF.text,
  "D": COLORS.VERT_FONCE.text,
  "E": COLORS.MAGENTA.text,

  // Tramway
  "T1": COLORS.BLEU_FONCE.text,
  "T2": COLORS.MAGENTA.text,
  "T3a": COLORS.ORANGE.text,
  "T3b": COLORS.VERT_FONCE.text,
  "T4": COLORS.JAUNE_OCRE.text,
  "T5": COLORS.VIOLET.text,
  "T6": COLORS.ROUGE_COQUELICOT.text,
  "T7": COLORS.MARRON.text,
  "T8": COLORS.OLIVE_FONCE.text,
  "T9": COLORS.BLEU_OUTREMER.text,
  "T10": COLORS.OLIVE_FONCE.text,
  "T11": COLORS.ORANGE.text,
  "T12": COLORS.ROUGE_FRAMBOISE.text,
  "T13": COLORS.MARRON.text,
  "T14": COLORS.TURQUOISE.text,

  // Transilien
  "H": COLORS.MARRON.text,
  "J": COLORS.OLIVE_CLAIR.text,
  "K": COLORS.OLIVE_FONCE.text,
  "L": COLORS.LILAS.text,
  "N": COLORS.TURQUOISE.text,
  "P": COLORS.ORANGE.text,
  "R": COLORS.ROSE.text,
  "U": COLORS.ROUGE_FRAMBOISE.text,
  "V": COLORS.OLIVE_FONCE.text,

  // Cable
  "C1": COLORS.BLEU_OUTREMER.text,
};

export interface Category {
  type: string;
  id: string;
  name: string;
  filter: (s: EnrichedStation) => boolean;
  color?: string;
  textColor?: string;
  isRandom?: boolean;
  includedItems?: string[];
}

export const MetaCategories: Record<string, string> = {
  'line': 'Lignes de Métro',
  'groups': 'Groupes de Lignes',
  'geo': 'Géographie (Paris/Banlieue)',
  'arr_single': 'Arrondissement (Unique)',
  'arr_group': 'Groupes d\'Arrondissements',
  'connect': 'Connectivité',
  'special': 'Spécial (Histoire, Couleurs)',
  'names': 'Noms & Lettres'
};

export function getAvailableCategories(allStations: EnrichedStation[]): Record<string, Category[]> {
  const categories: Record<string, Category[]> = { 
    line: [], groups: [], geo: [], arr_single: [], arr_group: [], connect: [], special: [], names: [] 
  };
  
  const isRer = (l: string) => ['A', 'B', 'C', 'D', 'E'].includes(l.toUpperCase());
  const isMetro = (l: string) => /^\d+(bis|B)?$/i.test(l);

  // Metro Lines
  const metroSet = new Set<string>();
  allStations.forEach(s => s.lines.forEach(l => { if (isMetro(l)) metroSet.add(l); }));

  categories.line = Array.from(metroSet).sort((a, b) => {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
  }).map(l => ({
    type: 'line', id: `line-${l}`, name: `Métro ${l}`, filter: (s: EnrichedStation) => s.lines.includes(l), color: LINE_COLORS[l] || '#000', textColor: LINE_TEXT_COLORS[l] || '#FFF'
  }));

  // Groups
  const lineGroups: Record<string, string[]> = {
    "Automatiques": ["1", "4", "14"],
    "Jaunes": ["1", "10"],
    "Bleues": ["2", "3bis", "13"],
    "Violettes": ["4", "7", "8", "14"],
    "Vertes": ["3", "7bis", "9", "12"],
    "Nord-Sud": ["12", "13", "4"],
    "Est-Ouest": ["1", "3"],
    "Périphériques": ["2", "6"],
    "Lignes bis": ["3bis", "7bis"],
    "Groupe Personnalisé": []
  };
  categories.groups = Object.entries(lineGroups).map(([name, lines]) => ({
    type: 'groups', id: `group-${name.toLowerCase().replace(/ /g, '-')}`, name: name,
    filter: (s: EnrichedStation) => s.lines.some(l => lines.includes(l)), color: '#333', textColor: '#FFF',
    includedItems: lines
  }));

  // Connectivité
  categories.connect = [
    { type: 'connect', id: 'c1', name: 'Sur une seule ligne', filter: (s: EnrichedStation) => s.lines.filter(l => !isRer(l)).length === 1, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'c2', name: 'Sur exactement 2 lignes', filter: (s: EnrichedStation) => s.lines.filter(l => !isRer(l)).length === 2, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'c3', name: 'Sur 3+ lignes', filter: (s: EnrichedStation) => s.lines.length >= 3, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'has-rer', name: 'Correspondance RER', filter: (s: EnrichedStation) => s.has_rer, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'has-tram', name: 'Correspondance Tramway', filter: (s: EnrichedStation) => s.has_tram, color: '#333', textColor: '#FFF' }
  ];

  // Geography
  categories.geo = [
    { type: 'geo', id: 'intra', name: 'Paris Intra-muros', filter: (s: EnrichedStation) => s.arrondissement >= 1 && s.arrondissement <= 20, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'extra', name: 'Banlieue', filter: (s: EnrichedStation) => s.arrondissement > 20, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'rg', name: 'Rive Gauche', filter: (s: EnrichedStation) => s.rive_gauche, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'rd', name: 'Rive Droite', filter: (s: EnrichedStation) => !s.rive_gauche && s.arrondissement >= 1 && s.arrondissement <= 20 && s.nom !== 'Cité', color: '#333', textColor: '#FFF' }
  ];

  // Arrondissements
  for (let i = 1; i <= 20; i++) {
    categories.arr_single.push({ type: 'arr_single', id: `arr-${i}`, name: `Arrondissement ${i}`, filter: (s: EnrichedStation) => s.arrondissement === i, color: '#333', textColor: '#FFF' });
  }
  categories.arr_group.push({ type: 'arr_group', id: 'arr-group-1-9', name: 'Arrondissements 1-9', filter: (s: EnrichedStation) => s.arrondissement >= 1 && s.arrondissement <= 9, color: '#333', textColor: '#FFF', includedItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-group-10-20', name: 'Arrondissements 10-20', filter: (s: EnrichedStation) => s.arrondissement >= 10 && s.arrondissement <= 20, color: '#333', textColor: '#FFF', includedItems: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-pair', name: 'Arrondissement Pair', filter: (s: EnrichedStation) => s.arrondissement > 0 && s.arrondissement <= 20 && s.arrondissement % 2 === 0, color: '#333', textColor: '#FFF', includedItems: ['2', '4', '6', '8', '10', '12', '14', '16', '18', '20'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-impair', name: 'Arrondissement Impair', filter: (s: EnrichedStation) => s.arrondissement > 0 && s.arrondissement <= 20 && s.arrondissement % 2 !== 0, color: '#333', textColor: '#FFF', includedItems: ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-custom', name: 'Groupe personnalisé', filter: (s: EnrichedStation) => false, color: '#333', textColor: '#FFF' });

  // Special
  categories.special = [
    { type: 'special', id: 'hist', name: 'Figure Historique', filter: (s: EnrichedStation) => s.figure_historique, color: '#333', textColor: '#FFF' },
    { type: 'special', id: 'color', name: 'Nom avec une couleur', filter: (s: EnrichedStation) => s.couleur, color: '#333', textColor: '#FFF' },
    { type: 'special', id: 'modern', name: 'Ouverte après 1980', filter: (s: EnrichedStation) => s.ouverte_apres_1980, color: '#333', textColor: '#FFF' }
  ];

  // Noms & Lettres
  const commonLetters = ['A', 'E', 'S', 'M', 'P'];
  categories.names = [
    ...commonLetters.map(l => ({ type: 'names', id: `contains-${l}`, name: `Contient la lettre '${l}'`, filter: (s: EnrichedStation) => s.nom.toUpperCase().includes(l), color: '#444', textColor: '#FFF' })),
    ...['A', 'B', 'C', 'L', 'M', 'P', 'S'].map(l => ({ type: 'names', id: `starts-${l}`, name: `Commence par '${l}'`, filter: (s: EnrichedStation) => s.nom.toUpperCase().startsWith(l), color: '#444', textColor: '#FFF' })),
    ...['E', 'S', 'T', 'N'].map(l => ({ type: 'names', id: `ends-${l}`, name: `Termine par '${l}'`, filter: (s: EnrichedStation) => s.nom.toUpperCase().endsWith(l), color: '#444', textColor: '#FFF' }))
  ];

  
  return categories;
}

export function parseEnrichedCSV(csvContent: string): EnrichedStation[] {
  const lines = csvContent.trim().split('\n');
  const stationMap = new Map<string, EnrichedStation>();
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 13) {
      const nom = fields[0];
      let line = fields[1];
      if (line === "3B") line = "3bis";
      if (line === "7B") line = "7bis";
      const order = parseInt(fields[3]);
      const lat = parseFloat(fields[4]);
      const lon = parseFloat(fields[5]);
      const arrondissement = parseInt(fields[6]);
      const figure_historique = fields[7] === '1';
      const couleur = fields[8] === '1';
      const ouverte_apres_1980 = fields[9] === '1';
      const rive_gauche = fields[10] === '1';
      const has_rer = fields[11] === '1';
      const has_tram = fields[12] === '1';

      // Find if we already have a station with this name nearby (within ~1km)
      let existingStation: EnrichedStation | undefined = undefined;
      for (const s of stationMap.values()) {
        if (s.nom === nom) {
          const latDiff = Math.abs(s.lat - lat);
          const lonDiff = Math.abs(s.lon - lon);
          if (latDiff < 0.01 && lonDiff < 0.01) {
            existingStation = s;
            break;
          }
        }
      }

      if (!existingStation) {
        const newStation: EnrichedStation = {
          nom,
          lines: [line],
          orders: { [line]: order },
          lat,
          lon,
          arrondissement,
          figure_historique,
          couleur,
          ouverte_apres_1980,
          rive_gauche,
          has_rer,
          has_tram
        };
        stationMap.set(`${nom}-${lat}-${lon}`, newStation);
      } else {
        if (!existingStation.lines.includes(line)) {
          existingStation.lines.push(line);
          existingStation.orders[line] = order;
        }
      }
    }
  }
  return Array.from(stationMap.values());
}
