// The X display in the browser: COW's top-level windows composited onto a canvas (the root window's
// part they cover), scaled to fit the host element, pixel-crisp; the keyboard and the mouse become the X
// server's device input, as the client oracle's coordinator writes it ("k <keysym>", "K <keysym>",
// "b <n>", "B <n>", "m <x> <y> -": root coordinates).
import type { XServer } from './xlib/xlib.ts';

/** DOM KeyboardEvent.code -> X keysym name (a US keyboard: XLookupString adds Shift as the oracle's does) */
const CODE_KEYSYMS: Record<string, string> = {
  ShiftLeft: 'Shift_L', ShiftRight: 'Shift_R', ControlLeft: 'Control_L', ControlRight: 'Control_R', AltLeft: 'Alt_L',
  AltRight: 'Alt_R', MetaLeft: 'Meta_L', MetaRight: 'Meta_R', CapsLock: 'Caps_Lock', Enter: 'Return', NumpadEnter: 'KP_Enter',
  Backspace: 'BackSpace', Tab: 'Tab', Escape: 'Escape', Space: 'space', Delete: 'Delete', Insert: 'Insert', Home: 'Home',
  End: 'End', PageUp: 'Prior', PageDown: 'Next', ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down',
  Minus: 'minus', Equal: 'equal', BracketLeft: 'bracketleft', BracketRight: 'bracketright', Backslash: 'backslash',
  Semicolon: 'semicolon', Quote: 'apostrophe', Comma: 'comma', Period: 'period', Slash: 'slash', Backquote: 'grave',
  NumpadAdd: 'KP_Add', NumpadSubtract: 'KP_Subtract', NumpadMultiply: 'KP_Multiply', NumpadDivide: 'KP_Divide',
  NumpadDecimal: 'KP_Decimal',
};
for (let i = 0; i < 26; i++) CODE_KEYSYMS[`Key${String.fromCharCode(65 + i)}`] = String.fromCharCode(97 + i);
for (let i = 0; i <= 9; i++) {
  CODE_KEYSYMS[`Digit${i}`] = String(i);
  CODE_KEYSYMS[`Numpad${i}`] = `KP_${i}`;
}
for (let i = 1; i <= 12; i++) CODE_KEYSYMS[`F${i}`] = `F${i}`;

/** keys the browser keeps (reload, full screen, developer tools) */
const BROWSER_KEYS = new Set(['F5', 'F11', 'F12']);

export class Screen {
  readonly canvas: HTMLCanvasElement;
  private g2d: CanvasRenderingContext2D;
  private image: ImageData | null = null;
  private dirty = true;
  private w = 0;
  private h = 0;
  private host: HTMLElement;
  private x: XServer;
  private input: (line: string) => void;
  private down = new Map<string, string>();
  private buttons = new Set<number>();

  /** input(line): a line of device input for the X server */
  constructor(host: HTMLElement, x: XServer, input: (line: string) => void, signal: AbortSignal) {
    this.host = host;
    this.x = x;
    this.input = input;
    host.tabIndex = 0;
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.style.justifyContent = 'center';
    host.style.background = '#000';
    host.style.outline = 'none';
    host.replaceChildren();
    this.canvas = document.createElement('canvas');
    this.canvas.style.imageRendering = 'pixelated';
    host.appendChild(this.canvas);
    this.g2d = this.canvas.getContext('2d')!;
    x.onChange = () => { this.dirty = true; };
    const ro = new ResizeObserver(() => this.fit());
    ro.observe(host);
    signal.addEventListener('abort', () => { ro.disconnect(); x.onChange = null; });
    host.addEventListener('keydown', (e) => this.key(e, true), { signal });
    host.addEventListener('keyup', (e) => this.key(e, false), { signal });
    host.addEventListener('blur', () => this.releaseAll(), { signal });
    this.canvas.addEventListener('mousedown', (e) => this.button(e, true), { signal });
    window.addEventListener('mouseup', (e) => this.button(e, false), { signal });
    window.addEventListener('mousemove', (e) => this.motion(e), { signal });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    host.focus();
  }

