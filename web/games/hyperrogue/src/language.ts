// language.cpp of HyperRogue 13.1o: XLAT for all nine languages with each language's grammar (genderrep, parrep),
// the noun table (XLAT1, XLATN, XLAT1_to, XLAT1_acc), dnameof, shapename. Stage 3 (translations).
// (C) Zeno Rogue, GPL-2.0-or-later; TypeScript port.
//
// The data: the original's build makes language-data.cpp with langen.cpp (all_sentences, all_nouns, hashval,
// transcompleteness); re/hyperrogue/tools/gen-language.sh makes src/language-data.ts (always loaded: what English
// needs) and src/lang/<code>.ts (one module per language, loaded when the language is first used: `language_load`).
// The tables are searched as findInHashTable searches them: by langhash (the UTF-8 bytes as signed chars), so a
// string that is not in the table but has a table entry's hash finds that entry, as in the original.
//
// Loading: a language's data arrives asynchronously (a dynamic import). Until it has arrived, XLAT works as in
// English (lang() == 0) and starts the loading (a deviation of a frame or so, README.md); the tests load the data
// before running (language_load_all).
//
// stringpar: a string. C++ builds it implicitly from eMonster/eLand/eWall/eItem (the name); in TS say which:
// spM(m), spL(l), spW(w), spI(i). XLAT(x, p1, ..., p5) takes the stringpars as strings.
import { minf, linf, winf, iinf, motypes, landtypes, walltypes, ittypes, type eMonster, type eLand, type eWall, type eItem } from './content.ts';
import { format } from './hprint.ts';
import { lang, playergender, princessgender } from './config.ts';
import { GEN_M, GEN_F, GEN_N, GEN_O, GEN_BASE_MASK, GENF_ELISION, GENF_PLURALONLY, GENF_PROPER } from './hyper.ts';
import { hashval, noun_keys, noun_hashes, noun_english_flags, lang_codes, NUMEXTRA as LD_NUMEXTRA } from './language-data.ts';

/** dnameof(eMonster) (the overloads: dnameof_l, dnameof_w, dnameof_i) */
export function dnameof(m: eMonster): string { return m >= 0 && m < motypes ? minf[m].name : format('[MONSTER %d]', m); }
export function dnameof_l(l: eLand): string { return l >= 0 && l < landtypes ? linf[l].name : format('[LAND %d]', l); }
export function dnameof_w(w: eWall): string { return w >= 0 && w < walltypes ? winf[w].name : format('[WALL %d]', w); }
export function dnameof_i(i: eItem): string { return i >= 0 && i < ittypes ? iinf[i].name : format('[ITEM %d]', i); }

export const NUMLAN = 9;

/** struct stringpar */
export type stringpar = string;
/** stringpar(eMonster m) { v = minf[m].name; } */
export function spM(m: eMonster): stringpar { return minf[m].name; }
/** stringpar(eLand l) */
export function spL(l: eLand): stringpar { return linf[l].name; }
/** stringpar(eWall w) */
export function spW(w: eWall): stringpar { return winf[w].name; }
/** stringpar(eItem i) */
export function spI(i: eItem): stringpar { return iinf[i].name; }

/** void rep(string& pattern, string what, string to): replace every occurrence (from the start, again and again) */
function rep(pattern: string, what: string, to: string): string {
  while (true) {
    const at = pattern.indexOf(what);
    if (at === -1) break;
    pattern = pattern.slice(0, at) + to + pattern.slice(at + what.length);
  }
  return pattern;
}

/** void reponce(string& pattern, string what, string to) */
export function reponce(pattern: string, what: string, to: string): string {
  const at = pattern.indexOf(what);
  if (at !== -1) pattern = pattern.slice(0, at) + to + pattern.slice(at + what.length);
  return pattern;
}

/** struct noun */
interface noun { genus: number; nom: string; nomp: string; acc: string; abl: string }

/** #define NUMEXTRA (CAP_TRANS: language-data.cpp's, the non-ASCII characters of the translations) */
export const NUMEXTRA = LD_NUMEXTRA;

// --- the data (language-data.cpp) -----------------------------------------------------------------------------

/** a language module (src/lang/<code>.ts) */
interface langmodule { sentences: readonly string[]; nouns: readonly (number | string)[] }

