// baller1.c: Ballerburg's main part (Eckhard Kruse 1987; SDL port by Thomas Huth): the program, the table
// of the computer players, a new game, one turn, the population and the prices after a turn, the end of
// a game, the wind display, and loading the castles (baller.dat). Its globals (baller1.h) live in `g`.
// The original's C types are kept: shorts in Int16Arrays, chars wrapped with s8, C's integer division.
import { rand } from './random.ts';
import {
  bild, comp, drin, drw_gpk, koenig, schuss,
} from './baller2.ts';
import { markt } from './market.ts';
import { sch_obj } from './cannoneer.ts';
import { event } from './ballergui.ts';
import {
  clr, clr_bg, color, scr_bar, scr_color, scr_draw_done_button, scr_fillcolor, scr_getpixel, scr_init,
  scr_init_done_button, scr_l_text, scr_pline, scr_restore_bg, scr_save_bg, scr_sf_interior, scr_sf_style, scr_update,
} from './screen.ts';
import { psg_audio_init, Giaccess } from './psg.ts';
import { m_load, m_musik, m_wloop } from './music.ts';
import { DlgAlert_Notice } from './dlgAlert.ts';
import { CStr } from './sdlgui.h.ts';
import { assets } from './assets.ts';
import { moves, TurnEnd, type Move } from './moves.ts';

export const P57 = 57.296;
export const G = 0.02; /* Fallbeschleunigung ( g/500 ) */
export const COMP_NUM = 7;

/** C's conversions to short and char */
export const s16 = (v: number) => (v << 16) >> 16;
export const s8 = (v: number) => (v << 24) >> 24;
/** C's integer division (towards zero) */
export const div = (a: number, b: number) => Math.trunc(a / b);

export interface Kanone { x: number; y: number; w: number; p: number }
export interface Turm { x: number; y: number }

/** a name of a player: a char buffer (the human names, edited in the settings) or a computer name */
export type Name = { readonly s: string };

/** Computer player names (i.e. the strategies) */
export const cn: readonly Name[] = ['Oaf', 'Yokel', 'Boor', 'Doofus', 'Fumbler', 'Geezer', 'Ruffian'].map((s) => ({ s }));

function ka2(): Kanone[][] {
  return [0, 1].map(() => Array.from({ length: 10 }, () => ({ x: 0, y: 0, w: 0, p: 0 })));
}

function ft2(): Turm[][] {
  return [0, 1].map(() => Array.from({ length: 5 }, () => ({ x: 0, y: 0 })));
}

/** baller1.h's globals */
export const g = {
  mx: 0, my: 0, bt: 0,
  xy: new Int16Array(100),
  bur: new Int16Array(2), bx: new Int16Array(2), by: new Int16Array(2), ge: new Int16Array(2), pu: new Int16Array(2),
  ku: new Int16Array(2), vo: new Int16Array(2), st: new Int16Array(2), kn: new Int16Array(2), wx: new Int16Array(2),
  wy: new Int16Array(2),
  bg: new Int16Array(0) as Int16Array,
  zug: 0, n: 0, max_rund: 0,
  burgen: [] as Int16Array[],
  b_anz: 0,
  prices: new Int32Array(6),
  ftx: 0, fty: 0, ftw: 0, fth: 0,
  l_nam: null as unknown as Name,
  r_nam: null as unknown as Name,
  f: 0,
  mod: 0, wnd: 0, end: 0, an_erl: 0, au_kap: 0,
  nsp1: new CStr(''), nsp2: new CStr(''),
  /** Computer strategy */
  cw: [2, 2],
  /** Computer strength */
  cx: [1, 1],
  ka: ka2(),
  ft: ft2(),
};

let ws = 0, wc = 0;
let t_gew: Int16Array[] = [];
/** char txt[4] */
const txt = [0, 0, 0, 0];

/** the table of the computer players' games (statistics only) */
export function tGew(): readonly Int16Array[] {
  return t_gew;
}

export function vane(): { ws: number; wc: number } {
  return { ws, wc };
}

