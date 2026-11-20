// Gods and religion: the original's gods, their invocations, piety and conduct rules.
//
// The numbers here are DCSS 0.34.1's:
//   * ability costs and failure bases: ability.cc `_get_ability_list` (the fields are MP, HP,
//     piety, range, failure_info) and `failure_info::chance`, `generic_cost::cost`,
//     `scaling_cost::cost`;
//   * god power ranks: religion.cc `_get_god_powers` (the ABIL_* entries and their rank);
//   * piety breakpoints and the gain/decay rules: religion.h `MAX_PIETY`, religion.cc
//     `piety_breakpoint`, `piety_rank`, `_gain_piety_point`, `gain_piety`, `piety_scale`;
//   * kill piety: god-conduct.cc `_piety_bonus_for_holiness`, `_on_kill`, `okawaru_kill`,
//     `_handle_piety_penance`, and `like_response::operator()`;
//   * the starting piety of a Berserker: ng-setup.cc `give_items_skills`.
//
// What the port does not model is listed in web/games/crawl/README.md: no god gifts, no wrath,
// no penance treadmill beyond losing the god, and only the abilities named in ABILITIES below.
import type { Player } from './player.ts';
import { skillOf } from './player.ts';

export interface GodDef {
  id: string;
  name: string;
  /** The Temple altar feature, feature-data.h. */
  altar: string;
  /** Short description from dat/descript/gods.txt. */
  description: string;
  /** The ability ids available to a worshipper, religion.cc `_get_god_powers`. */
  abilities: string[];
  /** Trog's dislike of spellcasting, god-conduct.cc divine_peeves. */
  hatesSpellcasting?: boolean;
}

export const GODS: GodDef[] = [
  {
    id: 'GOD_TROG', name: 'Trog', altar: 'DNGN_ALTAR_TROG', abilities: [
      'ABIL_TROG_BERSERK', 'ABIL_TROG_HAND', 'ABIL_TROG_BROTHERS_IN_ARMS',
    ],
    hatesSpellcasting: true,
    description: 'Trog is an ancient god of anger and violence. Followers are expected to kill in ' +
      "Trog's name, and especially to slay wizards. In return, worshippers of Trog can go berserk " +
      'at will and call upon him for regeneration and reinforcements.',
  },
  {
    id: 'GOD_OKAWARU', name: 'Okawaru', altar: 'DNGN_ALTAR_OKAWARU', abilities: [
      'ABIL_OKAWARU_HEROISM', 'ABIL_OKAWARU_FINESSE',
    ],
    description: 'Okawaru is a dangerous and powerful god of battle. Followers are expected to ' +
      'constantly prove themselves in combat, and may channel Okawaru\'s might to enhance their ' +
      'prowess. Okawaru demands that followers prove themselves by their own means.',
  },
  {
    id: 'GOD_MAKHLEB', name: 'Makhleb', altar: 'DNGN_ALTAR_MAKHLEB', abilities: [
      'ABIL_MAKHLEB_DESTRUCTION', 'ABIL_MAKHLEB_INFERNAL_SERVANT',
    ],
    description: 'Makhleb the Destroyer is a fearsome deity of bloodshed and mortification of the ' +
      'flesh. Followers are expected to spill blood and visit death on their enemies in Makhleb\'s ' +
      'name. Dedicated followers may also access the raw power of destruction.',
  },
  {
    id: 'GOD_SIF_MUNA', name: 'Sif Muna', altar: 'DNGN_ALTAR_SIF_MUNA', abilities: [
      'ABIL_SIF_MUNA_CHANNEL_ENERGY',
    ],
    description: 'Sif Muna the Loreminder is a contemplative but powerful deity, served by those ' +
      'who seek knowledge and magical power. Followers may call upon Sif Muna for magical energy.',
  },
  {
    id: 'GOD_VEHUMET', name: 'Vehumet', altar: 'DNGN_ALTAR_VEHUMET', abilities: [],
    description: 'Vehumet is the god of destructive magic. Followers gain magical power from ' +
      'killing, and Vehumet aids and extends the range of their destructive spells.',
  },
  {
    id: 'GOD_ELYVILON', name: 'Elyvilon', altar: 'DNGN_ALTAR_ELYVILON', abilities: [
      'ABIL_ELYVILON_PURIFICATION', 'ABIL_ELYVILON_HEAL_SELF', 'ABIL_ELYVILON_DIVINE_VIGOUR',
    ],
    description: 'Elyvilon the Healer welcomes all kind souls prepared to help others. Those who ' +
      'follow Elyvilon are expected to heal and to avoid bloodshed. Elyvilon appreciates ' +
      "exploration of the dungeon. Elyvilon's followers can convert to the Shining One or Zin " +
      'while keeping some piety.',
  },
];

