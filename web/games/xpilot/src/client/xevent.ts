// x11/xevent.c: the X event loop of the playing windows (x_event), keys to the key handling, the talk
// key repeat, pointer control (Pointer Lock in the browser), the radar and score list toggle.
import { G } from './G.ts';
import { ABS } from './cutil.ts';
import { warn } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { XEvent } from '../xlib/xlib.ts';
import { sys } from './sys.ts';
import { Keyboard_button_pressed, Keyboard_button_released, Talk_set_state } from './event.ts';
import { Talk_do_event, Talk_map_window, Clear_selection } from './talk.ts';
import { Client_pointer_move } from './client.ts';
import { Widget_event, Widget_map, Widget_unmap } from './widget.ts';
import { Resize } from './xinit.ts';
import {
  ButtonPress_event, ButtonRelease_event, ClientMessage_event, ConfigureNotify_event, Expose_event, FocusIn_event, KeyChanged_event,
  MapNotify_event, MotionNotify_event, UnmapNotify_event,
} from './xeventhandlers.ts';
export { Lookup_key } from './talk.ts';

export function Platform_specific_pointer_control_set_state(on: boolean): void {
  if (on) {
    X.XWarpPointer(G.dpy, X.None, G.drawWindow, 0, 0, 0, 0, Math.trunc(G.draw_width / 2), Math.trunc(G.draw_height / 2));
    X.XSelectInput(G.dpy, G.drawWindow, X.PointerMotionMask | X.ButtonPressMask | X.ButtonReleaseMask);
  } else {
    X.XSelectInput(G.dpy, G.drawWindow, X.ButtonPressMask | X.ButtonReleaseMask);
    X.XFlush(G.dpy);
  }
  if (sys.pointerControl) sys.pointerControl(on);
}

export function Platform_specific_talk_set_state(on: boolean): void {
  if (on) {
    X.XSelectInput(G.dpy, G.drawWindow, X.PointerMotionMask | X.ButtonPressMask | X.ButtonReleaseMask);
    Talk_map_window(true);
  } else Talk_map_window(false);
}

export function Toggle_radar_and_scorelist(): void {
  if (G.radar_score_mapped) {
    G.draw_width = G.top_width;
    G.draw_height = G.top_height;
    X.XUnmapWindow(G.dpy, G.radarWindow);
    X.XUnmapWindow(G.dpy, G.playersWindow);
    Widget_unmap(G.button_form);
    X.XMoveWindow(G.dpy, G.drawWindow, 0, 0);
    G.radar_score_mapped = false;
    Resize(G.topWindow, G.top_width, G.top_height);
  } else {
    G.draw_width = G.top_width - 258;
    G.draw_height = G.top_height;
    X.XMoveWindow(G.dpy, G.drawWindow, 258, 0);
    Widget_map(G.button_form);
    X.XMapWindow(G.dpy, G.radarWindow);
    X.XMapWindow(G.dpy, G.playersWindow);
    G.radar_score_mapped = true;
  }
}

export function Toggle_fullscreen(): void { /* nothing, as the original */ }

export function Key_event(event: XEvent): void {
  const ks = X.XLookupKeysym(G.dpy, event, 0);
  if (ks === X.NoSymbol) return;
  if (event.type === X.KeyPress) Keyboard_button_pressed(ks);
  else if (event.type === X.KeyRelease) Keyboard_button_released(ks);
}

export function Talk_event(event: XEvent): void {
  if (!Talk_do_event(event)) Talk_set_state(false);
}

function Handle_talk_key_repeat(): void {
  if (G.talk_key_repeating) {
    const now = sys.nowUs();
    const i = now - G.talk_key_repeat_time;
    if ((G.talk_key_repeating > 1 && i > 50000) || i > 500000) {
      Talk_event(G.talk_key_repeat_event!);
      G.talk_key_repeating = 2;
      G.talk_key_repeat_time = now;
      if (!G.clData.talking) G.talk_key_repeating = 0;
    }
  }
}

function xevent_keyboard(): void {
  Handle_talk_key_repeat();
  // no second keyboard display (kdpy) in this port
}

function xevent_pointer(): void {
  if (!G.clData.pointerControl || G.clData.talking) return;
  if (G.mouseMovement !== 0) {
    Client_pointer_move(G.mouseMovement);
    const dx = Math.trunc(G.draw_width / 2) - G.mousePosition.x;
    const dy = Math.trunc(G.draw_height / 2) - G.mousePosition.y;
    if (ABS(dx) > Math.trunc((3 * G.draw_width) / 8) || ABS(dy) > Math.trunc((1 * G.draw_height) / 8)) {
      // the original also sends itself a MotionNotify, which the X server never delivers back (send_event)
      X.XWarpPointer(G.dpy, X.None, G.drawWindow, 0, 0, 0, 0, Math.trunc(G.draw_width / 2), Math.trunc(G.draw_height / 2));
      X.XFlush(G.dpy);
    }
  }
}

export async function x_event(new_input: number): Promise<number> {
  G.mouseMovement = 0;
  if (new_input < 0 || new_input > 2) {
    warn(`Bad input queue type (${new_input})`);
    return -1;
  }
  const n = X.XEventsQueued(G.dpy, new_input);
  for (let i = 0; i < n; i++) {
    const event = X.XNextEvent(G.dpy);
    if (!event) break;
    switch (event.type) {
      case X.SelectionClear:
        Clear_selection();
        break;
      case X.MapNotify:
        MapNotify_event(event);
        break;
      case X.ClientMessage:
        if (ClientMessage_event(event) === -1) return -1;
        break;
      case X.FocusIn:
        FocusIn_event(event);
        break;
      case X.FocusOut:
      case X.UnmapNotify:
        UnmapNotify_event(event);
        break;
      case X.ConfigureNotify:
        await ConfigureNotify_event(event);
        break;
      case X.KeyPress:
        G.talk_key_repeating = 0;
        KeyChanged_event(event);
        break;
      case X.KeyRelease:
        KeyChanged_event(event);
        break;
      case X.ButtonPress:
        await ButtonPress_event(event);
        break;
      case X.MotionNotify:
        await MotionNotify_event(event);
        break;
      case X.ButtonRelease:
        if ((await ButtonRelease_event(event)) === -1) return -1;
        break;
      case X.Expose:
        await Expose_event(event);
        break;
      case X.EnterNotify:
      case X.LeaveNotify:
        await Widget_event(event);
        break;
      default:
        break;
    }
  }
  xevent_keyboard();
  xevent_pointer();
  return 0;
}
