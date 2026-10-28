// baller2.c: the computer players and their strategies, the flight of the cannonball and what it hits,
// explosions, the landscape and the castles, drawing the castle data, shaft towers and the king.
import { rand } from './random.ts';
import { g, fn, loc, s16, s8, div, P57, G, type Kanone } from './baller1.ts';
import {
  clr, clr_bg, color, scr_cannonball, scr_circle, scr_clear, scr_draw_done_button, scr_fillarea, scr_l_text, scr_line,
  scr_pline, scr_sf_interior, scr_sf_style, scr_update,
} from './screen.ts';
import { Giaccess, Dosound } from './psg.ts';
import { SDL_Delay, SDL_PumpEvents } from './sdl.ts';
import { DlgAlert_Notice } from './dlgAlert.ts';
import { moves } from './moves.ts';

/***************** Grafikdaten für Trohn, Kanone... **************************/
const trohn = new Int16Array([-2, 2, 2, 8, 3, 5, 12, 8, 12, 12, 16, 12, 17, 14, 15,
  15, 15, 17, 17, 17, 16, 21, 11, 24, 11, 21, 3, -9, -4, 3, 0, 5, 2, 24, 2, 26, 0, -9,
  19, 4, 18, 9, -9, 10, 4, 11, 9, -9, 14, 4, 15, 4, -9, 8, 10, 11, 11, -9, 21, 10, 18, 11, -9,
  14, 17, 15, 17, -9, 13, 19, 13, 19, -9, 16, 19, 16, 19, -9, 12, 22, 12, 21, 15, 21, 14, 22,
  17, 21, 17, 22, -9, 6, 13, 6, 17, 5, 16, 5, 17, 7, 17, 7, 16, -9, -1]);
export const kanon = new Int16Array([-2, 1, 1, 1, 0, 3, 3, 5, 0, 3, 3, 3, 11, 2, 11, 2, 9, 4, 9, 4, 11, 3, 11, 3, 8, 0, 5,
  3, 8, 6, 5, 3, 8, 3, 3, -9, 11, 0, 13, 2, 15, 0, 16, 0, 17, 1, 17, 2, 15, 4, 19, 8, 16, 11, 8, 3, -9,
  -1]);
const sack = new Int16Array([-4, 1, 1, 1, 4, 2, 5, 2, 0, 3, 0, 3, 8, 2, 8, 4, 8, 3, 8, 3, 6, 4, 6, 4, 0, 5, 0,
  5, 6, 6, 5, 6, 1, -9, -1]);
const fass = new Int16Array([-4, 2, 0, 6, 0, 8, 3, 8, 5, 6, 8, 2, 8, 0, 5, 0, 3, 2, 0, 3, 0, 3, 3, 2, 4, 3, 5, 3, 8,
  5, 8, 5, 5, 6, 4, 5, 3, 5, 1, -9, -1]);
const kuge = new Int16Array([-2, 1, 1, 1, 0, 0, 1, 0, 3, 1, 4, 3, 4, 4, 3, 4, 1, 3, 0, -9, -1]);
const turm = new Int16Array([-4, 23, 30, 27, 0, 3, 10, 24, 20, 6, 30, 23, 30, 5, 20, 26, 10, 2, 0, 6, 30, -9,
  8, 0, 8, 31, 9, 34, 11, 36, 14, 37, 15, 37, 18, 36, 20, 34, 21, 31, 21, 29, 20, 26, 18, 24, 15, 23,
  14, 23, 11, 24, 9, 26, 8, 29, -9, 14, 23, 15, 37, -9, 10, 25, 19, 35, -9, 10, 35, 19, 25, -9,
  21, 30, 21, 0, -9, -1]);

/************************ Der Computer agiert: *******************************/
let zx = 0, zy = 0; /* Koordinaten des Zieles */
let bh: Int16Array = new Int16Array(0);
let vvx = 0, vvy = 0;
/** koenig()'s statics: the last sentence each king said */
let ltz: (Sentence | null)[] = [null, null];

