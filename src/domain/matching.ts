import { exactForm, normalizeName, phoneticKey, simplifyName } from "@/domain/names";

/** Something the player can find: an identity and every name that designates it. */
export interface Answer {
  key: string;
  names: string[];
}

export interface AnswerIndex {
  /** How a name or an input is compared. */
  form: (name: string) => string;
  /** Full name, in `form` -> answer keys. */
  full: Map<string, Set<string>>;
  /** Normalized short form (dashed part, name without parentheses) -> answer keys. */
  partial: Map<string, Set<string>>;
  /** Spoken only: the same names by how they sound (phoneticKey). */
  sounds?: {
    full: Map<string, Set<string>>;
    partial: Map<string, Set<string>>;
    /** Every sound and its keys, by first letter: a misheard name rarely starts differently. */
    byInitial: Map<string, [string, Set<string>][]>;
  };
}

const MIN_PART_LENGTH = 3;

function add(map: Map<string, Set<string>>, form: string, key: string) {
  if (!form) return;
  const keys = map.get(form) ?? new Set<string>();
  keys.add(key);
  map.set(form, keys);
}

/** "Saint-Paul (Le Marais)" -> ["Saint-Paul"]; "Bobigny - Pablo Picasso" -> ["Bobigny", "Pablo Picasso"]. */
function shortForms(name: string): string[] {
  const withoutParentheses = name.replace(/\s*\([^)]*\)/g, "").trim();
  const parts = withoutParentheses.split(" - ").map((part) => part.trim());
  return [withoutParentheses, ...(parts.length > 1 ? parts : [])];
}

/**
 * Hardcore accepts the exact full name only (`exactForm`). Spoken input is spelled by speech
 * recognition, not by the player: it also matches names by sound, or close to one (see
 * findMentionedAnswers), and hardcore forgives accents there but still wants every word.
 */
export function buildAnswerIndex(answers: readonly Answer[], { hardcore = false, spoken = false } = {}): AnswerIndex {
  const form = !hardcore ? normalizeName : spoken ? simplifyName : exactForm;
  const index: AnswerIndex = { form, full: new Map(), partial: new Map() };
  const sounds = spoken ? { full: new Map(), partial: new Map(), byInitial: new Map() } : undefined;
  if (sounds) index.sounds = sounds;
  for (const { key, names } of answers) {
    for (const name of names) {
      add(index.full, form(name), key);
      if (sounds) add(sounds.full, phoneticKey(name), key);
      if (hardcore) continue;
      for (const short of shortForms(name)) {
        const normalized = normalizeName(short);
        if (normalized.length < MIN_PART_LENGTH) continue;
        add(index.partial, normalized, key);
        if (sounds) add(sounds.partial, phoneticKey(short), key);
      }
    }
  }
  for (const [sound, keys] of sounds ? [...sounds.full, ...sounds.partial] : []) {
    sounds!.byInitial.set(sound[0], [...(sounds!.byInitial.get(sound[0]) ?? []), [sound, keys]]);
  }
  return index;
}

const unique = (keys: Set<string> | undefined) => (keys?.size === 1 ? [...keys] : []);

/**
 * Keys designated by what the player typed: an exact full name, otherwise a
 * short form that only one answer has (not in hardcore). Prefixes never match.
 * A spoken index also accepts a name, then a short form, that only one answer sounds like.
 */
export function lookupAnswer(index: AnswerIndex, input: string): string[] {
  const form = index.form(input.trim());
  if (!form) return [];
  const full = index.full.get(form);
  if (full) return [...full];
  const partial = unique(index.partial.get(form));
  if (partial.length > 0 || !index.sounds) return partial;
  const sound = phoneticKey(input);
  const byFull = unique(index.sounds.full.get(sound));
  return byFull.length > 0 ? byFull : unique(index.sounds.partial.get(sound));
}

/** Edits allowed between what was heard and a name, by length of the sound heard. */
const misheard = (length: number) => (length < 7 ? 0 : length < 12 ? 1 : 2);

/** Levenshtein distance, or `max + 1` as soon as it exceeds `max`. */
function distance(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let previous = Array.from({ length: b.length + 1 }, (_, j) => j);
  for (let i = 1; i <= a.length; i++) {
    const row = [i];
    for (let j = 1; j <= b.length; j++) {
      row[j] = Math.min(previous[j] + 1, row[j - 1] + 1, previous[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    }
    if (Math.min(...row) > max) return max + 1;
    previous = row;
  }
  return previous[b.length];
}

/** The one answer whose name sounds closest to `input`, within the edits `misheard` allows. */
function nearestAnswer(index: AnswerIndex, input: string): string[] {
  if (!index.sounds) return [];
  const sound = phoneticKey(input);
  const max = misheard(sound.length);
  if (max === 0) return [];
  let best = max + 1;
  let closest = new Set<string>();
  for (const [name, keys] of index.sounds.byInitial.get(sound[0]) ?? []) {
    const edits = distance(sound, name, Math.min(max, best));
    if (edits < best) [best, closest] = [edits, new Set(keys)];
    else if (edits === best) keys.forEach((key) => closest.add(key));
  }
  return best <= max ? unique(closest) : [];
}

const MAX_NAME_WORDS = 8;

/**
 * Keys named anywhere in a spoken sentence, in order. Scans words left to
 * right and keeps the longest run of words that designates an answer; with a
 * spoken index, a run that only sounds close to one name comes last.
 */
export function findMentionedAnswers(index: AnswerIndex, transcript: string): string[] {
  const words = transcript.split(/\s+/).filter(Boolean);
  const keys: string[] = [];
  const longestRun = (start: number, lookup: (index: AnswerIndex, input: string) => string[]) => {
    for (let end = Math.min(words.length, start + MAX_NAME_WORDS); end > start; end--) {
      const found = lookup(index, words.slice(start, end).join(" "));
      if (found.length > 0) return { found, length: end - start };
    }
    return null;
  };
  let start = 0;
  while (start < words.length) {
    const run = longestRun(start, lookupAnswer) ?? longestRun(start, nearestAnswer);
    if (run) keys.push(...run.found.filter((key) => !keys.includes(key)));
    start += run?.length ?? 1;
  }
  return keys;
}
