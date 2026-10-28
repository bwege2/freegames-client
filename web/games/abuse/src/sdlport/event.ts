// sdlport/event.cpp and sdlport/mouse.cpp: SDL's input as the engine's events, and the mouse cursor
import { event, EV_KEY, EV_KEYRELEASE, EV_MOUSE_BUTTON, EV_MOUSE_MOVE, EV_REDRAW, EV_SPURIOUS, LEFT_BUTTON, RIGHT_BUTTON } from '../imlib/event.ts';
import { linked_list } from '../imlib/linked.ts';
import { image } from '../imlib/image.ts';
import { Filter } from '../imlib/filter.ts';
import type { palette } from '../imlib/palette.ts';
import { sprite } from '../imlib/sprite.ts';
import * as K from '../imlib/keys.ts';
import { Timer, platform, KMOD_ALT, KMOD_CTRL, KMOD_SHIFT, SDL_KEYDOWN, SDL_KEYUP, SDL_MOUSEBUTTONDOWN, SDL_MOUSEBUTTONUP, SDL_QUIT } from '../rt/platform.ts';
import { update_dirty } from './video.ts';
import { G } from '../globals.ts';
import { ExitProgram } from '../imlib/dprint.ts';

/** SDL 1.2 key symbols */
export const SDLK = {
  BACKSPACE: 8, TAB: 9, RETURN: 13, ESCAPE: 27, SPACE: 32, QUOTEDBL: 34, ASTERISK: 42, PLUS: 43, COMMA: 44,
  MINUS: 45, PERIOD: 46, SLASH: 47, N0: 48, N1: 49, N5: 53, N6: 54, N7: 55, N8: 56, N9: 57, COLON: 58, SEMICOLON: 59,
  LESS: 60, EQUALS: 61, GREATER: 62, QUESTION: 63, CARET: 94, UNDERSCORE: 95, QUOTE: 39, a: 97, z: 122, DELETE: 127,
  KP0: 256, KP2: 258, KP4: 260, KP6: 262, KP8: 264, UP: 273, DOWN: 274, RIGHT: 275, LEFT: 276, INSERT: 277, HOME: 278,
  END: 279, PAGEUP: 280, PAGEDOWN: 281, F1: 282, F2: 283, F3: 284, F4: 285, F5: 286, F6: 287, F7: 288, F8: 289,
  F9: 290, F10: 291, F11: 292, F12: 293, NUMLOCK: 300, CAPSLOCK: 301, RSHIFT: 303, LSHIFT: 304, RCTRL: 305,
  LCTRL: 306, RALT: 307, LALT: 308, PRINT: 316,
};

const def_mouse = Uint8Array.from([
  0, 2, 0, 0, 0, 0, 0, 0,
  2, 1, 2, 0, 0, 0, 0, 0,
  2, 1, 1, 2, 0, 0, 0, 0,
  2, 1, 1, 1, 2, 0, 0, 0,
  2, 1, 1, 1, 1, 2, 0, 0,
  2, 1, 1, 1, 1, 1, 2, 0,
  0, 2, 1, 1, 2, 2, 0, 0,
  0, 0, 2, 1, 1, 2, 0, 0,
  0, 0, 2, 1, 1, 2, 0, 0,
  0, 0, 0, 2, 2, 0, 0, 0,
]);

export class JCMouse {
  here = 1;
  but = 0;
  sp: sprite;
  screen: image;
  lx = 0;
  ly = 0;
  lbut = 0;
  mx: number;
  my: number;
  cx = 0;
  cy = 0;

  constructor(Screen: image, pal: palette) {
    this.screen = Screen;
    const br = pal.brightest(1), dr = pal.darkest(1);
    const f = new Filter();
    f.Set(1, br);
    f.Set(2, dr);
    const im = new image(8, 10, def_mouse.slice());
    f.Apply(im);
    this.sp = new sprite(Screen, im, 100, 100);
    this.mx = (Screen.w / 2) | 0;
    this.my = (Screen.h / 2) | 0;
  }

  set_shape(im: image, centerx = 0, centery = 0): void {
    this.sp.change_visual(im);
    this.cx = -centerx;
    this.cy = -centery;
  }

  x(): number { return this.here ? this.mx : 0; }
  y(): number { return this.here ? this.my : 0; }
  drawx(): number { return this.mx - this.cx; }
  drawy(): number { return this.my - this.cy; }
  lastx(): number { return this.here ? this.lx : 0; }
  lasty(): number { return this.here ? this.ly : 0; }
  last_button(): number { return this.here ? this.lbut : 0; }
  button(): number { return this.but; }
  exsist(): number { return this.here; }
  mouse_sprite(): sprite { return this.sp; }

  set_position(nx: number, ny: number): void {
    if (nx > this.screen.w - 1) nx = this.screen.w - 1;
    if (ny > this.screen.h - 1) ny = this.screen.h - 1;
    this.mx = nx;
    this.my = ny;
    platform().warpMouse(nx, ny);
  }

