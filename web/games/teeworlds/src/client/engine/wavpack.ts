// The tiny WavPack 4.40 decoder that Teeworlds 0.7.5 ships (src/engine/external/wavpack: bits.c, metadata.c,
// unpack.c, words.c, float.c, wputils.c), translated to TypeScript. The client decodes the original .wv sounds
// with it.
//
//                           **** WAVPACK ****
//                  Hybrid Lossless Wavefile Compressor
//              Copyright (c) 1998 - 2006 Conifer Software.
//                          All Rights Reserved.
//      Distributed under the BSD Software License (see license.txt)
//
// Redistribution and use in source and binary forms, with or without modification, are permitted provided that
// the following conditions are met: * Redistributions of source code must retain the above copyright notice, this
// list of conditions and the following disclaimer. * Redistributions in binary form must reproduce the above
// copyright notice, this list of conditions and the following disclaimer in the documentation and/or other
// materials provided with the distribution. * Neither the name of Conifer Software nor the names of its
// contributors may be used to endorse or promote products derived from this software without specific prior
// written permission. THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY EXPRESS
// OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A
// PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE REGENTS OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
// INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
// SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY
// THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING
// IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.

const BYTES_STORED = 3, MONO_FLAG = 4, HYBRID_FLAG = 8, JOINT_STEREO = 0x10, FLOAT_DATA = 0x80, INT32_DATA = 0x100,
  HYBRID_BITRATE = 0x200, HYBRID_BALANCE = 0x400, INITIAL_BLOCK = 0x800, FINAL_BLOCK = 0x1000;
const SHIFT_LSB = 13, SHIFT_MASK = 0x1f << SHIFT_LSB, MAG_LSB = 18, MAG_MASK = 0x1f << MAG_LSB, SRATE_LSB = 23, SRATE_MASK = 0xf << SRATE_LSB;
const FALSE_STEREO = 0x40000000;
const MONO_DATA = MONO_FLAG | FALSE_STEREO;
const MIN_STREAM_VERS = 0x402, MAX_STREAM_VERS = 0x410;
const ID_OPTIONAL_DATA = 0x20, ID_ODD_SIZE = 0x40, ID_LARGE = 0x80;
const ID_DUMMY = 0, ID_DECORR_TERMS = 2, ID_DECORR_WEIGHTS = 3, ID_DECORR_SAMPLES = 4, ID_ENTROPY_VARS = 5, ID_HYBRID_PROFILE = 6,
  ID_SHAPING_WEIGHTS = 7, ID_FLOAT_INFO = 8, ID_INT32_INFO = 9, ID_WV_BITSTREAM = 0xa, ID_WVC_BITSTREAM = 0xb, ID_WVX_BITSTREAM = 0xc,
  ID_CHANNEL_INFO = 0xd, ID_CONFIG_BLOCK = ID_OPTIONAL_DATA | 5;
const MAX_NTERMS = 16, MAX_TERM = 8;
const FLOAT_EXCEPTIONS = 0x20, FLOAT_ZEROS_SENT = 8, FLOAT_SHIFT_SENT = 4, FLOAT_SHIFT_SAME = 2;
const sample_rates = [6000, 8000, 9600, 11025, 12000, 16000, 22050, 24000, 32000, 44100, 48000, 64000, 88200, 96000, 192000];

const nbits_table = new Uint8Array(256);
for (let i = 1; i < 256; i++) nbits_table[i] = 32 - Math.clz32(i);
const log2_table = new Uint8Array([
  0x00, 0x01, 0x03, 0x04, 0x06, 0x07, 0x09, 0x0a, 0x0b, 0x0d, 0x0e, 0x10, 0x11, 0x12, 0x14, 0x15, 0x16, 0x18, 0x19, 0x1a, 0x1c, 0x1d, 0x1e, 0x20, 0x21, 0x22, 0x24, 0x25, 0x26, 0x28, 0x29, 0x2a,
  0x2c, 0x2d, 0x2e, 0x2f, 0x31, 0x32, 0x33, 0x34, 0x36, 0x37, 0x38, 0x39, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x41, 0x42, 0x43, 0x44, 0x45, 0x47, 0x48, 0x49, 0x4a, 0x4b, 0x4d, 0x4e, 0x4f, 0x50, 0x51,
  0x52, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5c, 0x5d, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x66, 0x67, 0x68, 0x69, 0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x74, 0x75,
  0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90, 0x91, 0x92, 0x93, 0x94, 0x95,
  0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9b, 0x9c, 0x9d, 0x9e, 0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa7, 0xa8, 0xa9, 0xa9, 0xaa, 0xab, 0xac, 0xad, 0xae, 0xaf, 0xb0, 0xb1, 0xb2, 0xb2,
  0xb3, 0xb4, 0xb5, 0xb6, 0xb7, 0xb8, 0xb9, 0xb9, 0xba, 0xbb, 0xbc, 0xbd, 0xbe, 0xbf, 0xc0, 0xc0, 0xc1, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc6, 0xc7, 0xc8, 0xc9, 0xca, 0xcb, 0xcb, 0xcc, 0xcd, 0xce,
  0xcf, 0xd0, 0xd0, 0xd1, 0xd2, 0xd3, 0xd4, 0xd4, 0xd5, 0xd6, 0xd7, 0xd8, 0xd8, 0xd9, 0xda, 0xdb, 0xdc, 0xdc, 0xdd, 0xde, 0xdf, 0xe0, 0xe0, 0xe1, 0xe2, 0xe3, 0xe4, 0xe4, 0xe5, 0xe6, 0xe7, 0xe7,
  0xe8, 0xe9, 0xea, 0xea, 0xeb, 0xec, 0xed, 0xee, 0xee, 0xef, 0xf0, 0xf1, 0xf1, 0xf2, 0xf3, 0xf4, 0xf4, 0xf5, 0xf6, 0xf7, 0xf7, 0xf8, 0xf9, 0xf9, 0xfa, 0xfb, 0xfc, 0xfc, 0xfd, 0xfe, 0xff, 0xff]);
