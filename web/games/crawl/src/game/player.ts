// The player: the original's starting stats, skills, hit points, magic points, AC/EV/SH and titles
// (species.cc, jobs.cc, skills.cc, player.cc), its equipment and its progression.
import {
  JOBS, SKILLS, SKILL_ORDER, SPECIES, SPELL_BY_ID, type JobDef, type SpeciesDef, skillKeyOf,
} from './data.ts';
import type { Item } from './model.ts';
import { armourDef, itemFromSpec, itemName, makeArmour, makeWeapon, weaponChoices, weaponDef } from './items.ts';

export const MAX_SKILL_LEVEL = 27;
export const MIN_START_STAT = 3;

const SIZE_VALUE: Record<string, number> = { tiny: 0, little: 1, small: 2, medium: 3, large: 4, big: 5, huge: 6 };
export const sizeValue = (s: string) => SIZE_VALUE[s] ?? 3;

export interface SkillState { points: number; level: number }

export interface Gear {
  weapon: Item | null;
  offhand: Item | null;
  body: Item | null;
  cloak: Item | null;
  helmet: Item | null;
  gloves: Item | null;
  boots: Item | null;
  amulet: Item | null;
  ring1: Item | null;
  ring2: Item | null;
}

export function emptyGear(): Gear {
  return { weapon: null, offhand: null, body: null, cloak: null, helmet: null, gloves: null, boots: null, amulet: null, ring1: null, ring2: null };
}

export const SLOT_NAMES: Record<keyof Gear, string> = {
  weapon: 'weapon', offhand: 'shield', body: 'body armour', cloak: 'cloak', helmet: 'helmet',
  gloves: 'gloves', boots: 'boots', amulet: 'amulet', ring1: 'left ring', ring2: 'right ring',
};

function moduloSkillCost(level: number): number { return 25 * level * (level + 1); }
const COST_TABLE: number[] = (() => {
  const table: number[] = [];
  const breakpoints = [9, 18, 26];
  for (let level = 0; level < 28; level++) {
    let v = moduloSkillCost(level);
    for (const bp of breakpoints) {
      if (level <= bp) break;
      v += Math.trunc(moduloSkillCost(level - bp) / 2);
    }
    table.push(v);
  }
  return table;
})();
export function aptToFactor(apt: number): number { return 1 / Math.exp(Math.log(2) * apt / 4); }
export function skillExpNeeded(level: number, apt: number): number {
  return COST_TABLE[Math.max(0, Math.min(27, level))] * aptToFactor(apt);
}
export function skillLevelFor(points: number, apt: number): number {
  let level = 0;
  while (level < MAX_SKILL_LEVEL && points >= skillExpNeeded(level + 1, apt)) level++;
  return level;
}
export function getSkillRank(level: number): number {
  return level <= 7 ? 0 : level <= 14 ? 1 : level <= 20 ? 2 : level <= 26 ? 3 : 4;
}

export interface Player {
  name: string;
  species: SpeciesDef;
  job: JobDef;
  x: number; y: number;
  hp: number; hpMax: number;
  mp: number; mpMax: number;
  gold: number;
  xl: number;
  xp: number;
  baseStats: [number, number, number];
  skills: Record<string, SkillState>;
  skillOrder: Record<string, number>;
  inventory: Item[];
  gear: Gear;
  knownSpells: string[];
  memorised: string[];
  mutations: Record<string, number>;
  turns: number;
  elapsed: number;
  place: string;
  god: string | null;
  lives: number;
  status: Record<string, number>;
  nextUid: number;
}

export function speciesApt(p: Player, key: string): number {
  const v = p.species.apt[key];
  if (v === undefined) return 0;
  if (v === -99) return -99;
  return Math.max(-99, v - (p.mutations.MUT_UNSKILLED ?? 0));
}
export function hasMutation(p: Player, m: string): boolean { return (p.mutations[m] ?? 0) > 0; }
export function mutationLevel(p: Player, m: string): number { return p.mutations[m] ?? 0; }