export const GOD_BY_ID = new Map(GODS.map((g) => [g.id, g]));
export const GOD_BY_ALTAR = new Map(GODS.map((g) => [g.altar, g]));
export const GOD_BY_NAME = new Map(GODS.map((g) => [g.name.toLowerCase(), g]));

export interface AbilityDef {
  id: string;
  name: string;
  god: string;
  /** Minimum piety rank, religion.cc `_get_god_powers`. */
  rank: number;
  mp: number;
  /** scaling_cost(permille of max HP, flat), ability.cc. */
  hp?: [number, number];
  /** generic_cost(base), ability.cc: cost = base + random2avg((base + 1) / 2 + 1, 1). */
  piety: number;
  /** failure_info {basis, base_chance, variable_fail_mult, piety_fail_denom}, ability.cc. */
  fail: { basis: 'invo' | 'xl'; base: number; mult: number; pietyDenom: number };
  /** The in-game description, religion.cc `_get_god_powers` and ability.cc. */
  desc: string;
  /** Needs a direction, ability.cc abflag::dir_or_target/target. */
  targeted?: boolean;
}

export const ABILITIES: AbilityDef[] = [
  // Trog, ability.cc `_get_ability_list`.
  { id: 'ABIL_TROG_BERSERK', name: 'Berserk', god: 'GOD_TROG', rank: 1, mp: 0, piety: 1,
    fail: { basis: 'invo', base: 45, mult: 0, pietyDenom: 2 }, desc: 'go berserk at will' },
  { id: 'ABIL_TROG_HAND', name: "Trog's Hand", god: 'GOD_TROG', rank: 2, mp: 0, piety: 2,
    fail: { basis: 'invo', base: 75, mult: 0, pietyDenom: 1 },
    desc: 'call upon Trog for regeneration and willpower' },
  { id: 'ABIL_TROG_BROTHERS_IN_ARMS', name: 'Brothers in Arms', god: 'GOD_TROG', rank: 4, mp: 0, piety: 5,
    fail: { basis: 'invo', base: 160, mult: 0, pietyDenom: 1 }, desc: 'call in reinforcements' },

  // Okawaru.
  { id: 'ABIL_OKAWARU_HEROISM', name: 'Heroism', god: 'GOD_OKAWARU', rank: 1, mp: 2, piety: 3,
    fail: { basis: 'invo', base: 30, mult: 6, pietyDenom: 20 }, desc: 'gain great but temporary skills' },
  { id: 'ABIL_OKAWARU_FINESSE', name: 'Finesse', god: 'GOD_OKAWARU', rank: 4, mp: 5, piety: 5,
    fail: { basis: 'invo', base: 60, mult: 4, pietyDenom: 25 }, desc: 'speed up your combat' },

  // Makhleb.
  { id: 'ABIL_MAKHLEB_DESTRUCTION', name: 'Unleash Destruction', god: 'GOD_MAKHLEB', rank: 2,
    mp: 0, hp: [65, 2], piety: 0, targeted: true,
    fail: { basis: 'invo', base: 20, mult: 5, pietyDenom: 20 },
    desc: "unleash Makhleb's destructive might" },
  { id: 'ABIL_MAKHLEB_INFERNAL_SERVANT', name: 'Infernal Servant', god: 'GOD_MAKHLEB', rank: 3,
    mp: 0, hp: [0, 8], piety: 4, fail: { basis: 'invo', base: 40, mult: 5, pietyDenom: 20 },
    desc: 'summon an infernal servant of Makhleb' },

  // Sif Muna.
  { id: 'ABIL_SIF_MUNA_CHANNEL_ENERGY', name: 'Channel Magic', god: 'GOD_SIF_MUNA', rank: 1,
    mp: 0, piety: 2, fail: { basis: 'invo', base: 60, mult: 4, pietyDenom: 25 },
    desc: 'call upon Sif Muna for magical energy' },

  // Elyvilon.
  { id: 'ABIL_ELYVILON_PURIFICATION', name: 'Purification', god: 'GOD_ELYVILON', rank: 1,
    mp: 2, piety: 2, fail: { basis: 'invo', base: 20, mult: 5, pietyDenom: 20 },
    desc: 'purify yourself' },
  { id: 'ABIL_ELYVILON_HEAL_SELF', name: 'Heal Self', god: 'GOD_ELYVILON', rank: 3,
    mp: 2, piety: 3, fail: { basis: 'invo', base: 40, mult: 5, pietyDenom: 20 },
    desc: 'provide healing for yourself' },
  { id: 'ABIL_ELYVILON_DIVINE_VIGOUR', name: 'Divine Vigour', god: 'GOD_ELYVILON', rank: 5,
    mp: 0, piety: 6, fail: { basis: 'invo', base: 80, mult: 4, pietyDenom: 25 },
    desc: 'call upon Elyvilon for divine vigour' },
];

