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

/** Hardcore form: case, spaces and punctuation ignored; accents and every word kept. */
export function exactForm(name: string): string {
  return name.normalize("NFC").toLowerCase().replace(/[^\p{L}\p{N}]/gu, "");
}