export function skillLevel(p: Player, key: string): number {
  return p.skills[key]?.level ?? 0;
}
/** player::skill: level*scale + progress, with 0 for a species that cannot use the skill. */
export function skillOf(p: Player, key: string, scale = 1): number {
  const apt = speciesApt(p, key);
  if (apt <= -99) return 0;
  const st = p.skills[key];
  if (!st) return 0;
  const level = skillLevelFor(st.points, apt);
  if (level >= MAX_SKILL_LEVEL) return level * scale;
  const prev = skillExpNeeded(level, apt);
  const next = skillExpNeeded(level + 1, apt);
  const prog = next === prev ? 0 : Math.trunc((st.points - prev) * scale / (next - prev));
  return level * scale + Math.max(0, Math.min(scale - 1, prog));
}
export function statBonus(p: Player, stat: 'str' | 'int' | 'dex'): number {
  const ring = (i: Item | null) => {
    if (!i || i.cls !== 'ring') return 0;
    if (i.id === 'ring of strength' && stat === 'str') return 3 + i.plus;
    if (i.id === 'ring of dexterity' && stat === 'dex') return 3 + i.plus;
    if (i.id === 'ring of intelligence' && stat === 'int') return 3 + i.plus;
    return 0;
  };
  return ring(p.gear.ring1) + ring(p.gear.ring2);
}
export function strength(p: Player): number { return Math.max(1, p.baseStats[0] + statBonus(p, 'str') + ((p.status.DUR_MIGHT ?? 0) > 0 ? 5 : 0)); }
export function intelligence(p: Player): number { return Math.max(1, p.baseStats[1] + statBonus(p, 'int')); }
export function dexterity(p: Player): number { return Math.max(1, p.baseStats[2] + statBonus(p, 'dex')); }

export function unadjustedBodyArmourPenalty(p: Player): number {
  const b = p.gear.body;
  if (!b) return 0;
  const def = armourDef(b.id);
  if (!def) return 0;
  return Math.max(0, Math.trunc(-def.ev / 10) - 2 * mutationLevel(p, 'MUT_STURDY_FRAME'));
}
function adjustedBodyArmourPenalty(p: Player, scale = 1): number {
  const evp = unadjustedBodyArmourPenalty(p);
  return Math.trunc(2 * evp * evp * (450 - skillOf(p, 'armour', 10)) * scale / (5 * (strength(p) + 3)) / 450);
}
function adjustedShieldPenalty(p: Player, scale = 1): number {
  const s = p.gear.offhand;
  if (!s) return 0;
  const def = armourDef(s.id);
  if (!def) return 0;
  const evp = Math.trunc(-def.ev / 10);
  return Math.trunc(2 * evp * evp * (270 - skillOf(p, 'shields', 10)) * scale / (25 + 5 * strength(p)) / 270);
}
function sizeFactor(p: Player): number { return 2 * (SIZE_VALUE.medium - sizeValue(p.species.size)); }

export function recalc(p: Player): void {
  const xl = p.xl;
  let hp = Math.trunc(xl * 11 / 2) + 8;
  hp += Math.trunc(xl * skillOf(p, 'fighting', 5) / 70) + Math.trunc((skillOf(p, 'fighting', 3) + 1) / 2);
  hp = Math.trunc(hp * (10 + p.species.mods.hp) / 10);
  hp += mutationLevel(p, 'MUT_FLAT_HP') * 4;
  hp = Math.trunc(hp * (100 + mutationLevel(p, 'MUT_ROBUST') * 10 - mutationLevel(p, 'MUT_FRAIL') * 10) / 100);
  p.hpMax = Math.max(1, hp);

  let mp = 0;
  if (!hasMutation(p, 'MUT_HP_CASTING')) {
    const scale = 100;
    const spellcasting = skillOf(p, 'spellcasting', scale);
    const scaledXl = xl * scale;
    let enp = Math.min(23 * scale, scaledXl);
    const spellExtra = spellcasting;
    const invocExtra = Math.trunc(skillOf(p, 'invocations', scale) / 2);
    const highest = Math.max(spellExtra, invocExtra);
    enp += highest + Math.trunc(Math.min(8 * scale, Math.min(highest, scaledXl)) / 2);
    enp = Math.trunc(enp * (100 + mutationLevel(p, 'MUT_HIGH_MAGIC') * 10 - mutationLevel(p, 'MUT_LOW_MAGIC') * 10) / (100 * scale));
    enp += p.species.mods.mp;
    enp = Math.max(0, enp);
    mp = enp;
  }
  p.mpMax = mp;
  if (p.hp > p.hpMax) p.hp = p.hpMax;
  if (p.mp > p.mpMax) p.mp = p.mpMax;
}

