// Passage's port, headless. The integer noise and hashes against values computed by an independent
// Python implementation of the C code (explicit 32-bit masks); glibc's rand() against its well-known
// sequence; the rules of a life (its length, the spouse, the score) as game.cpp defines them; and,
// where an oracle run of the original has produced them (test/golden/), frames compared pixel for pixel.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join } from 'node:path';
import { noise3d, random32 } from '../src/landscape.ts';
import { HashTable } from '../src/HashTable.ts';
import { GlibcRand } from '../src/glibcRand.ts';
import { NAMES, parseImage, type AssetName, type Image } from '../src/assets.ts';
import { GraphicContainer } from '../src/World.ts';
import { PassageGame, type Keys } from '../src/game.ts';
import { MusicPlayer } from '../src/music.ts';

const dir = join(import.meta.dirname, '..');
const assets = Object.fromEntries(NAMES.map((n) => [n, parseImage(new Uint8Array(readFileSync(join(dir, 'assets', `${n}.bin`))))])) as Record<AssetName, Image>;

function newGame(loudness: number[] = []) {
  const gc = (n: AssetName) => new GraphicContainer(assets[n]);
  return new PassageGame({
    tileSet: gc('tileSet'), chest: gc('chest'), characterSprite: gc('characterSprite'), characterSpriteSad: gc('characterSpriteSad'),
    spouseSprite: gc('spouseSprite'), chestPrize: gc('chestPrize'), chestDust: gc('chestDust'), heart: gc('heart'),
    numerals: gc('numerals'), title: gc('title'),
  }, { setMusicLoudness: (l) => loudness.push(l), restartMusic: () => {} });
}

const NONE: Keys = { left: false, right: false, up: false, down: false };

test('noise and hashes: C unsigned arithmetic', () => {
  const seed = 1761390000;
  // computed by an independent Python version of landscape.cpp / HashTable.h
  assert.equal(noise3d(1, 2, seed), 0.5727618028340975);
  assert.equal(noise3d(5, 3, seed), -0.4519755531690972);
  assert.equal(noise3d(0, 0, 0), 0.21891876152183998);
  assert.equal(noise3d(-1, 7, seed), 0.7957647609974081);
  assert.equal(noise3d(Math.imul(73642, 12), Math.imul(283277, 9), Math.imul(seed, 987423)), 0.5240186987262632);
  assert.equal(noise3d(Math.imul(37462, -3), Math.imul(1747, 20), Math.imul(seed, 3748147)), 0.953293438057979);
  assert.equal(random32(0), random32(0x100000000), 'uint32');
  const t = new HashTable<number>(3000, -1);
  t.insert(5, 7, 1);
  t.insert(-3, 12, 2);
  assert.equal(t.lookup(5, 7), 1);
  assert.equal(t.lookup(-3, 12), 2);
  assert.equal(t.lookup(7, 5), undefined);
  // the slots (953, 507 in the Python version) collide as in C: same slot replaces, other keys miss
  const u = new HashTable<number>(30000, -1);
  u.insert(100000, -99999, 3);
  assert.equal(u.lookup(100000, -99999), 3);
});

test("glibc rand(): srand(1)'s sequence", () => {
  const r = new GlibcRand();
  assert.deepEqual(Array.from({ length: 10 }, () => r.next()),
    [1804289383, 846930886, 1681692777, 1714636915, 1957747793, 424238335, 719885386, 1649760492, 596516649, 1189641421]);
});

test('a life without moving: 5 minutes, spouse at 0.85, death at 0.95, then the 200-frame fade', () => {
  const loudness: number[] = [];
  const g = newGame(loudness);
  g.newGame(() => 1761390000);
  assert.equal(g.onTitle, true);
  g.start();
  assert.deepEqual(loudness, [1]);
  let frame = 0, spouseDiedAt = -1, playerDiedAt = -1;
  while (!g.done) {
    g.render(NONE);
    g.update(NONE, false);
    frame++;
    if (spouseDiedAt < 0 && g.world.isSpouseDead()) spouseDiedAt = frame;
    if (playerDiedAt < 0 && g.world.isPlayerDead()) playerDiedAt = frame;
    assert.ok(frame < 10000);
  }
  // age = frames / 4500: (playerX - dX) / 100 with dX falling by 100 / (300 s * 15 fps) per frame
  assert.equal(spouseDiedAt, 3825);
  assert.equal(playerDiedAt, 4275);
  assert.equal(frame, 4275 + 200);
  assert.equal(loudness.at(-1), 0, 'the music has faded out');
  assert.equal(g.scoreValue, 0, 'nothing explored, no chest');
});

