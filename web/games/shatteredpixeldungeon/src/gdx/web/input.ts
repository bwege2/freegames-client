// @ts-nocheck
// libGDX's Input for the browser, as the LWJGL3 backend delivers a desktop window's input (Lwjgl3Input,
// DefaultLwjgl3Input, gdx-backend-lwjgl3 1.14.0):
// - keys: KeyboardEvent.code is the physical key, as GLFW's key codes are; mapped to Input.Keys as
//   Lwjgl3Input.getGdxKeyCode maps GLFW's (the Windows/Super keys are Keys.SYM, keys GLFW calls WORLD_1/2
//   and the ones libGDX does not know are UNKNOWN). A key press also types a character: the event's key for
//   printable keys, and as characterForKeyCode does, Backspace 8, Tab 9, Enter and Numpad Enter '\n',
//   Delete 127. Auto-repeat presses give keyDown again, as GLFW_REPEAT does.
// - mouse: pointer 0; buttons LEFT 0, RIGHT 1, MIDDLE 2, BACK 3, FORWARD 4; mouseMoved while no button is down,
//   touchDragged while one is; the wheel is scrolled(amountX, amountY) with GLFW's sign turned as libGDX does
//   (wheel down = +1 per notch: a line or 100 pixels of the browser's delta is one notch).
// - touch (phones, tablets): each finger gets the lowest free pointer index, as libGDX's Android backend, and
//   is button LEFT.
// Positions are in the back buffer's pixels (graphics.ts: the window's size is in device pixels).
// Events are queued and handed to the processor at the start of the next frame, as Lwjgl3Input's event queue.
import { JObject } from '../../jre/lang.ts';
import { Input_Keys as K } from '../core.ts';

const CODES: Record<string, number> = {
  Space: K.SPACE, Quote: K.APOSTROPHE, Comma: K.COMMA, Minus: K.MINUS, Period: K.PERIOD, Slash: K.SLASH,
  Semicolon: K.SEMICOLON, Equal: K.EQUALS, BracketLeft: K.LEFT_BRACKET, Backslash: K.BACKSLASH,
  BracketRight: K.RIGHT_BRACKET, Backquote: K.GRAVE, IntlBackslash: K.UNKNOWN, Escape: K.ESCAPE, Enter: K.ENTER,
  Tab: K.TAB, Backspace: K.BACKSPACE, Insert: K.INSERT, Delete: K.FORWARD_DEL, ArrowRight: K.RIGHT,
  ArrowLeft: K.LEFT, ArrowDown: K.DOWN, ArrowUp: K.UP, PageUp: K.PAGE_UP, PageDown: K.PAGE_DOWN, Home: K.HOME,
  End: K.END, CapsLock: K.CAPS_LOCK, ScrollLock: K.SCROLL_LOCK, NumLock: K.NUM_LOCK, PrintScreen: K.PRINT_SCREEN,
  Pause: K.PAUSE, NumpadDecimal: K.NUMPAD_DOT, NumpadDivide: K.NUMPAD_DIVIDE, NumpadMultiply: K.NUMPAD_MULTIPLY,
  NumpadSubtract: K.NUMPAD_SUBTRACT, NumpadAdd: K.NUMPAD_ADD, NumpadEnter: K.NUMPAD_ENTER, NumpadEqual: K.NUMPAD_EQUALS,
  ShiftLeft: K.SHIFT_LEFT, ControlLeft: K.CONTROL_LEFT, AltLeft: K.ALT_LEFT, MetaLeft: K.SYM, ShiftRight: K.SHIFT_RIGHT,
  ControlRight: K.CONTROL_RIGHT, AltRight: K.ALT_RIGHT, MetaRight: K.SYM, ContextMenu: K.MENU, OSLeft: K.SYM, OSRight: K.SYM,
};
for (let i = 0; i < 26; i++) CODES['Key' + String.fromCharCode(65 + i)] = K.A + i;
for (let i = 0; i <= 9; i++) {
  CODES['Digit' + i] = K.NUM_0 + i;
  CODES['Numpad' + i] = K.NUMPAD_0 + i;
}
for (let i = 1; i <= 24; i++) CODES['F' + i] = i <= 12 ? K.F1 + i - 1 : K.F13 + i - 13;

/** libGDX's key code for a KeyboardEvent.code (Keys.UNKNOWN for keys GLFW and libGDX do not name). */
export function gdxKeyCode(code: string): number {
  return CODES[code] ?? K.UNKNOWN;
}

