// The original's data files (assets/lincity-data.bin, made by re/lincity/tools/pack.py): unpacked into
// the program's file system as Lincity installs them.
import { gunzipSync } from 'fflate';
import { vfsPut, LIBDIR } from './lc/stdio.ts';

export function unpackData(packed: Uint8Array): Map<string, Uint8Array> {
  const raw = packed[0] === 0x1f && packed[1] === 0x8b ? gunzipSync(packed) : packed;
  const dv = new DataView(raw.buffer, raw.byteOffset, raw.byteLength);
  if (String.fromCharCode(raw[0], raw[1], raw[2], raw[3]) !== 'LCPK') throw new Error('not a Lincity data pack');
  const n = dv.getUint32(4, true);
  const files = new Map<string, Uint8Array>();
  let o = 8;
  for (let i = 0; i < n; i++) {
    const nl = dv.getUint16(o, true);
    const name = new TextDecoder().decode(raw.subarray(o + 2, o + 2 + nl));
    o += 2 + nl;
    const size = dv.getUint32(o, true);
    o += 4;
    files.set(name, raw.slice(o, o + size));
    o += size;
  }
  return files;
}

export function installData(files: Map<string, Uint8Array>): void {
  for (const [name, data] of files) vfsPut(`${LIBDIR}/${name}`, data);
}
