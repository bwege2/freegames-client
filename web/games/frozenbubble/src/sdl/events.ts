// SDL 1.2.15's event layer (src/events/SDL_events.c, SDL_keyboard.c, SDL_mouse.c): the event queue,
// keyboard and mouse state, key repeat in SDL_CheckKeyRepeat, SDL_WaitEvent's 10 ms poll. Input comes
// from the platform's pump (the page's keys and mouse, or a test session's script) through
// privateKeyboard / privateMouseMotion / privateMouseButton, as a video driver's PumpEvents posts it.

export const NOEVENT = 0, ACTIVEEVENT = 1, KEYDOWN = 2, KEYUP = 3, MOUSEMOTION = 4, MOUSEBUTTONDOWN = 5,
  MOUSEBUTTONUP = 6, JOYAXISMOTION = 7, JOYBUTTONDOWN = 10, JOYBUTTONUP = 11, QUIT = 12;
export const PRESSED = 1, RELEASED = 0;

export const KMOD_LSHIFT = 0x0001, KMOD_RSHIFT = 0x0002, KMOD_LCTRL = 0x0040, KMOD_RCTRL = 0x0080,
  KMOD_LALT = 0x0100, KMOD_RALT = 0x0200, KMOD_LMETA = 0x0400, KMOD_RMETA = 0x0800, KMOD_NUM = 0x1000,
  KMOD_CAPS = 0x2000, KMOD_MODE = 0x4000;

/** SDL 1.2 key symbols (SDL_keysym.h) */
export const SDLK = {
  UNKNOWN: 0, BACKSPACE: 8, TAB: 9, CLEAR: 12, RETURN: 13, PAUSE: 19, ESCAPE: 27, SPACE: 32, EXCLAIM: 33,
  QUOTEDBL: 34, HASH: 35, DOLLAR: 36, AMPERSAND: 38, QUOTE: 39, LEFTPAREN: 40, RIGHTPAREN: 41, ASTERISK: 42,
  PLUS: 43, COMMA: 44, MINUS: 45, PERIOD: 46, SLASH: 47,
  '0': 48, '1': 49, '2': 50, '3': 51, '4': 52, '5': 53, '6': 54, '7': 55, '8': 56, '9': 57,
  COLON: 58, SEMICOLON: 59, LESS: 60, EQUALS: 61, GREATER: 62, QUESTION: 63, AT: 64, LEFTBRACKET: 91,
  BACKSLASH: 92, RIGHTBRACKET: 93, CARET: 94, UNDERSCORE: 95, BACKQUOTE: 96,
  a: 97, b: 98, c: 99, d: 100, e: 101, f: 102, g: 103, h: 104, i: 105, j: 106, k: 107, l: 108, m: 109, n: 110,
  o: 111, p: 112, q: 113, r: 114, s: 115, t: 116, u: 117, v: 118, w: 119, x: 120, y: 121, z: 122, DELETE: 127,
  KP0: 256, KP1: 257, KP2: 258, KP3: 259, KP4: 260, KP5: 261, KP6: 262, KP7: 263, KP8: 264, KP9: 265,
  KP_PERIOD: 266, KP_DIVIDE: 267, KP_MULTIPLY: 268, KP_MINUS: 269, KP_PLUS: 270, KP_ENTER: 271, KP_EQUALS: 272,
  UP: 273, DOWN: 274, RIGHT: 275, LEFT: 276, INSERT: 277, HOME: 278, END: 279, PAGEUP: 280, PAGEDOWN: 281,
  F1: 282, F2: 283, F3: 284, F4: 285, F5: 286, F6: 287, F7: 288, F8: 289, F9: 290, F10: 291, F11: 292, F12: 293,
  F13: 294, F14: 295, F15: 296, NUMLOCK: 300, CAPSLOCK: 301, SCROLLOCK: 302, RSHIFT: 303, LSHIFT: 304,
  RCTRL: 305, LCTRL: 306, RALT: 307, LALT: 308, RMETA: 309, LMETA: 310, LSUPER: 311, RSUPER: 312, MODE: 313,
  COMPOSE: 314, HELP: 315, PRINT: 316, SYSREQ: 317, BREAK: 318, MENU: 319, POWER: 320, EURO: 321, UNDO: 322,
} as const;

