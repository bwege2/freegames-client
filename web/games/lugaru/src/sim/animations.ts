// Loads the 110 loadable animations listed in Source/Animation/Animation.def (the generated
// assets/animations.json). Several enum ids share a file (e.g. Flip/frontflipanim); the file is
// fetched once and parsed per id so the original's animation table has every entry.
import { parseAnimation, type AnimationAttack, type AnimationData, type AnimationDef, type AnimationHeight } from '../data/animation.ts';
import { loadBinary, loadJson } from '../load.ts';

export interface AnimationSet {
  byId: Map<string, AnimationData>;
  defs: AnimationDef[];
}

export async function loadAnimations(onProgress?: (done: number, total: number) => void): Promise<AnimationSet> {
  const manifest = await loadJson<{ animations: AnimationDef[] }>('animations.json');
  const defs = manifest.animations;
  const byFile = new Map<string, Promise<ArrayBuffer>>();
  let done = 0;
  const byId = new Map<string, AnimationData>();
  await Promise.all(defs.map(async (def) => {
    let p = byFile.get(def.file);
    if (!p) {
      p = loadBinary(`Animations/${def.file}`);
      byFile.set(def.file, p);
    }
    const buffer = await p;
    byId.set(def.id, parseAnimation(buffer, def.height as AnimationHeight, def.attack as AnimationAttack));
    done++;
    onProgress?.(done, defs.length);
  }));
  return { byId, defs };
}
