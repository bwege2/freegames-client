// c_stuff/fb_c_stuff.xs: the C extension of Frozen Bubble 2.2.0, line by line: the five transition
// effects between screens (store, bars, squares, circle, plasma), the logo animations of the menu
// (rotate, flipflop, enlighten, stretch, tilt, points, waterize, brokentv, snow), the menu cursor
// effects (alphaize, pixelize), blacken, overlook (the 1-player menu), shrink (high score and editor
// previews), the shooter's bicubic rotation and autopseudocrop, draw_line, fbdelay.
// C's integer and float conversions are kept: double -> int truncates, float math is rounded with
// Math.fround, sin and cos are glibc's (libm.ts), rand() is glibc's random() (rand.ts).
import { cos, sin } from './libm.ts';
import { GlibcRand } from './rand.ts';
import { mapRGB, type Rect, type Surface } from '../sdl/video.ts';

const XRES = 640, YRES = 480;
const Rdec = 0, Gdec = 1, Bdec = 2, Adec = 3;
const ANIM_SPEED = 20;
const M_PI = Math.PI;

/** what the effects need from SDL */
export interface CHost {
  ticks(): number;
  delay(ms: number): Promise<void>;
  flip(s: Surface): void;
  /** time(NULL) */
  time(): number;
}

/** C's conversion of a double to int (truncation toward zero) */
const ti = (v: number): number => Math.trunc(v) | 0;
/** a double stored into a Uint8 (values are in 0..255 where the C code does it) */
const u8 = (v: number): number => Math.trunc(v) & 0xff;
const clamp = (x: number, low: number, high: number): number => (x > high ? high : x < low ? low : x);
const idiv = (a: number, b: number): number => Math.trunc(a / b) | 0;

export class CStuff {
  readonly rand = new GlibcRand(1);
  private circleSteps = new Int32Array(0);
  private plasma = new Uint8Array(0);
  private plasma2 = new Uint8Array(0);
  private plasma3 = new Uint8Array(0);
  private readonly host: CHost;
  // static state of the logo effects
  private points: { x: number; y: number; angle: number }[] | null = null;
  private precalcCos: Float64Array | null = null;
  private precalcSin: Float64Array | null = null;
  private brokenPixelize = 0;
  private overlookFade = 0.9;
  private flakes: { x: number; y: number; sinpos: number; sincoeff: number; wideness: number; y_speed: number; opacity: number }[] | null = null;
  private newGenerated = 0;
  private counterForNewFlake = 1000;
  private ticks0 = 0;

  constructor(host: CHost) { this.host = host; }

  private rand_(v: number): number { return this.rand.rand_(v); }

  private synchroBefore(): void { this.ticks0 = this.host.ticks() >>> 0; }

  private async synchroAfter(s: Surface): Promise<void> {
    this.host.flip(s);
    const toWait = ((this.host.ticks() >>> 0) - this.ticks0) >>> 0;
    if (toWait < ANIM_SPEED) await this.host.delay(ANIM_SPEED - toWait);
  }

  // ------------------------------------------------------------------ transitions

  private async storeEffect(s: Surface, img: Surface): Promise<void> {
    const copyLine = (l: number): void => {
      s.pixels.set(img.pixels.subarray(l * img.pitch, (l + 1) * img.pitch), l * img.pitch);
    };
    const copyColumn = (c: number): void => {
      const bpp = img.format.BytesPerPixel;
      for (let y = 0; y < YRES; y++) {
        const o = y * img.pitch + c * bpp;
        s.pixels.set(img.pixels.subarray(o, o + bpp), o);
      }
    };
    let step = 0;
    const th = 15;
    if (this.rand_(2) === 1) {
      while (step < idiv(idiv(YRES, 2), th) + th) {
        this.synchroBefore();
        for (let i = 0; i <= idiv(idiv(YRES, 2), th); i++) {
          const v = step - i;
          if (v >= 0 && v < th) { copyLine(i * th + v); copyLine(YRES - 1 - (i * th + v)); }
        }
        step++;
        await this.synchroAfter(s);
      }
    } else {
      while (step < idiv(idiv(XRES, 2), th) + th) {
        this.synchroBefore();
        for (let i = 0; i <= idiv(idiv(XRES, 2), th); i++) {
          const v = step - i;
          if (v >= 0 && v < th) { copyColumn(i * th + v); copyColumn(XRES - 1 - (i * th + v)); }
        }
        step++;
        await this.synchroAfter(s);
      }
    }
  }

  private async barsEffect(s: Surface, img: Surface): Promise<void> {
    const bpp = img.format.BytesPerPixel;
    const steps = 40, bars = 16;
    const bw = idiv(XRES, bars) * bpp;
    for (let i = 0; i < steps; i++) {
      this.synchroBefore();
      for (let y = 0; y < idiv(YRES, steps); y++) {
        const y_ = (idiv(i * YRES, steps) + y) * img.pitch;
        const y__ = (YRES - 1 - (idiv(i * YRES, steps) + y)) * img.pitch;
        for (let j = 0; j < bars / 2; j++) {
          const x_ = (j * 2) * idiv(XRES, bars) * bpp;
          const x__ = (j * 2 + 1) * idiv(XRES, bars) * bpp;
          s.pixels.set(img.pixels.subarray(y_ + x_, y_ + x_ + bw), y_ + x_);
          s.pixels.set(img.pixels.subarray(y__ + x__, y__ + x__ + bw), y__ + x__);
        }
      }
      await this.synchroAfter(s);
    }
  }

