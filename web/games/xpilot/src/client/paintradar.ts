// x11/paintradar.c: the radar window: the static map (polygons) drawn once into radarPixmap2, and per
// frame the checkpoint diamond, the own ship's direction line and the radar dots. The block map radar
// of old servers is not ported (README.md).
import { G } from './G.ts';
import { BLACK, WHITE, BLUE, RED, BLOCK_SZ, DSIZE, TIMING, WRAP_PLAY, RadarFriend, STYLE_INVISIBLE_RADAR } from './consts.ts';
import { BIT, onReset, s16, toInt } from './cutil.ts';
import * as X from '../xlib/xlib.ts';
import type { XPoint } from '../xlib/xlib.ts';
import { Check_pos_by_index } from './client.ts';
import { tcos, tsin } from './xpmath.ts';
import { COLOR_INDEX_OPTION_WITH_SETFUNC, STORE_OPTIONS, ref } from './option.ts';

const R = { slidingradar_x: 0, slidingradar_y: 0, wallRadarColor: 0, targetRadarColor: 0, decorRadarColor: 0 };
onReset(() => Object.assign(R, { slidingradar_x: 0, slidingradar_y: 0, wallRadarColor: 0, targetRadarColor: 0, decorRadarColor: 0 }));

function Copy_static_radar(): void {
  if (G.radarPixmap2 !== G.radarPixmap) {
    X.XCopyArea(G.dpy, G.radarPixmap2, G.radarPixmap, G.gameGC, 0, 0, 256, G.RadarHeight, 0, 0);
  } else {
    X.XSetForeground(G.dpy, G.radarGC, G.colors[BLACK].pixel);
    X.XFillRectangle(G.dpy, G.radarPixmap, G.radarGC, 0, 0, 256, G.RadarHeight);
  }
  X.XSetForeground(G.dpy, G.radarGC, G.colors[WHITE].pixel);
}

function Paint_checkpoint_radar(xf: number, yf: number): void {
  if (BIT(G.Setup!.mode, TIMING)) {
    let x, y;
    if (G.oldServer) {
      const [cx, cy] = Check_pos_by_index(G.nextCheckPoint);
      x = toInt(cx * BLOCK_SZ * xf + 0.5) - R.slidingradar_x;
      y = G.RadarHeight - toInt(cy * BLOCK_SZ * yf + 0.5) + DSIZE - 1 - R.slidingradar_y;
    } else {
      const b = G.checks[G.nextCheckPoint].bounds;
      x = toInt(b.x * xf + 0.5) - R.slidingradar_x;
      y = G.RadarHeight - toInt(b.y * yf + 0.5) + DSIZE - 1 - R.slidingradar_y;
    }
    if (x <= 0) x += 256;
    if (y <= 0) y += G.RadarHeight;
    const points: XPoint[] = [
      { x: s16(x), y: s16(y) }, { x: s16(x + DSIZE), y: s16(y - DSIZE) }, { x: s16(x), y: s16(y - 2 * DSIZE) },
      { x: s16(x - DSIZE), y: s16(y - DSIZE) }, { x: s16(x), y: s16(y) },
    ];
    X.XDrawLines(G.dpy, G.radarPixmap, G.radarGC, points, 5, 0);
  }
}

function Paint_self_radar(xf: number, yf: number): void {
  if (G.selfVisible !== 0 && G.loops % 16 < 13) {
    let x = toInt(G.selfPos.x * xf + 0.5) - R.slidingradar_x;
    let y = G.RadarHeight - toInt(G.selfPos.y * yf + 0.5) - 1 - R.slidingradar_y;
    if (x <= 0) x += 256;
    if (y <= 0) y += G.RadarHeight;
    const x_1 = toInt(x + 8 * tcos(G.heading));
    const y_1 = toInt(y - 8 * tsin(G.heading));
    X.XDrawLine(G.dpy, G.radarPixmap, G.radarGC, x, y, x_1, y_1);
    if (BIT(G.Setup!.mode, WRAP_PLAY)) {
      const xw = x_1 - ((x_1 + 256) % 256);
      const yw = y_1 - ((y_1 + G.RadarHeight) % G.RadarHeight);
      if (xw !== 0) X.XDrawLine(G.dpy, G.radarPixmap, G.radarGC, x - xw, y, x_1 - xw, y_1);
      if (yw !== 0) {
        X.XDrawLine(G.dpy, G.radarPixmap, G.radarGC, x, y - yw, x_1, y_1 - yw);
        if (xw !== 0) X.XDrawLine(G.dpy, G.radarPixmap, G.radarGC, x - xw, y - yw, x_1 - xw, y_1 - yw);
      }
    }
  }
}