/** player::base_ac, in the original's scale-100 units. */
export function armourClassScaled(p: Player, scale = 100): number {
  let ac = 0;
  for (const item of [p.gear.body, p.gear.cloak, p.gear.helmet, p.gear.gloves, p.gear.boots]) {
    if (!item) continue;
    const def = armourDef(item.id);
    if (!def) continue;
    let base = def.ac * 100;
    base = Math.trunc(base * (440 + skillOf(p, 'armour', 20)) / 440);
    if (item === p.gear.body && (mutationLevel(p, 'MUT_DEFORMED') > 0 || mutationLevel(p, 'MUT_PSEUDOPODS') > 0)) {
      base = Math.trunc(base * 6 / 10);
    }
    ac += base;
    ac += item.plus * 100;
    if (item.ego === 'protection') ac += 300;
  }
  ac += (mutationLevel(p, 'MUT_TOUGH_SKIN') + mutationLevel(p, 'MUT_SHAGGY_FUR') + mutationLevel(p, 'MUT_GELATINOUS_BODY')) * 100;
  ac += stoneBodyBonus(p);
  if (p.species.id === 'SP_NAGA') ac += Math.trunc(100 * p.xl / 3);
  if (p.species.id.startsWith('SP_BASE_DRACONIAN') || p.species.name.includes('Draconian')) ac += 400 + Math.trunc(100 * p.xl / 3);
  const rings = [p.gear.ring1, p.gear.ring2].filter((r) => r?.id === 'ring of protection').length;
  ac += rings * 400;
  return Math.trunc(ac * scale / 100);
}
export function armourClass(p: Player): number {
  return Math.max(0, Math.floor(armourClassScaled(p, 100) / 100));
}

function stoneBodyBonus(p: Player): number {
  if (mutationLevel(p, 'MUT_STONE_BODY') <= 0) return 0;
  return 200 + Math.trunc(100 * p.xl * 2 / 5) + Math.trunc(100 * Math.max(0, p.xl - 7) * 2 / 5);
}

function armourAdjustedDodgeBonus(p: Player, scale: number): number {
  let dodge = Math.trunc((800 + skillOf(p, 'dodging', 10) * dexterity(p) * 8) * scale / (20 - sizeFactor(p)) / 10 / 10);
  const pen = unadjustedBodyArmourPenalty(p) - 3;
  if (pen <= 0) return dodge;
  if (pen >= strength(p)) return Math.trunc(dodge * strength(p) / (pen * 2));
  dodge -= Math.trunc(dodge * pen / (strength(p) * 2));
  return dodge;
}
export function evasion(p: Player): number {
  const scale = 100;
  const base = (10 + sizeFactor(p)) * scale;
  let natural = base + armourAdjustedDodgeBonus(p, scale) - adjustedBodyArmourPenalty(p, scale) - adjustedShieldPenalty(p, scale);
  natural += mutationLevel(p, 'MUT_GELATINOUS_BODY') * scale + mutationLevel(p, 'MUT_DISTORTION_FIELD') * scale * 2;
  if ((p.status.DUR_AGILITY ?? 0) > 0) natural += 5 * scale;
  return Math.max(0, Math.trunc(natural / scale));
}

function shFromShield(p: Player): number {
  const item = p.gear.offhand;
  if (!item) return 0;
  const def = armourDef(item.id);
  if (!def || !/shield|buckler/.test(def.name)) return 0;
  const base = def.ac * 2;
  let shield = base * 50;
  shield += Math.trunc(base * skillOf(p, 'shields', 5) / 2);
  shield += item.plus * 200;
  shield += skillOf(p, 'shields', 38);
  shield += 3 * 38;
  shield += Math.trunc(dexterity(p) * 38 * (base + 13) / 26);
  shield += mutationLevel(p, 'MUT_LARGE_BONE_PLATES') * 400 + (mutationLevel(p, 'MUT_LARGE_BONE_PLATES') > 0 ? 400 : 0);
  return shield;
}
export function playerArmourShieldSpellPenalty(p: Player): number {
  const body = Math.max(0, Math.trunc(19 * adjustedBodyArmourPenalty(p, 100) / 100));
  const shield = Math.max(0, Math.trunc(19 * adjustedShieldPenalty(p, 100) / 100));
  return body + shield;
}

