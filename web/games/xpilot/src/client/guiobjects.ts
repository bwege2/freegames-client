// x11/guiobjects.c: drawing the moving objects: items, balls, mines, sparks, wreckage, asteroids,
// shots, missiles, lasers, paused and appearing markers, connectors, ships with names, shields and
// marking lights; the team and life colours.
import { G } from './G.ts';
import type { other_t } from './G.ts';
import {
  WHITE, BLUE, RED, BLOCK_SZ, BALL_RADIUS, SHIP_SZ, ITEM_SIZE, ITEM_TRIANGLE_SIZE, ITEM_PLAYFIELD, NUM_COLORS,
  NUM_ASTEROID_SHAPES, NUM_ASTEROID_POINTS, ASTEROID_SHAPES, NUM_WRECKAGE_POINTS, NUM_DASHES, NUM_CDASHES, DASHES_LENGTH,
  TEAM_PLAY, LIMITED_LIVES, MAX_NAME_LEN, RES,
  BM_ALL_ITEMS, BM_BALL, BM_BALL_GRAY, BM_MINE_OTHER, BM_MINE_TEAM, BM_BULLET, BM_BULLET_OWN, BM_PAUSED, BM_REFUEL,
  BM_SHIP_FRIEND, BM_SHIP_ENEMY, BM_SHIP_SELF,
} from './consts.ts';
import { BIT, MIN, f32, onReset, rint, s16, sprintf, toInt } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import type { GC, XPoint } from '../xlib/xlib.ts';
import { rd } from './record.ts';
import { SET_FG, Arc_add, Arc_add_rgb, Rectangle_add, Segment_add } from './paintdata.ts';
import { WINSCALE, UWINSCALE, SCALEX, SCALEY, X as XX, Y as YY, XF, YF } from './paint.ts';
import { Bitmap_paint, Bitmap_paint_blended } from './bitmaps.ts';
import { Homebase_by_id, Other_by_id, Ship_by_id } from './client.ts';
import { Default_ship, Ship_get_l_light_position, Ship_get_point_position, Ship_get_r_light_position, Rotate_position } from './shipshape.ts';
import type { position_t, shipshape_t } from './shipshape.ts';
import { tcos, tsin, rfrac } from './xpmath.ts';
import { COLOR_INDEX_OPTION, STORE_OPTIONS, ref } from './option.ts';
import { wreckageShapes } from './paintobjects.ts';

const texturedShips = false;

const GOdefaults = {
  ballColor: 0, connColor: 0, teamShotColor: 0, zeroLivesColor: 0, oneLifeColor: 0, twoLivesColor: 0, manyLivesColor: 0,
  selfLWColor: 0, enemyLWColor: 0, teamLWColor: 0, shipNameColor: 0, mineNameColor: 0, teamShipColor: 0,
  team0Color: 0, team1Color: 0, team2Color: 0, team3Color: 0, team4Color: 0, team5Color: 0, team6Color: 0, team7Color: 0,
  team8Color: 0, team9Color: 0,
};
type GOKey = keyof typeof GOdefaults;
const GO = { ...GOdefaults };
const ST = {
  mine_lastScaleFactor: 0, mine_points: Array.from({ length: 21 }, () => ({ x: 0, y: 0 }) as XPoint),
  pauseCharWidth: -1,
};
onReset(() => {
  Object.assign(GO, GOdefaults);
  ST.mine_lastScaleFactor = 0;
  ST.mine_points = Array.from({ length: 21 }, () => ({ x: 0, y: 0 }));
  ST.pauseCharWidth = -1;
});

/** asteroidShapes[shape][point][dir] */
export let asteroidShapes: position_t[][][] = [];

export function Init_asteroids(): number {
  asteroidShapes = [];
  for (let shp = 0; shp < NUM_ASTEROID_SHAPES; shp++) {
    const s: position_t[][] = [];
    for (let i = 0; i < NUM_ASTEROID_POINTS; i++) {
      const p = Array.from({ length: RES }, () => ({ x: 0, y: 0 }));
      p[0].x = ASTEROID_SHAPES[shp][i][0];
      p[0].y = ASTEROID_SHAPES[shp][i][1];
      Rotate_position(p);
      s.push(p);
    }
    asteroidShapes.push(s);
  }
  return 0;
}

const pt = (x: number, y: number): XPoint => ({ x: s16(x), y: s16(y) });

