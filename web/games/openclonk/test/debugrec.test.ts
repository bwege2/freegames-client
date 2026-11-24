// The simulation against the original's debug record (src/rt/debugrec.ts; milestone 1, re/openclonk/NOTES.md):
// the original's headless server plays a scenario without players and records the game (or takes a record the port
// wrote with a player, test/input.test.ts); replaying that record it writes every step that matters for the game
// state (re/openclonk/oracle/debugrec.sh). The port replays the same
// record (test/data/<name>-record.ocs) for as many frames as the original did and must make the same steps, chunk
// by chunk, and nothing more.
//
// The original's replay does not end by itself (its record ends with RCT_End, after which C4Playback::ExecuteControl
// returns before it would call Finish, so the game runs on without control): debugrec.sh stops the server between two
// frames, and its debug record ends with that frame's last chunk. The port runs the same frames.
//
// With the original's full record (re/openclonk/work/dbgrec/<Name>.rec) the test names the first chunk that differs;
// without it, it compares blocks of the record (test/data/<name>-dbgrec.json: before the first frame 1000 chunks a
// block, then one block per frame) and names the first block that differs.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { re } from './oracle.ts';
import { packMissing, packedGroups } from './content.ts';
import { boot } from '../src/boot.ts';
import { BLOCK, BlockHasher, RCT, describe, readDbgRecFile, sameChunk, type DbgChunk } from '../src/rt/debugrec.ts';

const BASE = ['System.ocg', 'Graphics.ocg', 'Material.ocg', 'Objects.ocd', 'Decoration.ocd'];

interface Scenario {
  /** the record's name in re/openclonk/work/dbgrec and test/data */
  name: string;
  /** the scenario folder group */
  folder: string;
  /** chunks of the original's record the port makes the same today; all of them once the scenario is equal */
  equalNow?: number;
}

const SCENARIOS: Scenario[] = [
  { name: 'AcidDrilling', folder: 'Missions.ocf' },
  { name: 'Tutorial05', folder: 'Tutorials.ocf' },
  { name: 'AcidRift', folder: 'Worlds.ocf' },
  { name: 'RockBottom', folder: 'Arena.ocf' },
  { name: 'Boomrace', folder: 'Parkour.ocf' },
  // a record the port wrote with a player and key presses (test/input.test.ts), as the original replays it
  { name: 'Input', folder: 'Missions.ocf' },
];

class Diverged extends Error {}

const frameOf = (c: DbgChunk) => new DataView(c.data.buffer, c.data.byteOffset).getInt32(0, true);

for (const s of SCENARIOS) {
  const base = s.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  const fixture = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, `data/${base}-dbgrec.json`), 'utf8'));
  const groups = [...BASE, s.folder];
  const full = path.join(re, `work/dbgrec/${s.name}.rec`);
  const equalNow = s.equalNow ?? fixture.chunks;

  /** runs the port's replay for the original's frames; `check` sees every chunk and throws Diverged to stop */
  const play = (check: (c: DbgChunk) => void): number => {
    let frames = 0;
    try {
      const record = new Uint8Array(fs.readFileSync(path.join(import.meta.dirname, `data/${base}-record.ocs`)));
      const game = boot({ groups: packedGroups(groups), scenario: fixture.scenario, seed: fixture.seed, noPlayer: true, onDebugRec: check,
        replay: { name: fixture.record ?? `001-${path.basename(fixture.scenario)}`, data: record } });
      // in a replay, every C4Game::Execute runs one frame (C4GameControl::Prepare is always ready)
      while (game.engine.Game.FrameCounter < fixture.frames && game.engine.Game.IsRunning) game.tick();
      frames = game.engine.Game.FrameCounter;
    } catch (e) {
      if (!(e instanceof Diverged)) throw e;
    }
    return frames;
  };

  test(`the simulation makes the original debug record's steps (${s.name}, ${fixture.frames} frames)`,
    { skip: packMissing(groups) }, () => {
      let equal = 0;
      let where = '';
      if (fs.existsSync(full)) {
        const expected = readDbgRecFile(new Uint8Array(fs.readFileSync(full)));
        const before: string[] = [];
        let frame = -1;
        play((c) => {
          const e = equal < fixture.chunks ? expected.next().value as DbgChunk | undefined : undefined;
          if (!e || !sameChunk(c, e)) {
            where = `chunk ${equal} (frame ${frame}): the original has ${e ? describe(e) : 'no more chunks'}, the port ${describe(c)}; ` +
              `before it:\n  ${before.join('\n  ')}`;
            throw new Diverged();
          }
          if (c.type === RCT.DbgFrame) frame = frameOf(c);
          before.push(describe(c));
          if (before.length > 12) before.shift();
          equal++;
        });
        if (!where && equal < fixture.chunks) where = `the port stopped after ${equal} of ${fixture.chunks} chunks`;
        // the original's frames end here too (after them only the clearing of the game, which the fixture leaves out)
        const after = expected.next().value as DbgChunk | undefined;
        if (!where && after && after.type === RCT.DbgFrame) where = `the original has more frames than ${fixture.frames}`;
      } else {
        const h = new BlockHasher();
        let checked = 0;
        const compare = () => {
          while (checked < h.blocks.length) {
            const [n, hash] = h.blocks[checked];
            const [n0, hash0] = fixture.blocks[checked] ?? [0, ''];
            if (n !== n0 || hash !== hash0) {
              where = `block ${checked} (${checked < fixture.blocks.length ? `${n0} chunks` : 'past the end'}) differs`;
              throw new Diverged();
            }
            equal += n;
            checked++;
          }
        };
        play((c) => { h.add(c); compare(); });
        if (!where) { h.flush(); try { compare(); } catch { /* recorded in where */ } }
        if (!where && checked < fixture.blocks.length) where = `the port stopped after ${checked} of ${fixture.blocks.length} blocks`;
        // the block of the divergence counts as far as BLOCK reaches into it before the first frame
        if (where && checked < fixture.blocks.length && equal < equalNow) where += ` (blocks of ${BLOCK} chunks before the first frame)`;
      }
      console.log(where ? `${s.name}: ${equal} chunks equal; ${where}` : `${s.name}: all ${equal} chunks equal`);
      if (equalNow === fixture.chunks) {
        assert.equal(where, '', `the port makes the original's whole record and nothing more: ${where}`);
        assert.equal(equal, fixture.chunks);
      } else {
        assert.ok(equal >= Math.min(equalNow, fs.existsSync(full) ? equalNow : Math.floor(equalNow / BLOCK) * BLOCK),
          `the port follows the original's record for at least ${equalNow} chunks (now ${equal}): ${where}`);
      }
    });
}
