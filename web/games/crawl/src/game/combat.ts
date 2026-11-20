// The original's melee: attack::calc_pre_roll_to_hit, test_hit, calc_damage and actor::apply_ac, and
// the monster attacks of melee-attack.cc. Numbers come from the same formulas; the port has no gods,
// forms or temporary enchantments it does not model.
import type { Rng } from './rng.ts';
import type { Player } from './player.ts';
import { dexterity, evasion, armourClass, skillOf, strength, trainSkill } from './player.ts';
import type { Level, Monster } from './model.ts';
import { MONSTER_BY_ID } from './data.ts';
import { itemName, weaponDef } from './items.ts';

export interface CombatCtx {
  rng: Rng;
  player: Player;
  level: Level;
  msg(text: string, colour?: string): void;
  onMonsterKilled(m: Monster): void;
  onPlayerDamaged(amount: number): void;
  onPlayerKilled(monster: Monster): void;
}

const sign = (n: number) => n >= 0 ? `+${n}` : `${n}`;

function maybeRandom2Div(rng: Rng, nom: number, denom: number): number {
  return Math.trunc(rng.int(nom + denom) / denom);
}
function statModifyDamage(p: Player, damage: number, weaponSkill: string): number {
  const useStr = !['long_blades', 'short_blades', 'ranged_weapons'].includes(weaponSkill);
  const attr = useStr ? strength(p) : dexterity(p);
  return Math.trunc(damage * Math.max(1, 75 + 2.5 * attr) / 100);
}
function applyWeaponSkill(rng: Rng, p: Player, damage: number, key: string): number {
  const sklvl = skillOf(p, key, 100);
  return Math.trunc(damage * (2500 + rng.int(sklvl + 1)) / 2500);
}
function applyFightingSkill(rng: Rng, p: Player, damage: number): number {
  const sklvl = skillOf(p, 'fighting', 100);
  return Math.trunc(damage * (3000 + rng.int(sklvl + 1)) / 3000);
}
function divRoundNear(num: number, den: number): number {
  const rem = num % den;
  return Math.trunc(num / den) + (rem >= den / 2 ? 1 : 0);
}
function gdr(ac: number): number { return Math.floor(16 * Math.sqrt(Math.sqrt(Math.max(0, ac)))); }
function applyAc(rng: Rng, damage: number, ac: number, maxDamage: number, useGdr: boolean): number {
  let saved = rng.int(1 + ac);
  if (useGdr) saved = Math.max(saved, Math.min(Math.trunc(gdr(ac) * maxDamage / 100), rng.divRandRound(ac, 2)));
  return Math.max(0, damage - saved);
}

function visibleName(m: Monster): string { return m.name === 'you' ? 'you' : `the ${m.name}`; }

export function playerAttack(ctx: CombatCtx, mon: Monster): boolean {
  const { rng, player: p } = ctx;
  const weapon = p.gear.weapon;
  const w = weapon ? weaponDef(weapon.id) : null;
  const wkey = w ? w.skill.replace(/^SK_/, '').toLowerCase() : 'unarmed_combat';
  let toHit = 15 + Math.trunc(dexterity(p) / 2);
  toHit += maybeRandom2Div(rng, skillOf(p, 'fighting', 100), 100);
  toHit += maybeRandom2Div(rng, skillOf(p, wkey, 100), 100);
  if (w) toHit += w.hit;
  if (weapon) toHit += weapon.plus;
  if (!w) toHit += 6;
  if ((p.status.DUR_BLIND ?? 0) > 0) toHit -= 5;
  const monEv = rng.intAvg(2 * Math.max(0, mon.ev), 2);
  let margin = toHit - monEv;
  if (rng.xChanceInY(5, 100)) margin = (rng.int(2) ? 1 : -1) * 1500;
  const hit = margin >= 0;
  if (!hit) {
    ctx.msg(`You miss ${visibleName(mon)}.`);
    // a miss can still wake it
    mon.asleep = false;
    return false;
  }
  let potential = w ? w.damage : (3 + Math.trunc(skillOf(p, 'unarmed_combat') / 3));
  potential = statModifyDamage(p, potential * 100, wkey);
  let damage = divRoundNear(rng.int(potential + 1), 100);
  if (w) damage = applyWeaponSkill(rng, p, damage, wkey);
  damage = applyFightingSkill(rng, p, damage);
  const slaying = [p.gear.ring1, p.gear.ring2].reduce((n, r) => n + (r?.id === 'ring of slaying' ? 2 + r.plus : 0), 0);
  damage += slaying;
  if (damage < 1) damage = 1;
  const beforeAc = damage;
  damage = applyAc(rng, damage, Math.max(0, mon.ac), 0, false);
  // brands
  let brandMsg = '';
  if (weapon && damage > 0 && weapon.ego !== 'normal') {
    switch (weapon.ego) {
      case 'flaming': damage += 1 + rng.int(Math.max(1, damage)); brandMsg = ' The weapon burns.'; break;
      case 'freezing': damage += 1 + rng.int(Math.max(1, damage)); brandMsg = ' The weapon freezes.'; break;
      case 'venom': if (rng.xChanceInY(2, 3)) { mon.poisoned = Math.max(mon.poisoned, 3 + rng.int(4)); brandMsg = ' The weapon poisons.'; } break;
      case 'electrocution': if (rng.oneChanceIn(4)) { damage += 8 + rng.int(13); brandMsg = ' Lightning courses through it!'; } break;
      case 'draining': mon.hpMax = Math.max(1, mon.hpMax - 1); brandMsg = ' It drains life.'; break;
      case 'holy_wrath': if (MONSTER_BY_ID.get(mon.def)?.flags.some((f) => f.includes('undead') || f.includes('demon'))) { damage += 1 + Math.trunc(rng.int(damage * 15) / 10); brandMsg = ' It sears the unholy!'; } break;
      case 'vampirism': if (rng.oneChanceIn(2)) { const heal = Math.max(1, Math.trunc(damage / 2)); p.hp = Math.min(p.hpMax, p.hp + heal); brandMsg = ' You feel better.'; } break;
      case 'pain': damage += 1 + rng.int(Math.max(1, Math.trunc(damage / 2))); brandMsg = ' Pain shoots through it.'; break;
      case 'heavy': break;
      case 'protection': p.status.DUR_SPWPN_PROTECTION = 4 + rng.int(5); break;
      default: break;
    }
  }
  if (damage <= 0 && beforeAc > 0) {
    ctx.msg(`You hit ${visibleName(mon)} but do no damage.`);
  } else {
    ctx.msg(`You hit ${visibleName(mon)}${damage >= 10 ? '!!' : damage >= 5 ? '!' : '.'}${brandMsg}`);
  }
  mon.hp -= damage;
  mon.asleep = false;
  mon.known = true;
  if (mon.hp > 0) {
    trainSkill(p, wkey, Math.max(1, Math.trunc(damage)));
    trainSkill(p, 'fighting', Math.max(1, Math.trunc(damage / 2)));
    return true;
  }
  mon.hp = 0;
  ctx.msg(`You kill ${visibleName(mon)}!`, 'LIGHTGREEN');
  ctx.onMonsterKilled(mon);
  return true;
}

