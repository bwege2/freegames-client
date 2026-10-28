// cannoneer.c: the cannon dialog: angle and powder, with the cannoneer and his cannon drawn as they are aimed.
import { g, P57, div } from './baller1.ts';
import { color, scr_fillarea, scr_sf_interior, scr_update, surf } from './screen.ts';
import { SDL_FillSurfaceRect, SDL_MapSurfaceRGB } from './sdl.ts';
import { filledCircleColor } from './sdlgfx.ts';
import { SDLGui_CenterDlg, SDLGui_DoDialog } from './sdlgui.ts';
import { obj, end, SGBOX, SGTEXT, SGBUTTON, SGUSER, SG_EXIT, SG_DEFAULT, SG_CANCEL, type SGOBJ } from './sdlgui.h.ts';
import { moves } from './moves.ts';

let wi = 0, pv = 0; /* Winkel und Pulver */

const WL2 = 3; /* Winkel um 10 verkleinern */
const WL1 = 4; /* Winkel um 1 verkleinern */
const WR1 = 6, WR2 = 7, PL2 = 9, PL1 = 10, PR1 = 12, PR2 = 13;
export const SOK = 14, SAB = 15;

export const cannoneerdlg: SGOBJ[] = [
  obj(SGBOX, 0, 0, 0, 0, 42, 15, null),
  obj(SGTEXT, 0, 0, 18, 1, 6, 1, 'Cannon'),

  obj(SGTEXT, 0, 0, 2, 3, 7, 1, 'Angle:'),
  obj(SGBUTTON, SG_EXIT, 0, 12, 3, 4, 1, '\x04\x04'), // 2 arrows left
  obj(SGBUTTON, SG_EXIT, 0, 17, 3, 3, 1, '\x04'), // Arrow left
  obj(SGTEXT, 0, 0, 22, 3, 4, 1, ''),
  obj(SGBUTTON, SG_EXIT, 0, 26, 3, 3, 1, '\x03'), // Arrow right
  obj(SGBUTTON, SG_EXIT, 0, 30, 3, 4, 1, '\x03\x03'), // 2 arrows right

  obj(SGTEXT, 0, 0, 2, 5, 7, 1, 'Gunpowder:'),
  obj(SGBUTTON, SG_EXIT, 0, 12, 5, 4, 1, '\x04\x04'),
  obj(SGBUTTON, SG_EXIT, 0, 17, 5, 3, 1, '\x04'),
  obj(SGTEXT, 0, 0, 22, 5, 4, 1, ''),
  obj(SGBUTTON, SG_EXIT, 0, 26, 5, 3, 1, '\x03'),
  obj(SGBUTTON, SG_EXIT, 0, 30, 5, 4, 1, '\x03\x03'),

  obj(SGBUTTON, SG_DEFAULT, 0, 33, 11, 8, 1, 'OK'),
  obj(SGBUTTON, SG_CANCEL, 0, 33, 13, 8, 1, 'Cancel'),

  obj(SGBOX, 0, 0, 2, 7, 30, 7, null),
  obj(SGUSER, 0, 0, 2, 7, 30, 7, draw_cannoneer),

  end(),
];

export function cannoneerReset(): void {
  wi = pv = 0;
  cannoneerdlg[5].txt = cannoneerdlg[11].txt = '';
}

/** Daten für das Männchen */
const fig = [0, 0, 15, 20, 30, 20, 20, 15, 10, 0, 10, -30, 18, -18, 20, -5, 24, -6,
  20, -25, 10, -40, 0, -45,
  -10, -40, -20, -25, -24, -6, -20, -5, -18, -18, -10, -30, -10, 0,
  -20, 15, -30, 20, -15, 20, -1, -1];

