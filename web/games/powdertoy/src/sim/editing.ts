// simulation/Editing.cpp (with Snapshot.h and Sample.h): the editing methods of Simulation, as functions that
// take the Simulation first. Same names as the C++ methods, except the overloads:
//   int CreateParts(int p, int positionX, int positionY, int c, Brush const &cBrush, int flags) → CreateParts
//   int CreateParts(int p, int x, int y, int rx, int ry, int c, int flags)                      → CreatePartsRect
//   void CreateLine(int x1, int y1, int x2, int y2, int c, Brush const &cBrush, int flags)       → CreateLine
//   (the 5-argument Simulation::CreateLine of Simulation.cpp stays sim.CreateLine)
// A RendererFrame is a Uint32Array of XRES*YRES 0xRRGGBB pixels, index x + y * XRES.
import {
  CELL, CHANNELS, DECO_ADD, DECO_CLEAR, DECO_DIVIDE, DECO_DRAW, DECO_MULTIPLY, DECO_SMUDGE, DECO_SUBTRACT,
  DECOSPACE_GAMMA18, DECOSPACE_GAMMA22, DECOSPACE_LINEAR, DECOSPACE_SRGB, ID, MAX_FIGHTERS, NCELL, NPART,
  NUM_DECOSPACES, PMAP, PT_NUM, REPLACE_MODE, SPECIFIC_DELETE, TYP, TYPE_ENERGY, WL_ERASE, WL_ERASEALL, WL_FAN,
  WL_GRAV, WL_STREAM, XCELLS, XRES, YCELLS, YRES,
} from './config.ts';
import { f, itrunc } from './cpp.ts';
import { PT_LIGH, PT_SPRK, PT_TESC } from './numbers.ts';
import { Particle } from './particle.ts';
import { sd } from './simulationData.ts';
import { GravityInput, GravityOutput, Playerst, type Sign, type Simulation } from './simulation.ts';
import type { Brush } from './brush.ts';
import { rectAnd, RectSized } from './vec2.ts';

/** RendererFrame: XRES*YRES packed 0xRRGGBB pixels */
export type RendererFrame = Uint32Array;

/**
 * Simulation.cpp methods Editing.cpp calls that simulation.ts does not declare yet (agent C1 ports them under
 * these C++ names).
 */
interface SimulationCore {
  ResetNewtonianGravity(newGravIn: GravityInput, newGravOut: GravityOutput): void;
  RecalcFreeParticles(do_life_dec: boolean): void;
  FloodFillPmapCheck(x: number, y: number, type: number): boolean;
}
function core(sim: Simulation): Simulation & SimulationCore {
  return sim as Simulation & SimulationCore;
}

/** C integer division (truncation toward zero) */
function idv(a: number, b: number): number {
  return (a / b) | 0;
}

// ---- Snapshot.h ----

function copyPlayerst(dst: Playerst, src: Playerst): Playerst {
  dst.comm = src.comm;
  dst.pcomm = src.pcomm;
  dst.elem = src.elem;
  dst.legs.set(src.legs);
  dst.accs.set(src.accs);
  dst.spwn = src.spwn;
  dst.frames = src.frames;
  dst.rocketBoots = src.rocketBoots;
  dst.fan = src.fan;
  dst.spawnID = src.spawnID;
  return dst;
}

function flatF(rows: Float32Array[]): Float32Array {
  const out = new Float32Array(NCELL);
  for (let y = 0; y < YCELLS; y++) out.set(rows[y], y * XCELLS);
  return out;
}
function flatU8(rows: Uint8Array[]): Uint8Array {
  const out = new Uint8Array(NCELL);
  for (let y = 0; y < YCELLS; y++) out.set(rows[y], y * XCELLS);
  return out;
}
function unflat(rows: Float32Array[] | Uint8Array[], src: Float32Array | Uint8Array): void {
  for (let y = 0; y < YCELLS; y++) rows[y].set(src.subarray(y * XCELLS, (y + 1) * XCELLS));
}

/** simulation/Snapshot.h (Authors and Hash() are the save code's; SnapshotDelta is not ported: undo keeps whole snapshots) */
export class Snapshot {
  AirPressure: Float32Array = new Float32Array(0);
  AirVelocityX: Float32Array = new Float32Array(0);
  AirVelocityY: Float32Array = new Float32Array(0);
  AmbientHeat: Float32Array = new Float32Array(0);

  Particles: Particle[] = [];

  GravForceX: Float32Array = new Float32Array(0);
  GravForceY: Float32Array = new Float32Array(0);
  GravMass: Float32Array = new Float32Array(0);
  GravMask: Uint32Array = new Uint32Array(0);

  BlockMap: Uint8Array = new Uint8Array(0);
  ElecMap: Uint8Array = new Uint8Array(0);
  BlockAir: Uint8Array = new Uint8Array(0);
  BlockAirH: Uint8Array = new Uint8Array(0);

  FanVelocityX: Float32Array = new Float32Array(0);
  FanVelocityY: Float32Array = new Float32Array(0);

  PortalParticles: Particle[] = [];
  WirelessData: Int32Array = new Int32Array(0);
  stickmen: Playerst[] = [];
  signs: Sign[] = [];

  FrameCount = 0;
  RngState: number[] = [0, 0, 0, 0];
}