export function baller1Reset(): void {
  Object.assign(g, {
    mx: 0, my: 0, bt: 0, zug: 0, n: 0, max_rund: 0, burgen: [], b_anz: 0, ftx: 0, fty: 0, ftw: 0, fth: 0, f: 0,
    mod: 0, wnd: 0, end: 0, an_erl: 0, au_kap: 0, cw: [2, 2], cx: [1, 1], ka: ka2(), ft: ft2(), bg: new Int16Array(0) as Int16Array,
  });
  for (const a of [g.xy, g.bur, g.bx, g.by, g.ge, g.pu, g.ku, g.vo, g.st, g.kn, g.wx, g.wy, g.prices]) a.fill(0);
  g.nsp1 = new CStr('');
  g.nsp2 = new CStr('');
  ws = wc = 0;
  t_gew = Array.from({ length: COMP_NUM }, () => new Int16Array(COMP_NUM + 4));
  txt.fill(0);
}

/** #define fn() f=1-2*(n&1) */
export function fn(): void {
  g.f = 1 - 2 * (g.n & 1);
}

function txtStr(): string {
  let s = '';
  for (let i = 0; i < 4 && txt[i]; i++) s += String.fromCharCode(txt[i] & 255);
  return s;
}

/*****************************************************************************/
/** main(): returns when the player quits (or, online, when the round's game is over) */
export async function main(): Promise<number> {
  if (m_load(assets.mus)) return 1;

  g.an_erl = 1;
  g.max_rund = 32767;
  g.au_kap = 1;
  t_load();
  burgen_laden();

  g.nsp1.s = 'William';
  g.nsp2.s = 'Frederick';
  g.l_nam = g.nsp1;
  g.r_nam = g.nsp2;

  scr_init();
  const d = scr_init_done_button();
  g.ftx = d.x;
  g.fty = d.y;
  g.ftw = d.w;
  g.fth = d.h;

  psg_audio_init();

  g.mod = 0; /* Game mode (computer or real players?) */

  neues();

  await play();

  t_save();
  return 0;
}

/** while (ein_zug()); */
export async function play(): Promise<void> {
  while (await ein_zug());
}

/**************************** Tabelle ****************************************/
export async function tabelle(): Promise<void> {
  const save_area = scr_save_bg(17, 55, 640 - 17 * 2 + 1, 400 - 55 * 2 + 24 + 1);

  scr_sf_interior(0);
  box(17, 56, 623, 367, 1);
  box(19, 58, 621, 365, 1);
  box(20, 59, 620, 364, 1);
  line(108, 59, 108, 364);

  for (let i = 116; i < 584; i += 72) line(i, 59, i, 364);
  line(20, 84, 620, 84);
  for (let i = 92; i < 264; i += 24) line(20, i, 620, i);
  for (let i = 268; i < 364; i += 24) line(20, i, 620, i);
  for (let i = 0; i < COMP_NUM; i++) scr_l_text(124 + i * 72, 78, cn[i].s);
  for (let i = 0; i < COMP_NUM; i++) scr_l_text(36, 110 + i * 24, cn[i].s);

  scr_sf_interior(2);
  scr_sf_style(1);
  for (let i = 0; i < COMP_NUM; i++) {
    for (let j = 0; j < COMP_NUM + 4; j++) {
      z_txt(t_gew[i][j]);
      if (j === COMP_NUM + 3 && !t_gew[i][COMP_NUM]) {
        txt[0] = 32;
        txt[1] = 45; // '-'
        txt[2] = 0;
      }
      scr_l_text(140 + i * 72, 110 + j * 24 + 8 * (j >= COMP_NUM ? 1 : 0), txtStr());
      if (i === j) box(116 + i * 72, 92 + j * 24, 188 + i * 72, 116 + j * 24, 1);
    }
  }

  scr_l_text(28, 286, 'Games');
  scr_l_text(28, 310, 'Total won');
  scr_l_text(28, 334, 'Total lost');
  scr_l_text(28, 358, 'Won in %');

  line(20, 59, 108, 84);
  scr_l_text(36, 80, '-');
  scr_l_text(88, 72, '+');

  while (g.bt === 0 && (await event(1, 0)) === 0);
  while (g.bt !== 0 && (await event(1, 0)) === 0);

  scr_restore_bg(save_area);
}

export function z_txt(a: number): string {
  txt[0] = s8(div(a, 100) + 48);
  txt[1] = s8(div(a % 100, 10) + 48);
  txt[2] = s8(a % 10 + 48);
  if (a < 100) {
    txt[0] = 32;
    if (a < 10) txt[1] = 32;
  }
  return txtStr();
}

