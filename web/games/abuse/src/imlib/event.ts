// imlib/event.h: the engine's events
import { linked_node } from './linked.ts';
import type { Jwindow } from './jwindow.ts';

export const EV_MOUSE_MOVE = 1, EV_MOUSE_BUTTON = 2, EV_KEY = 4, EV_KEY_SPECIAL = 8, EV_REDRAW = 16, EV_SPURIOUS = 32,
  EV_RESIZE = 64, EV_KEYRELEASE = 128, EV_CLOSE_WINDOW = 256, EV_DRAG_WINDOW = 512, EV_MESSAGE = 1024;
export const LEFT_BUTTON = 1, RIGHT_BUTTON = 2, MIDDLE_BUTTON = 4;

export class event extends linked_node {
  type = EV_SPURIOUS;
  mouse_move = { x: 0, y: 0 };
  mouse_button = 0;
  key = 0;
  key_special = { alt: 0, ctrl: 0, shift: 0 };
  redraw = { x1: 0, y1: 0, x2: 0, y2: 0, start: null as unknown };
  window: Jwindow | null = null;
  window_position = { x: 0, y: 0 };
  message = { id: 0, data: null as unknown };

  /** event(int id, char *data): a message */
  static msg(id: number, data: unknown): event {
    const e = new event();
    e.type = EV_MESSAGE;
    e.message.id = id;
    e.message.data = data;
    return e;
  }

  /** ev = *ep: the original copies events by value */
  assign(o: event): void {
    this.type = o.type;
    this.mouse_move = { x: o.mouse_move.x, y: o.mouse_move.y };
    this.mouse_button = o.mouse_button;
    this.key = o.key;
    this.key_special = { ...o.key_special };
    this.redraw = { ...o.redraw };
    this.window = o.window;
    this.window_position = { ...o.window_position };
    this.message = { ...o.message };
  }
}
