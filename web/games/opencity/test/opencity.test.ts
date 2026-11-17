// OpenCity's port against the original. The transcripts in test/oracle/ were written by the original's own
// game logic (re/opencity/oracle: city.cpp, the building layer, the simulators, the map maker and the save
// code of 0.0.6.5stable, compiled unchanged) running the scripts of re/opencity/oracle/scripts/; the port
// runs the same scripts and must print the same: the map maker's height map and tree density, the city's
// date, money, population and simulator values, every structure with its level and status bits, the
// vehicles (positions as float bits), the simulator thread's delays, and byte-identical save files.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { loadModel } from '../src/ac3d.ts';
import { Conf, strtol } from '../src/conf.ts';
import { GlibcRandom } from '../src/rand.ts';
import { ASSETS, loadProperties, runScript } from './script.ts';

const ORACLE = join(import.meta.dirname, 'oracle');
const SCRIPTS = join(import.meta.dirname, '..', '..', '..', '..', 're', 'opencity', 'oracle', 'scripts');

test('glibc rand(): the generator the original uses on Linux', () => {
  const g = new GlibcRandom(1);
  assert.deepEqual([g.rand(), g.rand(), g.rand()], [1804289383, 846930886, 1681692777]);
  g.srand(42);
  assert.equal(g.rand(), 71876166);
});

test('.conf files: the original parser\'s rules', () => {
  const c = new Conf('width=6\nheight=2.35\nname = Large Hospital\n#x=1\nlast=1');
  assert.equal(c.getLint('width', 0), 6);
  assert.equal(c.getLint('height', 1), 2);   // strtol stops at the dot
  assert.equal(c.getValue('name'), 'Large Hospital');
  assert.equal(c.getValue('#x', 'none'), 'none');
  assert.equal(c.getValue('last', 'unread'), 'unread');   // no newline at the end: not read
  assert.equal(strtol('0x10'), 16);
  assert.equal(strtol('010'), 8);
});

const scripts = existsSync(SCRIPTS) ? readdirSync(SCRIPTS).filter((f) => f.endsWith('.txt')).sort() : [];
test('the oracle scripts are there', () => {
  assert.ok(scripts.length >= 4, 're/opencity/oracle/scripts/*.txt');
});

const pm = loadProperties();
for (const file of scripts) {
  const name = file.replace(/\.txt$/, '');
  test(`oracle script ${name}: same transcript and save files as the original`, () => {
    const files = new Map<string, Uint8Array>();
    const got = runScript(readFileSync(join(SCRIPTS, file), 'utf8'), pm, files);
    const want = readFileSync(join(ORACLE, `${name}.out`), 'utf8');
    const a = got.split('\n'), b = want.split('\n');
    for (let i = 0; i < Math.max(a.length, b.length); i++) assert.equal(a[i], b[i], `${name}.out line ${i + 1}`);
    for (const [save, bytes] of files) {
      const orig = readFileSync(join(ORACLE, save));
      assert.ok(Buffer.from(bytes).equals(orig), `${save} is byte-identical to the original's`);
    }
  });
}

/** PNG width and height from the IHDR chunk */
function pngSize(file: string): [number, number] {
  const b = readFileSync(file);
  return [b.readUInt32BE(16), b.readUInt32BE(20)];
}

test('the two replacement textures keep the original size, and their models load with UVs inside them', () => {
  for (const [ac, tex, size] of [
    ['graphism/hospitaldept/large/large.ac', 'large.png', 512],
    ['graphism/industrial/containers/containers.ac', 'containers.png', 256],
  ] as const) {
    const model = loadModel(readFileSync(join(ASSETS, ac), 'latin1'));
    assert.ok(model, `${ac} loads`);
    assert.equal(model.texture, tex);
    const dir = join(ASSETS, ac, '..');
    assert.deepEqual(pngSize(join(dir, tex)), [size, size], `${tex} is ${size}x${size} like the original`);
    const tris = model.opaque.position.length / 9 + model.twoSide.position.length / 9;
    assert.ok(tris > 10, `${ac} has triangles (${tris})`);
    for (const uv of [...model.opaque.uv, ...model.twoSide.uv]) assert.ok(uv >= -0.01 && uv <= 1.01, `uv ${uv} inside the texture`);
  }
});

test('every model of graphism.conf loads and finds its texture', () => {
  const conf = new Conf(readFileSync(join(ASSETS, 'config', 'graphism.conf'), 'latin1'));
  let n = 0;
  for (let gc = 0; gc < 500; gc++) {
    const path = conf.getValue(String(gc));
    if (!path) continue;
    const model = loadModel(readFileSync(join(ASSETS, path), 'latin1'));
    assert.ok(model, path);
    if (model.texture) assert.ok(existsSync(join(ASSETS, path, '..', model.texture)), `${path}: ${model.texture}`);
    assert.deepEqual(pm.getWLH(gc, 0, 0, 0).length, 3);
    n++;
  }
  assert.equal(n, 79, `${n} models`);
});
