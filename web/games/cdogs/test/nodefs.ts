// The port's data directory (web/games/cdogs/assets) as a DataFS for the tests.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import type { DataFS } from '../src/core/data.ts';

export function nodeFS(root: string): DataFS {
  const cache = new Map<string, string[]>();
  const walk = (dir: string, out: string[]): void => {
    let names: string[];
    try {
      names = readdirSync(root + dir).sort();
    } catch {
      return;
    }
    for (const n of names) {
      const p = dir ? `${dir}/${n}` : n;
      if (statSync(root + p).isDirectory()) walk(p, out);
      else out.push(p);
    }
  };
  return {
    list(dir: string): string[] {
      let l = cache.get(dir);
      if (!l) {
        l = [];
        walk(dir, l);
        cache.set(dir, l);
      }
      return l;
    },
    exists: (path: string) => existsSync(root + path) && statSync(root + path).isFile(),
    read: async (path: string) => new Uint8Array(readFileSync(root + path)),
  };
}
