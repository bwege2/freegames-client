// Biniax's port against the original: re/biniax/oracle runs the original biniax.c and desktop/*.c with
// a recording SDL; for every frame it wrote the hash of all blits, fills and sounds and the game state
// (test/golden/). The port runs the same scripts with a recording Surface and must match every frame,
// and leave the same autosave.bnx and hiscore.bnx bytes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { Biniax, GRID_X, GRID_Y, type Files } from '../src/game.ts';
import { Gfx, type ImageName, type Surface } from '../src/gfx.ts';
import { parseImage } from '../src/assets.ts';
import type { Key } from '../src/inp.ts';

const dir = join(import.meta.dirname, '..');
const KEYS: Record<string, Key | null> = { U: 'up', D: 'down', L: 'left', R: 'right', A: 'a', E: 'a', B: 'b', '.': null };

function size(name: ImageName): { w: number; h: number } {
  const im = parseImage(new Uint8Array(readFileSync(join(dir, 'assets', `${name}.bin`))));
  return { w: im.w, h: im.h };
}

/** what the oracle's stub SDL records */
class Recorder implements Surface {
  frames: string[] = [];
  private h = 2166136261;
  private game: Biniax | null = null;
  attach(g: Biniax) { this.game = g; }
  private rec(line: string) {
    for (const ch of line + '\n') this.h = Math.imul(this.h ^ ch.charCodeAt(0), 16777619) >>> 0;
  }
  size(img: ImageName) { return size(img); }
  blit(img: ImageName, src: { x: number; y: number; w: number; h: number } | null, x: number, y: number) {
    const s = src ?? { x: 0, y: 0, ...size(img) };
    this.rec(`B ${img} ${s.x} ${s.y} ${s.w} ${s.h} ${x} ${y}`);
  }
  fill(x: number, y: number, w: number, h: number) { this.rec(`F ${x} ${y} ${w} ${h}`); }
  play(channel: number, sound: number) { this.rec(`P ${channel} ${sound}`); }
  flip() {
    const g = this.game!.game;
    let grid = '';
    for (let x = 0; x < GRID_X; x++) for (let y = 0; y < GRID_Y; y++) grid += g.grid[x][y].toString(16).padStart(2, '0');
    this.frames.push(`${this.frames.length} ${this.h.toString(16).padStart(8, '0')} ${g.score} ${g.best} ${g.player.x} ${g.player.y} ${g.player.e} ${g.scroll} ${g.speed} ${g.ingame ? 1 : 0} ${g.message} ${grid}`);
    this.h = 2166136261;
  }
}

const golden = join(dir, 'test', 'golden');
for (const f of readdirSync(golden).filter((x) => x.endsWith('.txt'))) {
  test(`the original's frames: ${f}`, () => {
    const lines = readFileSync(join(golden, f), 'utf8').trim().split(/\r?\n/);
    const [seed, script, autosave] = lines[0].split(' '); // a scenario may start from a saved game
    const want = lines.slice(1).filter((l) => !l.startsWith('FILE '));
    const wantFiles = Object.fromEntries(lines.filter((l) => l.startsWith('FILE ')).map((l) => l.split(' ').slice(1)));
    const store = new Map<string, Uint8Array>();
    if (autosave) store.set('autosave.bnx', new Uint8Array(Buffer.from(autosave, 'hex')));
    const files: Files = { read: (n) => store.get(n) ?? null, write: (n, d) => { store.set(n, d); } };
    const rec = new Recorder();
    const game = new Biniax(new Gfx(rec), files, Number(seed));
    rec.attach(game);
    for (const c of script) {
      if (game.state === 'quit') break;
      const k = KEYS[c];
      if (k) game.input.press(k);
      if (game.state === 'menu') game.menuStep();
      else game.gameStep();
    }
    for (let i = 0; i < want.length; i++) assert.equal(rec.frames[i], want[i], `frame ${i}`);
    assert.equal(rec.frames.length, want.length, 'as many frames');
    const hex = (d?: Uint8Array) => (d ? Buffer.from(d).toString('hex') : '-');
    assert.equal(hex(store.get('autosave.bnx')), wantFiles['autosave.bnx']);
    assert.equal(hex(store.get('hiscore.bnx')), wantFiles['hiscore.bnx']);
  });
}

test('save files: the original layout round-trips', () => {
  const store = new Map<string, Uint8Array>();
  const files: Files = { read: (n) => store.get(n) ?? null, write: (n, d) => { store.set(n, d); } };
  const rec = new Recorder();
  const g = new Biniax(new Gfx(rec), files, 5);
  rec.attach(g);
  g.initGame();
  g.game.score = 1230;
  const bytes = Biniax.encodeGame(g.game);
  assert.equal(bytes.length, 64);
  const copy = new Biniax(new Gfx(rec), files, 6).game;
  Biniax.decodeGame(bytes, copy);
  assert.deepEqual(copy, g.game);
});