  update(newx = -1, newy = -1, new_but = -1): void {
    if (newx < 0) {
      this.lx = this.mx;
      this.ly = this.my;
      this.lbut = this.but;
      const [x, y, mask] = platform().mouseState();
      this.mx = x;
      this.my = y;
      this.but = ((mask & 1) !== 0 ? 1 : 0) | (((mask & 2) !== 0 ? 1 : 0) << 2) | (((mask & 4) !== 0 ? 1 : 0) << 1);
    } else {
      this.mx = newx;
      this.my = newy;
      this.but = new_but;
    }
  }
}

/** keys bound by abuserc / setup.cpp: get_key_binding */
export const keys = { left: 0, right: 0, up: 0, down: 0, b1: 0, b2: 0, b3: 0, b4: 0 };
export function get_key_binding(dir: string): number {
  switch (dir.toLowerCase()) {
    case 'left': return keys.left;
    case 'right': return keys.right;
    case 'up': return keys.up;
    case 'down': return keys.down;
    case 'b1': return keys.b1;
    case 'b2': return keys.b2;
    case 'b3': return keys.b3;
    case 'b4': return keys.b4;
  }
  return 0;
}

const mouse_buttons = [0, 0, 0, 0, 0];

/** show_help of F12 (set by the game) */
export const event_hooks = { show_help: (_s: string): void => {} };

export class event_handler {
  mouse: JCMouse;
  mhere: number;
  ewaiting = 0;
  last_keystat: number;
  events = new linked_list<event>();

  constructor(screen: image, pal: palette) {
    this.mouse = new JCMouse(screen, pal);
    this.mhere = this.mouse.exsist();
    this.last_keystat = this.get_key_flags();
  }

  mouse_sprite(): sprite { return this.mouse.mouse_sprite(); }
  flush_screen(): void { update_dirty(G.screen); }
  has_mouse(): number { return this.mouse.exsist(); }
  set_mouse_shape(im: image, cx: number, cy: number): void { this.mouse.set_shape(im, -cx, -cy); }
  set_mouse_position(mx: number, my: number): void { this.mouse.set_position(mx, my); }
  push_event(ev: event): void { this.events.add_end(ev); }
  mouse_status(): [number, number, number] { return [this.mouse.x(), this.mouse.y(), this.mouse.button()]; }

  get_key_flags(): number {
    const f = platform().modState();
    return (((f & KMOD_SHIFT) !== 0 ? 1 : 0) << 3) | (((f & KMOD_CTRL) !== 0 ? 1 : 0) << 2) | (((f & KMOD_ALT) !== 0 ? 1 : 0) << 1);
  }

  event_waiting(): number {
    if (this.ewaiting) return 1;
    if (platform().hasEvent()) this.ewaiting = 1;
    return this.ewaiting;
  }

  add_redraw(x1: number, y1: number, x2: number, y2: number, start: unknown): void {
    const ev = new event();
    ev.type = EV_REDRAW;
    ev.redraw = { x1, y1, x2, y2, start };
    this.events.add_end(ev);
  }

  async get_event(ev: event): Promise<void> {
    while (!this.ewaiting) {
      this.event_waiting();
      if (!this.ewaiting) await new Timer().WaitMs(1);
    }
    const ep = this.events.first();
    if (ep) {
      ev.assign(ep);
      this.events.unlink(ep);
      this.ewaiting = this.events.first() !== null ? 1 : 0;
    } else {
      ev.mouse_move.x = this.mouse.x();
      ev.mouse_move.y = this.mouse.y();
      ev.mouse_button = this.mouse.button();
      const e = platform().pollEvent();
      if (e) {
        handle_mouse(ev);
        this.mouse.update(ev.mouse_move.x, ev.mouse_move.y, ev.mouse_button);
        switch (e.type) {
          case SDL_QUIT:
            throw new ExitProgram(0);
          case SDL_MOUSEBUTTONUP:
            if (e.button === 4) {
              ev.key = get_key_binding('b4');
              ev.type = EV_KEYRELEASE;
            } else if (e.button === 5) {
              ev.key = get_key_binding('b3');
              ev.type = EV_KEYRELEASE;
            }
            break;
          case SDL_MOUSEBUTTONDOWN:
            if (e.button === 4) {
              ev.key = get_key_binding('b4');
              ev.type = EV_KEY;
            } else if (e.button === 5) {
              ev.key = get_key_binding('b3');
              ev.type = EV_KEY;
            }
            break;
          case SDL_KEYDOWN:
          case SDL_KEYUP:
            ev.key = EV_SPURIOUS;
            ev.type = e.type === SDL_KEYDOWN ? EV_KEY : EV_KEYRELEASE;
            translate_key(ev, e.sym ?? 0, e.mod ?? 0);
            break;
        }
      }
      this.ewaiting = 0;
    }
  }
}

