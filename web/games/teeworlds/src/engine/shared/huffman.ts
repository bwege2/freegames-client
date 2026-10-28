// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/huffman.cpp of Teeworlds 0.7.5 in TypeScript.

const EOF_SYMBOL = 256;
const MAX_SYMBOLS = EOF_SYMBOL + 1;
const MAX_NODES = MAX_SYMBOLS * 2 - 1;
const LUTBITS = 10;
const LUTSIZE = 1 << LUTBITS;
const LUTMASK = LUTSIZE - 1;

const FREQ_TABLE = [
  1 << 30, 4545, 2657, 431, 1950, 919, 444, 482, 2244, 617, 838, 542, 715, 1814, 304, 240, 754, 212, 647, 186,
  283, 131, 146, 166, 543, 164, 167, 136, 179, 859, 363, 113, 157, 154, 204, 108, 137, 180, 202, 176,
  872, 404, 168, 134, 151, 111, 113, 109, 120, 126, 129, 100, 41, 20, 16, 22, 18, 18, 17, 19,
  16, 37, 13, 21, 362, 166, 99, 78, 95, 88, 81, 70, 83, 284, 91, 187, 77, 68, 52, 68,
  59, 66, 61, 638, 71, 157, 50, 46, 69, 43, 11, 24, 13, 19, 10, 12, 12, 20, 14, 9,
  20, 20, 10, 10, 15, 15, 12, 12, 7, 19, 15, 14, 13, 18, 35, 19, 17, 14, 8, 5,
  15, 17, 9, 15, 14, 18, 8, 10, 2173, 134, 157, 68, 188, 60, 170, 60, 194, 62, 175, 71,
  148, 67, 167, 78, 211, 67, 156, 69, 1674, 90, 174, 53, 147, 89, 181, 51, 174, 63, 163, 80,
  167, 94, 128, 122, 223, 153, 218, 77, 200, 110, 190, 73, 174, 69, 145, 66, 277, 143, 141, 60,
  136, 53, 180, 57, 142, 57, 158, 61, 166, 112, 152, 92, 26, 22, 21, 28, 20, 26, 30, 21,
  32, 27, 20, 17, 23, 21, 30, 22, 22, 21, 27, 25, 17, 27, 23, 18, 39, 26, 15, 21,
  12, 18, 18, 27, 20, 18, 15, 19, 11, 17, 33, 12, 18, 15, 19, 18, 16, 26, 17, 18,
  9, 10, 25, 22, 22, 17, 20, 16, 6, 16, 15, 20, 14, 18, 24, 335, 1517];

/** CHuffman with the original's frequency table */
export class CHuffman {
  private readonly bits = new Uint32Array(MAX_NODES);
  private readonly numBits = new Uint32Array(MAX_NODES);
  private readonly leaf0 = new Uint16Array(MAX_NODES);
  private readonly leaf1 = new Uint16Array(MAX_NODES);
  private readonly symbol = new Uint8Array(MAX_NODES);
  private readonly lut = new Int32Array(LUTSIZE);
  private start = 0;

