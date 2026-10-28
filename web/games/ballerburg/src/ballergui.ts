// ballergui.c: Ballerburg SDL's event loop: the mouse position and buttons, and the keys Esc (settings),
// f (full screen), t (the table of the computer players) and q (quit).
import { g, tabelle } from './baller1.ts';
import { scr_togglefullscreen, scr_update } from './screen.ts';
import { settings } from './settings.ts';
import { DlgAlert_Query } from './dlgAlert.ts';
import {
  SDL_PollEvent, SDL_WaitEvent, SDL_BUTTON_LEFT, SDL_BUTTON_RIGHT, SDL_EVENT_QUIT, SDL_EVENT_MOUSE_MOTION,
  SDL_EVENT_MOUSE_BUTTON_DOWN, SDL_EVENT_MOUSE_BUTTON_UP, SDL_EVENT_KEY_UP, SDL_EVENT_WINDOW_EXPOSED,
  SDL_EVENT_WINDOW_RESTORED, SDLK_ESCAPE, SDLK_F, SDLK_T, SDLK_Q, type SDL_Event,
} from './sdl.ts';
import { moves } from './moves.ts';

/** the program ends (anbau's exit(0)) */
export class Quit extends Error {
  constructor() {
    super('quit');
  }
}

let in_table = false;
let quitflag = false;

/** a scripted player looks at it: the table is shown */
export function inTable(): boolean {
  return in_table;
}

export function guiReset(): void {
  in_table = false;
  quitflag = false;
}

async function gui_handle_keys(ev: SDL_Event, allow_dlgs: number): Promise<number> {
  switch (ev.key) {
    case SDLK_ESCAPE:
      if (allow_dlgs) return moves ? moves.escape() : settings();
      break;
    case SDLK_F:
      scr_togglefullscreen();
      break;
    case SDLK_T:
      if (in_table || !allow_dlgs) break;
      in_table = true;
      try {
        await tabelle();
      } finally {
        in_table = false;
      }
      break;
    case SDLK_Q:
      return DlgAlert_Query('Quit Ballerburg?', 'Yes', 'No');
    default:
      break;
  }
  return 0;
}

export async function event(wait: number, allow_dlgs: number): Promise<number> {
  if (quitflag) return 1;

  let ev: SDL_Event | null = wait ? await SDL_WaitEvent() : SDL_PollEvent();
  while (ev) {
    switch (ev.type) {
      case SDL_EVENT_QUIT:
        quitflag = true;
        return 1;
      case SDL_EVENT_MOUSE_MOTION: /* Read/Update internal mouse position */
        g.mx = ev.x;
        g.my = ev.y;
        break;
      case SDL_EVENT_MOUSE_BUTTON_DOWN:
        if (ev.button === SDL_BUTTON_LEFT) g.bt |= 1;
        else if (ev.button === SDL_BUTTON_RIGHT) g.bt |= 2;
        break;
      case SDL_EVENT_MOUSE_BUTTON_UP:
        if (ev.button === SDL_BUTTON_LEFT) g.bt &= ~1;
        else if (ev.button === SDL_BUTTON_RIGHT) g.bt &= ~2;
        break;
      case SDL_EVENT_KEY_UP:
        if (await gui_handle_keys(ev, allow_dlgs)) {
          quitflag = true;
          return 1;
        }
        break;
      case SDL_EVENT_WINDOW_EXPOSED:
      case SDL_EVENT_WINDOW_RESTORED:
        scr_update(0, 0, 0, 0);
        break;
    }
    ev = SDL_PollEvent();
  }
  return 0;
}
