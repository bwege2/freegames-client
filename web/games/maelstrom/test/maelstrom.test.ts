// Maelstrom's original RNG, physics and wave mechanics, checked against the
// constants and formulas in game/fastrand.cpp, game/init.cpp and game.cpp.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
  FastRandom, MaelstromGame, GAME_W, GAME_H, SCALE, defaultInput,
  type GameAssets,
} from '../src/sim.ts';
import type { Blit } from '../src/assets.ts';

function fakeBlit(w = 32, h = 32): Blit {
  const mask = new Uint8Array(w * h).fill(1);
  return {
    frames: [{ image: {} as HTMLImageElement, mask, w, h, bbox: { left: 0, top: 0, right: w - 1, bottom: h - 1 } }],
    w, h, hitRect: { left: 0, top: 0, right: w - 1, bottom: h - 1 },
  };
}

function assets(): GameAssets {
  const ship = fakeBlit(32, 32);
  const small = fakeBlit(16, 16);
  return {
    playerShip: ship, thrust1: small, thrust2: small, explosion: ship,
    shipExplosion: ship, shrapnel1: ship, shrapnel2: ship,
    largeR: ship, largeL: ship, mediumR: ship, mediumL: ship,
    smallR: small, smallL: small, steelR: ship, steelL: ship,
    enemy1: ship, enemy2: ship, prize: ship, mult: [ship, ship, ship, ship],
    bonus: ship, point: small, vortex: ship, mineR: ship, mineL: ship,
    shield: ship, damaged: ship, nova: ship, playerShot: small, enemyShot: small,
  };
}

test('FastRandom matches fastrand.cpp', () => {
  const r = new FastRandom(12345);
  assert.deepEqual(Array.from({ length: 20 }, () => r.next(100)),
    [93, 84, 28, 99, 75, 10, 87, 65, 96, 69, 70, 81, 35, 30, 61, 6, 92, 90, 85, 35]);
  const q = new FastRandom(1);
  assert.deepEqual(Array.from({ length: 10 }, () => q.next(10)), [2, 7, 6, 3, 1, 7, 1, 7, 9, 1]);
});

test('a new game starts in the middle of wave 1', () => {
  const g = new MaelstromGame(assets(), 1);
  g.start(3);
  assert.equal(g.wave, 1);
  assert.equal(g.player.lives, 2);
  assert.equal(g.player.x, (GAME_W / 2 - 16) * SCALE);
  assert.equal(g.player.y, ((GAME_H / 2) - 16) * SCALE - 32);
  assert.ok(g.objects.filter((o) => o.kind === 'rockLarge' || o.kind === 'steel').length >= 3);
  assert.ok(g.rockCount >= 1);
});

test('thrust, rotation, shooting and wrapping work', () => {
  const g = new MaelstromGame(assets(), 1);
  g.start(3);
  const p = g.player;
  const y0 = p.y;
  const input = defaultInput();
  input.thrust = true;
  for (let i = 0; i < 8; i++) g.tick(input);
  assert.notEqual(p.y, y0);
  input.thrust = false; input.right = true;
  const phase = p.phase;
  for (let i = 0; i < 5; i++) g.tick(input);
  assert.notEqual(p.phase, phase);
  input.right = false; input.fire = true;
  g.tick(input);
  assert.equal(p.shots.length, 1);
  const shot = p.shots[0];
  assert.ok(shot.x >= 0 && shot.x <= GAME_W * SCALE);
  assert.ok(shot.y >= 0 && shot.y <= GAME_H * SCALE);
});

test('a collision with a rock explodes the ship', () => {
  const g = new MaelstromGame(assets(), 1);
  g.start(3);
  const p = g.player;
  p.autoShield = 0;
  p.shieldOn = false;
  const rock = g.objects.find((o) => o.kind === 'rockLarge' || o.kind === 'rockMedium' || o.kind === 'rockSmall' || o.kind === 'steel');
  assert.ok(rock);
  rock!.x = p.x; rock!.y = p.y;
  g.tick(defaultInput());
  assert.ok(p.exploding || p.deadTimer > 0);
});

test('destroying the last rock starts the bonus and the next wave', () => {
  const g = new MaelstromGame(assets(), 1);
  g.start(3);
  g.objects.length = 0;
  g.rockCount = 0;
  g.whenDone = 1;
  g.tick(defaultInput());
  assert.equal(g.state, 'bonus');
  for (let i = 0; i < 95; i++) g.tick(defaultInput());
  assert.equal(g.state, 'playing');
  assert.equal(g.wave, 2);
});

