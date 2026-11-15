// The sessions (sessions/*.txt, written by sessions/make.py) and how the original and the port play
// them. A session's result is its digest: the SHA-256 of every state dump (the window's pixels, the
// map, the globals, the power grids, the palette: dump.ts / re/lincity/oracle/dump.c) and of every file
// left in the home directory (gzip files by their content, not by the time stamp in their header).
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { existsSync, mkdirSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { gunzipSync } from 'fflate';

const here = dirname(new URL(import.meta.url).pathname);
export const SESSIONS = join(here, 'sessions');
export const ORACLE = join(here, '..', '..', '..', '..', 're', 'lincity', 'oracle', 'lincity-oracle');
export const EXPECTED = join(SESSIONS, 'expected.json');

export interface Digest { dumps: Record<string, string>; home: Record<string, string> }

export const sessionNames = (): string[] =>
  readdirSync(SESSIONS).filter((f) => f.endsWith('.txt')).map((f) => f.slice(0, -4)).sort();
export const haveOracle = (): boolean => existsSync(ORACLE);

const sha = (b: Uint8Array): string => createHash('sha256').update(b).digest('hex');

export function digest(dumps: string, home: string): Digest {
  const d: Digest = { dumps: {}, home: {} };
  for (const f of readdirSync(dumps).filter((f) => f.endsWith('.bin')).sort()) {
    d.dumps[f.slice(0, -4)] = sha(readFileSync(join(dumps, f)));
  }
  const walk = (dir: string, prefix: string): void => {
    if (!existsSync(dir)) return;
    for (const f of readdirSync(dir).sort()) {
      const p = join(dir, f);
      if (statSync(p).isDirectory()) walk(p, `${prefix}${f}/`);
      else {
        let b: Uint8Array = readFileSync(p);
        if (b[0] === 0x1f && b[1] === 0x8b) b = gunzipSync(b);
        d.home[`${prefix}${f}`] = sha(b);
      }
    }
  };
  walk(home, '');
  return d;
}

/** the original: dumps to <out>/oracle, home <out>/oracle-home */
export function runOracle(name: string, out: string): { dumps: string; home: string } {
  const dumps = join(out, 'oracle'), home = join(out, 'oracle-home');
  mkdirSync(dumps, { recursive: true });
  mkdirSync(home, { recursive: true });
  execFileSync(ORACLE, [], {
    stdio: 'pipe',
    env: { ...process.env, HOME: home, ORACLE_SCRIPT: join(SESSIONS, `${name}.txt`), ORACLE_OUT: dumps },
  });
  return { dumps, home };
}

/** the port, in a process of its own (the program's state is module globals): <out>/port, <out>/port/home */
export function runPort(name: string, out: string): { dumps: string; home: string } {
  const dumps = join(out, 'port');
  execFileSync(process.execPath, [join(here, 'run-port.ts'), join(SESSIONS, `${name}.txt`), dumps], { stdio: 'pipe' });
  return { dumps, home: join(dumps, 'home') };
}
