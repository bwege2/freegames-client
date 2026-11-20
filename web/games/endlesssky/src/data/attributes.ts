// Outfit attribute arithmetic, as the reference release stores it
// (source/Outfit.cpp): attributes are integers scaled by 10,000, so values
// read from the data files keep the precision they were written with.
import type { DataNode } from './node.ts';
import { token, value } from './node.ts';

export const ATTRIBUTE_PRECISION = 10000;

export class Stats {
  /** attribute name -> value * 10,000 (an integer, like Outfit::attributes) */
  readonly precise = new Map<string, number>();
  cost = 0;
  mass = 0;

  get(name: string): number {
    return (this.precise.get(name) ?? 0) / ATTRIBUTE_PRECISION;
  }

  add(name: string, amount: number): void {
    this.precise.set(name, (this.precise.get(name) ?? 0) + Math.round(amount * ATTRIBUTE_PRECISION));
  }

  set(name: string, amount: number): void {
    this.precise.set(name, Math.round(amount * ATTRIBUTE_PRECISION));
  }

  /** `Outfit::Add`: cost, mass and all attributes, times a count. */
  addStats(other: Stats, count = 1): void {
    this.cost += other.cost * count;
    this.mass += other.mass * count;
    for (const [name, amount] of other.precise) this.precise.set(name, (this.precise.get(name) ?? 0) + amount * count);
  }

  clone(): Stats {
    const copy = new Stats();
    copy.cost = this.cost;
    copy.mass = this.mass;
    for (const [name, amount] of this.precise) copy.precise.set(name, amount);
    return copy;
  }
}

/**
 * Load an `attributes` block (or an outfit's own attributes) the way
 * Outfit::Load does: `cost`, `mass`, `category`, `series`, `index` and
 * `description` are special, every other numeric key is an attribute.
 */
export function loadStats(node: DataNode): Stats {
  const stats = new Stats();
  for (const child of node.children) {
    const key = token(child, 0);
    if (key === 'cost' && child.tokens.length >= 2) stats.cost = value(child, 1);
    else if (key === 'mass' && child.tokens.length >= 2) stats.mass = value(child, 1);
    else if (key === 'category' || key === 'series' || key === 'index' || key === 'description' || key === 'thumbnail'
      || key === 'weapon' || key === 'gun' || key === 'turret' || key === 'engine' || key === 'outfits'
      || key === 'sprite' || key === 'flare sprite' || key === 'reverse flare sprite' || key === 'steering flare sprite'
      || key === 'flare sound' || key === 'reverse flare sound' || key === 'steering flare sound'
      || key === 'afterburner effect' || key === 'jump effect' || key === 'hyperdrive sound'
      || key === 'hyperdrive in sound' || key === 'hyperdrive out sound' || key === 'jump sound' || key === 'jump in sound'
      || key === 'jump out sound' || key === 'cargo scan sound' || key === 'outfit scan sound'
      || key === 'licenses' || key === 'add' || key === 'remove') {
      continue;
    } else if (child.tokens.length >= 2 && isFiniteNumber(token(child, 1))) {
      stats.add(key, value(child, 1));
    }
  }
  return stats;
}

function isFiniteNumber(text: string): boolean {
  if (!text) return false;
  return Number.isFinite(Number(text));
}