export function monsterAttack(ctx: CombatCtx, mon: Monster): void {
  const { rng, player: p } = ctx;
  const def = MONSTER_BY_ID.get(mon.def);
  if (!def) return;
  const attacks = def.attacks.length ? def.attacks : [{ type: 'hit', damage: 1, flavour: 'plain' }];
  const attack = rng.choose(attacks);
  const fighter = def.flags.includes('fighter');
  const toHit = 18 + Math.trunc(def.hd * (fighter ? 5 : 3) / 2);
  const ev = rng.intAvg(2 * Math.max(0, evasion(p)), 2);
  let margin = toHit - ev;
  if (rng.xChanceInY(5, 100)) margin = (rng.int(2) ? 1 : -1) * 1500;
  if (margin < 0) {
    ctx.msg(`${mon.name === 'you' ? 'You' : `The ${mon.name}`} misses you.`);
    return;
  }
  let damage = 1 + rng.int(attack.damage);
  const weapon = def.uses === 'weapons_armour' || def.uses === 'starting_equipment';
  const weaponDamage = weapon ? 3 + Math.trunc(def.hd / 2) : 0;
  if (weaponDamage) damage += rng.int(weaponDamage + 1);
  if (mon.poisoned > 0) damage = Math.max(1, Math.trunc(damage * 2 / 3));
  const ac = armourClass(p);
  damage = applyAc(rng, damage, ac, damage + weaponDamage, true);
  const flavour = attack.flavour ?? 'plain';
  let extra = '';
  if (damage <= 0) {
    ctx.msg(`The ${mon.name} hits you but does no damage.`);
  } else {
    ctx.msg(`The ${mon.name} ${attack.type === 'bite' ? 'bites' : attack.type === 'claw' ? 'claws' : attack.type === 'kick' ? 'kicks' : 'hits'} you${damage >= 10 ? '!!' : damage >= 5 ? '!' : '.'}`);
    if (flavour === 'poison' && rng.oneChanceIn(3)) { p.status.DUR_POISONING = Math.max(p.status.DUR_POISONING ?? 0, 6 + rng.int(6)); extra = ' You are poisoned.'; }
    if (flavour === 'fire') { damage += rng.int(4); extra = ' You are burned.'; }
    if (flavour === 'cold') { damage += rng.int(4); extra = ' You are frozen.'; }
    if (flavour === 'elec') { damage += rng.int(5); extra = ' You are shocked.'; }
    if (flavour === 'drain') { p.xp = Math.max(0, p.xp - 1); extra = ' You feel drained.'; }
    if (extra) ctx.msg(extra.trim(), 'LIGHTRED');
  }
  if (damage > 0) {
    p.hp -= damage;
    ctx.onPlayerDamaged(damage);
    if (p.hp <= 0) ctx.onPlayerKilled(mon);
  }
}

export function itemDamageLine(item: import('./model.ts').Item): string {
  return itemName(item);
}
export function signed(n: number): string { return sign(n); }
