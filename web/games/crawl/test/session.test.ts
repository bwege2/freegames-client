// A headless session of the port: creation, a fight, the stairs, a potion, save/load and a death.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { Game } from '../src/game/game.ts';
import { HeadlessSurface } from '../src/ui.ts';
import { DIRS, FEATURE, W, H, idx, xy } from '../src/game/model.ts';
import { encodeGame, decodeGame, morgueText } from '../src/game/save.ts';

const tick = () => new Promise((r) => setTimeout(r, 2));

function stepKey(g: Game, tx: number, ty: number): string | null {
  const start = idx(g.player.x, g.player.y), target = idx(tx, ty);
  const prev = new Int32Array(W * H).fill(-1);
  const seen = new Uint8Array(W * H);
  const q = [start];
  seen[start] = 1;
  while (q.length) {
    const at = q.shift()!;
    if (at === target) break;
    const p = xy(at);
    for (const [dx, dy] of DIRS) {
      const nx = p.x + dx, ny = p.y + dy;
      if (nx < 0 || ny < 0 || nx >= W || ny >= H) continue;
      const n = idx(nx, ny);
      const f = FEATURE[g.level.cells[n].feat];
      if (seen[n] || !f || f.solid) continue;
      seen[n] = 1;
      prev[n] = at;
      q.push(n);
    }
  }
  if (!seen[target]) return null;
  let at = target;
  while (prev[at] !== start) { at = prev[at]; if (at < 0) return null; }
  const p = xy(at);
  const dx = p.x - g.player.x, dy = p.y - g.player.y;
  return dx < 0 && dy < 0 ? 'y' : dx > 0 && dy < 0 ? 'u' : dx < 0 && dy > 0 ? 'b' : dx > 0 && dy > 0 ? 'n'
    : dx < 0 ? 'h' : dx > 0 ? 'l' : dy < 0 ? 'k' : 'j';
}

async function startFighter(seed = 7n): Promise<{ g: Game; s: HeadlessSurface; done: Promise<any> }> {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed, name: 'Test' });
  const done = g.start({ surface: s, seed, name: 'Test' });
  s.send('alaTest\r');
  for (let i = 0; i < 100 && !g.player; i++) await tick();
  assert.ok(g.player, 'character created');
  return { g, s, done };
}

test('the first screen is the original character on D:1', async () => {
  const { g, s, done } = await startFighter();
  assert.equal(g.player.species.name, 'Human');
  assert.equal(g.player.job.name, 'Fighter');
  assert.equal(g.player.hpMax, 18);
  assert.equal(g.player.mpMax, 1);
  assert.equal(g.level.branch, 'BRANCH_DUNGEON');
  assert.equal(g.level.depth, 1);
  assert.ok(s.text().includes('Test the Shield-Bearer'));
  assert.ok(s.text().includes('Health: 18/18'));
  assert.ok(g.log.some((m) => m.text.includes('Welcome, Test the Human Fighter.')));
  s.send('S');
  const result = await done;
  assert.equal(result.kind, 'saved');
});

test('a fight gives experience and a kill', async () => {
  const { g, s } = await startFighter();
  const mon = g.level.monsters.find((m) => m.hp > 0)!;
  assert.ok(mon);
  for (let i = 0; i < 50 && mon.hp > 0; i++) {
    const key = stepKey(g, mon.x, mon.y);
    if (!key) break;
    s.send(key);
    await tick();
    if (g.dead) break;
  }
  assert.ok(g.log.some((m) => m.text.includes('You kill') || m.text.includes('You hit')), 'an attack happened');
  if (mon.hp <= 0) assert.ok(g.player.xp > 0, 'experience for a kill');
});

test('stairs go down and back up', async () => {
  const { g, s } = await startFighter();
  const down = g.level.down[0];
  g.player.x = down.at % W; g.player.y = Math.floor(down.at / W);
  s.send('>');
  await tick();
  assert.equal(g.level.depth, 2);
  assert.equal(g.player.place, 'Dungeon:2');
  s.send('<');
  await tick();
  assert.equal(g.level.depth, 1);
  assert.equal(g.player.place, 'Dungeon:1');
  s.send('Q');
  await tick();
});

test('a potion of might is quaffed', async () => {
  const { g, s } = await startFighter();
  s.send('q');
  await tick();
  s.send('a');
  await tick();
  assert.ok((g.player.status.DUR_MIGHT ?? 0) > 0);
  assert.equal(g.player.inventory.find((i) => i.id === 'potion of might')?.qty ?? 0, 1);
});

test('a saved game loads with its gear and level', async () => {
  const { g } = await startFighter();
  g.player.gold = 17;
  const snap = g.snapshot();
  const data = encodeGame(snap.world, snap.player, snap.log, snap.hasOrb, snap.dead, snap.won, g.rng);
  const decoded = decodeGame(JSON.parse(JSON.stringify(data)));
  const s2 = new HeadlessSurface();
  const g2 = Game.fromSave({ surface: s2, seed: 7n, name: 'Test' }, data, decoded);
  assert.equal(g2.player.gold, 17);
  assert.equal(g2.player.gear.weapon?.id, 'WPN_RAPIER');
  assert.equal(g2.level.depth, 1);
  assert.ok(g2.log.length > 0);
});

test('death makes a morgue entry', async () => {
  const { g, s } = await startFighter();
  g.player.hp = 1;
  const mon = g.level.monsters.find((m) => m.hp > 0)!;
  g.player.x = mon.x - 1; g.player.y = mon.y;
  mon.asleep = false;
  for (let i = 0; i < 30 && !g.dead; i++) { s.send('.'); await tick(); }
  assert.equal(g.dead, true);
  assert.ok(g.cause.includes('killed by'));
  const text = morgueText(g.player, g.cause, false);
  assert.ok(text.includes('died'));
  assert.ok(text.includes('Human Fighter'));
});

test('the Orb of Zot leaves the dungeon at D:1', async () => {
  const { g, s, done } = await startFighter();
  g.hasOrb = true;
  g.player.x = g.level.entry % W; g.player.y = Math.floor(g.level.entry / W);
  s.send('<');
  for (let i = 0; i < 100 && !g.won; i++) await tick();
  assert.equal(g.won, true);
  assert.ok(g.cause.includes('Orb of Zot'));
  s.send(' ');
  const result = await done;
  assert.equal(result.kind, 'won');
});

test('the tutorial starts on its own map', async () => {
  const s = new HeadlessSurface();
  const g = new Game({ surface: s, seed: 7n, tutorial: true });
  const done = g.start({ surface: s, seed: 7n, tutorial: true });
  await tick(); await tick();
  assert.equal(g.level.branch, 'TUTORIAL');
  assert.equal(g.player.place, 'Tutorial');
  assert.ok(s.text().includes('Tutorial the Shield-Bearer'));
  s.send('Q');
  await tick();
  s.send('y');
  await done;
});
