// OpenClonk port: the debug record (control/C4Record.h, C4GameControl::DbgRec, C4Playback::Check), the original's
// own desync check. With Config.General.DebugRec on, the engine reports every step that matters for the game state
// (random numbers, created and removed objects, executed objects, landscape pixels, script calls, ...) through
// AddDbgRec. The original writes them, during the replay of a record, to an external file
// ({int32 type, int32 size, bytes} per chunk; re/openclonk/oracle/debugrec.sh); this module turns the port's calls
// into the same bytes, so that the two streams can be compared chunk by chunk.
import { $ } from './registry.ts';
import { Ptr } from './ptr.ts';

/** C4RecordChunkType (control/C4Record.h), the debug-record part */
export const RCT: Record<string, number> = {
  DbgFrame: 0x81, Block: 0x82, SetPix: 0x83, ExecObj: 0x84, Random: 0x85, Rn3: 0x86, MMC: 0x87, MMD: 0x88,
  CrObj: 0x89, DsObj: 0x8a, GetPix: 0x8b, RotVtx1: 0x8c, RotVtx2: 0x8d, ExecPXS: 0x8e, Sin: 0x8f, Cos: 0x90,
  Map: 0x91, Ls: 0x92, MCT1: 0x93, MCT2: 0x94, AulFunc: 0x9a, ObjCom: 0x9b, PlrCom: 0x9c, PlrInCom: 0x9d,
  MatScan: 0x9e, MatScanDo: 0x9f, Area: 0xa0, MenuAdd: 0xa1, MenuAddC: 0xa2, OCF: 0xa3, DirectExec: 0xa4,
  Definition: 0xa5, SetProperty: 0xa6, Custom: 0xc0,
};
const NAME = new Map(Object.entries(RCT).map(([k, v]) => [v, k]));
export const rctName = (t: number): string => NAME.get(t) ?? '0x' + t.toString(16);

/** one chunk: its type and the bytes the original's AddDbgRec gets (pData, iSize) */
export interface DbgChunk {
  type: number;
  data: Uint8Array;
}

// The payload structs of control/C4Record.h, which the original packs to the byte (#pragma pack(1)) and records as
// raw memory: field name and C++ type, in order. C4Real is C4Fixed, one int32.
type Field = [string, 'i8' | 'u8' | 'bool' | 'i32' | 'u32' | 'fix' | 'char33' | 'i32x4'];
const LAYOUT: Record<number, Field[]> = {
  [RCT.SetPix]: [['x', 'i32'], ['y', 'i32'], ['clr', 'u8'], ['bgClr', 'u8']],
  [RCT.ExecObj]: [['Number', 'i32'], ['fx', 'fix'], ['fy', 'fix'], ['fr', 'fix']],
  [RCT.Random]: [['Cnt', 'i32'], ['Range', 'u32'], ['Val', 'u32']],
  [RCT.MMC]: [['x', 'i32'], ['y', 'i32']],
  [RCT.MMD]: [['x', 'i32'], ['y', 'i32']],
  [RCT.CrObj]: [['oei', 'i32'], ['id', 'char33'], ['x', 'i32'], ['y', 'i32'], ['ownr', 'i32']],
  [RCT.DsObj]: [['oei', 'i32'], ['id', 'char33'], ['x', 'i32'], ['y', 'i32'], ['ownr', 'i32']],
  [RCT.RotVtx1]: [['x', 'i32'], ['y', 'i32'], ['wdt', 'i32'], ['hgt', 'i32'], ['r', 'i32'], ['VtxX', 'i32x4'], ['VtxY', 'i32x4']],
  [RCT.RotVtx2]: [['x', 'i32'], ['y', 'i32'], ['wdt', 'i32'], ['hgt', 'i32'], ['r', 'i32'], ['VtxX', 'i32x4'], ['VtxY', 'i32x4']],
  [RCT.ExecPXS]: [['x', 'fix'], ['y', 'fix'], ['iMat', 'i32'], ['pos', 'i32']],
  [RCT.ObjCom]: [['com', 'u8'], ['data', 'i32'], ['o', 'i32']],
  [RCT.MatScanDo]: [['cx', 'i32'], ['cy', 'i32'], ['mat', 'i32'], ['conv_to', 'i32'], ['dir', 'i32'], ['mconvs', 'i32']],
  [RCT.Area]: [['op', 'i8'], ['obj', 'i32'], ['x1', 'i32'], ['y1', 'i32'], ['xL', 'i32'], ['yL', 'i32'], ['dpitch', 'i32'], ['out', 'bool']],
  [RCT.OCF]: [['dwOCFOld', 'u32'], ['dwOCFNew', 'u32'], ['fUpdate', 'bool']],
};
const SIZE: Record<string, number> = { i8: 1, u8: 1, bool: 1, i32: 4, u32: 4, fix: 4, char33: 33, i32x4: 16 };