export function CreateSnapshot(sim: Simulation): Snapshot {
  const snap = new Snapshot();
  snap.AirPressure = flatF(sim.pv);
  snap.AirVelocityX = flatF(sim.vx);
  snap.AirVelocityY = flatF(sim.vy);
  snap.AmbientHeat = flatF(sim.hv);
  snap.BlockMap = flatU8(sim.bmap);
  snap.ElecMap = flatU8(sim.emap);
  snap.BlockAir = flatU8(sim.air.bmap_blockair);
  snap.BlockAirH = flatU8(sim.air.bmap_blockairh);
  snap.FanVelocityX = flatF(sim.fvx);
  snap.FanVelocityY = flatF(sim.fvy);
  for (let i = 0; i < sim.parts.active; i++) snap.Particles.push(sim.parts[i].clone());
  for (let c = 0; c < CHANNELS; c++)
    for (let a = 0; a < 8; a++)
      for (let b = 0; b < 80; b++)
        snap.PortalParticles.push(sim.portalp[c][a][b].clone());
  snap.WirelessData = new Int32Array(CHANNELS * 2);
  for (let c = 0; c < CHANNELS; c++) snap.WirelessData.set(sim.wireless[c], c * 2);
  for (let i = 0; i < MAX_FIGHTERS; i++) snap.stickmen.push(copyPlayerst(new Playerst(), sim.fighters[i]));
  snap.stickmen.push(copyPlayerst(new Playerst(), sim.player2));
  snap.stickmen.push(copyPlayerst(new Playerst(), sim.player));
  snap.GravMass = Float32Array.from(sim.gravIn.mass);
  snap.GravMask = Uint32Array.from(sim.gravIn.mask);
  snap.GravForceX = Float32Array.from(sim.gravOut.forceX);
  snap.GravForceY = Float32Array.from(sim.gravOut.forceY);
  snap.signs = sim.signs.map((s) => ({ ...s }));
  snap.FrameCount = sim.frameCount;
  snap.RngState = sim.rng.state();
  return snap;
}

export function Restore(sim: Simulation, snap: Snapshot): void {
  sim.elementCount.fill(0);
  sim.elementRecount = true;
  sim.force_stacking_check = true;
  for (let i = 0; i < NPART; i++) {
    sim.parts[i].type = 0;
  }
  unflat(sim.pv, snap.AirPressure);
  unflat(sim.vx, snap.AirVelocityX);
  unflat(sim.vy, snap.AirVelocityY);
  unflat(sim.hv, snap.AmbientHeat);
  unflat(sim.bmap, snap.BlockMap);
  unflat(sim.emap, snap.ElecMap);
  unflat(sim.air.bmap_blockair, snap.BlockAir);
  unflat(sim.air.bmap_blockairh, snap.BlockAirH);
  unflat(sim.fvx, snap.FanVelocityX);
  unflat(sim.fvy, snap.FanVelocityY);
  for (let i = 0; i < snap.Particles.length; i++) sim.parts[i].copyFrom(snap.Particles[i]);
  {
    let k = 0;
    for (let c = 0; c < CHANNELS; c++)
      for (let a = 0; a < 8; a++)
        for (let b = 0; b < 80; b++)
          sim.portalp[c][a][b].copyFrom(snap.PortalParticles[k++]);
  }
  for (let c = 0; c < CHANNELS; c++) sim.wireless[c].set(snap.WirelessData.subarray(c * 2, c * 2 + 2));
  for (let i = 0; i < snap.stickmen.length - 2; i++) copyPlayerst(sim.fighters[i], snap.stickmen[i]);
  copyPlayerst(sim.player, snap.stickmen[snap.stickmen.length - 1]);
  copyPlayerst(sim.player2, snap.stickmen[snap.stickmen.length - 2]);
  {
    const newGravIn = new GravityInput();
    const newGravOut = new GravityOutput();
    newGravIn.mass.set(snap.GravMass);
    newGravIn.mask.set(snap.GravMask);
    newGravOut.forceX.set(snap.GravForceX);
    newGravOut.forceY.set(snap.GravForceY);
    // we apply the old grav values but Newtonian gravity enable state is not part of the snapshot so this may be pointless
    // TODO: maybe track settings like Newtonian gravity enable state in the history
    core(sim).ResetNewtonianGravity(newGravIn, newGravOut);
  }
  sim.signs = snap.signs.map((s) => ({ ...s }));
  sim.frameCount = snap.FrameCount;
  sim.rng.setState(snap.RngState);
  sim.parts.active = NPART;
  core(sim).RecalcFreeParticles(false);
}

// bmap[y][x] / emap[y][x] where x may be XCELLS (clear_area's cx2): C++ indexes the flat [YCELLS][XCELLS] array,
// so bmap[y][XCELLS] is bmap[y + 1][0]. Indices past the whole array are not emulated (ignored / read as 0).
function cellGet(rows: Uint8Array[], y: number, x: number): number {
  const k = y * XCELLS + x;
  if (k < 0 || k >= NCELL) return 0;
  return rows[(k / XCELLS) | 0][k % XCELLS];
}
function cellSet(rows: Uint8Array[], y: number, x: number, v: number): void {
  const k = y * XCELLS + x;
  if (k < 0 || k >= NCELL) return;
  rows[(k / XCELLS) | 0][k % XCELLS] = v;
}

