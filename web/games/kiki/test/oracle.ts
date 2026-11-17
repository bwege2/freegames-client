// The port's side of the oracle comparison (re/kiki/oracle/): scripts in the oracle's language (a level
// as the original's scripts build it, then key presses and frames), and the same script run on the
// port's engine, printing the same state the oracle prints.
import { KikiController } from '../src/engine/controller.ts';
import { KikiPos, KQuaternion, KVector } from '../src/engine/math.ts';
import {
  ACTION_KEYS, KikiBomb, KikiBot, KikiFace, KikiGate, KikiGear, KikiGenerator, KikiLight, KikiMotorCylinder,
  KikiMotorGear, KikiMutant, KikiObject, KikiPlayer, KikiSpikes, KikiStone, KikiSwitch, KikiTmpObject,
  KikiBotFume, KikiValve, KikiWall, KikiWire, KikiWireStone,
} from '../src/engine/objects.ts';
import { resetColors } from '../src/engine/colors.ts';
import type { KikiSound } from '../src/engine/sound.ts';
import { Headless, seeded } from './harness.ts';
import type { Made } from '../src/pyworld.ts';

// ............................................................................ building the scripts
function rotations(m: Made): string {
  if ('name' in m) {
    const R: Record<string, string> = {
      rot0: '', rotz180: 'rot 180 0 0 1', rotz90: 'rot 90 0 0 1', roty270: 'rot 270 0 1 0', roty180: 'rot 180 0 1 0',
      roty90: 'rot 90 0 1 0', roty0: 'rot 0 0 1 0', rotx180: 'rot 180 1 0 0', rotx90: 'rot 90 1 0 0' };
    return R[m.name];
  }
  if ('mul' in m) return m.mul.map(rotations).filter((s) => s).join(' ');
  if ('angle' in m) return `rot ${m.angle} ${m.axis.join(' ')}`;
  return '';
}

/** the level, built by the port's translated script, as oracle commands (Python callbacks left out) */
export function levelScript(name: string, speed = 7): string[] {
  const h = new Headless({ random: seeded(7) });
  h.game.recording = [];
  h.level(name);
  const ops = h.game.recording as unknown[][];
  const out: string[] = [`speed ${speed}`];
  const objectsById = new Map<number, KikiObject>();
  for (const [o, id] of (h.game as unknown as { ids: Map<KikiObject, number> }).ids) objectsById.set(id, o);
  let playerId = -1;
  for (const op of ops) {
    const [kind, ...r] = op as [string, ...unknown[]];
    switch (kind) {
      case 'size': out.push(`size ${(r[0] as number[]).join(' ')}`); break;
      case 'new': {
        const [id, cls, args] = r as [number, string, unknown[]];
        if (cls === 'KikiPlayer') { playerId = id; out.push(`player ${id}`); break; }
        let a: string[];
        if (cls === 'KikiStone' && args.length) {
          const c = args[0] as { color: number[] } | null;
          a = [c && typeof c === 'object' ? c.color.join(' ') : '-', args[1] ? '1' : '0'];
        } else {
          a = args.map((x) => (typeof x === 'boolean' ? (x ? '1' : '0') : String(x)));
        }
        out.push(`new ${id} ${cls}${a.length ? ' ' + a.join(' ') : ''}`);
        break;
      }
      case 'name': out.push(`name ${r[0]} ${r[1]}`); break;
      case 'add': out.push(`add ${r[0]} ${(r[1] as number[]).join(' ')}`); break;
      case 'remove': out.push(`remove ${r[0]}`); break;
      case 'delete': out.push(`delete ${r[0]}`); break;
      case 'setActive': out.push(`active ${r[0]} ${r[1] ? 1 : 0}`); break;
      case 'orientation': out.push(`orient ${r[0]} ${rotations(r[1] as Made)}`.trimEnd()); break;
      case 'random': {
        const o = objectsById.get(r[0] as number)!;
        const p = KikiPos.fromVector(o.position);
        out.push(`add ${r[0]} ${p.x} ${p.y} ${p.z}`);
        break;
      }
      default: break; // scheme, hook, toggle, activate, camera: Python's side
    }
  }
  void playerId;
  out.push('init');
  return out;
}

const KEYS = ['UP', 'DOWN', 'LEFT', 'RIGHT', 'CTRL', 'SHIFT', 'SPACE', 'HOME', 'END'];

