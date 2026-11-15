// C-Dogs SDL 2.5.0, translated to TypeScript: the base of everything (src/cdogs/utils.h, defs.c, vector.c,
// color.c, algorithms.c and the parts of mathc the game uses).
// Copyright (C) 1995 Ronny Wester, (C) 2003 Jeremy Chin, (C) 2003-2007 Lucas Martin-King, (c) 2013-2026 Cong Xu;
// mathc (C) 2016 Felipe Ferreira da Silva (zlib; altered: translated). GPL-2.0-or-later / BSD-2-Clause
// (web/games/cdogs/LICENSE.md).
//
// The original computes in C `float` (mathc's mfloat_t) and sometimes in `double`. Every float result here goes
// through Math.fround at the same place the C code rounds to float, so the port runs the same numbers as the
// original (re/cdogs/NOTES.md, "Floating point").

export const f32 = Math.fround;

// ---------------------------------------------------------------------------------------------------------------
// glibc's rand()/srand() (random_r.c, TYPE_3: x**31 + x**3 + 1, 34 words of state, 310 values discarded)

const randState = new Int32Array(34);
let randF = 3;
let randR = 0;
export const RAND_MAX = 2147483647;

export function srand(seed: number): void {
  let word = seed | 0;
  if (word === 0) word = 1;
  const r = randState;
  const st = new Int32Array(31);
  st[0] = word;
  for (let i = 1; i < 31; i++) {
    // word = 16807 * hi ... (Park-Miller, as glibc's __srandom_r)
    const hi = Math.trunc(word / 127773);
    const lo = word % 127773;
    word = 16807 * lo - 2836 * hi;
    if (word < 0) word += 2147483647;
    st[i] = word;
  }
  for (let i = 0; i < 31; i++) r[i] = st[i];
  randF = 3;
  randR = 0;
  // fptr = &state[SEP_3] (3), rptr = &state[0]; then 310 calls of random_r
  for (let i = 0; i < 310; i++) randNext();
}

function randNext(): number {
  const r = randState;
  // *fptr += (uint32_t) *rptr; result = (*fptr >> 1) & 0x7fffffff
  const v = (r[randF] + r[randR]) | 0;
  r[randF] = v;
  const result = (v >>> 1) & 0x7fffffff;
  randF++;
  if (randF >= 31) {
    randF = 0;
    randR++;
  } else {
    randR++;
    if (randR >= 31) randR = 0;
  }
  return result;
}

/** for the oracle comparisons: how many rand() calls since srand */
export let randCalls = 0;
/** for debugging against the oracle's ORACLE_RANDLOG: called on every rand() */
export const randHook: { fn: (() => void) | null } = { fn: null };
export function rand(): number {
  randCalls++;
  if (randHook.fn) randHook.fn();
  return randNext();
}
export function resetRandCalls(): void { randCalls = 0; }

srand(1);

/** RAND_INT(_low, _high): (_low) == (_high) ? (_low) : (_low) + (rand() % ((_high) - (_low))) */
export function RAND_INT(low: number, high: number): number {
  return low === high ? low : low + cmod(rand(), high - low);
}
/** RAND_DOUBLE(_low, _high): ((_low) + ((double)rand() / RAND_MAX * ((_high) - (_low)))) */
export function RAND_DOUBLE(low: number, high: number): number {
  return low + (rand() / RAND_MAX) * (high - low);
}
/** RAND_FLOAT(_low, _high): (float)RAND_DOUBLE(_low, _high) */
export function RAND_FLOAT(low: number, high: number): number {
  return f32(RAND_DOUBLE(low, high));
}
export function RAND_BOOL(): boolean {
  return rand() > Math.trunc(RAND_MAX / 2);
}

/** C's % on ints (sign of the dividend) */
export function cmod(a: number, b: number): number {
  return (a % b) | 0;
}
/** C's / on ints */
export function idiv(a: number, b: number): number {
  return Math.trunc(a / b) | 0;
}

export const MAX = Math.max;
export const MIN = Math.min;
export function CLAMP(v: number, lo: number, hi: number): number {
  return Math.max(lo, Math.min(hi, v));
}
export function CLAMP_OPPOSITE(v: number, lo: number, hi: number): number {
  return v > hi ? lo : v < lo ? hi : v;
}
export function SIGN(x: number): number {
  return x !== 0 ? idiv(x, Math.abs(x)) : 1;
}
export function SQUARED(x: number): number {
  return x * x;
}
export function DIV_ROUND_UP(a: number, b: number): number {
  return idiv(a + (b - 1), b);
}

