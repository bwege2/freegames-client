// src/guimain.cpp, guibutton.cpp, guicontainer.cpp, guilabel.cpp, guibar.cpp: OpenCity's GUI controls.
// Their state and their mouse rules are the original's (a button gets "mouse over" from the motion events
// and "clicked" when the left button is pressed over it; a container reports its first clicked control).
// They draw on a 2D canvas over the 3D view, in the original's window coordinates (y up from the bottom).
import { FONT_8x8, FONT_X_MOVE } from './font8x8.ts';

export const VISIBLE = 0x01, CLICKED = 0x02, MOUSEOVER = 0x04, BLENDING = 0x40;

export interface Rgba { r: number; g: number; b: number; a: number }
export const PALETTE = {
  BLACK: { r: 0, g: 0, b: 0, a: 255 }, RED: { r: 255, g: 0, b: 0, a: 255 }, GREEN: { r: 0, g: 255, b: 0, a: 255 },
  BLUE: { r: 0, g: 0, b: 255, a: 255 }, YELLOW: { r: 255, g: 255, b: 0, a: 255 }, PINK: { r: 255, g: 0, b: 255, a: 255 },
  WHITE: { r: 255, g: 255, b: 255, a: 255 },
} as const;

/** the 2D context with the window's height, for the y flip */
export interface Screen { ctx: CanvasRenderingContext2D; width: number; height: number }

export type ImageSource = (name: string) => CanvasImageSource | null;

export abstract class GUIMain {
  container: GUIContainer | null = null;
  x = 0; y = 0; w = 0; h = 0;
  attr = 0;
  set(a: number): void { this.attr |= a; }
  unset(a: number): void { this.attr &= ~a; }
  isSet(a: number): boolean { return (this.attr & a) === a; }
  setLocation(x: number, y: number): void { this.x = x; this.y = y; }
  abstract display(s: Screen, ox: number, oy: number): void;
  mouseMotion(_x: number, _y: number): void {}
  mouseButton(_pressed: boolean, _button: number): void {}
}

/** draws an image as the original's textured quad from (0, 0) to (w-1, h-1) */
export function drawQuad(s: Screen, img: CanvasImageSource, x: number, y: number, w: number, h: number): void {
  s.ctx.drawImage(img, x, s.height - (y + h - 1), w - 1, h - 1);
}

/** glRasterPos2i + glCallLists with the 8x8 font: the glyphs' bottom left at (x, y) */
export function drawText(s: Screen, x: number, y: number, c: Rgba, text: string): void {
  const ctx = s.ctx;
  ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
  for (let i = 0; i < text.length; i++) {
    const code = text.charCodeAt(i) & 0xff;
    const gx = x + i * FONT_X_MOVE;
    for (let row = 0; row < 8; row++) {
      const bits = FONT_8x8[code * 8 + row];
      if (bits === 0) continue;
      const py = s.height - (y + row) - 1;
      for (let col = 0; col < 8; col++) if (bits & (0x80 >> col)) ctx.fillRect(gx + col, py, 1, 1);
    }
  }
}

export class GUIButton extends GUIMain {
  readonly normal: string;
  readonly over: string;
  readonly states: number;
  private readonly images: ImageSource;

  constructor(x: number, y: number, w: number, h: number, file: string, images: ImageSource, states = 2) {
    super();
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.normal = `${file}.png`;
    this.over = `${file}_over.png`;
    this.states = states;
    this.images = images;
    this.set(VISIBLE | BLENDING);
  }

  display(s: Screen, ox: number, oy: number): void {
    if (!this.isSet(VISIBLE)) return;
    const img = this.images(this.isSet(MOUSEOVER) && this.states > 1 ? this.over : this.normal);
    if (img) drawQuad(s, img, ox + this.x, oy + this.y, this.w, this.h);
  }

  /** x, y: the window coordinates with y up (winH - mouseY - 1) */
  override mouseMotion(x: number, y: number): void {
    if (!this.isSet(VISIBLE) || !this.container) return;
    const mx = this.container.x + this.x, my = this.container.y + this.y;
    if (x >= mx && x <= mx + this.w && y >= my && y <= my + this.h) this.set(MOUSEOVER);
    else this.unset(MOUSEOVER | CLICKED);
  }

  override mouseButton(pressed: boolean, button: number): void {
    if (!this.isSet(VISIBLE)) return;
    if (pressed && button === 0) {
      if (this.isSet(MOUSEOVER)) this.set(CLICKED);
      else this.unset(CLICKED);
    }
  }
}