export const ABILITY_BY_ID = new Map(ABILITIES.map((a) => [a.id, a]));

export const MAX_PIETY = 200;
export const NUM_PIETY_STARS = 6;

/** religion.cc `piety_breakpoint`: { 30, 50, 75, 100, 120, 160 }. */
export function pietyBreakpoint(i: number): number {
  const points = [30, 50, 75, 100, 120, 160];
  return i >= 0 && i < NUM_PIETY_STARS ? points[i] : 255;
}

/** religion.cc `piety_rank`: the star count, 0..6. */
export function pietyRank(piety: number): number {
  for (let i = NUM_PIETY_STARS; i >= 1; i--) if (piety >= pietyBreakpoint(i - 1)) return i;
  return 0;
}

/** religion.cc `piety_scale`: faith is not modelled, so this is the identity. */
export function pietyScale(piety: number): number {
  return piety;
}

export function godOf(p: Player): GodDef | null {
  return p.god ? GOD_BY_ID.get(p.god) ?? null : null;
}

export function worships(p: Player, god: string): boolean {
  return p.god === god;
}

/** ability.cc `failure_info::chance`: base - invo*mult - piety/pietyDenom. */
export function abilityFailChance(p: Player, a: AbilityDef): number {
  const skill = a.fail.basis === 'xl' ? p.xl
    : a.fail.mult ? skillOf(p, 'invocations', a.fail.mult) : 0;
  const pietyMod = a.fail.pietyDenom ? Math.trunc(p.piety / a.fail.pietyDenom) : 0;
  return a.fail.base - skill - pietyMod;
}

/** ability.cc `generic_cost::cost`: base + random2avg((base + 1) / 2 + 1, 1). */
export function abilityPietyCost(_p: Player, a: AbilityDef, rng: { int(n: number): number }): number {
  if (a.piety <= 0) return 0;
  const add = Math.trunc((a.piety + 1) / 2) + 1;
  return a.piety + (add > 0 ? rng.int(add) : 0);
}

/** ability.cc `scaling_cost::cost`: fixed + (permille * maxhp + 500) / 1000. */
export function abilityHpCost(p: Player, a: AbilityDef): number {
  if (!a.hp) return 0;
  const [permille, fixed] = a.hp;
  return fixed + Math.trunc((permille * p.hpMax + 500) / 1000);
}

export function abilityMpCost(_p: Player, a: AbilityDef): number {
  return a.mp;
}

export function abilityAvailable(p: Player, a: AbilityDef): boolean {
  return p.god === a.god && pietyRank(p.piety) >= a.rank;
}

/**
 * religion.cc `_gain_piety_point`: one point, with the gift-timeout and high-piety taper.
 * The port has no god gifts, so `giftTimeout` stays zero; the taper is exact.
 */
function gainPietyPoint(p: Player, rng: { oneChanceIn(n: number): boolean }): void {
  if (p.penance > 0) { p.penance--; return; }
  if (p.piety >= MAX_PIETY
      || (p.piety >= pietyBreakpoint(5) && rng.oneChanceIn(3))
      || (p.piety >= pietyBreakpoint(3) && rng.oneChanceIn(3))) {
    return;
  }
  p.piety = Math.min(MAX_PIETY, p.piety + 1);
}

/** religion.cc `gain_piety`: div_rand_round(gain, denom) points. */
export function gainPiety(p: Player, gain: number, denom: number,
  rng: { int(n: number): number; oneChanceIn(n: number): boolean }): void {
  if (p.god === null || gain <= 0) return;
  const n = pietyScale(gain);
  const points = divRandRound(n, Math.max(1, denom), rng);
  for (let i = 0; i < points; i++) gainPietyPoint(p, rng);
}

export function losePiety(p: Player, amount: number): void {
  if (amount <= 0) return;
  p.piety = Math.max(0, p.piety - amount);
  if (p.piety < 1) { p.god = null; p.penance = 0; }
}