// mathc's float constants (MPI 3.1415926536f ...)
export const MPI = f32(3.1415926536);
export const MPI_2 = f32(1.5707963268);
export const MPI_4 = f32(0.7853981634);
export const FLT_EPSILON = 1.1920928955078125e-7;

export function sinf(x: number): number {
  return f32(Math.sin(x));
}
export function cosf(x: number): number {
  return f32(Math.cos(x));
}
export function atan2f(y: number, x: number): number {
  return f32(Math.atan2(y, x));
}
export function sqrtf(x: number): number {
  return f32(Math.sqrt(x));
}
export function fabsf(x: number): number {
  return Math.abs(x);
}
export function roundf(x: number): number {
  // round half away from zero
  return f32(x < 0 ? -Math.floor(-x + 0.5) : Math.floor(x + 0.5));
}
/** C's (int) cast of a float/double */
export function toInt(x: number): number {
  return Math.trunc(x) | 0;
}

export function Round(x: number): number {
  return Math.floor(x + 0.5);
}

export function nearly_equal(a: number, b: number, epsilon: number): boolean {
  return a === b || Math.abs(f32(a - b)) < epsilon;
}

// ---------------------------------------------------------------------------------------------------------------
// vectors: struct vec2 (float) and struct vec2i (int32)

export interface Vec2 { x: number; y: number }
export interface Vec2i { x: number; y: number }

export function svec2(x: number, y: number): Vec2 {
  return { x: f32(x), y: f32(y) };
}
export function svec2_zero(): Vec2 {
  return { x: 0, y: 0 };
}
export function svec2_one(): Vec2 {
  return { x: 1, y: 1 };
}
export function svec2_add(a: Vec2, b: Vec2): Vec2 {
  return { x: f32(a.x + b.x), y: f32(a.y + b.y) };
}
export function svec2_subtract(a: Vec2, b: Vec2): Vec2 {
  return { x: f32(a.x - b.x), y: f32(a.y - b.y) };
}
export function svec2_scale(a: Vec2, s: number): Vec2 {
  const sf = f32(s);
  return { x: f32(a.x * sf), y: f32(a.y * sf) };
}
export function svec2_multiply(a: Vec2, b: Vec2): Vec2 {
  return { x: f32(a.x * b.x), y: f32(a.y * b.y) };
}
export function svec2_divide(a: Vec2, b: Vec2): Vec2 {
  return { x: f32(a.x / b.x), y: f32(a.y / b.y) };
}
export function svec2_is_zero(a: Vec2): boolean {
  return nearly_equal(a.x, 0, FLT_EPSILON) && nearly_equal(a.y, 0, FLT_EPSILON);
}
export function svec2_is_equal(a: Vec2, b: Vec2): boolean {
  return nearly_equal(a.x, b.x, FLT_EPSILON) && nearly_equal(a.y, b.y, FLT_EPSILON);
}
export function svec2_is_nearly_equal(a: Vec2, b: Vec2, epsilon: number): boolean {
  const e = f32(epsilon);
  return nearly_equal(a.x, b.x, e) && nearly_equal(a.y, b.y, e);
}
export function svec2_normalize(a: Vec2): Vec2 {
  let length = sqrtf(f32(f32(a.x * a.x) + f32(a.y * a.y)));
  if (!nearly_equal(length, 0, FLT_EPSILON)) {
    length = f32(1 / length);
    return { x: f32(a.x * length), y: f32(a.y * length) };
  }
  return { x: 0, y: 0 };
}
export function svec2_rotate(a: Vec2, angle: number): Vec2 {
  const cs = cosf(angle);
  const sn = sinf(angle);
  return {
    x: f32(f32(a.x * cs) - f32(a.y * sn)),
    y: f32(f32(a.x * sn) + f32(a.y * cs)),
  };
}
export function svec2_angle(a: Vec2): number {
  return atan2f(a.y, a.x);
}
export function svec2_length(a: Vec2): number {
  return sqrtf(f32(f32(a.x * a.x) + f32(a.y * a.y)));
}
export function svec2_length_squared(a: Vec2): number {
  return f32(f32(a.x * a.x) + f32(a.y * a.y));
}
export function svec2_distance(a: Vec2, b: Vec2): number {
  return sqrtf(svec2_distance_squared(a, b));
}
export function svec2_distance_squared(a: Vec2, b: Vec2): number {
  const dx = f32(a.x - b.x);
  const dy = f32(a.y - b.y);
  return f32(f32(dx * dx) + f32(dy * dy));
}
export function svec2_clamp(a: Vec2, lo: Vec2, hi: Vec2): Vec2 {
  let x = a.x;
  let y = a.y;
  if (x < lo.x) x = lo.x;
  if (x > hi.x) x = hi.x;
  if (y < lo.y) y = lo.y;
  if (y > hi.y) y = hi.y;
  return { x, y };
}
export function svec2_assign_vec2i(a: Vec2i): Vec2 {
  return { x: f32(a.x), y: f32(a.y) };
}

