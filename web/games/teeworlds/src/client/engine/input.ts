// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/input.h and engine/client/input.cpp of Teeworlds 0.7.5 in TypeScript: the events (press,
// release, text) of the browser's keyboard, mouse and wheel instead of SDL's, the same key numbers (SDL keycodes
// mapped to keys.h), key states and press counters. The relative mouse is the Pointer Lock API; while the pointer
// is not locked (before the first click, after Esc) the mouse moves the system cursor and AbsolutePos() gives it,
// which the client uses to aim and to point in the menus (a deviation the browser forces). No joysticks.
import { f } from '../../base/vmath.ts';
import { utf8Encode } from '../../base/system.ts';
import type { CConfig } from '../../generated/config.ts';
import * as K from './keys.ts';

export const FLAG_PRESS = 1, FLAG_RELEASE = 2, FLAG_REPEAT = 4, FLAG_TEXT = 8;
const INPUT_BUFFER_SIZE = 32;

export interface CEvent { m_Flags: number; m_Key: number; m_aText: string; m_InputCount: number }

/** KeyboardEvent.code of the keys whose SDL keycode is not their character */
const CODES: Record<string, number> = {
  Backspace: K.KEY_BACKSPACE, Tab: K.KEY_TAB, Enter: K.KEY_RETURN, Escape: K.KEY_ESCAPE, Space: K.KEY_SPACE, Delete: K.KEY_DELETE,
  CapsLock: K.KEY_CAPSLOCK, PrintScreen: K.KEY_PRINTSCREEN, ScrollLock: K.KEY_SCROLLLOCK, Pause: K.KEY_PAUSE, Insert: K.KEY_INSERT,
  Home: K.KEY_HOME, PageUp: K.KEY_PAGEUP, End: K.KEY_END, PageDown: K.KEY_PAGEDOWN, ArrowRight: K.KEY_RIGHT, ArrowLeft: K.KEY_LEFT,
  ArrowDown: K.KEY_DOWN, ArrowUp: K.KEY_UP, NumLock: K.KEY_NUMLOCKCLEAR, NumpadDivide: K.KEY_KP_DIVIDE, NumpadMultiply: K.KEY_KP_MULTIPLY,
  NumpadSubtract: K.KEY_KP_MINUS, NumpadAdd: K.KEY_KP_PLUS, NumpadEnter: K.KEY_KP_ENTER, Numpad1: K.KEY_KP_1, Numpad2: K.KEY_KP_2,
  Numpad3: K.KEY_KP_3, Numpad4: K.KEY_KP_4, Numpad5: K.KEY_KP_5, Numpad6: K.KEY_KP_6, Numpad7: K.KEY_KP_7, Numpad8: K.KEY_KP_8,
  Numpad9: K.KEY_KP_9, Numpad0: K.KEY_KP_0, NumpadDecimal: K.KEY_KP_PERIOD, NumpadEqual: K.KEY_KP_EQUALS, ContextMenu: K.KEY_APPLICATION,
  ControlLeft: K.KEY_LCTRL, ShiftLeft: K.KEY_LSHIFT, AltLeft: K.KEY_LALT, MetaLeft: K.KEY_LGUI, ControlRight: K.KEY_RCTRL,
  ShiftRight: K.KEY_RSHIFT, AltRight: K.KEY_RALT, MetaRight: K.KEY_RGUI,
  Digit0: 48, Digit1: 49, Digit2: 50, Digit3: 51, Digit4: 52, Digit5: 53, Digit6: 54, Digit7: 55, Digit8: 56, Digit9: 57,
  Minus: 45, Equal: 61, BracketLeft: 91, BracketRight: 93, Backslash: 92, Semicolon: 59, Quote: 39, Backquote: 96, Comma: 44,
  Period: 46, Slash: 47, IntlBackslash: 60,
};
for (let i = 1; i <= 12; i++) CODES['F' + i] = K.KEY_F1 + i - 1;

/** the key of a keyboard event (SDL's keycode: the layout's unshifted character, or the special key) */
export function KeyOfEvent(e: KeyboardEvent): number {
  if (e.key.length === 1) {
    const c = e.key.toLowerCase();
    if (c >= 'a' && c <= 'z') return c.charCodeAt(0);
  }
  return CODES[e.code] ?? K.KEY_UNKNOWN;
}

export class CInput {
  private m_aInputCount = new Uint16Array(K.g_MaxKeys);
  private m_aInputState = new Uint8Array(K.g_MaxKeys);
  private m_InputCounter = 1;
  private m_InputGrabbed = 0;
  private m_MouseDoubleClick = false;
  private m_aInputEvents: CEvent[] = [];
  /** the events of the browser since the last Update */
  private pending: { text?: string; key: number; flags: number; down?: boolean; up?: boolean; dbl?: boolean }[] = [];
  private held = new Set<number>();
  private relX = 0;
  private relY = 0;
  private absX = 0;
  private absY = 0;
  private m_pConfig: CConfig;
  private el: HTMLElement | null = null;
  /** the pointer was unlocked by the browser (Esc): the client opens its menu */
  onUnlock: (() => void) | null = null;
  /** the menu is open or the chat is typed into: a click does not lock the pointer */
  wantLock: () => boolean = () => true;
  private clipboard = '';

