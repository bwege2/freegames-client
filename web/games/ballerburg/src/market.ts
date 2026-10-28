// market.c: the market dialog (what the player has, the taxes, what can be bought at which price) and
// laying bricks.
import { g, loc, werdran } from './baller1.ts';
import { drw_all, drw_gpk, fturm, init_ka } from './baller2.ts';
import { color, scr_bar, scr_ctr_text, scr_restore_bg, scr_save_bg, scr_sf_interior, scr_sf_style, scr_update } from './screen.ts';
import { SDLGui_CenterDlg, SDLGui_DoDialog } from './sdlgui.ts';
import { obj, end, SGBOX, SGTEXT, SGBUTTON, SG_EXIT, SG_DEFAULT, SGARROWLEFTSTR, SGARROWRIGHTSTR, type SGOBJ } from './sdlgui.h.ts';
import { scr_color } from './screen.ts';
import { event, Quit } from './ballergui.ts';
import { moves } from './moves.ts';

const SH1 = 11, SH2 = 12, SH3 = 13, SH4 = 14, SH5 = 15, SH6 = 16, SH7 = 17, SH8 = 18;
export const SHK = 19; /* Steuern runter */
export const SHG = 20; /* Steuern rauf */
export const SM1 = 29; /* Preis für Anbauen */
const SM2 = 30, SM3 = 31, SM4 = 32;
export const SM5 = 33; /* Preis für Pulver */
export const SM6 = 34; /* Preis für Kugeln */
export const FERTIG = 35;

const marktdlg: SGOBJ[] = [
  obj(SGBOX, 0, 0, 0, 0, 54, 18, null),

  obj(SGBOX, 0, 0, 1, 1, 52, 7, null),
  obj(SGTEXT, 0, 0, 23, 1, 8, 1, 'You have:'),

  obj(SGTEXT, 0, 0, 2, 3, 10, 1, 'Funds:'),
  obj(SGTEXT, 0, 0, 28, 3, 12, 1, 'Shaft towers:'),
  obj(SGTEXT, 0, 0, 2, 4, 10, 1, 'Cannons:'),
  obj(SGTEXT, 0, 0, 28, 4, 12, 1, 'Weather vane:'),
  obj(SGTEXT, 0, 0, 2, 5, 10, 1, 'Gunpowder:'),
  obj(SGTEXT, 0, 0, 28, 5, 12, 1, 'Cannonballs:'),
  obj(SGTEXT, 0, 0, 2, 6, 10, 1, 'Population:'),
  obj(SGTEXT, 0, 0, 28, 6, 12, 1, 'Taxes in %'),
  obj(SGTEXT, 0, 0, 19, 3, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 3, 5, 1, ''),
  obj(SGTEXT, 0, 0, 19, 4, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 4, 5, 1, ''),
  obj(SGTEXT, 0, 0, 19, 5, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 5, 5, 1, ''),
  obj(SGTEXT, 0, 0, 19, 6, 5, 1, ''),
  obj(SGTEXT, 0, 0, 45, 6, 5, 1, ''),
  obj(SGBUTTON, SG_EXIT, 0, 46, 6, 1, 1, SGARROWLEFTSTR),
  obj(SGBUTTON, SG_EXIT, 0, 51, 6, 1, 1, SGARROWRIGHTSTR),

  obj(SGBOX, 0, 0, 1, 9, 52, 6, null),
  obj(SGTEXT, 0, 0, 23, 9, 8, 1, 'Market:'),

  obj(SGTEXT, 0, 0, 2, 11, 10, 1, 'Lay bricks:'),
  obj(SGTEXT, 0, 0, 28, 11, 12, 1, 'Shaft tower:'),
  obj(SGTEXT, 0, 0, 2, 12, 10, 1, 'Cannon:'),
  obj(SGTEXT, 0, 0, 28, 12, 12, 1, 'Weather vane:'),
  obj(SGTEXT, 0, 0, 2, 13, 10, 1, 'Powder x30:'),
  obj(SGTEXT, 0, 0, 28, 13, 12, 1, '2 cannonballs:'),
  obj(SGTEXT, 0, 0, 19, 11, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 11, 5, 1, ''),
  obj(SGTEXT, 0, 0, 19, 12, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 12, 5, 1, ''),
  obj(SGTEXT, 0, 0, 19, 13, 5, 1, ''),
  obj(SGTEXT, 0, 0, 47, 13, 5, 1, ''),

  obj(SGBUTTON, SG_DEFAULT, 0, 21, 16, 12, 1, 'Done'),

  end(),
];
export { marktdlg };

/** laying bricks: what a scripted player looks at */
export let anbauActive = false;

export function marketReset(): void {
  anbauActive = false;
  for (const i of [SM1, SM2, SM3, SM4, SM5, SM6]) marktdlg[i].type = SGTEXT;
  for (let i = SH1; i <= SH8; i++) marktdlg[i].txt = '';
  for (let i = SM1; i <= SM6; i++) marktdlg[i].txt = '';
}

/** the conditions for laying a brick at x,y (as anbau() tests them) */
export function brickFits(mx: number, my: number): boolean {
  const n = g.n, bg = g.bg;
  return (n ? mx > 624 - bg[0] : mx < bg[0] + 15) && my > 155
    && !(loc(mx, my) || loc(mx + 1, my + 1) || loc(mx - 1, my - 1))
    && !!(loc(mx + 3, my - 1) || loc(mx + 3, my + 1) || loc(mx - 3, my - 1) || loc(mx - 3, my + 1)
      || loc(mx + 1, my + 2) || loc(mx - 1, my + 2) || loc(mx + 1, my - 2) || loc(mx - 1, my - 2));
}

