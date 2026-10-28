// x11/guimap.c: drawing the map: polygons with their styles and edges, fuel stations, bases with
// names, checkpoints, gravity and wormhole symbols, background dots, targets and treasures.
import { G } from './G.ts';
import {
  BLOCK_SZ, BLACK, WHITE, BLUE, RED, MAX_STATION_FUEL, TEAM_PLAY, LIMITED_LIVES, SETUP_BASE_UP, SETUP_BASE_DOWN,
  SETUP_BASE_LEFT, SETUP_BASE_RIGHT, SETUP_CANNON_UP, SETUP_CANNON_DOWN, SETUP_CANNON_LEFT, SETUP_CANNON_RIGHT,
  BM_BASE_DOWN, BM_BASE_UP, BM_BASE_RIGHT, BM_BASE_LEFT, BM_CANNON_DOWN, BM_CANNON_UP, BM_CANNON_RIGHT, BM_CANNON_LEFT,
  BM_FUELCELL, BM_FUEL, BM_CHECKPOINT, BM_PLUSGRAVITY, BM_MINUSGRAVITY, BM_WORMHOLE, BM_CONCENTRATOR, BM_ASTEROIDCONC,
  BM_HOLDER_FRIEND, BM_HOLDER_ENEMY, STYLE_INVISIBLE, STYLE_TEXTURED, STYLE_FILLED, NUM_BITMAPS, TARGET_DAMAGE, BALL_RADIUS,
  RES, MOD2,
} from './consts.ts';
import { ABS, BIT, LIMIT, onReset, s16, sprintf, toInt } from './cutil.ts';
import { warn } from './error.ts';
import * as X from '../xlib/xlib.ts';
import type { XPoint } from '../xlib/xlib.ts';
import { rd } from './record.ts';
import { SET_FG, Arc_add, Rectangle_add, Segment_add } from './paintdata.ts';
import { WINSCALE, UWINSCALE, SCALEX, SCALEY, X as XX, Y as YY } from './paint.ts';
import { Bitmap_get, Bitmap_paint, Bitmap_paint_area, pixmaps } from './bitmaps.ts';
import { Homebase_by_id, Other_by_id } from './client.ts';
import { Check_name_string, Life_color, Team_color, Gui_paint_appearing } from './guiobjects.ts';
import { tcos, tsin } from './xpmath.ts';
import { COLOR_INDEX_OPTION, STORE_OPTIONS, ref } from './option.ts';

const GM = {
  baseNameColor: 0, backgroundPointColor: 0, fuelColor: 0, visibilityBorderColor: 0,
  fuel_text_width: 0, fuel_text_is_bigger: false, fuel_lastScaleFactor: 0,
  tris_rot_dir: 0, tris_loop: 0, tris: [[7, 3, 0, 3, 0], [11, 5, 3, 3, 0], [14, 8, 5, 3, 0]],
  sqrs_rot_dir: 0, sqrs_loop: 0, sqrs: [[8, 3, 0, 3, 0], [12, 5, 3, 3, 0], [16, 8, 5, 3, 0]],
};
onReset(() => Object.assign(GM, {
  baseNameColor: 0, backgroundPointColor: 0, fuelColor: 0, visibilityBorderColor: 0,
  fuel_text_width: 0, fuel_text_is_bigger: false, fuel_lastScaleFactor: 0,
  tris_rot_dir: 0, tris_loop: 0, tris: [[7, 3, 0, 3, 0], [11, 5, 3, 3, 0], [14, 8, 5, 3, 0]],
  sqrs_rot_dir: 0, sqrs_loop: 0, sqrs: [[8, 3, 0, 3, 0], [12, 5, 3, 3, 0], [16, 8, 5, 3, 0]],
}));

const pt = (x: number, y: number): XPoint => ({ x: s16(x), y: s16(y) });
const half = Math.trunc(BLOCK_SZ / 2);