const num = (v: any): number => (v == null ? 0 : typeof v === 'boolean' ? (v ? 1 : 0) : typeof v === 'object' && 'val' in v ? v.val : Number(v));

/** the struct object's bytes as the original's packed struct */
function structBytes(type: number, o: any): Uint8Array {
  const fields = LAYOUT[type];
  const out = new Uint8Array(fields.reduce((n, [, t]) => n + SIZE[t], 0));
  const dv = new DataView(out.buffer);
  let at = 0;
  for (const [name, t] of fields) {
    const v = o[name];
    switch (t) {
      case 'i8': case 'u8': case 'bool': dv.setUint8(at, num(v) & 0xff); break;
      case 'i32': case 'u32': case 'fix': dv.setInt32(at, num(v) | 0, true); break;
      case 'char33': {
        const src = v instanceof Ptr ? v.a : v;
        if (src && typeof src.length === 'number') for (let i = 0; i < 33 && i < src.length; i++) out[at + i] = src[i] & 0xff;
        break;
      }
      case 'i32x4':
        for (let i = 0; i < 4; i++) dv.setInt32(at + 4 * i, num(v?.[i]) | 0, true);
        break;
    }
    at += SIZE[t];
  }
  return out;
}

/** the bytes a pointer points to (iSize of them): characters, a byte surface, or one int32 field */
function pointerBytes(p: Ptr, size: number): Uint8Array {
  const out = new Uint8Array(size);
  const a = p.a;
  if (a instanceof Int8Array || a instanceof Uint8Array || a instanceof Uint8ClampedArray) {
    const o = p.o | 0;
    const n = Math.max(0, Math.min(size, a.length - o));
    for (let i = 0; i < n; i++) out[i] = a[o + i] & 0xff;
    return out;
  }
  if ((p as any).$obj !== undefined) {
    // a struct's bytes (rt/ptr.ts $bytesView: (void *) &rect of C4RCCreateObj)
    for (let i = 0; i < size; i++) out[i] = a[(p.o | 0) + i] & 0xff;
    return out;
  }
  if (a instanceof Int32Array || a instanceof Uint32Array) {
    const dv = new DataView(out.buffer);
    for (let i = 0; i * 4 < size; i++) dv.setInt32(i * 4, a[(p.o | 0) + i] | 0, true);
    return out;
  }
  // &obj.field (an int32, or a C4Real)
  if (size === 4) {
    new DataView(out.buffer).setInt32(0, num(a[p.o]) | 0, true);
    return out;
  }
  throw new Error(`debug record: cannot read ${size} bytes from a pointer into ${a?.constructor?.name}.${String(p.o)}`);
}

/** the bytes the original records for AddDbgRec(type, pData, iSize) */
export function chunkBytes(type: number, pData: any, size: number): Uint8Array {
  if (pData == null) return new Uint8Array(0);
  if (LAYOUT[type] && !(pData instanceof Ptr)) return structBytes(type, pData);
  if (pData instanceof Ptr) return pointerBytes(pData, size);
  if (pData instanceof Int8Array || pData instanceof Uint8Array) return pointerBytes(new Ptr(pData, 0), size);
  throw new Error(`debug record: no layout for ${rctName(type)} (${pData?.constructor?.name})`);
}

/**
 * Turns the debug record on: Config.General.DebugRec, and AddDbgRec (C4Record.cpp: through C4GameControl::DbgRec,
 * which leaves out the calls inside C4DebugRecOff blocks) hands every chunk to `onChunk`.
 *
 * `replay`: the game replays a record, as the original's does when it writes its debug record. The original writes
 * a chunk only through C4Playback::Check (C4GameControl::DbgRec: `if (pPlayback) pPlayback->Check(...)`), so only
 * while a playback exists: once the record has ended (C4Playback::Finish, then ChangeToLocal deletes it) nothing more
 * is written.
 */
export function startDebugRec(onChunk: (c: DbgChunk) => void, replay = false): void {
  $.Config.General.DebugRec = 1;
  ($ as any).AddDbgRec = (type: number, pData: any = null, size = 0) => {
    if (!$.Config.General.DebugRec) return;
    if ((($.DoNoDebugRec as number) | 0) > 0) return;
    // C4Playback::Check; DEBUGREC_START_FRAME is 0 (C4Include.h)
    if (replay && (($ as any).Control$2.pPlayback == null || ($.Game.FrameCounter | 0) < 0)) return;
    onChunk({ type, data: chunkBytes(type, pData, size) });
  };
}

