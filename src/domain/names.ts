/** Lowercase, no accents, letters and digits only. */
export function simplifyName(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Canonical form used to compare what a player types with station names:
 * `simplifyName` without a leading "Gare de"/"Gare d'".
 */
export function normalizeName(name: string): string {
  return simplifyName(name.toLowerCase().replace(/^gare d(e |')/, ""));
}

export interface AliasPair {
  name1: string;
  name2: string;
}

/** Looser form for alias lookups: case and hyphenation only (accents are kept). */
function aliasForm(name: string): string {
  return name.replace(/ - /g, " ").replace(/-/g, " ").toLowerCase();
}

/**
 * Builds a predicate telling whether two names designate the same interchange,
 * either because they are spelled alike or because the pair is declared.
 */
export function createAliasMatcher(pairs: readonly AliasPair[]): (a: string, b: string) => boolean {
  const declared = new Set<string>();
  for (const { name1, name2 } of pairs) {
    const a = aliasForm(name1);
    const b = aliasForm(name2);
    declared.add(`${a}\n${b}`);
    declared.add(`${b}\n${a}`);
  }
  return (a, b) => {
    if (a === b) return true;
    const formA = aliasForm(a);
    const formB = aliasForm(b);
    return formA === formB || declared.has(`${formA}\n${formB}`);
  };
}