export function Gui_paint_cannon(x: number, y: number, type: number): void {
  if (!G.texturedObjects) {
    SET_FG(G.colors[WHITE].pixel);
    const p: XPoint[] = [];
    switch (type) {
      case SETUP_CANNON_UP:
        p.push(pt(WINSCALE(XX(x)), WINSCALE(YY(y))), pt(WINSCALE(XX(x + BLOCK_SZ)), WINSCALE(YY(y))), pt(WINSCALE(XX(x + half)), WINSCALE(YY(y + Math.trunc(BLOCK_SZ / 3)))));
        break;
      case SETUP_CANNON_DOWN:
        p.push(pt(WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ))), pt(WINSCALE(XX(x + BLOCK_SZ)), WINSCALE(YY(y + BLOCK_SZ))), pt(WINSCALE(XX(x + half)), WINSCALE(YY(y + Math.trunc((2 * BLOCK_SZ) / 3)))));
        break;
      case SETUP_CANNON_RIGHT:
        p.push(pt(WINSCALE(XX(x)), WINSCALE(YY(y))), pt(WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ))), pt(WINSCALE(XX(x + Math.trunc(BLOCK_SZ / 3))), WINSCALE(YY(y + half))));
        break;
      case SETUP_CANNON_LEFT:
        p.push(pt(WINSCALE(XX(x + BLOCK_SZ)), WINSCALE(YY(y))), pt(WINSCALE(XX(x + BLOCK_SZ)), WINSCALE(YY(y + BLOCK_SZ))), pt(WINSCALE(XX(x + Math.trunc((2 * BLOCK_SZ) / 3))), WINSCALE(YY(y + half))));
        break;
      default:
        warn(`Unknown cannon type ${type}`);
        return;
    }
    p.push(p[0]);
    rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, p, 4, 0);
  } else {
    switch (type) {
      case SETUP_CANNON_UP: Bitmap_paint(G.drawPixmap, BM_CANNON_DOWN, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      case SETUP_CANNON_DOWN: Bitmap_paint(G.drawPixmap, BM_CANNON_UP, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ - 1)), 0); break;
      case SETUP_CANNON_LEFT: Bitmap_paint(G.drawPixmap, BM_CANNON_RIGHT, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      case SETUP_CANNON_RIGHT: Bitmap_paint(G.drawPixmap, BM_CANNON_LEFT, WINSCALE(XX(x - 1)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      default: warn(`Unknown cannon type ${type}`);
    }
  }
}

export function Gui_paint_fuel(x: number, y: number, fuel: number): void {
  if (GM.fuelColor === BLACK) return;
  if (!G.texturedObjects) {
    const FUEL_BORDER = 2;
    if (!GM.fuel_text_width || GM.fuel_lastScaleFactor !== G.clData.scaleFactor) {
      GM.fuel_lastScaleFactor = G.clData.scaleFactor;
      GM.fuel_text_width = X.XTextWidth(G.gameFont, 'F', 1);
      GM.fuel_text_is_bigger = GM.fuel_text_width + 4 > WINSCALE(BLOCK_SZ) + 1 || G.gameFont.ascent + G.gameFont.descent > WINSCALE(BLOCK_SZ) + 2;
    }
    SET_FG(G.colors[GM.fuelColor].pixel);
    const size = toInt(((BLOCK_SZ - 2 * FUEL_BORDER) * fuel) / MAX_STATION_FUEL);
    rd.fillRectangle(G.dpy, G.drawPixmap, G.gameGC, SCALEX(x + FUEL_BORDER), SCALEY(y + FUEL_BORDER + size),
      UWINSCALE(BLOCK_SZ - 2 * FUEL_BORDER + 1), UWINSCALE(size + 1));
    X.XSetFunction(G.dpy, G.gameGC, X.GXxor);
    SET_FG(G.colors[BLACK].pixel ^ G.colors[GM.fuelColor].pixel);
    const tx = SCALEX(x + half) - Math.trunc(GM.fuel_text_width / 2);
    const ty = SCALEY(y + half) + Math.trunc(G.gameFont.ascent / 2);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, tx, ty, 'F', 1);
    X.XSetFunction(G.dpy, G.gameGC, X.GXcopy);
  } else {
    const BITMAP_FUEL_BORDER = 3;
    const fuel_images = ABS(pixmaps()[BM_FUEL].count);
    let image = ABS((G.loopsSlow + x + x * y) % (fuel_images * 2));
    if (image >= fuel_images) image = 2 * fuel_images - 1 - image;
    const size = toInt(((BLOCK_SZ - 2 * BITMAP_FUEL_BORDER) * fuel) / MAX_STATION_FUEL);
    Bitmap_paint(G.drawPixmap, BM_FUELCELL, SCALEX(x), SCALEY(y + BLOCK_SZ), 0);
    const bit = Bitmap_get(G.drawPixmap, BM_FUEL, image);
    if (bit !== null) {
      const area = { x: 0, y: 0, w: WINSCALE(BLOCK_SZ - 2 * BITMAP_FUEL_BORDER), h: WINSCALE(size) };
      Bitmap_paint_area(G.drawPixmap, bit, SCALEX(x + BITMAP_FUEL_BORDER), SCALEY(y + size + BITMAP_FUEL_BORDER), area);
    }
  }
}