function divRandRound(num: number, den: number, rng: { int(n: number): number }): number {
  const rem = num % den;
  return Math.trunc(num / den) + (rem && rng.int(den) < rem ? 1 : 0);
}

/** The monster holiness classes of mon-data.h that the conduct code uses. */
export interface Holiness { natural: boolean; undead: boolean; demonic: boolean; holy: boolean; nonliving: boolean; plant: boolean }

/** god-conduct.cc `_piety_bonus_for_holiness`: -6 natural/plant/nonliving, -5 undead, -4 demonic, -3 holy. */
export function pietyBonusForHoliness(h: Holiness): number {
  if (h.natural || h.plant || h.nonliving) return -6;
  if (h.undead) return -5;
  if (h.demonic) return -4;
  if (h.holy) return -3;
  return -6;
}

/**
 * The kill piety of the gods this port implements, god-conduct.cc `divine_likes`:
 * KILL_* response `_on_kill` with denom 18 and XL denominator 2 for the non-good gods,
 * and Okawaru's `okawaru_kill` special (religion.cc `get_fuzzied_monster_difficulty`).
 */
export function gainKillPiety(p: Player, h: Holiness, monsterExp: number, monsterHd: number,
  rng: { int(n: number): number; oneChanceIn(n: number): boolean }): void {
  if (!p.god) return;
  if (p.god === 'GOD_OKAWARU') {
    // religion.cc get_fuzzied_monster_difficulty: exp_value * 100, random2 twice, / (1 + sqrt(exp_needed(xl)/30)).
    const exp = monsterExp * 100;
    const fuzz = rng.int(exp) + rng.int(exp);
    const factor = Math.sqrt(expNeeded(p.xl) / 30);
    const piety = Math.trunc(fuzz / (1 + factor));
    gainPiety(p, piety, 550, rng);
    return;
  }
  if (p.god === 'GOD_TROG' || p.god === 'GOD_MAKHLEB' || p.god === 'GOD_SIF_MUNA'
      || p.god === 'GOD_VEHUMET') {
    let denom = 18 - Math.trunc(p.xl / 2);
    const gain = denom + pietyBonusForHoliness(h);
    gainPiety(p, Math.max(0, gain), Math.max(1, denom), rng);
  }
  // Elyvilon likes exploration, not killing; Zin hates killing the unclean. Neither is a kill
  // conduct for this port's gods except Elyvilon's exploration, handled in game.ts.
  void monsterHd;
}

/** religion.cc `exp_needed`, player.cc. */
export function expNeeded(level: number): number {
  let lev = level, v: number;
  switch (lev) {
    case 1: v = 1; break;
    case 2: v = 10; break;
    case 3: v = 30; break;
    case 4: v = 70; break;
    default:
      if (lev < 13) { lev -= 4; v = 10 + 10 * lev + (60 << lev); }
      else { lev -= 12; v = 16675 + 5985 * lev + 4235 * lev * lev; }
  }
  return v;
}

/** Elyvilon's exploration piety, god-conduct.cc: `piety = 20`, denom is the level. */
export function gainExplorationPiety(p: Player, level: number,
  rng: { int(n: number): number; oneChanceIn(n: number): boolean }): void {
  if (p.god === 'GOD_ELYVILON') gainPiety(p, 20, Math.max(1, level), rng);
}

/** Trog's spellcasting peeve, god-conduct.cc divine_peeves: 1 piety per 5 points, penance 5/level. */
export function trogSpellConduct(p: Player, rank: number): void {
  if (p.god === 'GOD_TROG' && rank > 0) losePiety(p, rank);
}

/** religion.cc `_set_initial_god_piety` and ng-setup.cc: a Berserker starts with 35 piety. */
export function startingPiety(jobName: string): { god: string | null; piety: number } {
  if (jobName === 'Berserker') return { god: 'GOD_TROG', piety: 35 };
  if (jobName === 'Chaos Knight') return { god: null, piety: 0 };
  return { god: null, piety: 0 };
}

/** The divine title shown on the character sheet, religion.cc `_get_god_powers` names. */
export function godTitle(p: Player): string {
  const god = godOf(p);
  if (!god) return '';
  const rank = pietyRank(p.piety);
  if (rank >= 6) return `the Champion of ${god.name}`;
  if (rank >= 4) return `the Priest of ${god.name}`;
  if (rank >= 2) return `the Follower of ${god.name}`;
  return `the Believer of ${god.name}`;
}
