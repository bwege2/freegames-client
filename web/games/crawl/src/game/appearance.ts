// The original's randomised item appearances and the scroll-name generator.
//
// Sources:
//   * ng-init.cc `_random_potion_description` and `initialise_item_descriptions` (the
//     unique potion/wand/jewellery appearance assignment);
//   * item-name.cc `potion_qualifiers`, `potion_colours`, `wand_primary_string`,
//     `wand_secondary_string`, `ring_primary_string`, `ring_secondary_string`,
//     `amulet_primary_string`, `amulet_secondary_string`;
//   * item-name.cc `make_name` with MNAME_SCROLL, `_random_vowel`, `_random_cons`,
//     `_random_consonant_set` and `_unforbid`.
//
// A random appearance is per game and per item type, exactly as you.item_description is.
import { Pcg } from './rng.ts';
import { ITEM_NAMES } from './data.ts';

export interface Appearances {
  potions: Record<string, string>;
  scrolls: Record<string, string>;
  wands: Record<string, string>;
  rings: Record<string, string>;
  amulets: Record<string, string>;
}

const POTION_QUALIFIERS = [
  '', 'bubbling ', 'fuming ', 'fizzy ', 'viscous ', 'lumpy ',
  'smoky ', 'glowing ', 'sedimented ', 'metallic ', 'murky ',
  'gluggy ', 'oily ', 'slimy ', 'emulsified ',
];
const POTION_COLOURS = [
  'clear', 'blue', 'black', 'silvery', 'cyan', 'purple', 'orange',
  'inky', 'red', 'yellow', 'green', 'brown', 'ruby', 'white',
  'emerald', 'grey', 'pink', 'coppery', 'golden', 'dark', 'puce',
  'amethyst', 'sapphire',
];
const WAND_PRIMARY = ['iron', 'brass', 'bone', 'wooden', 'copper', 'gold', 'silver',
  'bronze', 'ivory', 'glass', 'lead', 'fluorescent'];
const WAND_SECONDARY = ['', 'jewelled ', 'curved ', 'long ', 'short ', 'twisted ', 'crooked ',
  'forked ', 'shiny ', 'blackened ', 'tapered ', 'glowing ', 'worn ',
  'encrusted ', 'runed ', 'sharpened '];
const RING_PRIMARY = ['wooden', 'silver', 'golden', 'iron', 'steel', 'tourmaline', 'brass',
  'copper', 'granite', 'ivory', 'ruby', 'marble', 'jade', 'glass',
  'agate', 'bone', 'diamond', 'emerald', 'peridot', 'garnet', 'opal',
  'pearl', 'coral', 'sapphire', 'cabochon', 'gilded', 'onyx', 'bronze',
  'moonstone'];
const RING_SECONDARY = ['', 'encrusted ', 'glowing ', 'tubular ', 'runed ', 'blackened ',
  'scratched ', 'small ', 'large ', 'twisted ', 'shiny ', 'notched ',
  'knobbly '];
const AMULET_PRIMARY = ['sapphire', 'zirconium', 'golden', 'emerald', 'garnet', 'bronze',
  'brass', 'copper', 'ruby', 'citrine', 'bone', 'platinum', 'jade',
  'fluorescent', 'amethyst', 'cameo', 'pearl', 'blue', 'peridot',
  'jasper', 'diamond', 'malachite', 'steel', 'cabochon', 'silver',
  'soapstone', 'lapis lazuli', 'filigree', 'beryl'];
const AMULET_SECONDARY = ['dented ', 'square ', 'thick ', 'thin ', 'runed ', 'blackened ',
  'glowing ', 'small ', 'large ', 'twisted ', 'tiny ', 'triangular ',
  'lumpy '];

function itemIds(prefix: string): string[] {
  return Object.keys(ITEM_NAMES).filter((k) => k.startsWith(prefix)).sort();
}

/** ng-init.cc `_random_potion_description`: random2(PDQ_NQUALS * PDC_NCOLOURS), halved by coinflip. */
function randomPotionDescription(rng: { int(n: number): number; coinflip(): boolean }): string {
  const desc = rng.int(POTION_QUALIFIERS.length * POTION_COLOURS.length);
  const d = rng.coinflip() ? desc : desc % POTION_COLOURS.length;
  return `${POTION_QUALIFIERS[Math.trunc(d / POTION_COLOURS.length)]}${POTION_COLOURS[d % POTION_COLOURS.length]} potion`;
}

