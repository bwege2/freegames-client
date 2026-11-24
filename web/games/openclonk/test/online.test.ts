// Online play's messages (src/online.ts, protocol/games/openclonk.capnp): what the browsers and the server module
// (server/.../games/openclonk/OpenclonkModule.java, tested with loopback clients there) send each other survives the wire,
// and what is not the module's is not read as such. The round itself (the original's control queue in network mode with
// src/net.ts in C4Network2's place, against the real server) is test/online-e2e.test.ts.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { unpackGame, bytes, type RoundStart } from '../../../src/sdk/index.ts';
import { Msg } from '../src/proto/openclonk.ts';
import {
  packOptions, readOptions, packControl, packSyncCheck, packRoundResults, packServerMsg, readServerMsg,
  readResults, packResults, clientId, randomSeed,
  type TickControl, type SyncCheck, type RoundResultsData, type Outcome, type ServerMsg,
} from '../src/online.ts';

const text = (b: Uint8Array) => new TextDecoder().decode(b);
const enc = (s: string) => new TextEncoder().encode(s);

test('the messages survive the wire, and what is not the module\'s is not read as such', () => {
  const o = readOptions(packOptions({ scenario: 'Missions.ocf/AcidDrilling.ocs' }));
  assert.deepEqual(o, { scenario: 'Missions.ocf/AcidDrilling.ocs', controlRate: 3, maxPlayers: 0, mode: 'central', asyncMaxWait: 2 });
  assert.equal(readOptions(packOptions({ scenario: 'x.ocs', controlRate: 0, mode: 'async', asyncMaxWait: 5, maxPlayers: 30 })).controlRate, 3);
  assert.equal(readOptions(packOptions({ scenario: 'x.ocs', mode: 'async', asyncMaxWait: 5 })).mode, 'async');

  const c = unpackGame(Msg, packControl(4_000_000_000, enc('ctrl')));
  assert.ok(c._isControl);
  assert.equal(c.control.tick, 4_000_000_000);
  assert.equal(text(bytes(c.control.ctrl)), 'ctrl');

  const check: SyncCheck = {
    frame: 300, controlTick: 99, randomCount: -5, allCrewPosX: 123456, pxsCount: 7, massMoverIndex: 8, objectCount: 481,
    objectEnumerationIndex: 1000, sectShapeSum: -1, hash: (1n << 63n) + 5n,
  };
  const s = unpackGame(Msg, packSyncCheck(check));
  assert.equal(s.syncCheck.hash, (1n << 63n) + 5n);
  assert.equal(s.syncCheck.randomCount, -5);

  const results: RoundResultsData = {
    frame: 3600, playingTime: 100, goals: ['Goal_Melee', 'Goal_Script'], fulfilledGoals: ['Goal_Melee'],
    players: [{ id: 1, seat: 0, name: 'Anna', won: true, totalPlayingTime: 100, scoreOld: -1, scoreNew: 50 },
      { id: 2, seat: 255, name: 'Script', won: false, totalPlayingTime: 90, scoreOld: 10, scoreNew: 12 }],
  };
  const rr = unpackGame(Msg, packRoundResults(results));
  assert.ok(rr._isRoundResults);
  assert.equal(rr.roundResults.players.get(1).name, 'Script');

  const tick: TickControl = {
    tick: 17, events: [{ seat: 0, kind: 'join' }, { seat: 2, kind: 'remove' }],
    controls: [{ seat: 0, tick: 17, ctrl: enc('p0') }, { seat: 1, tick: 15, ctrl: enc('p1 late') }],
  };
  const msgs: ServerMsg[] = [
    { t: 'tick', tick },
    { t: 'history', start: 17, total: 19, resume: 18, ticks: [tick, { tick: 18, events: [{ seat: 1, kind: 'activate' }], controls: [] }] },
    { t: 'desync', frame: 300, seat: 1, check, other: 0, otherCheck: { ...check, hash: 1n } },
  ];
  for (const m of msgs) assert.deepEqual(readServerMsg(packServerMsg(m)), m);
  assert.equal(readServerMsg(packControl(1, enc('x'))), null, 'a browser\'s message');
  assert.equal(readServerMsg(new Uint8Array([0x13, 0x37, 1])), null, 'garbage');

  for (const out of [{ reason: 'evaluated', frame: 3600, results }, { reason: 'desync', frame: 300, results: null }] as Outcome[]) {
    assert.deepEqual(readResults(packResults(out)), out);
  }
  assert.equal(readResults(new Uint8Array([9, 9, 9])), null);

  assert.equal(clientId(0), 1);
  assert.equal(randomSeed({ seed: (1n << 40n) + 7n } as RoundStart), 7);
  assert.equal(randomSeed({ seed: -1n } as RoundStart), -1);
});