/** Draw cannoneer */
function draw_cannoneer(x: number, y: number, w: number, h: number): void {
  const xy = g.xy, f = g.f;
  SDL_FillSurfaceRect(surf, { x: x + 1, y: y + 1, w: w - 2, h: h - 2 }, SDL_MapSurfaceRGB(surf, 0xff, 0xff, 0xff));

  const xk = x + Math.trunc(w / 2);
  const yk = y + Math.trunc(h / 2) + 40;

  /* Draw the cannoneer man */
  color(1);
  filledCircleColor(surf, xk - 88 * f, yk - 60, 15, 0x000000ff);

  let i = 0;
  while (fig[i] !== -1) {
    xy[i] = xk - 88 * f + fig[i];
    i++;
    xy[i] = yk - 5 + fig[i];
    i++;
  }
  xy[i++] = xy[0];
  xy[i++] = xy[1];
  scr_fillarea((i >> 1) - 1, xy);

  /* Draw the cannon */
  color(1);
  filledCircleColor(surf, xk, yk, 15, 0x000000ff);

  const s = Math.sin(wi / P57);
  let c = Math.cos(wi / P57);
  let fl = -f;
  if (wi > 90) {
    fl = -fl;
    c = -c;
  }
  xy[0] = Math.trunc(xk + fl * (c * 14 + s * 14));
  xy[1] = Math.trunc(yk + s * 14 - c * 14);
  xy[2] = Math.trunc(xk + fl * (c * 14 + s * 40));
  xy[3] = Math.trunc(yk + s * 14 - c * 40);
  xy[4] = Math.trunc(xk - fl * (c * 55 - s * 40));
  xy[5] = Math.trunc(yk - s * 55 - c * 40);
  xy[6] = Math.trunc(xk - fl * (c * 55 - s * 14));
  xy[7] = Math.trunc(yk - s * 55 - c * 14);
  xy[8] = xy[0];
  xy[9] = xy[1];
  scr_fillarea(4, xy);
}

/** the C string in a char buffer: up to its first NUL */
function cstr(codes: number[]): string {
  let s = '';
  for (const c of codes) {
    if (!(c & 255)) break;
    s += String.fromCharCode(c & 255);
  }
  return s;
}

/** Kanonenobjektbaum, Wahl von Winkel und Pulver */
export async function sch_obj(k: number): Promise<number> {
  let i = 0;
  const n = g.n;

  SDLGui_CenterDlg(cannoneerdlg);

  wi = g.ka[n][k].w;
  pv = g.ka[n][k].p;

  scr_sf_interior(1);

  do {
    if (pv > g.pu[n]) pv = g.pu[n];
    // the char buffers dlg_winkel[4] and dlg_pulver[3]
    const aw = [48 + div(wi, 100), 48 + div(wi % 100, 10), 48 + wi % 10];
    if (wi < 100) {
      aw[0] = aw[1];
      aw[1] = aw[2];
      aw[2] = 0;
    }
    cannoneerdlg[5].txt = cstr(aw);
    const ap = [48 + div(pv, 10), 48 + pv % 10];
    if (pv < 10) {
      ap[0] = ap[1];
      ap[1] = 0;
    }
    cannoneerdlg[11].txt = cstr(ap);

    i = await SDLGui_DoDialog(cannoneerdlg);

    wi -= 10 * (i === WL2 ? 1 : 0) - 10 * (i === WR2 ? 1 : 0) + (i === WL1 ? 1 : 0) - (i === WR1 ? 1 : 0);
    if (wi < 0) wi = 0;
    if (wi > 180) wi = 180;
    pv -= 3 * (i === PL2 ? 1 : 0) - 3 * (i === PR2 ? 1 : 0) + (i === PL1 ? 1 : 0) - (i === PR1 ? 1 : 0);
    if (pv < 5) pv = 5;
    if (pv > 20) pv = 20;
  } while (i !== SOK && i !== SAB);

  scr_update(0, 0, 0, 0);

  await moves?.commit({ kind: 'cannon', k, w: wi, p: pv, fire: i === SOK });
  g.ka[n][k].w = wi;
  g.ka[n][k].p = pv;

  return i === SOK ? 1 : 0;
}
