// The port's side of the physics oracle: runs a level with the given seed and mouse forces and writes
// the same dump as re/enigma/oracle/dump.cc.inc (OracleDump) after every 10 ms pass.
import { files } from './harness.ts';
import { initEngine } from '../src/engine/index.ts';
import { LevelSession, GameLoop } from '../src/engine/level.ts';
import { rng, world, display } from '../src/engine/core.ts';
import { textSource } from '../src/engine/objects/stones1.ts';
import { fmtG } from '../src/lua/interp.ts';

initEngine(files);
const libs = files.pack('lib');
const libSource = { get: (path: string, release: number) => libs[`${path}_${release}.xml`] ?? libs[`${path}.xml`] ?? null };

const debugGrid = process.env.ENIGMA_DUMP_GRID === '1'; // adds "D old -> new" lines for changed cells
let lastCells: string[] = [];
function dump(out: string[]) {
  for (const a of world.actorlist) {
    const ai = a.ai;
    out.push(`A ${a.getKind()} ${fmtG(ai.pos.x, 17)} ${fmtG(ai.pos.y, 17)} ${fmtG(ai.vel.x, 17)} ${fmtG(ai.vel.y, 17)} ${a.getAttr('state') as number | 0}`);
  }
  let h = 2166136261;
  const fnv = (s: string) => { for (let i = 0; i < s.length; i++) h = Math.imul(h ^ (s.charCodeAt(i) & 255), 16777619) >>> 0; };
  for (let y = 0; y < world.h; y++) for (let x = 0; x < world.w; x++) {
    const f = world.fields[y * world.w + x];
    let s = `${x},${y},`;
    if (f.floor) s += f.floor.getKind();
    s += ',';
    if (f.item) s += `${f.item.getKind()}:${Number(f.item.getAttr('state')) | 0}`;
    s += ',';
    if (f.stone) s += `${f.stone.getKind()}:${Number(f.stone.getAttr('state')) | 0}`;
    s += ';';
    fnv(s);
    if (debugGrid) {
      const i = y * world.w + x;
      if (lastCells[i] !== undefined && lastCells[i] !== s) out.push(`D ${lastCells[i]} -> ${s}`);
      lastCells[i] = s;
    }
  }
  out.push(`G ${h.toString(16).padStart(8, '0')}`);
}

/** runs a level file (path in the shipped packs) and returns the dump lines */
export function runPort(packDir: string, file: string, seed: number, forces: [number, number][]): string[] {
  const xml = files.pack(packDir)[file];
  rng.level = seed;
  const s = new LevelSession(xml, libSource, true);
  textSource.get = (k) => s.localized(k);
  s.load(false);
  const loop = new GameLoop(s);
  loop.start();
  lastCells = [];
  const out: string[] = ['T -1'];
  dump(out);
  forces.forEach(([fx, fy], t) => {
    if (fx !== 0 || fy !== 0) { world.mouseForce.x += fx; world.mouseForce.y += fy; }
    loop.tick(0.01);
    out.push(`T ${t}`);
    dump(out);
  });
  void display;
  return out;
}