const exp2_table = new Uint8Array([
  0x00, 0x01, 0x01, 0x02, 0x03, 0x03, 0x04, 0x05, 0x06, 0x06, 0x07, 0x08, 0x08, 0x09, 0x0a, 0x0b, 0x0b, 0x0c, 0x0d, 0x0e, 0x0e, 0x0f, 0x10, 0x10, 0x11, 0x12, 0x13, 0x13, 0x14, 0x15, 0x16, 0x16,
  0x17, 0x18, 0x19, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1d, 0x1e, 0x1f, 0x20, 0x20, 0x21, 0x22, 0x23, 0x24, 0x24, 0x25, 0x26, 0x27, 0x28, 0x28, 0x29, 0x2a, 0x2b, 0x2c, 0x2c, 0x2d, 0x2e, 0x2f, 0x30,
  0x30, 0x31, 0x32, 0x33, 0x34, 0x35, 0x35, 0x36, 0x37, 0x38, 0x39, 0x3a, 0x3a, 0x3b, 0x3c, 0x3d, 0x3e, 0x3f, 0x40, 0x41, 0x41, 0x42, 0x43, 0x44, 0x45, 0x46, 0x47, 0x48, 0x48, 0x49, 0x4a, 0x4b,
  0x4c, 0x4d, 0x4e, 0x4f, 0x50, 0x51, 0x51, 0x52, 0x53, 0x54, 0x55, 0x56, 0x57, 0x58, 0x59, 0x5a, 0x5b, 0x5c, 0x5d, 0x5e, 0x5e, 0x5f, 0x60, 0x61, 0x62, 0x63, 0x64, 0x65, 0x66, 0x67, 0x68, 0x69,
  0x6a, 0x6b, 0x6c, 0x6d, 0x6e, 0x6f, 0x70, 0x71, 0x72, 0x73, 0x74, 0x75, 0x76, 0x77, 0x78, 0x79, 0x7a, 0x7b, 0x7c, 0x7d, 0x7e, 0x7f, 0x80, 0x81, 0x82, 0x83, 0x84, 0x85, 0x87, 0x88, 0x89, 0x8a,
  0x8b, 0x8c, 0x8d, 0x8e, 0x8f, 0x90, 0x91, 0x92, 0x93, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9d, 0x9f, 0xa0, 0xa1, 0xa2, 0xa3, 0xa4, 0xa5, 0xa6, 0xa8, 0xa9, 0xaa, 0xab, 0xac, 0xad,
  0xaf, 0xb0, 0xb1, 0xb2, 0xb3, 0xb4, 0xb6, 0xb7, 0xb8, 0xb9, 0xba, 0xbc, 0xbd, 0xbe, 0xbf, 0xc0, 0xc2, 0xc3, 0xc4, 0xc5, 0xc6, 0xc8, 0xc9, 0xca, 0xcb, 0xcd, 0xce, 0xcf, 0xd0, 0xd2, 0xd3, 0xd4,
  0xd6, 0xd7, 0xd8, 0xd9, 0xdb, 0xdc, 0xdd, 0xde, 0xe0, 0xe1, 0xe2, 0xe4, 0xe5, 0xe6, 0xe8, 0xe9, 0xea, 0xec, 0xed, 0xee, 0xf0, 0xf1, 0xf2, 0xf4, 0xf5, 0xf6, 0xf8, 0xf9, 0xfa, 0xfc, 0xfd, 0xff]);
const ones_count_table = new Uint8Array(256);
for (let i = 0; i < 256; i++) {
  let n = 0;
  while ((i >> n) & 1) n++;
  ones_count_table[i] = n;
}

const LIMIT_ONES = 16, SLS = 8, SLO = 1 << (SLS - 1), DIV0 = 128, DIV1 = 64, DIV2 = 32;

function count_bits(av: number): number {
  av >>>= 0;
  if (av < 1 << 8) return nbits_table[av];
  if (av < 1 << 16) return nbits_table[av >>> 8] + 8;
  if (av < 1 << 24) return nbits_table[av >>> 16] + 16;
  return nbits_table[av >>> 24] + 24;
}

function exp2s(log: number): number {
  if (log < 0) return -exp2s(-log) | 0;
  const value = exp2_table[log & 0xff] | 0x100;
  log >>= 8;
  if (log <= 9) return value >>> (9 - log);
  return (value << (log - 9)) | 0;
}

function mylog2(avalue: number): number {
  avalue = (avalue + (avalue >>> 9)) >>> 0;
  let dbits: number;
  if (avalue < 1 << 8) {
    dbits = nbits_table[avalue];
    return (dbits << 8) + log2_table[(avalue << (9 - dbits)) & 0xff];
  }
  if (avalue < 1 << 16) dbits = nbits_table[avalue >>> 8] + 8;
  else if (avalue < 1 << 24) dbits = nbits_table[avalue >>> 16] + 16;
  else dbits = nbits_table[avalue >>> 24] + 24;
  return (dbits << 8) + log2_table[(avalue >>> (dbits - 9)) & 0xff];
}

function restore_weight(weight: number): number {
  let result = (weight << 24 >> 24) << 3;
  if (result > 0) result += (result + 64) >> 7;
  return result;
}

const s16 = (v: number): number => (v << 16) >> 16;

/** (weight * sample + 512) >> 10 in 32-bit C ints, or the split form for samples outside 16 bits */
function apply_weight(weight: number, sample: number): number {
  if (sample !== s16(sample)) {
    // (((sample & 0xffffL) * weight) >> 9) + (((sample & ~0xffffL) >> 9) * weight) + 1) >> 1 (long is 64-bit)
    const lo = Math.floor(((sample & 0xffff) * weight) / 512);
    const hi = Math.floor((sample - (sample & 0xffff)) / 512) * weight;
    return Number((BigInt(lo) + BigInt(hi) + 1n) >> 1n) | 0;
  }
  return (Math.imul(weight, sample) + 512) >> 10;
}

class Bitstream {
  buf: Uint8Array = new Uint8Array(0);
  ptr = -1;
  end = 0;
  sr = 0;
  bc = 0;
  error = 0;
  open = false;
  openRead(buf: Uint8Array): void {
    this.buf = buf;
    this.end = buf.length;
    this.ptr = -1;
    this.sr = 0;
    this.bc = 0;
    this.error = 0;
    this.open = true;
  }
  /** bs_read without a file: the buffer is filled with 0xff and read again */
  wrap(): void {
    this.error = 1;
    this.buf = new Uint8Array(this.buf.length || 1).fill(0xff);
    this.end = this.buf.length;
    this.ptr = 0;
  }
  getbit(): number {
    if (this.bc) {
      this.bc--;
    } else {
      if (++this.ptr === this.end) this.wrap();
      this.bc = 7;
      this.sr = this.buf[this.ptr];
    }
    const b = this.sr & 1;
    this.sr >>>= 1;
    return b;
  }
  getbits(nbits: number): number {
    while (nbits > this.bc) {
      if (++this.ptr === this.end) this.wrap();
      this.sr = (this.sr | (this.buf[this.ptr] << this.bc)) >>> 0;
      this.bc += 8;
    }
    const value = this.sr >>> 0;
    if (this.bc > 32) {
      this.bc -= nbits;
      this.sr = this.buf[this.ptr] >>> (8 - this.bc);
    } else {
      this.bc -= nbits;
      this.sr = nbits >= 32 ? 0 : this.sr >>> nbits;
    }
    return value;
  }
}

interface DecorrPass { term: number; delta: number; weight_A: number; weight_B: number; samples_A: Int32Array; samples_B: Int32Array }
interface Entropy { median: Uint32Array; slow_level: number; error_limit: number }

export interface WavpackResult { samples: Int32Array; numSamples: number; channels: number; rate: number; bitsPerSample: number }