export function Gui_paint_item_symbol(type: number, d: number, mygc: GC, x: number, y: number, c: number): void {
  if (!G.texturedObjects) {
    G.gcv.stipple = G.itemBitmaps[type];
    G.gcv.fill_style = X.FillStippled;
    G.gcv.ts_x_origin = x;
    G.gcv.ts_y_origin = y;
    X.XChangeGC(G.dpy, mygc, X.GCStipple | X.GCFillStyle | X.GCTileStipXOrigin | X.GCTileStipYOrigin, G.gcv);
    rd.paintItemSymbol(type, d, mygc, x, y, c);
    X.XFillRectangle(G.dpy, d, mygc, x, y, ITEM_SIZE, ITEM_SIZE);
    G.gcv.fill_style = X.FillSolid;
    X.XChangeGC(G.dpy, mygc, X.GCFillStyle, G.gcv);
  } else Bitmap_paint(d, BM_ALL_ITEMS, x, y, type);
}

export function Gui_paint_item(type: number, d: number, mygc: GC, x: number, y: number): void {
  const SIZE = ITEM_TRIANGLE_SIZE;
  const points = [pt(x - SIZE, y - SIZE), pt(x, y + SIZE), pt(x + SIZE, y - SIZE)];
  points.push(points[0]);
  SET_FG(G.colors[BLUE].pixel);
  rd.drawLines(G.dpy, d, mygc, points, 4, X.CoordModeOrigin);
  SET_FG(G.colors[RED].pixel);
  Gui_paint_item_symbol(type, d, mygc, x - ITEM_SIZE / 2, y - SIZE + 2, ITEM_PLAYFIELD);
}

export function Gui_paint_item_object(type: number, x: number, y: number): void {
  Gui_paint_item(type, G.drawPixmap, G.gameGC, WINSCALE(XX(x)), WINSCALE(YY(y)));
}

export function Gui_paint_ball(x: number, y: number, style: number): void {
  let rgb = 0;
  x = XX(x);
  y = YY(y);
  if (style >= 0 && style < G.num_polygon_styles) rgb = G.polygon_styles[style].rgb;
  if (!G.texturedObjects) {
    if (rgb === 0) Arc_add(GO.ballColor, x - BALL_RADIUS, y - BALL_RADIUS, 2 * BALL_RADIUS, 2 * BALL_RADIUS, 0, 64 * 360);
    else Arc_add_rgb(rgb, GO.ballColor, x - BALL_RADIUS, y - BALL_RADIUS, 2 * BALL_RADIUS, 2 * BALL_RADIUS, 0, 64 * 360);
  } else if (style === 0xff) Bitmap_paint(G.drawPixmap, BM_BALL, WINSCALE(x - BALL_RADIUS), WINSCALE(y - BALL_RADIUS), 0);
  else Bitmap_paint_blended(G.drawPixmap, BM_BALL_GRAY, WINSCALE(x - BALL_RADIUS), WINSCALE(y - BALL_RADIUS), rgb);
}

export function Gui_paint_ball_connector(x_1: number, y_1: number, x_2: number, y_2: number): void {
  Segment_add(GO.connColor, XX(x_1), YY(y_1), XX(x_2), YY(y_2));
}

function Gui_paint_mine_name(x: number, y: number, name: string | null): void {
  if (!name || !GO.mineNameColor) return;
  SET_FG(G.colors[GO.mineNameColor].pixel);
  const name_len = name.length;
  const name_width = X.XTextWidth(G.gameFont, name, name_len);
  rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x) - Math.trunc(name_width / 2), WINSCALE(y + 4) + G.gameFont.ascent + 1, name, name_len);
}

const world_mine_points = [
  [0, 0], [1, 0], [0, -1], [4, 0], [0, -1], [6, 0], [0, 1], [4, 0], [0, 1], [1, 0], [0, 2], [-1, 0], [0, 1], [-4, 0], [0, 1],
  [-6, 0], [0, -1], [-4, 0], [0, -1], [-1, 0], [0, -2],
];

