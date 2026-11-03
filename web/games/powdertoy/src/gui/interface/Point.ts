// gui/interface/Point.h (ui::Point = Vec2<int>), gui/interface/Colour.h (ui::Colour = RGBA), Border.h, and the
// Vec2 operators the GUI uses. Colours are numbers as in graphics/raster.ts: RGB 0xRRGGBB, RGBA 0xAARRGGBB.
import type { Vec2, Rect } from '../../sim/vec2.ts';
export type { Vec2, Rect };
export { RectSized, RectBetween, rectAnd, rectContains } from '../../sim/vec2.ts';
export { RGBA, RGB, WithAlpha, NoAlpha, AlphaOf } from '../../graphics/raster.ts';

export type Point = Vec2;

/** ui::Point(x, y) */
export function Point(X: number, Y: number): Point {
  return { X, Y };
}
export function add(a: Vec2, b: Vec2): Vec2 {
  return { X: a.X + b.X, Y: a.Y + b.Y };
}
export function sub(a: Vec2, b: Vec2): Vec2 {
  return { X: a.X - b.X, Y: a.Y - b.Y };
}
/** Vec2<int> / int (truncating) */
export function divi(a: Vec2, d: number): Vec2 {
  return { X: (a.X / d) | 0, Y: (a.Y / d) | 0 };
}
export function muli(a: Vec2, m: number): Vec2 {
  return { X: a.X * m, Y: a.Y * m };
}
export function copy(a: Vec2): Vec2 {
  return { X: a.X, Y: a.Y };
}
export function eq(a: Vec2, b: Vec2): boolean {
  return a.X === b.X && a.Y === b.Y;
}

/** ui::Colour component access (RGBA packed 0xAARRGGBB) */
export function Red(c: number): number { return (c >>> 16) & 0xFF; }
export function Green(c: number): number { return (c >>> 8) & 0xFF; }
export function Blue(c: number): number { return c & 0xFF; }
export function Alpha(c: number): number { return c >>> 24; }
/** ui::Colour(r, g, b, a = 255) */
export function Colour(r: number, g: number, b: number, a = 255): number {
  return (((a & 0xFF) << 24) | ((r & 0xFF) << 16) | ((g & 0xFF) << 8) | (b & 0xFF)) >>> 0;
}
export function SetAlpha(c: number, a: number): number {
  return (((a & 0xFF) << 24) | (c & 0xFFFFFF)) >>> 0;
}

/** ui::Border */
export class Border {
  Top: number;
  Right: number;
  Bottom: number;
  Left: number;
  constructor(top: number, right?: number, bottom?: number, left?: number) {
    if (right === undefined) { this.Top = this.Right = this.Bottom = this.Left = top; }
    else if (bottom === undefined) { this.Top = this.Bottom = top; this.Right = this.Left = right; }
    else { this.Top = top; this.Right = right; this.Bottom = bottom; this.Left = left!; }
  }
  /** operator == (int) */
  isAll(v: number): boolean {
    return this.Top === v && this.Right === v && this.Bottom === v && this.Left === v;
  }
  clone(): Border {
    return new Border(this.Top, this.Right, this.Bottom, this.Left);
  }
}
