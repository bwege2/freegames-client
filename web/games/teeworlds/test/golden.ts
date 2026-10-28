// Reading the server oracle's goldens (re/teeworlds/golden/<scenario>/, written by re/teeworlds/oracle/).
import { readFileSync, existsSync, readdirSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { fileURLToPath } from 'node:url';

export const GOLDEN = fileURLToPath(new URL('../../../../re/teeworlds/golden/', import.meta.url));
export const MAPS = fileURLToPath(new URL('../assets/maps/', import.meta.url));

export function jsonl(file: string): Record<string, unknown>[] {
  return gunzipSync(readFileSync(file)).toString('utf8').split('\n').filter(Boolean).map((l) => JSON.parse(l));
}

export function hex(h: string): Uint8Array {
  const b = new Uint8Array(h.length / 2);
  for (let i = 0; i < b.length; i++) b[i] = parseInt(h.slice(2 * i, 2 * i + 2), 16);
  return b;
}

export function tohex(b: Uint8Array): string {
  let s = '';
  for (const x of b) s += x.toString(16).padStart(2, '0');
  return s;
}

export interface Iteration { it: number; tick: number; t: number; c2s: [number, string][]; s2c: [number, string][] }

export function scenarios(): string[] {
  if (!existsSync(GOLDEN)) return [];
  return readdirSync(GOLDEN).filter((d) => d !== 'core' && existsSync(GOLDEN + d + '/packets.jsonl.gz')).sort();
}

export function loadScenario(name: string): { iterations: Iteration[]; snaps: Record<string, unknown>[]; clients: number[] } {
  const rows = jsonl(GOLDEN + name + '/packets.jsonl.gz');
  const iterations = rows.filter((r) => !('header' in r)) as unknown as Iteration[];
  const snaps = jsonl(GOLDEN + name + '/snaps.jsonl.gz');
  const clients = [...new Set(iterations.flatMap((i) => i.c2s.map((c) => c[0])))].sort((a, b) => a - b);
  return { iterations, snaps, clients };
}

export function officialMaps(): { name: string; bytes: Uint8Array }[] {
  return readdirSync(MAPS).filter((f) => f.endsWith('.map')).map((f) => ({ name: f.slice(0, -4), bytes: new Uint8Array(readFileSync(MAPS + f)) }));
}