export function shieldClass(p: Player): number {
  return Math.floor(Math.max(0, shFromShield(p)) / 100 / 2);
}

export function bestSkill(p: Player): string {
  let best = SKILL_ORDER[0];
  let bestLevel = 0, bestPos = 1000;
  for (const key of SKILL_ORDER) {
    const level = skillOf(p, key, 10);
    if (level > bestLevel) { best = key; bestLevel = level; bestPos = p.skillOrder[key] ?? 1000; }
    else if (level === bestLevel && (p.skillOrder[key] ?? 1000) < bestPos) { best = key; bestPos = p.skillOrder[key] ?? 1000; }
  }
  return best;
}

export function playerTitle(p: Player, the = true): string {
  const key = bestSkill(p);
  const skill = SKILLS.find((s) => s.key === key);
  const rank = getSkillRank(skillLevel(p, key));
  let title = skill?.titles[rank] ?? 'Adventurer';
  const genus = p.species.name;
  title = title.replace(/@Adj@/g, genus).replace(/@Genus@/g, genus).replace(/@Genus_Short@/g, p.species.abbr)
    .replace(/@genus@/g, genus.toLowerCase()).replace(/@Walker@/g, 'Walker').replace(/@Weight@/g, 'Feather');
  const article = !the ? '' : title === 'Petite Mort' ? 'La ' : title === 'Who Hides the Stars' ? ', ' : 'the ';
  return article + title;
}

function initSkillOrder(p: Player): void {
  for (const a of SKILL_ORDER) {
    const apt = speciesApt(p, a);
    const pts = p.skills[a]?.points ?? 0;
    const iPoints = pts / (apt > 0 ? aptToFactor(apt) : 1);
    p.skillOrder[a] = 0;
    for (const b of SKILL_ORDER) {
      if (a === b) continue;
      const bApt = speciesApt(p, b);
      const bPoints = (p.skills[b]?.points ?? 0) / (bApt > 0 ? aptToFactor(bApt) : 1);
      if (skillLevel(p, b) === skillLevel(p, a)
          && (bPoints > iPoints || (bPoints === iPoints && SKILL_ORDER.indexOf(b) > SKILL_ORDER.indexOf(a)))) {
        p.skillOrder[a]++;
      }
    }
  }
}

function reassessStartingSkills(p: Player): void {
  for (let i = SKILL_ORDER.length - 1; i >= 0; i--) {
    const key = SKILL_ORDER[i];
    const st = p.skills[key];
    if (!st) continue;
    const apt = speciesApt(p, key);
    if (apt <= -99) {
      if (key === 'armour' && st.level > 0 && p.skills.dodging) {
        p.skills.dodging.points += skillExpNeeded(st.level, 0) + 1;
        p.skills.dodging.level = skillLevelFor(p.skills.dodging.points, speciesApt(p, 'dodging'));
      }
      st.points = 0; st.level = 0; continue;
    }
    st.points = st.level > 0 ? skillExpNeeded(st.level, 0) + 1 : 0;
    st.level = skillLevelFor(st.points, apt);
  }
  const sc = p.skills.spellcasting;
  if (!sc) p.skills.spellcasting = { points: 0, level: 0 };
  if (p.job.spells.length && p.skills.spellcasting.level < 1 && speciesApt(p, 'spellcasting') > -99) {
    p.skills.spellcasting.points = skillExpNeeded(1, speciesApt(p, 'spellcasting'));
    p.skills.spellcasting.level = 1;
  }
}

function addMutations(p: Player): void {
  for (const [m, lvl] of Object.entries(p.species.mutations)) p.mutations[m] = Math.max(p.mutations[m] ?? 0, lvl);
}