export function Gui_paint_base(x: number, y: number, id: number, team: number, type: number): void {
  let color = 0;
  const BORDER = 4;
  let size = 0, size2 = 0;
  const other = Other_by_id(id);
  const base = Homebase_by_id(id);
  let do_basewarning = false;
  if (GM.baseNameColor) {
    if (!(color = Life_color(other))) color = GM.baseNameColor;
  } else color = WHITE;
  if (base !== null) {
    if (G.loops < base.appeartime) do_basewarning = true;
    if (G.version < 0x4f12 && do_basewarning && G.baseWarningType & 1) {
      let count = toInt((360 * (base.appeartime - G.loops)) / (3 * G.clientFPS));
      count = LIMIT(count, 0, 360);
      if (count > 0 && G.baseWarningType & 1) Gui_paint_appearing(x + half, y + half, id, count);
    }
  }
  if (do_basewarning && G.baseWarningType & 2) {
    if (G.loopsSlow & 1) color = color !== WHITE ? WHITE : BLACK;
  }
  SET_FG(G.colors[color].pixel);
  if (!G.texturedObjects) {
    switch (type) {
      case SETUP_BASE_UP: Segment_add(color, XX(x), YY(y - 1), XX(x + BLOCK_SZ), YY(y - 1)); break;
      case SETUP_BASE_DOWN: Segment_add(color, XX(x), YY(y + BLOCK_SZ + 1), XX(x + BLOCK_SZ), YY(y + BLOCK_SZ + 1)); break;
      case SETUP_BASE_LEFT: Segment_add(color, XX(x + BLOCK_SZ + 1), YY(y + BLOCK_SZ), XX(x + BLOCK_SZ + 1), YY(y)); break;
      case SETUP_BASE_RIGHT: Segment_add(color, XX(x - 1), YY(y + BLOCK_SZ), XX(x - 1), YY(y)); break;
      default: warn('Bad base dir.'); return;
    }
  } else {
    switch (type) {
      case SETUP_BASE_UP: Bitmap_paint(G.drawPixmap, BM_BASE_DOWN, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      case SETUP_BASE_DOWN: Bitmap_paint(G.drawPixmap, BM_BASE_UP, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ - 1)), 0); break;
      case SETUP_BASE_LEFT: Bitmap_paint(G.drawPixmap, BM_BASE_RIGHT, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      case SETUP_BASE_RIGHT: Bitmap_paint(G.drawPixmap, BM_BASE_LEFT, WINSCALE(XX(x - 1)), WINSCALE(YY(y + BLOCK_SZ)), 0); break;
      default: warn('Bad base dir.'); return;
    }
  }
  if (!GM.baseNameColor) return;
  x = SCALEX(x);
  y = SCALEY(y);
  Check_name_string(other);
  let s = '';
  if (BIT(G.Setup!.mode, TEAM_PLAY)) {
    s = String.fromCharCode(0x30 + team) + (other ? ' ' : '');
    size = X.XTextWidth(G.gameFont, s, other ? 2 : 1);
  }
  switch (type) {
    case SETUP_BASE_UP:
      y += BORDER + G.gameFont.ascent;
      x += WINSCALE(half);
      x -= Math.trunc(size / 2) + (other ? Math.trunc(other.name_width / 2) : 0);
      break;
    case SETUP_BASE_DOWN:
      y -= WINSCALE(BLOCK_SZ) + BORDER + G.gameFont.descent;
      x += WINSCALE(half);
      x -= Math.trunc(size / 2) + (other ? Math.trunc(other.name_width / 2) : 0);
      break;
    case SETUP_BASE_LEFT:
      x += WINSCALE(BLOCK_SZ) + BORDER;
      y += -WINSCALE(half) + Math.trunc(G.gameFont.ascent / 2);
      break;
    case SETUP_BASE_RIGHT:
      x -= BORDER + (other ? other.name_width : 0) + size;
      y += -WINSCALE(half) + Math.trunc(G.gameFont.ascent / 2);
      break;
    default:
      warn('BUG: bad base setup type in Gui_paint_base()');
      break;
  }
  let info = '';
  if (other) {
    if (other.mychar === 0x20 || other.mychar === 0x52) info = BIT(G.Setup!.mode, LIMITED_LIVES) ? sprintf(' %d', other.life) : ' ';
    else info = sprintf(' %c', other.mychar);
    size2 = X.XTextWidth(G.gameFont, info, info.length);
  }
  if (size) {
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, x, y, s, other ? 2 : 1);
    x += size;
  }
  if (other) {
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, x, y, other.nick_name, other.name_len);
    x += other.name_width;
  }
  if (size2) rd.drawString(G.dpy, G.drawPixmap, G.gameGC, x, y, info, info.length);
}

