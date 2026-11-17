// Drawing a room onto the framebuffer: WavyPicture (the background), Anim::drawAt with the view
// effects (effect/Effect*.cpp), ShapeBuilder's coloured shapes, RopeDecor and StepDecor.
import type { Effect, ImgRef } from '../engine/anim.ts';
import type { RoomPainter } from '../engine/level.ts';
import { SCALE } from '../engine/level.ts';
import { rng } from '../engine/random.ts';
import type { Framebuffer, Pic } from './fb.ts';
import type { TextRenderer } from './text.ts';

export interface PicSource {
  /** the decoded picture, or null while it loads */
  pic(path: string): Pic | null;
}

const shapeCache = new WeakMap<object, Pic>();

/** ShapeBuilder::createImage */
function shapePic(img: Extract<ImgRef, { shape: unknown }>): Pic {
  let pic = shapeCache.get(img);
  if (pic) return pic;
  const w = img.w * SCALE, h = img.h * SCALE;
  const px = new Uint8ClampedArray(w * h * 4);
  // transparent magenta background (colour key)
  for (let i = 0; i < px.length; i += 4) { px[i] = 255; px[i + 2] = 255; px[i + 3] = 0; }
  let hash = 0;
  for (const m of img.shape) {
    hash = (Math.imul(31, hash) + m.x) >>> 0;
    hash = (Math.imul(31, hash) + m.y) >>> 0;
  }
  let r = 0, g = 0, b = 0;
  if (img.weight === 1) { g = hash % 255; r = 255 - g; } else if (img.weight === 2) b = 50 + (hash % (255 - 50));
  else { r = 128; g = 128; b = 128; }
  for (const m of img.shape) {
    for (let y = 0; y < SCALE; y++) {
      for (let x = 0; x < SCALE; x++) {
        const i = ((m.y * SCALE + y) * w + m.x * SCALE + x) * 4;
        px[i] = r; px[i + 1] = g; px[i + 2] = b; px[i + 3] = 255;
      }
    }
  }
  pic = { w, h, px };
  shapeCache.set(img, pic);
  return pic;
}

export class FbPainter implements RoomPainter {
  fb: Framebuffer;
  pics: PicSource;
  text: TextRenderer;
  constructor(fb: Framebuffer, pics: PicSource, text: TextRenderer) {
    this.fb = fb;
    this.pics = pics;
    this.text = text;
  }

  private resolve(img: ImgRef): Pic | null {
    return 'path' in img ? this.pics.pic(img.path) : shapePic(img);
  }

  /** WavyPicture::drawOn */
  background(picture: string, amp: number, periode: number, speed: number, cycles: number): void {
    const pic = this.pics.pic(picture);
    if (!pic) return;
    if (amp === 0) {
      this.fb.blit(pic, 0, 0);
      return;
    }
    const per = periode === 0 ? pic.w : periode;
    const shift = Math.fround(cycles * speed);
    for (let py = 0; py < pic.h; py++) {
      const shiftX = Math.trunc(0.5 + amp * Math.sin(py / per + shift));
      // the line from shiftX, and the pad that wraps around
      this.fb.blit(pic, 0, py, shiftX, py, pic.w, 1);
      const padX = shiftX < 0 ? 0 : pic.w - shiftX;
      this.fb.blit(pic, padX, py, padX, py, Math.abs(shiftX), 1);
    }
  }

  blit(img: ImgRef, x: number, y: number, effect: Effect): void {
    const pic = this.resolve(img);
    if (!pic) return;
    const fb = this.fb;
    switch (effect.name) {
      case 'none':
        fb.blit(pic, x, y);
        return;
      case 'invisible':
        return;
      case 'disintegrate':
        for (let py = 0; py < pic.h; py++) {
          for (let px = 0; px < pic.w; px++) {
            if (rng.aByte(py * pic.w + px) < effect.disint) {
              const i = (py * pic.w + px) * 4;
              if (pic.px[i + 3] === 255) fb.put(x + px, y + py, pic.px[i], pic.px[i + 1], pic.px[i + 2]);
            }
          }
        }
        return;
      case 'mirror': {
        const mi = ((pic.h >> 1) * pic.w + (pic.w >> 1)) * 4;
        const mr = pic.px[mi], mg = pic.px[mi + 1], mb = pic.px[mi + 2], ma = pic.px[mi + 3];
        for (let py = 0; py < pic.h; py++) {
          for (let px = 0; px < pic.w; px++) {
            const i = (py * pic.w + px) * 4;
            const p = pic.px;
            if (px > 3 && p[i] === mr && p[i + 1] === mg && p[i + 2] === mb && p[i + 3] === ma) {
              const s = fb.get(x - px + 3, y + py);
              fb.put(x + px, y + py, s[0], s[1], s[2]);
            } else if (p[i + 3] === 255) {
              fb.put(x + px, y + py, p[i], p[i + 1], p[i + 2]);
            }
          }
        }
        return;
      }
      case 'reverse':
        for (let py = 0; py < pic.h; py++) {
          for (let px = 0; px < pic.w; px++) {
            const i = (py * pic.w + px) * 4;
            if (pic.px[i + 3] === 255) fb.put(x + pic.w - 1 - px, y + py, pic.px[i], pic.px[i + 1], pic.px[i + 2]);
          }
        }
        return;
      case 'zx': {
        const c = (cx: number, cy: number) => { const i = (cy * pic.w + cx) * 4; return [pic.px[i], pic.px[i + 1], pic.px[i + 2]]; };
        const colors = [null, c(0, 0), c(0, pic.h - 1), c(pic.w - 1, 0), c(pic.w - 1, pic.h - 1)];
        for (let py = 0; py < pic.h; py++) {
          effect.countHeight++;
          if (effect.countHeight > effect.stripeHeight) {
            effect.countHeight -= effect.stripeHeight;
            effect.zx = effect.zx === 1 ? 2 : effect.zx === 2 ? 1 : effect.zx === 3 ? 4 : 3;
          }
          const col = colors[effect.zx]!;
          for (let px = 0; px < pic.w; px++) {
            // PixelIterator::isTransparent: the pixel equals the colour key 0 (all four bytes zero)
            const i = (py * pic.w + px) * 4;
            if (pic.px[i] | pic.px[i + 1] | pic.px[i + 2] | pic.px[i + 3]) fb.put(x + px, y + py, col[0], col[1], col[2]);
          }
        }
      }
    }
  }

  rope(x1: number, y1: number, x2: number, y2: number): void {
    this.fb.line(x1, y1, x2, y2, 0x30404eff);
  }

  steps(count: number, powerful: boolean): void {
    const color: [number, number, number] = powerful ? [162, 244, 255] : [255, 197, 102];
    const t = this.text.render('console', 20, String(count), color);
    this.fb.blit(t, this.fb.w - t.w, 10);
  }
}
