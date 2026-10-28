// common/shipshape.c (the client's part): parsing ship shape strings, the default ship, rotating
// points into all RES directions with the trig tables, Convert_ship_2_string, the shield radius.
import { ABS, f32, scanIntPair, sprintf, isdigit, islower, isupper, onReset } from './cutil.ts';
import { RES, MSG_LEN, CLICK } from './consts.ts';
import { tcos, tsin } from './xpmath.ts';

export interface clpos_t { cx: number; cy: number }
/** types.h position_t: floats */
export interface position_t { x: number; y: number }
interface ipos_t { x: number; y: number }

export const MIN_SHIP_PTS = 3, MAX_SHIP_PTS = 24, MAX_SHIP_PTS2 = MAX_SHIP_PTS * 2;
export const MAX_GUN_PTS = 3, MAX_LIGHT_PTS = 3, MAX_RACK_PTS = 4;

export interface shipshape_t {
  pts: clpos_t[][];
  num_points: number;
  num_orig_points: number;
  engine: clpos_t[];
  m_gun: clpos_t[];
  num_l_gun: number; num_r_gun: number; num_l_rgun: number; num_r_rgun: number;
  l_gun: clpos_t[][]; r_gun: clpos_t[][]; l_rgun: clpos_t[][]; r_rgun: clpos_t[][];
  num_l_light: number; num_r_light: number;
  l_light: clpos_t[][]; r_light: clpos_t[][];
  num_m_rack: number;
  m_rack: clpos_t[][];
  shield_radius: number;
}

const rot = (): clpos_t[] => Array.from({ length: RES }, () => ({ cx: 0, cy: 0 }));

function emptyShip(): shipshape_t {
  return {
    pts: [], num_points: 0, num_orig_points: 0, engine: rot(), m_gun: rot(),
    num_l_gun: 0, num_r_gun: 0, num_l_rgun: 0, num_r_rgun: 0, l_gun: [], r_gun: [], l_rgun: [], r_rgun: [],
    num_l_light: 0, num_r_light: 0, l_light: [], r_light: [], num_m_rack: 0, m_rack: [], shield_radius: 0,
  };
}

const ipos2clpos = (p: ipos_t): clpos_t => ({ cx: p.x << 6, cy: p.y << 6 });
/** clpos2position: CLICK_TO_FLOAT into float members */
export const clpos2position = (pt: clpos_t): position_t => ({ x: f32(pt.cx * (1.0 / CLICK)), y: f32(pt.cy * (1.0 / CLICK)) });

export function Rotate_point(pt: clpos_t[]): void {
  for (let i = 1; i < RES; i++) {
    const cx = tcos(i) * pt[0].cx - tsin(i) * pt[0].cy;
    const cy = tsin(i) * pt[0].cx + tcos(i) * pt[0].cy;
    pt[i].cx = Math.trunc(cx >= 0.0 ? cx + 0.5 : cx - 0.5);
    pt[i].cy = Math.trunc(cy >= 0.0 ? cy + 0.5 : cy - 0.5);
  }
}

/** Rotate_position: float members, computed in double */
export function Rotate_position(pt: position_t[]): void {
  for (let i = 1; i < RES; i++) {
    pt[i].x = f32(tcos(i) * pt[0].x - tsin(i) * pt[0].y);
    pt[i].y = f32(tsin(i) * pt[0].x + tcos(i) * pt[0].y);
  }
}

function Rotate_ship(ship: shipshape_t): void {
  for (let i = 0; i < ship.num_points; i++) Rotate_point(ship.pts[i]);
  Rotate_point(ship.engine);
  Rotate_point(ship.m_gun);
  for (let i = 0; i < ship.num_l_gun; i++) Rotate_point(ship.l_gun[i]);
  for (let i = 0; i < ship.num_r_gun; i++) Rotate_point(ship.r_gun[i]);
  for (let i = 0; i < ship.num_l_rgun; i++) Rotate_point(ship.l_rgun[i]);
  for (let i = 0; i < ship.num_r_rgun; i++) Rotate_point(ship.r_rgun[i]);
  for (let i = 0; i < ship.num_l_light; i++) Rotate_point(ship.l_light[i]);
  for (let i = 0; i < ship.num_r_light; i++) Rotate_point(ship.r_light[i]);
  for (let i = 0; i < ship.num_m_rack; i++) Rotate_point(ship.m_rack[i]);
}

