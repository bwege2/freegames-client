// settings.c: the settings dialog (players, computer strategy and strength, rounds, capitulation,
// building) and the new game dialog (choosing the castles).
import { g, cn, fn, neues, werdran } from './baller1.ts';
import { burg } from './baller2.ts';
import { scr_update, surf } from './screen.ts';
import { SDL_FillSurfaceRect, SDL_MapSurfaceRGB } from './sdl.ts';
import { SDLGui_CenterDlg, SDLGui_DoDialog } from './sdlgui.ts';
import { obj, end, SGBOX, SGTEXT, SGEDITFIELD, SGBUTTON, SGRADIOBUT, SGCHECKBOX, SGUSER, SG_EXIT, SG_DEFAULT, SG_CANCEL, SG_SELECTED, SGARROWLEFTSTR, SGARROWRIGHTSTR, SDLGUI_QUIT, type SGOBJ } from './sdlgui.h.ts';
import { DlgAlert_Query } from './dlgAlert.ts';

export const P1_HUMAN = 6, P1_COMPUTER = 7, P1_AISTRATEGYLEFT = 10, P1_AISTRATEGYSTR = 11, P1_AISTRATEGYRIGHT = 12;
export const P1_AISTRENGTHLEFT = 15, P1_AISTRENGTHSTR = 16, P1_AISTRENGTHRIGHT = 17;
export const P2_HUMAN = 22, P2_COMPUTER = 23, P2_AISTRATEGYLEFT = 26, P2_AISTRATEGYSTR = 27, P2_AISTRATEGYRIGHT = 28;
export const P2_AISTRENGTHLEFT = 31, P2_AISTRENGTHSTR = 32, P2_AISTRENGTHRIGHT = 33;
export const ROUNDS_20 = 35, ROUNDS_50 = 36, ROUNDS_100 = 37, ROUNDS_NOLIMIT = 38;
export const GIVEUPALLOWED = 39, REPAIRALLOWED = 40;
export const NEWGAME = 41, CONTINUE = 42, QUITGAME = 43;

function makeSettings(): SGOBJ[] {
  return [
    obj(SGBOX, 0, 0, 0, 0, 71, 22, null),
    obj(SGTEXT, 0, 0, 27, 1, 13, 1, 'Settings'),

    obj(SGBOX, 0, 0, 1, 3, 34, 11, null),
    obj(SGTEXT, 0, 0, 12, 4, 9, 1, 'Player 1'),
    obj(SGTEXT, 0, 0, 3, 6, 5, 1, 'Name:'),
    obj(SGEDITFIELD, 0, 0, 9, 6, 22, 1, g.nsp1),
    obj(SGRADIOBUT, 0, SG_SELECTED, 3, 8, 8, 1, 'Human'),
    obj(SGRADIOBUT, 0, 0, 15, 8, 10, 1, 'Computer'),
    obj(SGTEXT, 0, 0, 3, 10, 15, 1, 'AI strategy:'),
    obj(SGBOX, 0, 0, 19, 10, 15, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 19, 10, 2, 1, SGARROWLEFTSTR),
    obj(SGTEXT, 0, 0, 22, 10, 8, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 32, 10, 2, 1, SGARROWRIGHTSTR),
    obj(SGTEXT, 0, 0, 3, 12, 15, 1, 'AI strength:'),
    obj(SGBOX, 0, 0, 23, 12, 7, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 23, 12, 2, 1, SGARROWLEFTSTR),
    obj(SGTEXT, 0, 0, 26, 12, 1, 1, '2'),
    obj(SGBUTTON, SG_EXIT, 0, 28, 12, 2, 1, SGARROWRIGHTSTR),

    obj(SGBOX, 0, 0, 36, 3, 34, 11, null),
    obj(SGTEXT, 0, 0, 47, 4, 9, 1, 'Player 2'),
    obj(SGTEXT, 0, 0, 38, 6, 5, 1, 'Name:'),
    obj(SGEDITFIELD, 0, 0, 44, 6, 22, 1, g.nsp2),
    obj(SGRADIOBUT, 0, SG_SELECTED, 38, 8, 8, 1, 'Human'),
    obj(SGRADIOBUT, 0, 0, 50, 8, 10, 1, 'Computer'),
    obj(SGTEXT, 0, 0, 38, 10, 15, 1, 'AI strategy:'),
    obj(SGBOX, 0, 0, 54, 10, 15, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 54, 10, 2, 1, SGARROWLEFTSTR),
    obj(SGTEXT, 0, 0, 57, 10, 8, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 67, 10, 2, 1, SGARROWRIGHTSTR),
    obj(SGTEXT, 0, 0, 38, 12, 15, 1, 'AI strength:'),
    obj(SGBOX, 0, 0, 58, 12, 7, 1, null),
    obj(SGBUTTON, SG_EXIT, 0, 58, 12, 2, 1, SGARROWLEFTSTR),
    obj(SGTEXT, 0, 0, 61, 12, 1, 1, '3'),
    obj(SGBUTTON, SG_EXIT, 0, 63, 12, 2, 1, SGARROWRIGHTSTR),

    obj(SGTEXT, 0, 0, 3, 15, 20, 1, 'Maximum rounds:'),
    obj(SGRADIOBUT, 0, 0, 25, 15, 4, 1, '20'),
    obj(SGRADIOBUT, 0, 0, 31, 15, 4, 1, '50'),
    obj(SGRADIOBUT, 0, 0, 37, 15, 5, 1, '100'),
    obj(SGRADIOBUT, 0, SG_SELECTED, 44, 15, 12, 1, 'unlimited'),

    obj(SGCHECKBOX, 0, SG_SELECTED, 3, 17, 26, 1, 'King may capitulate'),
    obj(SGCHECKBOX, 0, SG_SELECTED, 36, 17, 22, 1, 'Players may build'),

    obj(SGBUTTON, 0, 0, 2, 20, 20, 1, 'New game'),
    obj(SGBUTTON, SG_DEFAULT, 0, 24, 20, 19, 1, 'Continue game'),
    obj(SGBUTTON, 0, 0, 45, 20, 20, 1, 'Exit program'),

    end(),
  ];
}