/** decodes a whole .wv file (WavpackOpenFileInput + WavpackUnpackSamples, as the client's LoadWV uses them) */
export class WavpackDecoder {
  private file: Uint8Array;
  private pos = 0;
  // header
  private hdr = { version: 0, total_samples: 0, block_index: 0, block_samples: 0, flags: 0, crc: 0 };
  private wvbits = new Bitstream();
  private passes: DecorrPass[] = [];
  private num_terms = 0;
  private mute_error = false;
  private sample_index = 0;
  private crc = 0;
  private int32_sent_bits = 0;
  private int32_zeros = 0;
  private int32_ones = 0;
  private int32_dups = 0;
  private float_flags = 0;
  private float_shift = 0;
  private float_max_exp = 0;
  private float_norm_exp = 0;
  private w = { bitrate_delta: new Uint32Array(2), bitrate_acc: new Uint32Array(2), holding_one: 0, zeros_acc: 0, holding_zero: 0, c: [] as Entropy[] };
  config = { bits_per_sample: 0, bytes_per_sample: 0, num_channels: 0, flags: 0, sample_rate: 0, channel_mask: 0 };
  total_samples = 0xffffffff;
  crc_errors = 0;
  reduced_channels = 0;
  lossy_blocks = false;
  error = '';

  constructor(file: Uint8Array) {
    this.file = file;
    for (let i = 0; i < MAX_NTERMS; i++) this.passes.push({ term: 0, delta: 0, weight_A: 0, weight_B: 0, samples_A: new Int32Array(MAX_TERM), samples_B: new Int32Array(MAX_TERM) });
    this.clearWords();
  }

  private clearWords(): void {
    this.w = { bitrate_delta: new Uint32Array(2), bitrate_acc: new Uint32Array(2), holding_one: 0, zeros_acc: 0, holding_zero: 0, c: [
      { median: new Uint32Array(3), slow_level: 0, error_limit: 0 }, { median: new Uint32Array(3), slow_level: 0, error_limit: 0 }] };
  }

  private infile(n: number): Uint8Array | null {
    if (this.pos + n > this.file.length) {
      this.pos = this.file.length;
      return null;
    }
    const r = this.file.subarray(this.pos, this.pos + n);
    this.pos += n;
    return r;
  }

  /** read_next_header: false at the end */
  private read_next_header(): boolean {
    const size = 32;
    let buffer = new Uint8Array(size);
    let sp = size, ep = size;
    let skipped = 0;
    for (;;) {
      let bleft = 0;
      if (sp < ep) {
        bleft = ep - sp;
        buffer.copyWithin(0, sp, ep);
      }
      const need = size - bleft;
      const d = this.infile(need);
      if (!d) return false;
      buffer.set(d, bleft);
      sp = 0;
      const b = buffer;
      if (b[0] === 0x77 && b[1] === 0x76 && b[2] === 0x70 && b[3] === 0x6b && !(b[4] & 1) && b[6] < 16 && !b[7] && b[9] === 4 &&
        b[8] >= (MIN_STREAM_VERS & 0xff) && b[8] <= (MAX_STREAM_VERS & 0xff)) {
        const dv = new DataView(b.buffer, b.byteOffset, 32);
        this.hdr = { version: dv.getInt16(8, true), total_samples: dv.getUint32(12, true), block_index: dv.getUint32(16, true),
          block_samples: dv.getUint32(20, true), flags: dv.getUint32(24, true), crc: dv.getUint32(28, true) };
        return true;
      }
      sp = 1;
      while (sp < ep && b[sp] !== 0x77) sp++;
      skipped += sp;
      if (skipped > 1048576) return false;
      buffer = b;
    }
  }

  private unpack_init(): boolean {
    if (this.hdr.block_samples && this.hdr.block_index !== 0xffffffff) this.sample_index = this.hdr.block_index;
    this.mute_error = false;
    this.crc = 0xffffffff;
    this.wvbits = new Bitstream();
    for (const p of this.passes) {
      p.term = p.delta = p.weight_A = p.weight_B = 0;
      p.samples_A.fill(0);
      p.samples_B.fill(0);
    }
    this.clearWords();
    for (;;) {
      const md = this.read_metadata_buff();
      if (!md) break;
      if (!this.process_metadata(md)) {
        this.error = 'invalid metadata!';
        return false;
      }
      if (md.id === ID_WV_BITSTREAM) break;
    }
    if (this.hdr.block_samples && !this.wvbits.open) {
      this.error = 'invalid WavPack file!';
      return false;
    }
    if (this.hdr.block_samples) {
      if (this.hdr.flags & INT32_DATA && this.int32_sent_bits) this.lossy_blocks = true;
      if (this.hdr.flags & FLOAT_DATA && this.float_flags & (FLOAT_EXCEPTIONS | FLOAT_ZEROS_SENT | FLOAT_SHIFT_SENT | FLOAT_SHIFT_SAME)) this.lossy_blocks = true;
    }
    return true;
  }

  private read_metadata_buff(): { id: number; len: number; data: Uint8Array | null } | null {
    const a = this.infile(2);
    if (!a) return null;
    let id = a[0];
    let len = a[1] << 1;
    if (id & ID_LARGE) {
      id &= ~ID_LARGE;
      const b = this.infile(1);
      if (!b) return null;
      len += b[0] << 9;
      const c = this.infile(1);
      if (!c) return null;
      len += c[0] << 17;
    }
    if (id & ID_ODD_SIZE) {
      id &= ~ID_ODD_SIZE;
      len--;
    }
    if (len && len <= 1024) {
      const n = len + (len & 1);
      const d = this.infile(n);
      if (!d) return null;
      return { id, len, data: d.subarray(0, len) };
    }
    return { id, len, data: null };
  }