export function createPlayer(species: SpeciesDef, job: JobDef, weaponId: string, name: string, rng?: { int(n: number): number; choose<T>(a: T[]): T }): Player {
  const p: Player = {
    name: name.slice(0, 30) || 'Adventurer',
    species, job, x: 0, y: 0, hp: 1, hpMax: 1, mp: 0, mpMax: 0, gold: 0, xl: 1, xp: 0,
    baseStats: [species.stats[0] + job.stats[0], species.stats[1] + job.stats[1], species.stats[2] + job.stats[2]],
    skills: {}, skillOrder: {}, inventory: [], gear: emptyGear(), knownSpells: [], memorised: [],
    mutations: {}, turns: 0, elapsed: 0, place: 'Dungeon:1', god: null, lives: 1, status: {}, nextUid: 1,
  };
  addMutations(p);
  // _unfocus_stats
  for (let i = 0; i < 3; i++) {
    const j = (i + 1) % 3, k = (i + 2) % 3;
    const needed = MIN_START_STAT - p.baseStats[i];
    if (needed > 0) {
      if (p.baseStats[j] > p.baseStats[k]) p.baseStats[j] -= needed;
      else p.baseStats[k] -= needed;
      p.baseStats[i] = MIN_START_STAT;
    }
  }
  for (const key of SKILL_ORDER) {
    const start = job.skills[key] ?? 0;
    p.skills[key] = { points: 0, level: start };
  }
  if (job.name === 'Wanderer') {
    // The original's Wanderer is a random character. The port gives a random spread of the same 12
    // stat points and a small random kit; it is not compared with the original's wanderer.
    const spread = [0, 0, 0];
    for (let i = 0; i < 12; i++) spread[(rng ? rng.int(3) : i % 3)]++;
    p.baseStats = [p.baseStats[0] + spread[0], p.baseStats[1] + spread[1], p.baseStats[2] + spread[2]];
    const schools = ['ice_magic', 'fire_magic', 'air_magic', 'earth_magic', 'alchemy', 'necromancy', 'conjurations'];
    const school = rng ? rng.choose(schools) : 'ice_magic';
    p.skills[school].level = 3;
    p.skills.spellcasting.level = 2;
    p.skills.dodging.level = 2;
    p.skills.fighting.level = 2;
    if (job.equipment.length === 0) {
      const kit = ['robe', 'potion of might', 'potion of curing'];
      for (const spec of kit) {
        const item = itemFromSpec(spec);
        if (item) { item.uid = p.nextUid++; p.inventory.push(item); equipIfPossible(p, item, false); }
      }
      const dagger = makeWeapon('WPN_DAGGER');
      dagger.uid = p.nextUid++;
      p.inventory.push(dagger);
      equipIfPossible(p, dagger, false);
    }
  }
  // give_items_skills' class specials
  if (job.name === 'Berserker') p.skills.armour.level += 2;
  if (job.name === 'Artificer') {
    if ((speciesApt(p, 'armour')) < (speciesApt(p, 'dodging'))) p.skills.dodging.level++;
    else p.skills.armour.level++;
  }
  if (job.name === 'Chaos Knight') {
    if ((speciesApt(p, 'armour')) < (speciesApt(p, 'dodging'))) p.skills.dodging.level++;
    else p.skills.armour.level++;
  }
  // equipment: the chosen weapon first (unless the species has no hands)
  if (weaponId && weaponId !== 'WPN_UNARMED' && !hasMutation(p, 'MUT_NO_GRASPING')) {
    const weapon = makeWeapon(weaponId);
    weapon.uid = p.nextUid++;
    p.gear.weapon = weapon;
    p.inventory.push(weapon);
  }
  for (const spec of job.equipment) {
    let item = itemFromSpec(spec);
    if (!item) continue;
    if (item.cls === 'armour') {
      const def = armourDef(item.id);
      const sizeV = sizeValue(species.size);
      if (def?.slot === 'SLOT_BODY_ARMOUR' && !canEquip(p, item)) {
        if (hasMutation(p, 'MUT_FORMLESS')) item = makeArmour('ARM_CLOAK', Math.max(1, item.plus));
        else if (hasMutation(p, 'MUT_NO_ARMOUR') || species.name === 'Octopode') continue;
        else item = makeArmour('ARM_ROBE');
      } else if (def?.slot === 'SLOT_OFFHAND' && !canEquip(p, item)) {
        const plus = item.plus;
        if (sizeV > sizeValue('medium') && !species.flags.includes('small_torso')) item = makeArmour('ARM_KITE_SHIELD', plus);
        else if (sizeV < sizeValue('medium')) item = makeArmour('ARM_BUCKLER', plus);
      }
    }
    item.uid = p.nextUid++;
    p.inventory.push(item);
    equipIfPossible(p, item, false);
  }
  // weapon skill comes from the weapon (give_job_skills SK_WEAPON)
  const weaponSkillLevel = job.skills.weapon ?? 0;
  if (weaponSkillLevel && p.gear.weapon) {
    const w = weaponDef(p.gear.weapon.id);
    if (w) {
      const key = skillKeyOf(w.skill);
      p.skills[key] = p.skills[key] ?? { points: 0, level: 0 };
      p.skills[key].level += weaponSkillLevel;
    }
  }
  if (hasMutation(p, 'MUT_NO_ARMOUR')) p.skills.shields.level = 0;
  reassessStartingSkills(p);
  const sizeV = sizeValue(species.size);
  const cannotWearBody = sizeV < sizeValue('small') || hasMutation(p, 'MUT_NO_ARMOUR')
    || hasMutation(p, 'MUT_FORMLESS');
  if (cannotWearBody) {
    const armour = p.skills.armour;
    if (armour && armour.points > 0) {
      p.skills.dodging.points += armour.points;
      p.skills.dodging.level = skillLevelFor(p.skills.dodging.points, speciesApt(p, 'dodging'));
      armour.points = 0; armour.level = 0;
    }
  }
  if (hasMutation(p, 'MUT_INNATE_CASTER')) {
    const magic = SKILL_ORDER.slice(SKILL_ORDER.indexOf('spellcasting'));
    let sum = 0;
    for (const k of magic) sum += p.skills[k]?.points ?? 0;
    const per = Math.trunc(sum / magic.length);
    for (const k of magic) {
      if (!p.skills[k]) p.skills[k] = { points: 0, level: 0 };
      p.skills[k].points = per;
      p.skills[k].level = skillLevelFor(per, speciesApt(p, k));
    }
  }
  initSkillOrder(p);
  if (hasMutation(p, 'MUT_INNATE_CASTER')) p.skillOrder.spellcasting = -1;
  recalc(p);
  p.hp = p.hpMax; p.mp = p.mpMax;
  if (hasMutation(p, 'MUT_MULTILIVED')) p.lives = 1;
  // The job's library; the first spell is memorised if it is level 1 (ng-setup.cc _give_job_spells).
  for (const id of job.spells) {
    if (hasMutation(p, 'MUT_INNATE_CASTER')) p.memorised.push(id);
    p.knownSpells.push(id);
  }
  if (!hasMutation(p, 'MUT_INNATE_CASTER') && job.spells.length) {
    const first = job.spells[0];
    if ((SPELL_BY_ID.get(first)?.level ?? 9) <= 1) p.memorised.push(first);
  }
  return p;
}

