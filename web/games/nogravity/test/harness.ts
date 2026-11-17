// No Gravity port (GPL-3.0-or-later; LICENSE.md): runs the game headless for the tests: the data from
// web/games/nogravity/assets, no screen (the frame's commands are dropped), no sound, a clock that
// advances 15 ms per frame (a frame of the original's 70 Hz timer measured with millisecond ticks).
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { files, host, clock, normPath, sKEY, GameAbort } from '../src/sys/sys.ts';
import { GX } from '../src/gx/gx.ts';
import { audio } from '../src/game/sound.ts';
import { assets } from '../src/game/render.ts';
import { NG_Init, NG_LoadGameData } from '../src/game/main.ts';
import { loadPlayerFiles } from '../src/game/persist.ts';

export const ASSETS = new URL('../assets/', import.meta.url).pathname;

function walk(dir: string, out: string[]): void {
  for (const n of readdirSync(dir)) {
    const p = join(dir, n);
    if (statSync(p).isDirectory()) walk(p, out); else out.push(p);
  }
}
let loaded = false;
export function loadAll(): void {
  if (loaded) return;
  const list: string[] = [];
  walk(ASSETS, list);
  for (const p of list) {
    const n = normPath(relative(ASSETS, p));
    if (n.startsWith('music/')) continue;
    files.set(n, new Uint8Array(readFileSync(p)));
  }
  loaded = true;
}

export interface Run { frames: number; onFrame: (n: number) => void; maxFrames: number }
export const run: Run = { frames: 0, onFrame: () => {}, maxFrames: 1e9 };

/** a key press for one frame (down now, up after the next Update) */
export function press(scan: number): void {
  sKEY.events.push({ down: true, scan, char: 0 }, { down: false, scan, char: 0 });
}
export function hold(scan: number, down: boolean): void { sKEY.events.push({ down, scan, char: 0 }); }

export async function boot(): Promise<void> {
  loadAll();
  audio.enabled = false;
  assets.loadDir = async () => {};
  host.quit = false;
  run.frames = 0;
  host.flip = async () => {
    GX.commands = [];
    clock.ms += 15;
    run.frames++;
    run.onFrame(run.frames);
    if (run.frames >= run.maxFrames) host.quit = true;
  };
  NG_Init();
  loadPlayerFiles({ pts: null, hsc: null, ini: null });
  await NG_LoadGameData();
}
export async function untilAbort(p: Promise<unknown>): Promise<void> {
  try { await p; } catch (e) { if (!(e instanceof GameAbort)) throw e; }
}
