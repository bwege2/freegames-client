// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/packer.{h,cpp}, compression.cpp and engine/message.h of Teeworlds 0.7.5 in TypeScript.
import { str_sanitize, str_sanitize_cc, str_utf8_skip_whitespaces, strOf } from '../../base/system.ts';

// ---------------------------------------------------------------- CVariableInt (compression.cpp)

/** CVariableInt::Pack: writes i at dst[p], returns the new position. ESDDDDDD EDDDDDDD EDD... */
export function varintPack(dst: Uint8Array, p: number, i: number): number {
  i |= 0;
  let b = (i >> 25) & 0x40;
  i = i ^ (i >> 31);
  b |= i & 0x3F;
  i >>>= 6;
  if (i) {
    b |= 0x80;
    dst[p] = b;
    for (;;) {
      p++;
      let d = i & 0x7F;
      i >>>= 7;
      if (i) d |= 0x80;
      dst[p] = d;
      if (!i) break;
    }
  } else dst[p] = b;
  return p + 1;
}

/** CVariableInt::Unpack: out.v = the value, returns the new position (reads past the end as zeros) */
export function varintUnpack(src: Uint8Array, p: number, out: { v: number }): number {
  const at = (k: number): number => (k < src.length ? src[k] : 0);
  const sign = (at(p) >> 6) & 1;
  let v = at(p) & 0x3F;
  do {
    if (!(at(p) & 0x80)) break;
    p++;
    v |= (at(p) & 0x7F) << 6;
    if (!(at(p) & 0x80)) break;
    p++;
    v |= (at(p) & 0x7F) << (6 + 7);
    if (!(at(p) & 0x80)) break;
    p++;
    v |= (at(p) & 0x7F) << (6 + 7 + 7);
    if (!(at(p) & 0x80)) break;
    p++;
    v |= (at(p) & 0x7F) << (6 + 7 + 7 + 7);
  } while (false);
  p++;
  v ^= -sign;
  out.v = v | 0;
  return p;
}

/** CVariableInt::Compress over ints; -1 if dst is too small */
export function varintCompress(src: Int32Array, srcInts: number, dst: Uint8Array): number {
  let p = 0;
  for (let k = 0; k < srcInts; k++) {
    if (dst.length - p < 6) return -1;
    p = varintPack(dst, p, src[k]);
  }
  return p;
}

/** CVariableInt::Decompress: bytes of ints written to dst, or -1 */
export function varintDecompress(src: Uint8Array, off: number, size: number, dst: Int32Array): number {
  let p = off, n = 0;
  const end = off + size;
  const one = { v: 0 };
  while (p < end) {
    if (n >= dst.length) return -1;
    p = varintUnpack(src, p, one);
    dst[n++] = one.v;
  }
  return n * 4;
}

// ---------------------------------------------------------------- CPacker

export const PACKER_BUFFER_SIZE = 1024 * 2;

export class CPacker {
  readonly m_aBuffer = new Uint8Array(PACKER_BUFFER_SIZE + 8);
  m_pCurrent = 0;
  m_pEnd = PACKER_BUFFER_SIZE;
  m_Error = false;

  Reset(): void {
    this.m_Error = false;
    this.m_pCurrent = 0;
    this.m_pEnd = PACKER_BUFFER_SIZE;
  }

  AddInt(i: number): void {
    if (this.m_Error) return;
    if (this.m_pEnd - this.m_pCurrent < 6) this.m_Error = true;
    else this.m_pCurrent = varintPack(this.m_aBuffer, this.m_pCurrent, i);
  }