function randomWandDescription(rng: { int(n: number): number; coinflip(): boolean }): string {
  let d = rng.int(WAND_PRIMARY.length * WAND_SECONDARY.length);
  if (rng.coinflip()) d %= WAND_PRIMARY.length;
  return `${WAND_SECONDARY[Math.trunc(d / WAND_PRIMARY.length)]}${WAND_PRIMARY[d % WAND_PRIMARY.length]} wand`;
}

function randomJewelleryDescription(rng: { int(n: number): number; coinflip(): boolean }, amulet: boolean): string {
  let d = rng.int(RING_PRIMARY.length * RING_SECONDARY.length);
  if (rng.coinflip()) d %= RING_PRIMARY.length;
  const pri = amulet ? AMULET_PRIMARY : RING_PRIMARY;
  const sec = amulet ? AMULET_SECONDARY : RING_SECONDARY;
  return `${sec[Math.trunc(d / RING_PRIMARY.length)]}${pri[d % RING_PRIMARY.length]} ${amulet ? 'amulet' : 'ring'}`;
}

function unique<T>(items: T[], make: () => T, key: (v: T) => string): T {
  const used = new Set(items.map(key));
  for (let i = 0; i < 10000; i++) {
    const v = make();
    if (!used.has(key(v))) return v;
  }
  return make();
}

/** initialise_item_descriptions: one appearance per potion/scroll/wand/ring/amulet type. */
export function makeAppearances(rng: { int(n: number): number; coinflip(): boolean; seed: bigint }): Appearances {
  const potions: Record<string, string> = {};
  for (const id of itemIds('potion of ')) {
    potions[id] = unique(Object.values(potions), () => randomPotionDescription(rng), (v) => v);
  }
  const wands: Record<string, string> = {};
  for (const id of itemIds('wand of ')) {
    wands[id] = unique(Object.values(wands), () => randomWandDescription(rng), (v) => v);
  }
  const rings: Record<string, string> = {};
  const amulets: Record<string, string> = {};
  for (const id of itemIds('ring of ')) {
    rings[id] = unique([...Object.values(rings), ...Object.values(amulets)],
      () => randomJewelleryDescription(rng, false), (v) => v);
  }
  for (const id of itemIds('amulet of ')) {
    amulets[id] = unique([...Object.values(rings), ...Object.values(amulets)],
      () => randomJewelleryDescription(rng, true), (v) => v);
  }
  const scrolls: Record<string, string> = {};
  for (const id of itemIds('scroll of ')) {
    const seed1 = rng.int(151);
    const seed2 = rng.int(151);
    // ng-init.cc: seed = seed_1 | (seed_2 << 8) | (OBJ_SCROLLS << 16); OBJ_SCROLLS is 5.
    const subtype = seed1 | (seed2 << 8) | (5 << 16);
    scrolls[id] = `labelled ${makeName(rng.seed, BigInt(subtype), true)}`;
  }
  return { potions, scrolls, wands, rings, amulets };
}

function isConsonant(c: string): boolean {
  return c.length === 1 && 'bcdfghjklmnpqrstvwxz'.includes(c);
}

const CONSONANT_SETS = [
  'kl', 'gr', 'cl', 'cr', 'fr', 'pr', 'tr', 'tw', 'br', 'pl', 'bl', 'str', 'shr', 'thr',
  'sm', 'sh', 'ch', 'th', 'ph', 'pn', 'kh', 'gh', 'mn', 'ps', 'st', 'sk', 'sch',
  'ts', 'cs', 'xt', 'nt', 'll', 'rr', 'ss', 'wk', 'wn', 'ng', 'cw', 'mp', 'ck', 'nk', 'dd',
  'tt', 'bb', 'pp', 'nn', 'mm', 'kk', 'gg', 'ff', 'pt', 'tz', 'dgh', 'rgh', 'rph', 'rch',
  'cz', 'xk', 'zx', 'xz', 'cv', 'vv', 'nl', 'rh', 'dw', 'nw', 'khl',
];
const VOWELS = 'aeiouaeiouaeiouy  ';
const CONSONANTS = 'bcdfghjklmnpqrstvwxzcdfghlmnrstlmnrst';