export function canEquip(p: Player, item: Item): boolean {
  if (item.cls === 'weapon') return !hasMutation(p, 'MUT_NO_GRASPING');
  if (item.cls !== 'armour') return false;
  const def = armourDef(item.id);
  if (!def) return false;
  if (def.slot === 'SLOT_BODY_ARMOUR' && (hasMutation(p, 'MUT_NO_ARMOUR') || hasMutation(p, 'MUT_FORMLESS') || p.species.name === 'Octopode')) return false;
  if (def.slot === 'SLOT_OFFHAND' && (hasMutation(p, 'MUT_MISSING_HAND') || hasMutation(p, 'MUT_NO_GRASPING'))) return false;
  if (def.slot === 'SLOT_BODY_ARMOUR' || def.slot === 'SLOT_OFFHAND') {
    const sz = sizeValue(p.species.size);
    const min = sizeValue(def.fitMin.replace('SIZE_', '').toLowerCase());
    const max = sizeValue(def.fitMax.replace('SIZE_', '').toLowerCase());
    if (p.species.flags.includes('small_torso') && (def.slot === 'SLOT_BODY_ARMOUR' || def.slot === 'SLOT_OFFHAND')) { /* a small torso can wear it */ }
    else if (sz < min || sz > max) return false;
  }
  if (def.slot === 'SLOT_BOOTS' && p.species.flags.includes('no_feet')) return false;
  if (def.slot === 'SLOT_GLOVES' && (hasMutation(p, 'MUT_NO_GRASPING') || p.species.name === 'Octopode')) return false;
  if (def.slot === 'SLOT_HELMET' && p.species.name === 'Octopode') return false;
  return true;
}

