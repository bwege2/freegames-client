// The game's files for the virtual file system (jre/io.ts) in a worker: an index of every file the build
// serves (its path in the virtual file system -> its URL, from import.meta.glob on the page), read when
// first asked for. Workers read synchronously (the translated code reads files as Java does), with a
// synchronous request in the browser; the built files are cached by the browser, small ones also here.
import type { FileProvider } from '../../jre/io.ts';

export type FileIndex = Record<string, string>;

/** The virtual file system paths of the assets folder: assets/data/... -> /data/..., assets/jdk/... -> /jdk/... */
export function vfsPath(assetPath: string): string {
  return '/' + assetPath.replace(/^(\.\.\/)*assets\//, '');
}

export function indexProvider(index: FileIndex, load: (url: string) => Uint8Array | null): FileProvider {
  const dirs = new Map<string, Set<string>>();
  for (const p of Object.keys(index)) {
    let child = p;
    for (let d = p.substring(0, p.lastIndexOf('/')) || '/'; ; d = d.substring(0, d.lastIndexOf('/')) || '/') {
      let s = dirs.get(d);
      if (!s) dirs.set(d, (s = new Set()));
      s.add(child.substring(child.lastIndexOf('/') + 1));
      if (d === '/') break;
      child = d;
    }
  }
  const cache = new Map<string, Uint8Array>();
  return {
    read(p: string) {
      const url = index[p];
      if (url == null) return null;
      let b = cache.get(p);
      if (!b) {
        const r = load(url);
        if (!r) return null;
        b = r;
        if (b.length < 1 << 18) cache.set(p, b);
      }
      return b;
    },
    list(p: string) {
      const s = dirs.get(p);
      return s ? [...s].sort() : null;
    },
    isDir(p: string) {
      return dirs.has(p);
    },
    has(p: string) {
      return index[p] != null;
    },
  };
}

/** A worker's synchronous read of a URL (null if it is not there). */
export function loadSync(url: string): Uint8Array | null {
  const x = new XMLHttpRequest();
  x.open('GET', url, false);
  x.responseType = 'arraybuffer';
  x.send();
  return x.status === 200 ? new Uint8Array(x.response as ArrayBuffer) : null;
}