export function clear_area(sim: Simulation, area_x: number, area_y: number, area_w: number, area_h: number): void {
  const intersection = rectAnd(RectSized({ X: 0, Y: 0 }, { X: XRES, Y: YRES }), RectSized({ X: area_x, Y: area_y }, { X: area_w, Y: area_h }));
  area_x = intersection.pos.X;
  area_y = intersection.pos.Y;
  area_w = intersection.size.X;
  area_h = intersection.size.Y;
  const fx = f(area_x - 0.5), fy = f(area_y - 0.5);
  const parts = sim.parts;
  for (let i = 0; i < parts.active; i++) {
    if (parts[i].type)
      if (parts[i].x >= fx && parts[i].x <= f(f(fx + area_w) + 1) && parts[i].y >= fy && parts[i].y <= f(f(fy + area_h) + 1))
        sim.kill_part(i);
  }
  const cx1 = idv(area_x, CELL), cy1 = idv(area_y, CELL), cx2 = idv(area_x + area_w, CELL), cy2 = idv(area_y + area_h, CELL);
  for (let y = cy1; y <= cy2; y++) {
    for (let x = cx1; x <= cx2; x++) {
      if (cellGet(sim.bmap, y, x) == WL_GRAV)
        sim.gravWallChanged = true;
      cellSet(sim.bmap, y, x, 0);
      cellSet(sim.emap, y, x, 0);
    }
  }
  const signs = sim.signs;
  for (let i = signs.length - 1; i >= 0; i--) {
    if (signs[i].text.length && signs[i].x >= area_x && signs[i].y >= area_y && signs[i].x <= area_x + area_w && signs[i].y <= area_y + area_h) {
      signs.splice(i, 1);
    }
  }
}

/** simulation/Sample.h */
export class SimulationSample {
  particle = new Particle();
  ParticleID = 0;
  PositionX = 0;
  PositionY = 0;
  AirPressure = 0;
  AirTemperature = 0;
  AirVelocityX = 0;
  AirVelocityY = 0;

  WallType = 0;
  GravityVelocityX = 0;
  GravityVelocityY = 0;

  NumParts = 0;
  isMouseInSim = true;
}

export function GetSample(sim: Simulation, x: number, y: number): SimulationSample {
  const sample = new SimulationSample();
  sample.particle.type = 0;
  sample.PositionX = x;
  sample.PositionY = y;
  if (x >= 0 && x < XRES && y >= 0 && y < YRES) {
    if (sim.photons[y][x]) {
      sample.particle = sim.parts[ID(sim.photons[y][x])].clone();
      sample.ParticleID = ID(sim.photons[y][x]);
    }
    else if (sim.pmap[y][x]) {
      sample.particle = sim.parts[ID(sim.pmap[y][x])].clone();
      sample.ParticleID = ID(sim.pmap[y][x]);
    }
    const cx = (x / CELL) | 0, cy = (y / CELL) | 0;
    if (sim.bmap[cy][cx]) {
      sample.WallType = sim.bmap[cy][cx];
    }
    sample.AirPressure = sim.pv[cy][cx];
    sample.AirTemperature = sim.hv[cy][cx];
    sample.AirVelocityX = sim.vx[cy][cx];
    sample.AirVelocityY = sim.vy[cy][cx];

    if (sim.grav) {
      sample.GravityVelocityX = sim.gravOut.forceX[cy * XCELLS + cx];
      sample.GravityVelocityY = sim.gravOut.forceY[cy * XCELLS + cx];
    }
  }
  else
    sample.isMouseInSim = false;

  sample.NumParts = sim.NUM_PARTS;
  return sample;
}

export function SetDecoSpace(sim: Simulation, newDecoSpace: number): void {
  if (newDecoSpace < 0 || newDecoSpace >= NUM_DECOSPACES) {
    newDecoSpace = DECOSPACE_SRGB;
  }
  sim.deco_space = newDecoSpace;
}

export function CreateWalls(sim: Simulation, x: number, y: number, rx: number, ry: number, wall: number, cBrush: Brush | null): number {
  if (cBrush) {
    rx = cBrush.GetRadius().X;
    ry = cBrush.GetRadius().Y;
  }

  ry = idv(ry, CELL);
  rx = idv(rx, CELL);
  x = idv(x, CELL);
  y = idv(y, CELL);
  x -= rx;
  y -= ry;
  const bmap = sim.bmap;
  for (let wallX = x; wallX <= x + rx + rx; wallX++) {
    for (let wallY = y; wallY <= y + ry + ry; wallY++) {
      if (wallX >= 0 && wallX < XCELLS && wallY >= 0 && wallY < YCELLS) {
        if (wall == WL_FAN) {
          sim.fvx[wallY][wallX] = 0.0;
          sim.fvy[wallY][wallX] = 0.0;
        }
        else if (wall == WL_STREAM) {
          wallX = x + rx;
          wallY = y + ry;
          //streamlines can't be drawn next to each other
          for (let tempY = wallY - 1; tempY < wallY + 2; tempY++)
            for (let tempX = wallX - 1; tempX < wallX + 2; tempX++) {
              if (tempX >= 0 && tempX < XCELLS && tempY >= 0 && tempY < YCELLS && bmap[tempY][tempX] == WL_STREAM)
                return 1;
            }
        }
        if (wall == WL_GRAV || bmap[wallY][wallX] == WL_GRAV)
          sim.gravWallChanged = true;

        if (wall == WL_ERASEALL) {
          for (let i = 0; i < CELL; i++)
            for (let j = 0; j < CELL; j++) {
              sim.delete_part(wallX * CELL + i, wallY * CELL + j);
            }
          const signs = sim.signs;
          for (let i = signs.length - 1; i >= 0; i--)
            if (signs[i].x >= wallX * CELL && signs[i].y >= wallY * CELL && signs[i].x <= (wallX + 1) * CELL && signs[i].y <= (wallY + 1) * CELL)
              signs.splice(i, 1);
          bmap[wallY][wallX] = 0;
        }
        else
          bmap[wallY][wallX] = wall;
      }
    }
  }
  return 1;
}