export function stopDebugRec(): void {
  $.Config.General.DebugRec = 0;
  ($ as any).AddDbgRec = () => {};
}

/** the chunks of the original's external debug-record file, in order */
export function* readDbgRecFile(b: Uint8Array): Generator<DbgChunk> {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  for (let i = 0; i + 8 <= b.length;) {
    const type = dv.getInt32(i, true);
    const size = dv.getInt32(i + 4, true);
    yield { type, data: b.subarray(i + 8, i + 8 + size) };
    i += 8 + size;
  }
}

/** a chunk for a message: its type and what it says */
export function describe(c: DbgChunk): string {
  const d = c.data;
  const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
  const text = () => new TextDecoder('latin1').decode(d).replace(/\0[\s\S]*$/, '');
  const ints = () => Array.from({ length: d.length >> 2 }, (_, i) => dv.getInt32(i * 4, true)).join(',');
  switch (c.type) {
    case RCT.Block: case RCT.AulFunc: case RCT.Definition: return `${rctName(c.type)} ${text()}`;
    case RCT.DbgFrame: return `DbgFrame ${dv.getInt32(0, true)}`;
    case RCT.Random: return `Random #${dv.getInt32(0, true)} range ${dv.getUint32(4, true)} = ${dv.getUint32(8, true)}`;
    case RCT.CrObj: case RCT.DsObj:
      return `${rctName(c.type)} oei ${dv.getInt32(0, true)} ${new TextDecoder('latin1').decode(d.subarray(4, 37)).replace(/\0[\s\S]*$/, '')} at ${dv.getInt32(37, true)},${dv.getInt32(41, true)} owner ${dv.getInt32(45, true)}`;
    case RCT.Map: return `Map ${d.length} bytes`;
    default:
      return `${rctName(c.type)} [${d.length % 4 === 0 ? ints() : Array.from(d).join(' ')}]`;
  }
}

/**
 * Bytes of a chunk that the original leaves uninitialized, so that they hold whatever was on its stack: they are
 * not compared. C4Shape::Rotate records RCT_RotVtx2 from a C4RCRotVtx whose r it never sets (the compiler reuses
 * the RCT_RotVtx1 struct's place, so the original's record repeats that angle; the port's field is 0).
 */
const UNSET: Record<number, [number, number][]> = { [RCT.RotVtx2]: [[16, 20]] };

export function sameChunk(a: DbgChunk, b: DbgChunk): boolean {
  if (a.type !== b.type || a.data.length !== b.data.length) return false;
  const unset = UNSET[a.type];
  for (let i = 0; i < a.data.length; i++) {
    if (a.data[i] !== b.data[i] && !(unset && unset.some(([from, to]) => i >= from && i < to))) return false;
  }
  return true;
}

/** FNV-1a over a chunk (type, size, bytes), continuing from h */
export function hashChunk(c: DbgChunk, h = 0x811c9dc5): number {
  const step = (x: number) => { h = Math.imul(h ^ (x & 0xff), 0x01000193) >>> 0; };
  for (let k = 0; k < 4; k++) step(c.type >>> (8 * k));
  for (let k = 0; k < 4; k++) step(c.data.length >>> (8 * k));
  const unset = UNSET[c.type];
  for (let i = 0; i < c.data.length; i++) step(unset && unset.some(([from, to]) => i >= from && i < to) ? 0 : c.data[i]);
  return h;
}

/**
 * A short form of a debug record for a test fixture: the chunks in blocks, each block [chunks, hash]. Before the
 * first frame (loading and initialization) a block is BLOCK chunks; from the first RCT_DbgFrame on, a block is one
 * frame (it starts with its DbgFrame chunk).
 */
export const BLOCK = 1000;
export class BlockHasher {
  blocks: [number, string][] = [];
  private n = 0;
  private h = 0x811c9dc5;
  private framed = false;
  add(c: DbgChunk): void {
    if (c.type === RCT.DbgFrame) { this.flush(); this.framed = true; }
    this.h = hashChunk(c, this.h);
    this.n++;
    if (!this.framed && this.n === BLOCK) this.flush();
  }
  flush(): void {
    if (this.n) this.blocks.push([this.n, this.h.toString(16).padStart(8, '0')]);
    this.n = 0;
    this.h = 0x811c9dc5;
  }
}
