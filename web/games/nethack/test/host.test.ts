// What the browser adds (src/host.ts): the keys a terminal sends, which files go to account storage, the
// record as the server's table and back, and the game's entry for the server when it ends.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { KeyInput, ScoreEntry } from '../../../src/sdk/index.ts';
import { finishedEntry, gamePath, keyBytes, packEntry, parseRecordLine, persistentName, recordFile, recordLine, unpackEntry } from '../src/host.ts';

const key = (k: Partial<KeyInput> & { key: string }): KeyInput =>
  ({ code: '', ctrl: false, alt: false, shift: false, meta: false, seq: k.key.length === 1 ? k.key : '', ...k });

test('keys: Enter is a newline, the arrows move, Alt sets the 8th bit', () => {
  assert.deepEqual(keyBytes(key({ key: 'Enter', seq: '\r' }), false), [10]);
  assert.deepEqual(keyBytes(key({ key: 'ArrowUp', seq: '\x1b[A' }), false), ['k'.charCodeAt(0)]);
  assert.deepEqual(keyBytes(key({ key: 'ArrowLeft', seq: '\x1b[D', shift: true }), false), ['H'.charCodeAt(0)]);
  assert.deepEqual(keyBytes(key({ key: 'PageDown', seq: '\x1b[6~' }), false), ['n'.charCodeAt(0)]);
  assert.deepEqual(keyBytes(key({ key: 'ArrowUp', seq: '\x1b[A' }), true), ['8'.charCodeAt(0)]);
  assert.deepEqual(keyBytes(key({ key: 'p', alt: true, seq: '\x1bp' }), false), [0x80 | 'p'.charCodeAt(0)]);
  assert.deepEqual(keyBytes(key({ key: 'Escape', seq: '\x1b' }), false), [27]);
  assert.deepEqual(keyBytes(key({ key: 'Backspace', seq: '\x7f' }), false), [127]);
  assert.deepEqual(keyBytes(key({ key: 'd', ctrl: true, seq: '\x04' }), false), [4]);
});

test('files: save files and bones are kept, the rest not', () => {
  assert.equal(persistentName('save/1000Valka'), 'save.1000Valka');
  assert.equal(gamePath('save.1000Valka'), 'save/1000Valka');
  assert.equal(persistentName('bonD0.12'), 'bonD0.12');
  assert.equal(persistentName('bonD0.12.lock'), null);
  assert.equal(persistentName('1000Valka.3'), null);
  assert.equal(persistentName('record'), null);
  assert.equal(persistentName('save/1000a b'), null, 'a name the storage cannot keep');
});

const LINE = '3.6.7 1234 0 4 5 -2 40 1 20261027 20261020 1000 Val Hum Fem Neu Brunhild,killed by a jackal, while sleeping\n';

test('the record: a line as writeentry() writes it, and back', () => {
  const e = parseRecordLine(LINE)!;
  assert.equal(e.points, 1234);
  assert.equal(e.hp, -2);
  assert.equal(e.name, 'Brunhild');
  assert.equal(e.death, 'killed by a jackal, while sleeping');
  assert.equal(recordLine(e), LINE);
  assert.deepEqual(unpackEntry(packEntry(e)), e);
  assert.equal(parseRecordLine('3.6.7 garbage'), null);
});

test('the record file: the server\'s entries, the player\'s own with the game\'s uid', () => {
  const e = parseRecordLine(LINE)!;
  const entry = (accountId: number, name: string, points: number): ScoreEntry =>
    ({ rank: 0, score: BigInt(points), name, accountId, time: 0, detail: packEntry({ ...e, name, points, uid: 7 }) });
  const file = recordFile([entry(5, 'Bert', 900), entry(9, 'Brunhild', 800), entry(5, 'Bert', 700), entry(6, 'Cid', 600)], 9);
  const lines = String.fromCharCode(...file).trim().split('\n').map((l) => parseRecordLine(l)!);
  assert.deepEqual(lines.map((l) => [l.name, l.points, l.uid]), [['Bert', 900, 1001], ['Brunhild', 800, 1000], ['Bert', 700, 1001], ['Cid', 600, 1002]]);
});

test('the end of a game: its entry from the logfile, unless in wizard or discover mode', () => {
  const log = Uint8Array.from('older line\n' + LINE, (c) => c.charCodeAt(0));
  const xlog = (flags: number) => Uint8Array.from(`version=3.6.7\tpoints=1234\tname=Brunhild\tflags=0x${flags.toString(16)}\n`, (c) => c.charCodeAt(0));
  assert.equal(finishedEntry(xlog(4), log)?.points, 1234);
  assert.equal(finishedEntry(xlog(1), log), null, 'wizard mode');
  assert.equal(finishedEntry(xlog(2 | 4), log), null, 'discover mode');
  const zero = Uint8Array.from(LINE.replace(' 1234 ', ' 0 '), (c) => c.charCodeAt(0));
  assert.equal(finishedEntry(xlog(4), zero), null, 'no points: not in the record (POINTSMIN)');
});

// The installation's files are the oracle's (re/nethack/oracle/build.sh made them with the release's
// makedefs, lev_comp, dgn_comp and dlb); without the oracle the test says so and skips.
const INSTALL = join(import.meta.dirname, '..', '..', '..', '..', 're', 'nethack', 'work', 'install');
test('assets: the original\'s data files', { skip: existsSync(INSTALL) ? false : 'no oracle: run re/nethack/fetch.sh and re/nethack/oracle/build.sh' }, () => {
  for (const f of ['nhdat', 'license', 'symbols', 'sysconf']) {
    assert.ok(readFileSync(join(import.meta.dirname, '..', 'assets', f)).equals(readFileSync(join(INSTALL, f))), f);
  }
});
