// GLtron's drawing geometry without any GL: walls, floor, trail ribbon, bow, shadow matrix,
// recognizer path and the player camera, translated from src/video (graphics_world.c,
// trail_geometry.c, trail.c, recognizer.c, gamegraphics.c) and src/game/camera.c. The renderer
// uploads these numbers; the tests check them. Units are the original's world units (z up).
import { DIRS_X, DIRS_Y, type PlayerData } from './sim.ts';

export const WALL_H = 48;
export const DECAL_WIDTH = 20;
export const BOW_LENGTH = 6;
export const RECOGNIZER_HEIGHT = 50;
export const REC_SCALE = 0.25;
export const EXP_RADIUS_MAX = 30;
const BOW_DIST1 = 0.4, BOW_DIST2 = 0.85, BOW_DIST3 = 2;
const DISTS = [BOW_DIST2, BOW_DIST3, BOW_DIST1, 0];

export interface Quad { pos: number[]; uv: number[] }

/** drawWalls(): four quads facing into the arena, stretch_textures = 1 (u in 0..1, height grid/240*48). */
export function wallQuads(grid: number): Quad[] {
  const h = (grid / 240) * WALL_H, t = 1, g = grid;
  const q = (v: number[][]): Quad => ({
    pos: v.flat(),
    uv: [t, 0, t, 1, 0, 1, 0, 0],
  });
  return [
    q([[0, 0, 0], [0, 0, h], [g, 0, h], [g, 0, 0]]),
    q([[g, 0, 0], [g, 0, h], [g, g, h], [g, g, 0]]),
    q([[g, g, 0], [g, g, h], [0, g, h], [0, g, 0]]),
    q([[0, g, 0], [0, g, h], [0, 0, h], [0, 0, 0]]),
  ];
}

/** drawFloorTextured(): quads of l = grid/4 with the texture repeated t = l/12 times (integer math). */
export function floorQuads(grid: number): Quad[] {
  const l = Math.trunc(grid / 4), t = Math.trunc(l / 12), out: Quad[] = [];
  for (let i = 0; i < grid; i += l) {
    for (let j = 0; j < grid; j += l) {
      out.push({
        pos: [i, j, 0, i + l, j, 0, i + l, j + l, 0, i, j + l, 0],
        uv: [0, 0, t, 0, t, t, 0, t],
      });
    }
  }
  return out;
}

/** shadow_matrix of globals.c with LX = LY = 2: (x, y, z) goes to (x - z/2, y - z/2, 0). */
export function shadowProject(x: number, y: number, z: number): [number, number, number] {
  return [x - z / 2, y - z / 2, 0];
}

/** Row-major 4x4 of shadow_matrix (the GL array is column-major, w' = 4 is divided out). */
export const SHADOW_ROWS = [1, 0, -0.5, 0, 0, 1, -0.5, 0, 0, 0, 0, 0, 0, 0, 0, 1];

// ---- trails ------------------------------------------------------------------------------

type TrailData = Pick<PlayerData, 'dir' | 'trails' | 'trailOffset' | 'trailHeight'>;

/** getSegmentEndX/Y(): the end of the last trail segment, pulled back by the bow length. */
export function segmentEnd(d: TrailData, dist: number): { x: number; y: number } {
  const s = d.trails[d.trailOffset];
  const len = Math.hypot(s.dx, s.dy);
  const blength = len < 2 * BOW_LENGTH ? len / 2 : BOW_LENGTH;
  return {
    x: DIRS_X[d.dir] === 0 ? s.x + s.dx : s.x + s.dx - DISTS[dist] * blength * DIRS_X[d.dir],
    y: DIRS_Y[d.dir] === 0 ? s.y + s.dy : s.y + s.dy - DISTS[dist] * blength * DIRS_Y[d.dir],
  };
}

export interface TrailMesh {
  pos: number[];
  uv: number[];
  /** rgb per vertex, 0..1 */
  color: number[];
  index: number[];
}

/**
 * trailGeometry() + bowGeometry(): one vertical ribbon per player (floor/top vertex pairs), the
 * brightened tip and the bow. trail/bright/cycle are the three vertex colours of storeColor().
 */