export function Gui_paint_setup_check(x: number, y: number, isNext: boolean): void {
  if (!G.texturedObjects) {
    SET_FG(G.colors[BLUE].pixel);
    const p = [
      pt(WINSCALE(XX(x + half)), WINSCALE(YY(y))), pt(WINSCALE(XX(x)), WINSCALE(YY(y + half))),
      pt(WINSCALE(XX(x + half)), WINSCALE(YY(y + BLOCK_SZ))), pt(WINSCALE(XX(x + BLOCK_SZ)), WINSCALE(YY(y + half))),
    ];
    p.push(p[0]);
    if (isNext) rd.fillPolygon(G.dpy, G.drawPixmap, G.gameGC, p, 5, X.Convex, X.CoordModeOrigin);
    else rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, p, 5, 0);
  } else Bitmap_paint(G.drawPixmap, BM_CHECKPOINT, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), isNext ? 1 : 0);
}

export function Gui_paint_border(x: number, y: number, xi: number, yi: number): void {
  Segment_add(G.wallColor, XX(x), YY(y), XX(xi), YY(yi));
}

function Gui_paint_rectangle(x: number, y: number, xi: number, yi: number, color: number): void {
  Segment_add(color, XX(x), YY(y), XX(x), YY(yi));
  Segment_add(color, XX(xi), YY(y), XX(xi), YY(yi));
  Segment_add(color, XX(x), YY(y), XX(xi), YY(y));
  Segment_add(color, XX(x), YY(yi), XX(xi), YY(yi));
}

export function Gui_paint_visible_border(x: number, y: number, xi: number, yi: number): void {
  if (GM.visibilityBorderColor) Gui_paint_rectangle(x, y, xi, yi, GM.visibilityBorderColor);
}

export function Gui_paint_hudradar_limit(x: number, y: number, xi: number, yi: number): void {
  Gui_paint_rectangle(x, y, xi, yi, BLUE);
}

export function Gui_paint_setup_acwise_grav(x: number, y: number): void {
  Arc_add(RED, XX(x + 5), YY(y + BLOCK_SZ - 5), BLOCK_SZ - 10, BLOCK_SZ - 10, 64 * 150, 64 * 300);
  Segment_add(RED, XX(x + half), YY(y + BLOCK_SZ - 5), XX(x + half + 4), YY(y + BLOCK_SZ - 1));
  Segment_add(RED, XX(x + half), YY(y + BLOCK_SZ - 5), XX(x + half + 4), YY(y + BLOCK_SZ - 9));
}

export function Gui_paint_setup_cwise_grav(x: number, y: number): void {
  Arc_add(RED, XX(x + 5), YY(y + BLOCK_SZ - 5), BLOCK_SZ - 10, BLOCK_SZ - 10, 64 * 90, 64 * 300);
  Segment_add(RED, XX(x + half), YY(y + BLOCK_SZ - 5), XX(x + half - 4), YY(y + BLOCK_SZ - 1));
  Segment_add(RED, XX(x + half), YY(y + BLOCK_SZ - 5), XX(x + half - 4), YY(y + BLOCK_SZ - 9));
}