export function svec2i(x: number, y: number): Vec2i {
  return { x: x | 0, y: y | 0 };
}
export function svec2i_zero(): Vec2i {
  return { x: 0, y: 0 };
}
export function svec2i_one(): Vec2i {
  return { x: 1, y: 1 };
}
export function svec2i_add(a: Vec2i, b: Vec2i): Vec2i {
  return { x: (a.x + b.x) | 0, y: (a.y + b.y) | 0 };
}
export function svec2i_subtract(a: Vec2i, b: Vec2i): Vec2i {
  return { x: (a.x - b.x) | 0, y: (a.y - b.y) | 0 };
}
export function svec2i_multiply(a: Vec2i, b: Vec2i): Vec2i {
  return { x: Math.imul(a.x, b.x), y: Math.imul(a.y, b.y) };
}
export function svec2i_divide(a: Vec2i, b: Vec2i): Vec2i {
  return { x: idiv(a.x, b.x), y: idiv(a.y, b.y) };
}
/** vec2i_scale: (mint_t)MROUND(a[0] * scalar) */
export function svec2i_scale(a: Vec2i, s: number): Vec2i {
  const sf = f32(s);
  return { x: toInt(roundf(f32(a.x * sf))), y: toInt(roundf(f32(a.y * sf))) };
}
export function svec2i_scale_divide(v: Vec2i, scale: number): Vec2i {
  return { x: idiv(v.x, scale), y: idiv(v.y, scale) };
}
export function svec2i_is_zero(a: Vec2i): boolean {
  return a.x === 0 && a.y === 0;
}
export function svec2i_is_equal(a: Vec2i, b: Vec2i): boolean {
  return a.x === b.x && a.y === b.y;
}
export function svec2i_max(a: Vec2i, b: Vec2i): Vec2i {
  return { x: Math.max(a.x, b.x), y: Math.max(a.y, b.y) };
}
export function svec2i_min(a: Vec2i, b: Vec2i): Vec2i {
  return { x: Math.min(a.x, b.x), y: Math.min(a.y, b.y) };
}
export function svec2i_clamp(a: Vec2i, lo: Vec2i, hi: Vec2i): Vec2i {
  let x = a.x;
  let y = a.y;
  if (x < lo.x) x = lo.x;
  if (x > hi.x) x = hi.x;
  if (y < lo.y) y = lo.y;
  if (y > hi.y) y = hi.y;
  return { x, y };
}
export function svec2i_distance_squared(a: Vec2i, b: Vec2i): number {
  const dx = a.x - b.x;
  const dy = a.y - b.y;
  return (dx * dx + dy * dy) | 0;
}
/** vec2i_assign_vec2: (mint_t)a[0] */
export function svec2i_assign_vec2(a: Vec2): Vec2i {
  return { x: toInt(a.x), y: toInt(a.y) };
}
export function svec2i_floor(a: Vec2): Vec2i {
  return { x: Math.floor(a.x) | 0, y: Math.floor(a.y) | 0 };
}

// tile size (tile_class.h)
export const TILE_WIDTH = 16;
export const TILE_HEIGHT = 12;
export function TILE_SIZE(): Vec2i {
  return { x: TILE_WIDTH, y: TILE_HEIGHT };
}

// vector.c
export function Vec2iToTile(v: Vec2i): Vec2i {
  return svec2i(idiv(v.x, TILE_WIDTH), idiv(v.y, TILE_HEIGHT));
}
export function Vec2iCenterOfTile(v: Vec2i): Vec2i {
  return svec2i(v.x * TILE_WIDTH + TILE_WIDTH / 2, v.y * TILE_HEIGHT + TILE_HEIGHT / 2);
}
export function Vec2ToTile(v: Vec2): Vec2i {
  return svec2i(toInt(f32(v.x / TILE_WIDTH)), toInt(f32(v.y / TILE_HEIGHT)));
}
export function Vec2CenterOfTile(v: Vec2i): Vec2 {
  return svec2_assign_vec2i(Vec2iCenterOfTile(v));
}

