// Node resource loader for the headless tests: text and PNG dimensions come from the port's assets
// (the files the build ships); images are represented by their size only, which is all the
// simulation needs for sprite hitboxes.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { setResourceLoader } from '../src/resources.ts';

const asset = (p: string) => fileURLToPath(new URL(`../assets/${p}`, import.meta.url));
const dummySprite = `(supertux-sprite (action (name "default") (fps 10) (hitbox 0 0 32 32) (images "dummy.png")))`;
const sizes = new Map<string, { width: number; height: number }>();

function pngSize(path: string): { width: number; height: number } {
  const cached = sizes.get(path);
  if (cached) return cached;
  if (!existsSync(asset(path))) { const s = { width: 32, height: 32 }; sizes.set(path, s); return s; }
  const b = readFileSync(asset(path));
  if (b.toString('ascii', 1, 4) !== 'PNG') { const s = { width: 32, height: 32 }; sizes.set(path, s); return s; }
  const s = { width: b.readUInt32BE(16), height: b.readUInt32BE(20) };
  sizes.set(path, s);
  return s;
}

setResourceLoader({
  text: async (p) => {
    if (!existsSync(asset(p))) return dummySprite;
    const text = readFileSync(asset(p), 'utf8');
    return text;
  },
  imageReady: (p) => (existsSync(asset(p)) ? (pngSize(p) as unknown as HTMLImageElement) : null),
  image: async (p) => (pngSize(p) as unknown as HTMLImageElement),
});