export function baller2Reset(): void {
  zx = zy = 0;
  bh = new Int16Array(0) as Int16Array;
  vvx = vvy = 0;
  ltz = [null, null];
  kn_visited.text = '';
}

/** what a new online round starts from: no king has spoken yet */
export function kingsForget(): void {
  ltz = [null, null];
}

/** Führt einen Zug des Computers durch */
export function comp(): number {
  const n = g.n, f = g.f, ka = g.ka[n], ft = g.ft[n];
  let i: number, t: number;
  let x2 = 0, x: number, y: number, vx2: number, vx: number, vy = 0, wi: number;

  g.st[n] = 16;
  for (i = 0; i < 10; i++) if (ka[i].x > -1) break;
  if (g.pu[n] < 20 && g.ge[n] >= g.prices[4]) {
    g.pu[n] += 30; /* Pulv. kaufen*/
    g.ge[n] -= g.prices[4];
  }
  if (!g.ku[n] && g.ge[n] >= g.prices[5]) {
    g.ku[n] += 2; /* Kug.  kaufen*/
    g.ge[n] -= g.prices[5];
  }
  if (i > 9 && g.ge[n] >= g.prices[2]) {
    init_ka(i = 0, 639 * n); /* Ka. kauf.*/
    g.ge[n] -= g.prices[2];
  }
  if ((ft[0].x < 0 || ft[1].x < 0 || ft[2].x < 0) && g.ge[n] >= g.prices[1] && g.cw[n] > 2) {
    g.ge[n] -= g.prices[1]; /* Förderturm kaufen */
    fturm();
  }
  drw_all();

  if (i > 9 || g.pu[n] < 20 || !g.ku[n]) return -1;

  /* Jetzt kommen die Berechnungen für den Schuss: */
  const nn = n ? 0 : 1;
  bh = g.burgen[g.bur[nn]];
  do i = rand() % 10;
  while (ka[i].x === -1);

  zx = 639 * nn - f * (rand() % bh[0]);
  zy = g.by[nn];
  t = rand() % 100;
  if (g.cw[n]) z_kn();
  switch (g.cw[n]) { /* Die verschiedenen Strategien */
    case 1:
      if (t < 30) z_ge();
      if (t > 60) z_pk();
      break;
    case 2:
      z_ka();
      if (t < 90) z_ge();
      break;
    case 3:
      if (t < 50) z_ka();
      else if (t < 70) z_ge();
      else if (t < 90) z_pk();
      if (!(rand() % 3)) z_ft();
      break;
    case 4:
      z_ka();
      break;
    case 5:
      z_ka();
      if (t < 90) z_ft();
  }

  y = ka[i].y - 10 - zy;
  t = 49 - g.cx[n] * 16; /* Berechnen der Distanz */
  x = ka[i].x + 10 + 7 * f - zx - div(t, 2) + rand() % t;
  if (x < 0) x = -x;

  const wd = s8(n ? -g.wnd : g.wnd);

  x2 = -1;
  for (vx = .5; vx < 7 && (x2 < x || vy / 3.5 > vx);) { /* Zeitberechnung bei verschiedenen X-Geschwindigkeiten */
    vx += .4;
    t = x2 = 0;
    vx2 = vx;
    while (vx2 > 0 && x2 < x) {
      x2 += vx2;
      vx2 += (div(wd, 2) - vx2) / 5000;
      t++;
    }
    vy = y / t + .5 * G * t;
  }

  if (n) vx = -vx;
  vvx = vx;
  vvy = vy; /* Werte für Schuss übergeben */

  if (vx < 0) vx = -vx;
  wi = Math.atan2(vy, vx);
  ka[i].w = s16(Math.trunc(wi * P57));
  ka[i].p = s16(Math.trunc(4.0 * vx / Math.cos(wi) - 1.6));

  return i;
}