export function Gui_paint_mine(x: number, y: number, teammine: number, name: string | null): void {
  if (!G.texturedObjects) {
    const mp = ST.mine_points;
    if (ST.mine_lastScaleFactor !== G.clData.scaleFactor) {
      ST.mine_lastScaleFactor = G.clData.scaleFactor;
      for (let i = 1; i < 21; ++i) mp[i] = pt(WINSCALE(world_mine_points[i][0]), WINSCALE(world_mine_points[i][1]));
    }
    x = XX(x);
    y = YY(y);
    mp[0] = pt(WINSCALE(x - 8), WINSCALE(y - 1));
    if (teammine === 0) {
      SET_FG(G.colors[BLUE].pixel);
      rd.fillRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x - 7), WINSCALE(y - 2), UWINSCALE(15), UWINSCALE(5));
    }
    SET_FG(G.colors[WHITE].pixel);
    rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, mp, 21, X.CoordModePrevious);
    if (name) Gui_paint_mine_name(x, y, name);
  } else {
    x = XX(x);
    y = YY(y);
    if (teammine === 0) {
      SET_FG(G.colors[BLUE].pixel);
      Bitmap_paint(G.drawPixmap, BM_MINE_OTHER, WINSCALE(x - 10), WINSCALE(y - 7), 0);
    } else {
      SET_FG(G.colors[WHITE].pixel);
      Bitmap_paint(G.drawPixmap, BM_MINE_TEAM, WINSCALE(x - 10), WINSCALE(y - 7), 0);
    }
    if (name) Gui_paint_mine_name(x, y, name);
  }
}

export function Gui_paint_spark(color: number, x: number, y: number): void {
  color = G.spark_color[color];
  Rectangle_add(color, x - Math.trunc(G.sparkSize / 2), y - Math.trunc(G.sparkSize / 2), G.sparkSize, G.sparkSize);
}

export function Gui_paint_wreck(x: number, y: number, deadly: boolean, wtype: number, rot: number, size: number): void {
  const points: XPoint[] = [];
  let cnt;
  for (cnt = 0; cnt < NUM_WRECKAGE_POINTS; cnt++) {
    const p = wreckageShapes[wtype][cnt][rot];
    const tx = Math.trunc(f32(p.x * size)) >> 8;
    const ty = Math.trunc(f32(p.y * size)) >> 8;
    points[cnt] = pt(WINSCALE(XX(x + tx)), WINSCALE(YY(y + ty)));
  }
  points[cnt++] = points[0];
  const color = deadly ? WHITE : RED;
  SET_FG(G.colors[color].pixel);
  rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points, cnt, 0);
}

export function Gui_paint_asteroids_begin(): void { /* nothing */ }
export function Gui_paint_asteroids_end(): void { /* nothing */ }

export function Gui_paint_asteroid(x: number, y: number, type: number, rot: number, size: number): void {
  const points: XPoint[] = [];
  let cnt;
  type = type % NUM_ASTEROID_SHAPES;
  for (cnt = 0; cnt < NUM_ASTEROID_POINTS; cnt++) {
    const p = asteroidShapes[type][cnt][rot];
    const tx = Math.trunc(f32(p.x * size) * 1.4);
    const ty = Math.trunc(f32(p.y * size) * 1.4);
    points[cnt] = pt(WINSCALE(XX(x + tx)), WINSCALE(YY(y + ty)));
  }
  points[cnt++] = points[0];
  SET_FG(G.colors[WHITE].pixel);
  rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points, cnt, 0);
}

function Gui_paint_nastyshot(color: number, x: number, y: number, size: number): void {
  const z = size;
  if (rfrac() < 0.5) {
    Segment_add(color, x - z, y - z, x + z, y + z);
    Segment_add(color, x + z, y - z, x - z, y + z);
  } else {
    Segment_add(color, x - z, y, x + z, y);
    Segment_add(color, x, y - z, x, y + z);
  }
}

export function Gui_paint_fastshot(color: number, x: number, y: number): void {
  if (color === 0) return;
  if (!G.texturedObjects) {
    const z = Math.trunc(G.shotSize / 2);
    if (G.instruments.showNastyShots) Gui_paint_nastyshot(color, x, y, z);
    else if (G.shotSize > 2) {
      SET_FG(G.colors[color].pixel);
      rd.fillArc(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x - z), WINSCALE(y - z), UWINSCALE(G.shotSize), UWINSCALE(G.shotSize), 0, 64 * 360);
    } else Rectangle_add(color, x - z, y - z, G.shotSize, G.shotSize);
  } else {
    const s_size = MIN(G.shotSize, 16);
    const z = Math.trunc(s_size / 2);
    Bitmap_paint(G.drawPixmap, BM_BULLET, WINSCALE(x) - z, WINSCALE(y) - z, s_size - 1);
  }
}