export let settingsdlg: SGOBJ[] = [];

/** a new program (main() fills the names in afterwards) */
export function settingsReset(): void {
  settingsdlg = makeSettings();
}

/** Settings dialog */
export async function settings(): Promise<number> {
  let retbut: number;
  let done = 0;
  const dlg = settingsdlg;

  SDLGui_CenterDlg(dlg);

  do {
    dlg[P1_AISTRATEGYSTR].txt = cn[g.cw[0]].s;
    dlg[P2_AISTRATEGYSTR].txt = cn[g.cw[1]].s;
    dlg[P1_AISTRENGTHSTR].txt = String.fromCharCode(49 + g.cx[0]);
    dlg[P2_AISTRENGTHSTR].txt = String.fromCharCode(49 + g.cx[1]);
    retbut = await SDLGui_DoDialog(dlg);
    switch (retbut) {
      case P1_AISTRATEGYLEFT:
        if (g.cw[0] > 0) g.cw[0] -= 1;
        break;
      case P1_AISTRATEGYRIGHT:
        if (g.cw[0] < 6) g.cw[0] += 1;
        break;
      case P1_AISTRENGTHLEFT:
        if (g.cx[0] > 0) g.cx[0] -= 1;
        break;
      case P1_AISTRENGTHRIGHT:
        if (g.cx[0] < 3) g.cx[0] += 1;
        break;
      case P2_AISTRATEGYLEFT:
        if (g.cw[1] > 0) g.cw[1] -= 1;
        break;
      case P2_AISTRATEGYRIGHT:
        if (g.cw[1] < 6) g.cw[1] += 1;
        break;
      case P2_AISTRENGTHLEFT:
        if (g.cx[1] > 0) g.cx[1] -= 1;
        break;
      case P2_AISTRENGTHRIGHT:
        if (g.cx[1] < 3) g.cx[1] += 1;
        break;
      default:
        done = 1;
    }
  } while (!done);

  scr_update(0, 0, 0, 0);

  if (dlg[P1_HUMAN].state & SG_SELECTED) {
    if (dlg[P2_HUMAN].state & SG_SELECTED) g.mod = 0; /* Human vs. human */
    else g.mod = 1; /* Human vs. computer */
  } else {
    if (dlg[P2_HUMAN].state & SG_SELECTED) g.mod = 2; /* Computer vs. human */
    else g.mod = 3; /* Computer vs. computer */
  }
  if (g.mod < 2) g.l_nam = g.nsp1;
  else g.l_nam = cn[g.cw[0]];
  if (g.mod & 1) g.r_nam = cn[g.cw[1]];
  else g.r_nam = g.nsp2;

  /* Max. amount of rounds */
  if (dlg[ROUNDS_20].state & SG_SELECTED) g.max_rund = 20;
  else if (dlg[ROUNDS_50].state & SG_SELECTED) g.max_rund = 50;
  else if (dlg[ROUNDS_100].state & SG_SELECTED) g.max_rund = 100;
  else if (dlg[ROUNDS_NOLIMIT].state & SG_SELECTED) g.max_rund = 32767;

  /* Is the king allowed to give up? */
  g.au_kap = dlg[GIVEUPALLOWED].state & SG_SELECTED;

  /* Is repairing allowed? */
  g.an_erl = dlg[REPAIRALLOWED].state & SG_SELECTED;

  /* New game? */
  if (retbut === NEWGAME) {
    await dlg_new_game();
  } else if (retbut === QUITGAME || retbut === SDLGUI_QUIT) {
    /* Quit game? */
    return DlgAlert_Query('Quit Ballerburg?', 'Yes', 'No');
  }

  return 0;
}

