// The shipped data: every level a player can reach loads and runs (with the images it names), every music
// module plays, the savegame files are written as the original writes them.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { DirSource } from './harness.ts';
import { setDataSource, spriteDescription } from '../src/res.ts';
import { PingusLevel, Server } from '../src/world.ts';
import { ITPlayer, parseIT } from '../src/it.ts';
import { SavegameManager, StatManager } from '../src/saves.ts';
import { SExprReader } from '../src/sexpr.ts';

const dir = join(import.meta.dirname, '..');
const texts = JSON.parse(readFileSync(join(dir, 'assets', 'text-files.json'), 'utf-8')) as Record<string, string>;
class Shipped extends DirSource {
  text(path: string) { return texts[path] ?? null; }
  exists(path: string) { return texts[path] !== undefined || super.exists(path); }
}
const source = new Shipped([join(dir, 'assets', 'data')]);

test('every shipped level loads and plays 200 ticks', () => {
  setDataSource(source);
  const levels = Object.keys(texts).filter((k) => k.startsWith('levels/'));
  assert.ok(levels.length >= 70);
  for (const l of levels) {
    const plf = PingusLevel.parse(l.slice(7, -7), texts[l]);
    assert.ok(plf.levelname, `${l} has a name`);
    const s = new Server(plf);
    for (let i = 0; i < 200 && !s.isFinished(); i++) s.update();
  }
});

test('every image a level or sprite names is shipped', () => {
  setDataSource(source);
  const missing = new Set<string>();
  for (const [k, t] of Object.entries(texts)) {
    if (!k.startsWith('levels/') && !k.startsWith('prefabs/')) continue;
    for (const m of t.matchAll(/\(image\s+"([^"]+)"\)/g)) if (!spriteDescription(m[1])) missing.add(m[1]);
  }
  for (const k of Object.keys(texts).filter((x) => x.endsWith('.sprite'))) {
    const img = SExprReader.parse(texts[k]).readString('image');
    const p = img?.startsWith('/') ? img.slice(1) : join(k.replace(/[^/]*$/, ''), img ?? '');
    // the release itself lacks the images of players 1-3 (multiplayer), of the editor's toolbar and unused backgrounds
    if (/^images\/(pingus\/player[123]\/|core\/editor\/|core\/menu\/(start|world)screenbg|worldmaps\/(pacman|volcano))/.test(p)) continue;
    if (!source.exists(p)) missing.add(p);
  }
  assert.deepEqual([...missing], []);
});

test('every music module plays', () => {
  const md = join(dir, 'assets', 'data', 'music');
  for (const f of readdirSync(md)) {
    const p = new ITPlayer(parseIT(new Uint8Array(readFileSync(join(md, f)))), 22050, false);
    const l = new Float32Array(22050), r = new Float32Array(22050);
    let peak = 0;
    for (let s = 0; s < 5 && !p.ended; s++) { p.render(l, r); for (const v of l) peak = Math.max(peak, Math.abs(v)); }
    assert.ok(peak > 0.01, `${f} is heard`);
  }
});

test('savegames and stats are written in the original format', () => {
  let saved = '', stats = '';
  const sm = new SavegameManager(null, (t) => { saved = t; });
  sm.store({ filename: 'tutorial/snow8-grumbel', status: 'accessible', time: 0, saved: 0 });
  sm.store({ filename: 'tutorial/snow8-grumbel', status: 'finished', time: 1234, saved: 7 });
  sm.store({ filename: 'tutorial/snow8-grumbel', status: 'accessible', time: 1, saved: 1 }); // a finished level stays finished
  assert.equal(saved, '(pingus-savegame \n  (level \n    (filename "tutorial/snow8-grumbel")\n    (status "finished")\n    (time 1234)\n    (saved-pingus 7)))');
  const again = new SavegameManager(saved, () => {});
  assert.equal(again.get('tutorial/snow8-grumbel')?.saved, 7);
  const st = new StatManager(null, (t) => { stats = t; });
  st.setBool('tutorial-startstory-seen', true);
  st.setString('tutorial-current-node', 'leveldot_3');
  assert.equal(stats, '(pingus-stats \n  (tutorial-current-node "leveldot_3")\n  (tutorial-startstory-seen "1"))');
  assert.equal(new StatManager(stats, () => {}).getBool('tutorial-startstory-seen'), true);
});