  constructor(config: CConfig) { this.m_pConfig = config; }

  NumEvents(): number { return this.m_aInputEvents.length; }
  GetEvent(Index: number): CEvent {
    if (Index < 0 || Index >= this.m_aInputEvents.length) return { m_Flags: 0, m_Key: 0, m_aText: '', m_InputCount: 0 };
    return this.m_aInputEvents[Index];
  }
  IsEventValid(pEvent: CEvent): boolean { return pEvent.m_InputCount === this.m_InputCounter; }
  KeyName(Key: number): string { return Key >= 0 && Key < K.g_MaxKeys ? K.g_aaKeyStrings[Key] : K.g_aaKeyStrings[0]; }
  KeyIsPressed(Key: number): boolean { return this.KeyState(Key); }
  KeyPress(Key: number, CheckCounter = false): boolean {
    return CheckCounter ? this.m_aInputCount[Key] === this.m_InputCounter : this.m_aInputCount[Key] !== 0;
  }
  KeyState(Key: number): boolean { return this.m_aInputState[Key] !== 0; }

  /** Init: listens on el (the canvas) and the window */
  Init(el: HTMLElement, signal: AbortSignal): void {
    this.el = el;
    const o = { signal };
    const doc = el.ownerDocument;
    const win = doc.defaultView!;
    win.addEventListener('keydown', (e) => {
      if (!this.active()) return;
      const Key = KeyOfEvent(e);
      // the browser keeps its own shortcuts for reload and developer tools
      if (e.key === 'F5' || e.key === 'F12' || ((e.ctrlKey || e.metaKey) && (e.key === 'r' || e.key === 'R'))) return;
      e.preventDefault();
      if (Key !== K.KEY_UNKNOWN && !e.repeat) {
        this.held.add(Key);
        this.pending.push({ key: Key, flags: FLAG_PRESS, down: true });
      } else if (Key !== K.KEY_UNKNOWN && e.repeat) this.pending.push({ key: Key, flags: FLAG_PRESS | FLAG_REPEAT });
      if (e.key.length >= 1 && [...e.key].length === 1 && !e.ctrlKey && !e.metaKey && e.key >= ' ') this.pending.push({ text: utf8Encode(e.key), key: 0, flags: FLAG_TEXT });
      if ((e.ctrlKey || e.metaKey) && (e.key === 'v' || e.key === 'V')) void navigator.clipboard?.readText?.().then((t) => { this.clipboard = t; }).catch(() => {});
    }, o);
    win.addEventListener('keyup', (e) => {
      const Key = KeyOfEvent(e);
      if (Key === K.KEY_UNKNOWN || !this.held.has(Key)) return;
      this.held.delete(Key);
      this.pending.push({ key: Key, flags: FLAG_RELEASE, up: true });
    }, o);
    win.addEventListener('blur', () => {
      for (const Key of this.held) this.pending.push({ key: Key, flags: FLAG_RELEASE, up: true });
      this.held.clear();
    }, o);
    const btn = (b: number): number => [K.KEY_MOUSE_1, K.KEY_MOUSE_3, K.KEY_MOUSE_2, K.KEY_MOUSE_4, K.KEY_MOUSE_5][b] ?? K.KEY_MOUSE_6;
    el.addEventListener('mousedown', (e) => {
      e.preventDefault();
      el.focus?.();
      if (!this.locked() && this.m_InputGrabbed && this.wantLock()) this.Lock();
      const Key = btn(e.button);
      this.held.add(Key);
      this.pending.push({ key: Key, flags: FLAG_PRESS, down: true, dbl: e.button === 0 ? e.detail % 2 === 0 : undefined });
    }, o);
    win.addEventListener('mouseup', (e) => {
      const Key = btn(e.button);
      if (!this.held.has(Key)) return;
      this.held.delete(Key);
      this.pending.push({ key: Key, flags: FLAG_RELEASE, up: true });
    }, o);
    el.addEventListener('contextmenu', (e) => e.preventDefault(), o);
    win.addEventListener('mousemove', (e) => {
      if (this.locked()) {
        this.relX += e.movementX;
        this.relY += e.movementY;
      }
      const r = el.getBoundingClientRect();
      this.absX = e.clientX - r.left;
      this.absY = e.clientY - r.top;
    }, o);
    el.addEventListener('wheel', (e) => {
      e.preventDefault();
      if (e.deltaY < 0) this.pending.push({ key: K.KEY_MOUSE_WHEEL_UP, flags: FLAG_PRESS | FLAG_RELEASE });
      if (e.deltaY > 0) this.pending.push({ key: K.KEY_MOUSE_WHEEL_DOWN, flags: FLAG_PRESS | FLAG_RELEASE });
    }, { signal, passive: false });
    doc.addEventListener('pointerlockchange', () => {
      if (!this.locked() && this.m_InputGrabbed) this.onUnlock?.();
    }, o);
    signal.addEventListener('abort', () => {
      if (this.locked()) doc.exitPointerLock();
    });
  }