/********************* Routinen zur Zielerkennung: ***************************/
/* Die Routinen berechnen die Zielkoordinaten für den König, Kanonen, Geld...*/
function z_kn(): void {
  const nn = g.n ? 0 : 1;
  zx = nn * 639 - g.f * (bh[21] + 15);
  zy = g.by[nn] - bh[22] - 5;
}

function z_ka(): void {
  const other = g.ka[g.n ? 0 : 1];
  let i: number;
  for (i = 0; i < 10; i++) if (other[i].x > -1) break;
  if (i < 10) {
    do i = rand() % 10;
    while (other[i].x === -1);
    zx = other[i].x + 10;
    zy = other[i].y;
  }
}

function z_ft(): void {
  const other = g.ft[g.n ? 0 : 1];
  let i: number;
  for (i = 0; i < 5; i++) if (other[i].x > -1) break;
  if (i < 5) {
    zx = other[i].x - 15 * g.f;
    zy = other[i].y - 10;
  }
}

function z_ge(): void {
  const nn = g.n ? 0 : 1;
  if (g.ge[nn] > 100) {
    zx = nn * 639 - g.f * (bh[25] + div(bh[31], 2));
    zy = g.by[nn] - bh[26];
  }
}

function z_pk(): void {
  const nn = g.n ? 0 : 1;
  if (g.ku[nn] || g.pu[nn] > 19) {
    const i = rand() & 2;
    zx = nn * 639 - g.f * (bh[27 + i] + div(bh[33 + i], 2));
    zy = g.by[nn] - bh[28 + i];
  }
}