export function Gui_paint_teamshot(x: number, y: number): void {
  const color = GO.teamShotColor;
  if (color === 0) return;
  if (!G.texturedObjects) {
    const z = Math.trunc(G.teamShotSize / 2);
    if (G.instruments.showNastyShots) Gui_paint_nastyshot(color, x, y, z);
    else if (G.teamShotSize > 2) {
      SET_FG(G.colors[color].pixel);
      rd.fillArc(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x - z), WINSCALE(y - z), UWINSCALE(G.teamShotSize), UWINSCALE(G.teamShotSize), 0, 64 * 360);
    } else Rectangle_add(color, x - z, y - z, G.teamShotSize, G.teamShotSize);
  } else {
    const s_size = MIN(G.teamShotSize, 16);
    const z = Math.trunc(s_size / 2);
    Bitmap_paint(G.drawPixmap, BM_BULLET_OWN, WINSCALE(x) - z, WINSCALE(y) - z, s_size - 1);
  }
}

export function Gui_paint_missiles_begin(): void {
  SET_FG(G.colors[WHITE].pixel);
  X.XSetLineAttributes(G.dpy, G.gameGC, 4, X.LineSolid, X.CapButt, X.JoinMiter);
}

export function Gui_paint_missiles_end(): void {
  X.XSetLineAttributes(G.dpy, G.gameGC, 0, X.LineSolid, X.CapButt, X.JoinMiter);
}

export function Gui_paint_missile(x: number, y: number, len: number, dir: number): void {
  const x_1 = XX(x), y_1 = YY(y);
  const x_2 = toInt(x_1 - tcos(dir) * len);
  const y_2 = toInt(y_1 + tsin(dir) * len);
  rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x_1), WINSCALE(y_1), WINSCALE(x_2), WINSCALE(y_2));
}

export function Gui_paint_lasers_begin(): void {
  X.XSetLineAttributes(G.dpy, G.gameGC, 3, X.LineSolid, X.CapButt, X.JoinMiter);
}

export function Gui_paint_lasers_end(): void {
  X.XSetLineAttributes(G.dpy, G.gameGC, 0, X.LineSolid, X.CapButt, X.JoinMiter);
}

export function Gui_paint_laser(color: number, x_1: number, y_1: number, len: number, dir: number): void {
  const x_2 = toInt(x_1 + len * tcos(dir));
  const y_2 = toInt(y_1 + len * tsin(dir));
  if ((color >>> 0) >= NUM_COLORS) color = WHITE;
  SET_FG(G.colors[color].pixel);
  rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x_1)), WINSCALE(YY(y_1)), WINSCALE(XX(x_2)), WINSCALE(YY(y_2)));
}

export function Gui_paint_paused(x: number, y: number, count: number): void {
  if (!G.texturedObjects) {
    const half_pause_size = Math.trunc((3 * BLOCK_SZ) / 7);
    if (ST.pauseCharWidth < 0) ST.pauseCharWidth = X.XTextWidth(G.gameFont, 'P', 1);
    SET_FG(G.colors[BLUE].pixel);
    const x_0 = XX(x - half_pause_size);
    const y_0 = YY(y + half_pause_size);
    rd.fillRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x_0), WINSCALE(y_0), UWINSCALE(2 * half_pause_size + 1), UWINSCALE(2 * half_pause_size + 1));
    if (count <= 0 || G.loopsSlow % 10 >= 5) {
      SET_FG(G.colors[WHITE].pixel);
      rd.drawRectangle(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(x_0 - 1), WINSCALE(y_0 - 1), UWINSCALE(2 * (half_pause_size + 1)), UWINSCALE(2 * (half_pause_size + 1)));
      rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x)) - Math.trunc(ST.pauseCharWidth / 2), WINSCALE(YY(y - 1)) + Math.trunc(G.gameFont.ascent / 2), 'P', 1);
    }
  } else {
    Bitmap_paint(G.drawPixmap, BM_PAUSED, WINSCALE(XX(x - Math.trunc(BLOCK_SZ / 2))), WINSCALE(YY(y + Math.trunc(BLOCK_SZ / 2))),
      count <= 0 || G.loopsSlow % 10 >= 5 ? 1 : 0);
  }
}