export function CreateWallLine(sim: Simulation, x1: number, y1: number, x2: number, y2: number, rx: number, ry: number, wall: number, cBrush: Brush | null): void {
  let x: number, y: number;
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let e = 0.0;
  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2) {
    y = x1;
    x1 = x2;
    x2 = y;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  const de = dx ? f(dy / dx) : 0.0;
  y = y1;
  const sy = (y1 < y2) ? 1 : -1;
  for (x = x1; x <= x2; x++) {
    if (reverseXY)
      CreateWalls(sim, y, x, rx, ry, wall, cBrush);
    else
      CreateWalls(sim, x, y, rx, ry, wall, cBrush);
    e = f(e + de);
    if (e >= 0.5) {
      y += sy;
      if ((y1 < y2) ? (y <= y2) : (y >= y2)) {
        if (reverseXY)
          CreateWalls(sim, y, x, rx, ry, wall, cBrush);
        else
          CreateWalls(sim, x, y, rx, ry, wall, cBrush);
      }
      e = f(e - 1.0);
    }
  }
}

export function CreateWallBox(sim: Simulation, x1: number, y1: number, x2: number, y2: number, wall: number): void {
  let i: number, j: number;
  if (x1 > x2) {
    i = x2;
    x2 = x1;
    x1 = i;
  }
  if (y1 > y2) {
    j = y2;
    y2 = y1;
    y1 = j;
  }
  for (j = y1; j <= y2; j++)
    for (i = x1; i <= x2; i++)
      CreateWalls(sim, i, j, 0, 0, wall, null);
}

export function FloodWalls(sim: Simulation, x: number, y: number, wall: number, bm: number): number {
  let x1: number, x2: number;
  const dy = CELL;
  const bmap = sim.bmap;
  if (bm == -1) {
    if (wall == WL_ERASE || wall == WL_ERASEALL) {
      bm = bmap[idv(y, CELL)][idv(x, CELL)];
      if (!bm)
        return 0;
    }
    else
      bm = 0;
  }

  if (bmap[idv(y, CELL)][idv(x, CELL)] != bm)
    return 1;

  // go left as far as possible
  x1 = x2 = x;
  while (x1 >= CELL) {
    if (bmap[idv(y, CELL)][idv(x1 - 1, CELL)] != bm) {
      break;
    }
    x1--;
  }
  while (x2 < XRES - CELL) {
    if (bmap[idv(y, CELL)][idv(x2 + 1, CELL)] != bm) {
      break;
    }
    x2++;
  }

  // fill span
  for (x = x1; x <= x2; x++) {
    if (!CreateWalls(sim, x, y, 0, 0, wall, null))
      return 0;
  }
  // fill children
  if (y >= CELL)
    for (x = x1; x <= x2; x++)
      if (bmap[idv(y - dy, CELL)][idv(x, CELL)] == bm)
        if (!FloodWalls(sim, x, y - dy, wall, bm))
          return 0;
  if (y < YRES - CELL)
    for (x = x1; x <= x2; x++)
      if (bmap[idv(y + dy, CELL)][idv(x, CELL)] == bm)
        if (!FloodWalls(sim, x, y + dy, wall, bm))
          return 0;
  return 1;
}

export function CreatePartFlags(sim: Simulation, p: number, x: number, y: number, c: number, flags: number): number {
  if (x < 0 || y < 0 || x >= XRES || y >= YRES) {
    return 0;
  }
  const photons = sim.photons, pmap = sim.pmap, replaceModeSelected = sim.replaceModeSelected;

  if (flags & REPLACE_MODE) {
    // if replace whatever and there's something to replace
    // or replace X and there's a non-energy particle on top with type X
    // or replace X and there's an energy particle on top with type X
    if ((!replaceModeSelected && (photons[y][x] || pmap[y][x])) ||
      (!photons[y][x] && pmap[y][x] && TYP(pmap[y][x]) == replaceModeSelected) ||
      (photons[y][x] && TYP(photons[y][x]) == replaceModeSelected)) {
      if (c)
        sim.create_part(photons[y][x] ? ID(photons[y][x]) : ID(pmap[y][x]), x, y, TYP(c), ID(c));
      else
        sim.delete_part(x, y);
    }
    return 0;
  }
  else if (!c) {
    sim.delete_part(x, y);
    return 0;
  }
  else if (flags & SPECIFIC_DELETE) {
    // if delete whatever and there's something to delete
    // or delete X and there's a non-energy particle on top with type X
    // or delete X and there's an energy particle on top with type X
    if ((!replaceModeSelected && (photons[y][x] || pmap[y][x])) ||
      (!photons[y][x] && pmap[y][x] && TYP(pmap[y][x]) == replaceModeSelected) ||
      (photons[y][x] && TYP(photons[y][x]) == replaceModeSelected)) {
      sim.delete_part(x, y);
    }
    return 0;
  }
  else {
    return (sim.create_part(p, x, y, TYP(c), ID(c)) == -1) ? 1 : 0;
  }
}

// Unqualified pow() of floats in Editing.cpp is ::pow(double, double) with libstdc++ (the oracle's g++): the float
// arguments are promoted, the expression is double and rounded where it is stored into the float.
const F_0_04045 = f(0.04045), F_12_92 = f(12.92), F_0_055 = f(0.055), F_1_055 = f(1.055), F_2_4 = f(2.4);
const F_2_2 = f(2.2), F_1_8 = f(1.8), F_0_0031308 = f(0.0031308);
const INV_2_4 = f(1.0 / F_2_4), INV_2_2 = f(1.0 / F_2_2), INV_1_8 = f(1.0 / F_1_8);
function toLinearSRGB(v: number): number {
  return f((v <= F_0_04045) ? f(v / F_12_92) : Math.pow(f(f(v + F_0_055) / F_1_055), F_2_4));
}
function fromLinearSRGB(v: number): number {
  return f((v <= F_0_0031308) ? f(v * F_12_92) : (F_1_055 * Math.pow(v, INV_2_4) - F_0_055));
}

