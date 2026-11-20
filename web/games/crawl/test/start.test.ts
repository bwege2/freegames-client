// The original's D:1 start screen for a Human Fighter (re/crawl/oracle/start.py): the messages and HUD,
// compared with the port's first screen. The map is not compared (the port's dungeon layout is its own).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { Game } from '../src/game/game.ts';
import { HeadlessSurface } from '../src/ui.ts';
import { armourClass, evasion, shieldClass, playerTitle } from '../src/game/player.ts';

const golden = JSON.parse(readFileSync(join(import.meta.dirname, 'golden', 'start.json'), 'utf8')) as {
  messages: string[]; title: string; species: string; hp: [number, number]; mp: [number, number];
  ac: number; ev: number; sh: number; str: number; int: number; dex: number;
};

test('the start screen is the original Human Fighter', async () => {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed: 7n, name: 'Test' });
  const done = g.start({ surface: s, seed: 7n, name: 'Test' });
  s.send('alaTest\r');
  for (let i = 0; i < 100 && !g.player; i++) await new Promise((r) => setTimeout(r, 2));
  assert.ok(g.player);
  const log = g.log.map((m) => m.text);
  for (const m of golden.messages) assert.ok(log.includes(m), `message ${m}\nlog: ${log.join(' | ')}`);
  assert.equal(playerTitle(g.player, false), golden.title);
  assert.equal(g.player.hp, golden.hp[0]);
  assert.equal(g.player.hpMax, golden.hp[1]);
  assert.equal(g.player.mp, golden.mp[0]);
  assert.equal(g.player.mpMax, golden.mp[1]);
  assert.equal(armourClass(g.player), golden.ac);
  assert.equal(evasion(g.player), golden.ev);
  assert.equal(shieldClass(g.player), golden.sh);
  assert.equal(g.player.baseStats[0], golden.str);
  assert.equal(g.player.baseStats[1], golden.int);
  assert.equal(g.player.baseStats[2], golden.dex);
  s.send('Q');
  await new Promise((r) => setTimeout(r, 2));
  s.send('y');
  await done;
});