export function Gui_paint_setup_pos_grav(x: number, y: number): void {
  const INSIDE_BL = BLOCK_SZ - 2;
  if (!G.texturedObjects) {
    Arc_add(RED, XX(x + 1), YY(y + BLOCK_SZ - 1), INSIDE_BL, INSIDE_BL, 0, 64 * 360);
    Segment_add(RED, XX(x + half), YY(y + 5), XX(x + half), YY(y + BLOCK_SZ - 5));
    Segment_add(RED, XX(x + 5), YY(y + half), XX(x + BLOCK_SZ - 5), YY(y + half));
  } else Bitmap_paint(G.drawPixmap, BM_PLUSGRAVITY, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0);
}

export function Gui_paint_setup_neg_grav(x: number, y: number): void {
  const INSIDE_BL = BLOCK_SZ - 2;
  if (!G.texturedObjects) {
    Arc_add(RED, XX(x + 1), YY(y + BLOCK_SZ - 1), INSIDE_BL, INSIDE_BL, 0, 64 * 360);
    Segment_add(RED, XX(x + 5), YY(y + half), XX(x + BLOCK_SZ - 5), YY(y + half));
  } else Bitmap_paint(G.drawPixmap, BM_MINUSGRAVITY, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0);
}

export function Gui_paint_setup_worm(x: number, y: number): void {
  const wormDrawCount = G.loopsSlow & 7;
  if (!G.texturedObjects) {
    const INSIDE_BL = BLOCK_SZ - 2;
    const O = [[10, 10, 10], [5, 10, 10], [0, 10, 10], [0, 5, 10], [0, 0, 10], [5, 0, 10], [10, 0, 10], [10, 5, 10]][wormDrawCount];
    SET_FG(G.colors[RED].pixel);
    Arc_add(RED, XX(x) + 0, YY(y + BLOCK_SZ) + 0, INSIDE_BL - 0, INSIDE_BL - 0, 0, 64 * 360);
    Arc_add(RED, XX(x) + O[0], YY(y + BLOCK_SZ) + O[1], INSIDE_BL - O[2], INSIDE_BL - O[2], 0, 64 * 360);
    Arc_add(RED, XX(x) + O[0] * 2, YY(y + BLOCK_SZ) + O[1] * 2, INSIDE_BL - O[2] * 2, INSIDE_BL - O[2] * 2, 0, 64 * 360);
  } else Bitmap_paint(G.drawPixmap, BM_WORMHOLE, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), wormDrawCount);
}

function concentrator(x: number, y: number, shapes: number[][], corners: number, loopKey: 'tris' | 'sqrs', img: number): void {
  if (!G.texturedObjects) {
    SET_FG(G.colors[RED].pixel);
    const loopName = loopKey === 'tris' ? 'tris_loop' : 'sqrs_loop';
    const rotName = loopKey === 'tris' ? 'tris_rot_dir' : 'sqrs_rot_dir';
    if (GM[loopName] !== G.loops) {
      GM[loopName] = G.loops;
      GM[rotName] = (GM[rotName] + 5) >>> 0;
      for (const t of shapes) t[4] += t[3];
    }
    for (const t of shapes) {
      const [size, displ, dir_off] = t;
      const rdir = MOD2(GM[rotName] + dir_off, RES);
      const cx = toInt(XX(x + half) + displ * tcos(rdir));
      const cy = toInt(YY(y + half) + displ * tsin(rdir));
      const tdir = MOD2(t[4], RES);
      const pts: XPoint[] = [];
      for (let k = 0; k < corners; k++) {
        const a = k === 0 ? tdir : MOD2(tdir + Math.trunc((k * RES) / corners), RES);
        pts.push(pt(WINSCALE(cx + toInt(size * tcos(a))), WINSCALE(cy + toInt(size * tsin(a)))));
      }
      pts.push(pts[0]);
      rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, pts, pts.length, X.CoordModeOrigin);
    }
  } else Bitmap_paint(G.drawPixmap, img, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), (G.loopsSlow + (x + x * y)) % 32);
}

export function Gui_paint_setup_item_concentrator(x: number, y: number): void {
  concentrator(x, y, GM.tris, 3, 'tris', BM_CONCENTRATOR);
}

export function Gui_paint_setup_asteroid_concentrator(x: number, y: number): void {
  concentrator(x, y, GM.sqrs, 4, 'sqrs', BM_ASTEROIDCONC);
}