  private async squaresEffect(s: Surface, img: Surface): Promise<void> {
    const bpp = img.format.BytesPerPixel;
    const size = 32;
    const fillrect = (i: number, j: number): boolean => {
      if (i >= idiv(XRES, size) || j >= idiv(YRES, size)) return false;
      const v = i * size * bpp + j * size * img.pitch;
      for (let c = 0; c < size; c++) {
        const o = v + c * img.pitch;
        s.pixels.set(img.pixels.subarray(o, o + size * bpp), o);
      }
      return true;
    };
    let moving = true;
    for (let i = 0; moving; i++) {
      let k = 0;
      this.synchroBefore();
      moving = false;
      for (let j = i; j >= 0; j--) { if (fillrect(j, k)) moving = true; k++; }
      await this.synchroAfter(s);
    }
  }

  private circleInit(): void {
    this.circleSteps = new Int32Array(XRES * YRES);
    for (let y = 0; y < YRES; y++) for (let x = 0; x < XRES; x++) {
      const max = ti(Math.sqrt((XRES / 2) * (XRES / 2) + (YRES / 2) * (YRES / 2)));
      const value = ti(Math.sqrt((x - XRES / 2) * (x - XRES / 2) + (y - YRES / 2) * (y - YRES / 2)));
      this.circleSteps[x + y * XRES] = idiv((max - value) * 40, max);
    }
  }

  private async circleEffect(s: Surface, img: Surface): Promise<void> {
    let step = 40;
    const bpp = img.format.BytesPerPixel;
    const inOrOut = this.rand_(2);
    while (step >= 0) {
      this.synchroBefore();
      for (let y = 0; y < YRES; y++) {
        const line = y * img.pitch;
        for (let x = 0; x < XRES; x++) {
          const cs = this.circleSteps[x + y * XRES];
          if (inOrOut === 1 ? cs === step : cs === 40 - step) {
            const o = line + x * bpp;
            for (let b = 0; b < bpp; b++) s.pixels[o + b] = img.pixels[o + b];
          }
        }
      }
      step--;
      await this.synchroAfter(s);
    }
  }

  private plasmaInit(plasmaRaw: Uint8Array): void {
    const plasma = Uint8Array.from(plasmaRaw.subarray(0, XRES * YRES));
    let max = -1;
    for (let x = 0; x < XRES; x++) for (let y = 0; y < YRES; y++) if (plasma[x + y * XRES] > max) max = plasma[x + y * XRES];
    for (let i = 0; i < XRES * YRES; i++) plasma[i] = idiv(plasma[i] * 40, max + 1);
    this.plasma = plasma;
    const p2 = new Uint8Array(XRES * YRES);
    for (let i = 0; i < XRES * YRES; i++) p2[i] = (this.rand_(256) - 1) & 0xff;
    for (let i = 0; i < XRES * YRES; i++) p2[i] = idiv(p2[i] * 40, 256);
    this.plasma2 = p2;
    this.plasma3 = new Uint8Array(XRES * YRES);
  }

  private async plasmaEffect(s: Surface, img: Surface): Promise<void> {
    let step = 0;
    const bpp = img.format.BytesPerPixel;
    const rnd = this.rand_(4);
    const type = img.format.palette ? this.rand_(2) : this.rand_(3);
    if (type === 3) {
      const inOrOut = this.rand_(2);
      const f = img.format;
      const fr = Math.fround;
      for (let y = 0; y < YRES; y++) for (let x = 0; x < XRES; x++) {
        const o = y * img.pitch + x * bpp;
        const pv = bpp === 4 ? img.u32[o >> 2] : img.pixels[o] | (img.pixels[o + 1] << 8) | (img.pixels[o + 2] << 16);
        const r = fr(fr((pv & f.Rmask) >>> f.Rshift) / fr(f.Rmask >>> f.Rshift));
        const g = fr(fr((pv & f.Gmask) >>> f.Gshift) / fr(f.Gmask >>> f.Gshift));
        const b = fr(fr((pv & f.Bmask) >>> f.Bshift) / fr(f.Bmask >>> f.Bshift));
        let v = u8(255 * (r * .299 + g * .587 + b * .114) * 40 / 256);
        if (inOrOut === 1) v = (40 - 1 - v) & 0xff;
        this.plasma3[x + y * XRES] = v;
      }
    }
    while (step < 40) {
      this.synchroBefore();
      if (type === 1) {
        const p = this.plasma;
        for (let y = 0; y < YRES; y++) {
          const line = y * img.pitch;
          for (let x = 0; x < XRES; x++) {
            let v: number;
            if (rnd === 1) v = p[x + y * XRES];
            else if (rnd === 2) v = p[(XRES - 1 - x) + y * XRES];
            else if (rnd === 3) v = p[x + (YRES - 1 - y) * XRES];
            else v = p[(XRES - 1 - x) + (YRES - 1 - y) * XRES];
            if (v === step) { const o = line + x * bpp; for (let b = 0; b < bpp; b++) s.pixels[o + b] = img.pixels[o + b]; }
          }
        }
      } else {
        const p = type === 2 ? this.plasma2 : this.plasma3;
        for (let y = 0; y < YRES; y++) {
          const line = y * img.pitch;
          for (let x = 0; x < XRES; x++) {
            if (p[x + y * XRES] === step) { const o = line + x * bpp; for (let b = 0; b < bpp; b++) s.pixels[o + b] = img.pixels[o + b]; }
          }
        }
      }
      step++;
      await this.synchroAfter(s);
    }
  }