  /** a byte string ({@link system.ts}) */
  AddString(pStr: string, Limit: number): void {
    if (this.m_Error) return;
    let s = 0;
    if (Limit > 0) {
      while (s < pStr.length && pStr.charCodeAt(s) && Limit !== 0) {
        this.m_aBuffer[this.m_pCurrent++] = pStr.charCodeAt(s++);
        Limit--;
        if (this.m_pCurrent >= this.m_pEnd) {
          this.m_Error = true;
          break;
        }
      }
    } else {
      while (s < pStr.length && pStr.charCodeAt(s)) {
        this.m_aBuffer[this.m_pCurrent++] = pStr.charCodeAt(s++);
        if (this.m_pCurrent >= this.m_pEnd) {
          this.m_Error = true;
          break;
        }
      }
    }
    this.m_aBuffer[this.m_pCurrent++] = 0;
  }

  AddRaw(pData: Uint8Array, off: number, Size: number): void {
    if (this.m_Error) return;
    if (this.m_pCurrent + Size >= this.m_pEnd) {
      this.m_Error = true;
      return;
    }
    this.m_aBuffer.set(pData.subarray(off, off + Size), this.m_pCurrent);
    this.m_pCurrent += Size;
  }

  Size(): number { return this.m_pCurrent; }
  Data(): Uint8Array { return this.m_aBuffer.subarray(0, this.m_pCurrent); }
  Error(): boolean { return this.m_Error; }
}

/** CMsgPacker: starts with the message id and the system flag */
export class CMsgPacker extends CPacker {
  constructor(Type: number, System = false) {
    super();
    this.Reset();
    this.AddInt((Type << 1) | (System ? 1 : 0));
  }
}

// ---------------------------------------------------------------- CUnpacker

export const SANITIZE = 1, SANITIZE_CC = 2, SKIP_START_WHITESPACES = 4;

export class CUnpacker {
  private d: Uint8Array = new Uint8Array(0);
  private m_pCurrent = 0;
  private m_pEnd = 0;
  private m_Error = false;
  private readonly one = { v: 0 };

  Reset(data: Uint8Array, off = 0, size = data.length - off): void {
    this.m_Error = false;
    this.d = data;
    this.m_pCurrent = off;
    this.m_pEnd = off + size;
  }

  GetInt(): number {
    if (this.m_Error) return 0;
    if (this.m_pCurrent >= this.m_pEnd) {
      this.m_Error = true;
      return 0;
    }
    this.m_pCurrent = varintUnpack(this.d, this.m_pCurrent, this.one);
    if (this.m_pCurrent > this.m_pEnd) {
      this.m_Error = true;
      return 0;
    }
    return this.one.v;
  }

  GetIntOrDefault(Default: number): number {
    if (this.m_Error) return 0;
    if (this.m_pCurrent === this.m_pEnd) return Default;
    return this.GetInt();
  }

  /** a byte string; the bytes are sanitized in place, as the original does */
  GetString(SanitizeType = SANITIZE): string {
    if (this.m_Error || this.m_pCurrent >= this.m_pEnd) return '';
    const p = this.m_pCurrent;
    while (this.d[this.m_pCurrent]) {
      this.m_pCurrent++;
      if (this.m_pCurrent === this.m_pEnd) {
        this.m_Error = true;
        return '';
      }
    }
    let s = strOf(this.d, p, this.m_pCurrent - p);
    this.m_pCurrent++;
    if (SanitizeType & SANITIZE) s = str_sanitize(s);
    else if (SanitizeType & SANITIZE_CC) s = str_sanitize_cc(s);
    for (let i = 0; i < s.length; i++) this.d[p + i] = s.charCodeAt(i);
    return SanitizeType & SKIP_START_WHITESPACES ? str_utf8_skip_whitespaces(s) : s;
  }

  /** the bytes, or null */
  GetRaw(Size: number): Uint8Array | null {
    const p = this.m_pCurrent;
    if (this.m_Error) return null;
    if (Size < 0 || this.m_pCurrent + Size > this.m_pEnd) {
      this.m_Error = true;
      return null;
    }
    this.m_pCurrent += Size;
    return this.d.subarray(p, p + Size);
  }

  Error(): boolean { return this.m_Error; }
}