  private process_metadata(md: { id: number; len: number; data: Uint8Array | null }): boolean {
    switch (md.id) {
      case ID_DUMMY: return true;
      case ID_DECORR_TERMS: return this.read_decorr_terms(md);
      case ID_DECORR_WEIGHTS: return this.read_decorr_weights(md);
      case ID_DECORR_SAMPLES: return this.read_decorr_samples(md);
      case ID_ENTROPY_VARS: return this.read_entropy_vars(md);
      case ID_HYBRID_PROFILE: return this.read_hybrid_profile(md);
      case ID_FLOAT_INFO: {
        if (md.len !== 4) return false;
        const d = md.data!;
        this.float_flags = d[0];
        this.float_shift = d[1];
        this.float_max_exp = d[2];
        this.float_norm_exp = d[3];
        return true;
      }
      case ID_INT32_INFO: {
        if (md.len !== 4) return false;
        const d = md.data!;
        this.int32_sent_bits = d[0];
        this.int32_zeros = d[1];
        this.int32_ones = d[2];
        this.int32_dups = d[3];
        return true;
      }
      case ID_CHANNEL_INFO: {
        let bytecnt = md.len, shift = 0, p = 0;
        if (!bytecnt || bytecnt > 5) return false;
        const d = md.data!;
        this.config.num_channels = (d[p++] << 24) >> 24;
        let mask = 0;
        while (--bytecnt) {
          mask |= ((d[p++] << 24) >> 24) << shift;
          shift += 8;
        }
        this.config.channel_mask = mask >>> 0;
        return true;
      }
      case ID_CONFIG_BLOCK: {
        if (md.len >= 3) {
          const d = md.data!;
          this.config.flags &= 0xff;
          this.config.flags |= d[0] << 8;
          this.config.flags |= d[1] << 16;
          this.config.flags |= d[2] << 24;
        }
        return true;
      }
      case ID_WV_BITSTREAM: {
        if (md.data) this.wvbits.openRead(md.data);
        else if (md.len) {
          // the bitstream is read from the file (bs_read): what follows the metadata header
          const n = md.len + (md.len & 1);
          const start = this.pos;
          const end = Math.min(this.file.length, start + n);
          this.wvbits.openRead(this.file.subarray(start, end));
          this.pos = end;
        }
        return true;
      }
      case ID_SHAPING_WEIGHTS: case ID_WVC_BITSTREAM: case ID_WVX_BITSTREAM: return true;
      default: return (md.id & ID_OPTIONAL_DATA) !== 0;
    }
  }

  private read_decorr_terms(md: { len: number; data: Uint8Array | null }): boolean {
    let termcnt = md.len;
    const d = md.data!;
    if (termcnt > MAX_NTERMS) return false;
    this.num_terms = termcnt;
    let p = 0;
    for (let i = termcnt - 1; termcnt--; i--) {
      const dpp = this.passes[i];
      dpp.term = (d[p] & 0x1f) - 5;
      dpp.delta = (d[p++] >> 5) & 0x7;
      if (!dpp.term || dpp.term < -3 || (dpp.term > MAX_TERM && dpp.term < 17) || dpp.term > 18) return false;
    }
    return true;
  }

  private read_decorr_weights(md: { len: number; data: Uint8Array | null }): boolean {
    let termcnt = md.len;
    const d = md.data;
    const mono = this.hdr.flags & MONO_DATA;
    if (!mono) termcnt = Math.trunc(termcnt / 2);
    if (termcnt > this.num_terms) return false;
    for (let i = 0; i < this.num_terms; i++) this.passes[i].weight_A = this.passes[i].weight_B = 0;
    let i = this.num_terms;
    let p = 0;
    while (--i >= 0 && termcnt--) {
      this.passes[i].weight_A = restore_weight(d![p++]);
      if (!mono) this.passes[i].weight_B = restore_weight(d![p++]);
    }
    return true;
  }

  private read_decorr_samples(md: { len: number; data: Uint8Array | null }): boolean {
    const d = md.data ?? new Uint8Array(0);
    let p = 0;
    const end = md.len;
    const mono = this.hdr.flags & MONO_DATA;
    for (let i = 0; i < this.num_terms; i++) {
      this.passes[i].samples_A.fill(0);
      this.passes[i].samples_B.fill(0);
    }
    if (this.hdr.version === 0x402 && this.hdr.flags & HYBRID_FLAG) {
      p += 2;
      if (!mono) p += 2;
    }
    const rd = (): number => {
      const v = exp2s(s16(d[p] + (d[p + 1] << 8)));
      p += 2;
      return v;
    };
    let i = this.num_terms;
    while (i-- > 0 && p < end) {
      const dpp = this.passes[i];
      if (dpp.term > MAX_TERM) {
        dpp.samples_A[0] = rd();
        dpp.samples_A[1] = rd();
        if (!mono) {
          dpp.samples_B[0] = rd();
          dpp.samples_B[1] = rd();
        }
      } else if (dpp.term < 0) {
        dpp.samples_A[0] = rd();
        dpp.samples_B[0] = rd();
      } else {
        for (let m = 0; m < dpp.term; m++) {
          dpp.samples_A[m] = rd();
          if (!mono) dpp.samples_B[m] = rd();
        }
      }
    }
    return p === end;
  }

  private read_entropy_vars(md: { len: number; data: Uint8Array | null }): boolean {
    const d = md.data!;
    const mono = this.hdr.flags & MONO_DATA;
    if (md.len !== (mono ? 6 : 12)) return false;
    const c = this.w.c;
    c[0].median[0] = exp2s(d[0] + (d[1] << 8));
    c[0].median[1] = exp2s(d[2] + (d[3] << 8));
    c[0].median[2] = exp2s(d[4] + (d[5] << 8));
    if (!mono) {
      c[1].median[0] = exp2s(d[6] + (d[7] << 8));
      c[1].median[1] = exp2s(d[8] + (d[9] << 8));
      c[1].median[2] = exp2s(d[10] + (d[11] << 8));
    }
    return true;
  }

  private read_hybrid_profile(md: { len: number; data: Uint8Array | null }): boolean {
    const d = md.data!;
    let p = 0;
    const end = md.len;
    const mono = this.hdr.flags & MONO_DATA;
    const w = this.w;
    if (this.hdr.flags & HYBRID_BITRATE) {
      w.c[0].slow_level = exp2s(d[p] + (d[p + 1] << 8)) >>> 0;
      p += 2;
      if (!mono) {
        w.c[1].slow_level = exp2s(d[p] + (d[p + 1] << 8)) >>> 0;
        p += 2;
      }
    }
    w.bitrate_acc[0] = (d[p] + (d[p + 1] << 8)) << 16;
    p += 2;
    if (!mono) {
      w.bitrate_acc[1] = (d[p] + (d[p + 1] << 8)) << 16;
      p += 2;
    }
    if (p < end) {
      w.bitrate_delta[0] = exp2s(s16(d[p] + (d[p + 1] << 8)));
      p += 2;
      if (!mono) {
        w.bitrate_delta[1] = exp2s(s16(d[p] + (d[p + 1] << 8)));
        p += 2;
      }
      if (p < end) return false;
    } else w.bitrate_delta[0] = w.bitrate_delta[1] = 0;
    return true;
  }