/* ---------------------------------------------------------------- */

const NEW_P1_PREV = 3, NEW_P1_NEXT = 4, NEW_P2_PREV = 6, NEW_P2_NEXT = 7;
export const NEW_OK = 8, NEW_ABORT = 9;

export const newgamedlg: SGOBJ[] = [
  obj(SGBOX, 0, 0, 0, 0, 58, 20, null),
  obj(SGTEXT, 0, 0, 24, 1, 12, 1, 'New game'),

  obj(SGTEXT, 0, 0, 9, 3, 23, 1, 'Player 1'),
  obj(SGBUTTON, SG_EXIT, 0, 2, 16, 12, 1, '\x04'), // Arrow left
  obj(SGBUTTON, SG_EXIT, 0, 16, 16, 12, 1, '\x03'), // Arrow right

  obj(SGTEXT, 0, 0, 37, 3, 23, 1, 'Player 2'),
  obj(SGBUTTON, SG_EXIT, 0, 30, 16, 12, 1, '\x04'), // Arrow left
  obj(SGBUTTON, SG_EXIT, 0, 44, 16, 12, 1, '\x03'), // Arrow right

  obj(SGBUTTON, SG_DEFAULT, 0, 19, 18, 8, 1, 'OK'),
  obj(SGBUTTON, SG_CANCEL, 0, 31, 18, 8, 1, 'Cancel'),

  obj(SGBOX, 0, 0, 2, 5, 26, 10, null),
  obj(SGUSER, 0, 0, 2, 5, 26, 10, (x, y, w, h) => draw_castle(1, x, y, w, h)),

  obj(SGBOX, 0, 0, 30, 5, 26, 10, null),
  obj(SGUSER, 0, 0, 30, 5, 26, 10, (x, y, w, h) => draw_castle(2, x, y, w, h)),

  end(),
];

/** Draw castle */
function draw_castle(n: number, x: number, y: number, w: number, h: number): void {
  SDL_FillSurfaceRect(surf, { x: x + 1, y: y + 1, w: w - 2, h: h - 2 }, SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff));

  const oy0 = g.by[0];
  const oy1 = g.by[1];

  g.bx[0] = x;
  g.by[0] = y + h;
  g.bx[1] = x + w;
  g.by[1] = y + h;

  burg(n + 1);

  g.by[0] = oy0;
  g.by[1] = oy1;
}

/** Dialog for "new game" */
export async function dlg_new_game(): Promise<void> {
  let retbut: number;

  /* Sichern der alten Werte */
  const ob0 = g.bur[0], ob1 = g.bur[1];
  const ol = [g.ge[0], g.ge[1], g.pu[0], g.pu[1], g.ku[0], g.ku[1], g.vo[0], g.vo[1]];

  SDLGui_CenterDlg(newgamedlg);

  do {
    retbut = await SDLGui_DoDialog(newgamedlg);
    const b_anz = g.b_anz;
    switch (retbut) {
      case NEW_P1_PREV:
        g.bur[0] = (g.bur[0] - 1 + b_anz) % b_anz;
        break;
      case NEW_P1_NEXT:
        g.bur[0] = (g.bur[0] + 1 + b_anz) % b_anz;
        break;
      case NEW_P2_PREV:
        g.bur[1] = (g.bur[1] - 1 + b_anz) % b_anz;
        break;
      case NEW_P2_NEXT:
        g.bur[1] = (g.bur[1] + 1 + b_anz) % b_anz;
        break;
    }
  } while (retbut !== NEW_OK && retbut !== NEW_ABORT);

  [g.ge[0], g.ge[1], g.pu[0], g.pu[1], g.ku[0], g.ku[1], g.vo[0], g.vo[1]] = ol;
  fn();

  if (retbut === NEW_OK) {
    neues();
    werdran(1);
  } else {
    g.bur[0] = ob0;
    g.bur[1] = ob1;
  }

  scr_update(0, 0, 0, 0);
}