export function trailMesh(d: TrailData, trail: number[], cycle: number[]): TrailMesh {
  const m: TrailMesh = { pos: [], uv: [], color: [], index: [] };
  const white = [1, 1, 1];
  const frac = (v: number) => v - Math.floor(v);
  let n = 0; // vertices stored (two per column)
  const store = (sx: number, sy: number, dx: number, dy: number, t: number, floor: number, top: number,
    segLen: number, total: number, color: number[]): void => {
    const u = frac(total / DECAL_WIDTH) + (t * segLen) / DECAL_WIDTH;
    const x = sx + t * dx, y = sy + t * dy;
    m.pos.push(x, y, floor, x, y, top);
    m.uv.push(u, 0, u, 1);
    m.color.push(...color, ...color);
    n += 2;
  };
  const quad = (): void => {
    const o = n - 4; // storeIndices(): the winding only matters with culling, which is off
    m.index.push(o, o + 2, o + 1, o + 2, o + 3, o + 1);
  };
  const h = d.trailHeight;
  let total = 0;
  for (let i = 0; i < d.trailOffset; i++) {
    const s = d.trails[i], len = Math.hypot(s.dx, s.dy);
    let start = i === 0;
    if (!start) { // cmpdir(): a corner needs its own start column
      const p = d.trails[i - 1];
      start = !((p.dx === 0 && s.dx === 0) || (p.dy === 0 && s.dy === 0));
    }
    if (start) store(s.x, s.y, s.dx, s.dy, 0, 0, h, len, total, trail);
    store(s.x, s.y, s.dx, s.dy, 1, 0, h, len, total, trail);
    quad();
    total += len;
  }
  const last = d.trails[d.trailOffset];
  const e1 = segmentEnd(d, 1), e0 = segmentEnd(d, 0);
  let sx = last.x, sy = last.y, dx = e1.x - sx, dy = e1.y - sy, len = Math.hypot(dx, dy);
  store(sx, sy, dx, dy, 0, 0, h, len, total, trail);
  store(sx, sy, dx, dy, 1, 0, h, len, total, trail);
  quad();
  total += len;
  sx += dx; sy += dy; dx = e0.x - sx; dy = e0.y - sy; len = Math.hypot(dx, dy);
  store(sx, sy, dx, dy, 0, 0, h, len, total, trail);
  store(sx, sy, dx, dy, 1, 0, h, len, total, white);
  quad();
  // bowGeometry(): the cycle is active, so the bow runs from end(0) to end(2)
  const b0 = segmentEnd(d, 0), b1 = segmentEnd(d, 2);
  sx = b0.x; sy = b0.y; dx = b1.x - sx; dy = b1.y - sy;
  for (let i = 0; i < 10; i++) {
    const t = i / 10;
    let top = Math.sqrt(1 - t * t);
    const floor = t < 0.6 ? 0 : 0.5 * (t - 0.6);
    if (top < 0.3) top = 0.3;
    store(sx, sy, dx, dy, t, floor * h, top * h, DECAL_WIDTH, 0, white);
    if (i) quad();
  }
  store(sx, sy, dx, dy, 1, 0.2 * h, 0.3 * h, DECAL_WIDTH, 0, cycle);
  quad();
  return m;
}

/** drawTrailLines(): the white line along the top of every segment, the last one up to the bow. */
export function trailLines(d: TrailData): number[] {
  const out: number[] = [], h = d.trailHeight;
  for (let i = 0; i < d.trailOffset; i++) {
    const s = d.trails[i];
    out.push(s.x, s.y, h, s.x + s.dx, s.y + s.dy, h);
  }
  const s = d.trails[d.trailOffset], e = segmentEnd(d, 0);
  out.push(s.x, s.y, h, e.x, e.y, h);
  return out;
}

// ---- recognizer ----------------------------------------------------------------------------

const XV = [0.5, 0.3245, 0.6, 0.5, 0.68, -0.3];
const YV = [0.8, 1.0, 0.0, 0.2, 0.2, 0.0];

/** getRecognizerPositionVelocity(); width is the model's x size (BBox.vSize.x). */
export function recognizerState(alpha: number, grid: number, width: number):
  { x: number; y: number; vx: number; vy: number } {
  const x = XV[0] * Math.sin(XV[1] * alpha + XV[2]) - XV[3] * Math.sin(XV[4] * alpha + XV[5]);
  const y = YV[0] * Math.cos(YV[1] * alpha + YV[2]) - YV[3] * Math.sin(YV[4] * alpha + YV[5]);
  const dx = XV[1] * XV[0] * Math.cos(XV[1] * alpha + XV[2]) - XV[4] * XV[3] * Math.cos(XV[4] * alpha + XV[5]);
  const dy = -YV[1] * YV[0] * Math.sin(YV[1] * alpha + YV[2]) - YV[4] * YV[3] * Math.sin(YV[4] * alpha + YV[5]);
  const max = width * REC_SCALE, bound = grid - max;
  return {
    x: (max + (x + 1) * bound) / 2, y: (max + (y + 1) * bound) / 2,
    vx: (dx * grid) / 100, vy: (dy * grid) / 100,
  };
}