  private update_error_limit(flags: number): void {
    const w = this.w;
    w.bitrate_acc[0] += w.bitrate_delta[0];
    let bitrate_0 = (w.bitrate_acc[0] | 0) >> 16;
    if (flags & MONO_DATA) {
      if (flags & HYBRID_BITRATE) {
        const slow_log_0 = (w.c[0].slow_level + SLO) >>> SLS;
        w.c[0].error_limit = slow_log_0 - bitrate_0 > -0x100 ? exp2s(slow_log_0 - bitrate_0 + 0x100) >>> 0 : 0;
      } else w.c[0].error_limit = exp2s(bitrate_0) >>> 0;
    } else {
      w.bitrate_acc[1] += w.bitrate_delta[1];
      let bitrate_1 = (w.bitrate_acc[1] | 0) >> 16;
      if (flags & HYBRID_BITRATE) {
        const slow_log_0 = (w.c[0].slow_level + SLO) >>> SLS;
        const slow_log_1 = (w.c[1].slow_level + SLO) >>> SLS;
        if (flags & HYBRID_BALANCE) {
          const balance = (slow_log_1 - slow_log_0 + bitrate_1 + 1) >> 1;
          if (balance > bitrate_0) {
            bitrate_1 = bitrate_0 * 2;
            bitrate_0 = 0;
          } else if (-balance > bitrate_0) {
            bitrate_0 = bitrate_0 * 2;
            bitrate_1 = 0;
          } else {
            bitrate_1 = bitrate_0 + balance;
            bitrate_0 = bitrate_0 - balance;
          }
        }
        w.c[0].error_limit = slow_log_0 - bitrate_0 > -0x100 ? exp2s(slow_log_0 - bitrate_0 + 0x100) >>> 0 : 0;
        w.c[1].error_limit = slow_log_1 - bitrate_1 > -0x100 ? exp2s(slow_log_1 - bitrate_1 + 0x100) >>> 0 : 0;
      } else {
        w.c[0].error_limit = exp2s(bitrate_0) >>> 0;
        w.c[1].error_limit = exp2s(bitrate_1) >>> 0;
      }
    }
  }

  private read_code(maxcode: number): number {
    const bs = this.wvbits;
    const bitcount = count_bits(maxcode);
    const extras = (2 ** bitcount - maxcode - 1) >>> 0;
    if (!bitcount) return 0;
    let code = bs.getbits(bitcount - 1);
    code = (code & ((2 ** (bitcount - 1)) - 1)) >>> 0;
    if (code >= extras) {
      code = ((code << 1) - extras) >>> 0;
      if (bs.getbit()) ++code;
    }
    return code >>> 0;
  }

  private get_words(buffer: Int32Array, off: number, nsamples: number, flags: number): number {
    const w = this.w, bs = this.wvbits;
    let c = w.c[0];
    if (!(flags & MONO_DATA)) nsamples *= 2;
    let csamples;
    let b = off;
    const GET_MED = (med: number): number => ((c.median[med] >>> 4) + 1) >>> 0;
    for (csamples = 0; csamples < nsamples; ++csamples) {
      let ones_count: number, low: number, mid: number, high: number;
      if (!(flags & MONO_DATA)) c = w.c[csamples & 1];
      if (!(w.c[0].median[0] & ~1) && !w.holding_zero && !w.holding_one && !(w.c[1].median[0] & ~1)) {
        if (w.zeros_acc) {
          if (--w.zeros_acc) {
            c.slow_level = (c.slow_level - ((c.slow_level + SLO) >>> SLS)) >>> 0;
            buffer[b++] = 0;
            continue;
          }
        } else {
          let cbits;
          for (cbits = 0; cbits < 33 && bs.getbit(); ++cbits);
          if (cbits === 33) break;
          if (cbits < 2) w.zeros_acc = cbits;
          else {
            let mask;
            for (mask = 1, w.zeros_acc = 0; --cbits; mask = (mask << 1) >>> 0) if (bs.getbit()) w.zeros_acc = (w.zeros_acc | mask) >>> 0;
            w.zeros_acc = (w.zeros_acc | mask) >>> 0;
          }
          if (w.zeros_acc) {
            c.slow_level = (c.slow_level - ((c.slow_level + SLO) >>> SLS)) >>> 0;
            w.c[0].median.fill(0);
            w.c[1].median.fill(0);
            buffer[b++] = 0;
            continue;
          }
        }
      }
      if (w.holding_zero) ones_count = w.holding_zero = 0;
      else {
        let next8: number;
        if (bs.bc < 8) {
          if (++bs.ptr === bs.end) bs.wrap();
          bs.sr = (bs.sr | (bs.buf[bs.ptr] << bs.bc)) >>> 0;
          next8 = bs.sr & 0xff;
          bs.bc += 8;
        } else next8 = bs.sr & 0xff;
        if (next8 === 0xff) {
          bs.bc -= 8;
          bs.sr >>>= 8;
          for (ones_count = 8; ones_count < LIMIT_ONES + 1 && bs.getbit(); ++ones_count);
          if (ones_count === LIMIT_ONES + 1) break;
          if (ones_count === LIMIT_ONES) {
            let cbits;
            for (cbits = 0; cbits < 33 && bs.getbit(); ++cbits);
            if (cbits === 33) break;
            if (cbits < 2) ones_count = cbits;
            else {
              let mask;
              for (mask = 1, ones_count = 0; --cbits; mask = (mask << 1) >>> 0) if (bs.getbit()) ones_count = (ones_count | mask) >>> 0;
              ones_count = (ones_count | mask) >>> 0;
            }
            ones_count += LIMIT_ONES;
          }
        } else {
          ones_count = ones_count_table[next8];
          bs.bc -= ones_count + 1;
          bs.sr >>>= ones_count + 1;
        }
        if (w.holding_one) {
          w.holding_one = ones_count & 1;
          ones_count = (ones_count >>> 1) + 1;
        } else {
          w.holding_one = ones_count & 1;
          ones_count >>>= 1;
        }
        w.holding_zero = ~w.holding_one & 1;
      }
      if (flags & HYBRID_FLAG && (flags & MONO_DATA || !(csamples & 1))) this.update_error_limit(flags);
      const med = c.median;
      if (ones_count === 0) {
        low = 0;
        high = GET_MED(0) - 1;
        med[0] -= Math.floor((med[0] + (DIV0 - 2)) / DIV0) * 2;
      } else {
        low = GET_MED(0);
        med[0] += Math.floor((med[0] + DIV0) / DIV0) * 5;
        if (ones_count === 1) {
          high = low + GET_MED(1) - 1;
          med[1] -= Math.floor((med[1] + (DIV1 - 2)) / DIV1) * 2;
        } else {
          low += GET_MED(1);
          med[1] += Math.floor((med[1] + DIV1) / DIV1) * 5;
          if (ones_count === 2) {
            high = low + GET_MED(2) - 1;
            med[2] -= Math.floor((med[2] + (DIV2 - 2)) / DIV2) * 2;
          } else {
            low += (ones_count - 2) * GET_MED(2);
            high = low + GET_MED(2) - 1;
            med[2] += Math.floor((med[2] + DIV2) / DIV2) * 5;
          }
        }
      }
      low >>>= 0;
      high >>>= 0;
      mid = Math.floor((high + low + 1) / 2) >>> 0;
      if (!c.error_limit) mid = (this.read_code((high - low) >>> 0) + low) >>> 0;
      else {
        while (((high - low) >>> 0) > c.error_limit) {
          if (bs.getbit()) {
            low = mid;
            mid = Math.floor((high + low + 1) / 2) >>> 0;
          } else {
            high = (mid - 1) >>> 0;
            mid = Math.floor((high + low + 1) / 2) >>> 0;
          }
        }
      }
      buffer[b++] = bs.getbit() ? ~mid : mid;
      if (flags & HYBRID_BITRATE) c.slow_level = (c.slow_level - ((c.slow_level + SLO) >>> SLS) + mylog2(mid)) >>> 0;
    }
    return flags & MONO_DATA ? csamples : csamples >> 1;
  }