function rot13(s: string): string {
  return s.replace(/[a-z]/g, (c) => String.fromCharCode(((c.charCodeAt(0) - 97 + 13) % 26) + 97));
}

/** item-name.cc `_unforbid`: ROT13'd rude words are acceptable names. */
function unforbid(name: string): string {
  const forbidden = new Set(['puvax', 'snt', 'avt', 'avttre', 'xvxr', 'ovgpu', 'juber', 'tvzc',
    'ergneq', 'phag', 'pbba', 'fdhnj', 'jbt', 'qlxr', 'ubzb', 'genaal', 'anmv']);
  return name.split(' ').map((part) => forbidden.has(rot13(part)) ? rot13(part) : part).join(' ');
}

/**
 * item-name.cc `make_name(game_seed, subtype_rnd, MNAME_SCROLL)`.
 * The subgenerator is PCG(game_seed, subtype_rnd), exactly rng::subgenerator.
 */
export function makeName(gameSeed: bigint, subtypeRnd: bigint, scroll: boolean): string {
  const pcg = new Pcg(gameSeed, subtypeRnd);
  const rnd = (n: number) => n <= 1 ? 0 : pcg.bounded(n);
  let name = '';
  let hasSpace = false;
  let len = 3;
  len += rnd(5);
  len += rnd(5) === 0 ? rnd(6) : 1;
  if (scroll) len += 6;

  for (let iters = 0; iters < 150 && name.length < len; iters++) {
    const prev = name.length ? name[name.length - 1] : '\0';
    const penult = name.length > 1 ? name[name.length - 2] : '\0';
    if (!name || prev === ' ') {
      name += String.fromCharCode(97 + rnd(26));
    } else if (!hasSpace && name.length > 5 && name.length < len - 4 && rnd(5) !== 0) {
      name += ' ';
    } else if (name.length && (isConsonant(prev)
      || (name.length > 1 && !isConsonant(prev) && isConsonant(penult) && rnd(5) <= 1))) {
      const vowel = VOWELS[rnd(VOWELS.length)];
      if (vowel === ' ') {
        if (len < 7 || name.length <= 2 || name.length >= len - 3 || prev === ' ' || penult === ' '
            || (name.length > 2 && isConsonant(prev) && isConsonant(penult))) {
          continue;
        }
      } else if (name.length > 1 && vowel === prev && (vowel === 'y' || vowel === 'i' || rnd(5) <= 1)) {
        continue;
      }
      name += vowel;
    } else {
      const beg = !name || prev === ' ';
      const end = name.length >= len - 2;
      if ((len > 3 || name.length) && rnd(7) <= 1 && (!beg || !end)) {
        const first = beg ? 0 : end ? 14 : 0;
        const last = beg ? 27 : end ? 56 : 67;
        const set = CONSONANT_SETS[rnd(last - first) + first];
        len += set.length - 2;
        name += set;
      } else {
        name += CONSONANTS[rnd(CONSONANTS.length)];
      }
    }
    if (name[name.length - 1] === ' ') hasSpace = true;
  }
  const last = name[name.length - 1] ?? '';
  if (name && last !== ' ' && last !== 'y' && !isConsonant(last)
      && (name.length < len || (len < 8 && rnd(3) !== 0))) {
    name += CONSONANTS[rnd(CONSONANTS.length)];
  }
  name = name.replace(/\s+$/, '');
  if (name.length < 4) name = 'plog';
  name = unforbid(name);
  return name.split('').map((c, i) => (scroll || i === 0 || name[i - 1] === ' ') ? c.toUpperCase() : c).join('');
}

/** The name shown for an item, before and after identification. */
export function appearanceName(itemId: string, appearances: Appearances | undefined): string | null {
  if (!appearances) return null;
  return appearances.potions[itemId] ?? appearances.scrolls[itemId] ?? appearances.wands[itemId]
    ?? appearances.rings[itemId] ?? appearances.amulets[itemId] ?? null;
}

/** A book title is "book of X" (item-name.cc `_book_type_name`). */
export function bookTitle(id: string): string {
  return id.startsWith('book of ') ? id : `book of ${id}`;
}

/** Collected for tests: the appearance covers every randomly-described item class. */
export function appearanceItemCount(): number {
  return itemIds('potion of ').length + itemIds('scroll of ').length + itemIds('wand of ').length
    + itemIds('ring of ').length + itemIds('amulet of ').length;
}
