// OpenClonk port: what the translator leaves to the runtime (re/openclonk/tools/cpp2ts/config.py: NATIVE,
// NATIVE_METHODS): the platform (clock, files), the random generator, the hash function of the crypto library.
import { $ } from './registry.ts';
import { Ptr, S } from './ptr.ts';
import { blake2b as blake2bBytes } from './blake2b.ts';
import { StdString } from './std.ts';
import { $text } from './libc.ts';

export {
  FixedRandom, Random$u32, Random$v, RecordRandom, SeededRandom, UnsyncedRandom$u32, UnsyncedRandom$v, pcg32,
  setRandomRecorder,
} from './random.ts';
export { Random$u32 as Random } from './random.ts';
export { c4_gzclose, c4_gzdirect, c4_gzdopen, c4_gzread, c4_gzrewind, c4_gzwrite } from './gz.ts';

/**
 * thirdparty/timsort (sort.h with SORT_NAME StdMesh, SORT_TYPE StdMeshFaceOrderHelper, SORT_CMP StdMeshFaceCmp), as
 * lib/StdMesh.cpp's SortFacesArray calls it: StdMesh_tim_sort(&helpers[0], helpers.size()). Timsort is a stable sort,
 * so its result is that of any stable sort by the same comparator; StdMeshFaceCmp orders by z (-1, +1, else 0).
 */
export function StdMesh_tim_sort(dst: any, size: number): void {
  // &helpers[0]: the vector's first object (it knows its array and place, $a and $i), or a Ptr
  const arr: any[] = dst instanceof Ptr ? dst.a : dst.$a;
  const start: number = dst instanceof Ptr ? dst.o : dst.$i;
  const items: any[] = [];
  for (let i = 0; i < size; i++) items.push(arr[start + i]);
  const vals = items.map((h) => ({ z: h.z, i: h.i }));
  vals.sort((h1, h2) => (h1.z < h2.z ? -1 : h1.z > h2.z ? 1 : 0));
  // the vector's elements are objects that know their place: the values move, as the C array's do
  for (let i = 0; i < size; i++) { items[i].z = vals[i].z; items[i].i = vals[i].i; }
}

/** platform calls the simulation reaches but cannot use in a browser page */
export function gethostname(): number { return -1; }
export { c$readlink as readlink } from './fs.ts';
export function fork(): number { return -1; }
export function pthread_self(): number { return 0; }
export function pthread_create(): number { return 0; }
export function flock(): number { return 0; }
export function chmod(): number { return 0; }
/**
 * c4group/C4Language.cpp GetResStr(id, stringtbl): the value of `id=value` in a string table, found with the
 * original's std::regex "(?:\n|^)([^=]+)=(.*?)\r?(?=\n|$)" (ECMAScript, which JavaScript's RegExp is: ^ and $ at the
 * table's start and end only), the first match whose key is id; else id itself. The bytes are kept as they are (each
 * a character 0..255), as the original's char regex sees them.
 */
export function GetResStr(id: Ptr, stringtbl: Ptr | null): StdString {
  if (!stringtbl) return new StdString();
  const a = stringtbl.a as Int8Array;
  let end = stringtbl.o;
  while (end < a.length && a[end]) end++;
  let text = '';
  for (let i = stringtbl.o; i < end; i++) text += String.fromCharCode(a[i] & 0xff);
  const key = $text(id);
  for (const m of text.matchAll(/(?:\n|^)([^=]+)=(.*?)\r?(?=\n|$)/g)) {
    if (m[1] !== key) continue;
    const b = new Int8Array(m[2].length + 1);
    for (let i = 0; i < m[2].length; i++) b[i] = m[2].charCodeAt(i);
    return StdString.of(new Ptr(b, 0), m[2].length);
  }
  return StdString.of(id);
}

/** platform/StdFile.cpp GetWorkingDirectory: the browser has none */
export function GetWorkingDirectory(): Ptr {
  return S('.');
}

/** platform/StdFile.cpp FileSize: the port's files live in its groups and storage, not in a file system */
export function FileSize$i32(_fd: number): number {
  return 0;
}
export function FileSize$pi8(_name: Ptr): number {
  return 0;
}

/** platform/StdFile.cpp RealPath: the path as it is */
export function RealPath(path: Ptr, out: any): boolean {
  out.Copy$pi8(path);
  return true;
}

/** thirdparty/blake2 blake2b(out, outlen, in, inlen, key, keylen) */
export function blake2b(out: Ptr, outlen: number, inp: Ptr, inlen: number, key: Ptr | null, keylen: number): number {
  const bytes = (p: Ptr | null, n: number) => {
    if (!p || !n) return new Uint8Array(0);
    const a = p.a as Int8Array;
    return new Uint8Array(a.buffer, a.byteOffset + p.o, n).slice();
  };
  const h = blake2bBytes(bytes(inp, Number(inlen)), Number(outlen), bytes(key, Number(keylen)));
  for (let i = 0; i < h.length; i++) out.a[out.o + i] = (h[i] << 24) >> 24;
  return 0;
}

const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();

/** the methods written here: $N.Class_method, called with the object as this */
export const $N: any = {
  /** C4TimeMilliseconds::Now(): milliseconds of a monotonic clock */
  C4TimeMilliseconds_Now(): any {
    const now = (typeof performance !== 'undefined' ? performance.now() : Date.now()) - t0;
    return new $.C4TimeMilliseconds().init$u32(Math.floor(now) >>> 0);
  },
  C4TimeMilliseconds_AsString(): any {
    return new $.StdStrBuf().init$pi8$b(S(String(this.inMillis)), true);
  },
};

/** C4TimeMilliseconds.cpp operator-(lhs, rhs): the difference in milliseconds */
export function op_sub$C4TimeMilliseconds$C4TimeMilliseconds(a: any, b: any): number {
  return (a.inMillis - b.inMillis) | 0;
}