  private update_weight(weight: number, delta: number, source: number, result: number): number {
    if (source && result) return (weight + Math.imul(((source ^ result) >> 30) | 1, delta)) | 0;
    return weight;
  }

  private update_weight_clip(weight: number, delta: number, source: number, result: number): number {
    if (source && result) {
      if ((source ^ result) < 0) {
        weight -= delta;
        if (weight < -1024) weight = -1024;
      } else {
        weight += delta;
        if (weight > 1024) weight = 1024;
      }
    }
    return weight;
  }

  private decorr_stereo_pass(dpp: DecorrPass, buf: Int32Array, o: number, count: number): void {
    const delta = dpp.delta;
    let wA = dpp.weight_A, wB = dpp.weight_B;
    const end = o + count * 2;
    const A = dpp.samples_A, B = dpp.samples_B;
    let sam_A: number, sam_B: number;
    switch (dpp.term) {
      case 17:
        for (let p = o; p < end; p += 2) {
          sam_A = (2 * A[0] - A[1]) | 0;
          A[1] = A[0];
          A[0] = (apply_weight(wA, sam_A) + buf[p]) | 0;
          wA = this.update_weight(wA, delta, sam_A, buf[p]);
          buf[p] = A[0];
          sam_A = (2 * B[0] - B[1]) | 0;
          B[1] = B[0];
          B[0] = (apply_weight(wB, sam_A) + buf[p + 1]) | 0;
          wB = this.update_weight(wB, delta, sam_A, buf[p + 1]);
          buf[p + 1] = B[0];
        }
        break;
      case 18:
        for (let p = o; p < end; p += 2) {
          sam_A = ((3 * A[0] - A[1]) | 0) >> 1;
          A[1] = A[0];
          A[0] = (apply_weight(wA, sam_A) + buf[p]) | 0;
          wA = this.update_weight(wA, delta, sam_A, buf[p]);
          buf[p] = A[0];
          sam_A = ((3 * B[0] - B[1]) | 0) >> 1;
          B[1] = B[0];
          B[0] = (apply_weight(wB, sam_A) + buf[p + 1]) | 0;
          wB = this.update_weight(wB, delta, sam_A, buf[p + 1]);
          buf[p + 1] = B[0];
        }
        break;
      default:
        if (dpp.term > 0) {
          let m = 0, k = dpp.term & (MAX_TERM - 1);
          for (let p = o; p < end; p += 2) {
            sam_A = A[m];
            A[k] = (apply_weight(wA, sam_A) + buf[p]) | 0;
            wA = this.update_weight(wA, delta, sam_A, buf[p]);
            buf[p] = A[k];
            sam_A = B[m];
            B[k] = (apply_weight(wB, sam_A) + buf[p + 1]) | 0;
            wB = this.update_weight(wB, delta, sam_A, buf[p + 1]);
            buf[p + 1] = B[k];
            m = (m + 1) & (MAX_TERM - 1);
            k = (k + 1) & (MAX_TERM - 1);
          }
          if (m) {
            let t = A.slice();
            for (k = 0; k < MAX_TERM; k++, m++) A[k] = t[m & (MAX_TERM - 1)];
            t = B.slice();
            for (k = 0; k < MAX_TERM; k++, m++) B[k] = t[m & (MAX_TERM - 1)];
          }
        } else if (dpp.term === -1) {
          for (let p = o; p < end; p += 2) {
            sam_A = (buf[p] + apply_weight(wA, A[0])) | 0;
            wA = this.update_weight_clip(wA, delta, A[0], buf[p]);
            buf[p] = sam_A;
            A[0] = (buf[p + 1] + apply_weight(wB, sam_A)) | 0;
            wB = this.update_weight_clip(wB, delta, sam_A, buf[p + 1]);
            buf[p + 1] = A[0];
          }
        } else if (dpp.term === -2) {
          for (let p = o; p < end; p += 2) {
            sam_B = (buf[p + 1] + apply_weight(wB, B[0])) | 0;
            wB = this.update_weight_clip(wB, delta, B[0], buf[p + 1]);
            buf[p + 1] = sam_B;
            B[0] = (buf[p] + apply_weight(wA, sam_B)) | 0;
            wA = this.update_weight_clip(wA, delta, sam_B, buf[p]);
            buf[p] = B[0];
          }
        } else if (dpp.term === -3) {
          for (let p = o; p < end; p += 2) {
            sam_A = (buf[p] + apply_weight(wA, A[0])) | 0;
            wA = this.update_weight_clip(wA, delta, A[0], buf[p]);
            sam_B = (buf[p + 1] + apply_weight(wB, B[0])) | 0;
            wB = this.update_weight_clip(wB, delta, B[0], buf[p + 1]);
            buf[p] = B[0] = sam_A;
            buf[p + 1] = A[0] = sam_B;
          }
        }
        break;
    }
    dpp.weight_A = wA;
    dpp.weight_B = wB;
  }