const loaded: (langmodule | null)[] = new Array<langmodule | null>(NUMLAN).fill(null);
const loading: (Promise<void> | null)[] = new Array<Promise<void> | null>(NUMLAN).fill(null);
/** all_sentences' hashes -> table index (filled with the first language) */
let sentence_index: Map<number, number> | null = null;
/** all_nouns' hashes -> table index */
const noun_index = new Map<number, number>();
for (let i = 0; i < noun_hashes.length; i++) noun_index.set(noun_hashes[i], i);

const importers: (() => Promise<langmodule>)[] = [
  () => Promise.resolve({ sentences: [], nouns: [] }),
  () => import('./lang/pl.ts'), () => import('./lang/tr.ts'), () => import('./lang/cz.ts'), () => import('./lang/ru.ts'),
  () => import('./lang/de.ts'), () => import('./lang/pt.ts'), () => import('./lang/fr.ts'), () => import('./lang/zh.ts'),
];

/** called when a language's data has arrived (the browser redraws) */
export const language_hooks = { onload: null as ((l: number) => void) | null };

/** loads language l's data (once) */
export function language_load(l: number): Promise<void> {
  if (l <= 0 || l >= NUMLAN) return Promise.resolve();
  if (!loading[l]) {
    loading[l] = (async () => {
      if (!sentence_index) {
        const { sentence_hashes } = await import('./lang/sentences.ts');
        if (!sentence_index) {
          const m = new Map<number, number>();
          for (let i = 0; i < sentence_hashes.length; i++) m.set(sentence_hashes[i], i);
          sentence_index = m;
        }
      }
      const mod = await importers[l]();
      loaded[l] = { sentences: mod.sentences, nouns: mod.nouns };
      language_hooks.onload?.(l);
    })();
  }
  return loading[l]!;
}

export function language_loaded(l: number): boolean { return l <= 0 || l >= NUMLAN || loaded[l] !== null; }

/** loads every language (the language menu shows all their names; the tests) */
export function language_load_all(): Promise<void> {
  const ps: Promise<void>[] = [];
  for (let l = 1; l < NUMLAN; l++) ps.push(language_load(l));
  return Promise.all(ps).then(() => undefined);
}

/** the language code of the module of language l ('en', 'pl', ...) */
export function language_code(l: number): string { return lang_codes[l] ?? 'en'; }

/** lang(), but 0 while that language's data has not arrived yet (and the loading is started) */
function tlang(): number {
  const l = lang();
  if (l <= 0) return l;
  if (l >= NUMLAN) return 0; // (C++ would index past the tables)
  if (!loaded[l]) { void language_load(l); return 0; }
  return l;
}

/** hashcode langhash(const string& s): over the UTF-8 bytes, each a signed char */
export function langhash(s: string): number {
  let r = 0;
  const add = (b: number): void => { r = (Math.imul(hashval, r) + (b >= 128 ? b - 256 : b)) >>> 0; };
  for (let i = 0; i < s.length; i++) {
    let c = s.charCodeAt(i);
    if (c >= 0xD800 && c < 0xDC00 && i + 1 < s.length) {
      const d = s.charCodeAt(i + 1);
      if (d >= 0xDC00 && d < 0xE000) { c = 0x10000 + ((c - 0xD800) << 10) + (d - 0xDC00); i++; }
    }
    if (c < 0x80) add(c);
    else if (c < 0x800) { add(0xC0 | (c >> 6)); add(0x80 | (c & 63)); }
    else if (c < 0x10000) { add(0xE0 | (c >> 12)); add(0x80 | ((c >> 6) & 63)); add(0x80 | (c & 63)); }
    else { add(0xF0 | (c >> 18)); add(0x80 | ((c >> 12) & 63)); add(0x80 | ((c >> 6) & 63)); add(0x80 | (c & 63)); }
  }
  return r;
}

/** findInHashTable(s, all_sentences): the table index, or -1 */
function find_sentence(s: string): number {
  if (!sentence_index) return -1;
  return sentence_index.get(langhash(s)) ?? -1;
}

/** findInHashTable(s, all_nouns): the table index, or -1 */
function find_noun(s: string): number {
  return noun_index.get(langhash(s)) ?? -1;
}

/** N->n[l-1] (l >= 1, its data loaded) */
function noun_of(k: number, l: number): noun {
  const a = loaded[l]!.nouns, key = noun_keys[k], o = k * 5;
  const f = (v: number | string): string => (v as string) === '' ? key : v as string;
  return { genus: a[o] as number, nom: f(a[o + 1]), nomp: f(a[o + 2]), acc: f(a[o + 3]), abl: f(a[o + 4]) };
}