  /** init_effects(datapath) */
  initEffects(plasmaRaw: Uint8Array): void {
    this.circleInit();
    this.plasmaInit(plasmaRaw);
    this.rand.srand(this.host.time() >>> 0);
  }

  /** effect(s, img): one of the transitions, chosen by rand */
  async effect(s: Surface, img: Surface): Promise<void> {
    const r = this.rand_(8);
    if (r === 1 || r === 2) await this.storeEffect(s, img);
    else if (r === 3 || r === 4 || r === 5) await this.plasmaEffect(s, img);
    else if (r === 6) await this.circleEffect(s, img);
    else if (r === 7) await this.barsEffect(s, img);
    else await this.squaresEffect(s, img);
  }

  // ------------------------------------------------------------------ image operations

  shrink(dest: Surface, orig: Surface, xpos: number, ypos: number, r: Rect, factor: number): void {
    const bpp = dest.format.BytesPerPixel;
    const rx = idiv(r.x, factor), rw = idiv(r.w, factor), ry = idiv(r.y, factor), rh = idiv(r.h, factor);
    xpos -= rx;
    ypos -= ry;
    const f = orig.format;
    for (let x = rx; x < rx + rw; x++) {
      for (let y = ry; y < ry + rh; y++) {
        const doff = (xpos + x) * bpp + (ypos + y) * dest.pitch;
        if (!dest.format.palette) {
          let R = 0, G = 0, B = 0;
          for (let i = 0; i < factor; i++) for (let j = 0; j < factor; j++) {
            const o = (x * factor + i) * bpp + (y * factor + j) * orig.pitch;
            const pv = (orig.pixels[o] | (orig.pixels[o + 1] << 8) | (orig.pixels[o + 2] << 16) | (bpp === 4 ? orig.pixels[o + 3] << 24 : 0)) >>> 0;
            R += (pv & f.Rmask) >>> f.Rshift;
            G += (pv & f.Gmask) >>> f.Gshift;
            B += (pv & f.Bmask) >>> f.Bshift;
          }
          const pv = ((idiv(R, factor * factor) << f.Rshift) + (idiv(G, factor * factor) << f.Gshift) + (idiv(B, factor * factor) << f.Bshift)) >>> 0;
          for (let b = 0; b < bpp; b++) dest.pixels[doff + b] = (pv >>> (8 * b)) & 0xff;
        } else {
          const o = (x * factor) * bpp + (y * factor) * orig.pitch;
          for (let b = 0; b < bpp; b++) dest.pixels[doff + b] = orig.pixels[o + b];
        }
      }
    }
  }

  rotateBilinear(dest: Surface, orig: Surface, angle: number): void {
    const cosval = cos(angle), sinval = sin(angle);
    const op = orig.pixels, dp = dest.pixels;
    const hw = idiv(dest.w, 2), hh = idiv(dest.h, 2);
    for (let y = 0; y < dest.h; y++) {
      let x__ = -hw * cosval - (y - hh) * sinval + hw;
      let y__ = (y - hh) * cosval - hw * sinval + hh;
      let ptr = y * dest.pitch;
      for (let x = 0; x < dest.w; x++) {
        const x_ = Math.floor(x__), y_ = Math.floor(y__);
        if (x_ < 0 || x_ > orig.w - 2 || y_ < 0 || y_ > orig.h - 2) {
          dp[ptr] = dp[ptr + 1] = dp[ptr + 2] = dp[ptr + 3] = 0;
        } else {
          const dx = x__ - x_, dy = y__ - y_;
          const A = x_ * 4 + y_ * orig.pitch, B = A + 4, C = A + orig.pitch, D = C + 4;
          const a = (op[A + 3] * (1 - dx) + op[B + 3] * dx) * (1 - dy) + (op[C + 3] * (1 - dx) + op[D + 3] * dx) * dy;
          let r: number, g: number, b: number;
          if (a === 0) r = g = b = 0;
          else if (a === 255) {
            r = ti((op[A] * (1 - dx) + op[B] * dx) * (1 - dy) + (op[C] * (1 - dx) + op[D] * dx) * dy);
            g = ti((op[A + 1] * (1 - dx) + op[B + 1] * dx) * (1 - dy) + (op[C + 1] * (1 - dx) + op[D + 1] * dx) * dy);
            b = ti((op[A + 2] * (1 - dx) + op[B + 2] * dx) * (1 - dy) + (op[C + 2] * (1 - dx) + op[D + 2] * dx) * dy);
          } else {
            r = ti(((op[A] * op[A + 3] * (1 - dx) + op[B] * op[B + 3] * dx) * (1 - dy) + (op[C] * op[C + 3] * (1 - dx) + op[D] * op[D + 3] * dx) * dy) / a);
            g = ti(((op[A + 1] * op[A + 3] * (1 - dx) + op[B + 1] * op[B + 3] * dx) * (1 - dy) + (op[C + 1] * op[C + 3] * (1 - dx) + op[D + 1] * op[D + 3] * dx) * dy) / a);
            b = ti(((op[A + 2] * op[A + 3] * (1 - dx) + op[B + 2] * op[B + 3] * dx) * (1 - dy) + (op[C + 2] * op[C + 3] * (1 - dx) + op[D + 2] * op[D + 3] * dx) * dy) / a);
          }
          dp[ptr + Rdec] = r; dp[ptr + Gdec] = g; dp[ptr + Bdec] = b; dp[ptr + Adec] = u8(a);
        }
        x__ += cosval;
        y__ += sinval;
        ptr += 4;
      }
    }
  }

