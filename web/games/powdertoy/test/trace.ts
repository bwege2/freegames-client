// The scenario interpreter of re/powdertoy/oracle/harness.cpp, run against the port: same commands, same dump
// format (floats as the hex of their binary32 bits, FNV-1a hashes of the air maps), so its output can be compared
// line for line with the oracle's golden dumps (test/golden/).
import { sd } from '../src/sim/simulationData.ts';
import { NPART, XCELLS, YCELLS } from '../src/sim/config.ts';
import { f } from '../src/sim/cpp.ts';
import { Simulation } from '../src/sim/simulation.ts';
import { CreateBox } from '../src/sim/editing.ts';

const f32 = new Float32Array(1);
const u32 = new Uint32Array(f32.buffer);

function bits(v: number): number {
  f32[0] = v;
  return u32[0];
}

function hex(v: number): string {
  return (v >>> 0).toString(16).padStart(8, '0');
}

function hashGrid(g: Float32Array[]): number {
  let h = 2166136261;
  for (let y = 0; y < YCELLS; y++) {
    const row = new Uint32Array(g[y].buffer, g[y].byteOffset, XCELLS);
    for (let x = 0; x < XCELLS; x++) {
      const u = row[x];
      for (let k = 0; k < 4; k++) {
        h ^= (u >>> (8 * k)) & 0xFF;
        h = Math.imul(h, 16777619) >>> 0;
      }
    }
  }
  return h >>> 0;
}

/** std::istream >> int: leading sign and digits */
function int(s: string | undefined): number {
  if (s === undefined) throw new Error('missing argument');
  const m = /^[+-]?\d+/.exec(s);
  if (!m) throw new Error('bad integer ' + s);
  return Number(m[0]) | 0;
}

function num(s: string | undefined): number {
  if (s === undefined) throw new Error('missing argument');
  const v = Number(s);
  if (Number.isNaN(v)) throw new Error('bad number ' + s);
  return v;
}

/** Runs a scenario (the oracle's command language) and returns what the oracle prints for it. */
export function runScenario(text: string): string {
  const sim = Simulation.Factory();
  const out: string[] = [];
  let frame = 0;
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
    const cmd = a[0];
    if (cmd === 'seed') sim.rng.seed(num(a[1]) >>> 0);
    else if (cmd === 'aheat') sim.aheat_enable = int(a[1]);
    else if (cmd === 'legacy') sim.legacy_enable = int(a[1]);
    else if (cmd === 'water') sim.water_equal_test = int(a[1]);
    else if (cmd === 'gravmode') sim.gravityMode = int(a[1]);
    else if (cmd === 'airmode') sim.air.airMode = int(a[1]);
    else if (cmd === 'edge') sim.SetEdgeMode(int(a[1]));
    else if (cmd === 'part') {
      const v = a.length > 4 ? int(a[4]) : -1;
      sim.create_part(-1, int(a[1]), int(a[2]), type(a[3]), v);
    } else if (cmd === 'box') CreateBox(sim, -1, int(a[1]), int(a[2]), int(a[3]), int(a[4]), type(a[5]), 0);
    else if (cmd === 'line') sim.CreateLine(int(a[1]), int(a[2]), int(a[3]), int(a[4]), type(a[5]));
    else if (cmd === 'wall') sim.bmap[int(a[2])][int(a[1])] = int(a[3]);
    else if (cmd === 'pv') sim.pv[int(a[2])][int(a[1])] = f(num(a[3]));
    else if (cmd === 'hv') sim.hv[int(a[2])][int(a[1])] = f(num(a[3]));
    else if (cmd === 'set') {
      const p = sim.parts[int(a[1])];
      const fld = a[2];
      const v = num(a[3]);
      if (fld === 'life') p.life = Math.trunc(v);
      else if (fld === 'ctype') p.ctype = Math.trunc(v);
      else if (fld === 'tmp') p.tmp = Math.trunc(v);
      else if (fld === 'tmp2') p.tmp2 = Math.trunc(v);
      else if (fld === 'tmp3') p.tmp3 = Math.trunc(v);
      else if (fld === 'tmp4') p.tmp4 = Math.trunc(v);
      else if (fld === 'temp') p.temp = v;
      else if (fld === 'vx') p.vx = v;
      else if (fld === 'vy') p.vy = v;
      else if (fld === 'dcolour') p.dcolour = Math.trunc(v);
      else throw new Error('unknown field ' + fld);
    } else if (cmd === 'run') {
      const n = int(a[1]);
      for (let k = 0; k < n; k++) {
        // GameModel::UpdateUpTo(NPART) from the start of a frame
        sim.BeforeSim(true);
        sim.UpdateParticles(0, NPART);
        sim.AfterSim();
        frame++;
      }
    } else if (cmd === 'dump') {
      out.push(`frame ${frame} parts ${sim.NUM_PARTS}`);
      for (let i = 0; i < sim.parts.active; i++) {
        const p = sim.parts[i];
        if (!p.type) continue;
        out.push(`p ${i} ${p.type} ${p.life} ${p.ctype} ${hex(bits(p.x))} ${hex(bits(p.y))} ${hex(bits(p.vx))} ${hex(bits(p.vy))} ${hex(bits(p.temp))} ${p.tmp} ${p.tmp2} ${p.tmp3} ${p.tmp4} ${p.flags} ${hex(p.dcolour)}`);
      }
      out.push(`air ${hex(hashGrid(sim.pv))} ${hex(hashGrid(sim.vx))} ${hex(hashGrid(sim.vy))} ${hex(hashGrid(sim.hv))}`);
    } else {
      throw new Error('unknown command ' + cmd);
    }
  }
  return out.length ? out.join('\n') + '\n' : '';
}

// node test/trace.ts < scenario: prints the dump like the oracle
if (import.meta.url === `file://${process.argv[1]}`) {
  const chunks: Buffer[] = [];
  process.stdin.on('data', (c: Buffer) => chunks.push(c));
  process.stdin.on('end', () => process.stdout.write(runScenario(Buffer.concat(chunks).toString('utf8'))));
}