let defaultShip: shipshape_t | null = null;

export function Default_ship(): shipshape_t {
  if (!defaultShip) {
    const sh = emptyShip();
    sh.num_points = 3;
    const set = (a: clpos_t[], x: number, y: number) => { a[0] = ipos2clpos({ x, y }); };
    sh.pts = [rot(), rot(), rot()];
    set(sh.pts[0], 14, 0);
    set(sh.pts[1], -8, 8);
    set(sh.pts[2], -8, -8);
    set(sh.engine, -8, 0);
    set(sh.m_gun, 14, 0);
    sh.num_l_light = 1;
    sh.l_light = [rot()];
    set(sh.l_light[0], -8, 8);
    sh.num_r_light = 1;
    sh.r_light = [rot()];
    set(sh.r_light[0], -8, -8);
    sh.num_m_rack = 1;
    sh.m_rack = [rot()];
    set(sh.m_rack[0], 14, 0);
    Rotate_ship(sh);
    defaultShip = sh;
  }
  return defaultShip;
}

/** a new client run: the default ship is built again (its shield radius is set by the client) */
export function resetShipshape(): void {
  defaultShip = null;
}

// ---------------------------------------------------------------- parsing

const SHAPE_KEYS = ['shape:', 'mainGun:', 'leftGun:', 'rightGun:', 'leftLight:', 'rightLight:', 'engine:', 'missileRack:', 'name:', 'author:', 'leftRearGun:', 'rightRearGun:'];
const ABBREV_KEYS = ['SH:', 'MG:', 'LG:', 'RG:', 'LL:', 'RL:', 'EN:', 'MR:', 'NM:', 'AU:', 'LR:', 'RR:'];

function Get_shape_keyword(keyw: string): number {
  let i: number;
  if (islower(keyw[0])) {
    for (i = 0; i < SHAPE_KEYS.length; i++) if (keyw === SHAPE_KEYS[i]) break;
  } else if (isupper(keyw[0])) {
    for (i = 0; i < ABBREV_KEYS.length; i++) if (keyw === ABBREV_KEYS[i]) break;
  } else i = -1;
  return i;
}

let verboseShapeParsing = false;
let shapeLimits = true;
onReset(() => {
  defaultShip = null;
  verboseShapeParsing = false;
  shapeLimits = true;
});
const debugShapeParsing = false;

/** C's loop of sscanf(teststr, "%d,%d") over a keyword's points (strchr(' ') to the next one) */
function scanAll(s: string | null): ipos_t[] {
  const out: ipos_t[] = [];
  while (s !== null) {
    let k = 0;
    while (s[k] === ' ') k++;
    s = s.slice(k);
    const p = scanIntPair(s);
    if (!p) break;
    out.push({ x: p[0], y: p[1] });
    const sp = s.indexOf(' ');
    s = sp < 0 ? null : s.slice(sp);
  }
  return out;
}

/** the points of a keyword, as many as fit */
function addPoints(teststr: string, have: ipos_t[], max: number): void {
  for (const p of scanAll(teststr)) if (have.length < max) have.push(p);
}