/********************************* Ein Schuss ********************************/
/** k = Nr. der Kanone */
export async function schuss(k: number): Promise<void> {
  let x: number, y: number;
  let ox = 0.0, oy = 0.0;
  let vx: number, vy: number;
  let v: number, c: number, a = 0, j: number;
  const n0 = g.n, kan: Kanone = g.ka[n0][k];

  g.pu[n0] -= kan.p;
  g.ku[n0]--;
  drw_gpk(1);
  drw_gpk(2);

  x = kan.x + 10 + 7 * g.f;
  y = kan.y - 10;
  c = 2;
  vx = (.4 + 0.25 * kan.p) * Math.cos(kan.w / P57) * g.f;
  vy = (.4 + 0.25 * kan.p) * Math.sin(kan.w / P57);

  if (g.mod & (2 - n0)) {
    vx = vvx;
    vy = vvy;
  }

  color(1);
  await baller(0);
  kugel(Math.trunc(x), Math.trunc(y));
  scr_update(Math.trunc(x - 3), Math.trunc(y - 3), 6, 6);

  v = 1;
  while (x > 3 && x < 637 && y < 396 && (v || c)) { /* Flugschleife */
    ox = x;
    oy = y;
    x += vx;
    y -= vy;
    vy -= G;
    vx += (div(g.wnd, 2) - vx) / 5000;

    color(0);
    kugel(Math.trunc(ox), Math.trunc(oy));
    if (x >= 3 && x <= 637 && y >= 3 && y <= 397) {
      const ix = Math.trunc(x), iy = Math.trunc(y);
      v &= loc(ix, iy) ? 0 : 1;
      for (let i = -1; i <= 1; i++) {
        v = v & (loc(ix - 2, iy + i) ? 0 : 1) & (loc(ix + 2, iy + i) ? 0 : 1) & (loc(ix + i, iy + 2) ? 0 : 1);
      }
    }
    color(1);
    kugel(Math.trunc(x), Math.trunc(y));
    scr_update(Math.trunc(Math.min(ox, x) - 3), Math.trunc(Math.min(oy, y) - 3),
      Math.abs(Math.trunc(ox - x)) + 7, Math.abs(Math.trunc(oy - y)) + 7);
    await SDL_Delay(8);
    SDL_PumpEvents();

    a = s16(Math.trunc(1000 + 2 * y));
    if (a < 30) a = 30;
    Giaccess(10, 137);
    Giaccess(244, 135);
    Giaccess(a & 255, 130);
    Giaccess(a >> 8, 131);

    if (c > 0) {
      c--;
      if (c === 0) draw(kan.x + 20 * n0, kan.y, kanon);
    }
  }

  color(0);
  kugel(Math.trunc(x), Math.trunc(y));
  scr_update(Math.trunc(x - 3), Math.trunc(y - 3), 6, 6);

  draw(kan.x + 20 * n0, kan.y, kanon);

  const oldn = g.n;
  if (!v) {
    for (c = 0; c < 4; c++) { /* Einschlag der Kugel */
      if (ox > 6 && ox < 634) scr_circle(Math.trunc(ox), Math.trunc(oy), 5);

      await baller(22 + c * 3);

      for (g.n = 0; g.n < 2; g.n++) { /* Treffer ? */
        const n = g.n;
        const bg = g.bg = g.burgen[g.bur[n]];
        const iox = Math.trunc(ox), ioy = Math.trunc(oy);
        if (rand() & 1 && (n ? x > 639 - bg[0] : x < bg[0]) && g.vo[n]) g.vo[n]--;
        fn();
        const f = g.f;
        for (j = 0; j < 10; j++) {
          const kj = g.ka[n][j];
          if (kj.x < ox + 2 && kj.x + 22 > ox && kj.x > -1 && kj.y - 16 < oy && kj.y > oy) {
            clr_bg(a = kj.x, v = s16(kj.y - 12), 20, 13);
            await expls(a + 10, v + 6, 10, 8, 50);
            color(0);
            kj.x = -1;
          }
        }
        for (j = 0; j < 5; j++) {
          const fj = g.ft[n][j];
          if (fj.x > -1 && drin(a = s16(639 * n + f * fj.x), v = s16(g.by[n] - fj.y), 30, 37, 2, iox, ioy)) {
            if (drin(a, v, 30, 37, -2, iox, ioy)) {
              await expls((a = s16(fj.x - 29 * n)) + 15, (v = s16(fj.y - 40)) + 20, 15, 20, 120);
              clr_bg(a, v, 30, 40);
              fj.x = -1;
            }
            c = 4;
          }
        }
        if (ox > g.wx[n] - 11 && ox < g.wx[n] + 11 && oy > g.wy[n] - 16 && oy < g.wy[n] && g.wx[n] > -1) {
          /* Windfahne getroffen */
          clr_bg(g.wx[n] - 10, g.wy[n] - 15, 20, 15);
          g.wx[n] = -1;
        }
        if (drin(bg[21], bg[22], 30, 25, 0, iox, ioy)) {
          g.end = n + 17;
          await expls(a = s16(639 * n + f * (bg[21] + 15)), v = s16(g.by[n] - bg[22] - 12), 17, 17, 40);
          scr_circle(a, v, 17);
          await expls(a, v, 17, 17, 200);
          c = 4;
        }
        for (j = 0; j < 6; j += 2) {
          if (drin(bg[25 + j], bg[26 + j], a = bg[31 + j], v = bg[32 + j], 3, iox, ioy)) break;
        }
        switch (j) {
          case 0:
            g.ge[n] -= Math.min(200, g.ge[n]);
            break;
          case 2:
            g.pu[n] = 0;
            break;
          case 4:
            g.ku[n] -= Math.min(2, g.ku[n]);
        }
        if (j < 6) {
          await expls(639 * n + f * (bg[25 + j] + div(a, 2)), g.by[n] - bg[26 + j] - div(v, 2),
            div(a, 2), div(v, 2), 60 + 100 * (j === 2 ? 1 : 0));
          drw_gpk(j >> 1);
          c = 4;
        }
      }
      ox += vx;
      oy -= vy;
    }
  }
  g.n = oldn;
  fn();
  Giaccess(0, 137);
}

