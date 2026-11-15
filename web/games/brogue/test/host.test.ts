// The browser's side of the port without a browser: file names in account storage, the high-score files
// as the server's tables (what goes to the server when the program writes one), and the keys as
// sdl2-platform.c turns them into Brogue's.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { unpackGame } from '../../../src/sdk/index.ts';
import { GameFiles, SCORE_FILES, gamePath, scoreFileLines, scoreFileText, storageName } from '../src/files.ts';
import { keyEvent } from '../src/host.ts';
import { Score } from '../src/proto/brogue.ts';

test('file names in storage', () => {
  for (const name of ['LastGame.broguesave', 'BrogueRunHistory.txt', 'CE 1.15.1 #7 Died at depth 2.broguerec', 'a-b_c.broguerec', 'Saved #12 (2).broguesave']) {
    const s = storageName(name);
    assert.ok(s && /^[A-Za-z0-9._-]{1,64}$/.test(s), `${name} -> ${s}`);
    assert.equal(gamePath(s!), name);
  }
  assert.equal(storageName('LastGame.broguesave'), 'LastGame.broguesave');
  assert.equal(storageName('x'.repeat(65)), null, 'too long for storage');
  assert.equal(storageName('#'.repeat(22)), null, 'too long once encoded');
  assert.equal(storageName('dir/file'), null);
});

test('a high-score file from a table and back', () => {
  const text = scoreFileText([{ score: 71, time: 1704067200999, description: 'Killed by a cloud of caustic gas on depth 2.' }]);
  const lines = text.split('\n');
  assert.equal(lines.length, 31, '30 lines and the end');
  assert.equal(lines[0], '71\t1704067200\tKilled by a cloud of caustic gas on depth 2.');
  assert.equal(lines[29], '0\t0\t(empty entry)');
  assert.deepEqual(scoreFileLines(text)[0], [71, 1704067200, 'Killed by a cloud of caustic gas on depth 2.']);
});

test('what saveHighScore() writes goes to the server', async () => {
  const submitted: { table: string; score: number; description: string }[] = [];
  const stored = new Map<string, Uint8Array>([['LastGame.broguesave', new Uint8Array([1, 2, 3])]]);
  const ctx = {
    signal: new AbortController().signal,
    storage: {
      list: async () => [...stored.keys()].map((name) => ({ name, size: stored.get(name)!.length, modified: 0 })),
      get: async (n: string) => stored.get(n) ?? null,
      put: async (n: string, d: Uint8Array) => void stored.set(n, d),
      delete: async (n: string) => void stored.delete(n),
    },
    scores: {
      get: async (table: string) => (table === 'Brogue' ? [{ rank: 1, score: 500n, name: 'x', accountId: 1, time: 1700000000000, detail: new Uint8Array() }] : []),
      submit: async (table: string, score: number, _name: string, detail: Uint8Array) => {
        submitted.push({ table, score, description: unpackGame(Score, detail).description });
        return { rank: 1, entries: [] };
      },
    },
  } as any;
  const files = new GameFiles(ctx);
  const initial = await files.load();
  assert.deepEqual([...initial.keys()].sort(), ['BrogueHighScores.txt', 'BulletBrogueHighScores.txt', 'LastGame.broguesave', 'RapidBrogueHighScores.txt']);
  const before = new TextDecoder().decode(initial.get('BrogueHighScores.txt'));
  assert.equal(before.split('\n')[0], '500\t1700000000\t?', 'an entry the client cannot read keeps its place');
  // saveHighScore(): the lowest line replaced by the new one, the file written whole
  const lines = before.split('\n');
  lines[29] = '71\t1704067200\tKilled by a jackal on depth 2.';
  files.changed('BrogueHighScores.txt', new TextEncoder().encode(lines.join('\n')));
  files.changed('BrogueHighScores.txt', new TextEncoder().encode(lines.join('\n')));
  assert.deepEqual(submitted, [{ table: 'Brogue', score: 71, description: 'Killed by a jackal on depth 2.' }], 'once');
  assert.ok(Object.keys(SCORE_FILES).every((f) => files.canCreate(f)));
  // other files go to storage
  files.changed('CE 1.15.1 #7 Died at depth 2.broguerec', new Uint8Array([9]));
  files.changed('LastGame.broguesave', null);
  await new Promise((r) => setTimeout(r, 10));
  await files.flush();
  assert.deepEqual([...stored.keys()].sort(), ['CE-201.15.1-20-237-20Died-20at-20depth-202.broguerec']);
  assert.equal(files.canCreate('#'.repeat(30)), false);
});

test('keys as sdl2-platform.c makes them', () => {
  const k = (key: string, o: Partial<{ code: string; shiftKey: boolean; ctrlKey: boolean; altKey: boolean; metaKey: boolean }> = {}) =>
    keyEvent({ key, code: o.code ?? '', shiftKey: !!o.shiftKey, ctrlKey: !!o.ctrlKey, altKey: !!o.altKey, metaKey: !!o.metaKey });
  assert.equal(k('Escape'), 27);
  assert.equal(k('Enter'), 10);
  assert.equal(k('Backspace'), 127);
  assert.equal(k('Tab'), 9);
  assert.equal(k('ArrowUp'), 63232);
  assert.equal(k('ArrowDown'), 63233);
  assert.equal(k('ArrowLeft'), 63234);
  assert.equal(k('ArrowRight'), 63235);
  assert.equal(k('x'), 120);
  assert.equal(k('>', { shiftKey: true }), 62);
  assert.equal(k('H', { shiftKey: true }), 72);
  assert.equal(k('7', { code: 'Numpad7' }), 55, 'the keypad without a modifier: its text');
  assert.equal(k('Home', { code: 'Numpad7', shiftKey: true }), 55, 'with Shift: NUMPAD_7');
  assert.equal(k('x', { ctrlKey: true }), null, 'no text while Control is held');
  assert.equal(k('é'), null, 'only ASCII');
  assert.equal(k('F1'), null);
});