/** the names of key symbols (lower case, without SDLK_), for session scripts and fbsyms */
export const KEYNAMES: Record<string, number> = {};
for (const [k, v] of Object.entries(SDLK)) KEYNAMES[k.toLowerCase()] = v;
for (let i = 0; i <= 95; i++) KEYNAMES[`world_${i}`] = 160 + i;

export interface SDLEvent {
  type: number;
  // key
  state: number;
  sym: number;
  mod: number;
  unicode: number;
  // mouse (motion: `button` is the button state mask, as SDL_perl reads event->button.button there)
  button: number;
  x: number;
  y: number;
  xrel: number;
  yrel: number;
}

function blank(type: number): SDLEvent {
  return { type, state: 0, sym: 0, mod: 0, unicode: 0, button: 0, x: 0, y: 0, xrel: 0, yrel: 0 };
}

const MAXEVENTS = 128;

export interface EventPlatform {
  ticks(): number;
  delay(ms: number): Promise<void>;
  /** the video driver's PumpEvents: post due input through the events object */
  pump(ev: Events): void;
}

export class Events {
  private queue: SDLEvent[] = [];
  readonly keyState = new Uint8Array(323);
  modState = 0;
  unicode = false;
  private repeat = { firsttime: 0, delay: 0, interval: 0, timestamp: 0, evt: blank(0) };
  mouseX = 0;
  mouseY = 0;
  buttonState = 0;
  mouseMaxX = 640;
  mouseMaxY = 480;
  private readonly p: EventPlatform;

  constructor(p: EventPlatform) { this.p = p; }

  private push(e: SDLEvent): void {
    if (this.queue.length < MAXEVENTS - 1) this.queue.push(e);
  }

  /** SDL_PrivateKeyboard */
  privateKeyboard(state: number, sym: number, unicode: number): void {
    let modstate = this.modState;
    let repeatable = false;
    let mod = 0;
    if (state === PRESSED) {
      mod = modstate;
      switch (sym) {
        case SDLK.UNKNOWN: break;
        case SDLK.NUMLOCK:
          modstate ^= KMOD_NUM;
          if (!(modstate & KMOD_NUM)) state = RELEASED;
          mod = modstate;
          break;
        case SDLK.CAPSLOCK:
          modstate ^= KMOD_CAPS;
          if (!(modstate & KMOD_CAPS)) state = RELEASED;
          mod = modstate;
          break;
        case SDLK.LCTRL: modstate |= KMOD_LCTRL; break;
        case SDLK.RCTRL: modstate |= KMOD_RCTRL; break;
        case SDLK.LSHIFT: modstate |= KMOD_LSHIFT; break;
        case SDLK.RSHIFT: modstate |= KMOD_RSHIFT; break;
        case SDLK.LALT: modstate |= KMOD_LALT; break;
        case SDLK.RALT: modstate |= KMOD_RALT; break;
        case SDLK.LMETA: modstate |= KMOD_LMETA; break;
        case SDLK.RMETA: modstate |= KMOD_RMETA; break;
        case SDLK.MODE: modstate |= KMOD_MODE; break;
        default: repeatable = true; break;
      }
    } else {
      switch (sym) {
        case SDLK.UNKNOWN: break;
        case SDLK.NUMLOCK: case SDLK.CAPSLOCK: return;
        case SDLK.LCTRL: modstate &= ~KMOD_LCTRL; break;
        case SDLK.RCTRL: modstate &= ~KMOD_RCTRL; break;
        case SDLK.LSHIFT: modstate &= ~KMOD_LSHIFT; break;
        case SDLK.RSHIFT: modstate &= ~KMOD_RSHIFT; break;
        case SDLK.LALT: modstate &= ~KMOD_LALT; break;
        case SDLK.RALT: modstate &= ~KMOD_RALT; break;
        case SDLK.LMETA: modstate &= ~KMOD_LMETA; break;
        case SDLK.RMETA: modstate &= ~KMOD_RMETA; break;
        case SDLK.MODE: modstate &= ~KMOD_MODE; break;
      }
      mod = modstate;
    }
    const ev = blank(state === PRESSED ? KEYDOWN : KEYUP);
    if (state === RELEASED && this.repeat.timestamp && this.repeat.evt.sym === sym) this.repeat.timestamp = 0;
    if (sym !== SDLK.UNKNOWN) {
      if (this.keyState[sym] === state) return;
      this.modState = modstate;
      this.keyState[sym] = state;
    }
    ev.state = state;
    ev.sym = sym;
    ev.mod = mod;
    ev.unicode = this.unicode ? unicode : 0;
    if (repeatable && this.repeat.delay !== 0) {
      this.repeat.evt = { ...ev };
      this.repeat.firsttime = 1;
      this.repeat.timestamp = this.p.ticks() >>> 0;
    }
    this.push(ev);
  }

