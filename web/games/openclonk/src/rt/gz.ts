// OpenClonk port: src/zlib/gzio.c, the engine's gzip streams over file descriptors (packed groups are gzip
// with the magic bytes 1e 8c instead of 1f 8b), on rt/fs.ts. Reading inflates the whole member at once
// (fflate); writing collects the data and deflates it on close with level 1, as "wb1" asks. The bytes of a
// written stream are fflate's, not zlib's: they read back the same, but are not byte for byte the original's.
import { deflateSync, inflateSync } from 'fflate';
import { Ptr } from './ptr.ts';
import { c$close, c$lseek, c$read, c$write } from './fs.ts';
import { crc32 } from './StdBuf.ts';

interface GzFile { fd: number; write: boolean; data: Uint8Array; pos: number; transparent: boolean; chunks: Uint8Array[] }

function readAll(fd: number): Uint8Array {
  const parts: Uint8Array[] = [];
  let n = 0;
  for (;;) {
    const a = new Int8Array(65536);
    const k = c$read(fd, new Ptr(a, 0), a.length);
    if (k <= 0) break;
    parts.push(new Uint8Array(a.buffer, 0, k));
    n += k;
  }
  const out = new Uint8Array(n);
  let o = 0;
  for (const p of parts) {
    out.set(p, o);
    o += p.length;
  }
  return out;
}

/** the data of a gzip member (either magic), or null if b is not one (gzio's transparent mode) */
function gunzip(b: Uint8Array): Uint8Array | null {
  if (b.length < 10 || !((b[0] === 0x1f && b[1] === 0x8b) || (b[0] === 0x1e && b[1] === 0x8c))) return null;
  if (b[2] !== 8) throw new Error('gzio: unknown compression method');
  const flags = b[3];
  let o = 10;
  if (flags & 4) o += 2 + (b[o] | (b[o + 1] << 8));
  if (flags & 8) { while (b[o]) o++; o++; }
  if (flags & 16) { while (b[o]) o++; o++; }
  if (flags & 2) o += 2;
  return inflateSync(b.subarray(o));
}

export function c4_gzdopen(fd: number, mode: Ptr): GzFile | null {
  if (fd < 0) return null;
  const m = String.fromCharCode(mode.a[mode.o] as number);
  if (m === 'w') return { fd, write: true, data: new Uint8Array(0), pos: 0, transparent: false, chunks: [] };
  const raw = readAll(fd);
  const data = gunzip(raw);
  return { fd, write: false, data: data ?? raw, pos: 0, transparent: data === null, chunks: [] };
}

export function c4_gzdirect(f: GzFile): number {
  return f.transparent ? 1 : 0;
}

function bytesOf(p: Ptr, n: number): Uint8Array {
  const a = p.a as any;
  if (a instanceof Int8Array || a instanceof Uint8Array) return new Uint8Array(a.buffer, a.byteOffset + p.o, n);
  // a pointer to other numbers: their bytes
  return new Uint8Array(a.buffer, a.byteOffset + p.o * a.BYTES_PER_ELEMENT, n);
}

export function c4_gzread(f: GzFile, buf: Ptr, len: number): number {
  if (f.write) return -1;
  const k = Math.max(0, Math.min(len, f.data.length - f.pos));
  bytesOf(buf, k).set(f.data.subarray(f.pos, f.pos + k));
  f.pos += k;
  return k;
}

export function c4_gzwrite(f: GzFile, buf: Ptr, len: number): number {
  if (!f.write) return 0;
  f.chunks.push(bytesOf(buf, len).slice());
  return len;
}

export function c4_gzrewind(f: GzFile): number {
  if (f.write) return -1;
  f.pos = 0;
  return 0;
}

export function c4_gzclose(f: GzFile | null): number {
  if (!f) return -2;
  if (f.write) {
    let n = 0;
    for (const c of f.chunks) n += c.length;
    const all = new Uint8Array(n);
    let o = 0;
    for (const c of f.chunks) { all.set(c, o); o += c.length; }
    const z = deflateSync(all, { level: 1 });
    const out = new Uint8Array(10 + z.length + 8);
    out.set([0x1e, 0x8c, 8, 0, 0, 0, 0, 0, 0, 0x0b]);
    out.set(z, 10);
    const crc = crc32(0, all) >>> 0;
    const v = new DataView(out.buffer);
    v.setUint32(10 + z.length, crc, true);
    v.setUint32(14 + z.length, n >>> 0, true);
    c$lseek(f.fd, 0, 2);
    const a = new Int8Array(out.buffer);
    c$write(f.fd, new Ptr(a, 0), a.length);
  }
  return c$close(f.fd);
}