test('the score: 1 point per 10 pixels explored east, twice that with the spouse; chests add 100', () => {
  const g = newGame();
  g.newGame(() => 1761390000);
  g.start();
  const right: Keys = { ...NONE, right: true };
  let met = -1;
  for (let f = 0; f < 600 && !g.done; f++) {
    g.render(right);
    g.update(right, false);
    if (met < 0 && g.world.haveMetSpouse()) met = f;
  }
  assert.ok(met > 0, 'walking east along the top passage meets the spouse');
  assert.ok(g.scoreValue > 0);
  assert.equal(g.scoreValue % 2, 0, 'with the spouse the explore score moves in steps of 2');
});

test('the same seed and keys give the same frames', () => {
  const run = () => {
    const g = newGame();
    g.newGame(() => 1761390000);
    g.start();
    const h = createHash('sha256');
    for (let f = 0; f < 900; f++) {
      const k: Keys = { ...NONE, right: f % 5 !== 0, down: f % 50 > 40, up: f % 97 > 90 };
      g.render(k);
      h.update(g.image);
      g.update(k, false);
    }
    return h.digest('hex');
  };
  assert.equal(run(), run());
});

test('music: the song from music.tga', () => {
  const m = new MusicPlayer(assets.music);
  const l = new Int16Array(512), r = new Int16Array(512);
  let energy = 0, peak = 0;
  for (let i = 0; i < 100; i++) {
    m.fill(l, r, 512);
    for (let k = 0; k < 512; k++) { energy += Math.abs(l[k]) + Math.abs(r[k]); peak = Math.max(peak, Math.abs(l[k]), Math.abs(r[k])); }
  }
  assert.ok(energy > 0 && peak < 32768);
  m.restart();
  const a = new Int16Array(512), b = new Int16Array(512);
  m.fill(a, b, 512);
  const m2 = new MusicPlayer(assets.music);
  const c = new Int16Array(512), d = new Int16Array(512);
  m2.fill(c, d, 512);
  assert.deepEqual(a, c, 'restartMusic() starts the song over, same samples');
});

// ---- written by the original, compiled natively (re/passage/oracle/build.sh): the port must match
/** FNV-1a, 32 bits, as the oracle prints it */
function fnv(bytes: Uint8Array): string {
  let h = 2166136261;
  for (const b of bytes) h = Math.imul(h ^ b, 16777619) >>> 0;
  return h.toString(16).padStart(8, '0');
}
const golden = join(dir, 'test', 'golden');
const goldens = existsSync(golden) ? readdirSync(golden).filter((x) => x.endsWith('.txt')) : [];
for (const f of goldens.filter((x) => x !== 'music.txt')) {
  test(`the original's frames: ${f}`, () => {
    // first line: seed gemTime keys (one per frame, cycling); then per frame: FNV-1a of the image (Uint32 LE) and the score
    const [head, ...frames] = readFileSync(join(golden, f), 'utf8').trim().split(/\r?\n/);
    const [seed, gemTime, script] = head.split(' ');
    const g = newGame();
    let calls = 0;
    g.newGame(() => (calls++ === 0 ? Number(gemTime) : Number(seed))); // specialGem first, then the world
    g.start();
    for (let i = 0; i < frames.length; i++) {
      const c = script[i % script.length];
      const k: Keys = { ...NONE, left: c === 'L', right: c === 'R', up: c === 'U', down: c === 'D' };
      g.render(k);
      assert.equal(`${fnv(new Uint8Array(g.image.buffer))} ${g.scoreValue}`, frames[i], `frame ${i}`);
      g.update(k, false);
    }
  });
}
if (goldens.includes('music.txt')) {
  test("the original's music, block by block", () => {
    const want = readFileSync(join(golden, 'music.txt'), 'utf8').trim().split(/\r?\n/);
    const m = new MusicPlayer(assets.music);
    const l = new Int16Array(512), r = new Int16Array(512), stream = new Uint8Array(512 * 4);
    const v = new DataView(stream.buffer);
    for (let b = 0; b < want.length; b++) {
      m.fill(l, r, 512);
      for (let i = 0; i < 512; i++) { v.setInt16(i * 4, l[i], true); v.setInt16(i * 4 + 2, r[i], true); }
      assert.equal(fnv(stream), want[b], `block ${b}`);
    }
  });
}