  private decorr_stereo_pass_cont(dpp: DecorrPass, buf: Int32Array, o: number, count: number): void {
    const delta = dpp.delta;
    let wA = dpp.weight_A, wB = dpp.weight_B;
    const end = o + count * 2;
    const A = dpp.samples_A, B = dpp.samples_B;
    let sam_A: number, sam_B: number;
    let p = o;
    switch (dpp.term) {
      case 17:
        for (p = o; p < end; p += 2) {
          sam_A = (2 * buf[p - 2] - buf[p - 4]) | 0;
          sam_B = buf[p];
          buf[p] = (apply_weight(wA, sam_A) + sam_B) | 0;
          wA = this.update_weight(wA, delta, sam_A, sam_B);
          sam_A = (2 * buf[p - 1] - buf[p - 3]) | 0;
          sam_B = buf[p + 1];
          buf[p + 1] = (apply_weight(wB, sam_A) + sam_B) | 0;
          wB = this.update_weight(wB, delta, sam_A, sam_B);
        }
        B[0] = buf[p - 1]; A[0] = buf[p - 2]; B[1] = buf[p - 3]; A[1] = buf[p - 4];
        break;
      case 18:
        for (p = o; p < end; p += 2) {
          sam_A = ((3 * buf[p - 2] - buf[p - 4]) | 0) >> 1;
          sam_B = buf[p];
          buf[p] = (apply_weight(wA, sam_A) + sam_B) | 0;
          wA = this.update_weight(wA, delta, sam_A, sam_B);
          sam_A = ((3 * buf[p - 1] - buf[p - 3]) | 0) >> 1;
          sam_B = buf[p + 1];
          buf[p + 1] = (apply_weight(wB, sam_A) + sam_B) | 0;
          wB = this.update_weight(wB, delta, sam_A, sam_B);
        }
        B[0] = buf[p - 1]; A[0] = buf[p - 2]; B[1] = buf[p - 3]; A[1] = buf[p - 4];
        break;
      default:
        if (dpp.term > 0) {
          let t = o - dpp.term * 2;
          for (p = o; p < end; p += 2, t += 2) {
            sam_A = buf[p];
            buf[p] = (apply_weight(wA, buf[t]) + sam_A) | 0;
            wA = this.update_weight(wA, delta, buf[t], sam_A);
            sam_A = buf[p + 1];
            buf[p + 1] = (apply_weight(wB, buf[t + 1]) + sam_A) | 0;
            wB = this.update_weight(wB, delta, buf[t + 1], sam_A);
          }
          for (let k = dpp.term - 1, i = 8; i--; k--) {
            B[k & (MAX_TERM - 1)] = buf[--p];
            A[k & (MAX_TERM - 1)] = buf[--p];
          }
        } else if (dpp.term === -1) {
          for (p = o; p < end; p += 2) {
            sam_A = buf[p];
            buf[p] = (apply_weight(wA, buf[p - 1]) + sam_A) | 0;
            wA = this.update_weight_clip(wA, delta, buf[p - 1], sam_A);
            sam_A = buf[p + 1];
            buf[p + 1] = (apply_weight(wB, buf[p]) + sam_A) | 0;
            wB = this.update_weight_clip(wB, delta, buf[p], sam_A);
          }
          A[0] = buf[p - 1];
        } else if (dpp.term === -2) {
          for (p = o; p < end; p += 2) {
            sam_A = buf[p + 1];
            buf[p + 1] = (apply_weight(wB, buf[p - 2]) + sam_A) | 0;
            wB = this.update_weight_clip(wB, delta, buf[p - 2], sam_A);
            sam_A = buf[p];
            buf[p] = (apply_weight(wA, buf[p + 1]) + sam_A) | 0;
            wA = this.update_weight_clip(wA, delta, buf[p + 1], sam_A);
          }
          B[0] = buf[p - 2];
        } else if (dpp.term === -3) {
          for (p = o; p < end; p += 2) {
            sam_A = buf[p];
            buf[p] = (apply_weight(wA, buf[p - 1]) + sam_A) | 0;
            wA = this.update_weight_clip(wA, delta, buf[p - 1], sam_A);
            sam_A = buf[p + 1];
            buf[p + 1] = (apply_weight(wB, buf[p - 2]) + sam_A) | 0;
            wB = this.update_weight_clip(wB, delta, buf[p - 2], sam_A);
          }
          A[0] = buf[p - 1];
          B[0] = buf[p - 2];
        }
        break;
    }
    dpp.weight_A = wA;
    dpp.weight_B = wB;
  }

  private decorr_mono_pass(dpp: DecorrPass, buf: Int32Array, o: number, count: number): void {
    const delta = dpp.delta;
    let wA = dpp.weight_A;
    const end = o + count;
    const A = dpp.samples_A;
    let sam_A: number;
    switch (dpp.term) {
      case 17:
        for (let p = o; p < end; p++) {
          sam_A = (2 * A[0] - A[1]) | 0;
          A[1] = A[0];
          A[0] = (apply_weight(wA, sam_A) + buf[p]) | 0;
          wA = this.update_weight(wA, delta, sam_A, buf[p]);
          buf[p] = A[0];
        }
        break;
      case 18:
        for (let p = o; p < end; p++) {
          sam_A = ((3 * A[0] - A[1]) | 0) >> 1;
          A[1] = A[0];
          A[0] = (apply_weight(wA, sam_A) + buf[p]) | 0;
          wA = this.update_weight(wA, delta, sam_A, buf[p]);
          buf[p] = A[0];
        }
        break;
      default: {
        let m = 0, k = dpp.term & (MAX_TERM - 1);
        for (let p = o; p < end; p++) {
          sam_A = A[m];
          A[k] = (apply_weight(wA, sam_A) + buf[p]) | 0;
          wA = this.update_weight(wA, delta, sam_A, buf[p]);
          buf[p] = A[k];
          m = (m + 1) & (MAX_TERM - 1);
          k = (k + 1) & (MAX_TERM - 1);
        }
        if (m) {
          const t = A.slice();
          for (k = 0; k < MAX_TERM; k++, m++) A[k] = t[m & (MAX_TERM - 1)];
        }
      }
    }
    dpp.weight_A = wA;
  }

  private fixup_samples(buf: Int32Array, o: number, count: number): void {
    const flags = this.hdr.flags;
    let shift = (flags & SHIFT_MASK) >>> SHIFT_LSB;
    if (flags & FLOAT_DATA) {
      let n = flags & MONO_FLAG ? count : count * 2;
      let s = this.float_max_exp - this.float_norm_exp + this.float_shift;
      if (s > 32) s = 32;
      else if (s < -32) s = -32;
      let p = o;
      while (n--) {
        if (s > 0) buf[p] = s >= 32 ? 0 : buf[p] << s;
        else if (s < 0) buf[p] = buf[p] >> Math.min(31, -s);
        if (buf[p] > 8388607) buf[p] = 8388607;
        else if (buf[p] < -8388608) buf[p] = -8388608;
        p++;
      }
      return;
    }
    if (flags & INT32_DATA) {
      let n = flags & MONO_FLAG ? count : count * 2;
      const sent = this.int32_sent_bits, zeros = this.int32_zeros, ones = this.int32_ones, dups = this.int32_dups;
      let p = o;
      if (!(flags & HYBRID_FLAG) && !sent && zeros + ones + dups) {
        while (n--) {
          if (zeros) buf[p] <<= zeros;
          else if (ones) buf[p] = ((buf[p] + 1) << ones) - 1;
          else if (dups) buf[p] = ((buf[p] + (buf[p] & 1)) << dups) - (buf[p] & 1);
          p++;
        }
      } else shift += zeros + sent + ones + dups;
    }
    if (flags & HYBRID_FLAG) {
      let min_value: number, max_value: number;
      switch (flags & BYTES_STORED) {
        case 0: min_value = -128 >> shift; max_value = 127 >> shift; break;
        case 1: min_value = -32768 >> shift; max_value = 32767 >> shift; break;
        case 2: min_value = -8388608 >> shift; max_value = 8388607 >> shift; break;
        default: min_value = 0x80000000 >> shift; max_value = 0x7FFFFFFF >> shift; break;
      }
      const min_shifted = min_value << shift, max_shifted = max_value << shift;
      let n = flags & MONO_FLAG ? count : count * 2;
      let p = o;
      while (n--) {
        if (buf[p] < min_value) buf[p++] = min_shifted;
        else if (buf[p] > max_value) buf[p++] = max_shifted;
        else buf[p++] <<= shift;
      }
    } else if (shift) {
      let n = flags & MONO_FLAG ? count : count * 2;
      let p = o;
      while (n--) buf[p++] <<= shift;
    }
  }