/** Anbauen */
async function anbau(): Promise<void> {
  /* Save background */
  const savearea = scr_save_bg(220, 375 - 12, 25 * 8, 38);
  const xy = g.xy;

  color(1);
  scr_sf_interior(2);
  scr_sf_style(9);
  scr_ctr_text(320, 365, ' Lay bricks: ');
  scr_ctr_text(320, 382, ` Bricks left: ${String(20).padStart(2, '0')} `);
  let s = 20;

  scr_color(0x909080);

  const place = (mx: number, my: number) => {
    xy[0] = mx - 2;
    xy[1] = my - 1;
    xy[2] = mx + 2;
    xy[3] = my + 1;
    scr_bar(xy);
    s--;
    scr_ctr_text(320, 382, ` Bricks left: ${String(s).padStart(2, '0')} `);
  };

  anbauActive = true;
  try {
    if (moves?.remote(g.n)) {
      // the online opponent's bricks
      while (s > 0) {
        const m = await moves.next('bricks');
        if (!m) throw new Quit();
        if (m.kind === 'bricksDone') break;
        if (m.kind === 'brick' && brickFits(m.x, m.y)) place(m.x, m.y);
      }
    } else {
      do {
        if (await event(1, 0)) {
          throw new Quit(); // scr_exit(); exit(0);
        }
        if (g.bt && brickFits(g.mx, g.my)) {
          await moves?.commit({ kind: 'brick', x: g.mx, y: g.my });
          place(g.mx, g.my);
        }
      } while (s > 0 && g.bt < 2);
      if (s > 0) await moves?.commit({ kind: 'bricksDone' });
    }
  } finally {
    anbauActive = false;
    /* Restore background */
    scr_restore_bg(savearea);
  }
}

/** 5-stellige Zahl, rechtsbündig, ohne führende Nullen */
function zahl(nr: number, wert: number): void {
  let s = '', b = 0;
  for (let i = 0, a = 10000; i < 5; i++, a = Math.trunc(a / 10)) {
    const q = Math.trunc(wert / a);
    s += String.fromCharCode((48 + q - 16 * (wert < a && i < 4 && !b ? 1 : 0)) & 255);
    b |= q;
    wert %= a;
  }
  marktdlg[nr].txt = s;
}

/** Markt dialog */
export async function markt(): Promise<void> {
  let a: number, k: number, ko: number, t: number;
  const n = g.n, f = g.f, bg = g.bg;

  SDLGui_CenterDlg(marktdlg);

  for (a = 0; a < 6; a++) zahl(SM1 + a, g.prices[a]);

  try {
    do {
      for (t = k = 0; k < 5;) {
        /* Fördertürme zählen */
        t += g.ft[n][k++].x > -1 ? 1 : 0;
      }
      for (ko = k = 0; k < 10;) {
        /* Kanonen zählen */
        ko += g.ka[n][k++].x > -1 ? 1 : 0;
      }
      for (k = 0; k < 10; k++) {
        if (bg[1 + k * 2] > -1 && g.ka[n][k].x === -1) {
          /* Platz für neue Kanone? */
          for (a = 1; a < 10; a++) {
            if (loc(639 * n + (bg[1 + k * 2] + 5 + a) * f, g.by[n] - bg[2 + k * 2] - a)) break;
          }
          if (a > 9) break;
        }
      }

      zahl(SH1, g.ge[n]);
      zahl(SH2, t);
      zahl(SH3, ko);
      zahl(SH4, g.wx[n] > -1 ? 1 : 0);
      zahl(SH5, g.pu[n]);
      zahl(SH6, g.ku[n]);
      zahl(SH7, g.vo[n]);
      zahl(SH8, g.st[n]);

      for (a = 0; a < 6; a++) {
        if (g.ge[n] < g.prices[a]
          || (!g.an_erl && a === 0)
          || (a === 1 && (bg[0] + t * 30 > 265 || t > 4))
          || (a === 2 && k > 9)
          || (a === 3 && g.wx[n] > -1)) {
          marktdlg[SM1 + a].type = SGTEXT;
        } else {
          marktdlg[SM1 + a].type = SGBUTTON;
        }
      }

      if (moves?.remote(n)) {
        // the online opponent's choice; a price that is not on offer is no button: nothing happens
        const m = await moves.next('market');
        if (!m) throw new Quit();
        a = m.kind === 'marketButton' ? m.button : -1;
        if (a >= SM1 && a <= SM6 && marktdlg[a].type !== SGBUTTON) a = -1;
      } else {
        a = await SDLGui_DoDialog(marktdlg);
        if (a === SHK || a === SHG || a === FERTIG || (a >= SM1 && a <= SM6)) await moves?.commit({ kind: 'marketButton', button: a });
      }

      if (a === SHK) {
        g.st[n] -= 2 * (g.st[n] > 0 ? 1 : 0);
      } else if (a === SHG) {
        g.st[n] += 2 * (g.st[n] < 100 ? 1 : 0);
      } else if (a !== FERTIG && a >= SM1 && a <= SM6) {
        g.ge[n] -= g.prices[a - SM1];
        if (a < SM5) {
          drw_all();
          if (a === SM1) await anbau();
          else if (a === SM2) fturm();
          else if (a === SM3) init_ka(k, 639 * n);
          else if (a === SM4) {
            g.wx[n] = 639 * n + f * bg[23];
            g.wy[n] = g.by[n] - bg[24];
            werdran(1);
          }
        } else {
          g.pu[n] += 30 * (a === SM5 ? 1 : 0);
          g.ku[n] += 2 * (a === SM6 ? 1 : 0);
          drw_gpk(a - SM4);
          drw_gpk(0);
        }
      }
    } while (a !== FERTIG);
  } finally {
    scr_update(0, 0, 0, 0);
  }
}
