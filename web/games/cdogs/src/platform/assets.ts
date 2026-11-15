// The port's data directory in the browser: every file of web/games/cdogs/assets by its Vite URL, read with fetch.
// The music (assets/music, lazyAssets in game.json) is fetched only when a track plays.
import type { DataFS } from '../core/data.ts';

const urls = import.meta.glob(['../../assets/**/*.*'], { query: '?url', import: 'default', eager: true }) as Record<string, string>;
// files without an extension (Vite would take them for scripts): their text
const texts = import.meta.glob('../../assets/doc/*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const PREFIX = '../../assets/';

export function assetFS(signal: AbortSignal): DataFS & { url(path: string): string | null } {
  const byPath = new Map<string, string>();
  for (const [k, v] of Object.entries(urls)) byPath.set(k.slice(PREFIX.length), v);
  const textOf = new Map(Object.entries(texts).map(([k, v]) => [k.slice(PREFIX.length), v]));
  for (const k of textOf.keys()) byPath.set(k, '');
  // the original lists directories in its file system's order; the port in byte order (re/cdogs/NOTES.md)
  // (directory by directory, as the tests' file system: test/nodefs.ts)
  const all = [...byPath.keys()].sort((a, b) => {
    const x = a.split('/');
    const y = b.split('/');
    for (let i = 0; i < Math.min(x.length, y.length); i++) if (x[i] !== y[i]) return x[i] < y[i] ? -1 : 1;
    return x.length - y.length;
  });
  const cache = new Map<string, string[]>();
  return {
    list(dir: string): string[] {
      let l = cache.get(dir);
      if (!l) {
        const p = dir === '' ? '' : `${dir}/`;
        l = all.filter((f) => f.startsWith(p));
        cache.set(dir, l);
      }
      return l;
    },
    exists: (path: string) => byPath.has(path),
    async read(path: string): Promise<Uint8Array> {
      const t = textOf.get(path);
      if (t != null) return new TextEncoder().encode(t);
      const u = byPath.get(path);
      if (!u) throw new Error(`no such file: ${path}`);
      const r = await fetch(u, { signal });
      if (!r.ok || (r.headers.get('content-type') ?? '').startsWith('text/html')) throw new Error(`${path}: ${r.status}`);
      return new Uint8Array(await r.arrayBuffer());
    },
    url: (path: string) => byPath.get(path) ?? null,
  };
}