export function ApplyDecoration(sim: Simulation, x: number, y: number, colR_: number, colG_: number, colB_: number, colA_: number, mode: number): void {
  let rp: number;
  let tr: number, tg: number, tb: number, ta: number;
  let colR = colR_, colG = colG_, colB = colB_, colA = colA_;
  const strength = f(0.01);
  const parts = sim.parts, pmap = sim.pmap;
  rp = pmap[y][x];
  if (!rp)
    rp = sim.photons[y][x];
  if (!rp)
    return;

  ta = (parts[ID(rp)].dcolour >>> 24) & 0xFF;
  tr = (parts[ID(rp)].dcolour >>> 16) & 0xFF;
  tg = (parts[ID(rp)].dcolour >>> 8) & 0xFF;
  tb = (parts[ID(rp)].dcolour) & 0xFF;

  ta = f(ta / 255.0); tr = f(tr / 255.0); tg = f(tg / 255.0); tb = f(tb / 255.0);
  colR = f(colR / 255.0); colG = f(colG / 255.0); colB = f(colB / 255.0); colA = f(colA / 255.0);

  if (mode == DECO_DRAW) {
    ta = colA;
    tr = colR;
    tg = colG;
    tb = colB;
  }
  else if (mode == DECO_CLEAR) {
    ta = tr = tg = tb = 0.0;
  }
  else if (mode == DECO_ADD) {
    //ta += (colA*strength)*colA;
    tr = f(tr + f(f(colR * strength) * colA));
    tg = f(tg + f(f(colG * strength) * colA));
    tb = f(tb + f(f(colB * strength) * colA));
  }
  else if (mode == DECO_SUBTRACT) {
    //ta -= (colA*strength)*colA;
    tr = f(tr - f(f(colR * strength) * colA));
    tg = f(tg - f(f(colG * strength) * colA));
    tb = f(tb - f(f(colB * strength) * colA));
  }
  else if (mode == DECO_MULTIPLY) {
    tr = f(tr * f(1.0 + f(f(colR * strength) * colA)));
    tg = f(tg * f(1.0 + f(f(colG * strength) * colA)));
    tb = f(tb * f(1.0 + f(f(colB * strength) * colA)));
  }
  else if (mode == DECO_DIVIDE) {
    tr = f(tr / f(1.0 + f(f(colR * strength) * colA)));
    tg = f(tg / f(1.0 + f(f(colG * strength) * colA)));
    tb = f(tb / f(1.0 + f(f(colB * strength) * colA)));
  }
  else if (mode == DECO_SMUDGE) {
    if (x >= CELL && x < XRES - CELL && y >= CELL && y < YRES - CELL) {
      let tas = 0.0, trs = 0.0, tgs = 0.0, tbs = 0.0;

      let rx: number, ry: number;
      let num = 0;
      for (rx = -2; rx < 3; rx++)
        for (ry = -2; ry < 3; ry++) {
          if (Math.abs(rx) + Math.abs(ry) > 2 && TYP(pmap[y + ry][x + rx]) && parts[ID(pmap[y + ry][x + rx])].dcolour) {
            const part = parts[ID(pmap[y + ry][x + rx])];
            num = f(num + 1.0);
            let pa = f(((part.dcolour >>> 24) & 0xFF) / 255.0);
            let pr = f(((part.dcolour >>> 16) & 0xFF) / 255.0);
            let pg = f(((part.dcolour >>> 8) & 0xFF) / 255.0);
            let pb = f(((part.dcolour) & 0xFF) / 255.0);
            switch (sim.deco_space) {
              case DECOSPACE_SRGB:
                pa = toLinearSRGB(pa);
                pr = toLinearSRGB(pr);
                pg = toLinearSRGB(pg);
                pb = toLinearSRGB(pb);
                break;

              case DECOSPACE_LINEAR:
                break;

              case DECOSPACE_GAMMA22:
                pa = f(Math.pow(pa, F_2_2));
                pr = f(Math.pow(pr, F_2_2));
                pg = f(Math.pow(pg, F_2_2));
                pb = f(Math.pow(pb, F_2_2));
                break;

              case DECOSPACE_GAMMA18:
                pa = f(Math.pow(pa, F_1_8));
                pr = f(Math.pow(pr, F_1_8));
                pg = f(Math.pow(pg, F_1_8));
                pb = f(Math.pow(pb, F_1_8));
                break;
            }
            tas = f(tas + pa);
            trs = f(trs + pr);
            tgs = f(tgs + pg);
            tbs = f(tbs + pb);
          }
        }
      if (num == 0)
        return;
      ta = f(tas / num);
      tr = f(trs / num);
      tg = f(tgs / num);
      tb = f(tbs / num);
      switch (sim.deco_space) {
        case DECOSPACE_SRGB:
          ta = fromLinearSRGB(ta);
          tr = fromLinearSRGB(tr);
          tg = fromLinearSRGB(tg);
          tb = fromLinearSRGB(tb);
          break;

        case DECOSPACE_LINEAR:
          break;

        case DECOSPACE_GAMMA22:
          ta = f(Math.pow(ta, INV_2_2));
          tr = f(Math.pow(tr, INV_2_2));
          tg = f(Math.pow(tg, INV_2_2));
          tb = f(Math.pow(tb, INV_2_2));
          break;

        case DECOSPACE_GAMMA18:
          ta = f(Math.pow(ta, INV_1_8));
          tr = f(Math.pow(tr, INV_1_8));
          tg = f(Math.pow(tg, INV_1_8));
          tb = f(Math.pow(tb, INV_1_8));
          break;
      }
      if (!parts[ID(rp)].dcolour)
        ta = f(ta - f(3 / 255.0));
    }
  }

  ta = f(ta * 255.0); tr = f(tr * 255.0); tg = f(tg * 255.0); tb = f(tb * 255.0);
  ta = f(ta + 0.5); tr = f(tr + 0.5); tg = f(tg + 0.5); tb = f(tb + 0.5);

  // int(float): out of range (or NaN) is undefined in C++; x86 gives INT_MIN, which the clamps below turn into 0
  const toInt = (v: number): number => (v >= -2147483648 && v < 2147483648) ? itrunc(v) : -2147483648;
  colA_ = toInt(ta);
  colR_ = toInt(tr);
  colG_ = toInt(tg);
  colB_ = toInt(tb);

  if (colA_ > 255)
    colA_ = 255;
  else if (colA_ < 0)
    colA_ = 0;
  if (colR_ > 255)
    colR_ = 255;
  else if (colR_ < 0)
    colR_ = 0;
  if (colG_ > 255)
    colG_ = 255;
  else if (colG_ < 0)
    colG_ = 0;
  if (colB_ > 255)
    colB_ = 255;
  else if (colB_ < 0)
    colB_ = 0;
  parts[ID(rp)].dcolour = ((colA_ << 24) | (colR_ << 16) | (colG_ << 8) | colB_);
}

