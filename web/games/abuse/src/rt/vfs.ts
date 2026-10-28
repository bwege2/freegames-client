// The file system the program sees: the game's data (the free files of the reference tarball,
// assets/abuse-data.bin) under /data/, the player's save directory (~/.abuse/ of the original,
// kept in account storage) under /save/. Paths are absolute; "a//b" and "/./" are normalised.
// Files written under /save/ are reported to `onSave` when they are closed (rt/storage.ts sends
// them to the server); light.tbl, the original's cache of a computed table, is kept in memory only.

export const DATA_PREFIX = '/data/';
export const SAVE_PREFIX = '/save/';

const files = new Map<string, Uint8Array>();
let onSave: ((name: string, data: Uint8Array) => void) | null = null;
let onDelete: ((name: string) => void) | null = null;

export function normalize(path: string): string {
  let p = path.replace(/\\/g, '/').replace(/\/\.\//g, '/').replace(/\/{2,}/g, '/');
  while (p.startsWith('./')) p = p.slice(2);
  return p;
}

export function vfsReset(): void {
  files.clear();
  onSave = null;
  onDelete = null;
}

export function vfsPut(path: string, data: Uint8Array): void {
  files.set(normalize(path), data);
}

export function vfsGet(path: string): Uint8Array | undefined {
  return files.get(normalize(path));
}

export function vfsExists(path: string): boolean {
  return files.has(normalize(path));
}

export function vfsList(prefix: string): string[] {
  const p = normalize(prefix);
  return [...files.keys()].filter((k) => k.startsWith(p)).sort();
}

export function vfsDelete(path: string): void {
  const p = normalize(path);
  files.delete(p);
  if (p.startsWith(SAVE_PREFIX) && onDelete) onDelete(p.slice(SAVE_PREFIX.length));
}

/** a file under /save/ was written (closed) */
export function vfsSaved(path: string): void {
  const p = normalize(path);
  const data = files.get(p);
  if (!data || !p.startsWith(SAVE_PREFIX)) return;
  const name = p.slice(SAVE_PREFIX.length);
  if (name === 'light.tbl') return;
  if (onSave) onSave(name, data);
}

export function vfsOnSave(save: (name: string, data: Uint8Array) => void, del: (name: string) => void): void {
  onSave = save;
  onDelete = del;
}

/** The data pack (re/abuse/tools/pack.py): "ABUSEPK1", then per file: u16 name length, name (latin1),
 *  u32 size, bytes; little-endian. */
export function vfsLoadPack(pack: Uint8Array, prefix = DATA_PREFIX): number {
  const magic = String.fromCharCode(...pack.subarray(0, 8));
  if (magic !== 'ABUSEPK1') throw new Error('not an Abuse data pack');
  const dv = new DataView(pack.buffer, pack.byteOffset, pack.byteLength);
  let o = 8;
  let n = 0;
  while (o < pack.length) {
    const nl = dv.getUint16(o, true);
    o += 2;
    let name = '';
    for (let i = 0; i < nl; i++) name += String.fromCharCode(pack[o + i]);
    o += nl;
    const size = dv.getUint32(o, true);
    o += 4;
    files.set(normalize(prefix + name), pack.subarray(o, o + size));
    o += size;
    n++;
  }
  return n;
}