function translate_key(ev: event, sym: number, mod: number): void {
  const S = SDLK;
  switch (sym) {
    case S.DOWN: ev.key = K.JK_DOWN; break;
    case S.UP: ev.key = K.JK_UP; break;
    case S.LEFT: ev.key = K.JK_LEFT; break;
    case S.RIGHT: ev.key = K.JK_RIGHT; break;
    case S.LCTRL: ev.key = K.JK_CTRL_L; break;
    case S.RCTRL: ev.key = K.JK_CTRL_R; break;
    case S.LALT: ev.key = K.JK_ALT_L; break;
    case S.RALT: ev.key = K.JK_ALT_R; break;
    case S.LSHIFT: ev.key = K.JK_SHIFT_L; break;
    case S.RSHIFT: ev.key = K.JK_SHIFT_R; break;
    case S.NUMLOCK: ev.key = K.JK_NUM_LOCK; break;
    case S.HOME: ev.key = K.JK_HOME; break;
    case S.END: ev.key = K.JK_END; break;
    case S.BACKSPACE: ev.key = K.JK_BACKSPACE; break;
    case S.TAB: ev.key = K.JK_TAB; break;
    case S.RETURN: ev.key = K.JK_ENTER; break;
    case S.SPACE: ev.key = K.JK_SPACE; break;
    case S.CAPSLOCK: ev.key = K.JK_CAPS; break;
    case S.ESCAPE: ev.key = K.JK_ESC; break;
    case S.F1: ev.key = K.JK_F1; break;
    case S.F2: ev.key = K.JK_F2; break;
    case S.F3: ev.key = K.JK_F3; break;
    case S.F4: ev.key = K.JK_F4; break;
    case S.F5: ev.key = K.JK_F5; break;
    case S.F6: ev.key = K.JK_F6; break;
    case S.F7: ev.key = K.JK_F7; break;
    case S.F8: ev.key = K.JK_F8; break;
    case S.F9: ev.key = K.JK_F9; break;
    case S.F10: ev.key = K.JK_F10; break;
    case S.INSERT: ev.key = K.JK_INSERT; break;
    case S.KP0: ev.key = K.JK_INSERT; break;
    case S.PAGEUP: ev.key = K.JK_PAGEUP; break;
    case S.PAGEDOWN: ev.key = K.JK_PAGEDOWN; break;
    case S.KP8: ev.key = K.JK_UP; break;
    case S.KP2: ev.key = K.JK_DOWN; break;
    case S.KP4: ev.key = K.JK_LEFT; break;
    case S.KP6: ev.key = K.JK_RIGHT; break;
    case S.F11:
      // the original toggles full screen here; the page has its own full screen button
      ev.key = EV_SPURIOUS;
      break;
    case S.F12:
      if (ev.type === EV_KEY) event_hooks.show_help('Grab Mouse: ON\n');
      ev.key = EV_SPURIOUS;
      break;
    case S.PRINT:
      ev.key = EV_SPURIOUS;
      break;
    default:
      ev.key = sym;
      if ((mod & KMOD_SHIFT) !== 0) {
        if (sym >= S.a && sym <= S.z) ev.key -= 32;
        else if (sym >= S.N1 && sym <= S.N5) ev.key -= 16;
        else {
          switch (sym) {
            case S.N6: ev.key = S.CARET; break;
            case S.N7:
            case S.N9:
            case S.N0: ev.key -= 17; break;
            case S.N8: ev.key = S.ASTERISK; break;
            case S.MINUS: ev.key = S.UNDERSCORE; break;
            case S.EQUALS: ev.key = S.PLUS; break;
            case S.COMMA: ev.key = S.LESS; break;
            case S.PERIOD: ev.key = S.GREATER; break;
            case S.SLASH: ev.key = S.QUESTION; break;
            case S.SEMICOLON: ev.key = S.COLON; break;
            case S.QUOTE: ev.key = S.QUOTEDBL; break;
          }
        }
      }
  }
}

function handle_mouse(ev: event): void {
  const [mx, my, buttons] = platform().mouseState();
  let x = mx, y = my;
  if (x > G.screen.w - 1) x = G.screen.w - 1;
  if (y > G.screen.h - 1) y = G.screen.h - 1;
  ev.mouse_move.x = x;
  ev.mouse_move.y = y;
  ev.type = EV_MOUSE_MOVE;
  const B1 = 1, B2 = 2, B3 = 4;
  if ((buttons & B1) && !mouse_buttons[1]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[1] = 1;
    ev.mouse_button |= LEFT_BUTTON;
  } else if (!(buttons & B1) && mouse_buttons[1]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[1] = 0;
    ev.mouse_button &= 0xff - LEFT_BUTTON;
  }
  if ((buttons & B2) && !mouse_buttons[2]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[2] = 1;
    ev.mouse_button |= LEFT_BUTTON;
    ev.mouse_button |= RIGHT_BUTTON;
  } else if (!(buttons & B2) && mouse_buttons[2]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[2] = 0;
    ev.mouse_button &= 0xff - LEFT_BUTTON;
    ev.mouse_button &= 0xff - RIGHT_BUTTON;
  }
  if ((buttons & B3) && !mouse_buttons[3]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[3] = 1;
    ev.mouse_button |= RIGHT_BUTTON;
  } else if (!(buttons & B3) && mouse_buttons[3]) {
    ev.type = EV_MOUSE_BUTTON;
    mouse_buttons[3] = 0;
    ev.mouse_button &= 0xff - RIGHT_BUTTON;
  }
}

export function reset_mouse_buttons(): void { mouse_buttons.fill(0); }
