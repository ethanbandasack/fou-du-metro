import type { Station } from '@/domain/network';
import { lineColors } from '@/domain/lines';

export interface Category {
  type: string;
  id: string;
  name: string;
  filter: (s: Station) => boolean;
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

export function getAvailableCategories(allStations: Station[]): Record<string, Category[]> {
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
    type: 'line', id: `line-${l}`, name: `Métro ${l}`, filter: (s: Station) => s.lines.includes(l), color: lineColors(l).background, textColor: lineColors(l).text
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
    filter: (s: Station) => s.lines.some(l => lines.includes(l)), color: '#333', textColor: '#FFF',
    includedItems: lines
  }));

  // Connectivité
  categories.connect = [
    { type: 'connect', id: 'c1', name: 'Sur une seule ligne', filter: (s: Station) => s.lines.filter(l => !isRer(l)).length === 1, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'c2', name: 'Sur exactement 2 lignes', filter: (s: Station) => s.lines.filter(l => !isRer(l)).length === 2, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'c3', name: 'Sur 3+ lignes', filter: (s: Station) => s.lines.length >= 3, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'has-rer', name: 'Correspondance RER', filter: (s: Station) => s.hasRer, color: '#333', textColor: '#FFF' },
    { type: 'connect', id: 'has-tram', name: 'Correspondance Tramway', filter: (s: Station) => s.hasTram, color: '#333', textColor: '#FFF' }
  ];

  // Geography
  categories.geo = [
    { type: 'geo', id: 'intra', name: 'Paris Intra-muros', filter: (s: Station) => s.arrondissement >= 1 && s.arrondissement <= 20, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'extra', name: 'Banlieue', filter: (s: Station) => s.arrondissement > 20, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'rg', name: 'Rive Gauche', filter: (s: Station) => s.leftBank, color: '#333', textColor: '#FFF' },
    { type: 'geo', id: 'rd', name: 'Rive Droite', filter: (s: Station) => !s.leftBank && s.arrondissement >= 1 && s.arrondissement <= 20 && s.name !== 'Cité', color: '#333', textColor: '#FFF' }
  ];

  // Arrondissements
  for (let i = 1; i <= 20; i++) {
    categories.arr_single.push({ type: 'arr_single', id: `arr-${i}`, name: `Arrondissement ${i}`, filter: (s: Station) => s.arrondissement === i, color: '#333', textColor: '#FFF' });
  }
  categories.arr_group.push({ type: 'arr_group', id: 'arr-group-1-9', name: 'Arrondissements 1-9', filter: (s: Station) => s.arrondissement >= 1 && s.arrondissement <= 9, color: '#333', textColor: '#FFF', includedItems: ['1', '2', '3', '4', '5', '6', '7', '8', '9'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-group-10-20', name: 'Arrondissements 10-20', filter: (s: Station) => s.arrondissement >= 10 && s.arrondissement <= 20, color: '#333', textColor: '#FFF', includedItems: ['10', '11', '12', '13', '14', '15', '16', '17', '18', '19', '20'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-pair', name: 'Arrondissement Pair', filter: (s: Station) => s.arrondissement > 0 && s.arrondissement <= 20 && s.arrondissement % 2 === 0, color: '#333', textColor: '#FFF', includedItems: ['2', '4', '6', '8', '10', '12', '14', '16', '18', '20'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-impair', name: 'Arrondissement Impair', filter: (s: Station) => s.arrondissement > 0 && s.arrondissement <= 20 && s.arrondissement % 2 !== 0, color: '#333', textColor: '#FFF', includedItems: ['1', '3', '5', '7', '9', '11', '13', '15', '17', '19'] });
  categories.arr_group.push({ type: 'arr_group', id: 'arr-custom', name: 'Groupe personnalisé', filter: () => false, color: '#333', textColor: '#FFF' });

  // Special
  categories.special = [
    { type: 'special', id: 'hist', name: 'Figure Historique', filter: (s: Station) => s.historicFigure, color: '#333', textColor: '#FFF' },
    { type: 'special', id: 'color', name: 'Nom avec une couleur', filter: (s: Station) => s.colorInName, color: '#333', textColor: '#FFF' },
    { type: 'special', id: 'modern', name: 'Ouverte après 1980', filter: (s: Station) => s.openedAfter1980, color: '#333', textColor: '#FFF' }
  ];

  // Noms & Lettres
  const commonLetters = ['A', 'E', 'S', 'M', 'P'];
  categories.names = [
    ...commonLetters.map(l => ({ type: 'names', id: `contains-${l}`, name: `Contient la lettre '${l}'`, filter: (s: Station) => s.name.toUpperCase().includes(l), color: '#444', textColor: '#FFF' })),
    ...['A', 'B', 'C', 'L', 'M', 'P', 'S'].map(l => ({ type: 'names', id: `starts-${l}`, name: `Commence par '${l}'`, filter: (s: Station) => s.name.toUpperCase().startsWith(l), color: '#444', textColor: '#FFF' })),
    ...['E', 'S', 'T', 'N'].map(l => ({ type: 'names', id: `ends-${l}`, name: `Termine par '${l}'`, filter: (s: Station) => s.name.toUpperCase().endsWith(l), color: '#444', textColor: '#FFF' }))
  ];

  
  return categories;
}
