// The rest of the C library COW uses: memory (calloc, realloc) and fts (x11sprite.c lists the
// screenshot images of its pixmap directory with it; the order is the sorted names).
import { Ptr, P } from './ptr.ts';
import { cstr, jstr } from './cstring.ts';
import { filesBelow } from './fs.ts';

export function calloc(n: number, size: number): Ptr {
  return P(new Int8Array(n * size));
}

/** realloc() of an array of numbers or structs: a longer copy */
export function realloc(p: any, size: number): any {
  if (p instanceof Ptr && ArrayBuffer.isView(p.a)) {
    const T: any = (p.a as any).constructor;
    const n = Math.ceil(size / T.BYTES_PER_ELEMENT);
    const a = new T(n);
    a.set((p.a as any).subarray(p.o, p.o + Math.min(n, (p.a as any).length - p.o)));
    return new Ptr(a, 0);
  }
  if (p && p.$a && p.constructor && p.constructor.$size) {
    const C = p.constructor;
    const n = Math.floor(size / C.$size);
    const arr: any[] = [];
    for (let i = 0; i < n; i++) {
      const o = i + p.$i < p.$a.length ? p.$a[p.$i + i] : new C();
      o.$a = arr;
      o.$i = i;
      arr.push(o);
    }
    return arr[0];
  }
  if (p == null) return P(new Int8Array(size));
  throw new Error('realloc of ' + String(p));
}

const FTS_D = 1, FTS_DP = 6, FTS_F = 8;

interface Fts {
  entries: { fts_info: number; fts_path: Ptr; fts_accpath: Ptr; fts_name: Ptr; fts_level: number }[];
  i: number;
}

export function fts_open(argv: Ptr, _options: number, _cmp: any): Fts {
  const entries: Fts['entries'] = [];
  for (let k = argv.o; argv.a[k]; k++) {
    const root = jstr(argv.a[k]);
    const ent = (info: number, path: string, level: number) => ({
      fts_info: info, fts_path: cstr(path), fts_accpath: cstr(path), fts_name: cstr(path.slice(path.lastIndexOf('/') + 1)), fts_level: level,
    });
    const files = filesBelow(root);
    if (!files.length) continue;
    entries.push(ent(FTS_D, root, 0));
    const base = files[0].slice(0, files[0].length - files[0].split('/').slice(-1)[0].length);
    for (const f of files) entries.push(ent(FTS_F, root + '/' + f.slice(base.length), 1));
    entries.push(ent(FTS_DP, root, 0));
  }
  return { entries, i: 0 };
}

export function fts_read(f: Fts): any {
  return f.i < f.entries.length ? f.entries[f.i++] : null;
}

export function fts_close(_f: Fts): number {
  return 0;
}
