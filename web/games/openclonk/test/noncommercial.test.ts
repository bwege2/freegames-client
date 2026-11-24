// The toggle NONCOMMERCIAL_FILES (src/settings.ts): the shipped build uses false (the site's rule: every asset is free
// for any use, commercial use included), so the four files are neither committed nor built; the test runs both states,
// because the mechanism stays. The packed groups never hold the four files; with the setting on the engine finds them at
// their planet paths, with it off it does not, and the game runs the same either way (the files are a sound and two
// start-menu images, not game state).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { planet, re } from './oracle.ts';
import { noncommercialFiles, packMissing, packedGroups, pack } from './content.ts';
import { SYSTEM_DATA, boot } from '../src/boot.ts';
import { NONCOMMERCIAL_FILES, NONCOMMERCIAL_PATHS } from '../src/settings.ts';
import { readFile } from '../src/rt/fs.ts';
import { C4Group, unpackGroupFile } from '../src/rt/group.ts';
import { setRandomRecorder } from '../src/rt/random.ts';

const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd', 'Missions.ocf'];
const skip = packMissing([...GROUPS, 'Sound.ocg']);

test('the shipped build turns the setting off, and it lists the same four files as tools/pack.sh', () => {
  assert.equal(NONCOMMERCIAL_FILES, false, 'the site ships only assets that are free for any use, commercial use included');
  const listed = fs.readFileSync(path.join(re, 'tools/noncommercial.txt'), 'utf8')
    .split('\n').filter((l) => l && !l.startsWith('#'));
  assert.deepEqual([...NONCOMMERCIAL_PATHS], listed);
});

/** the entry at parts inside a packed group (child groups are stored unpacked in their parent) */
function entry(data: Uint8Array, parts: string[], top = true): Uint8Array | null {
  const group = new C4Group(parts[0], top ? unpackGroupFile(data) : data);
  const e = group.entries.find((x: any) => !x.deleted && x.name.toLowerCase() === parts[0].toLowerCase());
  if (!e) return null;
  const bytes = group.LoadEntry(e.name);
  if (!bytes) return null;
  return parts.length === 1 ? bytes : entry(bytes, parts.slice(1), false);
}

test('the shipped assets do not contain the non-commercial files, recursively', () => {
  for (const p of NONCOMMERCIAL_PATHS) {
    const [g, ...rest] = p.split('/');
    const data = new Uint8Array(fs.readFileSync(path.join(re, '../../web/games/openclonk/assets', g)));
    assert.equal(entry(data, rest), null, `${p} is not in the shipped ${g}`);
  }
});

test('the packed groups do not contain the non-commercial files; pack.sh keeps them unchanged beside them', { skip }, () => {
  for (const p of NONCOMMERCIAL_PATHS) {
    const [g, ...rest] = p.split('/');
    const data = new Uint8Array(fs.readFileSync(path.join(pack, g)));
    assert.equal(entry(data, rest), null, `${p} is not in the packed ${g}`);
    assert.ok(fs.readFileSync(path.join(pack, 'noncommercial', p)).equals(fs.readFileSync(path.join(planet, p))), `${p} unchanged`);
  }
  // the files next to them are still in their groups (the lookup itself works)
  const sound = new Uint8Array(fs.readFileSync(path.join(pack, 'Sound.ocg')));
  assert.ok(entry(sound, ['Environment.ocg', 'Waterfall.ogg']), 'Environment.ocg/Waterfall.ogg is in Sound.ocg');
  assert.ok(entry(sound, ['Hits.ocg', 'Materials.ocg', 'Glass.ocg', 'GlassHit1.ogg']), 'Glass.ocg/GlassHit1.ogg is in Sound.ocg');
  assert.ok(entry(new Uint8Array(fs.readFileSync(path.join(pack, 'Graphics.ocg'))), ['StartupLogo.png']), 'StartupLogo.png is in Graphics.ocg');
});

/** boots Acid Drilling in one state of the setting and runs frames; the synchronized random calls */
function run(noncommercial: boolean, frames: number) {
  const calls: number[] = [];
  const groups = packedGroups([...GROUPS, 'Sound.ocg']);
  setRandomRecorder((range, val) => calls.push(range, val));
  try {
    const game = boot({ groups, files: noncommercialFiles(), noncommercial, scenario: 'Missions.ocf/AcidDrilling.ocs', seed: 1793690358 });
    const present = NONCOMMERCIAL_PATHS.map((p) => readFile(SYSTEM_DATA + p));
    for (let i = 0; i < frames && game.engine.Game.IsRunning; i++) game.tick();
    return { calls, present, frame: game.engine.Game.FrameCounter };
  } finally {
    setRandomRecorder(null);
  }
}

test('NONCOMMERCIAL_FILES on and off: the files are there or not, and the game runs the same', { skip }, () => {
  // the first boot in a process takes a different random path from frame 2 on (state the runtime does not reset
  // yet: re/openclonk/NOTES.md, milestone 1), so both states are compared after one boot each
  run(true, 40);
  const off = run(false, 40);
  const on = run(true, 40);
  NONCOMMERCIAL_PATHS.forEach((p, i) => {
    assert.ok(on.present[i] && on.present[i]!.length > 0, `on: ${p} is in the game's files`);
    assert.equal(off.present[i], null, `off: ${p} is not`);
  });
  assert.equal(on.frame, off.frame);
  assert.ok(on.calls.length > 1000);
  assert.deepEqual(off.calls, on.calls, 'the same synchronized random calls in both states');
});
