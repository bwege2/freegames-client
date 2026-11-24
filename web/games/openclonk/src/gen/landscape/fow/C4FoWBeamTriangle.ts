// @ts-nocheck
// OpenClonk 36de799: src/landscape/fow/C4FoWBeamTriangle.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { $ } from '../../../rt/registry.ts';

export class C4FoWBeamTriangle {
  static $layout = [["clipLeft", 0, "u8", 0], ["clipRight", 1, "u8", 0], ["fanLX", 4, "f32", 0], ["fanLY", 8, "f32", 0], ["fanRX", 12, "f32", 0], ["fanRY", 16, "f32", 0], ["fadeLX", 20, "f32", 0], ["fadeLY", 24, "f32", 0], ["fadeRY", 28, "f32", 0], ["fadeRX", 32, "f32", 0], ["nfanLX", 36, "f32", 0], ["nfanLY", 40, "f32", 0], ["nfanRX", 44, "f32", 0], ["nfanRY", 48, "f32", 0], ["fadeIX", 52, "f32", 0], ["fadeIY", 56, "f32", 0], ["descending", 60, "u8", 0]];
  static $size = 64;
  clipLeft = false;
  clipRight = false;
  fanLX = 0;
  fanLY = 0;
  fanRX = 0;
  fanRY = 0;
  fadeLX = 0;
  fadeLY = 0;
  fadeRY = 0;
  fadeRX = 0;
  nfanLX = 0;
  nfanLY = 0;
  nfanRX = 0;
  nfanRY = 0;
  fadeIX = 0;
  fadeIY = 0;
  descending = false;

  $clone() { return new C4FoWBeamTriangle().$assign(this); }
  $assign(o) {
    this.clipLeft = o.clipLeft;
    this.clipRight = o.clipRight;
    this.fanLX = o.fanLX;
    this.fanLY = o.fanLY;
    this.fanRX = o.fanRX;
    this.fanRY = o.fanRY;
    this.fadeLX = o.fadeLX;
    this.fadeLY = o.fadeLY;
    this.fadeRY = o.fadeRY;
    this.fadeRX = o.fadeRX;
    this.nfanLX = o.nfanLX;
    this.nfanLY = o.nfanLY;
    this.nfanRX = o.nfanRX;
    this.nfanRY = o.nfanRY;
    this.fadeIX = o.fadeIX;
    this.fadeIY = o.fadeIY;
    this.descending = o.descending;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4FoWBeamTriangle });