export class GUILabel extends GUIMain {
  text: string;
  align: 'left' | 'right' | 'center' = 'left';
  color: Rgba = PALETTE.BLACK;

  constructor(x: number, y: number, w: number, h: number, text: string) {
    super();
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.text = text;
    this.set(VISIBLE);
  }

  display(s: Screen, ox: number, oy: number): void {
    if (!this.isSet(VISIBLE)) return;
    let x = this.x;
    if (this.align === 'right') x += (this.w - FONT_X_MOVE * this.text.length) | 0;
    else if (this.align === 'center') {
      // unsigned arithmetic: a text wider than the label puts the raster position out of range, and
      // GL then draws nothing
      const d = this.w - FONT_X_MOVE * this.text.length;
      if (d < 0) return;
      x += Math.trunc(d / 2);
    }
    drawText(s, ox + x, oy + this.y, this.color, this.text);
  }
}

export class GUIBar extends GUIMain {
  color: Rgba = PALETTE.BLACK;
  initialValue = 20;
  value = 1;
  heightRatio = 0;   // OC_BAR_INITIAL_RATIO is 1/20 in integer arithmetic: 0
  widthRatio = 1;

  constructor(x: number, y: number, w: number, h: number) {
    super();
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.set(VISIBLE);
  }

  setInitialValue(v: number): void { this.initialValue = Math.fround(v); }
  setValue(v: number): void {
    this.value = Math.fround(v);
    this.heightRatio = Math.fround(this.value / this.initialValue);
  }

  display(s: Screen, ox: number, oy: number): void {
    if (!this.isSet(VISIBLE)) return;
    const w = Math.trunc((this.w - 1) * this.widthRatio) >>> 0;
    const h = Math.trunc((this.h - 1) * this.heightRatio) >>> 0;
    const c = this.color;
    s.ctx.fillStyle = `rgba(${c.r},${c.g},${c.b},${c.a / 255})`;
    s.ctx.fillRect(ox + this.x, s.height - (oy + this.y + h), w, h);
  }
}

export class GUIContainer extends GUIMain {
  readonly children: GUIMain[] = [];
  winW: number;
  winH: number;
  background: string | null;
  private readonly images: ImageSource;

  constructor(x: number, y: number, w: number, h: number, background: string | null, images: ImageSource, winW: number, winH: number) {
    super();
    this.x = x; this.y = y; this.w = w; this.h = h;
    this.background = background;
    this.images = images;
    this.winW = winW;
    this.winH = winH;
  }

  add(c: GUIMain): number {
    c.container = this;
    this.children.push(c);
    return this.children.length;
  }

  /** the 1-based index of the first control that is clicked with the mouse over it, else 0 */
  getClick(): number {
    if (!this.isSet(VISIBLE)) return 0;
    for (let i = 0; i < this.children.length; i++) if (this.children[i].isSet(CLICKED | MOUSEOVER)) return i + 1;
    return 0;
  }

  setChild(index: number, a: number): void { this.children[index - 1].set(a); }
  resetAttribute(a: number): void { for (const c of this.children) c.unset(a); }
  setSize(w: number, h: number): void { this.w = w; this.h = h; }
  resize(w: number, h: number): void { this.winW = w; this.winH = h; }

  display(s: Screen): void {
    if (!this.isSet(VISIBLE)) return;
    if (this.background) {
      const img = this.images(this.background);
      if (img) drawQuad(s, img, this.x, this.y, this.w, this.h);
    }
    for (const c of this.children) c.display(s, this.x, this.y);
  }

  /** mouse coordinates from the top left, as SDL gives them */
  override mouseMotion(mx: number, my: number): void {
    if (!this.isSet(VISIBLE)) return;
    for (const c of this.children) c.mouseMotion(mx, this.winH - my - 1);
  }

  override mouseButton(pressed: boolean, button: number): void {
    if (!this.isSet(VISIBLE)) return;
    for (const c of this.children) c.mouseButton(pressed, button);
  }
}

/** GUIBUTTON_POSITION_1..6 of guibutton.h: the six places on a tool circle */
export const POS: [number, number, number, number][] = [
  [19, 73, 30, 30], [19, 33, 30, 30], [55, 13, 30, 30], [91, 33, 30, 30], [91, 73, 30, 30], [55, 93, 30, 30],
];