  private unpack_samples(buf: Int32Array, o: number, sample_count: number): number {
    const flags = this.hdr.flags;
    let crc = this.crc;
    let mute_limit = (1 << ((flags & MAG_MASK) >>> MAG_LSB)) + 2;
    if (this.sample_index + sample_count > this.hdr.block_index + this.hdr.block_samples)
      sample_count = this.hdr.block_index + this.hdr.block_samples - this.sample_index;
    if (this.mute_error) {
      buf.fill(0, o, o + sample_count * (flags & MONO_FLAG ? 1 : 2));
      this.sample_index += sample_count;
      return sample_count;
    }
    if (flags & HYBRID_FLAG) mute_limit *= 2;
    let i: number;
    if (flags & MONO_DATA) {
      i = this.get_words(buf, o, sample_count, flags);
      for (let t = 0; t < this.num_terms; t++) this.decorr_mono_pass(this.passes[t], buf, o, sample_count);
      for (let p = o; p < o + sample_count; p++) {
        if (Math.abs(buf[p]) > mute_limit) {
          i = p - o;
          break;
        }
        crc = (Math.imul(crc, 3) + buf[p]) >>> 0;
      }
    } else {
      const end = o + sample_count * 2;
      i = this.get_words(buf, o, sample_count, flags);
      if (sample_count < 16) for (let t = 0; t < this.num_terms; t++) this.decorr_stereo_pass(this.passes[t], buf, o, sample_count);
      else
        for (let t = 0; t < this.num_terms; t++) {
          this.decorr_stereo_pass(this.passes[t], buf, o, 8);
          this.decorr_stereo_pass_cont(this.passes[t], buf, o + 16, sample_count - 8);
        }
      for (let p = o; p < end; p += 2) {
        if (flags & JOINT_STEREO) {
          buf[p + 1] -= buf[p] >> 1;
          buf[p] += buf[p + 1];
        }
        if (Math.abs(buf[p]) > mute_limit || Math.abs(buf[p + 1]) > mute_limit) {
          i = (p - o) >> 1;
          break;
        }
        crc = (Math.imul((Math.imul(crc, 3) + buf[p]) >>> 0, 3) + buf[p + 1]) >>> 0;
      }
    }
    if (i !== sample_count) {
      buf.fill(0, o, o + sample_count * (flags & MONO_FLAG ? 1 : 2));
      this.mute_error = true;
      i = sample_count;
    }
    this.fixup_samples(buf, o, i);
    if (flags & FALSE_STEREO) {
      let d = o + i * 2, s = o + i, c = i;
      while (c--) {
        buf[--d] = buf[--s];
        buf[--d] = buf[s];
      }
    }
    this.sample_index += i;
    this.crc = crc;
    return i;
  }

  /** WavpackOpenFileInput: false (with error) if the file cannot be decoded */
  open(): boolean {
    this.total_samples = 0xffffffff;
    while (!this.hdr.block_samples) {
      if (!this.read_next_header()) {
        this.error = 'not compatible with this version of WavPack file!';
        return false;
      }
      if (this.hdr.block_samples && this.hdr.total_samples !== 0xffffffff) this.total_samples = this.hdr.total_samples;
      if (!this.unpack_init()) {
        this.error ||= 'not compatible with this version of WavPack file!';
        return false;
      }
    }
    this.config.flags &= ~0xff;
    this.config.flags |= this.hdr.flags & 0xff;
    this.config.bytes_per_sample = (this.hdr.flags & BYTES_STORED) + 1;
    this.config.bits_per_sample = this.config.bytes_per_sample * 8 - ((this.hdr.flags & SHIFT_MASK) >>> SHIFT_LSB);
    if (this.config.flags & FLOAT_DATA) {
      this.config.bytes_per_sample = 3;
      this.config.bits_per_sample = 24;
    }
    if (!this.config.sample_rate) {
      if (!this.hdr.block_samples || (this.hdr.flags & SRATE_MASK) === SRATE_MASK) this.config.sample_rate = 44100;
      else this.config.sample_rate = sample_rates[(this.hdr.flags & SRATE_MASK) >>> SRATE_LSB];
    }
    if (!this.config.num_channels) {
      this.config.num_channels = this.hdr.flags & MONO_FLAG ? 1 : 2;
      this.config.channel_mask = 0x5 - this.config.num_channels;
    }
    if (!(this.hdr.flags & FINAL_BLOCK)) this.reduced_channels = this.hdr.flags & MONO_FLAG ? 1 : 2;
    return true;
  }

  /** WavpackUnpackSamples into buf (ints, interleaved) */
  unpackSamples(buf: Int32Array, samples: number): number {
    let o = 0;
    let unpacked = 0;
    const num_channels = this.config.num_channels;
    while (samples) {
      if (!this.hdr.block_samples || !(this.hdr.flags & INITIAL_BLOCK) || this.sample_index >= this.hdr.block_index + this.hdr.block_samples) {
        if (!this.read_next_header()) break;
        if (!this.hdr.block_samples || this.sample_index === this.hdr.block_index) if (!this.unpack_init()) break;
      }
      if (!this.hdr.block_samples || !(this.hdr.flags & INITIAL_BLOCK) || this.sample_index >= this.hdr.block_index + this.hdr.block_samples) continue;
      if (this.sample_index < this.hdr.block_index) {
        let n = this.hdr.block_index - this.sample_index;
        if (n > samples) n = samples;
        this.sample_index += n;
        unpacked += n;
        samples -= n;
        n *= this.reduced_channels || num_channels;
        buf.fill(0, o, o + n);
        o += n;
        continue;
      }
      let n = this.hdr.block_index + this.hdr.block_samples - this.sample_index;
      if (n > samples) n = samples;
      this.unpack_samples(buf, o, n);
      o += n * (this.reduced_channels || num_channels);
      unpacked += n;
      samples -= n;
      if (this.sample_index === this.hdr.block_index + this.hdr.block_samples) {
        if (this.crc !== this.hdr.crc) this.crc_errors++;
      }
      if (this.sample_index === this.total_samples) break;
    }
    return unpacked;
  }
}

/** CSound::LoadWV's decoding: 16-bit mono or stereo PCM, or null */
export function decodeWV(file: Uint8Array): WavpackResult | null {
  const d = new WavpackDecoder(file);
  if (!d.open()) return null;
  const n = d.total_samples >>> 0;
  const ch = d.config.num_channels;
  if (ch > 2 || d.config.bits_per_sample !== 16) return null;
  const buf = new Int32Array(n * ch + 32);
  d.unpackSamples(buf, n);
  return { samples: buf.subarray(0, n * ch), numSamples: n, channels: ch, rate: d.config.sample_rate, bitsPerSample: d.config.bits_per_sample };
}
