import { EnrichedStation } from '@/types/metro';

export const LINE_COLORS: Record<string, string> = {
  '1': '#FFCD00', '2': '#0064B0', '3': '#9F9825', '3bis': '#98D4E2',
  '4': '#C04191', '5': '#FF7E2E', '6': '#6ECA97', '7': '#FA9ABA',
  '7bis': '#6ECA97', '8': '#E19BDF', '9': '#B6BD00', '10': '#C9910D',
  '11': '#704B1C', '12': '#007852', '13': '#6EC4E8', '14': '#62259D',
  'A': '#E2231A', 'B': '#7BA3DC', 'C': '#F99D1D', 'D': '#009639', 'E': '#E3B32A'
};

export interface Category {
  type: string;
  id: string;
  name: string;
  filter: (s: EnrichedStation) => boolean;
  color?: string;
  isRandom?: boolean;
}

export const MetaCategories: Record<string, string> = {
  'line': 'Lignes de Métro',
  'groups': 'Groupes de Lignes',
  'geo': 'Géographie (Paris/Banlieue)',
  'arr': 'Arrondissements',
  'connect': 'Connectivité',
  'special': 'Spécial (Histoire, Couleurs)',
  'custom': 'Filtrage Personnalisé'
};

export function getAvailableCategories(allStations: EnrichedStation[], customLines = "", customArrs = ""): Record<string, Category[]> {
  const categories: Record<string, Category[]> = { 
    line: [], groups: [], geo: [], arr: [], connect: [], special: [], custom: [] 
  };
  
  const isRer = (l: string) => ['A', 'B', 'C', 'D', 'E'].includes(l.toUpperCase());

  // Metro Lines
  const metroSet = new Set<string>();
  allStations.forEach(s => s.lines.forEach(l => { if (!isRer(l)) metroSet.add(l); }));

  categories.line = Array.from(metroSet).sort((a,b) => {
    const numA = parseInt(a), numB = parseInt(b);
    if (isNaN(numA) && isNaN(numB)) return a.localeCompare(b);
    if (isNaN(numA)) return 1;
    if (isNaN(numB)) return -1;
    return numA - numB;
  }).map(l => ({
    type: 'line', id: `line-${l}`, name: `Métro ${l}`, filter: s => s.lines.includes(l), color: LINE_COLORS[l] || '#000'
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
    "Périphériques": ["2", "6"]
  };
  categories.groups = Object.entries(lineGroups).map(([name, resLines]) => ({
    type: 'groups', id: `group-${name}`, name: name,
    filter: s => s.lines.some(l => resLines.includes(l)), color: '#333'
  }));

  // Connectivité
  categories.connect = [
    { type: 'connect', id: 'c1', name: 'Sur une seule ligne', filter: s => s.lines.filter(l => !isRer(l)).length === 1, color: '#333' },
    { type: 'connect', id: 'c2', name: 'Sur exactement 2 lignes', filter: s => s.lines.filter(l => !isRer(l)).length === 2, color: '#333' },
    { type: 'connect', id: 'c3', name: 'Sur 3+ lignes', filter: s => s.lines.length >= 3, color: '#333' },
    { type: 'connect', id: 'has-rer', name: 'Correspondance RER', filter: s => s.has_rer, color: '#5291ce' }
  ];

  // Geography
  categories.geo = [
    { type: 'geo', id: 'intra', name: 'Paris Intra-muros', filter: s => s.arrondissement >= 1 && s.arrondissement <= 20, color: '#333' },
    { type: 'geo', id: 'extra', name: 'Banlieue', filter: s => s.arrondissement > 20, color: '#333' },
    { type: 'geo', id: 'rg', name: 'Rive Gauche', filter: s => s.rive_gauche, color: '#333' },
    { type: 'geo', id: 'rd', name: 'Rive Droite', filter: s => !s.rive_gauche && s.arrondissement >= 1 && s.arrondissement <= 20, color: '#333' }
  ];

  // Arrondissements
  for (let i = 1; i <= 20; i++) {
    categories.arr.push({ type: 'arr', id: `arr-${i}`, name: `Arrondissement ${i}`, filter: s => s.arrondissement === i, color: '#333' });
  }

  // Special
  categories.special = [
    { type: 'special', id: 'hist', name: 'Figure Historique', filter: s => s.figure_historique, color: '#6366f1' },
    { type: 'special', id: 'color', name: 'Nom avec une couleur', filter: s => s.couleur, color: '#ec4899' },
    { type: 'special', id: 'modern', name: 'Ouverte après 1980', filter: s => s.ouverte_apres_1980, color: '#10b981' }
  ];

  // Custom
  if (customLines.trim()) {
    const list = customLines.split(/[, ]+/).filter(x => x.trim()).map(x => x.toUpperCase());
    categories.custom.push({ type: 'custom', id: 'custom-lines', name: `Lignes: ${list.join(', ')}`, filter: s => s.lines.some(l => list.includes(l.toUpperCase())), color: '#000' });
  }
  if (customArrs.trim()) {
    const list = customArrs.split(/[, ]+/).filter(x => x.trim()).map(x => parseInt(x));
    categories.custom.push({ type: 'custom', id: 'custom-arrs', name: `Arr.: ${list.join(', ')}`, filter: s => list.includes(s.arrondissement), color: '#000' });
  }
  
  return categories;
}

export function parseEnrichedCSV(csvContent: string): EnrichedStation[] {
  const lines = csvContent.trim().split('\n');
  const stations: EnrichedStation[] = [];
  
  for (let i = 1; i < lines.length; i++) {
    const fields = lines[i].split(',');
    if (fields.length >= 10) {
      stations.push({
        nom: fields[0],
        lines: fields[1].split(' '),
        lat: parseFloat(fields[2]),
        lon: parseFloat(fields[3]),
        arrondissement: parseInt(fields[4]),
        figure_historique: fields[5] === '1',
        couleur: fields[6] === '1',
        ouverte_apres_1980: fields[7] === '1',
        rive_gauche: fields[8] === '1',
        has_rer: fields[9] === '1'
      });
    }
  }
  return stations;
}
