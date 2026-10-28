// paintmap.c: the world (borders, background dots) and the map objects (polygons, fuel stations,
// bases, checkpoints), once per wrapped copy of the map in view. The block map painter of old
// servers is not ported.
import { G } from './G.ts';
import type { irec_t, ipos_t } from './G.ts';
import { BLOCK_SZ, WRAP_PLAY, MAX_VIEW_SIZE } from './consts.ts';
import { BIT, onReset, toInt } from './cutil.ts';
import {
  Gui_paint_border, Gui_paint_visible_border, Gui_paint_hudradar_limit, Gui_paint_decor_dot, Gui_paint_polygon,
  Gui_paint_fuel, Gui_paint_base, Gui_paint_setup_check,
} from './guimap.ts';

const PM = { hrLimitTime: 0.0, oldHRLimit: -1.0 };
onReset(() => Object.assign(PM, { hrLimitTime: 0.0, oldHRLimit: -1.0 }));

function Paint_background_dots(): void {
  if (G.backgroundPointDist === 0) return;
  const S = G.Setup!;
  const count_x = Math.trunc(S.width / (BLOCK_SZ * G.backgroundPointDist));
  const count_y = Math.trunc(S.height / (BLOCK_SZ * G.backgroundPointDist));
  const dx = S.width / count_x, dy = S.height / count_y;
  let min_x = toInt(G.world.x / dx);
  if (G.world.x > 0) min_x++;
  let min_y = toInt(G.world.y / dy);
  if (G.world.y > 0) min_y++;
  const max_x = toInt((G.world.x + G.ext_view_width) / dx);
  const max_y = toInt((G.world.y + G.ext_view_height) / dy);
  for (let yi = min_y; yi <= max_y; yi++) {
    for (let xi = min_x; xi <= max_x; xi++) {
      Gui_paint_decor_dot(toInt(xi * dx - Math.trunc(BLOCK_SZ / 2)), toInt(yi * dy - Math.trunc(BLOCK_SZ / 2)), G.backgroundPointSize);
    }
  }
}

function Compute_bounds(min: ipos_t, max: ipos_t, b: irec_t): void {
  const S = G.Setup!;
  const w = G.world;
  min.x = Math.trunc((w.x - (b.x + b.w)) / S.width);
  if (w.x > b.x + b.w) min.x++;
  max.x = Math.trunc((w.x + G.ext_view_width - b.x) / S.width);
  if (w.x + G.ext_view_width < b.x) max.x--;
  min.y = Math.trunc((w.y - (b.y + b.h)) / S.height);
  if (w.y > b.y + b.h) min.y++;
  max.y = Math.trunc((w.y + G.ext_view_height - b.y) / S.height);
  if (w.y + G.ext_view_height < b.y) max.y--;
  if (!BIT(S.mode, WRAP_PLAY)) {
    if (min.x <= max.x) min.x = max.x = 0;
    if (min.y <= max.y) min.y = max.y = 0;
  }
}

export function Paint_objects(): void {
  const S = G.Setup!;
  const min = { x: 0, y: 0 }, max = { x: 0, y: 0 };
  for (let i = 0; i < G.num_polygons; i++) {
    Compute_bounds(min, max, G.polygons[i].bounds);
    for (let xoff = min.x; xoff <= max.x; xoff++) for (let yoff = min.y; yoff <= max.y; yoff++) Gui_paint_polygon(i, xoff, yoff);
  }
  for (let i = 0; i < G.num_fuels; i++) {
    const f = G.fuels[i];
    Compute_bounds(min, max, f.bounds);
    for (let xoff = min.x; xoff <= max.x; xoff++) {
      for (let yoff = min.y; yoff <= max.y; yoff++) Gui_paint_fuel(f.bounds.x + xoff * S.width, f.bounds.y + yoff * S.height, f.fuel);
    }
  }
  for (let i = 0; i < G.num_bases; i++) {
    const b = G.bases[i];
    Compute_bounds(min, max, b.bounds);
    for (let xoff = min.x; xoff <= max.x; xoff++) {
      for (let yoff = min.y; yoff <= max.y; yoff++) Gui_paint_base(b.bounds.x + xoff * S.width, b.bounds.y + yoff * S.height, b.id, b.team, b.type);
    }
  }
  for (let i = 0; i < G.num_checks; i++) {
    const c = G.checks[i];
    Compute_bounds(min, max, c.bounds);
    for (let xoff = min.x; xoff <= max.x; xoff++) {
      for (let yoff = min.y; yoff <= max.y; yoff++) Gui_paint_setup_check(c.bounds.x + xoff * S.width, c.bounds.y + yoff * S.height, i === G.nextCheckPoint);
    }
  }
}

export function Paint_world(): void {
  const S = G.Setup!;
  const w = G.world;
  if (!BIT(S.mode, WRAP_PLAY)) {
    if (w.x <= 0) Gui_paint_border(0, 0, 0, S.height);
    if (w.x + G.ext_view_width >= S.width) Gui_paint_border(S.width, 0, S.width, S.height);
    if (w.y <= 0) Gui_paint_border(0, 0, S.width, 0);
    if (w.y + G.ext_view_height >= S.height) Gui_paint_border(0, S.height, S.width, S.height);
  }
  if (G.ext_view_width > MAX_VIEW_SIZE || G.ext_view_height > MAX_VIEW_SIZE) {
    Gui_paint_visible_border(w.x + Math.trunc(G.ext_view_width / 2) - MAX_VIEW_SIZE / 2, w.y + Math.trunc(G.ext_view_height / 2) - MAX_VIEW_SIZE / 2,
      w.x + Math.trunc(G.ext_view_width / 2) + MAX_VIEW_SIZE / 2, w.y + Math.trunc(G.ext_view_height / 2) + MAX_VIEW_SIZE / 2);
  }
  if (PM.hrLimitTime > 0.0) {
    PM.hrLimitTime -= G.timePerFrame;
    if (PM.hrLimitTime <= 0.0) PM.hrLimitTime = 0.0;
  }
  if (PM.oldHRLimit < 0.0) PM.oldHRLimit = G.hudRadarLimit;
  if (PM.oldHRLimit !== G.hudRadarLimit) {
    PM.oldHRLimit = G.hudRadarLimit;
    PM.hrLimitTime = 1.0;
  }
  if (PM.hrLimitTime > 0.0) {
    const cx = w.x + Math.trunc(G.ext_view_width / 2), cy = w.y + Math.trunc(G.ext_view_height / 2);
    Gui_paint_hudradar_limit(toInt(cx - (G.hudRadarLimit * MAX_VIEW_SIZE) / 2), toInt(cy - (G.hudRadarLimit * MAX_VIEW_SIZE) / 2),
      toInt(cx + (G.hudRadarLimit * MAX_VIEW_SIZE) / 2), toInt(cy + (G.hudRadarLimit * MAX_VIEW_SIZE) / 2));
  }
  if (!G.oldServer) Paint_background_dots();
}
