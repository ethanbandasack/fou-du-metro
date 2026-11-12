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

/**
 * Spellings of one French sound, applied in order to each word: lowercase without accents, except
 * E for a sounded é/è/ê (so that it is not taken for a mute e) and S for ch.
 */
const SOUNDS: [RegExp, string][] = [
  // Silent endings: plural or not, mute e, final t/d/p.
  [/(\w\w)[sxz]$/, "$1"],
  [/er$/, "E"],
  [/(\w\w)e$/, "$1"],
  [/([mr])p$/, "$1"],
  [/(\w\w)[td]$/, "$1"],
  [/aul$/, "o"],
  [/tion/g, "sion"],
  [/s?ch|sh/g, "S"],
  [/ph/g, "f"],
  [/th/g, "t"],
  [/qu?|ck/g, "k"],
  [/gu(?=[eiyE])/g, "G"],
  [/g(?=[eiyE])|ge(?=[aou])/g, "j"],
  [/G/g, "g"],
  [/c(?=[eiyE])/g, "s"],
  [/c/g, "k"],
  [/x/g, "ks"],
  [/e?au/g, "o"],
  [/[ae]in(?![aeiouyE])/g, "in"],
  [/[ae][iy]/g, "E"],
  // Nasal vowels: am/an/em/en, im/in/um/un/ym/yn, om/on before a consonant or at the end.
  [/[ae][mn](?![aeiouyEmn])/g, "an"],
  [/[iuy][mn](?![aeiouyEmn])/g, "in"],
  [/om(?![aeiouyEmn])/g, "on"],
  [/E/g, "e"],
  [/y/g, "i"],
  [/h/g, ""],
  [/w/g, "v"],
  [/z/g, "s"],
  [/(\w)\1+/g, "$1"],
];

/**
 * How a French name roughly sounds, so that what speech recognition may spell differently
 * (Invalides/Invalide, Rambuteau/Rambuto, Pernety/Pernetti) compares equal. Spaces are dropped.
 */
export function phoneticKey(name: string): string {
  return name
    .toLowerCase()
    .replace(/ç/g, "s")
    .replace(/[éèêë]/g, "E")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .split(/[^a-zA-Z0-9]+/)
    .map((word) => SOUNDS.reduce((sound, [pattern, replacement]) => sound.replace(pattern, replacement), word))
    .join("");
}