/****************************** Explosion ************************************/
export async function expls(x: number, y: number, w: number, h: number, d: number): Promise<void> {
  const xy = g.xy;
  color(0);

  for (let i = 0; i < 32;) {
    xy[i++] = x;
    xy[i++] = y;
  }

  while (d-- > 0) {
    scr_pline(2, xy);
    xy.copyWithin(0, 4, 64); /* memmove(xy, xy+4, 120) */
    for (let j = 28; j < 32;) {
      xy[j++] = x - w + div(w * (rand() & 511), 256);
      xy[j++] = y - h + div(h * (rand() & 511), 256);
    }
    let fire_col = (rand() & 0x3f) + 0xc0;
    fire_col = (fire_col << 16) | ((rand() % fire_col) << 8);
    scr_line(xy[28], xy[29], xy[30], xy[31], fire_col);
    scr_update(x - w, y - h, w * 2, h * 2);
    await baller((d & 31) ^ 31);
    await SDL_Delay(10);
  }

  for (let i = 0; i < 32; i += 4) scr_pline(2, xy.subarray(i));
}

export function kugel(x: number, y: number): number {
  if (x < 3 || x > 637 || y < 3 || y > 397) return 0;
  scr_cannonball(x, y);
  return 1;
}

const s_bal = new Uint8Array([0, 0, 1, 15, 6, 31, 9, 0, 11, 0, 12, 50, 13, 0, 7, 192, 8, 16, 255, 0]);

export async function baller(r: number): Promise<void> {
  s_bal[5] = r;
  Dosound(s_bal);
  await SDL_Delay(10);
}

/**************************** Neues Bild zeichnen ****************************/
export function bild(): void {
  scr_clear();

  g.by[0] = (rand() % 80 + 300) & ~3;
  g.by[1] = (rand() % 80 + 300) & ~3;

  let y = 400, x1 = 0, x2 = 2556;
  color(1);
  let v1 = 2, v2 = 2;

  while (x1 < x2 && --y > 20) {
    const green = 0x70 + div(400 - y, 4);
    scr_line(div(x1, 4), y, div(x2, 4), y, 0x300030 + (green << 8));
    if (y === g.by[0]) x1 = s16(g.burgen[g.bur[0]][0] * 4);
    if (y === g.by[1]) x2 = s16((639 - g.burgen[g.bur[1]][0]) << 2);
    if (x1) {
      v1 = v1 + rand() % 5 - 2;
      v1 = Math.max(0, v1);
      v1 = Math.min(7, v1);
      x1 = s16(x1 + v1);
    }
    if (x2 < 2556) {
      v2 = v2 + rand() % 5 - 2;
      v2 = Math.max(0, v2);
      v2 = Math.min(7, v2);
      x2 = s16(x2 - v2);
    }
  }

  for (const side of g.ka) for (const k of side) k.x = k.y = k.w = k.p = -1; /* memset(ka, -1, sizeof(ka)) */

  burg(0);
  burg(1);

  scr_update(0, 0, 640, 400);

  scr_l_text(276, 395 + 16, ' Round     ');
  scr_draw_done_button(0);
}

/***************************** Burg zeichnen *********************************/
export function burg(nn: number): void {
  const oldn = g.n;
  g.n = nn;
  fn();
  const xr = g.n & 2 ? g.bx[g.n &= 1] : 639 * g.n;
  const n = g.n;
  const bg = g.bg = g.burgen[g.bur[n]];
  g.ge[n] = bg[37];
  g.pu[n] = bg[38];
  g.ku[n] = bg[39];
  g.vo[n] = bg[40];

  color(1);
  draw(xr, g.by[n], bg.subarray(45));
  clr(xr + g.f * bg[21] - n * 30, g.by[n] - bg[22] - 25, 30, 25);
  color(1);
  draw(xr + g.f * bg[21], g.by[n] - bg[22], trohn);

  g.n = nn;
  for (let i = 0; i < 10 && bg[i * 2 + 1] > -1; i++) init_ka(i, xr);
  drw_all();
  g.n = oldn;
}

