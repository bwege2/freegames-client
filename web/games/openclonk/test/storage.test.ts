// The player's files in the site's storage (src/storage.ts) with a fake storage: which files of the original's user folder
// last, their storage names, loading them before the engine starts, writing back what the engine changed (in order,
// only when the bytes differ), removing what it removed, and the storage's limits (64 files, 512 KiB each, 4 MiB in all).
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { kept, pathOf, storageName, UserFiles, LIMITS, type FileStore } from '../src/storage.ts';
import { addFile, fsState, isDir, listDir, readFile, removePath, resetFs, takeChanges } from '../src/rt/fs.ts';

const USER = '/home/clonk/.clonk/openclonk/';
const fs = { readFile, addFile, isDir, listDir };

class FakeStore implements FileStore {
  files = new Map<string, Uint8Array>();
  log: string[] = [];
  async get(name: string) { return this.files.get(name)?.slice() ?? null; }
  async put(name: string, data: Uint8Array) {
    if (!/^[A-Za-z0-9._-]{1,64}$/.test(name)) throw new Error(`bad name ${name}`);
    if (data.length > LIMITS.fileSize) throw new Error('too large');
    this.log.push('put ' + name);
    this.files.set(name, data.slice());
  }
  async delete(name: string) { this.log.push('delete ' + name); return this.files.delete(name); }
  async list(prefix = '') {
    return [...this.files].filter(([n]) => n.startsWith(prefix)).sort(([a], [b]) => (a < b ? -1 : 1)).map(([name, d]) => ({ name, size: d.length }));
  }
}

const bytes = (s: string) => new TextEncoder().encode(s);
/** the engine writes a file (rt/fs.ts marks it changed as c$open/c$write do) */
const write = (rel: string, data: Uint8Array) => { addFile(USER + rel, data); fsState.changed.add(USER + rel); };

test('the files of the user folder that last, and their storage names', () => {
  for (const rel of ['config', 'Clonk.ocp', 'Mein Spieler.ocp', 'Savegames.ocf/Title.txt', 'Savegames.ocf/Tutorial01.ocf/Title.txt',
    'Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs']) assert.ok(kept(rel), rel);
  for (const rel of ['OpenClonk.log', 'Records.ocf/Record001.ocs', 'Clonk.ocp/Player.txt', 'Savegames.ocf/x.ocs', 'Screenshots/s.png'])
    assert.ok(!kept(rel), rel);
  assert.equal(storageName('config'), 'config');
  assert.equal(storageName('Clonk.ocp'), 'Clonk.ocp');
  assert.equal(storageName('Mein Spieler.ocp'), 'Mein_20Spieler.ocp');
  assert.equal(storageName('Jörg_2.ocp'), 'J_C3_B6rg_5F2.ocp');
  assert.equal(storageName('Savegames.ocf/DeepSeaMining.ocf/DeepSeaMining10.ocs'), 'Savegames.ocf__DeepSeaMining.ocf__DeepSeaMining10.ocs');
  for (const rel of ['config', 'Mein Spieler.ocp', 'Jörg_2.ocp', 'Savegames.ocf/DeepSeaMining.ocf/DeepSeaMining10.ocs', 'a__b.ocp']) {
    const n = storageName(rel)!;
    assert.match(n, /^[A-Za-z0-9._-]{1,64}$/);
    assert.equal(pathOf(n), rel);
  }
  assert.equal(storageName('x'.repeat(61) + '.ocp'), null, 'longer than the storage allows');
  assert.equal(pathOf('bad name'), null);
});