/** a deterministic session of key presses and releases with uneven frame times, dumping every ~250 ms */
export function session(seed: number, seconds: number): string[] {
  const rnd = seeded(seed);
  const out: string[] = ['dump'];
  const held = new Set<string>();
  let t = 0;
  let sinceDump = 0;
  while (t < seconds * 1000) {
    const r = rnd();
    if (r < 0.35) {
      const k = KEYS[Math.floor(rnd() * KEYS.length)];
      if (held.has(k)) { out.push(`release ${k}`); held.delete(k); } else { out.push(`key ${k}`); held.add(k); }
    }
    const dt = 7 + Math.floor(rnd() * 17);
    const ms = dt * (1 + Math.floor(rnd() * 12));
    out.push(`run ${ms} ${dt}`);
    t += ms;
    sinceDump += ms;
    if (sinceDump >= 250) { out.push('dump'); sinceDump = 0; }
  }
  for (const k of held) out.push(`release ${k}`);
  out.push('run 2000 10', 'dump');
  return out;
}

// ............................................................................ running them on the port
const fmt = (v: number): string => (Math.abs(v) < 0.0005 ? 0 : v).toFixed(3);
const vec = (v: KVector): string => `${fmt(v.x)} ${fmt(v.y)} ${fmt(v.z)}`;

class ScriptSound implements KikiSound {
  log = '';
  playSound(id: number): void { this.log += ` ${id}`; }
  playSoundAtPos(id: number): void { this.log += ` ${id}@`; }
  setMute(): void {}
  isMute(): boolean { return false; }
  setSoundVolume(): void {}
  getSoundVolume(): number { return 50; }
}

export function runPort(script: string[]): string {
  resetColors();
  KikiPlayer.keys = new Map(ACTION_KEYS);
  const sound = new ScriptSound();
  const C = new KikiController(sound);
  C.frame_time = C.last_time = 1000;
  C.onDisplayText = (t) => { sound.log += ` text:${t}`; };
  C.init();
  const objects = new Map<number, KikiObject>();
  const out: string[] = [];
  const make = (cls: string, a: string[]): KikiObject => {
    const n = (i: number, d: number): number => (a[i] === undefined ? d : Number(a[i]));
    switch (cls) {
      case 'KikiWall': return new KikiWall();
      case 'KikiStone': {
        if (!a.length) return new KikiStone();
        if (a[0] === '-') return new KikiStone(null, a[1] === '1');
        return new KikiStone([n(0, 1), n(1, 1), n(2, 1), n(3, 1)], a[4] === '1');
      }
      case 'KikiWireStone': return new KikiWireStone();
      case 'KikiBomb': return new KikiBomb();
      case 'KikiSwitch': return new KikiSwitch(n(0, 0) !== 0);
      case 'KikiGate': return new KikiGate(n(0, 0) !== 0);
      case 'KikiLight': return new KikiLight();
      case 'KikiMutant': return new KikiMutant();
      case 'KikiWire': return new KikiWire(n(0, KikiFace.PZ), n(1, 15));
      case 'KikiGear': return new KikiGear(n(0, KikiFace.PZ));
      case 'KikiValve': return new KikiValve(n(0, KikiFace.PZ));
      case 'KikiGenerator': return new KikiGenerator(n(0, KikiFace.PZ));
      case 'KikiMotorGear': return new KikiMotorGear(n(0, KikiFace.PZ));
      case 'KikiMotorCylinder': return new KikiMotorCylinder(n(0, KikiFace.PZ));
      case 'KikiSpikes': return new KikiSpikes(n(0, KikiFace.PZ));
    }
    throw new Error(`unknown class ${cls}`);
  };
  const dump = (): void => {
    out.push(`t ${C.frame_time}${sound.log}`);
    sound.log = '';
    for (const o of C.world.objects) {
      if (o instanceof KikiTmpObject || o instanceof KikiBotFume) continue;
      let line = `${o.getClassName()} ${vec(o.position)} | ${vec(o.current_position)}`;
      if (o instanceof KikiBot) {
        const q = o.current_orientation;
        line += ` | q ${fmt(q.w)} ${fmt(q.x)} ${fmt(q.y)} ${fmt(q.z)} | ${o.move_action ? o.move_action.getName() : '-'} | dir ${Math.trunc(o.dir_sgn)}`;
        line += o === C.player ? ` | moves ${o.getStatus().getMoves()}` : ` | health ${o.getStatus().getHealth().toFixed(2)}`;
      } else if (o instanceof KikiSwitch) line += ` | active ${o.isActive() ? 1 : 0}`;
      else if (o instanceof KikiValve) line += ` | active ${o.isActive() ? 1 : 0}`;
      else if (o instanceof KikiWire) line += ` | active ${o.active ? 1 : 0}`;
      out.push(line);
    }
  };
  for (const raw of script) {
    const [cmd, ...a] = raw.trim().split(/\s+/);
    if (!cmd || cmd.startsWith('#')) continue;
    switch (cmd) {
      case 'speed': C.setSpeed(Number(a[0])); break;
      case 'size': C.world.setSize(Number(a[0]), Number(a[1]), Number(a[2])); objects.clear(); break;
      case 'new': objects.set(Number(a[0]), make(a[1], a.slice(2))); break;
      case 'player': objects.set(Number(a[0]), C.player); break;
      case 'name': objects.get(Number(a[0]))!.setName(raw.trim().split(/\s+/).slice(2).join(' ')); break;
      case 'add': C.world.addObjectAtPos(objects.get(Number(a[0]))!, new KikiPos(Number(a[1]), Number(a[2]), Number(a[3]))); break;
      case 'remove': C.world.removeObject(objects.get(Number(a[0]))!); break;
      case 'delete': C.world.deleteObject(objects.get(Number(a[0]))!); break;
      case 'active': {
        const o = objects.get(Number(a[0]))!;
        const on = a[1] === '1';
        if (o instanceof KikiSwitch || o instanceof KikiGear || o instanceof KikiWire) o.setActive(on);
        void KikiGenerator; void KikiGate;
        break;
      }
      case 'orient': {
        let q = new KQuaternion();
        for (let i = 1; i + 4 < a.length + 1; i += 5) {
          q = q.mul(KQuaternion.rotationAroundVector(Number(a[i + 1]), new KVector(Number(a[i + 2]), Number(a[i + 3]), Number(a[i + 4]))));
        }
        objects.get(Number(a[0]))!.setOrientation(q);
        break;
      }
      case 'init': C.world.init(); break;
      case 'key': case 'release':
        C.handleKeyboardEvent({ name: a[0], character: 0 }, cmd === 'key');
        break;
      case 'run': {
        const ms = Number(a[0]);
        const dt = Number(a[1]);
        for (let t = 0; t < ms; t += dt) C.step(C.frame_time + dt);
        break;
      }
      case 'dump': dump(); break;
      default: throw new Error(`unknown command ${cmd}`);
    }
  }
  return out.join('\n') + '\n';
}