/******************** Initialisierung vor neuem Spiel ************************/
const pr = [200, 500, 400, 150, 50, 50]; /* Preise zu Beginn */

export function neues(): void {
  g.wnd = s8(rand() % 60 - 30);
  g.st[0] = g.st[1] = 20;
  g.kn[0] = g.kn[1] = 0;
  for (let j = 0; j < 6; j++) g.prices[j] = div(pr[j] * (95 + rand() % 11), 100);
  bild();
  for (g.n = 0; g.n < 2; g.n++) {
    const n = g.n;
    g.bg = g.burgen[g.bur[n]];
    g.wx[n] = n ? 639 - g.bg[23] : g.bg[23];
    g.wy[n] = g.by[n] - g.bg[24];
    for (g.f = 0; g.f < 5;) g.ft[n][g.f++].x = -1;
  }
  g.zug = g.n = g.end = 0;
  g.f = 1;
}

/** applies a turn-ending move of the online opponent: the turn's "fl" and cannon */
function turnEnd(m: Move): { fl: number; i: number } {
  const n = g.n;
  if (m.kind === 'cannon' && m.k >= 0 && m.k < 10 && g.ka[n][m.k].x !== -1 && g.pu[n] >= 5 && g.ku[n] !== 0 && m.p <= g.pu[n]) {
    g.ka[n][m.k].w = m.w;
    g.ka[n][m.k].p = m.p;
    return { fl: m.fire ? 1 : 0, i: m.k };
  }
  // "done", or a shot the castle cannot fire: the turn ends without a shot (as the server counts it)
  return { fl: m.kind === 'done' || (m.kind === 'cannon' && m.fire) ? 2 : 0, i: 0 };
}

/************************* Durchführen eines Zuges ***************************/
export async function ein_zug(): Promise<number> {
  let i = 0, fl: number, a: number;

  g.n = g.zug & 1;
  fn();
  g.kn[g.n] &= ~16;
  g.wnd = s8(div(g.wnd * 9, 10) + rand() % 12 - 6);

  werdran(1);

  do {
    fl = 0;
    if (moves?.remote(g.n)) {
      // online: the other castle's player (or the replay of the round so far) moves through the server
      const m = await moves.next('turn');
      if (!m) return 0;
      g.bg = g.burgen[g.bur[g.n]];
      try {
        if (m.kind === 'market') await markt();
        else if (m.kind === 'king') await koenig();
        else ({ fl, i } = turnEnd(m));
      } catch (e) {
        if (!(e instanceof TurnEnd)) throw e;
        ({ fl, i } = turnEnd(e.move));
      }
      // the player's own client redrew the whole window here (the Done button, the end of the cannon
      // dialog); so does this one, and both show the same (screen.c leaves craters' edges unshown until then)
      if (m.kind === 'done' || m.kind === 'cannon') scr_update(0, 0, 0, 0);
      continue;
    }
    // (the settings, Esc while waiting here, may start a new game or hand the turn to the computer:
    // n and mod are read again, as the original reads its globals)
    do {
      if ((await event(g.mod & (2 - g.n) ? 0 : 1, 1)) !== 0) return 0;
    } while (!g.bt && !(g.mod & (2 - g.n)));
    const n = g.n;
    g.bg = g.burgen[g.bur[n]];

    if (g.mod & (2 - n)) {
      i = comp();
      fl = 1 + (i < 0 ? 1 : 0);
    } else if (g.mx > g.ftx && g.mx < g.ftx + g.ftw && g.my > g.fty && g.my < g.fty + g.fth) {
      /* "Fertig"-Knopf wurde gedrueckt */
      scr_draw_done_button(1);
      do {
        await event(1, 0);
      } while (g.bt);
      scr_draw_done_button(0);
      await moves?.commit({ kind: 'done' });
      fl = 2;
    } else {
      const ka = g.ka[n], bg = g.bg, mx = g.mx, my = g.my;
      for (i = 0; i < 10; i++) {
        if (ka[i].x <= mx && ka[i].x + 20 >= mx && ka[i].x !== -1 && ka[i].y >= my && ka[i].y - 14 <= my) break;
      }
      if (i > 9) {
        if (drin(bg[25], bg[26], bg[31], bg[32], 0, mx, my)
          || drin(bg[27], bg[28], bg[33], bg[34], 0, mx, my)
          || drin(bg[29], bg[30], bg[35], bg[36], 0, mx, my)) {
          await moves?.commit({ kind: 'market' });
          await markt();
        } else if (drin(bg[21], bg[22], 30, 25, 0, mx, my)) {
          await moves?.commit({ kind: 'king' });
          await koenig();
        }
      } else if (g.pu[n] < 5) {
        await DlgAlert_Notice("You don't have enough gunpowder.", 'Cancel');
      } else if (g.ku[n] === 0) {
        await DlgAlert_Notice("You don't have any cannonballs left.", 'Cancel');
      } else {
        fl = await sch_obj(i);
      }
    }
  } while (!fl);

  werdran(0);
  if (fl < 2) await schuss(i);

  if (~g.kn[g.n] & 16) g.kn[g.n] &= ~15;
  rechnen();
  g.zug = s16(g.zug + 1);

  for (i = 0; i < 10; i++) if (g.ka[g.n][i].x > -1) break;
  g.n = g.zug & 1;
  g.bg = g.burgen[g.bur[g.n]];
  for (a = 0; a < 10; a++) if (g.ka[g.n][a].x > -1) break;
  const n = g.n, ft = g.ft[n];
  if (a === 10 && i < 10 && g.bg[40] > g.vo[n] && g.ge[n] < div(g.prices[2], 3) && g.au_kap
    && ft[0].x + ft[1].x + ft[2].x + ft[3].x + ft[4].x === -5) {
    g.end = n + 33;
  }

  if (!g.end && div(g.zug, 2) >= g.max_rund) {
    const h = [0, 0];
    for (g.n = 0; g.n < 2; g.n++) {
      const n = g.n;
      h[n] = g.ge[n] + div(g.pu[n] * g.prices[4], 30) + div(g.ku[n] * g.prices[5], 2)
        + (g.wx[n] > -1 ? 1 : 0) * g.prices[3] + g.vo[n] * 4;
      for (i = 0; i < 5; i++) if (g.ft[n][i].x > -1) h[n] += g.prices[1];
      for (i = 0; i < 10; i++) if (g.ka[n][i].x > -1) h[n] += g.prices[2];
    }
    g.end = 65 + (h[1] < h[0] ? 1 : 0);
  }
  if (g.end) {
    moves?.gameOver(g.end);
    await ende();
    while (!g.bt) {
      if ((await event(1, 0)) !== 0) return 0;
    }
    if (moves) return 0; // online: one game is one round of the room
    neues();
  }
  return 1;
}