  /** autopseudocrop: the bounding box of non-transparent pixels [x, y, w, h] */
  autopseudocrop(orig: Surface): [number, number, number, number] {
    let x_ = -1, y_ = -1, w = -1, h = -1;
    const a = orig.format.Ashift >> 3;
    const p = orig.pixels;
    for (let y = 0; y_ === -1; y++) for (let x = 0; x < orig.w; x++) if (p[y * orig.pitch + x * 4 + a] !== 0) { y_ = y; break; }
    for (let y = orig.h - 1; h === -1; y--) for (let x = 0; x < orig.w; x++) if (p[y * orig.pitch + x * 4 + a] !== 0) { h = y - y_ + 1; break; }
    for (let x = 0; x_ === -1; x++) for (let y = 0; y < orig.h; y++) if (p[y * orig.pitch + x * 4 + a] !== 0) { x_ = x; break; }
    for (let x = orig.w - 1; w === -1; x--) for (let y = 0; y < orig.h; y++) if (p[y * orig.pitch + x * 4 + a] !== 0) { w = x - x_ + 1; break; }
    return [x_, y_, w, h];
  }

  rotateBicubic(dest: Surface, orig: Surface, angle: number): void {
    const cosval = cos(angle), sinval = sin(angle);
    const op = orig.pixels, dp = dest.pixels;
    const pitch = dest.pitch;
    const hw = idiv(dest.w, 2), hh = idiv(dest.h, 2);
    // transform_cubic takes ints: the inner rows' doubles are truncated when passed in
    const cubic = (dx: number, jm1: number, j: number, jp1: number, jp2: number): number =>
      ((((-jm1 + 3 * j - 3 * jp1 + jp2) * dx + (2 * jm1 - 5 * j + 4 * jp1 - jp2)) * dx + (-jm1 + jp1)) * dx + (2 * j)) / 2.0;
    const row = (dx: number, o: number): number => ti(cubic(dx, op[o], op[o + 4], op[o + 8], op[o + 12]));
    const srow = (dx: number, o: number, ao: number): number =>
      ti(cubic(dx, op[ao] * op[o], op[ao + 4] * op[o + 4], op[ao + 8] * op[o + 8], op[ao + 12] * op[o + 12]));
    for (let y = 0; y < dest.h; y++) {
      let x__ = -hw * cosval - (y - hh) * sinval + hw - 1;
      let y__ = (y - hh) * cosval - hw * sinval + hh - 1;
      let ptr = y * dest.pitch;
      for (let x = 0; x < dest.w; x++) {
        const x_ = Math.floor(x__), y_ = Math.floor(y__);
        if (x_ < 0 || x_ > orig.w - 4 || y_ < 0 || y_ > orig.h - 4) {
          dp[ptr] = dp[ptr + 1] = dp[ptr + 2] = dp[ptr + 3] = 0;
        } else {
          const o = x_ * 4 + y_ * orig.pitch;
          const dx = x__ - x_, dy = y__ - y_;
          const aval = cubic(dy, row(dx, o + 3), row(dx, o + 3 + pitch), row(dx, o + 3 + pitch * 2), row(dx, o + 3 + pitch * 3));
          let arecip: number;
          if (aval <= 0.0) { arecip = 0.0; dp[ptr + 3] = 0; }
          else if (aval > 255.0) { arecip = 1.0 / aval; dp[ptr + 3] = 255; }
          else { arecip = 1.0 / aval; dp[ptr + 3] = ti(aval); }
          for (let i = 0; i < 3; i++) {
            const nv = ti(arecip * cubic(dy, srow(dx, o + i, o + 3), srow(dx, o + i + pitch, o + 3 + pitch),
              srow(dx, o + i + pitch * 2, o + 3 + pitch * 2), srow(dx, o + i + pitch * 3, o + 3 + pitch * 3)));
            dp[ptr + i] = clamp(nv, 0, 255);
          }
        }
        x__ += cosval;
        y__ += sinval;
        ptr += 4;
      }
    }
  }

  flipflop(dest: Surface, orig: Surface, offset: number): void {
    const op = orig.pixels, dp = dest.pixels;
    for (let x = 0; x < dest.w; x++) {
      const sinval = sin((2 * x + offset) / 50.0) * 5;
      const shading = 1.1 + cos((2 * x + offset) / 50.0) / 10;
      const x__ = x + sinval;
      const x_ = Math.floor(x__);
      let ptr = x * 4;
      for (let y = 0; y < dest.h; y++) {
        if (x_ < 0 || x_ > orig.w - 2) {
          dp[ptr] = dp[ptr + 1] = dp[ptr + 2] = dp[ptr + 3] = 0;
        } else {
          const dx = x__ - x_;
          const A = x_ * 4 + y * orig.pitch, B = A + 4;
          const a = op[A + 3] * (1 - dx) + op[B + 3] * dx;
          let r: number, g: number, b: number;
          if (a === 0) r = g = b = 0;
          else if (a === 255) {
            r = ti(op[A] * (1 - dx) + op[B] * dx); g = ti(op[A + 1] * (1 - dx) + op[B + 1] * dx); b = ti(op[A + 2] * (1 - dx) + op[B + 2] * dx);
          } else {
            r = ti((op[A] * op[A + 3] * (1 - dx) + op[B] * op[B + 3] * dx) / a);
            g = ti((op[A + 1] * op[A + 3] * (1 - dx) + op[B + 1] * op[B + 3] * dx) / a);
            b = ti((op[A + 2] * op[A + 3] * (1 - dx) + op[B + 2] * op[B + 3] * dx) / a);
          }
          dp[ptr + Rdec] = u8(clamp(r * shading, 0, 255));
          dp[ptr + Gdec] = u8(clamp(g * shading, 0, 255));
          dp[ptr + Bdec] = u8(clamp(b * shading, 0, 255));
          dp[ptr + Adec] = u8(a);
        }
        ptr += dest.pitch;
      }
    }
  }