export function Gui_paint_appearing(x: number, y: number, id: number, count: number): void {
  const hsize = Math.trunc((3 * BLOCK_SZ) / 7);
  const other = Other_by_id(id);
  let color = other ? Life_color(other) : 0;
  if (!color) color = WHITE;
  if (G.version >= 0x4f12) {
    const base = Homebase_by_id(id);
    if (base !== null) base.appeartime = Math.trunc(G.loops + (count * G.clientFPS) / 120);
  }
  SET_FG(G.colors[color].pixel);
  rd.fillRectangle(G.dpy, G.drawPixmap, G.gameGC, SCALEX(x - hsize), SCALEY(y - hsize + Math.trunc((count / 180) * hsize + 1)),
    UWINSCALE(2 * hsize + 1), UWINSCALE(Math.trunc((count / 180) * hsize + 1) >>> 0));
}

export function Gui_paint_ecm(x: number, y: number, size: number): void {
  Arc_add(WHITE, XX(x - Math.trunc(size / 2)), YY(y + Math.trunc(size / 2)), size, size, 0, 64 * 360);
}

export function Gui_paint_refuel(x_0: number, y_0: number, x_1: number, y_1: number): void {
  if (!G.texturedObjects) {
    rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x_0)), WINSCALE(YY(y_0)), WINSCALE(XX(x_1)), WINSCALE(YY(y_1)));
  } else {
    const size = WINSCALE(8);
    const fuel = [1, 2, 3, 3, 2, 1, 0, 1, 2, 3, 2, 1, 2, 3, 3, 2];
    x_0 = WINSCALE(XX(x_0));
    y_0 = WINSCALE(YY(y_0));
    x_1 = WINSCALE(XX(x_1));
    y_1 = WINSCALE(YY(y_1));
    const dx = (x_1 - x_0) / 16, dy = (y_1 - y_0) / 16;
    for (let i = 0; i < 16; i++) {
      Bitmap_paint(G.drawPixmap, BM_REFUEL, toInt(x_0 + dx * i - Math.trunc(size / 2)), toInt(y_0 + dy * i - Math.trunc(size / 2)), fuel[(G.loops + 16 - i) % 16]);
    }
  }
}

export function Gui_paint_connector(x_0: number, y_0: number, x_1: number, y_1: number, tractor: number): void {
  if (tractor) rd.setDashes(G.dpy, G.gameGC, 0, G.cdashes, NUM_CDASHES);
  else rd.setDashes(G.dpy, G.gameGC, 0, G.dashes, NUM_DASHES);
  rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x_0)), WINSCALE(YY(y_0)), WINSCALE(XX(x_1)), WINSCALE(YY(y_1)));
  if (tractor) rd.setDashes(G.dpy, G.gameGC, 0, G.dashes, NUM_DASHES);
}

export function Gui_paint_transporter(x_0: number, y_0: number, x_1: number, y_1: number): void {
  rd.drawLine(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x_0)), WINSCALE(YY(y_0)), WINSCALE(XX(x_1)), WINSCALE(YY(y_1)));
}

export function Gui_paint_all_connectors_begin(): void {
  SET_FG(G.colors[GO.connColor].pixel);
  if (G.gcv.line_style !== X.LineOnOffDash) {
    G.gcv.line_style = X.LineOnOffDash;
    X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle | X.GCDashOffset, G.gcv);
  }
}

export function Gui_paint_ships_begin(): void {
  G.gcv.dash_offset = WINSCALE(DASHES_LENGTH - (G.loops % DASHES_LENGTH));
}

export function Gui_paint_ships_end(): void {
  if (G.gcv.line_style !== X.LineSolid) {
    G.gcv.line_style = X.LineSolid;
    X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle, G.gcv);
  }
  G.gcv.dash_offset = 0;
}

function Gui_paint_rounddelay(x: number, y: number): void {
  const s = sprintf('%d', Math.trunc(G.roundDelay / G.Setup!.frames_per_second));
  const t = s.length;
  SET_FG(G.colors[WHITE].pixel);
  const text_width = X.XTextWidth(G.gameFont, s, t);
  rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x)) - Math.trunc(text_width / 2), WINSCALE(YY(y)) + Math.trunc(G.gameFont.ascent / 2), s, t);
}

