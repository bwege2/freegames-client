// @ts-nocheck
// OpenClonk 36de799: src/lib/SHA1.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $and64n, $shr64n } from '../../rt/int.ts';
import { $padd, $peq, $reinterpVoid } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';

export class sha1 {
  h_ = new Uint32Array(5);
  block_ = new Uint8Array(64);
  block_byte_index_ = 0;
  byte_count_ = 0;

  init() {
    sha1.prototype.reset.call(this);
    return this;
  }

  reset() {
    this.h_[0] = 0x67452301;
    this.h_[1] = 0xefcdab89;
    this.h_[2] = 0x98badcfe;
    this.h_[3] = 0x10325476;
    this.h_[4] = 0xc3d2e1f0;
    this.block_byte_index_ = 0;
    this.byte_count_ = 0;
  }

  process_byte(byte) {
    let $t1;
    this.block_[($t1 = this.block_byte_index_, this.block_byte_index_ = this.block_byte_index_ + 1, $t1)] = byte;
    this.byte_count_ = this.byte_count_ + 1;
    if (this.block_byte_index_ === 64) {
      this.block_byte_index_ = 0;
      this.process_block$v();
    }
  }

  process_block$px$px(bytes_begin, bytes_end) {
    let begin = $reinterpVoid(bytes_begin, "u8");
    let end = $reinterpVoid(bytes_end, "u8");
    for (; !$peq(begin, end); begin = begin.add(1)) {
      this.process_byte(begin.a[begin.o]);
    }
  }

  process_bytes(buffer, byte_count) {
    let b = $reinterpVoid(buffer, "u8");
    this.process_block$px$px(b, $padd(b, byte_count));
  }

  get_digest(digest) {
    let bit_count = this.byte_count_ * 8;
    this.process_byte(128);
    if (this.block_byte_index_ > 56) {
      while (this.block_byte_index_ !== 0) {
        this.process_byte(0);
      }
      while (this.block_byte_index_ < 56) {
        this.process_byte(0);
      }
    } else {
      while (this.block_byte_index_ < 56) {
        this.process_byte(0);
      }
    }
    this.process_byte(0);
    this.process_byte(0);
    this.process_byte(0);
    this.process_byte(0);
    this.process_byte($and64n($shr64n(bit_count, 24), 255) & 0xff);
    this.process_byte($and64n($shr64n(bit_count, 16), 255) & 0xff);
    this.process_byte($and64n($shr64n(bit_count, 8), 255) & 0xff);
    this.process_byte($and64n(bit_count, 255) & 0xff);
    digest[0] = this.h_[0];
    digest[1] = this.h_[1];
    digest[2] = this.h_[2];
    digest[3] = this.h_[3];
    digest[4] = this.h_[4];
  }

  process_block$v() {
    const w = new Uint32Array(80);
    for (let i = 0; i < 16; i = i + 1) {
      w[i] = (this.block_[i * 4 + 0] << 24 | 0) >>> 0;
      w[i] = (w[i] | (this.block_[i * 4 + 1] << 16 | 0) >>> 0) >>> 0;
      w[i] = (w[i] | (this.block_[i * 4 + 2] << 8 | 0) >>> 0) >>> 0;
      w[i] = (w[i] | this.block_[i * 4 + 3]) >>> 0;
    }
    for (let i = 16; i < 80; i = i + 1) {
      w[i] = sha1.left_rotate((((w[i - 3] ^ w[i - 8]) >>> 0 ^ w[i - 14]) >>> 0 ^ w[i - 16]) >>> 0, 1);
    }
    let a = this.h_[0];
    let b = this.h_[1];
    let c = this.h_[2];
    let d = this.h_[3];
    let e = this.h_[4];
    for (let i = 0; i < 80; i = i + 1) {
      let f = 0;
      let k = 0;
      if (i < 20) {
        f = ((b & c) >>> 0 | (~b >>> 0 & d) >>> 0) >>> 0;
        k = 0x5a827999;
      } else if (i < 40) {
        f = ((b ^ c) >>> 0 ^ d) >>> 0;
        k = 0x6ed9eba1;
      } else if (i < 60) {
        f = (((b & c) >>> 0 | (b & d) >>> 0) >>> 0 | (c & d) >>> 0) >>> 0;
        k = 0x8f1bbcdc;
      } else {
        f = ((b ^ c) >>> 0 ^ d) >>> 0;
        k = 0xca62c1d6;
      }
      let temp = (((sha1.left_rotate(a, 5) + f >>> 0) + e >>> 0) + k >>> 0) + w[i] >>> 0;
      e = d;
      d = c;
      c = sha1.left_rotate(b, 30);
      b = a;
      a = temp;
    }
    this.h_[0] = this.h_[0] + a >>> 0;
    this.h_[1] = this.h_[1] + b >>> 0;
    this.h_[2] = this.h_[2] + c >>> 0;
    this.h_[3] = this.h_[3] + d >>> 0;
    this.h_[4] = this.h_[4] + e >>> 0;
  }

  static left_rotate(x, n) {
    return ((x << n) >>> 0 ^ x >>> 32 - n) >>> 0;
  }

  $clone() { return new sha1().$assign(this); }
  $assign(o) {
    this.h_ = o.h_.slice();
    this.block_ = o.block_.slice();
    this.block_byte_index_ = o.block_byte_index_;
    this.byte_count_ = o.byte_count_;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { sha1 });