function shape2wire(str0: string, ship: shipshape_t): number {
  const pt: ipos_t[] = [];
  let in_: ipos_t = { x: 0, y: 0 }, old_in: ipos_t = { x: 0, y: 0 };
  let engine: ipos_t = { x: 0, y: 0 }, m_gun: ipos_t = { x: 0, y: 0 };
  const l_light: ipos_t[] = [], r_light: ipos_t[] = [], l_gun: ipos_t[] = [], r_gun: ipos_t[] = [];
  const l_rgun: ipos_t[] = [], r_rgun: ipos_t[] = [], m_rack: ipos_t[] = [];
  let mainGunSet = false, engineSet = false;
  let shape_version = 0;
  Object.assign(ship, emptyShip());
  let pos = 0;
  for (;;) {
    const open = str0.indexOf('(', pos);
    if (open < 0) break;
    let str = str0.slice(open + 1);
    if (shape_version === 0) {
      if (isdigit(str[0])) return -1;
      shape_version = 0x3200;
    }
    // the keyword, up to and with its colon, at most 19 characters
    let i = 0;
    let keyw = '';
    for (; i < str.length; i++) {
      if (i === 19) break;
      keyw += str[i];
      if (str[i] === ':') break;
    }
    if (str[i] !== ':') {
      pos = open + 1;
      continue;
    }
    // the value, up to the closing parenthesis
    i++;
    let j = i;
    while (j < str.length && str[j] !== ')') j++;
    const teststr = str.slice(i, j);
    str = str.slice(j < str.length ? j + 1 : j);
    pos = str0.length - str.length;
    switch (Get_shape_keyword(keyw)) {
      case 0: {
        for (const p of scanAll(teststr)) {
          in_ = p;
          if (ship.num_points < MAX_SHIP_PTS) {
            // a point equal to the one before is an edge of length 0: left out
            if (!(ship.num_points > 0 && old_in.x === in_.x && old_in.y === in_.y)) {
              pt[ship.num_points++] = in_;
              old_in = in_;
            }
          }
        }
        if (ship.num_points > 0 && pt[ship.num_points - 1].x === pt[0].x && pt[ship.num_points - 1].y === pt[0].y) ship.num_points--;
        break;
      }
      case 1: {
        if (mainGunSet) break;
        const p = scanIntPair(teststr.replace(/^ +/, ''));
        if (p) { m_gun = { x: p[0], y: p[1] }; mainGunSet = true; }
        break;
      }
      case 2: addPoints(teststr, l_gun, MAX_GUN_PTS); ship.num_l_gun = l_gun.length; break;
      case 3: addPoints(teststr, r_gun, MAX_GUN_PTS); ship.num_r_gun = r_gun.length; break;
      case 4: addPoints(teststr, l_light, MAX_LIGHT_PTS); ship.num_l_light = l_light.length; break;
      case 5: addPoints(teststr, r_light, MAX_LIGHT_PTS); ship.num_r_light = r_light.length; break;
      case 6: {
        if (engineSet) break;
        const p = scanIntPair(teststr.replace(/^ +/, ''));
        if (p) { engine = { x: p[0], y: p[1] }; engineSet = true; }
        break;
      }
      case 7: addPoints(teststr, m_rack, MAX_RACK_PTS); ship.num_m_rack = m_rack.length; break;
      case 10: addPoints(teststr, l_rgun, MAX_GUN_PTS); ship.num_l_rgun = l_rgun.length; break;
      case 11: addPoints(teststr, r_rgun, MAX_GUN_PTS); ship.num_r_rgun = r_rgun.length; break;
      default: break;
    }
  }
  if (ship.num_points < 3) return -1;
  let max: number;
  if (!mainGunSet) {
    max = 0;
    for (let i = 1; i < ship.num_points; i++) {
      if (pt[i].x > pt[max].x || (pt[i].x === pt[max].x && ABS(pt[i].y) < ABS(pt[max].y))) max = i;
    }
    m_gun = pt[max];
    mainGunSet = true;
  }
  if (!ship.num_l_light) {
    max = 0;
    for (let i = 1; i < ship.num_points; i++) if (pt[i].y > pt[max].y || (pt[i].y === pt[max].y && pt[i].x <= pt[max].x)) max = i;
    l_light[0] = pt[max];
    ship.num_l_light = 1;
  }
  if (!ship.num_r_light) {
    max = 0;
    for (let i = 1; i < ship.num_points; i++) if (pt[i].y < pt[max].y || (pt[i].y === pt[max].y && pt[i].x <= pt[max].x)) max = i;
    r_light[0] = pt[max];
    ship.num_r_light = 1;
  }
  if (!engineSet) {
    max = 0;
    for (let i = 1; i < ship.num_points; i++) if (pt[i].x < pt[max].x) max = i;
    engine = { x: pt[max].x, y: 0 };
    engineSet = true;
  }
  if (!ship.num_m_rack) {
    m_rack[0] = m_gun;
    ship.num_m_rack = 1;
  }
  if (shapeLimits && !checkLimits(ship, pt, m_gun, engine, l_gun, r_gun, l_rgun, r_rgun, m_rack, l_light, r_light)) return -1;
  ship.num_orig_points = ship.num_points;
  const mk = (n: number) => Array.from({ length: n }, rot);
  ship.pts = mk(ship.num_points);
  ship.l_gun = mk(ship.num_l_gun); ship.r_gun = mk(ship.num_r_gun);
  ship.l_rgun = mk(ship.num_l_rgun); ship.r_rgun = mk(ship.num_r_rgun);
  ship.l_light = mk(ship.num_l_light); ship.r_light = mk(ship.num_r_light);
  ship.m_rack = mk(ship.num_m_rack);
  for (let i = 0; i < ship.num_points; i++) ship.pts[i][0] = ipos2clpos(pt[i]);
  ship.engine[0] = ipos2clpos(engine);
  ship.m_gun[0] = ipos2clpos(m_gun);
  for (let i = 0; i < ship.num_l_gun; i++) ship.l_gun[i][0] = ipos2clpos(l_gun[i]);
  for (let i = 0; i < ship.num_r_gun; i++) ship.r_gun[i][0] = ipos2clpos(r_gun[i]);
  for (let i = 0; i < ship.num_l_rgun; i++) ship.l_rgun[i][0] = ipos2clpos(l_rgun[i]);
  for (let i = 0; i < ship.num_r_rgun; i++) ship.r_rgun[i][0] = ipos2clpos(r_rgun[i]);
  for (let i = 0; i < ship.num_l_light; i++) ship.l_light[i][0] = ipos2clpos(l_light[i]);
  for (let i = 0; i < ship.num_r_light; i++) ship.r_light[i][0] = ipos2clpos(r_light[i]);
  for (let i = 0; i < ship.num_m_rack; i++) ship.m_rack[i][0] = ipos2clpos(m_rack[i]);
  Rotate_ship(ship);
  return 0;
}

