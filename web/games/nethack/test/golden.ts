// The goldens of re/nethack/oracle/drive.py, and the comparison of a port run with one.
import { readFileSync } from 'node:fs';
import { gunzipSync } from 'node:zlib';
import { VT } from '../src/vt.ts';
import { runOnce, type Frame } from './harness.ts';

export type GoldenFrame = [string, number, number, string];

export interface GoldenRun {
  args: string[];
  keys: string;
  status: number;
  frames: GoldenFrame[];
  files: Record<string, string>;
}

export interface Golden {
  name: string;
  seed: number;
  login: string;
  time: number;
  runs: GoldenRun[];
}

export function loadGolden(path: string): Golden {
  const raw = readFileSync(path);
  const text = path.endsWith('.gz') ? gunzipSync(raw).toString('latin1') : raw.toString('latin1');
  return JSON.parse(text) as Golden;
}

const bytesOf = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0));
const strOf = (b: number[]) => String.fromCharCode(...b);

function screens(frames: { bytes: string }[], upto: number): string[] {
  const vt = new VT();
  for (let i = 0; i <= upto && i < frames.length; i++) vt.feed(bytesOf(frames[i].bytes));
  return [...vt.lines(), `cursor ${vt.y},${vt.x}`];
}

/** the first difference between a run and the golden's, described; null when there is none */
export function firstDifference(want: GoldenFrame[], got: Frame[]): string | null {
  const n = Math.max(want.length, got.length);
  for (let i = 0; i < n; i++) {
    const w = want[i], g = got[i];
    const gs = g ? strOf(g.bytes) : undefined;
    if (!w || !g || w[0] !== g.kind || w[1] !== g.key || w[2] !== g.rng || w[3] !== gs) {
      const what = !w ? 'an extra frame' : !g ? 'a missing frame' :
        w[0] !== g.kind || w[1] !== g.key ? `frame kind/key ${w[0]}${w[1]} vs ${g.kind}${g.key}` :
        w[2] !== g.rng ? `random draws ${w[2]} vs ${g.rng}` : 'the terminal output';
      const ws = screens(want.map((f) => ({ bytes: f[3] })), i);
      const gsScreens = screens(got.map((f) => ({ bytes: strOf(f.bytes) })), i);
      const lines = [`frame ${i} (key ${w?.[1] ?? g?.key}): ${what}`];
      if (w && g && w[3] !== gs) {
        let k = 0;
        while (k < w[3].length && w[3][k] === gs![k]) k++;
        lines.push(`bytes differ at ${k}: want ${JSON.stringify(w[3].slice(Math.max(0, k - 20), k + 40))}`);
        lines.push(`                 got  ${JSON.stringify(gs!.slice(Math.max(0, k - 20), k + 40))}`);
      }
      lines.push('want:', ...ws.map((l) => '|' + l), 'got:', ...gsScreens.map((l) => '|' + l));
      return lines.join('\n');
    }
  }
  return null;
}

/** runs every run of a golden through the port; returns the first difference or null */
export async function replay(g: Golden): Promise<string | null> {
  let files = new Map<string, Uint8Array>();
  for (let r = 0; r < g.runs.length; r++) {
    const run = g.runs[r];
    const res = await runOnce({ keys: bytesOf(run.keys), args: run.args, seed: g.seed, login: g.login, time: g.time, files });
    const d = firstDifference(run.frames, res.frames);
    if (d) return `run ${r}: ${d}`;
    const wantStatus = run.status === 99 ? 'keys used up' : run.status;
    if (res.status !== wantStatus) return `run ${r}: status ${res.status}, want ${wantStatus}`;
    files = new Map();
    const inst = (await import('./harness.ts')).installation();
    for (const [k, v] of res.files) {
      const orig = inst.get(k);
      if (orig && orig.length === v.length && orig.every((x, i) => x === v[i])) continue;
      files.set(k, v);
    }
  }
  return null;
}