/********** Berechnen von Bevölkerungszuwachs usw. nach jedem Zug ************/
const pmi = [98, 347, 302, 102, 30, 29], /* Preisgrenzen */
  pma = [302, 707, 498, 200, 89, 91],
  psp = [10, 50, 50, 20, 10, 10]; /* max. Preisschwankung */

export function rechnen(): void {
  const n = g.n;
  let j = g.st[n];
  g.ge[n] += div(g.vo[n] * (j > 65 ? 130 - j : j), 150 - rand() % 50);
  const r1 = rand() % 11, r2 = rand() % 9, r3 = rand() % 5;
  g.vo[n] = div(g.vo[n] * (95 + r1), 100) + div((21 - j + r2) * (8 + r3), 20);
  if (g.vo[n] < 0) {
    g.vo[n] = 0;
    g.end = n + 49;
  }

  for (j = 0; j < 5; j++) {
    const r = rand() % 31;
    g.ge[n] += (40 + r) * (g.ft[n][j].x > -1 ? 1 : 0);
  }
  for (j = 0; j < 6; j++) {
    g.prices[j] += div(psp[j] * (rand() % 99), 98) - div(psp[j], 2);
    g.prices[j] = Math.max(g.prices[j], pmi[j]);
    g.prices[j] = Math.min(g.prices[j], pma[j]);
  }
  drw_gpk(0);
}

