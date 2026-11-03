// simulation/gravity/Gravity.h, GravityPtr.h, Fft.cpp: Newtonian gravity.
//
// The original convolves the mass map with the field of a point mass using FFTW (single precision, r2c/c2r on a
// grid of 2*XCELLS x 2*YCELLS, so the cyclic convolution does not wrap visibly) on a worker thread. Exchange()
// hands out the result of the previous dispatch and dispatches the new input, so the force field lags the mass
// map by one Exchange. The port keeps that structure (kernel built once on the first Exchange, mask handling,
// one-step latency, the swaps of gravIn.mass and gravOut) but runs Work() synchronously inside Exchange().
//
// What differs: FFTW is replaced by a small radix-2 complex FFT in double precision on a zero-padded grid of
// 512 x 256 (the next powers of two >= 2*CELLS - 1). The original's cyclic convolution on 2*CELLS only ever pairs
// cells whose distance d satisfies |d.X| < XCELLS, |d.Y| < YCELLS, so the linear convolution computed here on the
// padded grid is the same sum, without the float rounding of FFTW's butterflies. The kernel values themselves are
// computed exactly as in the original (float hypot, powf, the scale factor of FFTW's unnormalised inverse), and
// both force components are obtained from one complex transform (kernelX + i*kernelY, both real).
import { M_GRAV, NCELL, XCELLS, YCELLS } from './config.ts';
import { f } from './cpp.ts';
import type { GravityInput, GravityOutput } from './simulation.ts';

// DFT is cyclic in nature; gravity would wrap around sort of like in loop mode without the 2x here;
// in fact it still does, it's just not as visible. the arrays are 2x as big along all dimensions as normal cell maps
const blocksX = XCELLS * 2;
const blocksY = YCELLS * 2;

// NCELL * 4 is size of data array, scaling needed because FFTW calculates an unnormalized DFT
const scaleFactor = f(-M_GRAV / (NCELL * 4));

// the port's padded transform size
const FX = 512, FY = 256;
const LOGX = 9, LOGY = 8;

/** an in-place radix-2 FFT of length n = 1 << logn over (re, im) with a stride; inverse without normalisation */
class Fft1 {
  n: number;
  rev: Uint32Array;
  cos: Float64Array;
  sin: Float64Array;
  constructor(logn: number) {
    const n = 1 << logn;
    this.n = n;
    this.rev = new Uint32Array(n);
    for (let i = 0; i < n; i++) {
      let r = 0;
      for (let b = 0; b < logn; b++) if (i & (1 << b)) r |= 1 << (logn - 1 - b);
      this.rev[i] = r;
    }
    this.cos = new Float64Array(n / 2);
    this.sin = new Float64Array(n / 2);
    for (let i = 0; i < n / 2; i++) {
      this.cos[i] = Math.cos(2 * Math.PI * i / n);
      this.sin[i] = Math.sin(2 * Math.PI * i / n);
    }
  }
  run(re: Float64Array, im: Float64Array, off: number, stride: number, inverse: boolean): void {
    const n = this.n, rev = this.rev;
    for (let i = 0; i < n; i++) {
      const j = rev[i];
      if (j > i) {
        const a = off + i * stride, b = off + j * stride;
        let t = re[a]; re[a] = re[b]; re[b] = t;
        t = im[a]; im[a] = im[b]; im[b] = t;
      }
    }
    const sgn = inverse ? 1 : -1;
    for (let size = 2; size <= n; size <<= 1) {
      const half = size >> 1, step = n / size;
      for (let start = 0; start < n; start += size) {
        for (let k = 0; k < half; k++) {
          const wr = this.cos[k * step], wi = sgn * this.sin[k * step];
          const a = off + (start + k) * stride, b = off + (start + k + half) * stride;
          const xr = re[b] * wr - im[b] * wi;
          const xi = re[b] * wi + im[b] * wr;
          re[b] = re[a] - xr; im[b] = im[a] - xi;
          re[a] += xr; im[a] += xi;
        }
      }
    }
  }
}

export class Gravity {
  // GravityImpl
  private kernelTRe = new Float64Array(0);
  private kernelTIm = new Float64Array(0);
  private bigRe = new Float64Array(0);
  private bigIm = new Float64Array(0);
  private fftX: Fft1 | null = null;
  private fftY: Fft1 | null = null;
  initDone = false;

  /** the input and output owned by the "worker" */
  gravIn: GravityInput;
  gravOut: GravityOutput;
  copyGravOut = false;

  protected constructor(gravIn: GravityInput, gravOut: GravityOutput) {
    this.gravIn = gravIn;
    this.gravOut = gravOut;
  }

  static Create(): Gravity {
    // GravityInput/GravityOutput are classes in simulation.ts; build plain ones of the same shape so this module
    // only needs their types (no import cycle with simulation.ts)
    const gravIn = { mass: new Float32Array(XCELLS * YCELLS), mask: new Uint32Array(XCELLS * YCELLS).fill(0xFFFFFFFF) };
    const gravOut = { forceX: new Float32Array(XCELLS * YCELLS), forceY: new Float32Array(XCELLS * YCELLS) };
    return new Gravity(gravIn as GravityInput, gravOut as GravityOutput);
  }

