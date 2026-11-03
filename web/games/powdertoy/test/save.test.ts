// Saves and stamps: bzip2 (src/save/bzip2.ts), BSON (src/save/bson.ts), the OPS format (src/save/gameSave.ts) and
// Simulation::Save/Load (src/save/load.ts), checked against the original's save code compiled into
// re/powdertoy/oracle (its save/load commands): test/fixtures/oracle-save.ops was written by the original from
// test/scenarios-save/save.txt, and oracle-load.txt is what the original prints after loading it.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { execFileSync } from 'node:child_process';
import { existsSync, mkdtempSync, readFileSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { BZ2WCompress, BZ2WDecompress, BZ2WDecompressOk, BZ2WDecompressBad, BZ2WDecompressEof, BZ2WDecompressType,
  BZ2WDecompressLimit } from '../src/save/bzip2.ts';
import { Bson, objectValue, arrayValue, int32Value, int64Value } from '../src/save/bson.ts';
import { GameSave, ParseException, signNeedsV95 } from '../src/save/gameSave.ts';
import { Load, Save } from '../src/save/load.ts';
import { sd } from '../src/sim/simulationData.ts';
import { NPART, XCELLS, XRES, YCELLS, YRES, WL_FAN, WL_WALL } from '../src/sim/config.ts';
import { f } from '../src/sim/cpp.ts';
import { Particle } from '../src/sim/particle.ts';
import { Simulation } from '../src/sim/simulation.ts';
import { CreateBox } from '../src/sim/editing.ts';
import { PT_DUST, PT_QRTZ, PT_SOAP, PT_WATR } from '../src/sim/numbers.ts';

const here = new URL('.', import.meta.url).pathname;
const fixtures = join(here, 'fixtures');
const oracle = join(here, '../../../../re/powdertoy/oracle/powdertoy-oracle');

// ---------------------------------------------------------------- bzip2

function bzip2Sample(): Uint8Array {
  // the input of fixtures/bzip2-sample.txt.bz2 (made by the system bzip2 -9)
  const parts: number[] = [];
  const enc = new TextEncoder();
  for (let i = 0; i < 3000; i++) parts.push(...enc.encode(`The Powder Toy ${i}\n`));
  for (let k = 0; k < 20; k++) for (let b = 0; b < 256; b++) parts.push(b);
  for (let k = 0; k < 5000; k++) parts.push(0);
  return new Uint8Array(parts);
}

function rand(seed: number, n: number, alphabet: number): Uint8Array {
  const out = new Uint8Array(n);
  let s = seed >>> 0;
  for (let i = 0; i < n; i++) {
    s = (Math.imul(s, 1103515245) + 12345) >>> 0;
    out[i] = (s >>> 16) % alphabet;
  }
  return out;
}

test('bzip2: decompresses a stream made by the system bzip2', () => {
  const stream = new Uint8Array(readFileSync(join(fixtures, 'bzip2-sample.txt.bz2')));
  const r = BZ2WDecompress(stream);
  assert.equal(r.status, BZ2WDecompressOk);
  assert.deepEqual(Buffer.from(r.data), Buffer.from(bzip2Sample()));
});

test('bzip2: round trips, across block boundaries and runs', () => {
  const cases = [
    new Uint8Array(0),
    new TextEncoder().encode('a'),
    new TextEncoder().encode('abababababababab'),
    new Uint8Array(1000).fill(7),
    rand(1, 5000, 256),
    rand(2, 300000, 4),
    new Uint8Array(1900000).map((_, i) => (i % 1000 < 600 ? 0 : i & 0xFF)), // > one 900k block, long runs
  ];
  for (const c of cases) {
    const z = BZ2WCompress(c);
    assert.equal(z.status, 0);
    const d = BZ2WDecompress(z.data);
    assert.equal(d.status, BZ2WDecompressOk);
    assert.ok(Buffer.from(d.data).equals(Buffer.from(c)), `round trip of ${c.length} bytes`);
  }
});

test('bzip2: the system bzip2 reads what the port writes', { skip: !hasBzip2() }, () => {
  for (const c of [bzip2Sample(), rand(3, 200000, 16)]) {
    const z = BZ2WCompress(c);
    const back = execFileSync('bzip2', ['-dc'], { input: z.data, maxBuffer: 1 << 26 });
    assert.ok(back.equals(Buffer.from(c)));
    const sys = new Uint8Array(execFileSync('bzip2', ['-c9'], { input: c, maxBuffer: 1 << 26 }));
    assert.ok(Buffer.from(BZ2WDecompress(sys).data).equals(Buffer.from(c)));
  }
});

test('bzip2: the wrapper statuses', () => {
  const z = BZ2WCompress(bzip2Sample()).data;
  assert.equal(BZ2WDecompress(new TextEncoder().encode('OPS1 not bzip2')).status, BZ2WDecompressType);
  assert.equal(BZ2WDecompress(z.subarray(0, z.length - 10)).status, BZ2WDecompressEof);
  const bad = z.slice();
  bad[100] ^= 0x55;
  assert.equal(BZ2WDecompress(bad).status, BZ2WDecompressBad);
  assert.equal(BZ2WDecompress(z, 1000).status, BZ2WDecompressLimit);
  assert.equal(BZ2WDecompress(z, bzip2Sample().length).status, BZ2WDecompressOk);
});

function hasBzip2(): boolean {
  try {
    execFileSync('bzip2', ['--help'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

// ---------------------------------------------------------------- BSON

test('bson: dump and parse, with the OPS nonconformance hints', () => {
  const nc = new Bson(objectValue);
  nc.set('palette', new Bson(arrayValue)).Append(Bson.string('objectEncodedAsArray'));
  const signs = nc.set('signs', new Bson(arrayValue));
  signs.Append(Bson.string('arrayEncodedWithBadKeys'));
  signs.Append(Bson.string('sign'));

  const b = new Bson(objectValue);
  b.set('zeta', Bson.int32(-5));
  b.set('alpha', Bson.double(1.25));
  b.set('big', Bson.int64(-(1n << 40n)));
  b.set('flag', Bson.bool(true));
  b.set('bytes', Bson.user(new Uint8Array([1, 2, 3])));
  b.set('palette', new Bson(objectValue)).set('DEFAULT_PT_DUST', Bson.int32(1));
  const s = b.set('signs', new Bson(arrayValue));
  s.Append(new Bson(objectValue)).set('text', Bson.string('hi'));
  const data = b.Dump(nc);
  // keys in std::map order; palette written as an array (type 4), sign elements keyed "sign"
  const text = Buffer.from(data).toString('latin1');
  assert.ok(text.indexOf('alpha') < text.indexOf('big') && text.indexOf('big') < text.indexOf('zeta'));
  assert.equal(data[text.indexOf('palette') - 1], 4);
  assert.ok(text.includes('\x03sign\x00'));
  const back = Bson.Parse(data, nc);
  assert.ok(back.equals(b));
  assert.equal(back.Get('palette')!.GetType(), objectValue);
  assert.equal(back.Get('big')!.GetType(), int64Value);
  assert.equal(back.Get('zeta')!.GetType(), int32Value);
  // without the hints the palette reads as an array
  assert.equal(Bson.Parse(data).Get('palette')!.GetType(), arrayValue);
  assert.throws(() => Bson.Parse(data.subarray(0, 20)));
});

// ---------------------------------------------------------------- GameSave (OPS) without a simulation

test('OPS: serialise then read back a save with particles, walls, fans, air, signs', () => {
  const save = new GameSave({ X: 20, Y: 12 });
  const add = (type: number, x: number, y: number, set: (p: Particle) => void = () => {}): void => {
    const p = new Particle();
    p.type = type; p.x = x; p.y = y; p.temp = f(295.15);
    set(p);
    save.addParticle(p);
  };
  add(PT_DUST, 3, 4);
  add(PT_DUST, 3, 4, (p) => { p.temp = 2000; p.life = 300; p.tmp = 70000; p.dcolour = 0xFF00FF00; });
  add(PT_WATR, 10, 20, (p) => { p.vx = 1.5; p.vy = -2.25; p.tmp2 = 600; p.tmp3 = -5; p.tmp4 = 100000; p.ctype = 1000000; });
  add(PT_QRTZ, 79, 47, (p) => { p.tmp3 = -300; });
  save.blockMap.set({ X: 1, Y: 1 }, WL_WALL);
  save.blockMap.set({ X: 2, Y: 1 }, WL_FAN);
  save.fanVelX.set({ X: 2, Y: 1 }, 0.5);
  save.fanVelY.set({ X: 2, Y: 1 }, -1);
  save.hasPressure = true;
  save.hasAmbientHeat = true;
  save.aheatEnable = true;
  save.pressure.set({ X: 5, Y: 5 }, 12.5);
  save.velocityX.set({ X: 5, Y: 5 }, -3.25);
  save.ambientHeat.set({ X: 5, Y: 5 }, 400);
  save.addSign({ x: 20, y: 30, ju: 1, text: 'Temp: {t}' });
  save.addSign({ x: 500, y: 30, ju: 1, text: 'outside: not saved' });
  save.authors = { username: 'someone', id: 7 };
  const [fake, data] = save.Serialise();
  assert.equal(fake, false);
  assert.deepEqual([...data.subarray(0, 8)], [0x4F, 0x50, 0x53, 0x31, 100, 4, 20, 12]);

  const back = new GameSave(data);
  assert.deepEqual(back.version, [100, 1]);
  assert.deepEqual(back.blockSize, { X: 20, Y: 12 });
  assert.equal(back.particlesCount, 4);
  const ps = back.particles.slice(0, 4);
  // saved in position order (rows top to bottom), stacked particles in their order
  assert.deepEqual(ps.map((p) => [p.type, p.x, p.y]), [[PT_DUST, 3, 4], [PT_DUST, 3, 4], [PT_WATR, 10, 20], [PT_QRTZ, 79, 47]]);
  assert.equal(ps[0].temp, f(295.15));
  assert.deepEqual([ps[1].temp, ps[1].life, ps[1].tmp, ps[1].dcolour], [2000, 300, 70000, 0xFF00FF00]);
  assert.deepEqual([ps[2].vx, ps[2].vy, ps[2].tmp2, ps[2].tmp3, ps[2].tmp4, ps[2].ctype], [1.5, -2.25, 600, -5, 100000, 1000000]);
  assert.equal(ps[3].tmp3, -300); // PressureInTmp3: 16 bits, sign extended
  assert.equal(back.blockMap.get({ X: 1, Y: 1 }), WL_WALL);
  assert.equal(back.blockMap.get({ X: 2, Y: 1 }), WL_FAN);
  assert.equal(back.fanVelX.get({ X: 2, Y: 1 }), f(f(159 - 127) / 64)); // 0.5 * 64 + 127.5 = 159.5 -> 159
  assert.equal(back.fanVelY.get({ X: 2, Y: 1 }), f(f(63 - 127) / 64));
  assert.equal(back.pressure.get({ X: 5, Y: 5 }), 12.5);
  assert.equal(back.velocityX.get({ X: 5, Y: 5 }), -3.25);
  assert.equal(back.ambientHeat.get({ X: 5, Y: 5 }), 400);
  assert.deepEqual(back.signs, [{ x: 20, y: 30, ju: 1, text: 'Temp: {t}' }]);
  // the palette is a BSON object: read back in key order
  assert.deepEqual(back.palette.map((p) => p[0]), ['DEFAULT_PT_DUST', 'DEFAULT_PT_QRTZ', 'DEFAULT_PT_WATR']);
  assert.deepEqual(back.authors, { id: 7, username: 'someone' });
  assert.equal(back.missingElements.any(), false);
});

test('OPS: unknown palette entries become missing elements', () => {
  const save = new GameSave({ X: 4, Y: 4 });
  const p = new Particle();
  p.type = PT_DUST; p.x = 1; p.y = 1; p.temp = 300;
  save.addParticle(p);
  const saved = sd.elements[PT_DUST].Identifier;
  sd.elements[PT_DUST].Identifier = 'MOD_PT_THING';
  let data: Uint8Array;
  try {
    data = save.Serialise()[1];
  } finally {
    sd.elements[PT_DUST].Identifier = saved;
  }
  const back = new GameSave(data);
  assert.equal(back.particles[0].type, 0);
  assert.deepEqual([...back.missingElements.identifiers], [['MOD_PT_THING', PT_DUST]]);
});

test('OPS: bad data throws ParseException', () => {
  assert.throws(() => new GameSave(new Uint8Array(10)), ParseException);
  assert.throws(() => new GameSave(new TextEncoder().encode('XYZ1 not a save at all')), ParseException);
  const ok = new GameSave({ X: 2, Y: 2 }).Serialise()[1];
  const wrongCell = ok.slice();
  wrongCell[5] = 8;
  assert.throws(() => new GameSave(wrongCell), (e: ParseException) => e.result === 3);
});

test('Transform: mirror and rotate a stamp', () => {
  const save = new GameSave({ X: 3, Y: 2 });
  const p = new Particle();
  p.type = PT_DUST; p.x = 1; p.y = 2; p.vx = 1; p.temp = 300;
  save.addParticle(p);
  save.blockMap.set({ X: 0, Y: 0 }, WL_WALL);
  save.addSign({ x: 2, y: 3, ju: 0, text: 'x' });
  // MirrorX
  save.Transform([-1, 0, 0, 1], { X: 0, Y: 0 });
  assert.deepEqual(save.blockSize, { X: 3, Y: 2 });
  assert.deepEqual([save.particles[0].x, save.particles[0].y, save.particles[0].vx], [10, 2, -1]);
  assert.equal(save.blockMap.get({ X: 2, Y: 0 }), WL_WALL);
  assert.deepEqual([save.signs[0].x, save.signs[0].y], [9, 3]);
  // CCW
  save.Transform([0, 1, -1, 0], { X: 0, Y: 0 });
  assert.deepEqual(save.blockSize, { X: 2, Y: 3 });
  assert.deepEqual([save.particles[0].x, save.particles[0].y], [2, 1]);
  assert.equal(save.blockMap.get({ X: 0, Y: 0 }), WL_WALL);
});

test('signs: the {t}-style texts that need 95.0', () => {
  assert.equal(signNeedsV95('Temp: {t}'), true);
  assert.equal(signNeedsV95('{p}'), true);
  assert.equal(signNeedsV95('plain'), false);
  assert.equal(signNeedsV95('{b|button}'), false);
  assert.equal(signNeedsV95('{x}'), false);
});

// ---------------------------------------------------------------- Simulation::Save / Load, and the oracle

const fbits = new Float32Array(1);
const ubits = new Uint32Array(fbits.buffer);
const hex = (v: number): string => (v >>> 0).toString(16).padStart(8, '0');
const bits = (v: number): number => { fbits[0] = v; return ubits[0]; };

function hashGrid(g: Float32Array[]): number {
  let h = 2166136261;
  for (let y = 0; y < YCELLS; y++) {
    for (let x = 0; x < XCELLS; x++) {
      const u = bits(g[y][x]);
      for (let k = 0; k < 4; k++) {
        h ^= (u >>> (8 * k)) & 0xFF;
        h = Math.imul(h, 16777619) >>> 0;
      }
    }
  }
  return h >>> 0;
}

/** the oracle's command language (re/powdertoy/oracle/harness.cpp), the part these tests use */
function run(text: string, dir: string): string {
  const sim = Simulation.Factory();
  const out: string[] = [];
  const type = (name: string): number => {
    const t = sd.GetParticleType(name);
    if (t < 0) throw new Error('unknown element ' + name);
    return t;
  };
  for (let line of text.split('\n')) {
    const hash = line.indexOf('#');
    if (hash >= 0) line = line.substring(0, hash);
    const a = line.trim().split(/\s+/).filter((s) => s.length);
    if (!a.length) continue;
    const n = (k: number): number => Number(a[k]);
    switch (a[0]) {
    case 'seed': sim.rng.seed(n(1) >>> 0); break;
    case 'aheat': sim.aheat_enable = n(1); break;
    case 'part': sim.create_part(-1, n(1), n(2), type(a[3]), a.length > 4 ? n(4) : -1); break;
    case 'box': CreateBox(sim, -1, n(1), n(2), n(3), n(4), type(a[5]), 0); break;
    case 'wall': sim.bmap[n(2)][n(1)] = n(3); break;
    case 'pv': sim.pv[n(2)][n(1)] = n(3); break;
    case 'hv': sim.hv[n(2)][n(1)] = n(3); break;
    case 'set': {
      const p = sim.parts[n(1)];
      const v = n(3);
      if (a[2] === 'temp' || a[2] === 'vx' || a[2] === 'vy') p[a[2]] = v;
      else if (a[2] === 'dcolour') p.dcolour = v;
      else (p as unknown as Record<string, number>)[a[2]] = Math.trunc(v);
      break;
    }
    case 'sign': {
      const m = /^\s*sign\s+(-?\d+)\s+(-?\d+)\s+(-?\d+)\s+(.*)$/.exec(line)!;
      sim.signs.push({ x: Number(m[1]), y: Number(m[2]), ju: Number(m[3]), text: m[4].trimEnd() });
      break;
    }
    case 'signs':
      for (const s of sim.signs) out.push(`sign ${s.x} ${s.y} ${s.ju} ${s.text}`);
      break;
    case 'save': {
      const save = Save(sim, true, { pos: { X: 0, Y: 0 }, size: { X: XRES, Y: YRES } });
      writeFileSync(join(dir, a[1]), save.Serialise()[1]);
      break;
    }
    case 'load': {
      const save = new GameSave(new Uint8Array(readFileSync(join(dir, a[1]))));
      Load(sim, save, true, { X: 0, Y: 0 });
      break;
    }
    case 'dump':
      out.push(`frame 0 parts ${sim.NUM_PARTS}`);
      for (let i = 0; i < sim.parts.active; i++) {
        const p = sim.parts[i];
        if (!p.type) continue;
        out.push(`p ${i} ${p.type} ${p.life} ${p.ctype} ${hex(bits(p.x))} ${hex(bits(p.y))} ${hex(bits(p.vx))} ${hex(bits(p.vy))} ${hex(bits(p.temp))} ${p.tmp} ${p.tmp2} ${p.tmp3} ${p.tmp4} ${p.flags} ${hex(p.dcolour)}`);
      }
      out.push(`air ${hex(hashGrid(sim.pv))} ${hex(hashGrid(sim.vx))} ${hex(hashGrid(sim.vy))} ${hex(hashGrid(sim.hv))}`);
      break;
    default: throw new Error('unknown command ' + a[0]);
    }
  }
  return out.length ? out.join('\n') + '\n' : '';
}

const scenario = readFileSync(join(here, 'scenarios-save/save.txt'), 'utf8');
const loadScenario = 'load save.ops\ndump\nsigns\n';

test('Simulation::Save then Load gives back the particles, walls, air and signs', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tpt-save-'));
  const before = run(scenario + 'save save.ops\n', dir);
  const after = run(loadScenario, dir);
  // the loaded simulation renumbers the particles in position order; compare as sets of field values, without
  // what the format quantizes (vx, vy to 1/16, temp to whole kelvins, the tmp3 of PressureInTmp3 elements to 16 bits)
  const fields = (s: string): string[] => s.split('\n').filter((l) => l.startsWith('p '))
    .map((l) => { const a = l.split(' '); return [a[2], a[3], a[4], a[5], a[6], a[10], a[11], a[13], a[14], a[15]].join(' '); }).sort();
  assert.deepEqual(fields(after), fields(before));
  assert.deepEqual(after.split('\n').filter((l) => l.startsWith('sign')), before.split('\n').filter((l) => l.startsWith('sign')));
  // pressure (the first hash) survives exactly; ambient heat is saved in whole kelvins
  const pv = (s: string): string => s.split('\n').find((l) => l.startsWith('air'))!.split(' ')[1];
  assert.equal(pv(after), pv(before));
});

test('the port writes the same OPS data as the original (before compression)', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tpt-save-'));
  run(scenario + 'save save.ops\n', dir);
  const mine = new Uint8Array(readFileSync(join(dir, 'save.ops')));
  const theirs = new Uint8Array(readFileSync(join(fixtures, 'oracle-save.ops')));
  assert.deepEqual([...mine.subarray(0, 12)], [...theirs.subarray(0, 12)]);
  const a = BZ2WDecompress(mine.subarray(12)), b = BZ2WDecompress(theirs.subarray(12));
  assert.equal(a.status, BZ2WDecompressOk);
  assert.ok(Buffer.from(a.data).equals(Buffer.from(b.data)));
});

test('a save written by the original loads as in the original', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tpt-save-'));
  writeFileSync(join(dir, 'save.ops'), readFileSync(join(fixtures, 'oracle-save.ops')));
  assert.equal(run(loadScenario, dir), readFileSync(join(fixtures, 'oracle-load.txt'), 'utf8'));
});

test('the original loads a save written by the port as its own', { skip: !existsSync(oracle) }, () => {
  const dir = mkdtempSync(join(tmpdir(), 'tpt-save-'));
  run(scenario + 'save save.ops\n', dir);
  const out = execFileSync(oracle, { input: `load ${join(dir, 'save.ops')}\ndump\nsigns\n` }).toString();
  assert.equal(out, readFileSync(join(fixtures, 'oracle-load.txt'), 'utf8'));
});

test('a save of the port reads back to the same bytes when written again', () => {
  const dir = mkdtempSync(join(tmpdir(), 'tpt-save-'));
  run(scenario + 'save a.ops\n', dir);
  run('load a.ops\nsave b.ops\n', dir);
  const a = new GameSave(new Uint8Array(readFileSync(join(dir, 'a.ops'))));
  const b = new GameSave(new Uint8Array(readFileSync(join(dir, 'b.ops'))));
  assert.equal(a.particlesCount, b.particlesCount);
  assert.ok(a.particlesCount > 0 && a.particlesCount < NPART);
  // SOAP is not in the scenario; the links code runs with none
  assert.equal(a.particles.filter((p) => p.type === PT_SOAP).length, 0);
});
