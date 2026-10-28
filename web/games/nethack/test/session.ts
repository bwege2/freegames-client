// The sessions of re/nethack/oracle/sessions/ (the format: re/nethack/oracle/drive.py), for the tools.
import { readFileSync } from 'node:fs';
import { basename } from 'node:path';
import { TIME } from './harness.ts';

export interface Session {
  name: string;
  seed: number;
  login: string;
  time: number;
  runs: { args: string[]; keys: Uint8Array }[];
}

export function unescapeKeys(text: string): number[] {
  const out: number[] = [];
  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (c === '\\' && i + 1 < text.length) {
      const n = text[i + 1];
      if (n === 'n') out.push(10);
      else if (n === 'r') out.push(13);
      else if (n === 'e') out.push(27);
      else if (n === 'x') {
        out.push(parseInt(text.slice(i + 2, i + 4), 16));
        i += 2;
      } else out.push(n.charCodeAt(0));
      i++;
      continue;
    }
    if (c === '^' && i + 1 < text.length && '@ABCDEFGHIJKLMNOPQRSTUVWXYZ[\\]^_?'.includes(text[i + 1])) {
      out.push(text[i + 1] === '?' ? 127 : text.charCodeAt(i + 1) & 31);
      i++;
      continue;
    }
    out.push(c.charCodeAt(0));
  }
  return out;
}

export function parseSession(path: string): Session {
  const s: Session = { name: basename(path).replace(/\.txt$/, ''), seed: 1, login: 'tester', time: TIME, runs: [] };
  const keys: number[][] = [];
  for (const raw of readFileSync(path, 'latin1').split('\n')) {
    const line = raw.replace(/\r$/, '');
    if (!line.trim() || line.trimStart().startsWith('#')) continue;
    const sp = line.indexOf(' ');
    const word = sp < 0 ? line : line.slice(0, sp);
    const rest = sp < 0 ? '' : line.slice(sp + 1);
    if (word === 'seed') s.seed = Number(rest);
    else if (word === 'login') s.login = rest.trim();
    else if (word === 'time') s.time = Number(rest);
    else if (word === 'run') {
      s.runs.push({ args: rest.split(/\s+/).filter(Boolean), keys: new Uint8Array() });
      keys.push([]);
    } else if (word === 'keys') keys[keys.length - 1].push(...unescapeKeys(rest.trim()));
    else throw new Error(`${path}: bad line ${line}`);
  }
  s.runs.forEach((r, i) => (r.keys = Uint8Array.from(keys[i])));
  return s;
}
