// Madness Interactive Reloaded port (GPL-3.0). Incident mode: Incident mode/IncidentConfig.cs (a campaign of
// five random incident levels between a begin and an end level, its enemies, weapons and kill target drawn from a
// seeded System.Random), IncidentState.cs and Systems/IncidentSystem.cs (the kill counter).
import type { Level, Registry } from '../data/registry.ts';
import { DotNetRandom } from '../engine/dotnet-random.ts';
import { randomFloat } from '../engine/util.ts';

export const MinKillTarget = 20;
export const MaxKillTarget = 200;
const LevelCount = 5;

export interface Incident { seed: number; killTarget: number; name: string; levels: Level[]; music: string }

/** HashCode.Combine is randomised per process in .NET; the port names an incident by a stable hash of the same inputs */
export const incidentName = (seed: number, kills: number): string =>
  `INCIDENT:0x${(((Math.imul(seed, 31) ^ kills) >>> 0) & 0xffff).toString(16).toUpperCase()}`;

/** WeightedGrabBag.Grab (Utilities.RandomFloat) */
function grab<T>(items: [T, number][]): T {
  const total = items.reduce((a, [, w]) => a + w, 0);
  let r = randomFloat(0, total);
  for (const [t, w] of items) { if (r < w) return t; r -= w; }
  return items[items.length - 1][0];
}

/** IncidentConfig.CreateCampaign */
export function createIncident(reg: Registry, seed: number, killTarget: number): Incident {
  const rand = new DotNetRandom(seed);
  const keys = [...reg.levelFiles.keys()].sort();
  const begin = keys.filter((k) => k.startsWith('lvl_incident_begin'));
  const end = keys.filter((k) => k.startsWith('lvl_incident_end'));
  const mid = keys.filter((k) => k.startsWith('lvl_incident') && !begin.includes(k) && !end.includes(k));
  // the original's registries are ConcurrentDictionaries (no fixed key order); the port takes the keys in ordinal order
  const wpns = [...reg.weapons.keys()].sort();
  const spawn: [{ statsKey: string; lookKey: string; factionKey: string }, number][] = [
    [{ statsKey: 'grunt', lookKey: 'grunt', factionKey: 'aahw' }, 4], [{ statsKey: 'agent', lookKey: 'agent', factionKey: 'aahw' }, 5],
    [{ statsKey: 'engineer', lookKey: 'engineer', factionKey: 'aahw' }, 4], [{ statsKey: 'machinist', lookKey: 'machinist', factionKey: 'aahw' }, 2],
    [{ statsKey: 'soldat', lookKey: 'soldat', factionKey: 'aahw' }, 3.5],
  ];
  const musicSet = JSON.parse(reg.src.text('data/incident_music.json').replace(/^﻿/, '')) as string[];
  const music = musicSet[rand.next(0, musicSet.length)];
  const b = rand.getItems(begin, 1);
  const e = rand.getItems(end, 1);
  rand.shuffle(mid);
  const ids = [b[0], ...mid.slice(0, LevelCount), e[0]];
  // fresh copies: the original changes the levels it loaded
  const levels = ids.map((id) => structuredClone(reg.level(id)));
  const middle = levels.slice(1, -1);
  const target = killTarget;
  let cycles = 5000;
  let sum = 0;
  for (;;) {
    sum = levels.reduce((a, l) => a + l.bodyCountToWin, 0);
    if (sum === target || cycles-- <= 0) break;
    const sign = Math.sign(target - sum);
    const lvl = rand.getItems(middle, 1)[0];
    const npcs = lvl.objects.filter((o) => o.$type === 'NPC').length;
    if (lvl.enemySpawnInstructions.length !== 0 && lvl.maxEnemyCount !== 0) {
      lvl.bodyCountToWin += sign;
      lvl.bodyCountToWin = Math.max(1, Math.max(npcs, lvl.bodyCountToWin));
    }
  }
  levels.forEach((l, i) => {
    l.backgroundMusic = music;
    if (i > 0 && i < levels.length - 1 && l.enemySpawnInstructions.length !== 0 && l.maxEnemyCount !== 0) {
      l.maxEnemyCount = rand.next(2, 4);
      l.maxSimultaneousAttackingEnemies = rand.next(2, 4);
      l.weapons = rand.getItems(wpns, rand.next(2, 30));
      l.enemySpawnInterval = Math.fround(0.01 + (0.2 - 0.01) * rand.nextSingle());
      l.enemySpawnInstructions = [];
      for (let n = 0; n < rand.next(2, 10); n++) l.enemySpawnInstructions.push(grab(spawn));
    }
  });
  return { seed, killTarget: sum, name: incidentName(seed, killTarget), levels, music };
}