/** xpaint.h Check_name_string: the name as drawn, cut to maxCharsInNames, and its width */
export function Check_name_string(other: other_t | null): void {
  if (other && other.max_chars_in_names !== G.maxCharsInNames) {
    other.id_string = other.nick_name.slice(0, 79);
    const len = other.id_string.length;
    if (G.maxCharsInNames >= 0 && G.maxCharsInNames < len) other.id_string = other.id_string.slice(0, G.maxCharsInNames);
    other.name_len = other.id_string.length;
    other.name_width = 2 + X.XTextWidth(G.gameFont, other.id_string, other.name_len);
    other.max_chars_in_names = G.maxCharsInNames;
  }
}

function Gui_paint_ship_name(x: number, y: number, other: other_t): void {
  Check_name_string(other);
  if (GO.shipNameColor) {
    let color = Life_color(other);
    if (!color) color = GO.shipNameColor;
    SET_FG(G.colors[color].pixel);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x)) - Math.trunc(other.name_width / 2), WINSCALE(YY(y) + 16) + G.gameFont.ascent,
      other.id_string, other.name_len);
  } else SET_FG(G.colors[BLUE].pixel);
  if (G.instruments.showLivesByShip && BIT(G.Setup!.mode, LIMITED_LIVES)) {
    const keff = sprintf('%03d', other.life);
    rd.drawString(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x) + SHIP_SZ), WINSCALE(YY(y) - SHIP_SZ) + G.gameFont.ascent, keff.slice(2, 3), 1);
  }
}

function Gui_is_my_tank(other: other_t | null): boolean {
  const self = G.self;
  if (self === null || other === null || other.mychar !== 0x54 || (BIT(G.Setup!.mode, TEAM_PLAY) && self.team !== other.team)) return false;
  let tank_name = self.nick_name.slice(0, MAX_NAME_LEN - 1);
  if (self.nick_name.length < MAX_NAME_LEN) tank_name = (tank_name + "'s tank").slice(0, MAX_NAME_LEN - 1);
  return tank_name === other.nick_name;
}

function Gui_calculate_ship_color(id: number, other: other_t | null): number {
  let ship_color = WHITE;
  const S = G.Setup!;
  if (BIT(S.mode, TEAM_PLAY) && G.eyesId !== id && other !== null && G.eyeTeam === other.team) {
    if (BIT(S.mode, LIMITED_LIVES) && other.life === 0) ship_color = GO.teamLWColor;
    else ship_color = GO.teamShipColor;
  }
  const eyes = G.eyes;
  if (eyes !== null && G.eyesId !== id && other !== null && eyes.alliance !== 0x20 && eyes.alliance === other.alliance) {
    if (BIT(S.mode, LIMITED_LIVES) && other.life === 0) ship_color = GO.teamLWColor;
    else ship_color = GO.teamShipColor;
  }
  if (Gui_is_my_tank(other)) ship_color = BLUE;
  if (G.roundDelay > 0 && ship_color === WHITE) ship_color = RED;
  if (other && BIT(S.mode, TEAM_PLAY)) {
    const team_color = Team_color(other.team);
    if (team_color) return team_color;
  }
  if (BIT(S.mode, LIMITED_LIVES)) {
    if (eyes !== null && eyes.id === id && eyes.life === 0) ship_color = GO.selfLWColor;
    if (eyes !== null && eyes.id !== id && other !== null && G.eyeTeam !== other.team && other.life === 0) ship_color = GO.enemyLWColor;
  }
  return ship_color;
}

function Gui_paint_marking_lights(id: number, x: number, y: number, ship: shipshape_t, dir: number): void {
  if (((G.loopsSlow + id) & 0xf) === 0) {
    for (let lcnt = 0; lcnt < ship.num_l_light; lcnt++) {
      const l = Ship_get_l_light_position(ship, lcnt, dir);
      const lx = f32(x + l.x), ly = f32(y + l.y);
      Rectangle_add(RED, XF(lx) - 2, YF(ly) - 2, 6, 6);
      Segment_add(RED, XF(lx) - 8, YF(ly), XF(lx) + 8, YF(ly));
      Segment_add(RED, XF(lx), YF(ly) - 8, XF(lx), YF(ly) + 8);
    }
  } else if (((G.loopsSlow + id) & 0xf) === 2) {
    for (let lcnt = 0; lcnt < ship.num_r_light; lcnt++) {
      const rightLightColor = G.maxColors > 4 ? 4 : BLUE;
      const r = Ship_get_r_light_position(ship, lcnt, dir);
      const rx = f32(x + r.x), ry = f32(y + r.y);
      Rectangle_add(rightLightColor, XF(rx) - 2, YF(ry) - 2, 6, 6);
      Segment_add(rightLightColor, XF(rx) - 8, YF(ry), XF(rx) + 8, YF(ry));
      Segment_add(rightLightColor, XF(rx), YF(ry) - 8, XF(rx), YF(ry) + 8);
    }
  }
}