  enlighten(dest: Surface, orig: Surface, offset: number): void {
    const fr = Math.fround;
    const fsqr = (a: number): number => fr(fr(a) * fr(a));
    const op = orig.pixels, dp = dest.pixels;
    const lightx = ti(dest.w / (2.5 + 0.3 * sin(offset / 500)) * sin(offset / 100) + idiv(dest.w, 2));
    const lighty = ti(dest.h / (2.5 + 0.3 * cos(offset / 500)) * cos(offset / 100) + idiv(dest.h, 2) + 10);
    for (let y = 0; y < dest.h; y++) {
      let pd = y * dest.pitch, po = y * orig.pitch;
      let sqdistbase = fsqr(y - lighty) - 3;
      if (y === lighty) sqdistbase -= 4;
      for (let x = 0; x < dest.w; x++) {
        let sqdist = sqdistbase + fsqr(x - lightx);
        if (x === lightx) sqdist -= 2;
        const shading = sqdist <= 0 ? 50 : 1 + 20 / sqdist;
        if (shading > 1.02) {
          dp[pd + Rdec] = u8(clamp(op[po + Rdec] * shading, 0, 255));
          dp[pd + Gdec] = u8(clamp(op[po + Gdec] * shading, 0, 255));
          dp[pd + Bdec] = u8(clamp(op[po + Bdec] * shading, 0, 255));
          dp[pd + Adec] = op[po + Adec];
        } else {
          dp[pd] = op[po]; dp[pd + 1] = op[po + 1]; dp[pd + 2] = op[po + 2]; dp[pd + 3] = op[po + 3];
        }
        pd += 4;
        po += 4;
      }
    }
  }

  /** the bilinear sample used by stretch, tilt and waterize; writes r, g, b, a (with shading) */
  private bilinear(dp: Uint8Array, ptr: number, orig: Surface, x__: number, y__: number, shading: number | null): void {
    const op = orig.pixels;
    const x_ = Math.floor(x__), y_ = Math.floor(y__);
    if (x_ < 0 || x_ > orig.w - 2 || y_ < 0 || y_ > orig.h - 2) {
      dp[ptr] = dp[ptr + 1] = dp[ptr + 2] = dp[ptr + 3] = 0;
      return;
    }
    const dx = x__ - x_, dy = y__ - y_;
    const A = x_ * 4 + y_ * orig.pitch, B = A + 4, C = A + orig.pitch, D = C + 4;
    const a = (op[A + 3] * (1 - dx) + op[B + 3] * dx) * (1 - dy) + (op[C + 3] * (1 - dx) + op[D + 3] * dx) * dy;
    let r: number, g: number, b: number;
    if (a === 0) r = g = b = 0;
    else if (a === 255) {
      r = ti((op[A] * (1 - dx) + op[B] * dx) * (1 - dy) + (op[C] * (1 - dx) + op[D] * dx) * dy);
      g = ti((op[A + 1] * (1 - dx) + op[B + 1] * dx) * (1 - dy) + (op[C + 1] * (1 - dx) + op[D + 1] * dx) * dy);
      b = ti((op[A + 2] * (1 - dx) + op[B + 2] * dx) * (1 - dy) + (op[C + 2] * (1 - dx) + op[D + 2] * dx) * dy);
    } else {
      r = ti(((op[A] * op[A + 3] * (1 - dx) + op[B] * op[B + 3] * dx) * (1 - dy) + (op[C] * op[C + 3] * (1 - dx) + op[D] * op[D + 3] * dx) * dy) / a);
      g = ti(((op[A + 1] * op[A + 3] * (1 - dx) + op[B + 1] * op[B + 3] * dx) * (1 - dy) + (op[C + 1] * op[C + 3] * (1 - dx) + op[D + 1] * op[D + 3] * dx) * dy) / a);
      b = ti(((op[A + 2] * op[A + 3] * (1 - dx) + op[B + 2] * op[B + 3] * dx) * (1 - dy) + (op[C + 2] * op[C + 3] * (1 - dx) + op[D + 2] * op[D + 3] * dx) * dy) / a);
    }
    if (shading === null) { dp[ptr + Rdec] = r; dp[ptr + Gdec] = g; dp[ptr + Bdec] = b; } else {
      dp[ptr + Rdec] = u8(clamp(r * shading, 0, 255));
      dp[ptr + Gdec] = u8(clamp(g * shading, 0, 255));
      dp[ptr + Bdec] = u8(clamp(b * shading, 0, 255));
    }
    dp[ptr + Adec] = u8(a);
  }

  stretch(dest: Surface, orig: Surface, offset: number): void {
    const sinval = sin(offset / 50.0) / 10 + 1;
    const hw = idiv(dest.w, 2), hh = idiv(dest.h, 2);
    for (let x = 0; x < dest.w; x++) {
      const x__ = (x - hw) * sinval + hw;
      const cosfory = -sin(offset / 50.0) * cos(M_PI * (x - hw) / dest.w) / sinval / 8 + 1;
      let ptr = x * 4;
      for (let y = 0; y < dest.h; y++) {
        const y__ = (y - hh) * cosfory + hh;
        this.bilinear(dest.pixels, ptr, orig, x__, y__, null);
        ptr += dest.pitch;
      }
    }
  }