/** The character a key press types (Lwjgl3Input's char callback and characterForKeyCode), or 0. */
function typedChar(e: KeyboardEvent, key: number): number {
  if (key === K.BACKSPACE) return 8;
  if (key === K.TAB) return 9;
  if (key === K.FORWARD_DEL) return 127;
  if (key === K.ENTER || key === K.NUMPAD_ENTER) return 10;
  if (e.ctrlKey || e.metaKey) return 0;
  return [...e.key].length === 1 ? e.key.charCodeAt(0) : 0;
}

/** Keys the browser keeps for itself (reload, full screen, developer tools). */
const BROWSER_KEYS = new Set(['F5', 'F11', 'F12']);

type Ev = (p: any) => void;

export class BrowserInput extends JObject {
  processor: any = null;
  queue: Ev[] = [];
  canvas: HTMLCanvasElement;
  graphics: any;
  x = 0;
  y = 0;
  deltaX = 0;
  deltaY = 0;
  buttons = new Set<number>();
  keys = new Set<number>();
  justPressed = new Set<number>();
  touches = new Map<number, number>(); // pointerId -> pointer index
  touchPos = new Map<number, [number, number]>();
  catchKeys = new Set<number>();
  cursorCatched = false;
  eventTime = 0n;
  /** While a DOM text field has the focus, keys go to it (textfield.ts). */
  textFocus: () => boolean = () => false;

  constructor(canvas: HTMLCanvasElement, graphics: any, signal: AbortSignal) {
    super();
    this.canvas = canvas;
    this.graphics = graphics;
    const on = (t: EventTarget, type: string, f: (e: any) => void, passive = false) =>
      t.addEventListener(type, f, { signal, passive });
    on(canvas, 'pointerdown', (e: PointerEvent) => this.down(e));
    on(canvas, 'pointermove', (e: PointerEvent) => this.move(e));
    on(canvas, 'pointerup', (e: PointerEvent) => this.up(e, false));
    on(canvas, 'pointercancel', (e: PointerEvent) => this.up(e, true));
    on(canvas, 'contextmenu', (e: Event) => e.preventDefault());
    on(canvas, 'wheel', (e: WheelEvent) => this.wheel(e));
    on(canvas, 'keydown', (e: KeyboardEvent) => this.key(e, true));
    on(canvas, 'keyup', (e: KeyboardEvent) => this.key(e, false));
    on(window, 'blur', () => this.releaseAll());
    canvas.style.touchAction = 'none';
  }

