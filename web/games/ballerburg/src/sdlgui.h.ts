// sdlgui.h: the dialog objects (SGOBJ), their types, flags, states and special characters. A module of
// its own (it imports nothing), so that the dialog tables of market.c, cannoneer.c, settings.c,
// dlgAlert.c and screen.c can be built when their modules load.

export const SGBOX = 0, SGTEXT = 1, SGEDITFIELD = 2, SGBUTTON = 3, SGRADIOBUT = 4, SGCHECKBOX = 5, SGPOPUP = 6, SGUSER = 7;

/* Object flags: */
export const SG_EXIT = 2;     /* Exit when mouse button has been pressed (and released) */
export const SG_DEFAULT = 4;  /* Marks a default button, selectable with return key */
export const SG_CANCEL = 8;   /* Marks a cancel button, selectable with ESC key */

/* Object states: */
export const SG_SELECTED = 1;

/* Special characters: */
export const SGRADIOBUTTON_NORMAL = 12, SGRADIOBUTTON_SELECTED = 13, SGCHECKBOX_NORMAL = 14, SGCHECKBOX_SELECTED = 15;
export const SGARROWLEFTSTR = '\x04';
export const SGARROWRIGHTSTR = '\x03';

/* Return codes: */
export const SDLGUI_ERROR = -1, SDLGUI_QUIT = -2, SDLGUI_UNKNOWNEVENT = -3;

/** a char buffer of the original that dialogs edit in place (the players' names) */
export class CStr {
  s: string;
  constructor(s: string) {
    this.s = s;
  }
}

export type UserFn = (x: number, y: number, w: number, h: number) => void;

export interface SGOBJ {
  type: number;
  flags: number;
  state: number;
  x: number;
  y: number;
  w: number;
  h: number;
  txt: string | CStr | UserFn | null;
}

export function obj(type: number, flags: number, state: number, x: number, y: number, w: number, h: number, txt: SGOBJ['txt']): SGOBJ {
  return { type, flags, state, x, y, w, h, txt };
}

/** the end mark of a dialog: { -1, 0, 0, 0,0, 0,0, NULL } */
export const end = (): SGOBJ => obj(-1, 0, 0, 0, 0, 0, 0, null);
