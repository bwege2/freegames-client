// Runs a session through the port as re/gnuchess/oracle/drive.py runs it through the original: the
// same command line, files and input lines, each line typed only when the program waits for it and
// has nothing else to do, then end of input. Everything (the engine too) runs in this thread.
import { GnuChess } from '../src/main.ts';
import { InProcessEngine } from '../src/engine-link.ts';
import { MemFiles, PKGDATADIR, type Clock } from '../src/host.ts';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { bstr, bytes } from '../src/libc.ts';

/** what drive.py records */
export interface Golden {
  name: string;
  args: string[];
  time: number;
  files: Record<string, string>;
  input: string[];
  status: number | null;
  stdout: string;
  stderr: string;
  written: Record<string, string>;
}

export interface Run {
  stdout: string;
  stderr: string;
  status: number | null;
  written: Record<string, string>;
  files: MemFiles;
}

const BOOK = new Uint8Array(readFileSync(join(import.meta.dirname, '..', 'assets', 'smallbook.bin')));

/**
 * The tests' clock: time() is the session's, and every look at the real-time clock advances it by
 * 50 ms. Searches limited by time (the engine checks the clock every 10000 nodes) then end after a
 * number of nodes, the same every run; fixed-depth searches do not depend on it.
 */
export function virtualClock(time: number): Clock {
  let t = 0;
  return {
    real: () => (t += 0.05),
    cpu: () => t,
    time: () => time,
  };
}

/** the home directory the oracle runs in (a new temporary directory: no gnuchess.ini) */
const HOME = '/tmp/gnuchess-home';

export function runSession(c: Pick<Golden, 'args' | 'time' | 'files' | 'input'>): Run {
  const files = new MemFiles();
  for (const [k, v] of Object.entries(c.files)) files.map.set(k, bytes(v));
  // `make install` puts the book here
  files.map.set(PKGDATADIR + '/smallbook.bin', BOOK);
  const before = new Map([...files.map].map(([k, v]) => [k, bstr(v)]));
  const clock = virtualClock(c.time);
  let stdout = '';
  let stderr = '';
  let wants = false;
  let status: number | null = null;
  let ended = false;
  const engine = new InProcessEngine(files, clock, (s) => (stderr += s));
  const proc = new GnuChess({
    stdout: (s) => (stdout += s),
    stderr: (s) => (stderr += s),
    readLine: () => {
      wants = true;
    },
    exit: (code) => {
      status = code;
      ended = true;
    },
    files,
    clock,
    getenv: (name) => (name === 'HOME' ? HOME : undefined),
    localtime: (secs) => {
      const d = new Date(secs * 1000);
      return [d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()];
    },
    engine,
  });
  proc.start(c.args);
  let next = 0;
  let guard = 0;
  while (!ended) {
    if (!wants) throw new Error(`the program neither ended nor waits for input (after ${next} lines)`);
    wants = false;
    if (++guard > 100000) throw new Error('runaway session');
    proc.input(next < c.input.length ? c.input[next++] + '\n' : null);
  }
  const written: Record<string, string> = {};
  for (const [k, v] of files.map) {
    const s = bstr(v);
    if (before.get(k) !== s) written[k] = s;
  }
  return { stdout, stderr, status, written, files };
}

/** post lines carry the time in centiseconds: "depth score time nodes pv" */
export function maskTimes(s: string): string {
  return s.replace(/^(\d+ [+-]\d+ )\d+( \d+ )/gm, '$1T$2');
}

const PROMPT = /(?:White|Black) \(\d+\) : /g;

/**
 * The input thread prints the prompt while the main thread and the adapter thread print too: where in
 * their output a prompt lands is a race in the original (the adapter's `bk` list usually comes before
 * the next prompt, `book add`'s messages after it). Sessions are compared without the prompts, and
 * the prompts are compared as the sequence they form.
 */
export function splitPrompts(s: string): { text: string; prompts: string[] } {
  return { text: maskTimes(s.replace(PROMPT, '')), prompts: s.match(PROMPT) ?? [] };
}