function Paint_objects_radar(): void {
  for (let i = 0; i < G.num_radar; i++) {
    const r = G.radar_ptr[i];
    const rs = r.size;
    const s = rs <= 0 ? 1 : r.size;
    let color = WHITE;
    if (r.type === RadarFriend) {
      if (G.maxColors > 4) color = 4;
      else if (!G.colorSwitch) color = RED;
    }
    X.XSetForeground(G.dpy, G.radarGC, G.colors[color].pixel);
    let x = r.x - Math.trunc(s / 2) - R.slidingradar_x;
    let y = G.RadarHeight - r.y - 1 - Math.trunc(s / 2) - R.slidingradar_y;
    if (x <= 0) x += 256;
    if (y <= 0) y += G.RadarHeight;
    X.XFillRectangle(G.dpy, G.radarPixmap, G.radarGC, x, y, s, s);
    if (BIT(G.Setup!.mode, WRAP_PLAY)) {
      const xw = x < 0 ? -256 : x + s >= 256 ? 256 : 0;
      const yw = y < 0 ? -G.RadarHeight : y + s >= G.RadarHeight ? G.RadarHeight : 0;
      if (xw !== 0) X.XFillRectangle(G.dpy, G.radarPixmap, G.radarGC, x - xw, y, s, s);
      if (yw !== 0) {
        X.XFillRectangle(G.dpy, G.radarPixmap, G.radarGC, x, y - yw, s, s);
        if (xw !== 0) X.XFillRectangle(G.dpy, G.radarPixmap, G.radarGC, x - xw, y - yw, s, s);
      }
    }
  }
  if (G.num_radar) G.num_radar = 0;
}

export function Paint_radar(): void {
  const S = G.Setup!;
  const xf = 256.0 / S.width, yf = G.RadarHeight / S.height;
  if (G.radar_exposures === 0) return;
  R.slidingradar_x = 0;
  R.slidingradar_y = 0;
  Copy_static_radar();
  Paint_checkpoint_radar(xf, yf);
  Paint_self_radar(xf, yf);
  Paint_objects_radar();
}

export function Paint_sliding_radar(): void {
  if (!G.Setup) return;
  if (BIT(G.Setup.mode, WRAP_PLAY) === 0) return;
  if (G.radarPixmap !== G.radarPixmap2) return;
  if (G.instruments.slidingRadar) {
    if (G.radarPixmap2 !== G.radarWindow) return;
    G.radarPixmap2 = X.XCreatePixmap(G.dpy, G.radarWindow, 256, G.RadarHeight, G.dispDepth);
    G.radarPixmap = G.radarPixmap2;
    if (G.radar_exposures > 0) Paint_world_radar();
  } else {
    if (G.radarPixmap2 === G.radarWindow) return;
    X.XFreePixmap(G.dpy, G.radarPixmap2);
    G.radarPixmap2 = G.radarWindow;
    G.radarPixmap = G.radarWindow;
    if (G.radar_exposures > 0) Paint_world_radar();
  }
}

function Paint_radar_block(xi: number, yi: number, color: number): void {
  const S = G.Setup!;
  if (G.radarPixmap2 === G.radarPixmap) X.XSetPlaneMask(G.dpy, G.radarGC, (X.AllPlanes & ~(G.dpl_1[0] | G.dpl_1[1])) >>> 0);
  X.XSetForeground(G.dpy, G.radarGC, G.colors[color].pixel);
  if (S.x >= 256) {
    const xs = (256 - 1) / (S.x - 1);
    const ys = (G.RadarHeight - 1) / (S.y - 1);
    const xp = toInt(xi * xs + 0.5);
    const yp = G.RadarHeight - 1 - toInt(yi * ys + 0.5);
    X.XDrawPoint(G.dpy, G.radarPixmap2, G.radarGC, xp, yp);
  } else {
    const xs = (S.x - 1) / (256 - 1);
    const ys = (S.y - 1) / (G.RadarHeight - 1);
    const xp = toInt((xi - 0.5) / xs) + 1;
    let xw = toInt((xi + 0.5) / xs);
    let yw = toInt((yi - 0.5) / ys) + 1;
    let yp = toInt((yi + 0.5) / ys);
    xw -= xp;
    yw = yp - yw;
    yp = G.RadarHeight - 1 - yp;
    X.XFillRectangle(G.dpy, G.radarPixmap2, G.radarGC, xp, yp, (xw + 1) >>> 0, (yw + 1) >>> 0);
  }
  if (G.radarPixmap2 === G.radarPixmap) X.XSetPlaneMask(G.dpy, G.radarGC, (X.AllPlanes & ~(G.dpl_2[0] | G.dpl_2[1])) >>> 0);
}