export interface Rect2i { Pos: Vec2i; Size: Vec2i }
export function Rect2iNew(pos: Vec2i, size: Vec2i): Rect2i {
  return { Pos: pos, Size: size };
}
export function Rect2iZero(): Rect2i {
  return Rect2iNew(svec2i_zero(), svec2i_zero());
}
export function Rect2iIsZero(r: Rect2i): boolean {
  return svec2i_is_zero(r.Pos) && svec2i_is_zero(r.Size);
}
export function Rect2iIsAtEdge(r: Rect2i, v: Vec2i): boolean {
  return v.y === r.Pos.y || v.y === r.Pos.y + r.Size.y - 1 || v.x === r.Pos.x || v.x === r.Pos.x + r.Size.x - 1;
}
export function Rect2iIsInside(r: Rect2i, v: Vec2i): boolean {
  return !(v.y < r.Pos.y || v.y > r.Pos.y + r.Size.y - 1 || v.x < r.Pos.x || v.x > r.Pos.x + r.Size.x - 1);
}
export function Rect2iOverlap(r1: Rect2i, r2: Rect2i): boolean {
  return r1.Pos.x < r2.Pos.x + r2.Size.x && r1.Pos.x + r1.Size.x > r2.Pos.x &&
    r1.Pos.y < r2.Pos.y + r2.Size.y && r1.Pos.y + r1.Size.y > r2.Pos.y;
}
export function Rect2iCenter(r: Rect2i): Vec2i {
  return svec2i_add(r.Pos, svec2i_scale_divide(r.Size, 2));
}
/** RECT_FOREACH: y outer, x inner; i = x + y * Size.x (as the macro computes it) */
export function rectForEach(r: Rect2i, fn: (v: Vec2i, i: number) => boolean | void): void {
  for (let y = r.Pos.y; y < r.Pos.y + r.Size.y; y++) {
    for (let x = r.Pos.x; x < r.Pos.x + r.Size.x; x++) {
      if (fn({ x, y }, x + y * r.Size.x) === true) return;
    }
  }
}

export function CalcClosestPointOnLineSegmentToPoint(l1: Vec2, l2: Vec2, p: Vec2): Vec2 {
  const lineDistanceSquared = svec2_distance_squared(l1, l2);
  if (lineDistanceSquared === 0) return l1;
  const numerator = f32(f32(f32(p.x - l1.x) * f32(l2.x - l1.x)) + f32(f32(p.y - l1.y) * f32(l2.y - l1.y)));
  const t = f32(CLAMP(f32(numerator / lineDistanceSquared), 0, 1));
  return svec2(f32(l1.x + f32(t * f32(l2.x - l1.x))), f32(l1.y + f32(t * f32(l2.y - l1.y))));
}

// ---------------------------------------------------------------------------------------------------------------
// defs.h / defs.c

export const BODY_UNARMED = 0;
export const BODY_ARMED = 1;
export const MAX_BARRELS = 2;

export const CMD_LEFT = 1;
export const CMD_RIGHT = 2;
export const CMD_UP = 4;
export const CMD_DOWN = 8;
export const CMD_BUTTON1 = 16;
export const CMD_BUTTON2 = 32;
export const CMD_MAP = 64;
export const CMD_ESC = 128;
export const CMD_GRENADE = 256;
export const CMD_DIRECTIONS = CMD_LEFT | CMD_RIGHT | CMD_UP | CMD_DOWN;

export const Left = (x: number): boolean => (x & CMD_LEFT) !== 0;
export const Right = (x: number): boolean => (x & CMD_RIGHT) !== 0;
export const Up = (x: number): boolean => (x & CMD_UP) !== 0;
export const Down = (x: number): boolean => (x & CMD_DOWN) !== 0;
export const Button1 = (x: number): boolean => (x & CMD_BUTTON1) !== 0;
export const Button2 = (x: number): boolean => (x & CMD_BUTTON2) !== 0;
export const AnyButton = (x: number): boolean => (x & (CMD_BUTTON1 | CMD_BUTTON2 | CMD_GRENADE)) !== 0;
export const CMD_HAS_DIRECTION = (x: number): boolean => (x & CMD_DIRECTIONS) !== 0;

