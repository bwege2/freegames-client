// Test helpers: the OpenClonk oracle (re/openclonk/oracle/build.sh builds it from the pinned source that
// re/openclonk/fetch.sh downloads) and the original's c4group tool from the same build.
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const repo = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../..');
export const re = path.join(repo, 're/openclonk');
export const oracleBin = path.join(re, 'oracle/openclonk-oracle');
export const c4groupBin = path.join(re, 'work/build/c4group');
export const planet = path.join(re, 'orig/openclonk/planet');

/** Why the oracle cannot run here, or null. */
export function oracleMissing(): string | null {
  if (!fs.existsSync(path.join(re, 'orig/openclonk/src'))) return 'no reference source (run re/openclonk/fetch.sh)';
  if (!fs.existsSync(oracleBin)) return 'no oracle (run re/openclonk/oracle/build.sh)';
  return null;
}

export function c4groupMissing(): string | null {
  if (!fs.existsSync(planet)) return 'no reference source (run re/openclonk/fetch.sh)';
  if (!fs.existsSync(c4groupBin)) return 'no c4group tool (run re/openclonk/oracle/build.sh)';
  return null;
}

/** the oracle's answers, one line per command */
export function runOracle(commands: string[]): string[] {
  const r = spawnSync(oracleBin, [], { input: commands.join('\n') + '\n', encoding: 'utf8', maxBuffer: 1 << 28 });
  if (r.status !== 0) throw new Error(`oracle failed (${r.status}): ${r.stderr}`);
  return r.stdout.split('\n').slice(0, commands.length);
}

/** a small deterministic generator for test inputs (mulberry32), not the engine's */
export function inputs(seed: number) {
  let s = seed >>> 0;
  const next = () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0);
  };
  return {
    u32: next,
    i32: () => next() | 0,
    /** an integer in [lo, hi] */
    int: (lo: number, hi: number) => lo + Math.floor((next() / 2 ** 32) * (hi - lo + 1)),
    u64: () => (BigInt(next()) << 32n) | BigInt(next()),
    pick: <T>(xs: T[]): T => xs[next() % xs.length],
  };
}