export function ApplyDecorationPoint(sim: Simulation, positionX: number, positionY: number, colR: number, colG: number, colB: number, colA: number, mode: number, cBrush: Brush): void {
  for (const off of cBrush) {
    const cx = positionX + off.X, cy = positionY + off.Y;
    if (cx >= 0 && cy >= 0 && cx < XRES && cy < YRES)
      ApplyDecoration(sim, cx, cy, colR, colG, colB, colA, mode);
  }
}

export function ApplyDecorationLine(sim: Simulation, x1: number, y1: number, x2: number, y2: number, colR: number, colG: number, colB: number, colA: number, mode: number, cBrush: Brush): void {
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let x: number, y: number;
  let e = 0.0;

  const rx = cBrush.GetRadius().X;
  const ry = cBrush.GetRadius().Y;

  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2) {
    y = x1;
    x1 = x2;
    x2 = y;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  const de = dx ? f(dy / dx) : 0.0;
  y = y1;
  const sy = (y1 < y2) ? 1 : -1;
  for (x = x1; x <= x2; x++) {
    if (reverseXY)
      ApplyDecorationPoint(sim, y, x, colR, colG, colB, colA, mode, cBrush);
    else
      ApplyDecorationPoint(sim, x, y, colR, colG, colB, colA, mode, cBrush);
    e = f(e + de);
    if (e >= 0.5) {
      y += sy;
      if (!(rx + ry)) {
        if (reverseXY)
          ApplyDecorationPoint(sim, y, x, colR, colG, colB, colA, mode, cBrush);
        else
          ApplyDecorationPoint(sim, x, y, colR, colG, colB, colA, mode, cBrush);
      }
      e = f(e - 1.0);
    }
  }
}

export function ApplyDecorationBox(sim: Simulation, x1: number, y1: number, x2: number, y2: number, colR: number, colG: number, colB: number, colA: number, mode: number): void {
  let i: number, j: number;

  if (x1 > x2) {
    i = x2;
    x2 = x1;
    x1 = i;
  }
  if (y1 > y2) {
    j = y2;
    y2 = y1;
    y1 = j;
  }
  for (j = y1; j <= y2; j++)
    for (i = x1; i <= x2; i++)
      ApplyDecoration(sim, i, j, colR, colG, colB, colA, mode);
}

export function ColorCompare(_sim: Simulation, frame: RendererFrame, x: number, y: number, replaceR: number, replaceG: number, replaceB: number): boolean {
  const pix = frame[x + y * XRES] & 0xFFFFFF;
  const r = (pix >>> 16) & 0xFF;
  const g = (pix >>> 8) & 0xFF;
  const b = pix & 0xFF;
  const diff = Math.abs(replaceR - r) + Math.abs(replaceG - g) + Math.abs(replaceB - b);
  return diff < 15;
}

/** Simulation.h CoordStack */
class CoordStack {
  private stack = new Uint16Array(XRES * YRES * 2);
  private stack_size = 0;
  private static readonly stack_limit = XRES * YRES;
  push(x: number, y: number): void {
    if (this.stack_size >= CoordStack.stack_limit)
      throw new Error('Maximum number of entries in the coordinate stack was exceeded');
    this.stack[this.stack_size * 2] = x;
    this.stack[this.stack_size * 2 + 1] = y;
    this.stack_size++;
  }
  /** pop(int &x, int &y): returns [x, y] */
  pop(): [number, number] {
    this.stack_size--;
    return [this.stack[this.stack_size * 2], this.stack[this.stack_size * 2 + 1]];
  }
  getSize(): number { return this.stack_size; }
  clear(): void { this.stack_size = 0; }
}
let coordStack: CoordStack | null = null;
function getCoordStackSingleton(): CoordStack {
  if (!coordStack) coordStack = new CoordStack();
  return coordStack;
}

