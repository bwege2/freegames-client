// The player's input against the original (milestone 1, re/openclonk/NOTES.md "The input oracle"). The port plays
// Acid Drilling with a local player whose keys go in as the page sends them (src/input.ts: C4PlayerControl's
// ProcessKeyDown/ProcessKeyUp, which queue C4ControlPlayerControl packets) and records the game as the original's
// `--record` does (C4Record: the scenario and the control, CtrlRec.ocb). The original's headless server replays that
// record (re/openclonk/oracle/debugrec.sh --replay) and writes its debug record: it must check the record's sync
// checks without a desync message, and the port's replay of the same record must make the same steps.
//
// A record made this way is committed (test/data/input-record.ocs, packed by the original's c4group, with the
// original's debug record of it, input-dbgrec.json; debugrec.test.ts compares the port with it without the original).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { c4groupBin, re } from './oracle.ts';
import { packMissing, packedGroups } from './content.ts';
import { boot } from '../src/boot.ts';
import { keyEvent } from '../src/input.ts';
import { listDir, readFile } from '../src/rt/fs.ts';
import { RCT, describe, readDbgRecFile, sameChunk, type DbgChunk } from '../src/rt/debugrec.ts';

const GROUPS = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd', 'Missions.ocf'];
const SCENARIO = 'Missions.ocf/AcidDrilling.ocs';
const SEED = 1793690358;
/** the frames the port plays; the keys: [before frame, KeyboardEvent.code, down] (the WASD control set) */
export const FRAMES = 300;
export const KEYS: [number, string, boolean][] = [
  [10, 'KeyD', true], [60, 'KeyD', false],
  [80, 'KeyW', true], [82, 'KeyW', false],
  [100, 'KeyA', true], [140, 'KeyA', false],
  [160, 'KeyD', true], [175, 'KeyW', true], [177, 'KeyW', false], [220, 'KeyD', false],
];
const skip = packMissing(GROUPS);
const server = path.join(re, 'work/headless/openclonk-server');

interface Played {
  /** the record's file name in Records.ocf and its files (the unpacked group) */
  name: string;
  files: Map<string, Uint8Array>;
  /** the cursor clonk's x position before each frame */
  xs: number[];
  /** whether each key event was taken by a control */
  taken: boolean[];
}

/** the port plays the scenario with the keys and records it */
export function playWithKeys(): Played {
  const game = boot({ groups: packedGroups(GROUPS), scenario: SCENARIO, seed: SEED, playerName: 'Clonk', record: true });
  const $ = game.engine;
  const xs: number[] = [];
  const taken: boolean[] = [];
  for (let f = 0; f < FRAMES; f++) {
    for (const [at, code, down] of KEYS) if (at === f) taken.push(keyEvent($, code, down, false, false, false, false));
    const cursor = $.Players.First?.Cursor?.op_C4Object_?.() ?? $.Players.First?.Cursor;
    xs.push(cursor && cursor.GetX ? cursor.GetX() : NaN);
    game.tick();
  }
  // C4Game::Clear stops the record (C4GameControl::Clear -> StopRecord): RCT_End, then the folder is packed
  $.Control$2.StopRecord(null, null);
  const dir = '/home/player/.clonk/openclonk/Records.ocf';
  const name = (listDir(dir) ?? []).find((n) => /\.ocs$/i.test(n));
  assert.ok(name, `a record in ${dir}: ${listDir(dir)}`);
  // C4Record::Stop packs the folder (C4Group_PackDirectory), which the port cannot do yet: the folder's files
  const files = new Map<string, Uint8Array>();
  const walk = (at: string, rel: string) => {
    const items = listDir(at);
    if (!items) { files.set(rel, readFile(at)!); return; }
    for (const n of items) walk(`${at}/${n}`, rel ? `${rel}/${n}` : n);
  };
  walk(`${dir}/${name}`, '');
  return { name: name!, files, xs, taken };
}

/** the control chunks of CtrlRec.ocb (C4RecordChunkHead: frame difference, type) up to RCT_End */
function chunkTypes(ctrl: Uint8Array): number[] {
  // without a parser of the packets: the heads are found by replaying the record; here only its end is checked
  return [ctrl[ctrl.length - 2], ctrl[ctrl.length - 1]];
}

