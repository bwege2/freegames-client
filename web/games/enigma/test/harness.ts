// Loads the port's data from web/games/enigma/assets for the headless tests (node).
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { toBytes } from '../src/lua/lib.ts';

export const assets = join(import.meta.dirname, '..', 'assets');
const images = JSON.parse(readFileSync(join(assets, 'data', 'images.json'), 'utf8')) as Record<string, [string, number, number]>;

export const files = {
  lua: (name: string) => toBytes(readFileSync(join(assets, 'data', name), 'utf8')),
  text: (name: string) => readFileSync(join(assets, 'data', name), 'utf8'),
  imageSize: (name: string): [number, number] | null => { const i = images[name]; return i ? [i[1], i[2]] : null; },
  pack: (dir: string) => JSON.parse(readFileSync(join(assets, 'levels', dir + '.json'), 'utf8')) as Record<string, string>,
  packs: () => JSON.parse(readFileSync(join(assets, 'levels', 'packs.json'), 'utf8')) as { dir: string; title: string; levels: { id: string; title: string; file: string }[] }[],
};