function Gui_paint_shields_deflectors(x: number, y: number, radius: number, shield: number, deflector: number, eshield: number, ship_color: number): void {
  const e_radius = radius + 4;
  const half_radius = radius >> 1;
  const half_e_radius = e_radius >> 1;
  let scolor = -1, ecolor = -1;
  if (shield) scolor = ship_color;
  if (deflector) ecolor = G.loopsSlow & 0x02 ? RED : BLUE;
  if (eshield && shield) {
    if (ecolor !== -1) {
      scolor = ecolor;
      ecolor = ship_color;
    } else scolor = ecolor = ship_color;
  }
  if (ecolor !== -1) {
    SET_FG(G.colors[ecolor].pixel);
    rd.drawArc(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x - half_e_radius)), WINSCALE(YY(y + half_e_radius)),
      WINSCALE(e_radius) >>> 0, WINSCALE(e_radius) >>> 0, 0, 64 * 360);
  }
  if (scolor !== -1) {
    SET_FG(G.colors[scolor].pixel);
    rd.drawArc(G.dpy, G.drawPixmap, G.gameGC, WINSCALE(XX(x - half_radius)), WINSCALE(YY(y + half_radius)),
      WINSCALE(radius) >>> 0, WINSCALE(radius) >>> 0, 0, 64 * 360);
  }
}

function Gui_paint_ship_cloaked(ship_color: number, points: XPoint[], point_count: number): void {
  Set_drawstyle_dashed(ship_color);
  rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points, point_count, 0);
}

function generic_paint_ship(x: number, y: number, ang: number, ship: number): void {
  Bitmap_paint(G.drawPixmap, ship, WINSCALE(XX(x) - 16), WINSCALE(YY(y) - 16), ang);
}

function Gui_paint_ship_uncloaked(id: number, points: XPoint[], ship_color: number, point_count: number): void {
  if (G.gcv.line_style !== X.LineSolid) {
    G.gcv.line_style = X.LineSolid;
    X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle, G.gcv);
  }
  SET_FG(G.colors[ship_color].pixel);
  rd.drawLines(G.dpy, G.drawPixmap, G.gameGC, points, point_count, 0);
  if (G.lock_id === id && id !== -1 && G.lock_dist !== 0) rd.fillPolygon(G.dpy, G.drawPixmap, G.gameGC, points, point_count, X.Complex, X.CoordModeOrigin);
}

function Set_drawstyle_dashed(ship_color: number): void {
  if (G.gcv.line_style !== X.LineOnOffDash) {
    G.gcv.line_style = X.LineOnOffDash;
    X.XChangeGC(G.dpy, G.gameGC, X.GCLineStyle | X.GCDashOffset, G.gcv);
  }
  SET_FG(G.colors[ship_color].pixel);
}

function set_shipshape(world_x: number, world_y: number, dir: number, ship: shipshape_t, points: XPoint[]): number {
  let cnt;
  for (cnt = 0; cnt < ship.num_points; cnt++) {
    const p = Ship_get_point_position(ship, cnt, dir);
    const x = f32(world_x - G.world.x + p.x) / G.clData.scaleFactor;
    const y = f32(G.world.y + G.ext_view_height - world_y - p.y) / G.clData.scaleFactor;
    points[cnt] = pt(rint(x), rint(y));
  }
  points[cnt++] = points[0];
  return cnt;
}