export function Gui_paint_decor_dot(x: number, y: number, size: number): void {
  if (!GM.backgroundPointColor) return;
  Rectangle_add(GM.backgroundPointColor, XX(x + half) - (G.backgroundPointSize >> 1), YY(y + half) - (G.backgroundPointSize >> 1), size, size);
}

export function Gui_paint_setup_target(x: number, y: number, team: number, damage: number, own: boolean): void {
  let color = own ? BLUE : RED;
  if (BIT(G.Setup!.mode, TEAM_PLAY)) {
    const tc = Team_color(team);
    if (tc) color = tc;
  }
  SET_FG(G.colors[color].pixel);
  let a1 = XX(x), b1 = YY(y + BLOCK_SZ), a2 = a1 + BLOCK_SZ, b2 = b1 + BLOCK_SZ;
  Segment_add(color, a1, b1, a1, b2);
  Segment_add(color, a2, b1, a2, b2);
  Segment_add(color, a1, b1, a2, b1);
  Segment_add(color, a1, b2, a2, b2);
  rd.drawRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x + Math.trunc((BLOCK_SZ + 2) / 4))), WINSCALE(YY(y + Math.trunc((3 * BLOCK_SZ) / 4))),
    UWINSCALE(half), UWINSCALE(half));
  if (BIT(G.Setup!.mode, TEAM_PLAY)) {
    const s = String.fromCharCode(0x30 + team);
    const size = X.XTextWidth(G.gameFont, s, 1);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x + half)) - Math.trunc(size / 2), WINSCALE(YY(y + half)) + Math.trunc(G.gameFont.ascent / 2), s, 1);
  }
  if (damage !== TARGET_DAMAGE) {
    const size = toInt((damage * BLOCK_SZ) / (TARGET_DAMAGE * 2));
    a1 = x + size;
    a2 = y + size;
    b1 = x + (BLOCK_SZ - size);
    b2 = y + (BLOCK_SZ - size);
    Segment_add(RED, XX(a1), YY(a2), XX(b1), YY(b2));
    Segment_add(RED, XX(a1), YY(b2), XX(b1), YY(a2));
  }
}

export function Gui_paint_setup_treasure(x: number, y: number, team: number, own: boolean): void {
  let color = own ? BLUE : RED;
  if (BIT(G.Setup!.mode, TEAM_PLAY)) {
    const tc = Team_color(team);
    if (tc) color = tc;
  }
  if (!G.texturedObjects) {
    SET_FG(G.colors[color].pixel);
    Segment_add(color, XX(x), YY(y), XX(x), YY(y + half));
    Segment_add(color, XX(x + BLOCK_SZ), YY(y), XX(x + BLOCK_SZ), YY(y + half));
    Segment_add(color, XX(x), YY(y), XX(x + BLOCK_SZ), YY(y));
    Arc_add(color, XX(x), YY(y + BLOCK_SZ), BLOCK_SZ, BLOCK_SZ, 0, 64 * 180);
    if (BIT(G.Setup!.mode, TEAM_PLAY)) {
      const s = String.fromCharCode(0x30 + team);
      const size = X.XTextWidth(G.gameFont, s, 1);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x + half)) - Math.trunc(size / 2), WINSCALE(YY(y + 2 * BALL_RADIUS)), s, 1);
    }
  } else {
    Bitmap_paint(G.drawPixmap, own ? BM_HOLDER_FRIEND : BM_HOLDER_ENEMY, WINSCALE(XX(x)), WINSCALE(YY(y + BLOCK_SZ)), 0);
    if (BIT(G.Setup!.mode, TEAM_PLAY)) {
      SET_FG(G.colors[color].pixel);
      const s = String.fromCharCode(0x30 + team);
      const size = X.XTextWidth(G.gameFont, s, 1);
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x + half)) - Math.trunc(size / 2), WINSCALE(YY(y + BALL_RADIUS + 5)), s, 1);
    }
  }
}