test('loading before the start, writing back after a frame, in order and only what changed', async () => {
  resetFs();
  const store = new FakeStore();
  store.files.set('config', bytes('[General]\nMissionAccess=S2Tutorial\n'));
  store.files.set('Clonk.ocp', bytes('player'));
  store.files.set('unrelated', bytes('not the original\'s'));
  const files = new UserFiles(store, USER, fs);
  assert.deepEqual(await files.load(), ['Clonk.ocp', 'config']);
  assert.equal(new TextDecoder().decode(readFile(USER + 'config')!), '[General]\nMissionAccess=S2Tutorial\n');
  takeChanges();

  // the engine saves its config unchanged, a new player and a savegame, and writes its log
  write('config', bytes('[General]\nMissionAccess=S2Tutorial\n'));
  write('Neu.ocp', bytes('new player'));
  write('Savegames.ocf/Title.txt', bytes('DE:Spielstände'));
  write('Savegames.ocf/Tutorial01.ocf/Title.txt', bytes('DE:Tutorial 1'));
  write('Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs', bytes('savegame'));
  write('OpenClonk.log', bytes('log'));
  const r = await files.sync(takeChanges());
  assert.deepEqual(r.put, ['Neu.ocp', 'Savegames.ocf/Title.txt', 'Savegames.ocf/Tutorial01.ocf/Title.txt', 'Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs']);
  assert.deepEqual(r.refused, []);
  assert.deepEqual(store.log, ['put Neu.ocp', 'put Savegames.ocf__Title.txt', 'put Savegames.ocf__Tutorial01.ocf__Title.txt',
    'put Savegames.ocf__Tutorial01.ocf__Tutorial011.ocs']);

  // the player selection deletes a player, the scenario selection a savegame's folder
  store.log.length = 0;
  removePath(USER + 'Clonk.ocp');
  fsState.changed.add(USER + 'Clonk.ocp');
  removePath(USER + 'Savegames.ocf/Tutorial01.ocf');
  fsState.changed.add(USER + 'Savegames.ocf/Tutorial01.ocf');
  const r2 = await files.sync(takeChanges());
  assert.deepEqual(r2.removed, ['Clonk.ocp', 'Savegames.ocf/Tutorial01.ocf/Title.txt', 'Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs']);
  assert.deepEqual(store.log, ['delete Clonk.ocp', 'delete Savegames.ocf__Tutorial01.ocf__Title.txt', 'delete Savegames.ocf__Tutorial01.ocf__Tutorial011.ocs']);

  // a new start finds what the last one left
  resetFs();
  const again = new UserFiles(store, USER, fs);
  assert.deepEqual(await again.load(), ['Neu.ocp', 'Savegames.ocf/Title.txt', 'config']);
  assert.equal(new TextDecoder().decode(readFile(USER + 'Neu.ocp')!), 'new player');
});

test('the storage\'s limits: a file the storage cannot keep is reported, the others are kept', async () => {
  resetFs();
  const store = new FakeStore();
  const files = new UserFiles(store, USER, fs);
  await files.load();
  const refused: string[] = [];
  files.onRefused = (p, why) => refused.push(`${p}: ${why}`);
  write('Big.ocp', new Uint8Array(LIMITS.fileSize + 1));
  write('Small.ocp', new Uint8Array(100));
  const r = await files.sync(takeChanges());
  assert.deepEqual(r.put, ['Small.ocp']);
  assert.equal(r.refused.length, 1);
  assert.match(refused[0], /^Big\.ocp: 524289 bytes, more than the storage keeps per file/);
  // 4 MiB in all: eight files of 500 KiB fit, the ninth does not
  for (let i = 0; i < 9; i++) write(`Savegames.ocf/S.ocf/S${i}.ocs`, new Uint8Array(500 * 1024));
  const r2 = await files.sync(takeChanges());
  assert.equal(r2.put.length, 8);
  assert.match(r2.refused[0].why, /in all, more than the storage keeps/);
  assert.ok(files.usage().bytes <= LIMITS.total);
});

test('a group the original writes as a folder (a savegame) is stored packed', async () => {
  resetFs();
  const store = new FakeStore();
  const packed: string[] = [];
  const files = new UserFiles(store, USER, { ...fs, pack: (p) => { packed.push(p); return bytes('packed:' + listDir(p)!.sort().join(',')); } });
  await files.load();
  // C4GameSave copies the scenario folder and writes into it: the changes are files inside the savegame's folder
  write('Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs/Scenario.txt', bytes('[Head]'));
  write('Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs/Game.txt', bytes('objects'));
  const r = await files.sync(takeChanges());
  assert.deepEqual(r.put, ['Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs']);
  assert.deepEqual(packed, [USER + 'Savegames.ocf/Tutorial01.ocf/Tutorial011.ocs']);
  assert.equal(new TextDecoder().decode(store.files.get('Savegames.ocf__Tutorial01.ocf__Tutorial011.ocs')), 'packed:Game.txt,Scenario.txt');
});