  tilt(dest: Surface, orig: Surface, offset: number): void {
    const shading = 1 - sin(offset / 40.0) / 10;
    const hw = idiv(dest.w, 2), hh = idiv(dest.h, 2);
    for (let x = 0; x < dest.w; x++) {
      const zoomfact = 1 + (x - hw) * sin(offset / 40.0) / dest.w / 5;
      const x__ = (x - hw) * zoomfact + hw;
      let ptr = x * 4;
      for (let y = 0; y < dest.h; y++) {
        const y__ = (y - hh) * zoomfact + hh;
        this.bilinear(dest.pixels, ptr, orig, x__, y__, shading);
        ptr += dest.pitch;
      }
    }
  }

  pointsEffect(dest: Surface, orig: Surface, mask: Surface): void {
    const amount = 200;
    const mk = (px: number, py: number): number => mask.u32[(ti(py) * mask.pitch + ti(px) * mask.format.BytesPerPixel) >> 2];
    if (this.points === null) {
      this.points = [];
      for (let i = 0; i < amount; i++) {
        const p = { x: 0, y: 0, angle: 0 };
        for (;;) {
          p.x = this.rand_(idiv(dest.w, 2)) + idiv(dest.w, 4);
          p.y = this.rand_(idiv(dest.h, 2)) + idiv(dest.h, 4);
          if (mk(p.x, p.y) === 0xffffffff) break;
        }
        p.angle = 2 * M_PI * this.rand.next() / 2147483647;
        this.points.push(p);
      }
    }
    for (let y = 0; y < dest.h; y++) dest.pixels.set(orig.pixels.subarray(y * orig.pitch, (y + 1) * orig.pitch), y * dest.pitch);
    for (const p of this.points) {
      let ad = 0;
      dest.u32[(ti(p.y) * dest.pitch + ti(p.x) * 4) >> 2] = 0xffcccccc;
      p.x += cos(p.angle);
      p.y += sin(p.angle);
      if (mk(p.x, p.y) !== 0xffffffff) {
        p.x -= cos(p.angle);
        p.y -= sin(p.angle);
        for (;;) {
          ad += 2 * M_PI / 100;
          p.x += cos(p.angle + ad);
          p.y += sin(p.angle + ad);
          if (mk(p.x, p.y) === 0xffffffff) { p.angle += ad; break; }
          p.x -= cos(p.angle + ad);
          p.y -= sin(p.angle + ad);
          p.x += cos(p.angle - ad);
          p.y += sin(p.angle - ad);
          if (mk(p.x, p.y) === 0xffffffff) { p.angle -= ad; break; }
          p.x -= cos(p.angle - ad);
          p.y -= sin(p.angle - ad);
        }
      }
    }
  }

  waterize(dest: Surface, orig: Surface, offset: number): void {
    if (this.precalcCos === null) {
      this.precalcCos = new Float64Array(200);
      this.precalcSin = new Float64Array(200);
      for (let i = 0; i < 200; i++) {
        this.precalcCos[i] = cos(i * 2 * M_PI / 200.0) * 2;
        this.precalcSin![i] = sin(i * 2 * M_PI / 150.0) * 2;
      }
    }
    const pc = this.precalcCos, ps = this.precalcSin!;
    for (let x = 0; x < dest.w; x++) {
      let ptr = x * 4;
      for (let y = 0; y < dest.h; y++) {
        const x__ = x + pc[(x + y + offset) % 200];
        const y__ = y + ps[(x + y + offset) % 150];
        this.bilinear(dest.pixels, ptr, orig, x__, y__, null);
        ptr += dest.pitch;
      }
    }
  }

  brokentv(dest: Surface, orig: Surface, offset: number): void {
    const base = 0.9 + cos(offset / 50.0) * 0.1;
    if (this.brokenPixelize === 0) {
      if (this.rand_(100) === 1) this.brokenPixelize = ti(15 + 5 * cos(offset));
    } else this.brokenPixelize--;
    const op = orig.pixels, dp = dest.pixels;
    for (let y = 0; y < dest.h; y++) {
      let pd = y * dest.pitch, po = y * orig.pitch;
      let through = clamp(sin(y / (12.0 + 2 * sin(offset / 50.0)) + offset / 10.0 + sin(offset / 100.0) * 5) > 0 ? base : base + cos(offset / 30.0) * 0.2, 0, 1);
      for (let x = 0; x < dest.w; x++) {
        if (this.brokenPixelize) through = 0.2 + this.rand_(100) / 100.0;
        dp[pd] = op[po]; dp[pd + 1] = op[po + 1]; dp[pd + 2] = op[po + 2];
        dp[pd + Adec] = u8(op[po + Adec] * through);
        pd += 4;
        po += 4;
      }
    }
  }

  alphaize(s: Surface): void {
    const f = s.format, bpp = f.BytesPerPixel;
    for (let y = 0; y < s.h; y++) for (let x = 0; x < s.w; x++) {
      const o = y * s.pitch + x * bpp;
      let pv = s.u32[o >> 2];
      const a = ((pv & f.Amask) >>> f.Ashift) >>> 1;
      pv = ((pv & ~f.Amask) + (a << f.Ashift)) >>> 0;
      s.u32[o >> 2] = pv;
    }
  }

  pixelize(dest: Surface, orig: Surface): void {
    const op = orig.pixels, dp = dest.pixels;
    for (let y = 0; y < dest.h; y++) {
      let pd = y * dest.pitch, po = y * orig.pitch;
      for (let x = 0; x < dest.w; x++) {
        dp[pd] = op[po]; dp[pd + 1] = op[po + 1]; dp[pd + 2] = op[po + 2];
        dp[pd + Adec] = u8(op[po + Adec] * (0.2 + this.rand_(100) / 100.0));
        pd += 4;
        po += 4;
      }
    }
  }

