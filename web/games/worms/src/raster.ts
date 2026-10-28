// RAND (screen 39: `: RAND D012 C@ SEED +! SEED C@ ;`) adds the VIC's raster line register to SEED. On
// the C64 that is wherever the beam happens to be when RAND runs, which depends on the exact cycle the
// program reaches it: in effect a random byte. The port (and the 6502 harness of the tests, and the
// server module) read it from this generator instead: a raster line drawn uniformly from the 263 lines
// of an NTSC frame, of which $D012 holds the low 8 bits. Seeded, so that the same seed gives the same
// game everywhere (online rounds take the room's seed). mulberry32; Java: WormsGame.Raster.

export class Raster {
  private a: number;

  constructor(seed: number) {
    this.a = seed >>> 0;
  }

  /** the next 32 random bits */
  bits(): number {
    this.a = (this.a + 0x6d2b79f5) >>> 0;
    let t = this.a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return (t ^ (t >>> 14)) >>> 0;
  }

  /** what a read of $D012 returns */
  d012(): number {
    const line = Math.floor((this.bits() * 263) / 4294967296);
    return line & 0xff;
  }
}

/** The 32-bit seed of a round's 64-bit seed. */
export function seed32(seed: bigint): number {
  return Number((seed ^ (seed >> 32n)) & 0xffffffffn) >>> 0;
}
