// The original program for the tests: the source disk's screens compiled by the rebuilt EA FORTH
// (eaforth.ts) into a C64 (c64.ts), started as the release disk started it.
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { deflateSync } from 'node:zlib';
import { C64 } from './c64.ts';
import { EaForth, d64Blocks } from './eaforth.ts';
import { renderFrame, FRAME_W, FRAME_H, type VicView } from '../src/vic.ts';

const here = (p: string) => fileURLToPath(new URL(p, import.meta.url));
export const D64 = here('../../../../re/worms/orig/Commodore.d64');
export const CHARGEN = here('../assets/chargen.bin');

/** why the original cannot run here, or null */
export function missing(): string | null {
  return existsSync(D64) ? null : `${D64} is missing: run re/worms/fetch.sh to download the original`;
}

export interface Original {
  m: C64;
  f: EaForth;
}

/** Compiles the game. `seed` seeds what $D012 reads (src/raster.ts). */
export function compileOriginal(seed: number): Original {
  const m = new C64(new Uint8Array(readFileSync(CHARGEN)), seed);
  const f = new EaForth(m);
  f.loadGame(d64Blocks(new Uint8Array(readFileSync(D64))));
  // the release image: QUIT runs GRIDGLIDERS (' GRIDGLIDERS CFA ' QUIT ! on screens 98 and 121)
  f.w16(f.pfa('QUIT'), f.cfa('GRIDGLIDERS'));
  return { m, f };
}

/** Starts the program (QUIT) with interrupts on; the caller drives m.run(). */
export function boot(o: Original): void {
  const { m, f } = o;
  m.cpu.p &= ~0x04;
  f.w16(0xc100, f.cfa('QUIT'));
  f.w16(0x2c, 0xc100);
  m.cpu.pc = f.labels.get('NEXT')!;
}

/** Runs n frames of the started program. */
export function frames(o: Original, n: number): void {
  const end = o.m.frames + n;
  o.m.run(() => o.m.frames >= end);
}

export function screenText(m: { ram: Uint8Array }): string {
  const lines: string[] = [];
  for (let y = 0; y < 25; y++) {
    let s = '';
    for (let x = 0; x < 40; x++) {
      const c = m.ram[0x400 + y * 40 + x];
      if (c < 0x20) s += String.fromCharCode(c + 0x40);
      else if (c < 0x40) s += String.fromCharCode(c);
      else if (c < 0xc0) {
        const k = (c - 0x40) >> 1; // a half of a double-width character
        s += k < 0x20 ? String.fromCharCode(k + 0x60) : String.fromCharCode(k);
      } else if (c >= 0xc0 && c <= 0xcf) s += c === 0xc0 ? '.' : c === 0xc8 ? ' ' : '#';
      else s += '?';
    }
    lines.push(s);
  }
  return lines.join('\n');
}

/** A PNG of what the VIC shows. */
export function png(v: VicView, scale = 1): Buffer {
  const src = new Uint8ClampedArray(FRAME_W * FRAME_H * 4);
  renderFrame(v, src);
  const W = FRAME_W * scale, H = FRAME_H * scale;
  const rgba = new Uint8ClampedArray(W * H * 4);
  for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
    const s = ((Math.floor(y / scale) * FRAME_W) + Math.floor(x / scale)) * 4;
    rgba.set(src.subarray(s, s + 4), (y * W + x) * 4);
  }
  const raw = Buffer.alloc((W * 4 + 1) * H);
  for (let y = 0; y < H; y++) {
    raw[y * (W * 4 + 1)] = 0;
    Buffer.from(rgba.buffer, y * W * 4, W * 4).copy(raw, y * (W * 4 + 1) + 1);
  }
  const crcTable = new Int32Array(256).map((_, n) => {
    let c = n;
    for (let k = 0; k < 8; k++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
    return c;
  });
  const crc = (b: Buffer) => {
    let c = -1;
    for (const x of b) c = crcTable[(c ^ x) & 0xff] ^ (c >>> 8);
    return (c ^ -1) >>> 0;
  };
  const chunk = (type: string, data: Buffer) => {
    const len = Buffer.alloc(4);
    len.writeUInt32BE(data.length);
    const td = Buffer.concat([Buffer.from(type), data]);
    const c = Buffer.alloc(4);
    c.writeUInt32BE(crc(td));
    return Buffer.concat([len, td, c]);
  };
  const ihdr = Buffer.alloc(13);
  ihdr.writeUInt32BE(W, 0);
  ihdr.writeUInt32BE(H, 4);
  ihdr[8] = 8;
  ihdr[9] = 6;
  return Buffer.concat([
    Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]),
    chunk('IHDR', ihdr), chunk('IDAT', deflateSync(raw)), chunk('IEND', Buffer.alloc(0)),
  ]);
}