  blacken(s: Surface, step: number): void {
    if (s.format.palette) return;
    const f = s.format, bpp = f.BytesPerPixel;
    for (let y = idiv((step - 1) * YRES, 70); y < idiv(step * YRES, 70); y++) {
      s.pixels.fill(0, y * s.pitch, y * s.pitch + bpp * XRES);
      s.pixels.fill(0, (YRES - 1 - y) * s.pitch, (YRES - 1 - y) * s.pitch + bpp * XRES);
    }
    const dim = (o: number): void => {
      const pv = s.u32[o >> 2];
      const r = idiv(((pv & f.Rmask) >>> f.Rshift) * 3, 4);
      const g = idiv(((pv & f.Gmask) >>> f.Gshift) * 3, 4);
      const b = idiv(((pv & f.Bmask) >>> f.Bshift) * 3, 4);
      s.u32[o >> 2] = ((r << f.Rshift) + (g << f.Gshift) + (b << f.Bshift)) >>> 0;
    };
    for (let y = idiv(step * YRES, 70); y < idiv((step + 8) * YRES, 70) && y < YRES; y++) {
      for (let x = 0; x < XRES; x++) {
        dim(y * s.pitch + x * bpp);
        dim((YRES - 1 - y) * s.pitch + x * bpp);
      }
    }
  }

  overlookInit(s: Surface): void {
    for (let x = 0; x < s.w; x++) for (let y = 0; y < s.h; y++) {
      const p = y * s.pitch + x * 4;
      s.pixels[p + Rdec] = 255; s.pixels[p + Gdec] = 255; s.pixels[p + Bdec] = 255; s.pixels[p + Adec] = 0;
    }
  }

  overlook(dest: Surface, orig: Surface, step: number, pivot: number): void {
    const shading = 1 - clamp(step / 70, 0, 1);
    const xFactor = 1 - step / 700;
    const fade = this.overlookFade;
    const op = orig.pixels, dp = dest.pixels;
    const hh = idiv(dest.h, 2);
    for (let x = 0; x < dest.w; x++) {
      const yFactor = 1 - step / 150 * Math.min(pivot, Math.abs(x - pivot) + idiv(pivot, 3)) / pivot;
      const x__ = pivot + (x - pivot) * xFactor;
      const x_ = Math.floor(x__);
      let ptr = x * 4;
      for (let y = 0; y < dest.h; y++) {
        const y__ = hh + (y - hh) * yFactor;
        const y_ = Math.floor(y__);
        if (x_ < 0 || x_ > orig.w - 2 || y_ < 0 || y_ > orig.h - 2) {
          dp[ptr + Adec] = u8(dp[ptr + Adec] * fade);
        } else {
          const dx = x__ - x_, dy = y__ - y_;
          const A = x_ * 4 + y_ * orig.pitch, B = A + 4, C = A + orig.pitch, D = C + 4;
          const a = ti((op[A + 3] * (1 - dx) + op[B + 3] * dx) * (1 - dy) + (op[C + 3] * (1 - dx) + op[D + 3] * dx) * dy);
          dp[ptr + Adec] = u8(Math.max(a * shading, dp[ptr + Adec] * fade));
        }
        ptr += dest.pitch;
      }
    }
  }

