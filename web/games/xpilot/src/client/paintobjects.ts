// paintobjects.c: the objects of a frame in paint order: items, balls, mines, debris, wreckage,
// asteroids, wormholes, shots, missiles, lasers; then paused and appearing markers, ECMs, ships and
// connectors. Positions of a wrapping map are moved into the view (wrap).
import { G } from './G.ts';
import {
  NUM_WRECKAGE_SHAPES, NUM_WRECKAGE_POINTS, WRECKAGE_SHAPES, RES, EXPIRED_MINE_ID, MISSILE_LEN, DEBRIS_TYPES, WHITE, BLUE,
} from './consts.ts';
import { ABS } from './cutil.ts';
import { Rotate_position } from './shipshape.ts';
import type { position_t } from './shipshape.ts';
import { Other_by_id } from './client.ts';
import { X as XX, Y as YY } from './paint.ts';
import {
  Gui_paint_item_object, Gui_paint_ball, Gui_paint_ball_connector, Gui_paint_mine, Gui_paint_spark, Gui_paint_wreck,
  Gui_paint_asteroids_begin, Gui_paint_asteroids_end, Gui_paint_asteroid, Gui_paint_missiles_begin, Gui_paint_missiles_end,
  Gui_paint_missile, Gui_paint_lasers_begin, Gui_paint_lasers_end, Gui_paint_laser, Gui_paint_fastshot, Gui_paint_teamshot,
  Gui_paint_paused, Gui_paint_appearing, Gui_paint_ecm, Gui_paint_ship, Gui_paint_refuel, Gui_paint_connector,
  Gui_paint_transporter, Gui_paint_all_connectors_begin, Gui_paint_ships_begin, Gui_paint_ships_end,
} from './guiobjects.ts';
import { Gui_paint_setup_worm } from './guimap.ts';

/** wreckageShapes[shape][point][dir] */
export let wreckageShapes: position_t[][][] = [];

function wrap(p: { x: number; y: number }): boolean {
  const w = G.world, rw = G.realWorld;
  const x = p.x, y = p.y;
  if (x < w.x || x > w.x + G.ext_view_width) {
    if (x < rw.x || x > rw.x + G.ext_view_width) return false;
    p.x += w.x - rw.x;
  }
  if (y < w.y || y > w.y + G.ext_view_height) {
    if (y < rw.y || y > rw.y + G.ext_view_height) return false;
    p.y += w.y - rw.y;
  }
  return true;
}

function Paint_items(): void {
  if (G.num_itemtype > 0) {
    for (let i = 0; i < G.num_itemtype; i++) {
      const it = G.itemtype_ptr[i];
      const p = { x: it.x, y: it.y };
      if (wrap(p)) Gui_paint_item_object(it.type, p.x, p.y);
    }
    G.num_itemtype = 0;
  }
}

function Paint_balls(): void {
  if (G.num_ball > 0) {
    for (let i = 0; i < G.num_ball; i++) {
      const b = G.ball_ptr[i];
      const p = { x: b.x, y: b.y };
      const id = b.id;
      if (wrap(p)) {
        Gui_paint_ball(p.x, p.y, b.style);
        if (id === -1) continue;
        let j;
        for (j = 0; j < G.num_ship && G.ship_ptr[j].id !== id; j++);
        if (j >= G.num_ship) continue;
        const s = { x: G.ship_ptr[j].x, y: G.ship_ptr[j].y };
        if (wrap(s)) Gui_paint_ball_connector(p.x, p.y, s.x, s.y);
      }
    }
    G.num_ball = 0;
  }
}

function Paint_mines(): void {
  if (G.num_mine > 0) {
    for (let i = 0; i < G.num_mine; i++) {
      const m = G.mine_ptr[i];
      const p = { x: m.x, y: m.y };
      if (wrap(p)) {
        let name: string | null = null;
        if (m.id !== 0) {
          if (m.id === EXPIRED_MINE_ID) name = 'Expired';
          else {
            const other = Other_by_id(m.id);
            name = other !== null ? other.id_string : 'Not of this world!';
          }
        }
        Gui_paint_mine(p.x, p.y, m.teammine, name);
      }
    }
    G.num_mine = 0;
  }
}

const BASE_X = (i: number, x_areas: number) => ((i % x_areas) << 8) + G.ext_view_x_offset;
const BASE_Y = (i: number, x_areas: number, y_areas: number) =>
  G.ext_view_height - 1 - ((Math.trunc(i / x_areas) % y_areas) << 8) - G.ext_view_y_offset;