export function CmdGetReverse(cmd: number): number {
  let newCmd = cmd & ~CMD_DIRECTIONS;
  if (Left(cmd)) newCmd |= CMD_RIGHT;
  if (Right(cmd)) newCmd |= CMD_LEFT;
  if (Up(cmd)) newCmd |= CMD_DOWN;
  if (Down(cmd)) newCmd |= CMD_UP;
  return newCmd;
}

export const DIRECTION_UP = 0;
export const DIRECTION_UPRIGHT = 1;
export const DIRECTION_RIGHT = 2;
export const DIRECTION_DOWNRIGHT = 3;
export const DIRECTION_DOWN = 4;
export const DIRECTION_DOWNLEFT = 5;
export const DIRECTION_LEFT = 6;
export const DIRECTION_UPLEFT = 7;
export const DIRECTION_COUNT = 8;

export const SPECIAL_NONE = 0;
export const SPECIAL_FLAME = 1;
export const SPECIAL_POISON = 2;
export const SPECIAL_PETRIFY = 3;
export const SPECIAL_CONFUSE = 4;
export function StrSpecialDamage(s: string): number {
  switch (s) {
    case 'Flame': return SPECIAL_FLAME;
    case 'Poison': return SPECIAL_POISON;
    case 'Petrify': return SPECIAL_PETRIFY;
    case 'Confuse': return SPECIAL_CONFUSE;
    default: return SPECIAL_NONE;
  }
}

export const Z_FACTOR = 16;

export const cmd2dir = [
  0, DIRECTION_LEFT, DIRECTION_RIGHT, 0, DIRECTION_UP, DIRECTION_UPLEFT, DIRECTION_UPRIGHT, 0,
  DIRECTION_DOWN, DIRECTION_DOWNLEFT, DIRECTION_DOWNRIGHT, 0, 0, 0, 0, 0,
];
export const dir2cmd = [
  CMD_UP, CMD_UP + CMD_RIGHT, CMD_RIGHT, CMD_DOWN + CMD_RIGHT, CMD_DOWN, CMD_DOWN + CMD_LEFT, CMD_LEFT,
  CMD_UP + CMD_LEFT,
];
export const dir2radians = [
  0, f32(MPI * f32(0.25)), f32(MPI * f32(0.5)), f32(MPI * f32(0.75)), MPI, f32(MPI * f32(1.25)),
  f32(MPI * f32(1.5)), f32(MPI * f32(1.75)),
];
export const CmdToDirection = (c: number): number => cmd2dir[c & 15];
export const DirectionToCmd = (d: number): number => dir2cmd[d & 7];

export function Vec2FromRadiansScaled(radians: number): Vec2 {
  // svec2(sinf(radians), -cosf(radians) * TILE_HEIGHT / TILE_WIDTH)
  return svec2(sinf(radians), f32(f32(f32(-cosf(radians)) * TILE_HEIGHT) / TILE_WIDTH));
}
export function Vec2FromRadians(radians: number): Vec2 {
  const v = svec2_rotate(svec2(0, -1), radians);
  v.y = f32(v.y * f32(TILE_HEIGHT / TILE_WIDTH));
  return v;
}
export function Vec2iFromDirection(d: number): Vec2i {
  switch (d) {
    case DIRECTION_UP: return svec2i(0, -1);
    case DIRECTION_UPRIGHT: return svec2i(1, -1);
    case DIRECTION_RIGHT: return svec2i(1, 0);
    case DIRECTION_DOWNRIGHT: return svec2i(1, 1);
    case DIRECTION_DOWN: return svec2i(0, 1);
    case DIRECTION_DOWNLEFT: return svec2i(-1, 1);
    case DIRECTION_LEFT: return svec2i(-1, 0);
    case DIRECTION_UPLEFT: return svec2i(-1, -1);
    default: return svec2i_zero();
  }
}
/** RadiansToDirection(const double r): the arithmetic is in double, MPI a float constant */
export function RadiansToDirection(r: number): number {
  let radians = r;
  while (radians < 0) radians += 2 * MPI;
  while (radians >= 2 * MPI) radians -= 2 * MPI;
  let d = Math.floor((radians + MPI / 8.0) / (MPI / 4.0)) | 0;
  if (d < DIRECTION_UP) d += DIRECTION_COUNT;
  if (d >= DIRECTION_COUNT) d -= DIRECTION_COUNT;
  return d;
}
export function DirectionOpposite(d: number): number {
  return (d + 4) % DIRECTION_COUNT;
}
export function DirectionMirrorX(d: number): number {
  return (DIRECTION_COUNT - d) % DIRECTION_COUNT;
}
export function DirectionRotate(d: number, dClockwise: number): number {
  let di = d + dClockwise;
  if (di < DIRECTION_UP) di += DIRECTION_COUNT;
  if (di >= DIRECTION_COUNT) di -= DIRECTION_COUNT;
  return di;
}