  snow(dest: Surface, orig: Surface): void {
    const amount = 200, wideness = 2.0, ySpeed = 0.2, movingSpeed = 0.1;
    const flake = [0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000,
      0x00000000, 0x80ffffff, 0xffffffff, 0x80ffffff, 0x00000000,
      0x00000000, 0xffffffff, 0xffffffff, 0xffffffff, 0x00000000,
      0x00000000, 0x80ffffff, 0xffffffff, 0x80ffffff, 0x00000000,
      0x00000000, 0x00000000, 0x00000000, 0x00000000, 0x00000000];
    const fw = 4, fh = 4, fpitch = 5;
    const byte = (v: number, i: number): number => (v >>> (8 * i)) & 0xff;
    if (this.flakes === null) {
      this.flakes = [];
      for (let i = 0; i < amount; i++) this.flakes.push({ x: -1, y: 0, sinpos: 0, sincoeff: 0, wideness: 0, y_speed: 0, opacity: 0 });
    }
    const op = orig.pixels, dp = dest.pixels;
    for (let y = 0; y < dest.h; y++) dp.set(op.subarray(y * orig.pitch, (y + 1) * orig.pitch), y * dest.pitch);
    for (const f of this.flakes) {
      if (f.x === -1) {
        if (this.newGenerated === 0) {
          f.x = ti(wideness + this.rand_(dest.w - 3 - wideness * 2) - 1);
          f.y = -2;
          f.sinpos = 100.0 * this.rand.next() / 2147483647;
          f.sincoeff = 0.3 + 0.7 * this.rand.next() / 2147483647;
          f.y_speed = 0.1 + ySpeed * this.rand.next() / 2147483647;
          f.wideness = wideness / 2 + wideness / 2 * this.rand.next() / 2147483647;
          f.opacity = 1;
          this.newGenerated = this.counterForNewFlake;
          if (this.counterForNewFlake > 50) this.counterForNewFlake -= 2;
        } else this.newGenerated--;
        continue;
      }
      const xf = f.x + sin(f.sinpos * f.sincoeff) * f.wideness;
      const yf = f.y;
      const x_ = Math.floor(xf), y_ = Math.floor(yf);
      const dx = 1 - (xf - x_), dy = 1 - (yf - y_);
      let optr = x_ * 4 + (y_ + 1) * orig.pitch;
      if (y_ >= 0) {
        if (op[optr + 3] > 191 + this.rand_(64) && op[optr + 3 * 4 + 3] > 191 + this.rand_(64)) f.x = -1;
      }
      for (let x = 0; x < fw; x++) {
        let ptr = (x_ + x) * 4 + Math.max(0, y_) * dest.pitch;
        optr = (x_ + x) * 4 + Math.max(0, y_) * orig.pitch;
        for (let y = Math.max(0, -y_); y < fh; y++) {
          const A = flake[x + y * fpitch], B = flake[(x + 1) + y * fpitch];
          const C = flake[x + (y + 1) * fpitch], D = flake[(x + 1) + (y + 1) * fpitch];
          let foreA = (byte(A, 3) * (1 - dx) + byte(B, 3) * dx) * (1 - dy) + (byte(C, 3) * (1 - dx) + byte(D, 3) * dx) * dy;
          if (foreA === 0) { ptr += dest.pitch; optr += orig.pitch; continue; }
          let fr: number, fg: number, fb: number;
          if (foreA === 255) {
            fr = ti((byte(A, 0) * (1 - dx) + byte(B, 0) * dx) * (1 - dy) + (byte(C, 0) * (1 - dx) + byte(D, 0) * dx) * dy);
            fg = ti((byte(A, 1) * (1 - dx) + byte(B, 1) * dx) * (1 - dy) + (byte(C, 1) * (1 - dx) + byte(D, 1) * dx) * dy);
            fb = ti((byte(A, 2) * (1 - dx) + byte(B, 2) * dx) * (1 - dy) + (byte(C, 2) * (1 - dx) + byte(D, 2) * dx) * dy);
          } else {
            fr = ti(((byte(A, 0) * byte(A, 3) * (1 - dx) + byte(B, 0) * byte(B, 3) * dx) * (1 - dy) + (byte(C, 0) * byte(C, 3) * (1 - dx) + byte(D, 0) * byte(D, 3) * dx) * dy) / foreA);
            fg = ti(((byte(A, 1) * byte(A, 3) * (1 - dx) + byte(B, 1) * byte(B, 3) * dx) * (1 - dy) + (byte(C, 1) * byte(C, 3) * (1 - dx) + byte(D, 1) * byte(D, 3) * dx) * dy) / foreA);
            fb = ti(((byte(A, 2) * byte(A, 3) * (1 - dx) + byte(B, 2) * byte(B, 3) * dx) * (1 - dy) + (byte(C, 2) * byte(C, 3) * (1 - dx) + byte(D, 2) * byte(D, 3) * dx) * dy) / foreA);
          }
          foreA *= f.opacity;
          const backA = dp[ptr + 3];
          const a = foreA + (255 - foreA) * backA / 255;
          if (a === 0) {
            dp[ptr] = dp[ptr + 1] = dp[ptr + 2] = dp[ptr + 3] = 0;
          } else {
            let r: number, g: number, b: number;
            if (backA === 0) { r = fr; g = fg; b = fb; } else {
              r = ti((fr * foreA + ((dp[ptr] * (255 - foreA) * backA) / 255)) / a);
              g = ti((fg * foreA + ((dp[ptr + 1] * (255 - foreA) * backA) / 255)) / a);
              b = ti((fb * foreA + ((dp[ptr + 2] * (255 - foreA) * backA) / 255)) / a);
            }
            if (f.x === -1) { op[optr] = r; op[optr + 1] = g; op[optr + 2] = b; op[optr + 3] = u8(a); }
            dp[ptr] = r; dp[ptr + 1] = g; dp[ptr + 2] = b; dp[ptr + 3] = u8(a);
          }
          ptr += dest.pitch;
          optr += orig.pitch;
        }
      }
      f.sinpos += movingSpeed;
      f.y += f.y_speed;
      if (f.y > dest.h - 22) f.opacity = (dest.h - f.y - 2) / 20;
      if (f.y >= dest.h - 4) f.x = -1;
    }
  }

  drawLine(s: Surface, x1: number, y1: number, x2: number, y2: number, r: number, g: number, b: number): void {
    const bpp = s.format.BytesPerPixel;
    const pix = mapRGB(s.format, r, g, b);
    let xacc: number, yacc: number;
    if (Math.abs(x2 - x1) > Math.abs(y2 - y1)) { xacc = x2 > x1 ? 1 : -1; yacc = xacc * (y2 - y1) / (x2 - x1); }
    else { yacc = y2 > y1 ? 1 : -1; xacc = yacc * (x2 - x1) / (y2 - y1); }
    let x = x1, y = y1;
    for (;;) {
      x += xacc;
      y += yacc;
      if ((xacc === 1 && x > x2) || (xacc === -1 && x < x2) || (yacc === 1 && y > y2) || (yacc === -1 && y < y2)) return;
      const o = bpp * ti(x) + s.pitch * ti(y);
      if (bpp === 4) s.u32[o >> 2] = pix; else for (let i = 0; i < bpp; i++) s.pixels[o + i] = (pix >>> (8 * i)) & 0xff;
    }
  }

  /** fbdelay(ms) */
  async fbdelay(ms: number): Promise<void> {
    ms |= 0;
    do {
      const then = this.host.ticks();
      await this.host.delay(ms);
      ms -= this.host.ticks() - then;
    } while (ms > 1);
  }
}