  /** the root's part the top-level windows cover (from 0,0) */
  private extent(): [number, number] {
    let w = 1030, h = 774;
    for (const t of this.x.topWindows()) {
      w = Math.max(w, t.x + t.w + 2 * t.bw);
      h = Math.max(h, t.y + t.h + 2 * t.bw);
    }
    return [Math.min(w, this.x.width), Math.min(h, this.x.height)];
  }

  private fit(): void {
    if (!this.w) return;
    const s = Math.min(this.host.clientWidth / this.w, this.host.clientHeight / this.h);
    const dpr = window.devicePixelRatio || 1;
    const scale = s * dpr >= 1 ? Math.floor(s * dpr) / dpr : s;
    this.canvas.style.width = `${Math.floor(this.w * scale)}px`;
    this.canvas.style.height = `${Math.floor(this.h * scale)}px`;
  }

  /** draws the windows if something changed (once per animation frame) */
  paint(): void {
    if (!this.dirty) return;
    this.dirty = false;
    const [w, h] = this.extent();
    if (w !== this.w || h !== this.h || !this.image) {
      this.w = w;
      this.h = h;
      this.canvas.width = w;
      this.canvas.height = h;
      this.image = this.g2d.createImageData(w, h);
      this.fit();
    }
    const px = new Uint32Array(w * h);
    for (const t of this.x.topWindows()) this.x.composite(t.id, px, w, h, t.x + t.bw, t.y + t.bw);
    const d = this.image.data;
    for (let i = 0; i < px.length; i++) {
      const v = px[i];
      d[4 * i] = (v >> 16) & 255;
      d[4 * i + 1] = (v >> 8) & 255;
      d[4 * i + 2] = v & 255;
      d[4 * i + 3] = 255;
    }
    this.g2d.putImageData(this.image, 0, 0);
  }

  private key(e: KeyboardEvent, press: boolean): void {
    if (BROWSER_KEYS.has(e.code)) return;
    e.preventDefault();
    if (press) {
      if (e.repeat && this.down.has(e.code)) {
        // the key repeats: X sends a release and a press for every repeat
        const ks = this.down.get(e.code)!;
        this.input(`K ${ks}`);
        this.input(`k ${ks}`);
        return;
      }
      const ks = CODE_KEYSYMS[e.code];
      if (!ks) return;
      this.down.set(e.code, ks);
      this.input(`k ${ks}`);
    } else {
      const ks = this.down.get(e.code);
      if (!ks) return;
      this.down.delete(e.code);
      this.input(`K ${ks}`);
    }
  }

  private releaseAll(): void {
    for (const ks of this.down.values()) this.input(`K ${ks}`);
    this.down.clear();
    for (const b of this.buttons) this.input(`B ${b}`);
    this.buttons.clear();
  }

  /** root coordinates of a mouse event */
  private place(e: MouseEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    const x = Math.floor(((e.clientX - r.left) / r.width) * this.w);
    const y = Math.floor(((e.clientY - r.top) / r.height) * this.h);
    return [Math.max(0, Math.min(this.w - 1, x)), Math.max(0, Math.min(this.h - 1, y))];
  }

  private button(e: MouseEvent, press: boolean): void {
    const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0;
    if (!b) return;
    if (press) {
      e.preventDefault();
      this.host.focus();
      this.motion(e);
      this.buttons.add(b);
      this.input(`b ${b}`);
    } else if (this.buttons.delete(b)) {
      this.motion(e);
      this.input(`B ${b}`);
    }
  }

  private lastX = -1;
  private lastY = -1;

  private motion(e: MouseEvent): void {
    if (!this.w) return;
    if (e.target !== this.canvas && !this.buttons.size) return;
    const [x, y] = this.place(e);
    if (x === this.lastX && y === this.lastY) return;
    this.lastX = x;
    this.lastY = y;
    this.input(`m ${x} ${y} -`);
  }
}
