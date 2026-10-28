// x11/xeventhandlers.c: the handlers of the X events of the playing windows: selections (paste into
// the talk window), focus, resizing, keys, pointer buttons and motion, exposures.
import { G } from './G.ts';
import { BLACK, RED, SEL_PENDING } from './consts.ts';
import { onReset } from './cutil.ts';
import { xpprintf } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { XEvent } from '../xlib/xlib.ts';
import { Add_HUD_message, Del_HUD_message } from './painthud.ts';
import { Talk_paste, Talk_cut_area_hit, Talk_cut_from_messages, Talk_window_cut, Talk_place_cursor } from './talk.ts';
import { Key_event, Talk_event } from './xevent.ts';
import { Key_clear_counts, Pointer_button_pressed, Pointer_button_released, Pointer_control_set_state } from './event.ts';
import { Resize } from './xinit.ts';
import { Widget_event } from './widget.ts';
import { About, Expose_about_window, Expose_button_window } from './about.ts';
import { sys } from './sys.ts';

const H = { conf_width: 0, conf_height: 0 };
onReset(() => Object.assign(H, { conf_width: 0, conf_height: 0 }));

export function Add_alert_message(message: string, _timeout: number): void {
  Add_HUD_message(message);
}

export function Clear_alert_messages(): void {
  Del_HUD_message();
}

/** we want a selection: the own one, else the X cut buffer (empty here) */
function Selection_request(): void {
  if (G.selection.txt !== null) {
    if (Talk_paste(G.selection.txt, G.selection.len, false) > 0) G.save_talk_str = true;
  } else if (sys.clipboard) {
    const text = sys.clipboard();
    if (text && Talk_paste(text, text.length, false) > 0) G.save_talk_str = true;
  }
}

export function MapNotify_event(_event: XEvent): void {
  if (G.ignoreWindowManager) X.XSetInputFocus(G.dpy, G.topWindow, X.RevertToParent, X.CurrentTime);
}

export function ClientMessage_event(event: XEvent): number {
  if (event.message === G.KillAtom && G.KillAtom !== 0) {
    X.XDestroyWindow(G.dpy, G.topWindow);
    X.XSync(G.dpy, true);
    xpprintf('Quit\n');
    return -1;
  }
  return 0;
}

export function FocusIn_event(_event: XEvent): void {
  G.gotFocus = true;
}

export function UnmapNotify_event(_event: XEvent): void {
  G.gotFocus = false;
  Key_clear_counts();
}

export async function ConfigureNotify_event(event: XEvent): Promise<void> {
  if (event.width >>> 0 !== H.conf_width || event.height >>> 0 !== H.conf_height) {
    Resize(event.window, event.width >>> 0, event.height >>> 0);
    H.conf_height = event.height >>> 0;
    H.conf_width = event.width >>> 0;
  } else await Widget_event(event);
}

export function KeyChanged_event(event: XEvent): void {
  if (event.window === G.topWindow) Key_event(event);
  else if (event.window === G.talkWindow) {
    if (event.type === X.KeyRelease) Key_event(event);
    if (event.type === X.KeyPress) {
      G.talk_key_repeating = 1;
      G.talk_key_repeat_time = sys.nowUs();
      G.talk_key_repeat_event = { ...event };
    } else if (G.talk_key_repeating && G.talk_key_repeat_event && event.keycode === G.talk_key_repeat_event.keycode) G.talk_key_repeating = 0;
    Talk_event(event);
    if (!G.clData.talking) G.talk_key_repeating = 0;
  }
}

export async function ButtonPress_event(event: XEvent): Promise<void> {
  if (G.clData.pointerControl) {
    Pointer_button_pressed(event.button);
    return;
  }
  if (event.window === G.drawWindow) {
    switch (event.button) {
      case X.Button1:
        if (Talk_cut_area_hit(event)) Talk_cut_from_messages(event);
        else if (!G.clData.talking) Pointer_control_set_state(true);
        break;
      case X.Button2:
        if (G.clData.talking) Selection_request();
        break;
      default:
        break;
    }
    return;
  }
  if (event.window === G.talkWindow) {
    switch (event.button) {
      case X.Button1:
        Talk_window_cut(event);
        break;
      case X.Button2:
        Talk_place_cursor(event, false);
        Selection_request();
        break;
      default:
        break;
    }
    return;
  }
  if ((await Widget_event(event)) !== 0) return;
  Expose_button_window(BLACK, event.window);
}

export async function MotionNotify_event(event: XEvent): Promise<void> {
  if (event.window === G.drawWindow) {
    if (G.clData.pointerControl) {
      if (!G.clData.talking) G.mouseMovement += event.x - G.mousePosition.x;
      G.mousePosition.x = event.x;
      G.mousePosition.y = event.y;
    }
  } else await Widget_event(event);
}

export async function ButtonRelease_event(event: XEvent): Promise<number> {
  if (G.clData.pointerControl) Pointer_button_released(event.button);
  if (event.window === G.drawWindow) {
    if (event.button === X.Button1) {
      if (!G.clData.talking) Talk_cut_from_messages(event);
      else if (G.selection.draw.state === SEL_PENDING) Talk_cut_from_messages(event);
      else if (G.selection.talk.state === SEL_PENDING) Talk_window_cut(event);
    }
    return 0;
  }
  if (event.window === G.talkWindow) {
    if (event.button === X.Button1 && G.selection.talk.state === SEL_PENDING) Talk_window_cut(event);
    return 0;
  }
  if ((await Widget_event(event)) !== 0) {
    if (G.quitting) {
      G.quitting = false;
      xpprintf('Quit\n');
      return -1;
    }
    return 0;
  }
  Expose_button_window(G.buttonColor ? G.buttonColor : RED, event.window);
  if (event.window === G.about_close_b) About(G.about_close_b);
  else if (event.window === G.about_next_b) About(G.about_next_b);
  else if (event.window === G.about_prev_b) About(G.about_prev_b);
  return 0;
}

export async function Expose_event(event: XEvent): Promise<void> {
  if (event.window === G.playersWindow) {
    if (event.count === 0) {
      G.players_exposed = true;
      G.scoresChanged++;
    }
  } else if (event.window === G.aboutWindow) {
    if (event.count === 0) Expose_about_window();
  } else if (event.window === G.radarWindow) {
    if (event.count <= 1) G.radar_exposures = 1;
    else G.radar_exposures++;
  } else if (event.window === G.talkWindow) {
    if (event.count === 0) {
      Talk_event(event);
      if (!G.clData.talking) G.talk_key_repeating = 0;
    }
  } else if ((await Widget_event(event)) === 0) {
    if (event.count === 0) Expose_button_window(G.buttonColor ? G.buttonColor : RED, event.window);
  }
}