  /** SDL_PrivateMouseMotion(buttonstate, relative = 0, x, y) */
  privateMouseMotion(buttonstate: number, x: number, y: number): void {
    if (!buttonstate) buttonstate = this.buttonState;
    const X = x < 0 ? 0 : x >= this.mouseMaxX ? this.mouseMaxX - 1 : x;
    const Y = y < 0 ? 0 : y >= this.mouseMaxY ? this.mouseMaxY - 1 : y;
    const xrel = X - this.mouseX, yrel = Y - this.mouseY;
    if (!xrel && !yrel) return;
    this.buttonState = buttonstate;
    this.mouseX = X;
    this.mouseY = Y;
    const ev = blank(MOUSEMOTION);
    ev.button = buttonstate;
    ev.x = X;
    ev.y = Y;
    ev.xrel = xrel;
    ev.yrel = yrel;
    this.push(ev);
  }

  /** SDL_PrivateMouseButton */
  privateMouseButton(state: number, button: number, x: number, y: number): void {
    let move = false;
    if (x || y) {
      move = true;
      if (x < 0) x = 0; else if (x >= this.mouseMaxX) x = this.mouseMaxX - 1;
      if (y < 0) y = 0; else if (y >= this.mouseMaxY) y = this.mouseMaxY - 1;
    }
    if (!x) x = this.mouseX;
    if (!y) y = this.mouseY;
    const ev = blank(state === PRESSED ? MOUSEBUTTONDOWN : MOUSEBUTTONUP);
    if (state === PRESSED) this.buttonState |= 1 << (button - 1);
    else this.buttonState &= ~(1 << (button - 1));
    if (move) { this.mouseX = x; this.mouseY = y; }
    ev.state = state;
    ev.button = button;
    ev.x = x;
    ev.y = y;
    this.push(ev);
  }

  pushQuit(): void { this.push(blank(QUIT)); }

  /** SDL_CheckKeyRepeat */
  private checkKeyRepeat(): void {
    const r = this.repeat;
    if (r.timestamp) {
      const now = this.p.ticks() >>> 0;
      const interval = (now - r.timestamp) >>> 0;
      if (r.firsttime) {
        if (interval > (r.delay >>> 0)) { r.timestamp = now; r.firsttime = 0; }
      } else if (interval > (r.interval >>> 0)) {
        r.timestamp = now;
        this.push({ ...r.evt });
      }
    }
  }

  /** SDL_PumpEvents */
  pumpEvents(): void {
    this.p.pump(this);
    this.checkKeyRepeat();
  }

  /** SDL_PollEvent: the next event, or null */
  pollEvent(): SDLEvent | null {
    this.pumpEvents();
    return this.queue.shift() ?? null;
  }

  /** SDL_WaitEvent: pump, peep, SDL_Delay(10) until there is one */
  async waitEvent(): Promise<SDLEvent> {
    for (;;) {
      this.pumpEvents();
      const e = this.queue.shift();
      if (e) return e;
      await this.p.delay(10);
    }
  }

  /** SDL_EnableKeyRepeat */
  enableKeyRepeat(delay: number, interval: number): void {
    if (delay < 0 || interval < 0) return;
    this.repeat.firsttime = 0;
    this.repeat.delay = delay;
    this.repeat.interval = interval;
    this.repeat.timestamp = 0;
  }

  /** SDL_WarpMouse on a driver without WarpWMCursor */
  warpMouse(x: number, y: number): void { this.privateMouseMotion(0, x, y); }
}
