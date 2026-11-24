// @ts-nocheck
// OpenClonk 36de799: src/lib/StdColors.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$pow } from '../../rt/libc.ts';
import { $ } from '../../rt/registry.ts';

export class CStdPalette {
  Colors = new Uint32Array(256);

  GetClr(byCol) {
    return this.Colors[byCol];
  }

  $clone() { return new CStdPalette().$assign(this); }
  $assign(o) {
    this.Colors = o.Colors.slice();
    return this;
  }
}

export function rgb2xyY(r, g, b, px, py, pY) {
  let X = 0.412453 * r + 0.35758 * g + 0.180423 * b;
  let Y = 0.212671 * r + 0.71516 * g + 0.072169 * b;
  let Z = 0.019334 * r + 0.119193 * g + 0.950227 * b;
  let XYZ = X + Y + Z;
  if (XYZ === 0) {
    px.a[px.o] = py.a[py.o] = 0.3;
  } else {
    px.a[px.o] = X / XYZ;
    py.a[py.o] = Y / XYZ;
  }
  pY.a[pY.o] = Y;
  return true;
}

export function xy2upvp(x, y, pu, pv) {
  let n = -2 * x + 12 * y + 3;
  if (n === 0) {
    return false;
  }
  pu.a[pu.o] = 4 * x / n;
  pv.a[pv.o] = 9 * y / n;
  return true;
}

export function RGB2rgb(R, G, B, pr, pg, pb, gamma = 2.2) {
  pr.a[pr.o] = c$pow(R / 255, 1 / gamma);
  pg.a[pg.o] = c$pow(G / 255, 1 / gamma);
  pb.a[pb.o] = c$pow(B / 255, 1 / gamma);
  return true;
}

export function $init(): void {
}

Object.assign($, { CStdPalette, RGB2rgb, rgb2xyY, xy2upvp });