export const EPSILON_POS = f32(1.0 / 256.0 / 4.0);

// ---------------------------------------------------------------------------------------------------------------
// color.c

export interface Color { r: number; g: number; b: number; a: number }
export const color = (r: number, g: number, b: number, a = 255): Color => ({ r, g, b, a });
export const colorWhite = color(255, 255, 255);
export const colorRed = color(255, 0, 0);
export const colorGreen = color(0, 255, 0);
export const colorBlue = color(0, 0, 255);
export const colorPoison = color(64, 192, 64);
export const colorBlack = color(0, 0, 0);
export const colorDarker = color(192, 192, 192);
export const colorPurple = color(192, 0, 192);
export const colorGray = color(128, 128, 128);
export const colorDarkGray = color(64, 64, 64);
export const colorYellow = color(255, 255, 128);
export const colorMagenta = color(255, 0, 255);
export const colorCyan = color(0, 255, 255);
export const colorFog = color(96, 96, 96);
export const colorOrange = color(255, 128, 0);
export const colorTransparent = color(0, 0, 0, 0);
export const colorMaroon = color(0x84, 0, 0);
export const colorLonestar = color(0x70, 0, 0);
export const colorRusticRed = color(0x48, 0, 0);
export const colorOfficeGreen = color(0, 0x84, 0);
export const colorPakistanGreen = color(0, 0x70, 0);
export const colorDarkFern = color(0, 0x48, 0);
export const colorNavyBlue = color(0, 0, 0x84);
export const colorArapawa = color(0, 0, 0x70);
export const colorStratos = color(0, 0, 0x48);
export const colorPatriarch = color(0x84, 0, 0x84);
export const colorPompadour = color(0x70, 0, 0x70);
export const colorLoulou = color(0x48, 0, 0x48);
export const colorBattleshipGrey = color(0x84, 0x84, 0x84);
export const colorDoveGray = color(0x70, 0x70, 0x70);
export const colorGravel = color(0x48, 0x48, 0x48);
export const colorComet = color(0x5c, 0x5c, 0x84);
export const colorFiord = color(0x48, 0x48, 0x70);
export const colorTuna = color(0x34, 0x34, 0x48);
export const colorHacienda = color(0x94, 0x80, 0x2c);
export const colorKumera = color(0x84, 0x70, 0x24);
export const colorHimalaya = color(0x74, 0x60, 0x1c);
export const colorChocolate = color(0x84, 0x44, 0);
export const colorNutmeg = color(0x70, 0x38, 0);
export const colorBracken = color(0x48, 0x24, 0);
export const colorTeal = color(0, 0x84, 0x84);
export const colorSkobeloff = color(0, 0x70, 0x70);
export const colorDeepJungleGreen = color(0, 0x48, 0x48);
export const colorSkin = color(0xf4, 0x94, 0x4c);
export const colorDarkSkin = color(0x93, 0x5d, 0x37);
export const colorAsianSkin = color(0xff, 0xcc, 0x99);
export const colorLightBlue = color(80, 80, 160);
export const colorSelectedBG = color(0, 255, 255, 64);

export function ColorMult(c: Color, m: Color): Color {
  return {
    r: idiv(c.r * m.r, 255) & 255, g: idiv(c.g * m.g, 255) & 255,
    b: idiv(c.b * m.b, 255) & 255, a: idiv(c.a * m.a, 255) & 255,
  };
}
export function ColorAlphaBlend(a: Color, b: Color): Color {
  return {
    r: idiv(a.r * (255 - b.a) + b.r * b.a, 255) & 255,
    g: idiv(a.g * (255 - b.a) + b.g * b.a, 255) & 255,
    b: idiv(a.b * (255 - b.a) + b.b * b.a, 255) & 255,
    a: 255,
  };
}