export function ApplyDecorationFill(sim: Simulation, frame: RendererFrame, x: number, y: number, colR: number, colG: number, colB: number, colA: number, replaceR: number, replaceG: number, replaceB: number): void {
  let x1: number, x2: number;
  const bitmap = new Uint8Array(XRES * YRES); //Bitmap for checking

  if (!ColorCompare(sim, frame, x, y, replaceR, replaceG, replaceB)) {
    return;
  }

  try {
    const cs = getCoordStackSingleton();
    cs.clear();

    cs.push(x, y);
    do {
      [x, y] = cs.pop();
      x1 = x2 = x;
      // go left as far as possible
      while (x1 > 0) {
        if (bitmap[(x1 - 1) + y * XRES] || !ColorCompare(sim, frame, x1 - 1, y, replaceR, replaceG, replaceB)) {
          break;
        }
        x1--;
      }
      // go right as far as possible
      while (x2 < XRES - 1) {
        // (sic) the original tests bitmap at x1+1, not x2+1
        if (bitmap[(x1 + 1) + y * XRES] || !ColorCompare(sim, frame, x2 + 1, y, replaceR, replaceG, replaceB)) {
          break;
        }
        x2++;
      }
      // fill span
      for (x = x1; x <= x2; x++) {
        ApplyDecoration(sim, x, y, colR, colG, colB, colA, DECO_DRAW);
        bitmap[x + y * XRES] = 1;
      }

      if (y >= 1)
        for (x = x1; x <= x2; x++)
          if (!bitmap[x + (y - 1) * XRES] && ColorCompare(sim, frame, x, y - 1, replaceR, replaceG, replaceB))
            cs.push(x, y - 1);

      if (y < YRES - 1)
        for (x = x1; x <= x2; x++)
          if (!bitmap[x + (y + 1) * XRES] && ColorCompare(sim, frame, x, y + 1, replaceR, replaceG, replaceB))
            cs.push(x, y + 1);
    } while (cs.getSize() > 0);
  }
  catch (e) {
    console.error((e as Error).message);
    return;
  }
}

/** int CreateParts(int p, int positionX, int positionY, int c, Brush const &cBrush, int flags) */
export function CreateParts(sim: Simulation, p: number, positionX: number, positionY: number, c: number, cBrush: Brush, flags = -1): number {
  if (flags == -1)
    flags = sim.replaceModeFlags;
  const radiusX = cBrush.GetRadius().X, radiusY = cBrush.GetRadius().Y;

  // special case for LIGH
  if (c == PT_LIGH) {
    if (sim.currentTick < sim.lightningRecreate)
      return 1;
    let newlife = radiusX + radiusY;
    if (newlife > 55)
      newlife = 55;
    c = PMAP(newlife, c);
    sim.lightningRecreate = sim.currentTick + Math.max((newlife / 4) | 0, 1);
    return CreatePartFlags(sim, p, positionX, positionY, c, flags);
  }
  else if (c == PT_TESC) {
    let newtmp = (radiusX * 4 + radiusY * 4 + 7);
    if (newtmp > 300)
      newtmp = 300;
    c = PMAP(newtmp, c);
  }

  for (const off of cBrush) {
    const cx = positionX + off.X, cy = positionY + off.Y;
    if (cx >= 0 && cy >= 0 && cx < XRES && cy < YRES)
      CreatePartFlags(sim, p, cx, cy, c, flags);
  }
  return 0;
}

/** int CreateParts(int p, int x, int y, int rx, int ry, int c, int flags) */
export function CreatePartsRect(sim: Simulation, p: number, x: number, y: number, rx: number, ry: number, c: number, flags = -1): number {
  let created = false;

  if (flags == -1)
    flags = sim.replaceModeFlags;

  // special case for LIGH
  if (c == PT_LIGH) {
    if (sim.currentTick < sim.lightningRecreate)
      return 1;
    let newlife = rx + ry;
    if (newlife > 55)
      newlife = 55;
    c = PMAP(newlife, c);
    sim.lightningRecreate = sim.currentTick + Math.max((newlife / 4) | 0, 1);
    rx = ry = 0;
  }
  else if (c == PT_TESC) {
    let newtmp = (rx * 4 + ry * 4 + 7);
    if (newtmp > 300)
      newtmp = 300;
    c = PMAP(newtmp, c);
  }

  for (let j = -ry; j <= ry; j++)
    for (let i = -rx; i <= rx; i++)
      if (CreatePartFlags(sim, p, x + i, y + j, c, flags))
        created = true;
  return created ? 0 : 1;
}

/** void CreateLine(int x1, int y1, int x2, int y2, int c, Brush const &cBrush, int flags) */
export function CreateLine(sim: Simulation, x1: number, y1: number, x2: number, y2: number, c: number, cBrush: Brush, flags = -1): void {
  let x: number, y: number;
  const rx = cBrush.GetRadius().X, ry = cBrush.GetRadius().Y;
  const reverseXY = Math.abs(y2 - y1) > Math.abs(x2 - x1);
  let e = 0.0;
  if (reverseXY) {
    y = x1;
    x1 = y1;
    y1 = y;
    y = x2;
    x2 = y2;
    y2 = y;
  }
  if (x1 > x2) {
    y = x1;
    x1 = x2;
    x2 = y;
    y = y1;
    y1 = y2;
    y2 = y;
  }
  const dx = x2 - x1;
  const dy = Math.abs(y2 - y1);
  const de = dx ? f(dy / dx) : 0.0;
  y = y1;
  const sy = (y1 < y2) ? 1 : -1;
  for (x = x1; x <= x2; x++) {
    if (reverseXY)
      CreateParts(sim, -2, y, x, c, cBrush, flags);
    else
      CreateParts(sim, -2, x, y, c, cBrush, flags);
    e = f(e + de);
    if (e >= 0.5) {
      y += sy;
      if (!(rx + ry) && ((y1 < y2) ? (y <= y2) : (y >= y2))) {
        if (reverseXY)
          CreateParts(sim, -2, y, x, c, cBrush, flags);
        else
          CreateParts(sim, -2, x, y, c, cBrush, flags);
      }
      e = f(e - 1.0);
    }
  }
}

