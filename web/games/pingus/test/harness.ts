// Runs the port headless the way re/pingus/oracle/oracle.cpp runs the original: a level with the events of a
// demo file, Server::update() then every event of that tick (DemoSession::update_demo), one line of state per
// tick in the oracle's format.
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { type DataSource, setDataSource } from '../src/res.ts';
import { decodeImage, type Surface } from '../src/surface.ts';
import { PingusLevel, Server, type ServerEvent } from '../src/world.ts';

/** data/ from directories, the first that has a file wins (the shipped assets, then the test's own) */
export class DirSource implements DataSource {
  private roots: string[];
  private images = new Map<string, Surface | null>();
  constructor(roots: string[]) { this.roots = roots; }
  private find(path: string): string | null {
    for (const r of this.roots) { const p = join(r, path); if (existsSync(p) && statSync(p).isFile()) return p; }
    return null;
  }
  text(path: string) { const p = this.find(path); return p ? readFileSync(p, 'utf-8') : null; }
  image(path: string) {
    if (!this.images.has(path)) {
      const p = this.find(path);
      this.images.set(path, p ? decodeImage(p, new Uint8Array(readFileSync(p))) : null);
    }
    return this.images.get(path)!;
  }
  exists(path: string) { return this.find(path) !== null; }
  bytes(path: string) { const p = this.find(path); return p ? new Uint8Array(readFileSync(p)) : null; }
  list(dir: string) {
    const out = new Set<string>();
    const walk = (root: string, d: string) => {
      const full = join(root, d);
      if (!existsSync(full)) return;
      for (const f of readdirSync(full)) {
        const rel = `${d}/${f}`;
        if (statSync(join(root, rel)).isDirectory()) walk(root, rel); else out.add(rel);
      }
    };
    for (const r of this.roots) walk(r, dir.replace(/\/$/, ''));
    return [...out].sort();
  }
}

const hex = (v: number) => {
  const b = new DataView(new ArrayBuffer(4));
  b.setFloat32(0, v);
  return b.getUint32(0).toString(16).padStart(8, '0');
};

function fnv(data: Uint8Array): string {
  let h = 2166136261;
  for (let i = 0; i < data.length; i++) h = Math.imul(h ^ data[i], 16777619) >>> 0;
  return h.toString(16).padStart(8, '0');
}

/** plays a level as the oracle does; calls `line` with each tick's state line, returns the end line */
export function runDemo(source: DataSource, levelText: string, events: ServerEvent[], maxTicks: number,
  line: (l: string) => void): string {
  setDataSource(source);
  const plf = PingusLevel.parse('', levelText);
  const server = new Server(plf, false);
  const world = server.world;
  const queue = [...events];
  let serial = -1, h = '00000000';
  while (!server.isFinished() && server.time < maxTicks) {
    server.update();
    while (queue.length && queue[0].time === server.time) server.send(queue.shift()!);
    const ph = world.pingus;
    if (world.colmap.serial !== serial) { serial = world.colmap.serial; h = fnv(world.colmap.data); }
    let l = `T ${server.time} ${ph.released} ${ph.alive} ${ph.exited} ${ph.killed} ${h} |`;
    for (const p of ph.pingus) {
      l += ` ${p.id} ${p.actionName} ${p.direction} ${hex(p.x)} ${hex(p.y)} ${hex(p.velocity.x)} ${hex(p.velocity.y)}`;
    }
    line(l);
  }
  const ah = server.actionHolder;
  let end = `E ${server.time} ${world.pingus.exited} ${world.pingus.killed}`;
  for (const a of ah.availableActions()) end += ` ${a}:${ah.getAvailable(a)}:${ah.getUsed(a)}`;
  return end;
}