/** getRecognizerAngle() in degrees. The original passes velocity->v[0] for both components. */
export function recognizerAngle(vx: number): number {
  const d = vx;
  let phi = Math.acos(vx / Math.sqrt(vx * vx + d * d));
  if (d < 0) phi = 2 * Math.PI - phi;
  return ((phi + Math.PI / 2) * 180) / Math.PI;
}

// ---- cameras -------------------------------------------------------------------------------

// camera.c camAngles[] (radians)
export const CAM_ANGLES = [Math.PI / 2, 0, (3 * Math.PI) / 2, Math.PI, 2 * Math.PI];
const CAM_SPEED = 0.000349;
export const CAM_DEFAULTS = [
  { r: 17, chi: Math.PI / 3, phi: 0 }, // circling
  { r: 18, chi: Math.PI / 4, phi: Math.PI / 72 }, // follow ("behind")
  { r: 4, chi: Math.PI / 8, phi: Math.PI }, // cockpit
  { r: 17, chi: Math.PI / 3, phi: 0 }, // free (treated as the mouse camera without a pointer)
];

export interface CamPlayer { x: number; y: number; dir: number; lastDir: number; turnTime: number }
export interface CamResult { cam: [number, number, number]; target: [number, number, number] }

/** playerCamera(): `phi` is the camera's own angle (it grows for the circling camera). */
export function playerCamera(type: number, p: CamPlayer, time: number, phi: number, offset: number): CamResult {
  const def = CAM_DEFAULTS[type];
  const { r, chi } = def;
  let ph = phi + offset;
  if (type === 1 || type === 2) { // coupled to the player's turns
    const t = time - p.turnTime;
    if (t < 200) {
      let dir = p.dir, ldir = p.lastDir;
      if (dir === 1 && ldir === 2) dir = 4;
      if (dir === 2 && ldir === 1) ldir = 4;
      ph += ((200 - t) * CAM_ANGLES[ldir] + t * CAM_ANGLES[dir]) / 200;
    } else ph += CAM_ANGLES[p.dir];
  }
  const cam: [number, number, number] = [
    p.x + r * Math.cos(ph) * Math.sin(chi), p.y + r * Math.sin(ph) * Math.sin(chi), r * Math.cos(chi),
  ];
  let target: [number, number, number] = [p.x, p.y, 0];
  if (type === 2) {
    target = [p.x + 4 * DIRS_X[p.dir] + 2 * Math.cos(ph), p.y + 4 * DIRS_Y[p.dir] + 2 * Math.sin(ph), 4];
    cam[0] = p.x + 4 * DIRS_X[p.dir] + 0.1 * Math.cos(ph);
    cam[1] = p.y + 4 * DIRS_Y[p.dir] + 0.1 * Math.sin(ph);
    cam[2] = 4.1;
  }
  return { cam, target };
}

/** observerCamera(): a player who is out rides the recognizer. */
export function observerCamera(rec: { x: number; y: number; vx: number; vy: number }): CamResult {
  return {
    cam: [rec.x, rec.y, RECOGNIZER_HEIGHT],
    target: [rec.x + rec.vx, rec.y + rec.vy, RECOGNIZER_HEIGHT - 2],
  };
}

export { CAM_SPEED };

/** getDirAngle() for the cycle model, degrees. */
const DIR_ANGLES = [0, -90, -180, 90, 180, -270];
export function cycleAngle(dir: number, lastDir: number, t: number): number {
  if (t < 200) {
    let last = lastDir;
    if (dir === 3 && last === 2) last = 4;
    if (dir === 2 && last === 3) last = 5;
    return ((200 - t) * DIR_ANGLES[last] + t * DIR_ANGLES[dir]) / 200;
  }
  return DIR_ANGLES[dir];
}

/** doCycleTurnRotation(): the lean about the y axis while turning, degrees (0 when not turning). */
export function cycleLean(dir: number, lastDir: number, t: number): number {
  if (t >= 200 || lastDir === dir) return 0;
  let axis = 1;
  if (dir < lastDir && lastDir !== 3) axis = -1;
  else if ((lastDir === 3 && dir === 2) || (lastDir === 0 && dir === 3)) axis = -1;
  return 25 * Math.sin((Math.PI * t) / 200) * axis * -1;
}
