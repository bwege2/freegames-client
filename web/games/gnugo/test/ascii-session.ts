// Runs the ported program (src/gnugo.ts) headless on a session of the original's ASCII mode: the
// command line, the lines typed, and files in its working directory; returns what it printed and wrote.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { GnuGo } from '../src/gnugo.ts';
import { mc_load_patterns_from_db } from '../src/engine/montecarlo.ts';
import { sgfClock } from '../src/sgf/sgf.ts';

export interface Golden {
  args: string[];
  input: string;
  files: Record<string, string>;
  stdout: string;
  stderr: string;
  status: number | null;
  written: Record<string, string>;
}

let loaded = false;

export async function runSession(args: string[], input: string, files: Record<string, string>) {
  if (!loaded) {
    mc_load_patterns_from_db(readFileSync(join(import.meta.dirname, '../assets/mc_montegnu_classic.db'), 'latin1'));
    loaded = true;
  }
  sgfClock.now = () => new Date(2026, 10, 15);
  const fs = new Map<string, string>(Object.entries(files));
  const written: Record<string, string> = {};
  let stdout = '';
  let stderr = '';
  const lines = input.split(/(?<=\n)/).filter((l) => l.length > 0);
  let k = 0;
  const prog = new GnuGo({
    out: (s) => (stdout += s),
    err: (s) => (stderr += s),
    readLine: async () => (k < lines.length ? lines[k++] : null),
    readFile: (name) => {
      const s = fs.get(name);
      return s === undefined ? null : Uint8Array.from(s, (c) => c.charCodeAt(0));
    },
    writeFile: (name, data) => {
      const s = String.fromCharCode(...data);
      fs.set(name, s);
      written[name] = s;
      return true;
    },
    time: () => 1_700_000_000,
  });
  const status = await prog.main(args);
  return { stdout, stderr, status, written };
}

/** what depends on the full engine (its score estimate) or on the day */
export function normalize(s: string): string {
  return s
    .replace(/Result: (jigo|[WB]\+\d+\.\d)   /g, 'Result: <score>   ')
    .replace(/RE\[[WB]\+\d+\.\d\]|RE\[0\]/g, 'RE[<score>]')
    .replace(/DT\[\d{4}-\d\d-\d\d\]/g, 'DT[<date>]');
}