export function Gui_paint_ship(x: number, y: number, dir: number, id: number, cloak: number, phased: number, shield: number, deflector: number, eshield: number): void {
  const ship = Ship_by_id(id);
  const other = Other_by_id(id);
  const points: XPoint[] = [];
  let cnt;
  const self = G.self;
  if (!G.instruments.showShipShapes && self !== null && self.id !== id) cnt = set_shipshape(x, y, dir, Default_ship(), points);
  else if (!G.instruments.showMyShipShape && self !== null && self.id === id) cnt = set_shipshape(x, y, dir, Default_ship(), points);
  else cnt = set_shipshape(x, y, dir, ship, points);
  if (self !== null && self.id !== id && other !== null) Gui_paint_ship_name(x, y, other);
  const fps = G.Setup!.frames_per_second;
  if (G.roundDelay > 0 && G.roundDelay % fps < Math.trunc(fps / 2)) {
    Gui_paint_rounddelay(x, y);
    return;
  }
  const ship_color = Gui_calculate_ship_color(id, other);
  if (!ship_color) return;
  if (cloak === 0 && phased === 0) {
    if (!G.texturedObjects || !texturedShips) {
      Gui_paint_ship_uncloaked(id, points, ship_color, cnt);
      if (G.instruments.showShipShapesHack) {
        Segment_add(ship_color, XX(x + SHIP_SZ * tcos(dir)), YY(y + SHIP_SZ * tsin(dir)), XX(x + (SHIP_SZ + 12) * tcos(dir)), YY(y + (SHIP_SZ + 12) * tsin(dir)));
        Arc_add(ship_color, XX(x - SHIP_SZ), YY(y + SHIP_SZ), 2 * SHIP_SZ, 2 * SHIP_SZ, 0, 64 * 360);
      }
    } else {
      let ship_shape;
      if (ship_color === BLUE) ship_shape = BM_SHIP_FRIEND;
      else if (self !== null && self.id !== id) ship_shape = BM_SHIP_ENEMY;
      else ship_shape = BM_SHIP_SELF;
      generic_paint_ship(x, y, dir, ship_shape);
    }
  }
  if (phased) Gui_paint_ship_cloaked(ship_color, points, cnt);
  else if (cloak) Gui_paint_ship_cloaked(ship_color, points, cnt);
  if (G.markingLights) Gui_paint_marking_lights(id, x, y, ship, dir);
  if (shield || deflector) {
    Set_drawstyle_dashed(ship_color);
    Gui_paint_shields_deflectors(x, y, ship.shield_radius, shield, deflector, eshield, ship_color);
  }
}

export function Team_color(team: number): number {
  if (team >= 0 && team <= 9) return GO[`team${team}Color` as GOKey];
  return 0;
}

export function Life_color(other: other_t | null): number {
  let color = 0;
  if (other && (other.mychar === 0x20 || other.mychar === 0x52) && BIT(G.Setup!.mode, LIMITED_LIVES)) color = Life_color_by_life(other.life);
  return color;
}

export function Life_color_by_life(life: number): number {
  if (life > 2) return GO.manyLivesColor;
  if (life === 2) return GO.twoLivesColor;
  if (life === 1) return GO.oneLifeColor;
  return GO.zeroLivesColor;
}

export function Store_guiobject_options(): void {
  const o = (name: GOKey, def: number, help: string) => COLOR_INDEX_OPTION(name, def, ref(GO, name), help);
  const lives = 'This can be used to paint for example ship and base names.\n';
  STORE_OPTIONS([
    o('teamShotColor', 2, 'Which color number to use for drawing harmless shots.\n'),
    o('ballColor', 1, 'Which color number to use for drawing balls.\n'),
    o('connColor', 2, 'Which color number to use for drawing connectors.\n'),
    o('zeroLivesColor', 5, 'Which color to associate with ships with zero lives left.\n' + lives),
    o('oneLifeColor', 11, 'Which color to associate with ships with one life left.\n' + lives),
    o('twoLivesColor', 4, 'Which color to associate with ships with two lives left.\n' + lives),
    o('manyLivesColor', 0, 'Which color to associate with ships with more than two lives left.\n' + lives),
    o('selfLWColor', 3, 'Which color to use to paint your ship in when on last life.\nOriginal color for this is red.\n'),
    o('enemyLWColor', 3, 'Which color to use to paint enemy ships in when on last life.\nOriginal color for this is red.\n'),
    o('teamLWColor', 2, 'Which color to use to paint teammate ships in when on last life.\nOriginal color for this is green.\n'),
    o('shipNameColor', 2, 'Which color number to use for drawing names of ships\n(unless drawn in one of the life colors).\n'),
    o('mineNameColor', 2, 'Which color number to use for drawing names of mines.\n'),
    o('teamShipColor', 2, 'Which color number to use for drawing your teammates.\n'),
    ...Array.from({ length: 10 }, (_, i) => o(`team${i}Color` as GOKey, 0, `Which color number to use for drawing team ${i} objects.\n`)),
  ]);
}