export interface HSV { h: number; s: number; v: number }
export const tintNone: HSV = { h: -1.0, s: 1.0, v: 1.0 };
export const tintRed: HSV = { h: 0.0, s: 1.0, v: 1.0 };
export const tintYellow: HSV = { h: 60.0, s: 1.0, v: 1.0 };
export const tintGreen: HSV = { h: 120.0, s: 1.0, v: 1.0 };
export const tintCyan: HSV = { h: 180.0, s: 1.0, v: 1.0 };
export const tintPoison: HSV = { h: 120.0, s: 0.33, v: 2.0 };
export const tintGray: HSV = { h: -1.0, s: 0.0, v: 1.0 };
export const tintPurple: HSV = { h: 300, s: 1.0, v: 1.0 };
export const tintDarker: HSV = { h: -1.0, s: 1.0, v: 0.75 };

const u8clamp = (x: number): number => toInt(CLAMP(x, 0, 255)) & 255;
export function ColorTint(c: Color, hsv: HSV): Color {
  const vAvg = idiv(c.r + c.g + c.b, 3);
  const vComponent = u8clamp(hsv.v * vAvg);
  const out: Color = { r: 0, g: 0, b: 0, a: c.a };
  if (hsv.s <= 0.0) {
    out.r = vComponent;
    out.g = vComponent;
    out.b = vComponent;
  } else if (hsv.h >= 0) {
    let hh = hsv.h;
    if (hh >= 360.0) hh = 0.0;
    hh /= 60.0;
    const i = Math.trunc(hh);
    const ff = hh - i;
    const p = u8clamp(vComponent * (1.0 - hsv.s));
    const q = u8clamp(vComponent * (1.0 - hsv.s * ff));
    const t = u8clamp(vComponent * (1.0 - hsv.s * (1.0 - ff)));
    switch (i) {
      case 0: out.r = vComponent; out.g = t; out.b = p; break;
      case 1: out.r = q; out.g = vComponent; out.b = p; break;
      case 2: out.r = p; out.g = vComponent; out.b = t; break;
      case 3: out.r = p; out.g = q; out.b = vComponent; break;
      case 4: out.r = t; out.g = p; out.b = vComponent; break;
      default: out.r = vComponent; out.g = p; out.b = q; break;
    }
  } else {
    out.r = u8clamp(hsv.v * (vAvg * (1.0 - hsv.s) + hsv.s * c.r));
    out.g = u8clamp(hsv.v * (vAvg * (1.0 - hsv.s) + hsv.s * c.g));
    out.b = u8clamp(hsv.v * (vAvg * (1.0 - hsv.s) + hsv.s * c.b));
  }
  return out;
}
export function ColorEquals(a: Color, b: Color): boolean {
  return a.r === b.r && a.g === b.g && a.b === b.b && a.a === b.a;
}
export function HSVEquals(a: HSV, b: HSV): boolean {
  const e = 0.000001;
  return Math.abs(a.h - b.h) < e && Math.abs(a.s - b.s) < e && Math.abs(a.v - b.v) < e;
}
export function StrColor(s: string | null | undefined): Color {
  if (s == null) return { ...colorBlack };
  if (s.length !== 6 && s.length !== 8) return { ...colorBlack };
  // strtoll(s, NULL, 16): stops at the first non-hex character
  const m = /^[0-9a-fA-F]*/.exec(s)![0];
  let hex = m.length ? BigInt('0x' + m) : 0n;
  const c: Color = { r: 0, g: 0, b: 0, a: 255 };
  if (s.length === 8) {
    c.a = Number(hex & 255n);
    hex >>= 8n;
  }
  c.r = Number((hex >> 16n) & 255n);
  c.g = Number((hex >> 8n) & 255n);
  c.b = Number(hex & 255n);
  return c;
}
export function ColorStr(c: Color): string {
  const h = (n: number): string => n.toString(16).padStart(2, '0');
  return h(c.r) + h(c.g) + h(c.b) + h(c.a);
}

// ---------------------------------------------------------------------------------------------------------------
// algorithms.c

export type IsBlockedFn = (v: Vec2i) => boolean;