function checkLimits(ship: shipshape_t, pt: ipos_t[], m_gun: ipos_t, engine: ipos_t, l_gun: ipos_t[], r_gun: ipos_t[],
  l_rgun: ipos_t[], r_rgun: ipos_t[], m_rack: ipos_t[], l_light: ipos_t[], r_light: ipos_t[]): boolean {
  const isLow = -8, isHi = 8, isLeft = 8, isRight = -8, minLow = 1, minHi = 1, minLeft = 1, minRight = 1;
  const horMax = 15, verMax = 15, horMin = -15, verMin = -15, minCount = 3, minSize = 22 + 16;
  let low = 0, hi = 0, left = 0, right = 0, count = 0, lowest = 0, highest = 0, leftmost = 0, rightmost = 0, max = 0;
  for (let i = 0; i < ship.num_points; i++) {
    const x = pt[i].x, y = pt[i].y;
    let change = 0;
    if (y >= isLeft) { change++; left++; if (y > leftmost) leftmost = y; }
    if (y <= isRight) { change++; right++; if (y < rightmost) rightmost = y; }
    if (x <= isLow) { change++; low++; if (x < lowest) lowest = x; }
    if (x >= isHi) { change++; hi++; if (x > highest) highest = x; }
    if (change) count++;
    if (y > horMax || y < horMin) max++;
    if (x > verMax || x < verMin) max++;
  }
  if (low < minLow || hi < minHi || left < minLeft || right < minRight || count < minCount) {
    if (verboseShapeParsing) warn(`Ship shape does not meet size requirements (${low},${hi},${left},${right},${count})`);
    return false;
  }
  if (max) { if (verboseShapeParsing) warn('Ship shape exceeds size maxima.'); return false; }
  if (leftmost - rightmost + highest - lowest < minSize) { if (verboseShapeParsing) warn('Ship shape is not big enough.'); return false; }
  // the width against the longest axis
  let dist = 0, p0 = 0, p1 = 0;
  for (let i = 0; i < ship.num_points; i++) {
    for (let j = i + 1; j < ship.num_points; j++) {
      const d = (pt[i].x - pt[j].x) * (pt[i].x - pt[j].x) + (pt[i].y - pt[j].y) * (pt[i].y - pt[j].y);
      if (d > dist) { dist = d; p0 = i; p1 = j; }
    }
  }
  let v0 = pt[p1].y - pt[p0].y, v1 = pt[p0].x - pt[p1].x;
  let dTmp = Math.hypot(v0, v1);
  v0 /= dTmp;
  v1 /= dTmp;
  dTmp = 0;
  for (let i = 0; i < ship.num_points; i++) {
    for (let j = i + 1; j < ship.num_points; j++) {
      const width = Math.abs(v0 * (pt[i].x - pt[j].x) + v1 * (pt[i].y - pt[j].y));
      if (width > dTmp) dTmp = width;
    }
  }
  if (Math.trunc(dTmp) < 12) { if (verboseShapeParsing) warn('Ship shape is not big enough.'); return false; }
  // the special points must be inside the outline (drawn on a grid, the outside flood-filled)
  const grid = new Uint8Array(32 * 32);
  const get = (x: number, y: number) => (x < -15 || x > 15 || y < -15 || y > 15 ? 2 : grid[(x + 15) * 32 + (y + 15)]);
  const setv = (x: number, y: number, v: number) => { grid[(x + 15) * 32 + (y + 15)] = v; };
  const todo: [number, number][] = [];
  const add = (x: number, y: number) => { setv(x, y, 2); todo.push([x, y]); };
  for (let i = 0; i < ship.num_points; i++) {
    const j = i + 1 === ship.num_points ? 0 : i + 1;
    setv(pt[i].x, pt[i].y, 1);
    const dx = pt[j].x - pt[i].x, dy = pt[j].y - pt[i].y;
    if (ABS(dx) >= ABS(dy)) {
      if (dx > 0) for (let x = pt[i].x + 1; x < pt[j].x; x++) setv(x, pt[i].y + Math.trunc((dy * (x - pt[i].x)) / dx), 1);
      else for (let x = pt[j].x + 1; x < pt[i].x; x++) setv(x, pt[j].y + Math.trunc((dy * (x - pt[j].x)) / dx), 1);
    } else {
      if (dy > 0) for (let y = pt[i].y + 1; y < pt[j].y; y++) setv(pt[i].x + Math.trunc((dx * (y - pt[i].y)) / dy), y, 1);
      else for (let y = pt[j].y + 1; y < pt[i].y; y++) setv(pt[j].x + Math.trunc((dx * (y - pt[j].y)) / dy), y, 1);
    }
  }
  for (let y = -15; y <= 15; y++) {
    for (let x = -15; x <= 15; x += y === -15 || y === 15 ? 1 : 2 * 15) if (get(x, y) === 0) add(x, y);
  }
  for (let k = 0; k < todo.length; k++) {
    const [x, y] = todo[k];
    if (x < 15 && get(x + 1, y) === 0) add(x + 1, y);
    if (x > -15 && get(x - 1, y) === 0) add(x - 1, y);
    if (y < 15 && get(x, y + 1) === 0) add(x, y + 1);
    if (y > -15 && get(x, y - 1) === 0) add(x, y - 1);
  }
  const outside = (p: ipos_t) => get(p.x, p.y) === 2;
  let invalid = 0;
  if (outside(m_gun)) invalid++;
  for (let i = 0; i < ship.num_l_gun; i++) if (outside(l_gun[i])) invalid++;
  for (let i = 0; i < ship.num_r_gun; i++) if (outside(r_gun[i])) invalid++;
  for (let i = 0; i < ship.num_l_rgun; i++) if (outside(l_rgun[i])) invalid++;
  for (let i = 0; i < ship.num_r_rgun; i++) if (outside(r_rgun[i])) invalid++;
  for (let i = 0; i < ship.num_m_rack; i++) if (outside(m_rack[i])) invalid++;
  for (let i = 0; i < ship.num_l_light; i++) if (outside(l_light[i])) invalid++;
  for (let i = 0; i < ship.num_r_light; i++) if (outside(r_light[i])) invalid++;
  if (outside(engine)) invalid++;
  return invalid === 0;
}