/******************************* Spielende ***********************************/
export async function ende(): Promise<void> {
  let s2 = '', s3 = '';
  const s1 = `!! ${g.end & 2 ? g.l_nam.s : g.r_nam.s} has won !!`.slice(0, 79);
  const loser = g.end & 2 ? g.r_nam.s : g.l_nam.s;
  let with_s = false;
  if ((g.end & 240) < 48) {
    const a = loser.charCodeAt(loser.length - 1);
    with_s = a === 115 || a === 83; // 's' 'S'
  }

  switch (g.end & 240) {
    case 16:
      s2 = with_s ? `( ${loser}' king was hit,` : `( ${loser}'s king was hit,`;
      s3 = 'and upon hearing this, the people capitulated. )';
      break;
    case 32:
      s2 = with_s ? `( ${loser}' king has capitulated` : `( ${loser}'s king has capitulated`;
      s3 = '  because of the hopeless situation. )';
      break;
    case 48:
      s2 = `( ${loser} has no folk left. )`;
      s3 = '';
      break;
    case 64:
      s2 = '( The limit of maximum rounds has been reached.';
      s3 = `${loser} is worse off. )`;
  }
  s2 = s2.slice(0, 79);
  s3 = s3.slice(0, 79);

  let a: number, b: number;
  for (a = 0; a < COMP_NUM && !strneq7(cn[a].s, g.l_nam.s); a++);
  for (b = 0; b < COMP_NUM && !strneq7(cn[b].s, g.r_nam.s); b++);
  if (a < COMP_NUM && b < COMP_NUM && a !== b) {
    if (~g.end & 2) {
      const c = a;
      a = b;
      b = c;
    }
    t_gew[a][b]++;
    t_gew[b][a]++;
    t_gew[b][COMP_NUM + 2]++;
    t_gew[a][COMP_NUM + 3] = div(100 * ++t_gew[a][COMP_NUM + 1], ++t_gew[a][COMP_NUM]);
    t_gew[b][COMP_NUM + 3] = div(100 * t_gew[b][COMP_NUM + 1], ++t_gew[b][COMP_NUM]);
  }

  scr_color(0x00800000);
  for (let i = 0; i < 8; i++) {
    const rxy = new Int16Array(4);
    if (i !== 7) scr_fillcolor((i * 32) << 16);
    else scr_fillcolor(0xffffff);
    rxy[0] = 40 + i * 8;
    rxy[1] = 80 + i * 8;
    rxy[2] = 600 - i * 8;
    rxy[3] = 320 - i * 8;
    scr_bar(rxy);
  }

  scr_l_text(140, 170, s1);
  scr_l_text(140, 210, s2);
  scr_l_text(140, 230, s3);

  g.bt = 0;

  await m_musik();

  Giaccess(0, 138);
  Giaccess(0, 139);
  Giaccess(0, 140);
}

/** strncmp(a, b, 7) == 0 */
function strneq7(a: string, b: string): boolean {
  return a.slice(0, 7) === b.slice(0, 7);
}

/**
 * Die Routine m_wait() wird von m_musik() nach jedem 1/96 Takt aufgerufen.
 */
export async function m_wait(): Promise<boolean> {
  await m_wloop();
  return (await event(0, 0)) !== 0 || g.bt !== 0;
}

/** Anzeige des Spielers, der am Zug ist, sowie Darstellung der Windfahnen ***/
export function werdran(c: number): void {
  const n = g.n, xy = g.xy;
  /* Anzahl der Spielrunden ausgeben */
  scr_l_text(332, 395 + 16, z_txt(div(g.zug, 2) + 1));

  if (c) {
    let x = 5 + (629 - 104) * n;
    const y = 410, w = 104, h = 48;

    /* Wind ausgeben: */
    const wnd = g.wnd;
    const ad = [0, 0, 0, 0, 0, 0, 0];
    ad[0] = ad[5] = s8(4 + 28 * (!wnd ? 1 : 0) - (wnd > 0 ? 1 : 0));
    const i = wnd < 0 ? -wnd : wnd;
    ad[1] = ad[4] = 32;
    ad[2] = 48 + div(i, 10);
    ad[3] = 48 + i % 10;
    ad[6] = 0;
    if (g.wx[n] < 0) {
      ad[0] = ad[5] = 32;
      ad[2] = ad[3] = 63; // '?'
    }
    scr_l_text(x + 4, y + h + 12, 'Wind:');
    scr_l_text(x + 52, y + h + 12, String.fromCharCode(...ad.slice(0, 6).map((v) => v & 255)));

    const cc = wnd > 0 ? 1 : -1;
    let wk = cc * wnd / 15.0;
    let wl = wk * .82;
    if (wk > 1.57) wk = 1.57;
    if (wl > 1.57) wl = 1.57;
    const s1 = s16(Math.trunc(cc * 20 * Math.sin(wk)));
    const c1 = s16(Math.trunc(20 * Math.cos(wk)));
    const s2 = s16(Math.trunc(cc * 20 * Math.sin(wl)));
    const c2 = s16(Math.trunc(20 * Math.cos(wl)));
    ws = s16(Math.trunc(s1 / 2.0));
    ws = s16(ws + (!ws ? 1 : 0));
    wc = s16(Math.trunc(c1 / 2.0));

    if (g.wx[n] > -1) {
      color(1);
      x += w / 2;
      line(x, y + h, x, y + 5);
      line(x + 1, y + h, x + 1, y + 5);
      xy[0] = xy[2] = x + 1;
      xy[1] = y + 5;
      xy[3] = y + 11;
      if (wk < .2) {
        xy[0] = x - 1;
        xy[1] = xy[3] = y + 5;
        xy[2] = x + 2;
      }
      xy[4] = xy[2] + s1;
      xy[5] = xy[3] + c1;
      xy[8] = xy[0] + s1;
      xy[9] = xy[1] + c1;
      xy[10] = xy[0];
      xy[11] = xy[1];
      xy[6] = ((xy[4] + xy[8]) >> 1) + s2;
      xy[7] = ((xy[5] + xy[9]) >> 1) + c2;
      scr_pline(6, xy);
    }
    fahne();
  } else {
    clr(5 + (629 - 104) * n, 410, 104, 48 + 16);
  }
}