export function Gui_paint_polygon(i: number, xoff: number, yoff: number): void {
  const polygon = G.polygons[i];
  const style = G.polygon_styles[polygon.style];
  if (BIT(style.flags, STYLE_INVISIBLE)) return;
  const textured = G.instruments.texturedWalls && G.fullColor;
  const filled = G.instruments.filledWorld;
  const S = G.Setup!;
  let x = xoff * S.width, y = yoff * S.height;
  const ship_x = WINSCALE(G.world.x), ship_y = WINSCALE(G.world.y + G.ext_view_height);
  const points: XPoint[] = new Array(polygon.num_points + 1);
  for (let j = 0; j < polygon.num_points; j++) {
    x += polygon.points[j].x;
    y += polygon.points[j].y;
    points[j] = pt(WINSCALE(x) - ship_x, ship_y - WINSCALE(y));
  }
  points[polygon.num_points] = points[0];
  let did_fill = 0;
  if ((filled || textured) && BIT(style.flags, STYLE_TEXTURED | STYLE_FILLED)) {
    let tiled = false;
    if (textured && BIT(style.flags, STYLE_TEXTURED)) {
      const bmp = Bitmap_get(G.drawPixmap, NUM_BITMAPS + style.texture, 0);
      if (bmp !== null) {
        X.XSetTile(G.dpy, G.gameGC, bmp.bitmap);
        X.XSetTSOrigin(G.dpy, G.gameGC, WINSCALE(polygon.bounds.x + xoff * S.width) - ship_x,
          ship_y - WINSCALE(polygon.bounds.y + polygon.bounds.h + yoff * S.height));
        X.XSetFillStyle(G.dpy, G.gameGC, X.FillTiled);
        tiled = true;
      }
    }
    if (!tiled) {
      X.XSetFillStyle(G.dpy, G.gameGC, X.FillSolid);
      SET_FG(G.fullColor ? style.color : G.colors[G.wallColor].pixel);
    }
    did_fill = 1;
    rd.fillPolygon(G.dpy, G.drawPixmap, G.gameGC, points, polygon.num_points, X.Nonconvex, X.CoordModeOrigin);
  }
  X.XSetFillStyle(G.dpy, G.gameGC, X.FillSolid);
  let sindex = style.def_edge_style;
  if (polygon.edge_styles === null) {
    let width = G.edge_styles[sindex].width;
    if (width !== -1 || !did_fill) {
      if (width === -1) width = 0;
      width = WINSCALE(width);
      if (width === 1) width = 0;
      X.XSetLineAttributes(G.dpy, G.gameGC, width >>> 0, G.edge_styles[sindex].style, X.CapButt, X.JoinMiter);
      SET_FG(G.fullColor ? G.edge_styles[sindex].color : G.colors[G.wallColor].pixel);
      rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points, polygon.num_points + 1, X.CoordModeOrigin);
    }
  } else {
    const es = polygon.edge_styles;
    for (let j = 0; j < polygon.num_points;) {
      const begin = j;
      sindex = es[j++];
      while (es[j] === sindex && j < polygon.num_points - 1) j++;
      let width = G.edge_styles[sindex].width;
      if (sindex !== 0 && (G.edge_styles[sindex].width !== -1 || !did_fill)) {
        if (width === -1) width = 0;
        width = WINSCALE(width);
        if (width === 1) width = 0;
        X.XSetLineAttributes(G.dpy, G.gameGC, width >>> 0, G.edge_styles[sindex].style, X.CapButt, X.JoinMiter);
        SET_FG(G.fullColor ? G.edge_styles[sindex].color : G.colors[G.wallColor].pixel);
        rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points.slice(begin), j + 1 - begin, X.CoordModeOrigin);
      }
    }
  }
  X.XSetLineAttributes(G.dpy, G.gameGC, 0, X.LineSolid, X.CapButt, X.JoinMiter);
}

export function Store_guimap_options(): void {
  const r = <K extends 'baseNameColor' | 'backgroundPointColor' | 'fuelColor' | 'visibilityBorderColor'>(k: K) => ref(GM, k);
  STORE_OPTIONS([
    COLOR_INDEX_OPTION('baseNameColor', 2, r('baseNameColor'), 'Which color number to use for drawing names of bases\n(unless drawn in one of the life colors).\n'),
    COLOR_INDEX_OPTION('backgroundPointColor', 2, r('backgroundPointColor'), 'Which color number to use for drawing background points.\n'),
    COLOR_INDEX_OPTION('fuelColor', 3, r('fuelColor'), 'Which color number to use for drawing fuel stations.\n'),
    COLOR_INDEX_OPTION('visibilityBorderColor', 2, r('visibilityBorderColor'), 'Which color number to use for drawing the visibility border.\n'),
  ]);
}