let warnHook: (s: string) => void = () => { /* no console in the port */ };
export function setShapeWarn(f: (s: string) => void): void { warnHook = f; }
function warn(s: string): void { warnHook(s); }

function do_parse_shape(str: string | null): shipshape_t {
  if (!str) return Default_ship();
  const ship = emptyShip();
  if (shape2wire(str, ship) !== 0) return Default_ship();
  return ship;
}

export function Free_ship_shape(_ship: shipshape_t | null): void { /* garbage collected */ }

export function Parse_shape_str(str: string | null): shipshape_t {
  verboseShapeParsing = true;
  shapeLimits = true;
  return do_parse_shape(str);
}

export function Convert_shape_str(str: string | null): shipshape_t {
  verboseShapeParsing = debugShapeParsing;
  shapeLimits = debugShapeParsing;
  return do_parse_shape(str);
}

export function Validate_shape_str(str: string): boolean {
  verboseShapeParsing = true;
  shapeLimits = true;
  const ship = do_parse_shape(str);
  return ship !== Default_ship();
}

export const Ship_get_point_position = (ship: shipshape_t, i: number, dir: number): position_t => clpos2position(ship.pts[i][dir]);
export const Ship_get_engine_position = (ship: shipshape_t, dir: number): position_t => clpos2position(ship.engine[dir]);
export const Ship_get_m_gun_position = (ship: shipshape_t, dir: number): position_t => clpos2position(ship.m_gun[dir]);
export const Ship_get_l_light_position = (ship: shipshape_t, l: number, dir: number): position_t => clpos2position(ship.l_light[l][dir]);
export const Ship_get_r_light_position = (ship: shipshape_t, l: number, dir: number): position_t => clpos2position(ship.r_light[l][dir]);