  private fft2(inverse: boolean, rowsUsed: number): void {
    const fx = this.fftX!, fy = this.fftY!;
    const re = this.bigRe, im = this.bigIm;
    if (!inverse) {
      // rows (only the rows that hold mass are non-zero), then columns
      for (let y = 0; y < rowsUsed; y++) fx.run(re, im, y * FX, 1, false);
      for (let x = 0; x < FX; x++) fy.run(re, im, x, FX, false);
    } else {
      // columns, then only the rows that are read back
      for (let x = 0; x < FX; x++) fy.run(re, im, x, FX, true);
      for (let y = 0; y < rowsUsed; y++) fx.run(re, im, y * FX, 1, true);
    }
  }

  Init(): void {
    this.fftX = new Fft1(LOGX);
    this.fftY = new Fft1(LOGY);
    this.kernelTRe = new Float64Array(FX * FY);
    this.kernelTIm = new Float64Array(FX * FY);
    this.bigRe = new Float64Array(FX * FY);
    this.bigIm = new Float64Array(FX * FY);

    //calculate velocity map caused by a point mass
    for (let py = 0; py < blocksY; py++) {
      for (let px = 0; px < blocksX; px++) {
        const dX = px - XCELLS, dY = py - YCELLS;
        let kx: number, ky: number;
        if (dX == 0 && dY == 0) {
          kx = 0.0;
          ky = 0.0;
        } else {
          // std::hypot(float, float): hypotf, computed in double and rounded once
          const distance = f(Math.sqrt(dX * dX + dY * dY));
          const p3 = f(Math.pow(distance, 3.0));
          kx = f(f(scaleFactor * dX) / p3);
          ky = f(f(scaleFactor * dY) / p3);
        }
        // the port: d = -CELLS (the first row/column of the original's kernel) is never paired with a cell of the
        // map, and the padded grid has room for every other d at index d mod size
        if (dX == -XCELLS || dY == -YCELLS) continue;
        const ix = (dX + FX) % FX, iy = (dY + FY) % FY;
        this.kernelTRe[iy * FX + ix] = kx;
        this.kernelTIm[iy * FX + ix] = ky;
      }
    }

    //transform point mass velocity maps
    this.bigRe.set(this.kernelTRe);
    this.bigIm.set(this.kernelTIm);
    this.fft2(false, FY);
    this.kernelTRe.set(this.bigRe);
    this.kernelTIm.set(this.bigIm);
  }

  Work(): void {
    const re = this.bigRe, im = this.bigIm;
    const gravIn = this.gravIn, gravOut = this.gravOut;
    re.fill(0);
    im.fill(0);
    for (let y = 0; y < YCELLS; y++) {
      for (let x = 0; x < XCELLS; x++) {
        const p = y * XCELLS + x;
        re[y * FX + x] = gravIn.mask[p] ? gravIn.mass[p] : 0.0;
      }
    }
    this.fft2(false, YCELLS);
    {
      // https://en.wikipedia.org/wiki/Convolution_theorem
      const kr = this.kernelTRe, ki = this.kernelTIm;
      for (let i = 0; i < FX * FY; ++i) {
        const ar = re[i], ai = im[i];
        re[i] = ar * kr[i] - ai * ki[i];
        im[i] = ar * ki[i] + ai * kr[i];
      }
    }
    this.fft2(true, YCELLS);
    // our inverse is unnormalised over FX*FY; the kernel carries FFTW's 1/(NCELL*4)
    const norm = (NCELL * 4) / (FX * FY);
    for (let y = 0; y < YCELLS; y++) {
      for (let x = 0; x < XCELLS; x++) {
        const p = y * XCELLS + x;
        // similarly
        gravOut.forceX[p] = gravIn.mask[p] ? re[y * FX + x] * norm : 0;
        gravOut.forceY[p] = gravIn.mask[p] ? im[y * FX + x] * norm : 0;
      }
    }
  }

  // potentially clobbers gravIn
  Exchange(gravOut: GravityOutput, gravIn: GravityInput, forceRecalc: boolean): void {
    // lazy init
    if (!this.initDone) {
      // this takes a noticeable amount of time
      this.Init();
      this.initDone = true;
    }

    // Wait(): the port's Work() already ran synchronously

    // take output
    if (this.copyGravOut) {
      this.copyGravOut = false;
      // std::swap(gravOut, fftGravity->gravOut)
      const fx = gravOut.forceX, fy = gravOut.forceY;
      gravOut.forceX = this.gravOut.forceX;
      gravOut.forceY = this.gravOut.forceY;
      this.gravOut.forceX = fx;
      this.gravOut.forceY = fy;
    }

    // pass input (but same input => same output)
    if (forceRecalc ||
      !sameBits(this.gravIn.mass, gravIn.mass) ||
      !sameBits(this.gravIn.mask, gravIn.mask)) {
      this.copyGravOut = true;
      // std::swap(gravIn.mass, fftGravity->gravIn.mass)
      const m = gravIn.mass;
      gravIn.mass = this.gravIn.mass;
      this.gravIn.mass = m;
      this.gravIn.mask.set(gravIn.mask);
      // Dispatch()
      this.Work();
    }
  }
}

/** memcmp of two float/uint32 planes */
function sameBits(a: Float32Array | Uint32Array, b: Float32Array | Uint32Array): boolean {
  const ua = new Uint32Array(a.buffer, a.byteOffset, a.length);
  const ub = new Uint32Array(b.buffer, b.byteOffset, b.length);
  for (let i = 0; i < ua.length; i++) if (ua[i] !== ub[i]) return false;
  return true;
}