/** Kanone k setzen */
export function init_ka(k: number, xr: number): void {
  const bg = g.bg, n = g.n;
  const x = s16(xr + bg[1 + k * 2] * g.f), y = s16(g.by[n & 1] - bg[2 + k * 2]);
  draw(x, y, kanon);
  if (~n & 2) {
    const c = g.ka[n][k];
    c.x = s16(x - 20 * n);
    c.y = y;
    c.w = 45;
    c.p = 12;
  }
}

/** Geld, Pulver und Kugeln zeichnen */
export function drw_all(): void {
  drw_gpk(0);
  drw_gpk(1);
  drw_gpk(2);
}

export function drw_gpk(w: number): void {
  let i = 0, z: number, x: number, y: number, xp = 0, yp = 0;
  const n = g.n, m = n & 1;
  let a = sack;

  switch (w) {
    case 0:
      a = sack;
      xp = 7;
      yp = 10;
      i = div(g.ge[m] + 149, 150);
      break;
    case 1:
      a = fass;
      xp = yp = 9;
      i = div(g.pu[m] + 29, 30);
      break;
    case 2:
      a = kuge;
      xp = yp = 6;
      i = g.ku[m];
  }
  const bg = g.bg = g.burgen[g.bur[m]];
  w *= 2;
  const xr = s16((n & 2 ? g.bx[m] : 639 * m) + g.f * bg[25 + w]);
  const yr = s16(g.by[m] - bg[26 + w]);

  clr(xr - bg[31 + w] * m - (n ? 0 : 1), yr - bg[32 + w], bg[31 + w] + 1, bg[32 + w] + 1);
  color(1);

  for (y = z = 0; i > 0 && y < bg[32 + w]; y += yp) {
    for (x = 0; i > 0 && x < bg[31 + w]; x += xp, z++, i--) draw(xr + g.f * x, yr - y, a);
  }
  if (i > 0) { /* Maximalbetrag überschritten ? */
    switch (w) {
      case 0:
        g.ge[m] = z * 150;
        break;
      case 2:
        g.pu[m] = z * 30;
        break;
      case 4:
        g.ku[m] = z;
    }
  }
}

/***************************** Zeichenroutine ********************************/
export function draw(x: number, y: number, a: Int16Array): void {
  const xy = g.xy, f = g.f;
  let i: number, fil = 1, p = 0;

  scr_sf_interior(2);
  scr_sf_style(9);
  while (a[p] !== -1) {
    if (a[p] === -2) {
      scr_sf_interior(a[++p]);
      scr_sf_style(a[++p]);
    } else if (a[p] === -4) {
      fil = fil ? 0 : 1;
    } else {
      i = 0;
      while (a[p] > -1) {
        xy[i++] = x + a[p++] * f;
        xy[i++] = y - a[p++];
      }
      xy[i++] = xy[0];
      xy[i++] = xy[1];
      if (fil) scr_fillarea(i >> 1, xy);
      else scr_pline((i >> 1) - 1, xy);
    }
    p++;
  }
}

/** Förderturm bauen */
export function fturm(): void {
  const n = g.n, f = g.f, bg = g.bg;
  let t: number, i: number;
  for (t = 0; t < 5; t++) if (g.ft[n][t].x === -1) break;
  const x = s16(639 * n + f * (bg[0] + 20 + 30 * t));
  let y = 380, yy: number;
  do {
    while (loc(x, y) && loc(x + 29 * f, y--));
    yy = y;
    for (i = 0; i < 40; i++, y--) if (loc(x, y) && loc(x + 29 * f, y)) break;
  } while (i < 40);
  y = yy;
  clr_bg(x - 29 * n, y - 70, 30, 70);
  color(1);
  g.ft[n][t].x = x;
  g.ft[n][t].y = y;
  draw(x, y, turm);
}