export function CreateBox(sim: Simulation, p: number, x1: number, y1: number, x2: number, y2: number, c: number, flags = -1): void {
  let i: number, j: number;
  if (x1 > x2) {
    i = x2;
    x2 = x1;
    x1 = i;
  }
  if (y1 > y2) {
    j = y2;
    y2 = y1;
    y1 = j;
  }
  for (j = y2; j >= y1; j--)
    for (i = x1; i <= x2; i++)
      CreatePartsRect(sim, p, i, j, 0, 0, c, flags);
}

export function FloodParts(sim: Simulation, x: number, y: number, fullc: number, cm: number, flags = -1): number {
  const c = TYP(fullc);
  let x1: number, x2: number;
  const dy = (c < PT_NUM) ? 1 : CELL;
  const coord_stack_limit = XRES * YRES;
  let coord_stack_size = 0;
  let created_something = 0;
  const pmap = sim.pmap, photons = sim.photons;
  const csim = core(sim);

  // Bitmap for checking where we've already looked
  const bitmap = new Uint8Array(XRES * YRES);

  if (cm == -1) {
    //if initial flood point is out of bounds, do nothing
    if (c != 0 && (x < CELL || x >= XRES - CELL || y < CELL || y >= YRES - CELL || c == PT_SPRK))
      return 1;
    else if (x < 0 || x >= XRES || y < 0 || y >= YRES)
      return 1;

    if (c == 0) {
      cm = TYP(pmap[y][x]);
      if (!cm) {
        cm = TYP(photons[y][x]);
        if (!cm) {
          if (sim.bmap[idv(y, CELL)][idv(x, CELL)])
            return FloodWalls(sim, x, y, WL_ERASE, -1);
          else
            return -1;
        }
      }
    }
    else
      cm = 0;
  }

  if (c != 0 && sim.IsWallBlocking(x, y, c))
    return 1;

  if (!csim.FloodFillPmapCheck(x, y, cm))
    return 1;

  // unsigned short coord_stack[coord_stack_limit][2]
  const coord_stack = new Uint16Array(coord_stack_limit * 2);
  coord_stack[coord_stack_size * 2] = x;
  coord_stack[coord_stack_size * 2 + 1] = y;
  coord_stack_size++;

  const elements = sd.elements;
  do {
    coord_stack_size--;
    x = coord_stack[coord_stack_size * 2];
    y = coord_stack[coord_stack_size * 2 + 1];
    x1 = x2 = x;
    // go left as far as possible
    while (c ? x1 > CELL : x1 > 0) {
      if (bitmap[(y * XRES) + x1 - 1] || !csim.FloodFillPmapCheck(x1 - 1, y, cm) || (c != 0 && sim.IsWallBlocking(x1 - 1, y, c))) {
        break;
      }
      x1--;
    }
    // go right as far as possible
    while (c ? x2 < XRES - CELL - 1 : x2 < XRES - 1) {
      if (bitmap[(y * XRES) + x2 + 1] || !csim.FloodFillPmapCheck(x2 + 1, y, cm) || (c != 0 && sim.IsWallBlocking(x2 + 1, y, c))) {
        break;
      }
      x2++;
    }
    // fill span
    for (x = x1; x <= x2; x++) {
      if (!fullc) {
        if (elements[cm].Properties & TYPE_ENERGY) {
          if (photons[y][x]) {
            sim.kill_part(ID(photons[y][x]));
            created_something = 1;
          }
        }
        else if (pmap[y][x]) {
          sim.kill_part(ID(pmap[y][x]));
          created_something = 1;
        }
      }
      else if (CreatePartsRect(sim, -2, x, y, 0, 0, fullc, flags))
        created_something = 1;
      bitmap[(y * XRES) + x] = 1;
    }

    if (c ? y >= CELL + dy : y >= dy)
      for (x = x1; x <= x2; x++)
        if (!bitmap[((y - dy) * XRES) + x] && csim.FloodFillPmapCheck(x, y - dy, cm) && (c == 0 || !sim.IsWallBlocking(x, y - dy, c))) {
          coord_stack[coord_stack_size * 2] = x;
          coord_stack[coord_stack_size * 2 + 1] = y - dy;
          coord_stack_size++;
          if (coord_stack_size >= coord_stack_limit) {
            return -1;
          }
        }

    if (c ? y < YRES - CELL - dy : y < YRES - dy)
      for (x = x1; x <= x2; x++)
        if (!bitmap[((y + dy) * XRES) + x] && csim.FloodFillPmapCheck(x, y + dy, cm) && (c == 0 || !sim.IsWallBlocking(x, y + dy, c))) {
          coord_stack[coord_stack_size * 2] = x;
          coord_stack[coord_stack_size * 2 + 1] = y + dy;
          coord_stack_size++;
          if (coord_stack_size >= coord_stack_limit) {
            return -1;
          }
        }
  } while (coord_stack_size > 0);
  return created_something;
}
