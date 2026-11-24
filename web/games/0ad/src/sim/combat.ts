// Combat values, exactly as the original's scripts compute them:
//  * AttackHelper.GetTotalAttackEffects (simulation/helpers/Attack.js): every damage type is
//    reduced by 10% per point of the target's matching armour (0.9 ^ armour), then the sum is
//    multiplied by the product of every matching bonus.
//  * AttackHelper.GetAttackBonus: a bonus with Classes matches through MatchesClassList; a bonus
//    with Civ applies only against that civilisation.
//  * MatchesClassList (globalscripts/Templates.js): whitespace separates alternative groups,
//    '+' separates requirements inside one group, '!' negates a class.
import type { AttackEffect, TemplateInfo } from '../data/template-info.ts';
import type { Entity } from './types.ts';

/** MatchesClassList(classes, match): any whitespace-separated group whose '+' terms all hold. */
export function matchesClassList(classes: readonly string[], match: string | readonly string[]): boolean {
  const groups = typeof match === 'string' ? match.split(/\s+/) : match;
  for (const group of groups) {
    const terms = group.split(/[+\s]+/).filter(Boolean);
    if (!terms.length) continue;
    if (terms.every((c) => (c[0] === '!' ? !classes.includes(c.slice(1)) : classes.includes(c)))) return true;
  }
  return false;
}

/** AttackHelper.GetAttackBonus: product of the multipliers of every matching bonus. */
export function attackBonus(attack: AttackEffect, target: Pick<TemplateInfo, 'classes' | 'civ'>): number {
  let bonus = 1;
  for (const b of attack.bonuses) {
    if (b.civ && b.civ !== target.civ) continue;
    if (matchesClassList(target.classes, b.classes)) bonus *= b.multiplier;
  }
  return bonus;
}

/** The damage of one attack against one target, before health is changed. */
export function attackDamage(attack: AttackEffect, target: TemplateInfo): Record<string, number> {
  const bonus = attackBonus(attack, target);
  const out: Record<string, number> = {};
  for (const [type, value] of Object.entries(attack.damage)) {
    const armour = target.armour[type] ?? 0;
    out[type] = value * Math.pow(0.9, armour) * bonus;
  }
  return out;
}

export function totalDamage(damage: Record<string, number>): number {
  let total = 0;
  for (const v of Object.values(damage)) total += v;
  return total;
}

/** Whether the attack may target this entity (Attack.RestrictedClasses). */
export function canTarget(attack: AttackEffect, target: TemplateInfo): boolean {
  if (!attack.restrictedClasses.length) return true;
  return !matchesClassList(target.classes, attack.restrictedClasses.join(' '));
}

/**
 * A target preference score. 0 A.D.'s UnitAI prefers enemies whose classes match
 * Attack/Melee/PreferredClasses, then nearer targets; this is that order.
 */
export function targetScore(attacker: Entity, attack: AttackEffect, target: Entity): number {
  if (!target.alive) return -1;
  if (target.player === attacker.player) return -1;
  if (target.player === 0 && attacker.player !== 0) return -1;
  if (!canTarget(attack, target.info)) return -1;
  let score = 1000 - Math.hypot(target.x - attacker.x, target.z - attacker.z);
  if (attack.preferredClasses.length && matchesClassList(target.info.classes, attack.preferredClasses.join(' '))) score += 5000;
  // military units are more valuable than civilians; buildings are a last resort for units
  if (target.info.classes.includes('Structure')) score -= 4000;
  if (target.info.classes.includes('CitizenSoldier')) score += 1000;
  return score;
}