export function equipSlot(item: Item): keyof Gear | null {
  if (item.cls === 'weapon') return 'weapon';
  if (item.cls === 'amulet') return 'amulet';
  if (item.cls === 'ring') return 'ring1';
  if (item.cls !== 'armour') return null;
  const def = armourDef(item.id);
  if (!def) return null;
  if (def.slot === 'SLOT_OFFHAND') return 'offhand';
  if (def.slot === 'SLOT_BODY_ARMOUR') return 'body';
  if (def.slot === 'SLOT_CLOAK') return 'cloak';
  if (def.slot === 'SLOT_HELMET') return 'helmet';
  if (def.slot === 'SLOT_GLOVES') return 'gloves';
  if (def.slot === 'SLOT_BOOTS') return 'boots';
  return null;
}

export function equipIfPossible(p: Player, item: Item, announce = true): boolean {
  if (!canEquip(p, item)) return false;
  let slot = equipSlot(item);
  if (!slot) return false;
  if (slot === 'ring1' && p.gear.ring1) slot = 'ring2';
  if (slot === 'ring2' && p.gear.ring2) slot = 'ring1';
  if (slot === 'weapon' && p.gear.weapon) p.gear.weapon = null;
  p.gear[slot] = item;
  recalc(p);
  if (announce) { /* the caller writes the message */ }
  return true;
}

export function unequip(p: Player, slot: keyof Gear): Item | null {
  const it = p.gear[slot];
  p.gear[slot] = null;
  recalc(p);
  return it;
}

export function canLearnSpell(p: Player, spellLevel: number): boolean {
  return p.xl >= spellLevel * 2;
}

export function gainXp(p: Player, amount: number): boolean {
  if (amount <= 0) return false;
  p.xp += amount;
  let leveled = false;
  while (p.xl < 27 && p.xp >= expNeeded(p.xl + 1, p.species.mods.xp)) {
    p.xl++;
    leveled = true;
  }
  if (leveled) recalc(p);
  return leveled;
}

export function expNeeded(level: number, xpApt = 0): number {
  let lev = level;
  let v: number;
  switch (lev) {
    case 1: v = 1; break;
    case 2: v = 10; break;
    case 3: v = 30; break;
    case 4: v = 70; break;
    default:
      if (lev < 13) { lev -= 4; v = 10 + 10 * lev + (60 << lev); }
      else { lev -= 12; v = 16675 + 5985 * lev + 4235 * lev * lev; }
  }
  return Math.floor((v - 1) * aptToFactor(xpApt - 1));
}

export function trainSkill(p: Player, key: string, points: number): void {
  const st = p.skills[key];
  if (!st) return;
  const apt = speciesApt(p, key);
  if (apt <= -99) return;
  st.points += Math.max(0, Math.trunc(points));
  const old = st.level;
  st.level = skillLevelFor(st.points, apt);
  if (st.level !== old) {
    if (key === 'fighting' || key === 'armour' || key === 'spellcasting' || key === 'invocations') {
      // hit points and magic points depend on these
      const hpRatio = p.hpMax ? p.hp / p.hpMax : 1;
      recalc(p);
      p.hp = Math.max(1, Math.round(p.hpMax * hpRatio));
      p.mp = Math.min(p.mp, p.mpMax);
    }
  }
}

export function skillProgress(p: Player, key: string): number {
  const st = p.skills[key];
  if (!st) return 0;
  const apt = speciesApt(p, key);
  if (apt <= -99) return 0;
  const level = skillLevelFor(st.points, apt);
  if (level >= MAX_SKILL_LEVEL) return 0;
  const prev = skillExpNeeded(level, apt);
  const next = skillExpNeeded(level + 1, apt);
  return next === prev ? 0 : Math.min(99, Math.max(0, Math.floor((st.points - prev) * 100 / (next - prev))));
}

export function startingWeaponChoices(species: SpeciesDef, job: JobDef): string[] {
  if (job.weaponChoice === 'none') return [];
  const good = job.weaponChoice === 'good';
  const hasShield = job.equipment.some((e) => /shield|buckler/.test(e));
  const list = weaponChoices(good, species.size, hasShield);
  return list;
}

export function validCombos(): Set<string> {
  // combos are the original's -playable-json list; the job's abbreviation is enough.
  return new Set(JOBS.map((j) => j.abbr));
}

export function jobByName(name: string): JobDef | undefined {
  return JOBS.find((j) => j.name.toLowerCase() === name.toLowerCase());
}
export function speciesByName(name: string): SpeciesDef | undefined {
  return SPECIES.find((s) => s.name.toLowerCase() === name.toLowerCase());
}

export function itemLine(item: Item): string { return itemName(item); }