function Compute_radar_bounds(min: { x: number; y: number }, max: { x: number; y: number }, b: { x: number; y: number; w: number; h: number }): void {
  const S = G.Setup!;
  min.x = Math.trunc((0 - (b.x + b.w)) / S.width);
  if (0 > b.x + b.w) min.x++;
  max.x = Math.trunc((0 + S.width - b.x) / S.width);
  if (0 + S.width < b.x) max.x--;
  min.y = Math.trunc((0 - (b.y + b.h)) / S.height);
  if (0 > b.y + b.h) min.y++;
  max.y = Math.trunc((0 + S.height - b.y) / S.height);
  if (0 + S.height < b.y) max.y--;
}

function Paint_world_radar_new(): void {
  const S = G.Setup!;
  const min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
  G.radar_exposures = 2;
  if (G.radarPixmap2 === G.radarPixmap) X.XSetPlaneMask(G.dpy, G.radarGC, (X.AllPlanes & ~(G.dpl_1[0] | G.dpl_1[1])) >>> 0);
  if (G.radarPixmap2 !== G.radarWindow) {
    X.XSetForeground(G.dpy, G.radarGC, G.colors[BLACK].pixel);
    X.XFillRectangle(G.dpy, G.radarPixmap2, G.radarGC, 0, 0, 256, G.RadarHeight);
  } else X.XClearWindow(G.dpy, G.radarWindow);
  X.XSetForeground(G.dpy, G.radarGC, G.colors[R.wallRadarColor].pixel);
  for (let i = 0; i < G.num_polygons; i++) {
    const pg = G.polygons[i];
    if (BIT(G.polygon_styles[pg.style].flags, STYLE_INVISIBLE_RADAR)) continue;
    Compute_radar_bounds(min, max, pg.bounds);
    for (let xoff = min.x; xoff <= max.x; xoff++) {
      for (let yoff = min.y; yoff <= max.y; yoff++) {
        let x = xoff * S.width, y = yoff * S.height;
        const poly: XPoint[] = new Array(pg.num_points);
        for (let j = 0; j < pg.num_points; j++) {
          x += pg.points[j].x;
          y += pg.points[j].y;
          poly[j] = { x: s16(Math.trunc((x * 256) / S.width)), y: s16(G.RadarHeight - Math.trunc((y * G.RadarHeight) / S.height)) };
        }
        X.XSetForeground(G.dpy, G.radarGC, G.fullColor ? G.polygon_styles[pg.style].color : G.colors[R.wallRadarColor].pixel);
        X.XFillPolygon(G.dpy, G.radarPixmap2, G.radarGC, poly, pg.num_points, X.Nonconvex, X.CoordModeOrigin);
      }
    }
  }
  if (G.radarPixmap2 === G.radarPixmap) X.XSetPlaneMask(G.dpy, G.radarGC, (X.AllPlanes & ~(G.dpl_2[0] | G.dpl_2[1])) >>> 0);
}

export function Paint_world_radar(): void {
  // the block map radar (Paint_world_radar_old) of old servers is not ported
  if (!G.oldServer) Paint_world_radar_new();
}

export function Radar_show_target(x: number, y: number): void {
  Paint_radar_block(x, y, R.targetRadarColor);
}

export function Radar_hide_target(x: number, y: number): void {
  Paint_radar_block(x, y, BLACK);
}

export function Store_paintradar_options(): void {
  STORE_OPTIONS([
    COLOR_INDEX_OPTION_WITH_SETFUNC('wallRadarColor', BLUE, ref(R, 'wallRadarColor'), (_o, v) => { R.wallRadarColor = v; return true; },
      'Which color number to use for drawing walls on the radar.\nValid values all even numbers smaller than maxColors.\n'),
    COLOR_INDEX_OPTION_WITH_SETFUNC('decorRadarColor', 6, ref(R, 'decorRadarColor'), (_o, v) => { R.decorRadarColor = v; return true; },
      'Which color number to use for drawing decorations on the radar.\nValid values are all even numbers smaller than maxColors.\n'),
    COLOR_INDEX_OPTION_WITH_SETFUNC('targetRadarColor', 4, ref(R, 'targetRadarColor'), (_o, v) => { R.targetRadarColor = v; return true; },
      'Which color number to use for drawing targets on the radar.\nValid values are all even numbers smaller than maxColors.\n'),
  ]);
}
