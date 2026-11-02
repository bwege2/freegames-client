// Bomberslop: GPL-3.0-or-later (web/games/bomberslop/LICENSE.md).
// Writes the oracle's scenarios (test/scenarios/*.txt): what keys each player holds when. Most are played by the
// port's computer players (src/ai.ts) on the port's own rules, and only their keys are written down: the oracle then
// plays the same keys on the original's code, and test/oracle.test.ts compares. A few are random walks.
//   node games/bomberslop/test/make-scenarios.ts      (then re/bomberslop/oracle/build.sh)
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { Game, type Config, type Keys } from '../src/sim.ts';
import { Brain } from '../src/ai.ts';
import { GAME_DIR, loadMaps } from './trace.ts';

const MAPS = ['Canteen', 'Conveyor', 'Drain', 'Fridge', 'Grease_Trap', 'Pantry']; // the original's order: by name

function keyString(k: Keys): string {
  const s = (k.left ? 'L' : '') + (k.up ? 'U' : '') + (k.right ? 'R' : '') + (k.down ? 'D' : '') + (k.bomb ? 'B' : '');
  return s || '-';
}

function header(name: string, about: string, seed: number, players: number, frames: number, config: Partial<Config>): string[] {
  const out = [`# ${name}: ${about}`, `# written by test/make-scenarios.ts`, `seed ${seed}`, `players ${players}`, `frames ${frames}`, 'dump 256'];
  for (const [k, v] of Object.entries(config)) out.push(k === 'start_map' ? `start_map ${v}` : `set ${k} ${v}`);
  return out;
}

/** computer players on the port; their keys written down when they change */
function played(name: string, about: string, seed: number, players: number, frames: number, config: Partial<Config>): void {
  const out = header(name, about, seed, players, frames, config);
  const g = new Game(loadMaps(), players, seed, config);
  const brains = Array.from({ length: players }, (_, i) => new Brain(i, seed * 31 + i));
  const last: string[] = Array(players).fill('');
  for (let f = 0; f < frames && !g.over; f++) {
    const keys = brains.map((b) => b.think(g));
    keys.forEach((k, i) => {
      const s = keyString(k);
      if (s !== last[i]) out.push(`at ${f} ${i} ${s}`);
      last[i] = s;
    });
    g.frame(keys);
  }
  writeFileSync(join(GAME_DIR, 'test', 'scenarios', `${name}.txt`), out.join('\n') + '\n');
}

/** random walks: each player picks a direction for a while and lays bombs now and then */
function random(name: string, about: string, seed: number, players: number, frames: number, config: Partial<Config>): void {
  const out = header(name, about, seed, players, frames, config);
  let s = seed >>> 0;
  const rnd = (n: number) => {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    return (s >>> 16) % n;
  };
  for (let p = 0; p < players; p++) {
    let f = 100;
    while (f < frames) {
      if (rnd(6) === 0) {
        // stand, lay a bomb, press again while standing on it (a throw, with the glove)
        out.push(`at ${f} ${p} B`, `at ${f + 1} ${p} -`, `at ${f + 5} ${p} B`, `at ${f + 6} ${p} -`);
        f += 8;
      }
      const dir = ['L', 'U', 'R', 'D', '-', 'LU', 'RD'][rnd(7)];
      const bomb = rnd(3) === 0;
      out.push(`at ${f} ${p} ${dir}${bomb ? 'B' : ''}`);
      if (bomb) out.push(`at ${f + 1} ${p} ${dir}`);
      f += 8 + rnd(50);
    }
  }
  writeFileSync(join(GAME_DIR, 'test', 'scenarios', `${name}.txt`), out.join('\n') + '\n');
}

played('canteen-four', 'four computer players on the Canteen until someone has three points', 1001, 4, 20000, { points_to_win: 3 });
played('kick-and-throw', 'kicking and the glove from the start, two players on Pantry', 2002, 2, 9000, { start_kick: 1, start_glove: 1, start_map: MAPS.indexOf('Pantry') });
played('conveyor', 'bombs on the arrows of Conveyor, three players', 3003, 3, 9000, { start_map: MAPS.indexOf('Conveyor'), start_kick: 1 });
played('fridge', 'ice: bombers and bombs slide on Fridge', 4004, 3, 9000, { start_map: MAPS.indexOf('Fridge'), start_kick: 1 });
played('grease-trap', 'the traps of Grease_Trap shoot bombs elsewhere', 5005, 4, 9000, { start_map: MAPS.indexOf('Grease_Trap'), start_bombs: 3 });
played('drain', 'the holes of Drain, kicked bombs into them', 6006, 2, 9000, { start_map: MAPS.indexOf('Drain'), start_kick: 1 });
played('time-over', 'a short round: the Mop eats the arena tile by tile, bombers fall', 7007, 3, 9000, { round_time: 15, points_to_win: 2 });
played('many-extras', 'strong starts, every extra on: diseases spread', 8008, 4, 12000, { start_bombs: 4, start_power: 4, random_map_order: 1 });
random('random-walk', 'random keys on the first maps', 9009, 4, 6000, {});
random('random-short', 'random keys, a 10 s round', 1234, 2, 5000, { round_time: 10 });
random('random-drain', 'random keys on Drain with kick and glove: bombs and bombers into the holes', 4321, 4, 6000,
  { start_map: MAPS.indexOf('Drain'), start_kick: 1, start_glove: 1, start_bombs: 3, round_time: 30 });
random('random-traps', 'random keys on Grease_Trap and Conveyor with the glove and many bombs', 5678, 4, 6000,
  { start_map: MAPS.indexOf('Grease_Trap'), start_glove: 1, start_bombs: 5, start_power: 3, random_positions: 0 });
random('random-ice', 'random keys on Fridge with kick: sliding bombers and bombs', 8765, 3, 5000,
  { start_map: MAPS.indexOf('Fridge'), start_kick: 1, start_skateboards: 2, corpse_parts: 25 });