test('a shot damages a rock and its explosion makes smaller rocks', () => {
  const g = new MaelstromGame(assets(), 1);
  g.start(3);
  const p = g.player;
  const rock = g.objects.find((o) => o.kind === 'rockLarge');
  if (!rock) return;
  rock.hitPoints = 1;
  rock.x = p.x + 100; rock.y = p.y;
  p.shots.push({
    damage: 3, x: rock.x, y: rock.y, xvel: 0, yvel: 0, ttl: 30,
    rect: { left: Math.floor(rock.x / SCALE), top: Math.floor(rock.y / SCALE),
      right: Math.floor(rock.x / SCALE) + 30, bottom: Math.floor(rock.y / SCALE) + 30 },
  });
  const before = g.rockCount;
  rock.hitBy(p);
  assert.ok(rock.exploding);
  assert.ok(g.objects.some((o) => o.kind === 'rockMedium'));
  assert.equal(g.rockCount, before);
});

test('the same seed and input produce the same game', () => {
  const a = new MaelstromGame(assets(), 99);
  const b = new MaelstromGame(assets(), 99);
  a.start(3); b.start(3);
  const input = defaultInput();
  input.thrust = true;
  for (let i = 0; i < 200; i++) { a.tick(input); b.tick(input); }
  assert.deepEqual(a.objects.map((o) => [o.kind, Math.round(o.x), Math.round(o.y)]),
    b.objects.map((o) => [o.kind, Math.round(o.x), Math.round(o.y)]));
  assert.equal(a.player.score, b.player.score);
});

test('two co-op players start side by side and move independently', () => {
  const g = new MaelstromGame(assets(), 7, 2, 'coop');
  g.start(3);
  assert.equal(g.players.length, 2);
  assert.notEqual(g.players[0].x, g.players[1].x);
  assert.equal(g.players[0].y, g.players[1].y);
  const left = defaultInput(); left.thrust = true; left.right = true;
  const right = defaultInput(); right.thrust = true; right.left = true;
  const x0 = g.players[0].x, x1 = g.players[1].x;
  for (let i = 0; i < 8; i++) g.tick([left, right]);
  assert.notEqual(g.players[0].x, x0);
  assert.notEqual(g.players[1].x, x1);
});

test('a deathmatch kill scores a frag for the shooter', () => {
  const g = new MaelstromGame(assets(), 11, 2, 'deathmatch', 3);
  g.start(3);
  const p0 = g.players[0], p1 = g.players[1];
  p1.autoShield = 0; p1.shieldOn = false; p1.shieldLevel = 0;
  assert.equal(p0.lives, 1);
  const shot = { damage: 3, x: p1.x, y: p1.y, xvel: 0, yvel: 0, ttl: 30,
    rect: { left: Math.floor(p1.x / SCALE), top: Math.floor(p1.y / SCALE),
      right: Math.floor(p1.x / SCALE) + 4, bottom: Math.floor(p1.y / SCALE) + 4 } };
  p1.beenShot(p0, shot);
  assert.equal(p0.frags, 1);
  assert.ok(p0.score >= 1000);
  assert.ok(p1.exploding);
  p1.handleDeath();
  assert.equal(p1.lives, 1);

  p0.frags = 3;
  p1.explode();
  p1.handleDeath();
  assert.equal(g.state, 'gameover');
});

test('multi-player games stay deterministic', () => {
  const a = new MaelstromGame(assets(), 123, 3, 'coop');
  const b = new MaelstromGame(assets(), 123, 3, 'coop');
  a.start(3); b.start(3);
  const i0 = defaultInput(); i0.thrust = true;
  const i1 = defaultInput(); i1.left = true; i1.fire = true;
  const i2 = defaultInput(); i2.right = true;
  for (let i = 0; i < 120; i++) { a.tick([i0, i1, i2]); b.tick([i0, i1, i2]); }
  assert.deepEqual(a.players.map((p) => [p.x, p.y, p.score]),
    b.players.map((p) => [p.x, p.y, p.score]));
  assert.deepEqual(a.objects.map((o) => [o.kind, Math.round(o.x), Math.round(o.y)]),
    b.objects.map((o) => [o.kind, Math.round(o.x), Math.round(o.y)]));
});