/** Convert_ship_2_string: [buf, ext] */
export function Convert_ship_2_string(ship: shipshape_t, shape_version: number): [string, string] {
  let buf = '', ext = '';
  if (shape_version >= 0x3200) {
    buf = '(SH:';
    for (let i = 0; i < ship.num_orig_points && i < MAX_SHIP_PTS; i++) {
      const p = Ship_get_point_position(ship, i, 0);
      buf += sprintf(' %d,%d', Math.trunc(p.x), Math.trunc(p.y));
    }
    const engine = Ship_get_engine_position(ship, 0), m_gun = Ship_get_m_gun_position(ship, 0);
    buf += sprintf(')(EN: %d,%d)(MG: %d,%d)', Math.trunc(engine.x), Math.trunc(engine.y), Math.trunc(m_gun.x), Math.trunc(m_gun.y));
    const part = (tag: string, n: number, max: number, get: (i: number) => position_t) => {
      if (n <= 0) return;
      let tmp = `(${tag}:`;
      for (let i = 0; i < n && i < max; i++) {
        const p = get(i);
        tmp += sprintf(' %d,%d', Math.trunc(p.x), Math.trunc(p.y));
      }
      tmp += ')';
      if (buf.length + tmp.length < MSG_LEN) buf += tmp;
      else if (ext.length + tmp.length < MSG_LEN) ext += tmp;
    };
    part('LG', ship.num_l_gun, MAX_GUN_PTS, (i) => clpos2position(ship.l_gun[i][0]));
    part('RG', ship.num_r_gun, MAX_GUN_PTS, (i) => clpos2position(ship.r_gun[i][0]));
    part('LR', ship.num_l_rgun, MAX_GUN_PTS, (i) => clpos2position(ship.l_rgun[i][0]));
    part('RR', ship.num_r_rgun, MAX_GUN_PTS, (i) => clpos2position(ship.r_rgun[i][0]));
    part('LL', ship.num_l_light, MAX_LIGHT_PTS, (i) => clpos2position(ship.l_light[i][0]));
    part('RL', ship.num_r_light, MAX_LIGHT_PTS, (i) => clpos2position(ship.r_light[i][0]));
    part('MR', ship.num_m_rack, MAX_RACK_PTS, (i) => clpos2position(ship.m_rack[i][0]));
  }
  return [buf, ext];
}

export function Calculate_shield_radius(ship: shipshape_t): void {
  let max_radius = 0;
  for (let i = 0; i < ship.num_points; i++) {
    const p = Ship_get_point_position(ship, i, 0);
    const radius2 = Math.trunc(f32(f32(p.x * p.x) + f32(p.y * p.y)));
    if (radius2 > max_radius) max_radius = radius2;
  }
  max_radius = Math.trunc(2.0 * Math.sqrt(max_radius));
  ship.shield_radius = max_radius + 2 <= 34 ? 34 : max_radius + 2 - (max_radius & 1);
}
