// Runs the port headless as the oracle ran the original (re/moria/oracle/drive.py): the same command
// line, the keys typed one at a time when the program reads one, the clock at the same second (UTC),
// the login name "player", the data files of the installation, an empty scores.dat at the start and
// the files of the session's earlier runs. Every time the program reads a key, the screen (24 rows),
// the cursor, the random generator's state and the bells since the screen before are recorded, as the
// oracle's recording curses does; the run ends when the keys are used up.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { gunzipSync } from 'node:zlib';
import type { Window } from '../src/curses.ts';
import { main, stdout } from '../src/main.ts';
import type { FileSystem, Platform, Tm } from '../src/platform.ts';
import { setPlatform } from '../src/platform.ts';
import { getRandomSeed } from '../src/rng.ts';
import { LocalScoreFile } from '../src/scorefile.ts';

const DATA = join(import.meta.dirname, '..', 'assets', 'data');

/** One screen: kind (F: a key is read, E: the keys are used up, X: endwin), key index, seed, cursor, bells, rows. */
export interface Screen {
  kind: string;
  key: number;
  seed: number;
  y: number;
  x: number;
  bells: number;
  rows: string[];
}

/** A screen of a golden: the rows that changed since the screen before. */
export type GoldenFrame = [string, number, number, number, number, number, Record<string, string>];

export interface GoldenRun {
  args: string[];
  keys: string;
  status: number;
  stdout: string;
  frames: GoldenFrame[];
  /** the files after the run, base64 */
  files: Record<string, string>;
}

export interface Golden {
  name: string;
  time: number;
  login: string;
  runs: GoldenRun[];
}

export function loadGolden(path: string): Golden {
  const raw = readFileSync(path);
  const text = path.endsWith('.gz') ? gunzipSync(raw).toString('latin1') : raw.toString('latin1');
  return JSON.parse(text) as Golden;
}

/** The golden's screens of a run, whole. */
export function expandFrames(frames: GoldenFrame[]): Screen[] {
  let rows = new Array<string>(24).fill('');
  return frames.map(([kind, key, seed, y, x, bells, changed]) => {
    rows = rows.slice();
    for (const [r, t] of Object.entries(changed)) rows[Number(r)] = t;
    return { kind, key, seed, y, x, bells, rows };
  });
}

class EndOfKeys extends Error {}

export class MemoryFiles implements FileSystem {
  readonly files: Map<string, Uint8Array>;

  constructor(files: Map<string, Uint8Array>) {
    this.files = files;
  }

  read(name: string): Uint8Array | null {
    return this.files.get(name)?.slice() ?? null;
  }

  write(name: string, data: Uint8Array): boolean {
    this.files.set(name, data.slice());
    return true;
  }

  remove(name: string): boolean {
    return this.files.delete(name);
  }

  exists(name: string): boolean {
    return this.files.has(name);
  }
}

export class TestPlatform implements Platform {
  readonly screens: Screen[] = [];
  readonly files: MemoryFiles;
  readonly scores = new LocalScoreFile();
  private readonly keys: string;
  private pos = 0;
  private bells = 0;
  private readonly now: number;
  private readonly name: string;

  constructor(keys: string, files: Map<string, Uint8Array>, now: number, login: string) {
    this.keys = keys;
    this.files = new MemoryFiles(files);
    this.now = now;
    this.name = login;
  }

  private record(kind: string, w: Window): void {
    const rows: string[] = [];
    for (let y = 0; y < 24; y++) rows.push(w.row(y).replace(/ +$/, ''));
    this.screens.push({ kind, key: this.pos, seed: getRandomSeed(), y: w.cury, x: w.curx, bells: this.bells, rows });
    this.bells = 0;
  }

  async getch(screen: Window): Promise<number> {
    this.record('F', screen);
    if (this.pos >= this.keys.length) {
      this.record('E', screen);
      throw new EndOfKeys('keys used up');
    }
    return this.keys.charCodeAt(this.pos++) & 0xff;
  }

  keyWaiting(): boolean {
    return false;
  }

  async refresh(): Promise<void> {}

  endwin(screen: Window): void {
    this.record('X', screen);
  }

  bell(): void {
    this.bells++;
  }

  time(): number {
    return this.now;
  }