/******************* Darstellung der beiden Windfahnen ***********************/
export function fahne(): void {
  let m = -1;
  while (++m < 2) {
    if (g.wx[m] > -1) {
      const wx = g.wx[m], wy = g.wy[m];
      clr_bg(wx - 10, wy - 15, 20, 15);
      color(1);
      line(wx, wy, wx, wy - 15);
      if (m === g.n) {
        line(wx, wy - 15, wx + ws, wy - 13 + wc);
        line(wx, wy - 11, wx + ws, wy - 13 + wc);
      }
    }
  }
}

/********************** BALLER.TAB laden/speichern ***************************/
/** disabled in Ballerburg SDL 1.2.3 (#if 1): nothing is read or written */
export function t_load(): number {
  return 0;
}

export function t_save(): number {
  return 0;
}

/************************* BALLER.DAT laden **********************************/
/** liest eine Dezimalzahl von der Datei, Remarks werden überlesen */
function rdzahl(f: { d: Uint8Array; p: number }): number {
  const zeichen = () => {
    if (f.p >= f.d.length) throw new Error('zeichen: end of baller.dat');
    return s8(f.d[f.p++]);
  };
  let a: number, sign = 1, rem = 0;
  let val = 0;
  do {
    if ((a = zeichen()) === 42) rem = rem ? 0 : 1; // '*'
  } while ((a !== 45 && a < 48) || a > 57 || rem);
  if (a === 45) {
    sign = -1;
    a = zeichen();
  }
  while (a >= 48 && a <= 57) {
    val *= 10;
    val += a - 48;
    a = zeichen();
  }
  return sign * val;
}

export function burgen_laden(): void {
  const bur_ad = new Int16Array(16000); /* Speicher für Burgdaten (32000 Bytes) */
  const f = { d: assets.dat, p: 0 };
  let a = 0, j: number;
  g.b_anz = 0;
  g.burgen = [];
  while ((j = s16(rdzahl(f))) !== -999 && g.b_anz < 30) {
    g.burgen[g.b_anz++] = bur_ad.subarray(a);
    bur_ad[a++] = j;
    for (j = 0; j < 40; j++) bur_ad[a++] = rdzahl(f);
    while ((bur_ad[a++] = rdzahl(f)) !== -1);
  }
}

/** Ermittelt, ob Punkt gesetzt ist */
export function loc(x: number, y: number): number {
  const a = scr_getpixel(x, y);
  return (a & 0xff) !== 0xff ? 1 : 0;
}

/** Zeichnet eine Linie */
export function line(x1: number, y1: number, x2: number, y2: number): void {
  const xy = g.xy;
  xy[0] = x1;
  xy[1] = y1;
  xy[2] = x2;
  xy[3] = y2;
  scr_pline(2, xy);
}

export function box(x: number, y: number, x2: number, y2: number, c: number): void {
  const xy = g.xy;
  color(c);
  xy[0] = x;
  xy[1] = y;
  xy[2] = x2;
  xy[3] = y2;
  scr_bar(xy);
}
