import { exactForm, normalizeName, simplifyName } from "@/domain/names";

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
 * recognition, not by the player: there hardcore forgives accents but still wants every word.
 */
export function buildAnswerIndex(answers: readonly Answer[], { hardcore = false, spoken = false } = {}): AnswerIndex {
  const form = !hardcore ? normalizeName : spoken ? simplifyName : exactForm;
  const index: AnswerIndex = { form, full: new Map(), partial: new Map() };
  for (const { key, names } of answers) {
    for (const name of names) {
      add(index.full, form(name), key);
      if (hardcore) continue;
      for (const short of shortForms(name)) {
        const normalized = normalizeName(short);
        if (normalized.length >= MIN_PART_LENGTH) add(index.partial, normalized, key);
      }
    }
  }
  return index;
}

/**
 * Keys designated by what the player typed: an exact full name, otherwise a
 * short form that only one answer has (not in hardcore). Prefixes never match.
 */
export function lookupAnswer(index: AnswerIndex, input: string): string[] {
  const form = index.form(input.trim());
  if (!form) return [];
  const full = index.full.get(form);
  if (full) return [...full];
  const partial = index.partial.get(form);
  return partial?.size === 1 ? [...partial] : [];
}

const MAX_NAME_WORDS = 8;

/**
 * Keys named anywhere in a spoken sentence, in order. Scans words left to
 * right and keeps the longest run of words that designates an answer.
 */
export function findMentionedAnswers(index: AnswerIndex, transcript: string): string[] {
  const words = transcript.split(/\s+/).filter(Boolean);
  const keys: string[] = [];
  let start = 0;
  while (start < words.length) {
    let matched = 0;
    for (let end = Math.min(words.length, start + MAX_NAME_WORDS); end > start; end--) {
      const found = lookupAnswer(index, words.slice(start, end).join(" "));
      if (found.length > 0) {
        keys.push(...found.filter((key) => !keys.includes(key)));
        matched = end - start;
        break;
      }
    }
    start += Math.max(matched, 1);
  }
  return keys;
}