  constructor() {
    const nodeId = new Int32Array(MAX_SYMBOLS);
    const freq = new Int32Array(MAX_SYMBOLS);
    const list = new Int32Array(MAX_SYMBOLS);
    let left = MAX_SYMBOLS;
    for (let i = 0; i < MAX_SYMBOLS; i++) {
      this.numBits[i] = 0xFFFFFFFF;
      this.symbol[i] = i & 0xff;
      this.leaf0[i] = 0xffff;
      this.leaf1[i] = 0xffff;
      freq[i] = i === EOF_SYMBOL ? 1 : FREQ_TABLE[i];
      nodeId[i] = i;
      list[i] = i;
    }
    let numNodes = MAX_SYMBOLS;
    while (left > 1) {
      let size = left;
      let changed = true;
      while (changed) {
        changed = false;
        for (let i = 0; i < size - 1; i++) {
          if (freq[list[i]] < freq[list[i + 1]]) {
            const t = list[i];
            list[i] = list[i + 1];
            list[i + 1] = t;
            changed = true;
          }
        }
        size--;
      }
      this.numBits[numNodes] = 0;
      this.leaf0[numNodes] = nodeId[list[left - 1]];
      this.leaf1[numNodes] = nodeId[list[left - 2]];
      nodeId[list[left - 2]] = numNodes;
      freq[list[left - 2]] = (freq[list[left - 1]] + freq[list[left - 2]]) | 0;
      numNodes++;
      left--;
    }
    this.start = numNodes - 1;
    this.setbits(this.start, 0, 0);
    for (let i = 0; i < LUTSIZE; i++) {
      let b = i;
      let node = this.start;
      let k;
      for (k = 0; k < LUTBITS; k++) {
        node = b & 1 ? this.leaf1[node] : this.leaf0[node];
        b >>>= 1;
        if (this.numBits[node]) {
          this.lut[i] = node;
          break;
        }
      }
      if (k === LUTBITS) this.lut[i] = node;
    }
  }

  private setbits(node: number, b: number, depth: number): void {
    if (this.leaf1[node] !== 0xffff) this.setbits(this.leaf1[node], (b | (1 << depth)) >>> 0, depth + 1);
    if (this.leaf0[node] !== 0xffff) this.setbits(this.leaf0[node], b, depth + 1);
    if (this.numBits[node]) {
      this.bits[node] = b;
      this.numBits[node] = depth;
    }
  }

  /** the compressed size, or -1 */
  Compress(input: Uint8Array, inSize: number, out: Uint8Array, outOff: number, outSize: number): number {
    let src = 0;
    let dst = outOff;
    const dstEnd = outOff + outSize;
    let b = 0;
    let bc = 0;
    const load = (sym: number): void => {
      b = (b | (this.bits[sym] << bc)) >>> 0; // a 32-bit unsigned in the original
      bc += this.numBits[sym];
    };
    if (inSize) {
      let sym = input[src++];
      while (src !== inSize) {
        load(sym);
        sym = input[src++];
        while (bc >= 8) {
          out[dst++] = b & 0xff;
          if (dst === dstEnd) return -1;
          b >>>= 8;
          bc -= 8;
        }
      }
      load(sym);
      while (bc >= 8) {
        out[dst++] = b & 0xff;
        if (dst === dstEnd) return -1;
        b >>>= 8;
        bc -= 8;
      }
    }
    load(EOF_SYMBOL);
    while (bc >= 8) {
      out[dst++] = b & 0xff;
      if (dst === dstEnd) return -1;
      b >>>= 8;
      bc -= 8;
    }
    out[dst++] = b & 0xff;
    return dst - outOff;
  }

  /** the decompressed size, or -1 */
  Decompress(input: Uint8Array, inOff: number, inSize: number, out: Uint8Array, outSize: number): number {
    let dst = 0;
    let src = inOff;
    const srcEnd = inOff + inSize;
    let b = 0;
    let bc = 0;
    for (;;) {
      let node = -1;
      if (bc >= LUTBITS) node = this.lut[b & LUTMASK];
      while (bc < 24 && src !== srcEnd) {
        b = (b | (input[src++] << bc)) >>> 0;
        bc += 8;
      }
      if (node < 0) node = this.lut[b & LUTMASK];
      if (this.numBits[node]) {
        b >>>= this.numBits[node];
        bc -= this.numBits[node];
      } else {
        b >>>= LUTBITS;
        bc -= LUTBITS;
        for (;;) {
          node = b & 1 ? this.leaf1[node] : this.leaf0[node];
          bc--;
          b >>>= 1;
          if (this.numBits[node]) break;
          if (bc === 0) return -1;
        }
      }
      if (node === EOF_SYMBOL) break;
      if (dst === outSize) return -1;
      out[dst++] = this.symbol[node];
    }
    return dst;
  }
}

export const huffman = new CHuffman();