  pos(e: { clientX: number; clientY: number }): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    const sx = r.width > 0 ? this.graphics.width / r.width : 1;
    const sy = r.height > 0 ? this.graphics.height / r.height : 1;
    return [Math.floor((e.clientX - r.left) * sx), Math.floor((e.clientY - r.top) * sy)];
  }
  post(f: Ev) {
    const t = BigInt(Math.round(performance.now() * 1e6));
    this.queue.push((p) => { this.eventTime = t; f(p); });
  }
  static button(b: number) { return b === 1 ? 2 : b === 2 ? 1 : b; }

  down(e: PointerEvent) {
    this.canvas.focus({ preventScroll: true });
    try { this.canvas.setPointerCapture(e.pointerId); } catch { /* gone */ }
    const [x, y] = this.pos(e);
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      e.preventDefault();
      let i = 0;
      const used = new Set(this.touches.values());
      while (used.has(i)) i++;
      this.touches.set(e.pointerId, i);
      this.touchPos.set(i, [x, y]);
      this.x = x; this.y = y;
      this.post((p) => p.touchDown(x, y, i, 0));
      return;
    }
    const b = BrowserInput.button(e.button);
    this.buttons.add(b);
    this.setPos(x, y);
    this.post((p) => p.touchDown(x, y, 0, b));
  }
  move(e: PointerEvent) {
    const [x, y] = this.pos(e);
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      const i = this.touches.get(e.pointerId);
      if (i === undefined) return;
      this.touchPos.set(i, [x, y]);
      this.x = x; this.y = y;
      this.post((p) => p.touchDragged(x, y, i));
      return;
    }
    this.setPos(x, y);
    if (this.buttons.size > 0) this.post((p) => p.touchDragged(x, y, 0));
    else this.post((p) => p.mouseMoved(x, y));
  }
  up(e: PointerEvent, cancel: boolean) {
    const [x, y] = this.pos(e);
    if (e.pointerType === 'touch' || e.pointerType === 'pen') {
      const i = this.touches.get(e.pointerId);
      if (i === undefined) return;
      this.touches.delete(e.pointerId);
      this.touchPos.delete(i);
      this.post((p) => (cancel ? p.touchCancelled(x, y, i, 0) : p.touchUp(x, y, i, 0)));
      return;
    }
    const b = BrowserInput.button(e.button);
    if (!this.buttons.delete(b)) return;
    this.setPos(x, y);
    this.post((p) => (cancel ? p.touchCancelled(x, y, 0, b) : p.touchUp(x, y, 0, b)));
  }
  setPos(x: number, y: number) {
    this.deltaX += x - this.x;
    this.deltaY += y - this.y;
    this.x = x;
    this.y = y;
  }
  wheel(e: WheelEvent) {
    e.preventDefault();
    const unit = e.deltaMode === 1 ? 3 : e.deltaMode === 2 ? 1 / 1 : 100;
    const ax = Math.fround(e.deltaX / unit), ay = Math.fround(e.deltaY / unit);
    if (ax === 0 && ay === 0) return;
    this.post((p) => p.scrolled(ax, ay));
  }
  key(e: KeyboardEvent, down: boolean) {
    if (this.textFocus()) return;
    if (BROWSER_KEYS.has(e.code)) return;
    const k = gdxKeyCode(e.code);
    // the game gets every key; the browser's own uses of them (scrolling, find, tab focus) are stopped
    if (!(e.ctrlKey && (e.code === 'KeyC' || e.code === 'KeyV' || e.code === 'KeyX'))) e.preventDefault();
    if (down) {
      this.keys.add(k);
      this.justPressed.add(k);
      this.post((p) => p.keyDown(k));
      const c = typedChar(e, k);
      if (c !== 0) this.post((p) => p.keyTyped(c));
    } else {
      this.keys.delete(k);
      this.post((p) => p.keyUp(k));
    }
  }
  releaseAll() {
    for (const k of this.keys) this.post((p) => p.keyUp(k));
    this.keys.clear();
  }

  /** Hands the queued events to the processor (Lwjgl3Input.update, before the frame). */
  update() {
    const q = this.queue;
    this.queue = [];
    if (this.processor) for (const f of q) f(this.processor);
  }
  /** After the frame (Lwjgl3Input.prepareNext). */
  prepareNext() {
    this.justPressed.clear();
    this.deltaX = 0;
    this.deltaY = 0;
  }

  setInputProcessor(p: any) { this.processor = p; }
  getInputProcessor() { return this.processor; }
  getX(_p?: number) { if (_p) return this.touchPos.get(_p)?.[0] ?? 0; return this.x; }
  getY(_p?: number) { if (_p) return this.touchPos.get(_p)?.[1] ?? 0; return this.y; }
  getDeltaX() { return this.deltaX; }
  getDeltaY() { return this.deltaY; }
  isTouched() { return this.buttons.size > 0 || this.touches.size > 0; }
  justTouched() { return false; }
  isButtonPressed(b: number) { return this.buttons.has(b); }
  isButtonJustPressed(_b: number) { return false; }
  isKeyPressed(k: number) { return k === K.ANY_KEY ? this.keys.size > 0 : this.keys.has(k); }
  isKeyJustPressed(k: number) { return k === K.ANY_KEY ? this.justPressed.size > 0 : this.justPressed.has(k); }
  getCurrentEventTime() { return this.eventTime; }
  getMaxPointers() { return 20; }
  getPressure() { return this.isTouched() ? 1 : 0; }
  isPeripheralAvailable(p: any) { return p != null && p.name() === 'HardwareKeyboard'; }
  setCatchKey(k: number, c: boolean) { if (c) this.catchKeys.add(k); else this.catchKeys.delete(k); }
  isCatchKey(k: number) { return this.catchKeys.has(k); }
  setCursorCatched(c: boolean) {
    this.cursorCatched = c;
    this.graphics.cursorHidden = c;
    this.graphics.applyCursor();
  }
  isCursorCatched() { return this.cursorCatched; }
  setCursorPosition(x: number, y: number) { this.x = x; this.y = y; }
  setOnscreenKeyboardVisible() {}
  vibrate(ms: number) { try { navigator.vibrate?.(ms); } catch { /* not allowed */ } }
  getRotation() { return 0; }
  getNativeOrientation() { return null; }
  getAccelerometerX() { return 0; }
  getAccelerometerY() { return 0; }
  getAccelerometerZ() { return 0; }
}
