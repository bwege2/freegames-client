// @ts-nocheck
// OpenClonk 36de799: src/lib/StdColors.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { c$pow } from '../../rt/libc.ts';
import { P } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max, $min } from '../../rt/std.ts';

export class CStdPalette {
  static $layout = [["Colors", 0, "u32", 256]];
  static $size = 1024;
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

export function RGBA(r, g, b, a) {
  return (((((a & 255) >>> 0 << 24) >>> 0 | ((r & 255) >>> 0 << 16) >>> 0) >>> 0 | ((g & 255) >>> 0 << 8) >>> 0) >>> 0 | (b & 255) >>> 0) >>> 0;
}

export function BltAlpha(dwDst, dwSrc) {
  if (dwDst.a[dwDst.o] >>> 24 === 0) {
    dwDst.a[dwDst.o] = dwSrc;
    return;
  }
  let byAlphaSrc = dwSrc >>> 24 & 0xff;
  let byAlphaDst = (255 - byAlphaSrc | 0) & 0xff;
  dwDst.a[dwDst.o] = ((($min((Math.imul((dwDst.a[dwDst.o] & 255) >>> 0, byAlphaDst) >>> 0) + (Math.imul((dwSrc & 255) >>> 0, byAlphaSrc) >>> 0) >>> 0 >>> 8, 255) | $min(((Math.imul((dwDst.a[dwDst.o] & 65280) >>> 0, byAlphaDst) >>> 0) + (Math.imul((dwSrc & 65280) >>> 0, byAlphaSrc) >>> 0) >>> 0 >>> 8 & 65280) >>> 0, 65280)) >>> 0 | $min(((Math.imul((dwDst.a[dwDst.o] & 0xff0000) >>> 0, byAlphaDst) >>> 0) + (Math.imul((dwSrc & 0xff0000) >>> 0, byAlphaSrc) >>> 0) >>> 0 >>> 8 & 0xff0000) >>> 0, 0xff0000)) >>> 0 | ($min((dwDst.a[dwDst.o] >>> 24) + byAlphaSrc >>> 0, 255) << 24) >>> 0) >>> 0;
}

export function BltAlphaAdd(dwDst, dwSrc) {
  if (dwDst.a[dwDst.o] >>> 24 === 0) {
    dwDst.a[dwDst.o] = dwSrc;
    return;
  }
  let byAlphaSrc = dwSrc >>> 24 & 0xff;
  dwDst.a[dwDst.o] = ((($min(((dwDst.a[dwDst.o] & 255) >>> 0) + ((Math.imul((dwSrc & 255) >>> 0 | 0, byAlphaSrc) >> 8) >>> 0) >>> 0, 255) | $min((((dwDst.a[dwDst.o] & 65280) >>> 0) + (Math.imul((dwSrc >>> 8 & 255) >>> 0 | 0, byAlphaSrc) >>> 0) >>> 0 & 0xffff00) >>> 0, 65280)) >>> 0 | $min((((dwDst.a[dwDst.o] & 0xff0000) >>> 0) + (Math.imul((dwSrc >>> 8 & 65280) >>> 0 | 0, byAlphaSrc) >>> 0) >>> 0 & 0xffff0000) >>> 0, 0xff0000)) >>> 0 | ($min((dwDst.a[dwDst.o] >>> 24) + byAlphaSrc >>> 0, 255) << 24) >>> 0) >>> 0;
}

export function ModulateClr(dwDst, dwMod) {
  let iA1 = dwDst.a[dwDst.o] >>> 24 | 0;
  let iA2 = dwMod >>> 24 | 0;
  dwDst.a[dwDst.o] = ((((Math.imul((dwDst.a[dwDst.o] & 255) >>> 0, (dwMod & 255) >>> 0) >>> 0) / 255 >>> 0 | ((Math.imul((dwDst.a[dwDst.o] >>> 8 & 255) >>> 0, (dwMod >>> 8 & 255) >>> 0) >>> 0) / 255 >>> 0 << 8) >>> 0) >>> 0 | ((Math.imul((dwDst.a[dwDst.o] >>> 16 & 255) >>> 0, (dwMod >>> 16 & 255) >>> 0) >>> 0) / 255 >>> 0 << 16) >>> 0) >>> 0 | ($min(Math.imul(iA1, iA2) / 255 | 0, 255) << 24 | 0) >>> 0) >>> 0;
}

export function ModulateClrA(dwDst, dwMod) {
  dwDst.a[dwDst.o] = ((((Math.imul((dwDst.a[dwDst.o] & 255) >>> 0, (dwMod & 255) >>> 0) >>> 0) / 255 >>> 0 | ((Math.imul((dwDst.a[dwDst.o] >>> 8 & 255) >>> 0, (dwMod >>> 8 & 255) >>> 0) >>> 0) / 255 >>> 0 << 8) >>> 0) >>> 0 | ((Math.imul((dwDst.a[dwDst.o] >>> 16 & 255) >>> 0, (dwMod >>> 16 & 255) >>> 0) >>> 0) / 255 >>> 0 << 16) >>> 0) >>> 0 | ($max((dwDst.a[dwDst.o] >>> 24) + (dwMod >>> 24) >>> 0, 255) - 255 >>> 0 << 24) >>> 0) >>> 0;
}

export function ModulateClrMOD2(dwDst, dwMod) {
  dwDst.a[dwDst.o] = (($.Clamp$i32$i32$i32((((((dwDst.a[dwDst.o] & 255) >>> 0 | 0) >>> 0) + ((dwMod & 255) >>> 0) >>> 0) - 127 >>> 0 << 1) >>> 0 | 0, 0, 255) & 255 | $.Clamp$i32$i32$i32((((((dwDst.a[dwDst.o] & 65280) >>> 0 | 0) >>> 0) + ((dwMod & 65280) >>> 0) >>> 0) - 32512 >>> 0 << 1) >>> 0 | 0, 0, 65280) & 65280 | $.Clamp$i32$i32$i32((((((dwDst.a[dwDst.o] & 0xff0000) >>> 0 | 0) >>> 0) + ((dwMod & 0xff0000) >>> 0) >>> 0) - 0x7f0000 >>> 0 << 1) >>> 0 | 0, 0, 0xff0000) & 0xff0000) >>> 0 | ($max((dwDst.a[dwDst.o] >>> 24) + (dwMod >>> 24) >>> 0, 255) - 255 >>> 0 << 24) >>> 0) >>> 0;
}

export function LightenClrBy(dwDst, iBy) {
  dwDst.a[dwDst.o] = (($min(((dwDst.a[dwDst.o] & 255) >>> 0) + (iBy >>> 0) >>> 0 | 0, 255) | ($min(((dwDst.a[dwDst.o] >>> 8 & 255) >>> 0) + (iBy >>> 0) >>> 0 | 0, 255) << 8 | 0) | ($min(((dwDst.a[dwDst.o] >>> 16 & 255) >>> 0) + (iBy >>> 0) >>> 0 | 0, 255) << 16 | 0)) >>> 0 | (dwDst.a[dwDst.o] & 0xff000000) >>> 0) >>> 0;
  return dwDst.a[dwDst.o];
}

export function PlrClr2TxtClr(dwClr$) {
  const dwClr = [dwClr$];
  let lgt = $max($max(dwClr[0] >>> 16 & 0xff, (dwClr[0] & 0xffff) >> 8 & 0xff), dwClr[0] & 0xff);
  if (lgt < 143) {
    LightenClrBy(P(dwClr, 0), 143 - lgt | 0);
  }
  return (dwClr[0] | 0xff000000) >>> 0;
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

Object.assign($, { BltAlpha, BltAlphaAdd, CStdPalette, LightenClrBy, ModulateClr, ModulateClrA, ModulateClrMOD2, PlrClr2TxtClr, RGB2rgb, RGBA, rgb2xyY, xy2upvp });