function BresenhamLine(from: Vec2i, to: Vec2i, check: boolean, isBlocked: IsBlockedFn | null,
  onPoint: ((v: Vec2i) => void) | null): boolean {
  const d = svec2i(Math.abs(to.x - from.x), Math.abs(to.y - from.y));
  const s = svec2i(from.x < to.x ? 1 : -1, from.y < to.y ? 1 : -1);
  let err = d.x - d.y;
  const v = { x: from.x, y: from.y };
  for (;;) {
    const e2 = 2 * err;
    if (v.x === to.x && v.y === to.y) break;
    if (check) {
      if (isBlocked!({ x: v.x, y: v.y })) return false;
    } else {
      onPoint!({ x: v.x, y: v.y });
    }
    if (e2 > -d.y) {
      err -= d.y;
      v.x += s.x;
    }
    if (v.x === to.x && v.y === to.y) break;
    if (e2 < d.x) {
      err += d.x;
      v.y += s.y;
    }
  }
  if (check) return !isBlocked!({ x: v.x, y: v.y });
  onPoint!({ x: v.x, y: v.y });
  return true;
}

function JMRaytrace(x0: number, y0: number, x1: number, y1: number, check: boolean,
  isBlocked: IsBlockedFn | null, onPoint: ((v: Vec2i) => void) | null): boolean {
  let dx = Math.abs(x1 - x0);
  let dy = Math.abs(y1 - y0);
  let x = x0;
  let y = y0;
  let n = 1 + dx + dy;
  const xInc = x1 > x0 ? 1 : -1;
  const yInc = y1 > y0 ? 1 : -1;
  let error = dx - dy;
  dx *= 2;
  dy *= 2;
  for (; n > 0; --n) {
    const v = { x, y };
    if (check) {
      if (isBlocked!(v)) return false;
    } else {
      onPoint!(v);
    }
    if (error > 0) {
      x += xInc;
      error -= dy;
    } else {
      y += yInc;
      error += dx;
    }
  }
  return true;
}

export function HasClearLineBresenham(from: Vec2i, to: Vec2i, isBlocked: IsBlockedFn): boolean {
  return BresenhamLine(from, to, true, isBlocked, null);
}
export function HasClearLineJMRaytrace(from: Vec2i, to: Vec2i, isBlocked: IsBlockedFn): boolean {
  return JMRaytrace(from.x, from.y, to.x, to.y, true, isBlocked, null);
}
export function BresenhamLineDraw(from: Vec2i, to: Vec2i, draw: (v: Vec2i) => void): void {
  BresenhamLine(from, to, false, null, draw);
}
export function JMRaytraceLineDraw(from: Vec2i, to: Vec2i, draw: (v: Vec2i) => void): void {
  JMRaytrace(from.x, from.y, to.x, to.y, false, null, draw);
}

/** CFloodFill: BFS queue, a seen set of "x,y" */
export function CFloodFill(v: Vec2i, fill: (v: Vec2i) => void, isSame: (v: Vec2i) => boolean): boolean {
  let result = false;
  const q: Vec2i[] = [];
  const seen = new Set<string>();
  const tryAdd = (w: Vec2i): boolean => {
    const k = `${w.x},${w.y}`;
    if (isSame(w) && !seen.has(k)) {
      q.push(w);
      seen.add(k);
      return true;
    }
    return false;
  };
  if (tryAdd(v)) result = true;
  let head = 0;
  while (head < q.length) {
    const qv = q[head];
    fill(qv);
    tryAdd(svec2i(qv.x - 1, qv.y));
    tryAdd(svec2i(qv.x + 1, qv.y));
    tryAdd(svec2i(qv.x, qv.y - 1));
    tryAdd(svec2i(qv.x, qv.y + 1));
    head++;
  }
  return result;
}

/** CArrayShuffle: Fisher-Yates from the front, j = rand() % (i + 1) */
export function CArrayShuffle<T>(a: T[]): void {
  for (let i = 0; i < a.length; i++) {
    const j = rand() % (i + 1);
    const t = a[i];
    a[i] = a[j];
    a[j] = t;
  }
}

/** utils.c CamelToTitle */
export function CamelToTitle(src: string): string {
  const isUpper = (c: string | undefined): boolean => c !== undefined && c >= 'A' && c <= 'Z';
  let out = '';
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (isUpper(c) && i !== 0 && (!isUpper(src[i - 1]) || (i + 1 < src.length && !isUpper(src[i + 1])))) out += ' ';
    out += c;
  }
  return out;
}
export function PercentStr(p: number): string {
  return `${p}%`;
}
export function Div8Str(i: number): string {
  return `${idiv(i, 8)}`;
}
export function IntStr(i: number): string {
  return `${i}`;
}