/** s->xlat[l-1] (l >= 1, its data loaded): a language without a translation has the key, which is x */
function sentence_of(k: number, l: number, x: string): string {
  const t = loaded[l]!.sentences[k];
  return t === '' ? x : t;
}

// --- the grammar ------------------------------------------------------------------------------------------------

function choose2(g: number, a: string, b: string): string {
  g &= GEN_BASE_MASK;
  if (g === GEN_M || g === GEN_O) return a;
  if (g === GEN_F || g === GEN_N) return b;
  return '?' + a;
}

function choose3(g: number, a: string, b: string, c: string): string {
  g &= GEN_BASE_MASK;
  if (g === GEN_M || g === GEN_O) return a;
  if (g === GEN_F) return b;
  if (g === GEN_N) return c;
  return '?' + a;
}

function choose4(g: number, a: string, b: string, c: string, d: string): string {
  g &= GEN_BASE_MASK;
  if (g === GEN_M) return a;
  if (g === GEN_F) return b;
  if (g === GEN_N) return c;
  if (g === GEN_O) return d;
  return '?' + a;
}

/** EX bool translation_exists(const string& x) (needs a language's data: the table's keys are in it) */
export function translation_exists(x: string): boolean {
  return find_sentence(x) >= 0;
}

/** void genderrep(string& x, const string& w, const noun& N): replace gender-based codes in x, based on gender
 *  genus; some gender-based codes need to know the word (nom) */
