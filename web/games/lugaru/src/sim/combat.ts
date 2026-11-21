// Lugaru's attacks and damage. The base numbers are the `DoDamage(damagemult * N / protectionX)`
// calls in Source/Objects/Person.cpp; the animation label is the frame label at which the original
// applies the hit (5 for most attacks, 7 for several reversals/kicks).
import type { Person } from './person.ts';

export type HitPart = 'head' | 'high' | 'low';

export interface AttackDef {
  id: string;
  anim: string;
  damage: number;
  part: HitPart;
  label: number;
  /** the original's range test uses (scale * 5)^2 * rangeFactor */
  rangeFactor: number;
  /** high attacks miss a crouching victim; low attacks hit one */
  height: 'high' | 'middle' | 'low';
  kind: 'punch' | 'kick' | 'weapon' | 'sweep' | 'sneak' | 'reversal';
  sound?: string;
}

export const ATTACKS: Record<string, AttackDef> = {
  punch: { id: 'punch', anim: 'upunchanim', damage: 60, part: 'high', label: 5, rangeFactor: 3, height: 'middle', kind: 'punch', sound: 'WhooshHit' },
  windupPunch: { id: 'windupPunch', anim: 'winduppunchanim', damage: 60, part: 'high', label: 5, rangeFactor: 3, height: 'middle', kind: 'punch', sound: 'WhooshHit' },
  spinKick: { id: 'spinKick', anim: 'spinkickanim', damage: 100, part: 'head', label: 5, rangeFactor: 3, height: 'high', kind: 'kick', sound: 'HeavyImpact' },
  lowKick: { id: 'lowKick', anim: 'lowkickanim', damage: 30, part: 'high', label: 5, rangeFactor: 3, height: 'low', kind: 'kick', sound: 'WhooshHit' },
  sweep: { id: 'sweep', anim: 'sweepanim', damage: 40, part: 'low', label: 5, rangeFactor: 3, height: 'low', kind: 'sweep', sound: 'WhooshHit' },
  rabbitKick: { id: 'rabbitKick', anim: 'rabbitkickanim', damage: 500, part: 'high', label: 5, rangeFactor: 3, height: 'high', kind: 'kick', sound: 'HeavyImpact' },
  dropKick: { id: 'dropKick', anim: 'dropkickanim', damage: 20, part: 'high', label: 7, rangeFactor: 3, height: 'high', kind: 'kick', sound: 'HeavyImpact' },
  knifeSlash: { id: 'knifeSlash', anim: 'knifeslashstartanim', damage: 120, part: 'high', label: 5, rangeFactor: 3, height: 'high', kind: 'weapon', sound: 'KnifeSlice' },
  swordSlash: { id: 'swordSlash', anim: 'swordslashanim', damage: 350, part: 'head', label: 5, rangeFactor: 3, height: 'high', kind: 'weapon', sound: 'SwordSlice' },
  staffHit: { id: 'staffHit', anim: 'staffhitanim', damage: 100, part: 'high', label: 5, rangeFactor: 3, height: 'high', kind: 'weapon', sound: 'StaffBody' },
  staffSpinHit: { id: 'staffSpinHit', anim: 'staffspinhitanim', damage: 350, part: 'head', label: 5, rangeFactor: 3, height: 'high', kind: 'weapon', sound: 'StaffBody' },
  staffGroundSmash: { id: 'staffGroundSmash', anim: 'staffgroundsmashanim', damage: 100, part: 'head', label: 5, rangeFactor: 3, height: 'low', kind: 'weapon', sound: 'StaffGroundSmash' },
  crouchStab: { id: 'crouchStab', anim: 'crouchstabanim', damage: 100, part: 'head', label: 5, rangeFactor: 3, height: 'low', kind: 'weapon', sound: 'KnifeSlice' },
  swordGroundStab: { id: 'swordGroundStab', anim: 'swordgroundstabanim', damage: 100, part: 'head', label: 5, rangeFactor: 3, height: 'low', kind: 'weapon', sound: 'FleshStab' },
  sneakPunch: { id: 'sneakPunch', anim: 'sneakattackanim', damage: 100, part: 'head', label: 7, rangeFactor: 2, height: 'middle', kind: 'sneak', sound: 'HeavyImpact' },
  sneakKnife: { id: 'sneakKnife', anim: 'knifesneakattackanim', damage: 100, part: 'head', label: 7, rangeFactor: 2, height: 'middle', kind: 'sneak', sound: 'FleshStabRemove' },
  sneakSword: { id: 'sneakSword', anim: 'swordsneakattackanim', damage: 100, part: 'head', label: 7, rangeFactor: 2, height: 'middle', kind: 'sneak', sound: 'FleshStabRemove' },
  punchReversal: { id: 'punchReversal', anim: 'upunchreversalanim', damage: 90, part: 'high', label: 7, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'HeavyImpact' },
  sweepReversal: { id: 'sweepReversal', anim: 'sweepreversalanim', damage: 30, part: 'high', label: 7, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'WhooshHit' },
  kickReversal: { id: 'kickReversal', anim: 'spinkickreversalanim', damage: 150, part: 'high', label: 7, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'HeavyImpact' },
  staffReversal: { id: 'staffReversal', anim: 'staffhitreversalanim', damage: 70, part: 'high', label: 5, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'StaffBody' },
  swordReversal: { id: 'swordReversal', anim: 'swordslashreversalanim', damage: 150, part: 'high', label: 7, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'SwordSlice' },
  knifeReversal: { id: 'knifeReversal', anim: 'knifeslashreversalanim', damage: 90, part: 'high', label: 7, rangeFactor: 3, height: 'middle', kind: 'reversal', sound: 'KnifeSlice' },
};

/** Damage after the original's power/tolerance/protection factors. */
export function attackDamage(attacker: Person, victim: Person, def: AttackDef): number {
  const power = attacker.creaturePower * attacker.power;
  const toleranceFactor = victim.damageTolerance / 200;
  const part = def.part;
  const protection = part === 'head' ? victim.protection.head : part === 'low' ? victim.protection.low : victim.protection.high;
  return (power / toleranceFactor) * (def.damage / Math.max(0.01, protection));
}

export function inAttackRange(attacker: Person, victim: Person, def: AttackDef): boolean {
  const reach = attacker.scale * 5;
  const d2 = (attacker.coords.x - victim.coords.x) ** 2 + (attacker.coords.z - victim.coords.z) ** 2;
  if (d2 > reach * reach * def.rangeFactor) return false;
  if (Math.abs(attacker.coords.y - victim.coords.y) > attacker.scale * 12) return false;
  // the original's normaldotproduct(facing, victim - coords) > 0 test
  const fx = attacker.facing.x, fz = attacker.facing.z;
  return fx * (victim.coords.x - attacker.coords.x) + fz * (victim.coords.z - attacker.coords.z) > 0;
}

export function heightMatches(def: AttackDef, victim: Person): boolean {
  if (def.kind === 'sweep') return true;
  if (def.height === 'low') return true;
  if (def.height === 'high') return !victim.crouching;
  return true;
}