function Paint_debris(x_areas: number, y_areas: number, areas: number, max_: number): void {
  for (let i = 0; i < max_; i++) {
    const n = G.num_debris[i] ?? 0;
    if (n > 0) {
      const x = BASE_X(i, x_areas), y = BASE_Y(i, x_areas, y_areas);
      let color = Math.trunc(i / areas);
      color = G.num_spark_colors > 4 ? ((color & 1) << 2) | (color >> 1) : color;
      const d = G.debris_ptr[i];
      for (let j = 0; j < n; j++) Gui_paint_spark(color, x + d[j].x, y - d[j].y);
      G.num_debris[i] = 0;
    }
  }
}

function Paint_wreckages(): void {
  if (G.num_wreckage > 0) {
    for (let i = 0; i < G.num_wreckage; i++) {
      const w = G.wreckage_ptr[i];
      const p = { x: w.x, y: w.y };
      if (wrap(p)) {
        const deadly = (w.wrecktype & 0x80) !== 0;
        const wtype = (w.wrecktype & 0x7f) % NUM_WRECKAGE_SHAPES;
        Gui_paint_wreck(p.x, p.y, deadly, wtype, w.rotation, w.size);
      }
    }
    G.num_wreckage = 0;
  }
}

function Paint_asteroids(): void {
  if (G.num_asteroids > 0) {
    Gui_paint_asteroids_begin();
    for (let i = 0; i < G.num_asteroids; i++) {
      const a = G.asteroid_ptr[i];
      const p = { x: a.x, y: a.y };
      if (wrap(p)) Gui_paint_asteroid(p.x, p.y, a.type, a.rotation, a.size);
    }
    Gui_paint_asteroids_end();
    G.num_asteroids = 0;
  }
}

function Paint_wormholes(): void {
  if (G.num_wormholes > 0) {
    for (let i = 0; i < G.num_wormholes; i++) {
      const p = { x: G.wormhole_ptr[i].x, y: G.wormhole_ptr[i].y };
      if (wrap(p)) Gui_paint_setup_worm(p.x, p.y);
    }
    G.num_wormholes = 0;
  }
}

function Paint_missiles(): void {
  if (G.num_missile > 0) {
    Gui_paint_missiles_begin();
    for (let i = 0; i < G.num_missile; i++) {
      const m = G.missile_ptr[i];
      const p = { x: m.x, y: m.y };
      let len = MISSILE_LEN;
      if (m.len > 0) len = m.len;
      if (wrap(p)) Gui_paint_missile(p.x, p.y, len, m.dir);
    }
    Gui_paint_missiles_end();
    G.num_missile = 0;
  }
}

function Paint_lasers(): void {
  if (G.num_laser > 0) {
    Gui_paint_lasers_begin();
    for (let i = 0; i < G.num_laser; i++) {
      const l = G.laser_ptr[i];
      const p = { x: l.x, y: l.y };
      if (wrap(p)) Gui_paint_laser(l.color, p.x, p.y, l.len, l.dir);
    }
    Gui_paint_lasers_end();
    G.num_laser = 0;
  }
}

function Paint_fastshots(i: number, x_areas: number, y_areas: number, areas: number): void {
  const n = G.num_fastshot[i] ?? 0;
  if (n > 0) {
    const x = BASE_X(i, x_areas), y = BASE_Y(i, x_areas, y_areas);
    let color = Math.trunc(i / areas);
    if (color !== WHITE && color !== BLUE) color = WHITE;
    const f = G.fastshot_ptr[i];
    for (let j = 0; j < n; j++) Gui_paint_fastshot(color, x + f[j].x, y - f[j].y);
    G.num_fastshot[i] = 0;
  }
}

function Paint_teamshots(i: number, t_: number, x_areas: number, y_areas: number): void {
  const n = G.num_fastshot[t_] ?? 0;
  if (n > 0) {
    const x = BASE_X(i, x_areas), y = BASE_Y(i, x_areas, y_areas);
    const f = G.fastshot_ptr[t_];
    for (let j = 0; j < n; j++) Gui_paint_teamshot(x + f[j].x, y - f[j].y);
    G.num_fastshot[t_] = 0;
  }
}

export function Paint_shots(): void {
  Paint_items();
  Paint_balls();
  Paint_mines();
  const x_areas = (G.active_view_width + 255) >> 8;
  const y_areas = (G.active_view_height + 255) >> 8;
  const areas = x_areas * y_areas;
  const max_ = areas * (G.num_spark_colors >= 3 ? G.num_spark_colors : 4);
  Paint_debris(x_areas, y_areas, areas, max_);
  Paint_wreckages();
  Paint_asteroids();
  Paint_wormholes();
  for (let i = 0; i < max_; i++) {
    const t_ = i + DEBRIS_TYPES;
    Paint_fastshots(i, x_areas, y_areas, areas);
    Paint_teamshots(i, t_, x_areas, y_areas);
  }
  Paint_missiles();
  Paint_lasers();
}

