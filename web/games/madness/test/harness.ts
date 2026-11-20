// Madness Interactive Reloaded port: the game's data read from web/games/madness/assets/ with node's fs, for the
// headless tests (texture sizes from the PNG and QOI headers, no pixels).
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { Registry, type AssetSource } from '../src/data/registry.ts';
import { Scene, type SceneHooks } from '../src/game/scene.ts';
import type { PlayerInput } from '../src/game/control.ts';
import { v2 } from '../src/engine/util.ts';

export const ASSETS = join(import.meta.dirname, '..', 'assets');
export const haveAssets = existsSync(join(ASSETS, 'data'));

function walk(dir: string): string[] {
  if (!existsSync(dir)) return [];
  const out: string[] = [];
  for (const f of readdirSync(dir)) {
    const p = join(dir, f);
    if (statSync(p).isDirectory()) out.push(...walk(p)); else out.push(relative(ASSETS, p).split('\\').join('/'));
  }
  return out.sort();
}

export const fsSource: AssetSource = {
  text: (p) => readFileSync(join(ASSETS, p), 'utf8'),
  has: (p) => existsSync(join(ASSETS, p)),
  list: (folder) => walk(join(ASSETS, folder)),
};

export function textureSize(p: string): { w: number; h: number } {
  const b = readFileSync(join(ASSETS, p));
  if (b.toString('ascii', 0, 4) === 'qoif') return { w: b.readUInt32BE(4), h: b.readUInt32BE(8) };
  return { w: b.readUInt32BE(16), h: b.readUInt32BE(20) };
}

let registry: Registry | null = null;
export function reg(): Registry { return registry ??= new Registry(fsSource); }

export function makeScene(levelId: string, sounds: string[] = []): Scene {
  const hooks: SceneHooks = { nextLevel: () => { sounds.push('<next level>'); }, stat: () => {}, music: () => {} };
  return new Scene(reg(), reg().level(levelId), { play: (p) => { sounds.push(p); } }, textureSize, (f) => fsSource.list(f), hooks, null);
}

export function input(over: Partial<PlayerInput> = {}): PlayerInput {
  return { left: false, right: false, jumpDodge: false, interact: false, attack: false, melee: false, blockAim: false, throw: false, pressed: new Set(), worldMouse: v2(),
    abilityHeld: [false, false, false, false], abilityPressed: [false, false, false, false], abilityReleased: [false, false, false, false], ...over };
}
