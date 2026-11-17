// node games/enigma/test/tools/scan.ts [filter]: loads every shipped level headless, runs it for a while
// and counts the levels that load and run, and the reasons of those that do not (unported object kinds).
import { files } from '../harness.ts';
import { initEngine } from '../../src/engine/index.ts';
import { LevelSession, GameLoop } from '../../src/engine/level.ts';
import { rng, display } from '../../src/engine/core.ts';
import { textSource } from '../../src/engine/objects/stones1.ts';

const errs = initEngine(files);
if (errs.length) console.log('model errors', errs);
const libs = files.pack('lib');
const libSource = { get: (path: string, release: number) => libs[`${path}_${release}.xml`] ?? libs[`${path}.xml`] ?? null };
const filter = process.argv[2] ?? '';
const reasons = new Map<string, string[]>();
let ok = 0, total = 0;
for (const pack of files.packs()) {
  const texts = files.pack(pack.dir);
  for (const lv of pack.levels) {
    if (filter && !lv.file.includes(filter)) continue;
    total++;
    rng.level = 12345;
    const s = new LevelSession(texts[lv.file], libSource, true);
    textSource.get = (k) => s.localized(k);
    try {
      s.load(false);
      const loop = new GameLoop(s);
      loop.start();
      for (let i = 0; i < 300; i++) loop.tick(0.01);
      ok++;
    } catch (e) {
      const m = (e as Error).message.replace(/\s+/g, ' ');
      const key = /unknown object name '([^']+)'/.exec(m)?.[1] ?? m.slice(0, 120);
      if (!reasons.has(key)) reasons.set(key, []);
      reasons.get(key)!.push(lv.file);
    }
  }
}
console.log(`${ok}/${total} levels load and run 3 s`);
for (const [k, v] of [...reasons].sort((a, b) => b[1].length - a[1].length).slice(0, 60)) console.log(String(v.length).padStart(4), k, v.length < 3 || (process.env.SCAN_SHOW && k.includes(process.env.SCAN_SHOW)) ? v.join(' ') : '');
if (display.missing.size) console.log('missing models:', [...display.missing].slice(0, 30).join(' '));
