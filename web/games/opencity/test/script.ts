// Runs an oracle script (re/opencity/oracle/scripts/*.txt; the commands are described at the top of
// re/opencity/oracle/harness.cpp) on the port's game logic and prints the same transcript as the oracle.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { City, OpenCity, rciDelay } from '../src/city.ts';
import { TOOL_NAMES } from '../src/codes.ts';
import { PropertyManager } from '../src/structure.ts';

export const ASSETS = join(import.meta.dirname, '..', 'assets');

export function loadProperties(): PropertyManager {
  const graphism = readFileSync(join(ASSETS, 'config', 'graphism.conf'), 'latin1');
  return new PropertyManager(graphism, (path) => {
    try { return readFileSync(join(ASSETS, path), 'latin1'); } catch { return null; }
  });
}

const hex = (v: number): string => {
  const b = new Uint32Array(new Float32Array([v]).buffer)[0];
  return b.toString(16).padStart(8, '0');
};

export function dump(game: OpenCity): string {
  const s: City = game.city;
  const sim = s.sim;
  const out: string[] = [];
  out.push(`date ${s.day}/${s.month}/${s.year} fund ${s.fund} pop ${s.population} income ${s.income}`);
  out.push(`sim r ${sim.value(0)} c ${sim.value(1)} i ${sim.value(2)} e ${sim.value(3)} t ${sim.value(4)} emax ${sim.maxValue(3)} structures ${s.layer.structureCount()}`);
  const W = s.width;
  const cells = s.layer.cells;
  for (let i = 0; i < cells.length; i++) {
    const p = cells[i];
    if (p === null) continue;
    let line = `${i % W},${Math.floor(i / W)} ${p.code} ${p.gc} ${p.type} ${p.status} ${p.level}`;
    if (p.main !== null) {
      const j = cells.indexOf(p.main);
      if (j >= 0) line += ` main ${j % W},${Math.floor(j / W)}`;
    }
    if (p.code === 20 || p.code === 31) line += ` n ${p.neighbours} t ${p.traffic}`;
    out.push(line);
  }
  out.push(`vehicles ${game.moves.count}`);
  game.moves.slots.forEach((v, i) => {
    if (v !== null) out.push(`v${i} ${v.gc} ${hex(v.w)} ${hex(v.l)} ${hex(v.h)}`);
  });
  out.push('end');
  return out.join('\n') + '\n';
}

function printMap(a: ArrayLike<number>, w: number, h: number): string {
  const rows: string[] = [];
  for (let y = 0; y < h; y++) rows.push(Array.from({ length: w }, (_, x) => a[y * w + x]).join(' '));
  return rows.join('\n') + '\nend\n';
}

/** files the script saves: name → bytes (shared between save and load) */
export function runScript(script: string, pm = loadProperties(), files = new Map<string, Uint8Array>()): string {
  const game = new OpenCity(pm);
  let maker: { heights: Int32Array; trees: Int32Array } | null = null;
  let out = '';
  for (const raw of script.split('\n')) {
    const [cmd, ...a] = raw.trim().split(/\s+/);
    if (!cmd || cmd.startsWith('#')) continue;
    const n = a.map(Number);
    switch (cmd) {
      case 'new': {
        game.newCity(n[0] >>> 0, n[1] >>> 0);
        maker = { heights: game.lastMaker!.getMap(), trees: game.lastMaker!.getTreeDensity() };
        break;
      }
      case 'tool': {
        const t = TOOL_NAMES.indexOf(a[0]);
        if (t < 0) throw new Error(`unknown tool ${a[0]}`);
        if (a[0] !== 'QUERY') game.city.doTool(t, n[1], n[2], n[3], n[4]);
        break;
      }
      case 'run': game.runMs(n[0]); break;
      case 'pause': game.setPaused(true); break;
      case 'play': game.setPaused(false); break;
      case 'save': files.set(a[0], game.city.save()); out += 'save 1\n'; break;
      case 'load': {
        const b = files.get(a[0]);
        out += `load ${b && game.city.load(b) ? 1 : 0}\n`;
        break;
      }
      case 'dump': out += dump(game); break;
      case 'heights': out += printMap(maker!.heights, 51, 51); break;
      case 'trees': out += printMap(maker!.trees, 50, 50); break;
      case 'delays': {
        const vals: string[] = [];
        let line = '';
        for (let k = 0; k <= 2500; k++) {
          line += String(rciDelay(game.delayMax, k)) + (k % 20 === 19 ? '\n' : ' ');
          if (k % 20 === 19) { vals.push(line); line = ''; }
        }
        out += vals.join('') + line + '\nend\n';
        break;
      }
      default: throw new Error(`unknown command ${cmd}`);
    }
  }
  return out;
}
