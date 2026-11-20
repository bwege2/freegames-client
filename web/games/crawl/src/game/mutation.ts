// Mutations: mutation-data.h's 213 definitions, their weights and messages, and the
// original's stat effects (MUT_STRONG/CLEVER/AGILE) and potion of mutation sequence
// (potion.cc PotionMutation: remove 2-3, add 1-3, then a 50% chance of a good one).
import { MUTATIONS, type MutationDef } from './data.ts';
import type { Player } from './player.ts';
import type { Rng } from './rng.ts';

export const MUTATION_BY_ID = new Map(MUTATIONS.map((m) => [m.id, m]));

export function mutationDef(id: string): MutationDef | undefined {
  return MUTATION_BY_ID.get(id);
}

/** mutation.cc `_delete_mutation`: remove one level, then the mutation. */
export function removeMutation(p: Player, id: string): boolean {
  const lvl = p.mutations[id] ?? 0;
  if (lvl <= 0) return false;
  if (lvl <= 1) delete p.mutations[id];
  else p.mutations[id] = lvl - 1;
  return true;
}

export function deleteRandomMutation(p: Player, rng: Rng): string | null {
  const ids = Object.keys(p.mutations).filter((id) => (p.mutations[id] ?? 0) > 0 && MUTATION_BY_ID.has(id));
  if (!ids.length) return null;
  const id = rng.choose(ids);
  removeMutation(p, id);
  return id;
}

/** mutation.cc mutate: pick a weighted mutation, raise it one level, return the message. */
export function mutate(p: Player, rng: Rng, beneficial = false): { id: string; message: string } | null {
  const eligible = MUTATIONS.filter((m) => {
    if (m.weight <= 0) return false;
    const lvl = p.mutations[m.id] ?? 0;
    if (lvl >= m.levels) return false;
    if (beneficial && !m.flags.includes('good')) return false;
    if (!beneficial && !m.flags.includes('good') && !m.flags.includes('bad')) return false;
    if (m.flags.includes('temporary')) return false;
    return true;
  });
  if (!eligible.length) return null;
  const def = rng.weighted(eligible.map((m) => [m.weight, m] as [number, MutationDef]));
  const lvl = (p.mutations[def.id] ?? 0) + 1;
  p.mutations[def.id] = lvl;
  const message = def.gain[Math.min(lvl - 1, def.gain.length - 1)] || `You mutate: ${def.short}.`;
  return { id: def.id, message };
}

/** potion.cc PotionMutation::effect. */
export function quaffMutationPotion(p: Player, rng: Rng): string[] {
  const out: string[] = ['You feel extremely strange.'];
  const removes = rng.range(2, 3);
  for (let i = 0; i < removes; i++) deleteRandomMutation(p, rng);
  const adds = rng.range(1, 3);
  for (let i = 0; i < adds; i++) {
    const m = mutate(p, rng);
    if (m) out.push(m.message);
  }
  if (rng.coinflip()) {
    const m = mutate(p, rng, true);
    if (m) out.push(m.message);
  }
  return out;
}
