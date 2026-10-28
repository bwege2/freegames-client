// Runs the port headless as re/nethack/oracle/run.py runs the original: the same command line, the
// keys typed one at a time when the program reads one, the clock at the same second (UTC), the same
// login name and seed, the installation's files (assets/: nhdat, license, symbols, sysconf) and empty
// record, logfile, xlogfile and perm. Every time the program reads a key, the frame is recorded: the
// bytes written to the terminal since the frame before and the number of draws from the random
// generators so far, as the oracle's stub.c records them.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { cstr } from '../src/rt/cstring.ts';
import { fsFiles, fsReset } from '../src/rt/fs.ts';
import { Exit, setPlatform, type Platform } from '../src/rt/platform.ts';
import { P } from '../src/rt/ptr.ts';
import { resetRng } from '../src/rt/rng.ts';
import { resetSys } from '../src/rt/sys.ts';
import { initGlobals } from '../src/init.ts';
import { main } from '../src/unixmain.ts';

const ASSETS = join(import.meta.dirname, '..', 'assets');
export const TIME = 1704067200; // 2024-01-01 00:00 UTC

export interface Frame {
  /** K: a key is read, E: the keys are used up, X: the program ended */
  kind: string;
  key: number;
  bytes: number[];
  rng: number;
}

export interface Run {
  frames: Frame[];
  status: number | 'keys used up';
  files: Map<string, Uint8Array>;
  stderr: string;
}

class EndOfKeys extends Error {}

export function installation(): Map<string, Uint8Array> {
  const m = new Map<string, Uint8Array>();
  for (const f of ['nhdat', 'license', 'symbols', 'sysconf']) m.set(f, new Uint8Array(readFileSync(join(ASSETS, f))));
  for (const f of ['record', 'logfile', 'xlogfile', 'perm']) m.set(f, new Uint8Array(0));
  return m;
}

export async function runOnce(opts: { keys: Uint8Array; args?: string[]; seed?: number; login?: string; time?: number;
  files?: Map<string, Uint8Array>; onDraw?: () => void }): Promise<Run> {
  const frames: Frame[] = [];
  let rng = 0, pos = 0, stderr = '';
  const keys = opts.keys;
  const login = opts.login ?? 'tester';
  const platform: Platform = {
    async getKey(terminal) {
      if (pos >= keys.length) {
        frames.push({ kind: 'E', key: pos, bytes: terminal, rng });
        throw new EndOfKeys();
      }
      frames.push({ kind: 'K', key: pos, bytes: terminal, rng });
      return keys[pos++];
    },
    async delay(_ms, terminal) {
      // the oracle's usleep() returns at once; the bytes belong to the next frame
      pending.push(...terminal);
    },
    time: () => opts.time ?? TIME,
    login: () => login,
    seed: (n) => (opts.seed ?? 1) + n,
    fileChanged() {},
    stderr(b) {
      stderr += String.fromCharCode(...b);
    },
    rngDraw() {
      rng++;
      opts.onDraw?.();
    },
  };
  // output before a delay is part of the next frame
  const pending: number[] = [];
  const wrapped: Platform = {
    ...platform,
    async getKey(terminal) {
      const t = pending.splice(0).concat(terminal);
      return platform.getKey(t);
    },
  };
  setPlatform(wrapped);
  const files = new Map(installation());
  for (const [k, v] of opts.files ?? []) files.set(k, v);
  fsReset(files);
  resetRng();
  resetSys();
  initGlobals();
  const argv = ['nethack', ...(opts.args ?? [])];
  let status: number | 'keys used up';
  try {
    await main(argv.length, P([...argv.map((a) => cstr(a)), null]));
    status = 0;
  } catch (e) {
    if (e instanceof Exit) status = e.status;
    else if (e instanceof EndOfKeys) status = 'keys used up';
    else throw e;
  }
  if (status !== 'keys used up') {
    const { termTake } = await import('../src/rt/fs.ts');
    frames.push({ kind: 'X', key: pos, bytes: pending.splice(0).concat(termTake()), rng });
  }
  return { frames, status, files: fsFiles(), stderr };
}