function genderrep(x: string, w: string, N: noun, l: number): string {
  const genus = N.genus;
  if (l === 1) {
    x = rep(x, '%łem' + w, choose3(genus, 'łem', 'łam', 'łom'));
    x = rep(x, '%łeś' + w, choose3(genus, 'łeś', 'łaś', 'łoś'));
    x = rep(x, '%łeś' + w, choose3(genus, 'łeś', 'łaś', 'łoś'));
    x = rep(x, '%ął' + w, choose3(genus, 'ął', 'ęła', 'ęło'));
    x = rep(x, '%ąłeś' + w, choose3(genus, 'ąłeś', 'ęłaś', 'ęłoś'));
    x = rep(x, '%ógł' + w, choose3(genus, 'ógł', 'ogła', 'ogło'));
    x = rep(x, '%ł' + w, choose3(genus, 'ł', 'ła', 'ło'));
    x = rep(x, '%y' + w, choose3(genus, 'y', 'a', 'e'));
    x = rep(x, '%ya' + w, choose3(genus, 'y', 'a', 'e'));
    x = rep(x, '%yą' + w, choose4(genus, 'ego', 'ą', 'e', 'y'));
    x = rep(x, '%oa' + w, choose3(genus, '', 'a', 'o'));
    x = rep(x, '%ymą' + w, choose3(genus, 'ym', 'ą', 'ym'));
    x = rep(x, '%go' + w, choose3(genus, 'go', 'ją', 'je'));
    x = rep(x, '%aka' + w, choose3(genus, 'a', 'ka', 'a'));
  }

  if (l === 3) {
    x = rep(x, '%l' + w, choose3(genus, 'l', 'la', 'lo'));
    x = rep(x, '%d' + w, choose3(genus, '', 'a', 'o'));
    x = rep(x, '%ý' + w, choose3(genus, 'ý', 'á', 'é'));
    x = rep(x, '%el' + w, choose3(genus, 'el', 'la', 'lo'));
    x = rep(x, '%ůj' + w, choose4(genus, 'ého', 'ou', 'é', 'ůj'));
    x = rep(x, '%ým' + w, choose3(genus, 'ým', 'ou', 'ým'));
    x = rep(x, '%ho' + w, choose3(genus, 'ho', 'ji', 'ho'));
    x = rep(x, '%ého' + w, choose3(genus, 'ého', 'ou', 'ého'));
  }

  if (l === 4) {
    x = rep(x, '%E' + w, choose3(genus, '', 'а', 'о'));
    x = rep(x, '%A' + w, choose3(genus, 'ый', 'ая', 'ое'));
    x = rep(x, '%c' + w, choose3(genus, 'ся', 'ась', ''));
    x = rep(x, '%y' + w, choose3(genus, 'ый', 'ая', 'ое'));
  }

  if (l === 5) {
    x = rep(x, '%Der' + w, genus === -1 ? 'The' : choose3(genus, 'Der', 'Die', 'Das'));
    x = rep(x, '%der' + w, genus === -1 ? 'the' : choose3(genus, 'der', 'die', 'das'));
    x = rep(x, '%den' + w, genus === -1 ? 'the' : choose3(genus, 'den', 'die', 'das'));
    x = rep(x, '%dem' + w, genus === -1 ? 'the' : choose3(genus, 'dem', 'der', 'dem'));
  }

  if (l === 6) {
    x = rep(x, '%oa' + w, choose4(genus, 'o', 'a', 'os', 'as'));
    x = rep(x, '%seu' + w, choose4(genus, 'seu', 'sua', 'seus', 'suas'));
    x = rep(x, '%na' + w, choose4(genus, 'o', 'a', 'os', 'as') + ' ' + N.nom);
    x = rep(x, '%Na' + w, choose4(genus, 'O', 'A', 'Os', 'As') + ' ' + N.nom);
    x = rep(x, '%g' + w, choose4(genus, 'do', 'da', 'dos', 'das') + ' ' + N.nom);
    x = rep(x, '%d' + w, choose4(genus, 'ao', 'à', 'aos', 'às') + ' ' + N.nom);
    x = rep(x, '%l' + w, choose4(genus, 'no', 'na', 'nos', 'nas') + ' ' + N.nom);
    x = rep(x, '%abl' + w, choose4(genus, 'pelo', 'pela', 'pelos', 'pelas') + ' ' + N.nom);
  }

  if (l === 7) {
    if (genus & GENF_PROPER) {
      x = rep(x, '%le' + w, N.nom);
      x = rep(x, '%Le' + w, N.nom);
      x = rep(x, '%un' + w, N.nom);
      x = rep(x, '%Un' + w, N.nom);
    }
    else if (genus & GENF_PLURALONLY) {
      x = rep(x, '%le' + w, 'les ' + N.nomp);
      x = rep(x, '%Le' + w, 'Les ' + N.nomp);
      x = rep(x, '%un' + w, 'des ' + N.nomp);
      x = rep(x, '%Un' + w, 'Des ' + N.nomp);
    }
    else if (genus & GENF_ELISION) {
      x = rep(x, '%de' + w, "d'" + N.nom);
      x = rep(x, '%le' + w, "l'" + N.nom);
      x = rep(x, '%Le' + w, "L'" + N.nom);
    }
    if (genus === 0) {
      x = rep(x, ' de %le' + w, ' du ' + N.nom);
      x = rep(x, ' à %le' + w, ' au ' + N.nom);
    }
    x = rep(x, '%le' + w, choose2(genus, 'le ', 'la ') + N.nom);
    x = rep(x, '%Le' + w, choose2(genus, 'Le ', 'La ') + N.nom);
    x = rep(x, '%un' + w, choose2(genus, 'un ', 'une ') + N.nom);
    x = rep(x, '%Un' + w, choose2(genus, 'Un ', 'Une ') + N.nom);
    x = rep(x, '%de' + w, 'de ' + N.nom);

    x = rep(x, '%er' + w, choose2(genus, 'er', 'ère'));
    x = rep(x, '%e' + w, choose2(genus, '', 'e'));
    x = rep(x, '%x' + w, choose2(genus, 'x', 'se'));
  }
  return x;
}

/** void basicrep(string& x) */
function basicrep(x: string, l: number): string {
  // if(!s && !warnshown.count(x)) printf("WARNING: no translations for '%s'\n", ...): console output, left out
  // (with warnshown, which only serves it)

  if (l) {
    const s = find_sentence(x);
    if (s >= 0) x = sentence_of(s, l, x);
  }

  const dummy: noun = { genus: playergender(), nom: 'player', nomp: 'player', acc: 'player', abl: 'player' };
  x = genderrep(x, '0', dummy, l);
  return x;
}