  private active(): boolean {
    const a = this.el?.ownerDocument.activeElement;
    // typing into a form outside the game (the site's bar) is not the game's
    return !a || a === this.el || a === this.el?.ownerDocument.body || this.el!.contains(a);
  }

  locked(): boolean { return !!this.el && this.el.ownerDocument.pointerLockElement === this.el; }
  Lock(): void {
    const el = this.el as (HTMLElement & { requestPointerLock(o?: unknown): Promise<void> | void }) | null;
    if (!el) return;
    try {
      const r = el.requestPointerLock({ unadjustedMovement: true });
      if (r && typeof (r as Promise<void>).catch === 'function') (r as Promise<void>).catch(() => { try { void el.requestPointerLock(); } catch { /* not allowed now */ } });
    } catch { /* not allowed now */ }
  }
  Unlock(): void {
    if (this.locked()) this.el!.ownerDocument.exitPointerLock();
  }

  /** the system cursor in the canvas, in canvas pixels (CSS pixels times the device pixel ratio) */
  AbsolutePos(): { x: number; y: number } {
    const dpr = typeof devicePixelRatio === 'number' ? devicePixelRatio : 1;
    return { x: this.absX * dpr, y: this.absY * dpr };
  }

  MouseRelative(): { x: number; y: number } {
    if (!this.m_InputGrabbed) return { x: 0, y: 0 };
    const MouseSens = f(this.m_pConfig.m_InpMousesens / 100);
    const nx = this.relX, ny = this.relY;
    this.relX = this.relY = 0;
    return { x: f(nx * MouseSens), y: f(ny * MouseSens) };
  }
  MouseModeAbsolute(): void {
    if (this.m_InputGrabbed) {
      this.m_InputGrabbed = 0;
      this.Unlock();
    }
  }
  MouseModeRelative(): void {
    if (!this.m_InputGrabbed) {
      this.m_InputGrabbed = 1;
      this.relX = this.relY = 0;
    }
  }
  Grabbed(): boolean { return this.m_InputGrabbed !== 0; }
  MouseDoubleClick(): number {
    if (this.m_MouseDoubleClick) {
      this.m_MouseDoubleClick = false;
      return 1;
    }
    return 0;
  }
  GetClipboardText(): string { return utf8Encode(this.clipboard); }
  SetClipboardText(pText: string): void { void navigator.clipboard?.writeText?.(pText).catch(() => {}); }

  Clear(): void {
    this.m_aInputState.fill(0);
    this.m_aInputCount.fill(0);
    this.m_aInputEvents = [];
  }

  NumJoysticks(): number { return 0; }

  private AddEvent(pText: string | undefined, Key: number, Flags: number): void {
    if (this.m_aInputEvents.length !== INPUT_BUFFER_SIZE)
      this.m_aInputEvents.push({ m_Key: Key, m_Flags: Flags, m_aText: pText ?? '', m_InputCount: this.m_InputCounter });
  }

  /** Update: this frame's events; the states of the held keys */
  Update(): number {
    this.m_InputCounter = (this.m_InputCounter % 0xffff) + 1;
    this.m_aInputState.fill(0);
    for (const k of this.held) this.m_aInputState[k] = 1;
    for (const p of this.pending) {
      if (p.flags & FLAG_TEXT) {
        this.AddEvent(p.text, 0, FLAG_TEXT);
        continue;
      }
      if (p.dbl !== undefined) this.m_MouseDoubleClick = p.dbl;
      if (p.flags & FLAG_PRESS) {
        this.m_aInputState[p.key] = 1;
        this.m_aInputCount[p.key] = this.m_InputCounter;
      }
      this.AddEvent(undefined, p.key, p.flags & ~FLAG_REPEAT);
    }
    this.pending = [];
    return 0;
  }

  /** a key event from outside the browser's input (the e2e test hook) */
  Inject(Key: number, Flags: number, text?: string): void {
    if (Flags & FLAG_TEXT) this.pending.push({ text, key: 0, flags: FLAG_TEXT });
    else {
      if (Flags & FLAG_PRESS && !(Flags & FLAG_RELEASE)) this.held.add(Key);
      if (Flags & FLAG_RELEASE) this.held.delete(Key);
      this.pending.push({ key: Key, flags: Flags });
    }
  }
}
