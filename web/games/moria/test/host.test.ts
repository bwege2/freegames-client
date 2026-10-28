// What the browser gives the program (src/host.ts): the account storage as its working directory, the
// server's score table as its score file (the records packed in protocol/games/moria.capnp), and keys.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyBytes, packScore, ServerScores, StorageFiles, unpackScore, type HostContext } from '../src/host.ts';
import { HighScore_t } from '../src/structs.ts';
import type { KeyInput } from '../../../src/sdk/index.ts';

function entry(): HighScore_t {
  const e = new HighScore_t();
  e.points = 123456;
  e.birth_date = 1704067200;
  e.uid = 0;
  e.mhp = 210;
  e.chp = -4;
  e.dungeon_depth = 17;
  e.level = 22;
  e.deepest_dungeon_depth = 19;
  e.gender = 'F'.charCodeAt(0);
  e.race = 2;
  e.character_class = 1;
  e.name = 'Galadriel';
  e.died_from = 'Ancient Multi-Hued Dragon';
  return e;
}

test('a score record survives the trip through the table', () => {
  const e = entry();
  const back = unpackScore(packScore(e));
  assert.ok(back);
  for (const k of ['points', 'birth_date', 'uid', 'mhp', 'chp', 'dungeon_depth', 'level', 'deepest_dungeon_depth', 'gender', 'race', 'character_class', 'name', 'died_from'] as const) {
    assert.equal(back[k], e[k], k);
  }
  assert.equal(unpackScore(new Uint8Array([1, 2, 3])), null, 'not a record');
});

interface Submitted { table: string; score: number | bigint; name: string; detail?: Uint8Array }

function fakeContext(stored = new Map<string, Uint8Array>()) {
  const submitted: Submitted[] = [];
  let failing = false;
  const table: { detail: Uint8Array }[] = [];
  const ctx = {
    signal: new AbortController().signal,
    storage: {
      async list() { return [...stored.keys()].map((name) => ({ name, size: stored.get(name)!.length, modified: 0 })); },
      async get(n: string) { return stored.get(n) ?? null; },
      async put(n: string, d: Uint8Array) { if (failing) throw new Error('offline'); stored.set(n, d.slice()); },
      async delete(n: string) { stored.delete(n); },
    },
    scores: {
      async submit(t: string, score: number | bigint, name: string, detail?: Uint8Array) {
        if (failing) throw new Error('offline');
        submitted.push({ table: t, score, name, detail });
        table.push({ detail: detail! });
        return { rank: 1, entries: [] };
      },
      async get() {
        if (failing) throw new Error('offline');
        return [{ detail: new Uint8Array([9, 9]) }, ...table].map((e, i) => ({ rank: i + 1, score: 0n, name: '', accountId: 1, time: 0, detail: e.detail }));
      },
    },
  } as unknown as HostContext;
  return { ctx, stored, submitted, fail: (v: boolean) => { failing = v; } };
}

test('the score file is the server\'s table', async () => {
  const f = fakeContext();
  const scores = new ServerScores(f.ctx);
  assert.equal(await scores.record(entry()), null);
  assert.equal(f.submitted.length, 1);
  assert.equal(f.submitted[0].table, 'scores');
  assert.equal(f.submitted[0].score, 123456);
  assert.equal(f.submitted[0].name, 'Galadriel');
  const list = await scores.read();
  assert.ok(Array.isArray(list));
  assert.equal(list.length, 1, 'an entry that is no record is left out');
  assert.equal(list[0].name, 'Galadriel');
  f.fail(true);
  assert.equal(await scores.record(entry()), "Error opening score file 'scores.dat'.");
  assert.equal(await scores.read(), "Error opening score file 'scores.dat'.");
});

test('the working directory is the account storage', async () => {
  const f = fakeContext(new Map([['game.sav', new Uint8Array([1, 2, 3])]]));
  const files = new StorageFiles(f.ctx);
  await files.load();
  assert.deepEqual(files.read('game.sav'), new Uint8Array([1, 2, 3]));
  assert.ok(files.exists('scores.dat'), 'the score file is there');
  assert.deepEqual(files.read('scores.dat'), new Uint8Array(0));
  assert.equal(files.write('my record', new Uint8Array([1])), false, 'a name the storage cannot keep');
  assert.equal(files.write('frodo.txt', new Uint8Array([7])), true);
  assert.equal(files.write('scores.dat', new Uint8Array([7])), true, 'the score file is not stored');
  assert.equal(files.remove('game.sav'), true);
  assert.equal(files.remove('game.sav'), false);
  assert.equal(files.write('big', new Uint8Array(512 * 1024 + 1)), false, 'larger than a stored file can be');
  await files.settled();
  assert.deepEqual([...f.stored.keys()].sort(), ['frodo.txt']);
  // written before the server answers: the last write wins
  files.write('game.sav', new Uint8Array([4]));
  files.write('game.sav', new Uint8Array([5]));
  await files.settled();
  assert.deepEqual(f.stored.get('game.sav'), new Uint8Array([5]));
});

const key = (k: Partial<KeyInput>): KeyInput => ({ key: '', code: '', ctrl: false, alt: false, shift: false, meta: false, seq: '', ...k });

test('keys arrive as a terminal sends them; the arrows move', () => {
  assert.deepEqual(keyBytes(key({ key: 'a', seq: 'a' }), false), [97]);
  assert.deepEqual(keyBytes(key({ key: 'x', ctrl: true, seq: '\x18' }), false), [0x18], 'Ctrl+X');
  assert.deepEqual(keyBytes(key({ key: 'Escape', seq: '\x1b' }), false), [27]);
  assert.deepEqual(keyBytes(key({ key: 'Backspace', seq: '\x7f' }), false), [127]);
  assert.deepEqual(keyBytes(key({ key: 'ArrowUp', seq: '\x1b[A' }), false), [56], 'the original keys: 8');
  assert.deepEqual(keyBytes(key({ key: 'ArrowUp', seq: '\x1b[A' }), true), [107], 'roguelike: k');
  assert.deepEqual(keyBytes(key({ key: 'Home', seq: '\x1b[H' }), false), [55]);
  assert.deepEqual(keyBytes(key({ key: 'PageDown', seq: '\x1b[6~' }), true), [110]);
  assert.deepEqual(keyBytes(key({ key: 'ArrowLeft', shift: true, seq: '\x1b[1;2D' }), false), [46, 52], 'run: . and 4');
  assert.deepEqual(keyBytes(key({ key: 'ArrowLeft', shift: true, seq: '\x1b[1;2D' }), true), [72], 'run: H');
  assert.deepEqual(keyBytes(key({ key: 'é', seq: 'é' }), false), [], 'not in the original\'s character set');
  assert.deepEqual(keyBytes(key({ key: 'Delete', seq: '\x1b[3~' }), false), [], 'an escape sequence would be ESC, [, 3, ~');
  assert.deepEqual(keyBytes(key({ key: 'F1', seq: '\x1bOP' }), true), []);
});