test('the player\'s keys move the clonk, and the port records the game', { skip }, () => {
  const { files, xs, taken } = playWithKeys();
  assert.ok(taken.every((t) => t), `every key event reached a control (${taken})`);
  // D held from frame 10 to 60: the clonk walks right; A from 100 to 140: left
  assert.ok(Number.isFinite(xs[10]), 'the player has a cursor clonk');
  assert.ok(xs[60] > xs[10] + 20, `the clonk walked right (${xs[10]} -> ${xs[60]})`);
  assert.ok(xs[140] < xs[100] - 20, `the clonk walked left (${xs[100]} -> ${xs[140]})`);
  // after the last release it stops
  assert.equal(xs[FRAMES - 1], xs[FRAMES - 20], 'the clonk stopped');
  // the record: the scenario as C4GameSaveRecord saves it, the player infos, and the control, which ends with
  // C4Record::Stop's RCT_End head (frame difference 37, type 0x10)
  for (const f of ['Scenario.txt', 'PlayerInfos.txt', 'RecPlayerInfos.txt', 'Parameters.txt', 'CtrlRec.ocb']) {
    assert.ok(files.has(f), `the record has ${f} (${[...files.keys()].join(', ')})`);
  }
  const ctrl = files.get('CtrlRec.ocb')!;
  assert.deepEqual(chunkTypes(ctrl), [37, 0x10], 'the control ends with RCT_End');
  assert.ok(ctrl.length > 100, `the control has the join and the key presses (${ctrl.length} bytes)`);
});

test('the original replays the port\'s record without desync, step by step', {
  skip: skip || (!fs.existsSync(server) || !fs.existsSync(c4groupBin) ? 'the original\'s headless server or c4group is missing (re/openclonk/oracle/build-headless.sh, build.sh)' : false),
}, () => {
  const { name, files } = playWithKeys();
  const dir = path.join(re, 'work/dbgrec/input');
  fs.rmSync(dir, { recursive: true, force: true });
  for (const [rel, data] of files) {
    fs.mkdirSync(path.dirname(path.join(dir, name, rel)), { recursive: true });
    fs.writeFileSync(path.join(dir, name, rel), data);
  }
  const r = spawnSync('bash', [path.join(re, 'oracle/debugrec.sh'), '--replay', path.join(dir, name), 'PortInput', '15'], { encoding: 'utf8' });
  assert.equal(r.status, 0, `debugrec.sh --replay: ${r.stderr}`);
  const log = fs.readFileSync(path.join(re, 'work/dbgrec/PortInput.replay.log'), 'latin1');
  // C4ControlSyncCheck::Execute in a replay: "Network: Synchronization loss!"; C4Playback::DebugRecError: "Playback error"
  assert.doesNotMatch(log, /Synchronization loss|Playback error|Network: Rec /, 'the original finds the record in sync');
  assert.match(log, /Game started/);

  // the port's replay of the same record against the original's
  const expected = readDbgRecFile(new Uint8Array(fs.readFileSync(path.join(re, 'work/dbgrec/PortInput.rec'))));
  let frames = 0;
  for (const c of readDbgRecFile(new Uint8Array(fs.readFileSync(path.join(re, 'work/dbgrec/PortInput.rec'))))) {
    if (c.type === RCT.DbgFrame) frames = new DataView(c.data.buffer, c.data.byteOffset).getInt32(0, true);
  }
  assert.ok(frames >= FRAMES, `the original ran the whole record (${frames} frames)`);
  const packed = spawnSync(c4groupBin, [path.join(dir, name), '-p'], { encoding: 'utf8' });
  assert.equal(packed.status, 0, `c4group -p: ${packed.stderr}`);
  const record = new Uint8Array(fs.readFileSync(path.join(dir, name)));
  // the original's whole frames (after them: the clearing of the game, tools/dbgrec-fixture.ts). The original is
  // stopped between two frames or after it began the next one (its DbgFrame chunk): the port plays the whole ones
  let chunks = 0, whole = 0, frame = 0;
  for (const c of readDbgRecFile(new Uint8Array(fs.readFileSync(path.join(re, 'work/dbgrec/PortInput.rec'))))) {
    chunks++;
    if (c.type === RCT.DbgFrame) frame = new DataView(c.data.buffer, c.data.byteOffset).getInt32(0, true);
    if (c.type === RCT.Block && describe(c) === 'Block eGame') { whole = chunks; frames = frame; }
  }
  let equal = 0;
  let where = '';
  const before: string[] = [];
  class Diverged extends Error {}
  try {
    const game = boot({ groups: packedGroups(GROUPS), scenario: SCENARIO, seed: SEED, noPlayer: true, replay: { name, data: record },
      onDebugRec: (c: DbgChunk) => {
        const e = equal < whole ? expected.next().value as DbgChunk | undefined : undefined;
        if (!e || !sameChunk(c, e)) {
          where = `chunk ${equal}: the original has ${e ? describe(e) : 'no more chunks'}, the port ${describe(c)}; before it:\n  ${before.join('\n  ')}`;
          throw new Diverged();
        }
        before.push(describe(c));
        if (before.length > 12) before.shift();
        equal++;
      } });
    while (game.engine.Game.FrameCounter < frames) game.tick();
  } catch (e) {
    if (!(e instanceof Diverged)) throw e;
  }
  if (!where && equal < whole) where = `the port stopped after ${equal} of ${whole} chunks`;
  console.log(where ? `input record: ${equal} chunks equal; ${where}` : `input record: all ${equal} chunks equal (${frames} frames)`);
  assert.equal(where, '', where);
});