/* ************************ Audience with the king ************************* */
/** a sentence of the king: compared by identity, as the original compares its string pointers */
interface Sentence { text: string }
const S = (text: string): Sentence => ({ text });
const kna = 'The king says:', kne = 'Humbly acknowledged';
const kn0 = S('Well...\n alright...\n Carry on...'),
  kn1 = S('We are satisfied\n with your performance!'),
  kn2 = S('Excellent,\n keep at it!'),
  kn3 = S('Maybe you ought to\n lower Our taxes...'),
  kn4 = S('If you keep this up,\n We shall discharge you!'),
  kn5 = S("Why don't you buy\n a shaft tower..."),
  kn6 = S('You ought to\n kindly make more of\n an effort!'),
  kn7 = S("You don't need to visit Us\n in each round."),
  kn9 = S('So, are you certain\n that you will manage\n without a weather vane?'),
  kn10 = S('Nice to see you...'),
  kn11 = S('What are We supposed\n to say in such an\n early phase?'),
  kn12 = S('You ought to earn more money,\n build more shaft towers,\n and vanquish the opponent.'),
  kn13 = S('We do not have anything new\n to say to you.'),
  kn14 = S('We are pleased for you\n to come around and visit Us.');
/** static char kn_visited[80]: one buffer, so always the same "pointer" */
const kn_visited = S('');

export async function koenig(): Promise<void> {
  const n = g.n, bg = g.bg;
  const s: Sentence[] = [];
  let k = 0, t = 0, i: number, j: number;

  for (j = 0; j < 10; j++) k += g.ka[n][j].x > -1 ? 1 : 0;
  for (j = 0; j < 5; j++) t += g.ft[n][j].x > -1 ? 1 : 0;

  // the audience's words are for the player at the castle; the online opponent only sees it happen
  const show = !moves?.remote(n);
  if (!(rand() % 20) || g.kn[n] & 16 || (g.kn[n] & 15) > 9) {
    if (show) await DlgAlert_Notice('The king is not in the mood\nto talk to you.', 'Too bad.');
    else scr_update(0, 0, 0, 0); // what the notice's end does on the player's own screen
  } else {
    kn_visited.text = `Are you aware\n that you have already visited Us\n ${div(g.kn[n], 256)} times thus far?`;

    j = rand();
    i = 2;
    s[0] = j & 1 ? kn0 : kn10;
    s[1] = j & 2 ? kn12 : kn6;
    if (j & 4) s[i++] = kn14;

    if (g.ge[n] > g.prices[1] && t < 3) s[i++] = kn5;
    if ((g.st[n] > 40 && g.vo[n] < bg[40]) || g.st[n] > 70) s[i++] = kn3;
    if (g.wx[n] < 0) s[i++] = kn9;
    if (g.ge[n] > bg[37] && g.vo[n] > bg[40] && k > 1) s[1] = t < 2 ? kn1 : kn2;
    if (t > 2) s[i++] = kn2;
    if (k < 1 && g.ge[n] < g.prices[2]) s[i++] = kn4;
    if ((g.kn[n] & 15) > 4) {
      s[i++] = kn7; s[i++] = kn7; s[i++] = kn7;
    }
    if ((g.kn[n] & 15) > 6 || (!(rand() & 7) && g.kn[n] > 2048)) {
      s[i++] = kn_visited; s[i++] = kn_visited;
    }
    if (g.zug < 4) s[1] = s[2] = s[(i = 4) - 1] = kn11;

    do {
      if (s[j = rand() % i] === ltz[n]) {
        s[i++] = kn13;
        s[i++] = kn13;
      }
    } while (s[j] === ltz[n]);
    ltz[n] = s[j];

    if (show) await DlgAlert_Notice(`${kna}\n'${s[j].text}'`.slice(0, 299), kne);
    else scr_update(0, 0, 0, 0);
  }
  g.kn[n] |= 16;
  g.kn[n] += 256;
  if (~g.kn[n] & 15) g.kn[n]++;
}

/** Test, ob Koord. innerhalb eines Rechteckes */
export function drin(xk: number, yk: number, w: number, h: number, r: number, x: number, y: number): boolean {
  if (g.n) xk = s16(639 - xk - w);
  const by = g.by[g.n];
  return x > xk - r && x < xk + w + r && y < by - yk + r && y > by - yk - h - r;
}