function Paint_paused(): void {
  if (G.num_paused > 0) {
    for (let i = 0; i < G.num_paused; i++) {
      const q = G.paused_ptr[i];
      const p = { x: q.x, y: q.y };
      if (wrap(p)) Gui_paint_paused(p.x, p.y, q.count);
    }
    G.num_paused = 0;
  }
}

function Paint_appearing(): void {
  if (G.num_appearing > 0) {
    for (let i = 0; i < G.num_appearing; i++) {
      const q = G.appearing_ptr[i];
      const p = { x: q.x, y: q.y };
      if (wrap(p)) Gui_paint_appearing(p.x, p.y, q.id, q.count);
    }
    G.num_appearing = 0;
  }
}

function Paint_ecm(): void {
  if (G.num_ecm > 0) {
    for (let i = 0; i < G.num_ecm; i++) {
      const e = G.ecm_ptr[i];
      const size = e.size;
      if (size > 0) {
        const p = { x: e.x, y: e.y };
        if (wrap(p)) Gui_paint_ecm(p.x, p.y, size);
      }
    }
    G.num_ecm = 0;
  }
}

function Paint_all_ships(): void {
  if (G.num_ship > 0) {
    for (let i = 0; i < G.num_ship; i++) {
      const s = G.ship_ptr[i];
      const p = { x: s.x, y: s.y };
      if (!wrap(p)) continue;
      if (ABS(XX(p.x) - Math.trunc(G.ext_view_width / 2)) <= 1 && ABS(YY(p.y) - Math.trunc(G.ext_view_height / 2)) <= 1 && Other_by_id(s.id) !== null) {
        G.eyesId = s.id;
        G.eyes = Other_by_id(G.eyesId);
        if (G.eyes !== null) G.eyeTeam = G.eyes.team;
      }
      Gui_paint_ship(p.x, p.y, s.dir, s.id, s.cloak, s.phased, s.shield, s.deflector, s.eshield);
    }
    G.num_ship = 0;
  }
}

function Paint_refuel(): void {
  if (G.num_refuel > 0) {
    for (let i = 0; i < G.num_refuel; i++) {
      const r = G.refuel_ptr[i];
      const a = { x: r.x0, y: r.y0 }, b = { x: r.x1, y: r.y1 };
      if (wrap(a) && wrap(b)) Gui_paint_refuel(a.x, a.y, b.x, b.y);
    }
    G.num_refuel = 0;
  }
}

function Paint_connectors(): void {
  if (G.num_connector > 0) {
    for (let i = 0; i < G.num_connector; i++) {
      const c = G.connector_ptr[i];
      const a = { x: c.x0, y: c.y0 }, b = { x: c.x1, y: c.y1 };
      if (wrap(a) && wrap(b)) Gui_paint_connector(a.x, a.y, b.x, b.y, c.tractor);
    }
    G.num_connector = 0;
  }
}

function Paint_transporters(): void {
  if (G.num_trans > 0) {
    for (let i = 0; i < G.num_trans; i++) {
      const t = G.trans_ptr[i];
      const a = { x: t.x1, y: t.y1 }, b = { x: t.x2, y: t.y2 };
      if (wrap(a) && wrap(b)) Gui_paint_transporter(a.x, a.y, b.x, b.y);
    }
    G.num_trans = 0;
  }
}

function Paint_all_connectors(): void {
  if (G.num_refuel > 0 || G.num_connector > 0 || G.num_trans > 0) {
    Gui_paint_all_connectors_begin();
    Paint_refuel();
    Paint_connectors();
    Paint_transporters();
  }
}

export function Paint_ships(): void {
  Gui_paint_ships_begin();
  Paint_paused();
  Paint_appearing();
  Paint_ecm();
  Paint_all_ships();
  Paint_all_connectors();
  Gui_paint_ships_end();
}

export function Init_wreckage(): number {
  wreckageShapes = [];
  for (let shp = 0; shp < NUM_WRECKAGE_SHAPES; shp++) {
    const s: position_t[][] = [];
    for (let i = 0; i < NUM_WRECKAGE_POINTS; i++) {
      const p = Array.from({ length: RES }, () => ({ x: 0, y: 0 }));
      p[0].x = WRECKAGE_SHAPES[shp][i][0];
      p[0].y = WRECKAGE_SHAPES[shp][i][1];
      Rotate_position(p);
      s.push(p);
    }
    wreckageShapes.push(s);
  }
  return 0;
}