/** the scenarios compared with the oracle: level and seed of the key session */
export const SCENARIOS: [string, number, number, number?][] = [
  ['start', 1, 30], ['steps', 2, 30], ['move', 3, 40], ['electro', 4, 40], ['elevate', 5, 40], ['throw', 6, 30],
  ['gold', 7, 30], ['jump', 8, 30], ['escape', 9, 30], ['gears', 10, 40], ['switch', 11, 40], ['bombs', 12, 40],
  ['energy', 13, 30], ['mutants', 14, 40], ['plate', 15, 30], ['bridge', 16, 30], ['maze', 17, 30], ['slick', 18, 30],
  ['flower', 19, 30], ['regal', 20, 40], ['conductor', 21, 30], ['circuit', 22, 30], ['evil', 23, 30], ['borg', 24, 20],
  // other game speeds (the setup's speed, keys 1-9): every duration scales with it
  ['bombs', 25, 30, 3], ['gears', 26, 30, 10], ['mutants', 27, 30, 1],
];

export function scenarioScript(level: string, seed: number, seconds: number, speed = 7): string {
  return [`# ${level}, key session ${seed}, ${seconds} s, speed ${speed}`, ...levelScript(level, speed), ...session(seed, seconds)].join('\n') + '\n';
}

/** the scenario's name in the golden file */
export const scenarioName = (level: string, seed: number): string => `${level}#${seed}`;

// ............................................................................ golden file helpers
export function fnv(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619) >>> 0;
  return h;
}

export type Delta = { n: number; c: [number, string][] };

/** the dumps of a run, each as the lines that changed since the dump before */
export function deltaDumps(text: string): Delta[] {
  const dumps: string[][] = [];
  for (const line of text.split('\n')) {
    if (line.startsWith('t ')) dumps.push([line]);
    else if (line && dumps.length) dumps[dumps.length - 1].push(line);
  }
  let prev: string[] = [];
  return dumps.map((d) => {
    const c: [number, string][] = [];
    d.forEach((l, i) => { if (prev[i] !== l) c.push([i, l]); });
    prev = d;
    return { n: d.length, c };
  });
}

export function undelta(deltas: Delta[]): string[][] {
  let prev: string[] = [];
  return deltas.map((d) => {
    const cur = prev.slice(0, d.n);
    for (const [i, l] of d.c) cur[i] = l;
    prev = cur;
    return cur;
  });
}

/** the same line, numbers within 0.01 (the original computes in floats, the port in doubles) */
export function same(x: string | undefined, y: string | undefined): boolean {
  if (x === y) return true;
  if (x === undefined || y === undefined) return false;
  const p = x.split(' ');
  const q = y.split(' ');
  if (p.length !== q.length) return false;
  const num = /^-?\d+\.\d+$/;
  return p.every((t, i) => t === q[i] || (num.test(t) && num.test(q[i]) && Math.abs(Number(t) - Number(q[i])) <= 0.01));
}