  localtime(t: number): Tm {
    const d = new Date(t * 1000);
    return {
      tm_sec: d.getUTCSeconds(), tm_min: d.getUTCMinutes(), tm_hour: d.getUTCHours(), tm_mday: d.getUTCDate(),
      tm_mon: d.getUTCMonth(), tm_year: d.getUTCFullYear() - 1900, tm_wday: d.getUTCDay(),
    };
  }

  login(): string {
    return this.name;
  }

  data(path: string): string | null {
    const m = /^data\/([a-z_]+\.txt)$/.exec(path);
    if (!m) return null;
    try {
      return readFileSync(join(DATA, m[1]), 'latin1');
    } catch {
      return null;
    }
  }
}

export interface RunResult {
  status: number | 'keys used up';
  screens: Screen[];
  files: Map<string, Uint8Array>;
  /** what the program printed on its standard output */
  stdout: string;
}

/** Runs one program run: args, keys, the files it starts with. */
export async function runOnce(args: string[], keys: string, files: Map<string, Uint8Array>, now: number, login: string): Promise<RunResult> {
  const start = new Map(files);
  if (!start.has('scores.dat')) start.set('scores.dat', new Uint8Array(0));
  const p = new TestPlatform(keys, start, now, login);
  setPlatform(p);
  let status: RunResult['status'];
  try {
    status = (await main(args)) & 0xff; // the exit status a process leaves
  } catch (e) {
    if (!(e instanceof EndOfKeys)) throw e;
    status = 'keys used up';
  }
  return { status, screens: p.screens, files: p.files.files, stdout: stdout.join('') };
}

/** Runs every run of a golden in the port, each with the files the port's run before left. */
export async function runGolden(g: Golden, each?: (i: number, r: RunResult) => void): Promise<RunResult[]> {
  const out: RunResult[] = [];
  let files = new Map<string, Uint8Array>();
  for (let i = 0; i < g.runs.length; i++) {
    const run = g.runs[i];
    // every run starts with an empty scores.dat beside the files of the session (drive.py)
    const start = new Map(files);
    start.set('scores.dat', files.get('scores.dat') ?? new Uint8Array(0));
    const r = await runOnce(run.args, run.keys, start, g.time, g.login);
    out.push(r);
    each?.(i, r);
    files = r.files;
  }
  return out;
}

function show(s: Screen): string {
  return `${s.kind} key#${s.key} seed=${s.seed} cursor=(${s.y},${s.x}) bells=${s.bells}\n` +
    s.rows.map((r, i) => `${String(i).padStart(2)}|${r}`).join('\n');
}

/** The first difference between the original's screens and the port's, as text; null if none. */
export function firstDifference(run: GoldenRun, got: Screen[]): string | null {
  const want = expandFrames(run.frames);
  const n = Math.max(want.length, got.length);
  for (let i = 0; i < n; i++) {
    const a = want[i], b = got[i];
    if (!a || !b) {
      return `screen ${i}: ${a ? 'the port ended early' : 'the port shows more screens'} (original ${want.length}, port ${got.length})\n` +
        (a ? `original:\n${show(a)}` : `port:\n${show(b)}`) + (i > 0 ? `\nscreen before (original):\n${show(want[i - 1])}` : '');
    }
    const same = a.kind === b.kind && a.key === b.key && a.seed === b.seed && a.y === b.y && a.x === b.x && a.bells === b.bells &&
      a.rows.every((r, j) => r === b.rows[j]);
    if (!same) {
      const keys = run.keys.slice(Math.max(0, a.key - 20), a.key);
      const rows = a.rows.map((r, j) => (r === b.rows[j] ? null : `  row ${j}\n    original |${r}|\n    port     |${b.rows[j]}|`)).filter((x) => x);
      return `screen ${i} (after key #${a.key}; the keys before: ${JSON.stringify(keys)}) differs:\n` +
        `original: ${a.kind} key#${a.key} seed=${a.seed} cursor=(${a.y},${a.x}) bells=${a.bells}\n` +
        `port:     ${b.kind} key#${b.key} seed=${b.seed} cursor=(${b.y},${b.x}) bells=${b.bells}\n` +
        rows.join('\n') + `\noriginal screen:\n${show(a)}` + (i > 0 ? `\nscreen before (original):\n${show(want[i - 1])}` : '');
    }
  }
  return null;
}

export function base64(b: Uint8Array): string {
  return Buffer.from(b).toString('base64');
}