/** void parrep(string& x, string w, stringpar p) */
function parrep(x: string, w: string, p: stringpar, l: number): string {
  const N = find_noun(p);
  // auto &data = N ? N->n[l-1] : dummy; (with l == 0, n[-1]: not used, genderrep and the branches below do nothing)
  let data: noun;
  if (N < 0) data = { genus: -1, nom: p, nomp: p, acc: p, abl: p };
  else if (l >= 1) data = noun_of(N, l);
  else data = { genus: 0, nom: '', nomp: '', acc: '', abl: '' };

  x = genderrep(x, w, data, l);

  if (l === 1) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
    x = rep(x, '%a' + w, data.acc);
    x = rep(x, '%abl' + w, data.abl);
  }
  if (l === 2) {
    // C++ reads N->n[1] here even when p is not a noun (N == NULL): the original crashes (a segmentation fault)
    // whenever a Turkish text gets a parameter that is not a noun (a number, at the first drawing of the HUD).
    // The port uses the dummy then, as the other languages do (a deviation, README.md and NOTES.md).
    const d = N >= 0 ? noun_of(N, 2) : data;
    x = rep(x, '%' + w, d.nom);
    x = rep(x, '%P' + w, d.nomp);
    x = rep(x, '%a' + w, d.acc);
    x = rep(x, '%abl' + w, d.abl);
  }
  if (l === 3) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
    x = rep(x, '%a' + w, data.acc);
    x = rep(x, '%abl' + w, data.abl);
    if (p === 'Mirror Image')
      x = rep(x, '%s' + w, 'se');
    if (p === 'Mirage')
      x = rep(x, '%s' + w, 's');
  }
  if (l === 4) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
    x = rep(x, '%a' + w, data.acc);
    x = rep(x, '%abl' + w, data.abl);
  }
  if (l === 5) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
    x = rep(x, '%a' + w, data.acc);
    x = rep(x, '%abl' + w, data.abl);
    x = rep(x, '%d' + w, data.abl); // Dativ (which equals Ablative in German)
  }
  if (l === 6) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
  }
  if (l === 7) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%P' + w, data.nomp);
    x = rep(x, '%a' + w, data.acc);
    x = rep(x, '%abl' + w, data.abl);
    x = rep(x, '%d' + w, data.abl); // Dativ (which equals Ablative in German)
  }
  if (l === 8) {
    x = rep(x, '%' + w, data.nom);
    x = rep(x, '%m' + w, data.abl); // Measure word in Chinese
  }
  {
    // proper names (R'Lyeh)
    x = rep(x, '%' + w, p);
    const flags = N >= 0 ? noun_english_flags.get(N) ?? 0 : 0;
    if (flags & 1) {
      x = rep(x, '%the' + w, p);
      x = rep(x, '%The' + w, p);
    }
    else {
      x = rep(x, '%the' + w, 'the ' + p);
      x = rep(x, '%The' + w, 'The ' + p);
      x = rep(x, '%him' + w, princessgender() ? 'her' : 'him');
      x = rep(x, '%his' + w, princessgender() ? 'her' : 'his');
    }
    // plural names (Crossroads)
    if (flags & 2)
      x = rep(x, '%s' + w, '');
    else
      x = rep(x, '%s' + w, 's');
  }
  return x;
}

function postrep(s: string): string {
  return s;
}

/** translate the string x; XLAT(x, p1, ..., p5) */
export function XLAT(x: string, ...p: stringpar[]): string {
  const l = tlang();
  x = basicrep(x, l);
  for (let i = 0; i < p.length; i++) x = parrep(x, String(i + 1), p[i], l);
  x = postrep(x);
  return x;
}

/** EX const char* XLAT1_to(string x, int language): the Chinese (n[7]) name, nullptr if x is not a noun (or the
 *  Chinese data has not arrived yet: then it is loaded) */
export function XLAT1_to(x: string, _language: number): string | null {
  const N = find_noun(x);
  if (N >= 0) {
    if (!loaded[8]) { void language_load(8); return null; }
    return noun_of(N, 8).nom;
  }
  return null;
}

/** EX const char* XLAT1_acc(string x, int language): as XLAT1_to, the acc form */
export function XLAT1_acc(x: string, _language: number): string | null {
  const N = find_noun(x);
  if (N >= 0) {
    if (!loaded[8]) { void language_load(8); return null; }
    return noun_of(N, 8).acc;
  }
  return null;
}

/** EX string XLATN(string x) */
export function XLATN(x: string): string {
  const l = tlang();
  if (l) {
    const N = find_noun(x);
    if (N >= 0) return noun_of(N, l).nomp;
  }
  return x;
}

/** EX string XLAT1(string x) */
export function XLAT1(x: string): string {
  const l = tlang();
  if (l) {
    const N = find_noun(x);
    if (N >= 0) return noun_of(N, l).nom;
  }
  return x;
}

export function XLATT1(p: stringpar): string { return XLAT1(p); }

export function shapename_available(id: number): boolean { return id >= 3 && id < 9; }

export function shapename(id: number): string {
  if (!shapename_available(id)) return '';
  const english = ['', '', 'digon', 'triangle', 'square', 'pentagon', 'hexagon', 'heptagon', 'octagon'];
  return english[id];
}
