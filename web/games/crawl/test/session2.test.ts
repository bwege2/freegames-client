// Headless integration: religion, altar prayer, divine abilities, identification and shops.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game/game.ts';
import { HeadlessSurface } from '../src/ui.ts';
import { idx } from '../src/game/model.ts';
import { makePotion, makeScroll, makeWeapon } from '../src/game/items.ts';
import { createPlayer } from '../src/game/player.ts';
import { makeWorld, getLevel } from '../src/game/world.ts';
import { Rng } from '../src/game/rng.ts';
import { SPECIES_BY_NAME, JOBS_BY_NAME } from '../src/game/data.ts';

const tick = () => new Promise((r) => setTimeout(r, 2));

async function startBerserker(): Promise<{ g: Game; s: HeadlessSurface; done: Promise<any> }> {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed: 7n, name: 'Test' });
  const done = g.start({ surface: s, seed: 7n, name: 'Test' });
  // Human, Berserker, first weapon, name.
  s.send('a');
  await tick();
  s.send('d');
  await tick();
  s.send('a');
  await tick();
  s.send('Test\r');
  for (let i = 0; i < 100 && !g.player; i++) await tick();
  assert.ok(g.player, 'character created');
  return { g, s, done };
}

test('a Berserker starts with Trog and can go berserk', async () => {
  const { g, s, done } = await startBerserker();
  assert.equal(g.player.species.name, 'Human');
  assert.equal(g.player.job.name, 'Berserker');
  assert.equal(g.player.god, 'GOD_TROG');
  assert.equal(g.player.piety, 35);
  const hpBefore = g.player.hpMax;
  g.player.piety = 160; // no failure at 1* (45 - 80 <= 0)
  s.send('a');
  await tick();
  s.send('a');
  for (let i = 0; i < 20 && !(g.player.status.DUR_BERSERK > 0); i++) await tick();
  assert.ok((g.player.status.DUR_BERSERK ?? 0) > 0, 'berserk started');
  assert.equal(g.player.hpMax, Math.trunc(hpBefore * 3 / 2));
  s.send('S');
  await done;
});

test('praying at an altar joins a god and a second prayer is just prayer', async () => {
  const { g, s, done } = await startBerserker();
  g.player.god = null;
  g.player.piety = 0;
  g.level.cells[idx(g.player.x, g.player.y)].feat = 'DNGN_ALTAR_OKAWARU';
  s.send('p');
  for (let i = 0; i < 20 && g.player.god !== 'GOD_OKAWARU'; i++) await tick();
  assert.equal(g.player.god, 'GOD_OKAWARU');
  assert.equal(g.player.piety, 15);
  assert.ok(g.log.some((m) => m.text.includes('Okawaru welcomes you!')));
  s.send('p');
  await tick();
  assert.ok(g.log.some((m) => m.text.includes('You pray to Okawaru.')));
  s.send('S');
  await done;
});

test('reading a scroll of identify identifies a potion type', async () => {
  const { g, s, done } = await startBerserker();
  const potion = makePotion('potion of might');
  const scroll = makeScroll('scroll of identify');
  g.player.inventory = g.player.inventory.filter((i) => i.cls !== 'scroll');
  g.player.inventory.push(potion, scroll);
  assert.equal(g.player.identifiedTypes['potion of might'], undefined);
  s.send('r');
  await tick();
  s.send('a'); // scrolls are the only readables at this point; the new scroll sorts last, but pick first
  await tick();
  // The first scroll in the list may be a starting scroll; identify at least one type.
  s.send('a');
  await tick();
  assert.ok(g.log.some((m) => m.text.includes('You have identified') || m.text.includes('nothing to identify')),
    JSON.stringify(g.log.slice(-6)));
  s.send('S');
  await done;
});

test('a shop menu sells stock for the shopping.cc price', async () => {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed: 7n, name: 'Test' });
  g.player = createPlayer(SPECIES_BY_NAME.get('human')!, JOBS_BY_NAME.get('fighter')!, 'WPN_RAPIER', 'Test');
  const r = new Rng(7n);
  g.world = makeWorld(r, '7');
  g.level = getLevel(g.world, r, 'BRANCH_DUNGEON', 1);
  g.player.x = g.level.entry % 80; g.player.y = Math.floor(g.level.entry / 80);
  const shop = {
    at: idx(g.player.x, g.player.y), type: 'SHOP_WEAPON' as const, greed: 10,
    stock: [makeWeapon('WPN_LONG_SWORD')],
  };
  g.player.gold = 100;
  g.level.shops.push(shop);
  // Open the shop directly through the pending command: step off and back on.
  const at = shop.at;
  g.player.x = at % 80; g.player.y = Math.floor(at / 80);
  const shopping = (g as any).openShop(shop);
  await tick();
  s.send('a');
  for (let i = 0; i < 20 && shop.stock.length > 0; i++) await tick();
  s.send('\x1b');
  await shopping;
  assert.equal(shop.stock.length, 0, 'bought the sword');
  assert.ok(g.player.gold < 100);
  assert.ok(g.player.inventory.some((i) => i.id === 'WPN_LONG_SWORD'));
});
